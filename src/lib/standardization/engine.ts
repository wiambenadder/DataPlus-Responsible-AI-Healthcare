// src/lib/standardization/engine.ts
//
// Orchestration. Turns raw workbook bytes into a fully StandardizedFile and an
// audit log, applying every ground rule along the way. Pure with respect to I/O:
// it takes bytes in and returns data out, so it runs identically in the browser,
// in a Server Action, or in a test.
//
// CHANGED (project-status reconciliation):
//   - carry `goal` from each parsed row into the ProjectStatusRow (drives the
//     goal banners in the exported Project Status tab);
//   - strip the "Name of Organization:" / "Project Manager:" label prefixes from
//     the anchor cells so orgName / projectManager hold just the value.

import { readWorkbook, extractIndicatorRows, extractProjectStatusRows, readAnchorCell } from "./parse";
import { matchSheetRole, matchIndicator } from "./catalog";
import { cleanNumber, cleanQualitative, toIsoDate } from "./normalize";
import { schema } from "./schema";
import { inferCompany, type WorkbookSource } from "./source";
import type {
  StandardizedFile,
  StandardizedIndicator,
  ProjectStatusRow,
  FileLog,
  SheetRole,
  ReportingPeriod,
  RawCell,
  RunResult,
  QualitativeField,
} from "./types";

function detectPeriods(allText: string): ReportingPeriod[] {
  const found = new Set<ReportingPeriod>();
  const lower = allText.toLowerCase();
  for (const period of Object.keys(schema.reporting_periods) as ReportingPeriod[]) {
    const kws = schema.reporting_periods[period].header_keywords ?? [];
    if (kws.some((k) => lower.includes(k.toLowerCase()))) found.add(period);
  }
  return [...found];
}

function classifyColumns(role: SheetRole) {
  const cfg = schema.sheet_roles[role];
  return {
    quant: new Set(cfg.quantitative_columns),
    qual: new Set(cfg.qualitative_columns),
    date: new Set(cfg.date_columns),
  };
}

/** Process a single workbook into a StandardizedFile. Never throws on dirty data. */
export function processSource(source: WorkbookSource): StandardizedFile {
  const company = source.company ?? inferCompany(source.name);
  const log: FileLog = {
    company,
    sourceName: source.name,
    processedAt: new Date().toISOString(),
    dates: [],
    attributes: [],
    sheetsMatched: [],
    matchedIndicators: 0,
    unmatchedIndicators: [],
    renamedColumns: [],
    periodsDetected: [],
    warnings: [],
  };

  const sheets = readWorkbook(source.bytes);

  // Assign each canonical role to its best-matching sheet (highest score wins).
  const roleToSheet = new Map<SheetRole, { name: string; score: number; grid: RawCell[][] }>();
  for (const s of sheets) {
    const m = matchSheetRole(s.name);
    if (!m) continue;
    const existing = roleToSheet.get(m.role);
    if (!existing || m.score > existing.score) {
      roleToSheet.set(m.role, { name: s.name, score: m.score, grid: s.grid });
    }
  }
  for (const [role, info] of roleToSheet) {
    log.sheetsMatched.push({ found: info.name, role, score: info.score });
  }

  for (const required of ["project_status", "outputs", "outcomes"] as SheetRole[]) {
    if (!roleToSheet.has(required)) {
      log.warnings.push(`No sheet matched the "${required}" role.`);
    }
  }

  // ----- Project status -----
  const projectStatus: ProjectStatusRow[] = [];
  let orgName: string | null = null;
  let projectManager: string | null = null;
  const psInfo = roleToSheet.get("project_status");
  if (psInfo) {
    const cfg = schema.sheet_roles.project_status;
    orgName = stripAnchorLabel(readAnchorCell(psInfo.grid, cfg.org_name_cell), "Name of Organization");
    projectManager = stripAnchorLabel(readAnchorCell(psInfo.grid, cfg.pm_name_cell), "Project Manager");
    for (const row of extractProjectStatusRows(psInfo.grid)) {
      projectStatus.push({
        goal: row.goal,
        objective: cleanQualitative(row.values["objective"]),
        activities: cleanQualitative(row.values["activities"]),
        deadline: cleanQualitative(row.values["deadline"]),
        status_6m: cleanQualitative(row.values["status_6m"]),
        status_12m: cleanQualitative(row.values["status_12m"]),
        delay_reason: cleanQualitative(row.values["delay_reason"]),
        delay_plan: cleanQualitative(row.values["delay_plan"]),
        delay_est_date: toIsoDate(row.values["delay_est_date"]),
        notes: cleanQualitative(row.values["notes"]),
      });
    }
  }

  // ----- Indicator sheets (outputs, outcomes) -----
  const indicators: StandardizedIndicator[] = [];
  for (const role of ["outputs", "outcomes"] as const) {
    const info = roleToSheet.get(role);
    if (!info) continue;
    const { quant, qual, date } = classifyColumns(role);

    for (const raw of extractIndicatorRows(info.grid, role)) {
      const match = matchIndicator(raw.indicatorText, role);
      if (match.matched) {
        log.matchedIndicators += 1;
      } else {
        log.unmatchedIndicators.push({
          sheet: role,
          raw: raw.indicatorText,
          bestScore: match.score,
        });
      }

      const quantitative: StandardizedIndicator["quantitative"] = {};
      const qualitative: StandardizedIndicator["qualitative"] = {};
      const dates: StandardizedIndicator["dates"] = {};
      const attributes: StandardizedIndicator["attributes"] = {};

      for (const [colName, value] of Object.entries(raw.values)) {
        if (colName === "indicator") continue;
        if (quant.has(colName)) {
          quantitative[colName] = cleanNumber(value);
        } else if (date.has(colName)) {
          dates[colName] = toIsoDate(value);
        } else if (qual.has(colName)) {
          const q = cleanQualitative(value);
          if (q) qualitative[colName] = q;
        } else {
          attributes[colName] = value; // e.g. conducts_activity, strategy
        }
      }

      indicators.push({ sheet: role, indicator: match, quantitative, qualitative, dates, attributes });
    }
  }

  // ----- Period detection (scan headers of matched sheets) -----
  const headerText = [...roleToSheet.values()]
    .map((info) => (info.grid[0] ?? []).map((c) => (c == null ? "" : String(c))).join(" "))
    .join(" ");
  log.periodsDetected = detectPeriods(headerText);

  return {
    company,
    sourceName: source.name,
    periodsDetected: log.periodsDetected,
    orgName,
    projectManager,
    projectStatus,
    indicators,
    log,
  };
}

function textOrNull(v: RawCell): string | null {
  if (v === null || v === undefined) return null;
  const t = String(v).trim();
  return t === "" ? null : t;
}

/** Read an anchor cell and strip a leading "Label:" prefix, e.g. "Name of Organization: Foo" -> "Foo". */
function stripAnchorLabel(v: RawCell, label: string): string | null {
  const t = textOrNull(v);
  if (!t) return null;
  const re = new RegExp("^\\s*" + label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*:?\\s*", "i");
  const out = t.replace(re, "").trim();
  return out === "" ? null : out;
}

/**
 * Process many sources and flag any expected company that did not submit a file.
 * RULE: a missing grantee is reported (and given an empty column downstream),
 * never silently skipped.
 */
export function processAll(
  sources: WorkbookSource[],
  expectedCompanies?: string[],
): RunResult {
  const files = sources.map(processSource);
  const present = new Set(files.map((f) => f.company.toLowerCase().trim()));
  const missingCompanies = (expectedCompanies ?? [])
    .map((c) => c.trim())
    .filter((c) => c && !present.has(c.toLowerCase()));

  return { runAt: new Date().toISOString(), files, missingCompanies };
}

export type { QualitativeField };
