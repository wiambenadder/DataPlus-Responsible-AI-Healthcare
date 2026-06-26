// src/lib/standardization/types.ts
//
// Shared types for the standardization engine.
// The types are written so the GROUND RULES are visible in the shape of the data:
//   - a number is EITHER a real number OR explicitly missing (never silently 0)
//   - the original text of an unparseable number is always kept (`raw`)
//   - qualitative text is a distinct type tagged `isQualitative: true`

export type RawCell = string | number | boolean | null;

/** A worksheet read as a 2-D grid of raw cells (row-major, 0-indexed). */
export type Grid = RawCell[][];

export type ReportingPeriod = "6m" | "12m";
export type SheetRole = "project_status" | "outputs" | "outcomes";

/**
 * Result of cleaning a quantitative cell.
 * RULE: missing numbers are flagged, never invented; unparseable text is preserved in `raw`.
 */
export interface CleanedNumber {
  /** Machine-readable number, or `null` when the value is missing/unparseable. */
  value: number | null;
  /** Original text, kept whenever the cell was not a clean number. `null` if it was clean or empty. */
  raw: string | null;
  /** True only when a genuine number was parsed. */
  wasNumeric: boolean;
}

/**
 * A narrative answer.
 * RULE: preserved verbatim. The only permitted changes are trimming the outer
 * whitespace and repairing mangled encoding. Never summarized or reworded.
 */
export interface QualitativeField {
  value: string;
  isQualitative: true;
}

export interface IndicatorMatch {
  /** Indicator text exactly as written in the source file. */
  raw: string;
  /** Canonical indicator it was matched to, or `null` if it could not be matched. */
  canonical: string | null;
  /** Fuzzy score 0..100. */
  score: number;
  matched: boolean;
}

/** One standardized indicator row from an Outputs or Outcomes sheet. */
export interface StandardizedIndicator {
  sheet: Extract<SheetRole, "outputs" | "outcomes">;
  indicator: IndicatorMatch;
  quantitative: Record<string, CleanedNumber>;
  qualitative: Record<string, QualitativeField>;
  dates: Record<string, string | null>;
  attributes: Record<string, RawCell>;
}
export interface ProjectStatusRow {
  /** Program goal this objective falls under (carried from the "Program Goal N" header row). */
  goal?: string | null;
  objective: QualitativeField | null; activities: QualitativeField | null; deadline: QualitativeField | null;
  status_6m: QualitativeField | null; status_12m: QualitativeField | null; delay_reason: QualitativeField | null;
  delay_plan: QualitativeField | null; delay_est_date: string | null; notes: QualitativeField | null;
}
export interface FileLog {
  company: string; sourceName: string; processedAt: string;
  dates: Record<string, string | null>; // ISO-8601 or null
  /** Any other mapped column that is neither number, date, nor narrative (e.g. conducts_activity). */
  attributes: Record<string, RawCell>;
}

export interface ProjectStatusRow {
  objective: QualitativeField | null;
  activities: QualitativeField | null;
  deadline: QualitativeField | null;
  status_6m: QualitativeField | null;
  status_12m: QualitativeField | null;
  delay_reason: QualitativeField | null;
  delay_plan: QualitativeField | null;
  delay_est_date: string | null; // ISO-8601 or null
  notes: QualitativeField | null;
}

export interface FileLog {
  company: string;
  sourceName: string;
  processedAt: string; // ISO timestamp
  sheetsMatched: { found: string; role: SheetRole; score: number }[];
  matchedIndicators: number;
  unmatchedIndicators: { sheet: SheetRole; raw: string; bestScore: number }[];
  renamedColumns: { sheet: SheetRole; found: string; mappedTo: string }[];
  periodsDetected: ReportingPeriod[];
  warnings: string[];
}

export interface StandardizedFile {
  company: string;
  sourceName: string;
  periodsDetected: ReportingPeriod[];
  orgName: string | null;
  projectManager: string | null;
  projectStatus: ProjectStatusRow[];
  indicators: StandardizedIndicator[];
  log: FileLog;
}

export interface RunResult {
  runAt: string;
  files: StandardizedFile[];
  /** Companies expected for the period but with no submitted file. */
  missingCompanies: string[];
}
