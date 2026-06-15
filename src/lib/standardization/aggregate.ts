// src/lib/standardization/aggregate.ts
//
// Builds the cross-company "funder view" from standardized files.
//   - quantitative: one row per (sheet, indicator, metric), one column per company
//   - qualitative:  long form, one row per company per question, answers VERBATIM
//
// RULE: nothing is dropped. An indicator with no value from any company still
// appears as an all-blank row. An expected-but-missing company still appears as
// an all-blank column.

import type { RunResult } from "./types";

export interface QuantRow {
  sheet: string;
  indicator: string; // canonical (or raw, prefixed, if unmatched)
  metric: string; // quantitative column name, e.g. value_6m
  /** value per company; null = missing/absent (never imputed) */
  values: Record<string, number | null>;
}

export interface QualRow {
  company: string;
  sheet: string;
  indicator: string;
  question: string; // qualitative column name
  answer: string; // verbatim
}

export interface FunderView {
  companies: string[];
  quantitative: QuantRow[];
  qualitative: QualRow[];
}

function indicatorLabel(canonical: string | null, raw: string): string {
  return canonical ?? `[UNMATCHED] ${raw}`;
}

export function buildFunderView(
  run: RunResult,
  expectedCompanies?: string[],
): FunderView {
  // Column set = every company that submitted + every expected company (so
  // missing grantees get an empty column).
  const companySet = new Set<string>();
  for (const f of run.files) companySet.add(f.company);
  for (const c of expectedCompanies ?? []) companySet.add(c.trim());
  const companies = [...companySet].filter(Boolean).sort();

  // ----- Quantitative -----
  // key = sheet | indicator | metric
  const quantIndex = new Map<string, QuantRow>();
  const keyOf = (s: string, i: string, m: string) => `${s}|||${i}|||${m}`;

  const ensureRow = (sheet: string, indicator: string, metric: string): QuantRow => {
    const k = keyOf(sheet, indicator, metric);
    let row = quantIndex.get(k);
    if (!row) {
      const values: Record<string, number | null> = {};
      for (const c of companies) values[c] = null; // explicit missing for all
      row = { sheet, indicator, metric, values };
      quantIndex.set(k, row);
    }
    return row;
  };

  const qualitative: QualRow[] = [];

  for (const file of run.files) {
    for (const ind of file.indicators) {
      const label = indicatorLabel(ind.indicator.canonical, ind.indicator.raw);

      for (const [metric, cleaned] of Object.entries(ind.quantitative)) {
        const row = ensureRow(ind.sheet, label, metric);
        row.values[file.company] = cleaned.value; // may be null
      }

      for (const [question, q] of Object.entries(ind.qualitative)) {
        qualitative.push({
          company: file.company,
          sheet: ind.sheet,
          indicator: label,
          question,
          answer: q.value, // verbatim
        });
      }
    }

    // Project-status narrative also belongs in the qualitative view.
    file.projectStatus.forEach((ps, idx) => {
      const fields: [string, { value: string } | null][] = [
        ["objective", ps.objective],
        ["activities", ps.activities],
        ["status_6m", ps.status_6m],
        ["status_12m", ps.status_12m],
        ["delay_reason", ps.delay_reason],
        ["delay_plan", ps.delay_plan],
        ["notes", ps.notes],
      ];
      for (const [question, val] of fields) {
        if (val) {
          qualitative.push({
            company: file.company,
            sheet: "project_status",
            indicator: `Objective ${idx + 1}`,
            question,
            answer: val.value,
          });
        }
      }
    });
  }

  const quantitative = [...quantIndex.values()].sort(
    (a, b) =>
      a.sheet.localeCompare(b.sheet) ||
      a.indicator.localeCompare(b.indicator) ||
      a.metric.localeCompare(b.metric),
  );

  return { companies, quantitative, qualitative };
}
