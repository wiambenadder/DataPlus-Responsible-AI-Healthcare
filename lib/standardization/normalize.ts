// lib/standardization/normalize.ts
// ---------------------------------------------------------------------------
// Source spreadsheets are messy: trailing spaces, double spaces, casing,
// punctuation, even typos ("On schdule"). We normalize a header to a stable
// key so "On schedule " and "on  Schedule" both match the same indicator.
// ---------------------------------------------------------------------------

export function normalizeHeader(raw: string): string {
  return String(raw)
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'") // curly to straight quotes
    .replace(/[^a-z0-9]+/g, " ") // drop punctuation -> spaces
    .replace(/\s+/g, " ")
    .trim();
}

// A blank cell and the number 0 mean very different things here (see spec).
// This tells them apart and also reads "N/A"-style text as blank.
export function isBlank(v: unknown): boolean {
  if (v === null || v === undefined) return true;
  if (typeof v === "string") {
    const t = v.trim().toLowerCase();
    return t === "" || t === "n/a" || t === "na" || t === "-";
  }
  return false;
}

// Coerce a source cell into a number, or null if it isn't one.
export function toNumber(v: unknown): number | null {
  if (isBlank(v)) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  const cleaned = String(v).replace(/[, %$]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

// Many sheets use "Y" / "Yes" to mean "this indicator applies / was done".
export function toBoolean(v: unknown): boolean | null {
  if (isBlank(v)) return null;
  const t = String(v).trim().toLowerCase();
  if (["y", "yes", "true", "1"].includes(t)) return true;
  if (["n", "no", "false", "0"].includes(t)) return false;
  return null;
}
