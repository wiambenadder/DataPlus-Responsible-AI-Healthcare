/**
 * Feedback on assessment results — pure helpers (safe to import on the
 * server, e.g. from the notification email).
 *
 * Works with the existing `feedback` table — no migration needed:
 *   - `feedback_type` stays "like" | "dislike" (what the admin page and
 *     emails already understand). "This is accurate" → like; "Needs
 *     revision" and "Wrong source or company" → dislike.
 *   - The new choice and any revision reasons are written as a short,
 *     human-readable prefix on `reason`, e.g.
 *       [Needs revision · Outdated information; Requires further detail]
 *       The 2024 data audit replaced this process.
 *     so the admin inbox and notification emails stay readable as-is,
 *     and `parseReason` turns it back into structured data here.
 *   - Older rows without a prefix are read as like → accurate,
 *     dislike → needs revision.
 */

export type FeedbackKind = "accurate" | "needs_revision" | "wrong_source";

export const KIND_LABEL: Record<FeedbackKind, string> = {
  accurate: "This is accurate",
  needs_revision: "Needs revision",
  wrong_source: "Wrong source or company",
};

/** Optional reasons offered when someone picks "Needs revision". */
export const REVISION_REASONS = [
  "Incorrect information",
  "We answered this, but it wasn't picked up",
  "Requires further detail",
  "Outdated information",
  "Wrong company or partner",
  "The criterion is unclear",
  "Other",
] as const;

export type ReviewStatus = "open" | "reviewed" | "resolved";

/** Where a feedback entry is in its round-trip to the database. */
export type SyncState =
  | "saving"
  | "saved"
  | "save_failed"
  | "deleting"
  | "delete_failed";

export type FeedbackEntry = {
  /** Stable key for React; equals the row id once saved. */
  key: string;
  /** Database id; null until the first save succeeds. */
  id: string | number | null;
  domain: string;
  subdomain: string;
  kind: FeedbackKind;
  reasons: string[];
  comment: string;
  reporterId: string | null;
  reporterEmail: string | null;
  reviewStatus: ReviewStatus;
  /** When the row was last written, in ms. */
  savedAt: number | null;
  sync: SyncState;
  error?: string;
};

export type FeedbackRow = {
  id: string | number;
  company_id: string;
  domain: string | null;
  subdomain: string | null;
  feedback_type: "like" | "dislike" | string;
  reason: string | null;
  status?: ReviewStatus | null;
  reported_by?: string | null;
  reporter_email?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

const KIND_BY_LABEL = new Map(
  (Object.entries(KIND_LABEL) as [FeedbackKind, string][]).map(([k, v]) => [
    v.toLowerCase(),
    k,
  ])
);

/** Builds the stored `reason` text: "[Label · r1; r2]\ncomment". */
export function encodeReason(
  kind: FeedbackKind,
  reasons: string[],
  comment: string
): string {
  const tag =
    reasons.length > 0
      ? `[${KIND_LABEL[kind]} · ${reasons.join("; ")}]`
      : `[${KIND_LABEL[kind]}]`;
  const body = comment.trim();
  return body ? `${tag}\n${body}` : tag;
}

/** Reverses `encodeReason`, falling back gracefully for older rows. */
export function parseReason(
  reason: string | null | undefined,
  feedbackType: string | null | undefined
): { kind: FeedbackKind; reasons: string[]; comment: string } {
  const text = (reason ?? "").trim();
  const match = text.match(/^\[([^\]·]+?)(?:\s*·\s*([^\]]*))?\]\s*/);

  if (match) {
    const kind = KIND_BY_LABEL.get(match[1].trim().toLowerCase());
    if (kind) {
      const reasons = (match[2] ?? "")
        .split(";")
        .map((r) => r.trim())
        .filter(Boolean);
      return { kind, reasons, comment: text.slice(match[0].length).trim() };
    }
  }

  return {
    kind: feedbackType === "like" ? "accurate" : "needs_revision",
    reasons: [],
    comment: text,
  };
}

export function normalizeName(value: string | null | undefined): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function rowToEntry(row: FeedbackRow): FeedbackEntry {
  const parsed = parseReason(row.reason, row.feedback_type);
  const stamp = row.updated_at ?? row.created_at;
  return {
    key: String(row.id),
    id: row.id,
    domain: row.domain ?? "",
    subdomain: row.subdomain ?? "",
    ...parsed,
    reporterId: row.reported_by ?? null,
    reporterEmail: row.reporter_email ?? null,
    reviewStatus: (row.status as ReviewStatus) ?? "open",
    savedAt: stamp ? new Date(stamp).getTime() : null,
    sync: "saved",
  };
}

/* ------------------------------------------------------------------ */
/* Display helpers                                                     */
/* ------------------------------------------------------------------ */

/** "just now", "2 minutes ago", "3 hours ago", or "12 Sep 2026". */
export function timeAgo(ms: number, now: number): string {
  const seconds = Math.max(0, Math.round((now - ms) / 1000));
  if (seconds < 45) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return `on ${formatDate(ms)}`;
}

/** Unambiguous date, e.g. "4 October 2026". */
export function formatDate(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export type FeedbackDraft = {
  kind: FeedbackKind | null;
  reasons: string[];
  comment: string;
  /** Key of the list entry created by the last submit, if it failed. */
  pendingKey?: string;
};
