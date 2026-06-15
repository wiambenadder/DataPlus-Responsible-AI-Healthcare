// src/lib/standardization/catalog.ts
//
// Fuzzy matching against the canonical schema. Uses `fuzzball` (a JS port of the
// same algorithm as Python's rapidfuzz/thefuzz), so the thresholds tuned in the
// original pipeline (88 / 80) transfer with minimal change.
//
// RULE: matching is conservative. Wording drift (capitalization, abbreviations,
// a parenthetical note) is absorbed; genuinely different disaggregations
// (e.g. FEMALE vs MALE) are NOT merged. Anything below threshold is reported as
// unmatched, never quietly collapsed.

import * as fuzz from "fuzzball";
import { schema } from "./schema";
import type { SheetRole, IndicatorMatch } from "./types";

/** Lowercase, collapse whitespace, drop punctuation noise. */
export function normKey(s: string): string {
  return s
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

/** Remove parenthetical clauses, e.g. "Total (should equal sum of rows 5,6,7)" -> "Total". */
export function stripParens(s: string): string {
  return s.replace(/\([^)]*\)/g, " ").replace(/\s+/g, " ").trim();
}

function prep(s: string): string {
  return normKey(stripParens(s));
}

/** Match a workbook sheet name to a canonical role, or null if none clears threshold. */
export function matchSheetRole(
  sheetName: string,
): { role: SheetRole; score: number } | null {
  const target = normKey(sheetName);
  let best: { role: SheetRole; score: number } | null = null;
  for (const role of Object.keys(schema.sheet_roles) as SheetRole[]) {
    for (const alias of schema.sheet_roles[role].aliases) {
      const score = fuzz.token_sort_ratio(target, normKey(alias));
      if (!best || score > best.score) best = { role, score };
    }
  }
  // Sheet names barely drift; use a forgiving threshold but still require a real match.
  return best && best.score >= 60 ? best : null;
}

/**
 * Map an observed column header to a canonical column name for a role.
 * Returns the canonical name and score, or null if nothing clears column_threshold.
 */
export function matchColumn(
  role: SheetRole,
  observedHeader: string,
): { canonical: string; score: number } | null {
  const cfg = schema.sheet_roles[role];
  const target = prep(observedHeader);
  let best: { canonical: string; score: number } | null = null;

  for (const canonical of Object.keys(cfg.columns)) {
    const candidates = [canonical, ...(schema.column_synonyms[canonical] ?? [])];
    for (const cand of candidates) {
      const score = fuzz.token_sort_ratio(target, prep(cand));
      if (!best || score > best.score) best = { canonical, score };
    }
  }
  return best && best.score >= schema.fuzzy.column_threshold ? best : null;
}

/**
 * Match an indicator string (as written) to the canonical indicator list.
 * Always returns a result; `matched` is false when nothing clears the threshold.
 */
export function matchIndicator(
  raw: string,
  role: "outputs" | "outcomes",
): IndicatorMatch {
  const choices = schema.canonical_indicators[role].map((i) => i.canonical_name);
  const preppedChoices = choices.map(prep);
  const query = prep(raw);

  // Exact (prepped) match first — avoids merging near-identical disaggregations.
  const exactIdx = preppedChoices.indexOf(query);
  if (exactIdx !== -1) {
    return { raw, canonical: choices[exactIdx], score: 100, matched: true };
  }

  const result = fuzz.extract(query, preppedChoices, {
    scorer: fuzz.token_sort_ratio,
    limit: 1,
  });

  if (result.length === 0) {
    return { raw, canonical: null, score: 0, matched: false };
  }

  const [, score, index] = result[0] as [string, number, number];
  const matched = score >= schema.fuzzy.indicator_threshold;
  return {
    raw,
    canonical: matched ? choices[index] : null,
    score,
    matched,
  };
}
