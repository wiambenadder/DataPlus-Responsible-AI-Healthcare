// lib/standardization/engine.ts
// ---------------------------------------------------------------------------
// THE TRANSFORM. Takes a parsed workbook (rows as arrays of cells) and turns
// every grantee's data into flat StandardizedRecord[]. It is DETERMINISTIC:
// the same file always produces the same output, and every value can be
// traced back to a sheet + cell. No AI in the loop here (Bot 1 = lowest risk).
//
// What it handles, learned from the real GHIG9 workbook:
//   * Period blocks inside one sheet (a "6-Month Data" / "12-Month Data"
//     marker in column A applies to the rows beneath it).
//   * The grantee column being col A (Project Status) OR col B (Outputs).
//   * Aggregate rows ("Total", "Number reporting", "percent", numerator,
//     denominator, "Portfolio Overview") — these are SKIPPED and recomputed
//     later, so the funder totals are always reproducible.
//   * Blank vs 0 — a blank cell means "not applicable", not zero.
//   * The outcome pattern: a "Percent of…" column followed by two unnamed
//     spacer columns holding numerator and denominator.
//   * Columns it can't map are reported as `unmapped`, never dropped silently.
// ---------------------------------------------------------------------------

import { matchIndicator } from "./catalog";
import { normalizeHeader, isBlank, toNumber, toBoolean } from "./normalize";
import type {
  ReportingPeriod,
  StandardizedRecord,
  StandardizationResult,
  UnmappedColumn,
} from "./schema";

type Row = (string | number | null)[];
type Sheet = { name: string; rows: Row[] };

// Rows whose grantee-cell matches one of these are portfolio math, not a company.
const AGG_KEYWORDS = new Set([
  "total",
  "number reporting",
  "number reporting actually",
  "percent",
  "numerator combined",
  "denominator combined",
  "portfolio overview",
  "grantee",
  // Portfolio Overview summary labels that sit in the grantee column.
  "completed",
  "complete",
  "on schedule",
  "delayed",
]);

const A1 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
function colLetter(i: number): string {
  let s = "";
  i += 1;
  while (i > 0) {
    const r = (i - 1) % 26;
    s = A1[r] + s;
    i = Math.floor((i - 1) / 26);
  }
  return s;
}

// Turn "6-Month Data", "12 months", "baseline" into a ReportingPeriod.
function parsePeriodMarker(raw: unknown): ReportingPeriod | null {
  if (isBlank(raw)) return null;
  const t = normalizeHeader(String(raw));
  if (t.includes("baseline") || t.includes("registration")) return "baseline";
  const m = t.match(/(\d+)\s*month/);
  if (m) {
    const n = m[1];
    if (["3", "6", "9", "12"].includes(n)) return (`${n}-month`) as ReportingPeriod;
  }
  return null;
}

function isSpacer(header: unknown): boolean {
  if (isBlank(header)) return true;
  return normalizeHeader(String(header)).startsWith("column");
}

// Find the header row: first row that contains a "Grantee" cell.
function findHeader(rows: Row[]): { rowIdx: number; granteeCol: number } | null {
  for (let r = 0; r < Math.min(rows.length, 5); r++) {
    const row = rows[r] ?? [];
    for (let c = 0; c < row.length; c++) {
      if (normalizeHeader(String(row[c] ?? "")) === "grantee") {
        return { rowIdx: r, granteeCol: c };
      }
    }
  }
  return null;
}

function standardizeSheet(
  sheet: Sheet,
  defaultPeriod: ReportingPeriod,
  file: string | undefined,
  out: { records: StandardizedRecord[]; unmapped: UnmappedColumn[] }
): void {
  const header = findHeader(sheet.rows);
  if (!header) return; // not a grantee data sheet (e.g. Graphs)

  const headerRow = sheet.rows[header.rowIdx] ?? [];
  const granteeCol = header.granteeCol;
  // Period markers live to the LEFT of the grantee column (column A in Outputs).
  const periodCol = granteeCol > 0 ? 0 : -1;

  // Build the column plan: which columns map to which indicator.
  const plan: { col: number; indicator: ReturnType<typeof matchIndicator> }[] = [];
  for (let c = 0; c < headerRow.length; c++) {
    if (c === granteeCol || c === periodCol) continue;
    const h = headerRow[c];
    if (isSpacer(h)) continue;
    const indicator = matchIndicator(String(h));
    if (indicator) {
      plan.push({ col: c, indicator });
    } else {
      // Record unmapped (collect a couple of sample values for context).
      const samples: (string | number | null)[] = [];
      for (let r = header.rowIdx + 1; r < sheet.rows.length && samples.length < 3; r++) {
        const v = sheet.rows[r]?.[c];
        if (!isBlank(v)) samples.push(v as string | number | null);
      }
      out.unmapped.push({ sheet: sheet.name, header: String(h), sampleValues: samples });
    }
  }

  let currentPeriod: ReportingPeriod = defaultPeriod;

  for (let r = header.rowIdx + 1; r < sheet.rows.length; r++) {
    const row = sheet.rows[r] ?? [];

    // Update the active period if this row carries a marker.
    if (periodCol >= 0) {
      const marker = parsePeriodMarker(row[periodCol]);
      if (marker) currentPeriod = marker;
    }

    const granteeRaw = row[granteeCol];
    if (isBlank(granteeRaw)) continue; // spacer / sub-header row
    const granteeNorm = normalizeHeader(String(granteeRaw));
    if (AGG_KEYWORDS.has(granteeNorm)) continue; // aggregate row -> skip
    const grantee = String(granteeRaw).trim();

    for (let p = 0; p < plan.length; p++) {
      const { col, indicator } = plan[p];
      if (!indicator) continue;
      const raw = row[col];

      const rec: StandardizedRecord = {
        grantee,
        period: currentPeriod,
        indicatorId: indicator.id,
        indicatorLabel: indicator.label,
        domain: indicator.domain,
        category: indicator.category,
        valueType: indicator.valueType,
        value: null,
        applies: !isBlank(raw),
        unit: indicator.unit,
        source: { file, sheet: sheet.name, cell: `${colLetter(col)}${r + 1}` },
      };

      if (indicator.valueType === "text") {
        rec.value = isBlank(raw) ? null : String(raw); // VERBATIM, never summarised
      } else if (indicator.valueType === "boolean") {
        rec.value = toBoolean(raw);
      } else if (indicator.valueType === "percent") {
        // Outcome pattern: "Y" means it applies; the next two spacer columns,
        // when numeric, are numerator and denominator.
        const b = toBoolean(raw);
        if (b !== null) {
          rec.applies = b;
          const num = isSpacer(headerRow[col + 1]) ? toNumber(row[col + 1]) : null;
          const den = isSpacer(headerRow[col + 2]) ? toNumber(row[col + 2]) : null;
          rec.numerator = num;
          rec.denominator = den;
          rec.value = num !== null && den ? (num / den) * 100 : null;
        } else {
          rec.value = toNumber(raw); // already a percent
        }
      } else {
        rec.value = toNumber(raw); // plain number
      }

      out.records.push(rec);
    }
  }
}

export interface StandardizeOptions {
  // The period this upload represents, used for sheets without period markers.
  defaultPeriod: ReportingPeriod;
  file?: string;
  // Optionally restrict to certain sheets; default = all sheets with a Grantee row.
  sheets?: string[];
}

export function standardizeWorkbook(
  workbook: { name: string; rows: Row[] }[],
  opts: StandardizeOptions
): StandardizationResult {
  const out = { records: [] as StandardizedRecord[], unmapped: [] as UnmappedColumn[] };
  const warnings: string[] = [];

  for (const sheet of workbook) {
    if (opts.sheets && !opts.sheets.includes(sheet.name)) continue;
    standardizeSheet(sheet, opts.defaultPeriod, opts.file, out);
  }

  // De-duplicate unmapped headers and drop pure-spacer noise.
  const seen = new Set<string>();
  const unmapped = out.unmapped.filter((u) => {
    const k = `${u.sheet}|${normalizeHeader(u.header)}`;
    if (seen.has(k) || !u.header.trim()) return false;
    seen.add(k);
    return true;
  });

  const grantees = [...new Set(out.records.map((r) => r.grantee))].sort();
  const periodsFound = [...new Set(out.records.map((r) => r.period))];

  if (out.records.length === 0) {
    warnings.push("No grantee rows were found. Check that a 'Grantee' header exists.");
  }

  return { records: out.records, unmapped, grantees, periodsFound, warnings };
}
