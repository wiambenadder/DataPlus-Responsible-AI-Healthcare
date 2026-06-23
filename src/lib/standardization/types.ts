export type RawCell = string | number | boolean | null;
export type Grid = RawCell[][];
export type ReportingPeriod = "6m" | "12m";
export type SheetRole = "project_status" | "outputs" | "outcomes";
export interface CleanedNumber { value: number | null; raw: string | null; wasNumeric: boolean; }
export interface QualitativeField { value: string; isQualitative: true; }
export interface IndicatorMatch { raw: string; canonical: string | null; score: number; matched: boolean; }
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
  sheetsMatched: { found: string; role: SheetRole; score: number }[];
  matchedIndicators: number;
  unmatchedIndicators: { sheet: SheetRole; raw: string; bestScore: number }[];
  renamedColumns: { sheet: SheetRole; found: string; mappedTo: string }[];
  periodsDetected: ReportingPeriod[]; warnings: string[];
}
export interface StandardizedFile {
  company: string; sourceName: string; periodsDetected: ReportingPeriod[];
  orgName: string | null; projectManager: string | null;
  projectStatus: ProjectStatusRow[]; indicators: StandardizedIndicator[]; log: FileLog;
}
export interface RunResult { runAt: string; files: StandardizedFile[]; missingCompanies: string[]; }