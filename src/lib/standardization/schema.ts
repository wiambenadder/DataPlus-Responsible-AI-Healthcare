// src/lib/standardization/schema.ts
//
// Loads the canonical master schema from schema.json and exposes a typed view.
//
// RULE: the schema is DATA, not code. Every canonical indicator, sheet alias,
// column map and threshold lives in schema.json. To add an indicator or retune a
// threshold, edit schema.json — you do not touch any .ts file.
//
// NOTE ON INDEXING: column/row indices in schema.json are 1-BASED (they were
// inferred against a 1-based spreadsheet library). parse.ts converts them to the
// 0-based grid indices that SheetJS produces. Do not "fix" them here.

import rawSchema from "./schema.json";
import type { ReportingPeriod, SheetRole } from "./types";

export interface SheetRoleConfig {
  aliases: string[];
  layout: "indicator_table" | "project_status";
  header_row?: number; // 1-based
  data_start_row: number; // 1-based
  org_name_cell?: [number, number]; // 1-based [row, col]
  pm_name_cell?: [number, number]; // 1-based [row, col]
  columns: Record<string, number>; // column name -> 1-based column index
  qualitative_columns: string[];
  quantitative_columns: string[];
  date_columns: string[];
}

export interface FuzzyConfig {
  indicator_threshold: number; // 0..100
  column_threshold: number; // 0..100
}

export interface PeriodConfig {
  header_keywords: string[];
  [key: string]: unknown;
}

export interface CanonicalIndicator {
  canonical_name: string;
  strategy?: string;
  present_in_n_companies?: number;
}

export interface CanonicalIndicators {
  outputs: CanonicalIndicator[];
  outcomes: CanonicalIndicator[];
  outputs_partial_coverage: CanonicalIndicator[];
  outcomes_partial_coverage: CanonicalIndicator[];
}

export interface Schema {
  sheet_roles: Record<SheetRole, SheetRoleConfig>;
  column_synonyms: Record<string, string[]>;
  reporting_periods: Record<ReportingPeriod, PeriodConfig>;
  drop_row_markers: string[];
  fuzzy: FuzzyConfig;
  canonical_indicators: CanonicalIndicators;
}

export const schema = rawSchema as unknown as Schema;

export const SHEET_ROLES = Object.keys(schema.sheet_roles) as SheetRole[];

/** Canonical indicator names for a given indicator sheet. */
export function canonicalFor(role: "outputs" | "outcomes"): string[] {
  return schema.canonical_indicators[role].map((i) => i.canonical_name);
}

/** Indicators known to appear in only SOME reference files (flagged, not assumed universal). */
export function partialCoverageFor(role: "outputs" | "outcomes"): string[] {
  const list =
    role === "outputs"
      ? schema.canonical_indicators.outputs_partial_coverage
      : schema.canonical_indicators.outcomes_partial_coverage;
  return list.map((i) => i.canonical_name);
}
