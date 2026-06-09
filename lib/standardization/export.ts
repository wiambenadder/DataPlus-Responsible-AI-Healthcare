// lib/standardization/export.ts
// ---------------------------------------------------------------------------
// Step 3 must be "exportable and savable for innovators (PDF, Excel)" and
// produce "a separate format of all companies for funders". This builds those
// Excel/CSV outputs from the clean records. (PDF export is done in the UI via
// the browser's print-to-PDF, so it needs no extra dependency.)
// ---------------------------------------------------------------------------

import * as XLSX from "xlsx";
import { aggregateByIndicator, periodChangeForGrantee } from "./aggregate";
import { REPORTING_PERIODS } from "./schema";
import type { ReportingPeriod, StandardizedRecord } from "./schema";

function downloadWorkbook(wb: XLSX.WorkBook, filename: string) {
  XLSX.writeFile(wb, filename); // triggers a browser download
}

// The canonical tidy dataset — one row per record. This is the machine-readable
// "standard format" other steps and analysts consume.
export function exportLongCSV(records: StandardizedRecord[]) {
  const rows = records.map((r) => ({
    grantee: r.grantee,
    period: r.period,
    domain: r.domain,
    category: r.category,
    indicator_id: r.indicatorId,
    indicator: r.indicatorLabel,
    value: r.value,
    numerator: r.numerator ?? "",
    denominator: r.denominator ?? "",
    applies: r.applies,
    unit: r.unit ?? "",
    source: r.source.cell ? `${r.source.sheet}!${r.source.cell}` : "",
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "standardized");
  downloadWorkbook(wb, "standardized_long.csv");
}

// FUNDER format: a portfolio aggregate sheet (indicator x period) plus a
// "compare grantees" matrix per period. This is what Pfizer-style reviewers see.
export function exportFunderWorkbook(records: StandardizedRecord[]) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: aggregate totals
  const aggs = aggregateByIndicator(records);
  const aggRows = aggs.map((a) => ({
    indicator: a.indicatorLabel,
    period: a.period,
    portfolio_total: a.total,
    grantees_reporting: a.numberReporting,
    mean: a.mean ?? "",
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(aggRows), "Portfolio Aggregate");

  // Sheet 2 per period: grantees as rows, indicators as columns (numeric only).
  const periods = REPORTING_PERIODS.filter((p) => records.some((r) => r.period === p));
  const grantees = [...new Set(records.map((r) => r.grantee))].sort();
  const indicators = [
    ...new Map(
      records
        .filter((r) => r.valueType === "number" || r.valueType === "percent")
        .map((r) => [r.indicatorId, r.indicatorLabel])
    ),
  ];

  for (const period of periods) {
    const matrix = grantees.map((g) => {
      const row: Record<string, string | number> = { Grantee: g };
      for (const [id, label] of indicators) {
        const rec = records.find(
          (r) => r.grantee === g && r.indicatorId === id && r.period === period
        );
        row[label] = rec && rec.applies && typeof rec.value === "number" ? rec.value : "";
      }
      return row;
    });
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(matrix),
      `Compare ${period}`.slice(0, 31)
    );
  }

  downloadWorkbook(wb, "funder_standardized.xlsx");
}

// INNOVATOR format: one company's data, grouped, plus their progress story.
export function exportInnovatorWorkbook(
  records: StandardizedRecord[],
  grantee: string,
  from: ReportingPeriod = "6-month",
  to: ReportingPeriod = "12-month"
) {
  const wb = XLSX.utils.book_new();
  const mine = records.filter((r) => r.grantee === grantee);

  const dataRows = mine.map((r) => ({
    period: r.period,
    domain: r.domain,
    indicator: r.indicatorLabel,
    value: r.value ?? (r.applies ? "(not yet reported)" : "(not applicable)"),
    unit: r.unit ?? "",
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(dataRows), "My Data");

  const change = periodChangeForGrantee(records, grantee, from, to).map((c) => ({
    indicator: c.indicatorLabel,
    [from]: c.fromValue,
    [to]: c.toValue,
    percent_change: c.percentChange === null ? "n/a" : `${c.percentChange.toFixed(1)}%`,
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(change), `Progress ${from}-${to}`.slice(0, 31));

  downloadWorkbook(wb, `${grantee.replace(/\s+/g, "_")}_report.xlsx`);
}
