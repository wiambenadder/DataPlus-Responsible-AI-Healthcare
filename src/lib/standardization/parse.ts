// src/lib/standardization/parse.ts
//
// Reads .xlsx bytes into grids (SheetJS) and applies the positional layout defined
// in schema.json. Indices in the schema are 1-based; here we convert to 0-based.
//
// RULE: only KNOWN non-data is removed — instruction sheets, the indicator
// reference library, repeated mid-sheet header rows, and rows marked for deletion.
// The line between "noise" and "data" is drawn explicitly, never by guesswork.

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
}

/** Extract project-status rows using the positional layout. */
export function extractProjectStatusRows(grid: Grid): RawProjectStatusRow[] {
  const cfg = schema.sheet_roles.project_status;
  const out: RawProjectStatusRow[] = [];

  for (let r = cfg.data_start_row; r <= grid.length; r++) {
    const row = grid[r - 1];
    if (isBlankRow(row)) continue;

    const objective = cell(grid, r, cfg.columns["objective"]);
    const objText = objective === null ? "" : String(objective).trim();
    if (objText !== "" && hasDropMarker(objText)) continue;

    const values: Record<string, RawCell> = {};
    for (const [colName, col1] of Object.entries(cfg.columns)) {
      values[colName] = cell(grid, r, col1);
    }
    out.push({ values });
  }
  return out;
}

export type { SheetRole };
