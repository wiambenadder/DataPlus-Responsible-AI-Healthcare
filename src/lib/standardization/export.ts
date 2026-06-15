// src/lib/standardization/export.ts
//
// Turns standardized results into downloadable files IN THE BROWSER (Blobs + a
// download trigger). No filesystem, no server. SheetJS writes the workbook; CSV
// is built by hand so quoting stays correct for verbatim narrative text.

import * as XLSX from "xlsx";
import type { StandardizedFile, RunResult } from "./types";
import type { FunderView } from "./aggregate";
import { buildFunderView } from "./aggregate";

/** Trigger a browser download for a Blob. Safe to call only in the browser. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function csvCell(v: unknown): string {
  if (v === null || v === undefined) return ""; // explicit blank for missing
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function toCsv(headers: string[], rows: unknown[][]): string {
  const lines = [headers.map(csvCell).join(",")];
  for (const r of rows) lines.push(r.map(csvCell).join(","));
  return lines.join("\n");
}

export function funderQuantitativeCsv(view: FunderView): string {
  const headers = ["sheet", "indicator", "metric", ...view.companies];
  const rows = view.quantitative.map((r) => [
    r.sheet,
    r.indicator,
    r.metric,
    ...view.companies.map((c) => r.values[c]),
  ]);
  return toCsv(headers, rows);
}

export function funderQualitativeCsv(view: FunderView): string {
  const headers = ["company", "sheet", "indicator", "question", "answer"];
  const rows = view.qualitative.map((r) => [
    r.company,
    r.sheet,
    r.indicator,
    r.question,
    r.answer,
  ]);
  return toCsv(headers, rows);
}

/** Build a per-company cleaned workbook (Outputs / Outcomes / Qualitative / Mapping Log tabs). */
export function companyWorkbook(file: StandardizedFile): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  const outputs = file.indicators.filter((i) => i.sheet === "outputs");
  const outcomes = file.indicators.filter((i) => i.sheet === "outcomes");

  const indicatorSheet = (rows: typeof file.indicators) => {
    const aoa: unknown[][] = [];
    const metricCols = new Set<string>();
    rows.forEach((r) => Object.keys(r.quantitative).forEach((m) => metricCols.add(m)));
    const metrics = [...metricCols].sort();
    aoa.push(["indicator", "matched", "match_score", ...metrics, ...metrics.map((m) => `${m}__raw`)]);
    for (const r of rows) {
      aoa.push([
        r.indicator.canonical ?? r.indicator.raw,
        r.indicator.matched ? "yes" : "no",
        r.indicator.score,
        ...metrics.map((m) => r.quantitative[m]?.value ?? null),
        ...metrics.map((m) => r.quantitative[m]?.raw ?? null),
      ]);
    }
    return XLSX.utils.aoa_to_sheet(aoa);
  };

  XLSX.utils.book_append_sheet(wb, indicatorSheet(outputs), "Outputs");
  XLSX.utils.book_append_sheet(wb, indicatorSheet(outcomes), "Outcomes");

  // Qualitative tab (verbatim)
  const qual: unknown[][] = [["sheet", "indicator", "question", "answer", "is_qualitative"]];
  for (const r of file.indicators) {
    for (const [q, v] of Object.entries(r.qualitative)) {
      qual.push([r.sheet, r.indicator.canonical ?? r.indicator.raw, q, v.value, true]);
    }
  }
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(qual), "Qualitative");

  // Mapping log tab
  const map: unknown[][] = [["type", "found", "mapped_to_or_role", "score"]];
  for (const s of file.log.sheetsMatched) map.push(["sheet", s.found, s.role, s.score]);
  for (const u of file.log.unmatchedIndicators) map.push(["unmatched_indicator", u.raw, "", u.bestScore]);
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(map), "Mapping Log");

  return wb;
}

export interface ExportBundle {
  companyWorkbooks: { company: string; blob: Blob }[];
  funderQuantitative: Blob;
  funderQualitative: Blob;
  log: Blob;
}

/** Produce every downloadable artifact for a run as in-memory Blobs. */
export function buildExports(run: RunResult, expectedCompanies?: string[]): ExportBundle {
  const view = buildFunderView(run, expectedCompanies);

  const companyWorkbooks = run.files.map((f) => {
    const wb = companyWorkbook(f);
    const array = XLSX.write(wb, { type: "array", bookType: "xlsx" });
    return {
      company: f.company,
      blob: new Blob([array], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
    };
  });

  const csvBlob = (s: string) => new Blob([s], { type: "text/csv;charset=utf-8" });

  return {
    companyWorkbooks,
    funderQuantitative: csvBlob(funderQuantitativeCsv(view)),
    funderQualitative: csvBlob(funderQualitativeCsv(view)),
    log: new Blob([JSON.stringify({ runAt: run.runAt, missingCompanies: run.missingCompanies, files: run.files.map((f) => f.log) }, null, 2)], {
      type: "application/json",
    }),
  };
}
