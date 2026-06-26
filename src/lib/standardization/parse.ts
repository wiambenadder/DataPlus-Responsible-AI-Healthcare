// src/lib/standardization/parse.ts
//
// Reads .xlsx bytes into grids (SheetJS) and applies the positional layout defined
// in schema.json. Indices in the schema are 1-based; here we convert to 0-based.
//
// RULE: only KNOWN non-data is removed — instruction sheets, the indicator
// reference library, repeated mid-sheet header rows, and rows marked for deletion.
// The line between "noise" and "data" is drawn explicitly, never by guesswork.
//
// CHANGED (goal grouping): the Project Status sheet interleaves "Program Goal N"
// header rows and repeated "Objective(s) | Activities | Deadline" sub-headers
// between the real objective rows. These were previously emitted as junk rows and
// the goal grouping was lost. We now (a) skip those structural rows and (b) carry
// the current goal onto every emitted row via `goal`.

import * as XLSX from "xlsx";
import { schema } from "./schema";
import type { SheetRoleConfig } from "./schema";
import { normKey } from "./catalog";
import type { Grid, RawCell, SheetRole } from "./types";

export interface SheetGrid {
  name: string;
  grid: Grid;
}

/** Parse all worksheets in a workbook into 0-indexed grids. */
export function readWorkbook(bytes: ArrayBuffer): SheetGrid[] {
  const wb = XLSX.read(bytes, { type: "array", cellDates: true });
  return wb.SheetNames.map((name) => {
    const ws = wb.Sheets[name];
    // Force the parsed range to start at A1 so grid column indices line up with
    // the schema's ABSOLUTE 1-based column numbers. Without this, SheetJS starts
    // the grid at the sheet's used range — e.g. column B when column A is empty,
    // as in the Project Status sheet — which shifts every column by one and makes
    // the org/PM anchors and objective/activity columns read the wrong cells.
    if (ws["!ref"]) {
      const range = XLSX.utils.decode_range(ws["!ref"]);
      range.s.c = 0;
      range.s.r = 0;
      ws["!ref"] = XLSX.utils.encode_range(range);
    }
    const grid = XLSX.utils.sheet_to_json<RawCell[]>(ws, {
      header: 1,
      raw: true,
      defval: null,
      blankrows: true,
    }) as Grid;
    return { name, grid };
  });
}

function cell(grid: Grid, row1: number, col1: number): RawCell {
  const r = grid[row1 - 1];
  if (!r) return null;
  const v = r[col1 - 1];
  return v === undefined ? null : v;
}

/** Read a header-anchored single cell (org name, PM name) by 1-based [row, col]. */
export function readAnchorCell(grid: Grid, rc?: [number, number]): RawCell {
  if (!rc) return null;
  return cell(grid, rc[0], rc[1]);
}

const isBlankRow = (row: RawCell[] | undefined): boolean =>
  !row || row.every((c) => c === null || c === undefined || String(c).trim() === "");

/**
 * Build a set of normalized header labels for a role, so a repeated header row in
 * the middle of a sheet (e.g. the "Indicator definition" divider in Outcomes) is
 * recognized and skipped rather than counted as an indicator.
 */
function headerLabelSet(cfg: SheetRoleConfig): Set<string> {
  const labels = new Set<string>();
  for (const name of Object.keys(cfg.columns)) labels.add(normKey(name));
  labels.add(normKey("indicator definition"));
  labels.add(normKey("indicator"));
  return labels;
}

function hasDropMarker(text: string): boolean {
  const t = text.toUpperCase();
  return schema.drop_row_markers.some((m) => t.includes(m.toUpperCase()));
}

export interface RawIndicatorRow {
  indicatorText: string;
  values: Record<string, RawCell>; // canonical column name -> raw cell
}

/**
 * Extract indicator rows from an Outputs/Outcomes grid using the positional layout.
 * Returns one entry per genuine indicator row; noise rows are skipped.
 */
export function extractIndicatorRows(
  grid: Grid,
  role: "outputs" | "outcomes",
): RawIndicatorRow[] {
  const cfg = schema.sheet_roles[role];
  const indicatorCol = cfg.columns["indicator"];
  const headerLabels = headerLabelSet(cfg);
  const out: RawIndicatorRow[] = [];

  for (let r = cfg.data_start_row; r <= grid.length; r++) {
    const row = grid[r - 1];
    if (isBlankRow(row)) continue;

    const indicatorCell = cell(grid, r, indicatorCol);
    const indicatorText = indicatorCell === null ? "" : String(indicatorCell).trim();
    if (indicatorText === "") continue;

    const norm = normKey(indicatorText);
    if (headerLabels.has(norm)) continue; // repeated header row
    if (hasDropMarker(indicatorText)) continue; // explicit "DELETE" rows

    const values: Record<string, RawCell> = {};
    for (const [colName, col1] of Object.entries(cfg.columns)) {
      values[colName] = cell(grid, r, col1);
    }
    out.push({ indicatorText, values });
  }
  return out;
}

export interface RawProjectStatusRow {
  values: Record<string, RawCell>;
  /** Program goal this row belongs to, e.g. "Program Goal 2: Drive Behavior Change". */
  goal: string | null;
}

const PROGRAM_GOAL_RE = /^program goal/i;

/** True for the repeated "Objective(s) | Activities | Deadline" sub-header rows. */
function isObjectiveSubHeader(objText: string, activitiesCell: RawCell): boolean {
  const o = normKey(objText);
  const a = activitiesCell === null ? "" : normKey(String(activitiesCell));
  return (o === "objective(s)" || o === "objectives" || o === "objective") && a === "activities";
}

/** "Program Goal 2" + "Drive Behavior Change" -> "Program Goal 2: Drive Behavior Change". */
function goalLabel(objText: string, descCell: RawCell): string {
  const desc = descCell === null ? "" : String(descCell).trim();
  const head = objText.trim();
  return desc ? `${head}: ${desc}` : head;
}

/**
 * Extract project-status rows using the positional layout.
 * Skips "Program Goal N" headers and repeated objective sub-headers, and tags
 * every emitted row with the goal it falls under.
 */
export function extractProjectStatusRows(grid: Grid): RawProjectStatusRow[] {
  const cfg = schema.sheet_roles.project_status;
  const objCol = cfg.columns["objective"];
  const actCol = cfg.columns["activities"];
  const out: RawProjectStatusRow[] = [];

  // Seed the current goal from any "Program Goal" header that sits ABOVE the
  // first data row (Goal 1 typically precedes data_start_row).
  let currentGoal: string | null = null;
  for (let r = 1; r < cfg.data_start_row; r++) {
    const o = cell(grid, r, objCol);
    if (o !== null && PROGRAM_GOAL_RE.test(String(o).trim())) {
      currentGoal = goalLabel(String(o), cell(grid, r, actCol));
    }
  }

  for (let r = cfg.data_start_row; r <= grid.length; r++) {
    const row = grid[r - 1];
    if (isBlankRow(row)) continue;

    const objective = cell(grid, r, objCol);
    const objText = objective === null ? "" : String(objective).trim();

    // Structural rows: capture goal, never emit.
    if (PROGRAM_GOAL_RE.test(objText)) {
      currentGoal = goalLabel(objText, cell(grid, r, actCol));
      continue;
    }
    if (isObjectiveSubHeader(objText, cell(grid, r, actCol))) continue;
    if (objText !== "" && hasDropMarker(objText)) continue;

    const values: Record<string, RawCell> = {};
    for (const [colName, col1] of Object.entries(cfg.columns)) {
      values[colName] = cell(grid, r, col1);
    }
    out.push({ values, goal: currentGoal });
  }
  return out;
}

export type { SheetRole };
