// src/lib/standardization/normalize.ts
//
// Pure, framework-agnostic cleaning functions. These are the heart of the ground
// rules. They have no side effects and no I/O, so they are trivial to unit-test.

import type { CleanedNumber, QualitativeField } from "./types";

const CURRENCY = /[$£€₹¥]/g;

// Common mojibake repairs (UTF-8 mis-decoded as Latin-1).
const ENCODING_FIXES: [RegExp, string][] = [
  [/â€™/g, "\u2019"],
  [/â€˜/g, "\u2018"],
  [/â€œ/g, "\u201C"],
  [/â€\u009d/g, "\u201D"],
  [/â€"/g, "\u2014"],
  [/â€"/g, "\u2013"],
  [/Â/g, ""],
];

/**
 * Clean a quantitative cell.
 * RULES enforced here:
 *   - "45%" -> 0.45
 *   - "$1,234.50" / "1,000" -> 1234.5 / 1000  (currency + thousands separators stripped)
 *   - "#DIV/0!" and other spreadsheet errors -> missing (value: null)
 *   - free text in a number cell -> missing, but the text is kept in `raw`
 *   - blank -> missing
 *   - a missing number is NEVER imputed
 */
export function cleanNumber(input: unknown): CleanedNumber {
  if (input === null || input === undefined) {
    return { value: null, raw: null, wasNumeric: false };
  }

  if (typeof input === "number") {
    return Number.isFinite(input)
      ? { value: input, raw: null, wasNumeric: true }
      : { value: null, raw: String(input), wasNumeric: false };
  }

  const text = String(input).trim();
  if (text === "") return { value: null, raw: null, wasNumeric: false };

  // Spreadsheet error literals are treated as missing.
  if (text.startsWith("#")) return { value: null, raw: text, wasNumeric: false };

  const isPercent = text.includes("%");
  const stripped = text
    .replace(CURRENCY, "")
    .replace(/%/g, "")
    .replace(/,/g, "")
    .trim();

  // Must be a clean numeric token; "around 500" must NOT parse to 500.
  if (/^[+-]?\d*\.?\d+$/.test(stripped)) {
    let n = parseFloat(stripped);
    if (isPercent) n = n / 100;
    return { value: n, raw: null, wasNumeric: true };
  }

  // Not a number: missing value, original text preserved.
  return { value: null, raw: text, wasNumeric: false };
}

/**
 * Clean a qualitative cell.
 * RULE: preserve VERBATIM. Only trim outer whitespace and repair encoding.
 * Never summarize, shorten, reword, or truncate. Returns `null` for empty cells.
 */
export function cleanQualitative(input: unknown): QualitativeField | null {
  if (input === null || input === undefined) return null;
  let text = String(input);
  for (const [pattern, replacement] of ENCODING_FIXES) {
    text = text.replace(pattern, replacement);
  }
  text = text.trim();
  if (text === "") return null;
  return { value: text, isQualitative: true };
}

const MONTHS: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

function iso(y: number, m: number, d: number): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${y}-${pad(m)}-${pad(d)}`;
}

/**
 * Convert a deadline/date cell to ISO-8601 (YYYY-MM-DD), or `null`.
 * RULE: vague values ("Q1 2025", "Month 6", "Ongoing...") are left missing
 * rather than forced into a false precise date.
 * Handles: JS Date objects, Excel serial numbers, and common string formats.
 */
export function toIsoDate(input: unknown): string | null {
  if (input === null || input === undefined) return null;

  if (input instanceof Date && !isNaN(input.getTime())) {
    return iso(input.getUTCFullYear(), input.getUTCMonth() + 1, input.getUTCDate());
  }

  // Excel serial date (days since 1899-12-30).
  if (typeof input === "number" && Number.isFinite(input)) {
    if (input < 1 || input > 60000) return null;
    const epoch = Date.UTC(1899, 11, 30);
    const dt = new Date(epoch + Math.round(input) * 86400000);
    return iso(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
  }

  const text = String(input).trim();
  if (text === "") return null;

  // M/D/YYYY or M-D-YYYY
  let m = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (m) return iso(+m[3], +m[1], +m[2]);

  // YYYY-MM-DD (already ISO-ish)
  m = text.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
  if (m) return iso(+m[1], +m[2], +m[3]);

  // "Feb/2025", "Feb 2025", "February 2025" -> first of month
  m = text.match(/^([A-Za-z]{3,9})[/\s-]+(\d{4})$/);
  if (m) {
    const mo = MONTHS[m[1].slice(0, 3).toLowerCase()];
    if (mo) return iso(+m[2], mo, 1);
  }

  // "15 Feb 2025" / "Feb 15, 2025"
  m = text.match(/^(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})$/);
  if (m) {
    const mo = MONTHS[m[2].slice(0, 3).toLowerCase()];
    if (mo) return iso(+m[3], mo, +m[1]);
  }
  m = text.match(/^([A-Za-z]{3,9})\s+(\d{1,2}),?\s+(\d{4})$/);
  if (m) {
    const mo = MONTHS[m[1].slice(0, 3).toLowerCase()];
    if (mo) return iso(+m[3], mo, +m[2]);
  }

  // Anything vague ("Q1 2025", "Month 6", "Ongoing until ...") -> missing.
  return null;
}
