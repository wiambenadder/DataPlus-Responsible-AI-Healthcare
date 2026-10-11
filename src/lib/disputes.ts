import { supabase } from "@/lib/supabase";
import { parseReason } from "@/lib/feedback-format";

type FbRow = {
  subdomain: string | null;
  feedback_type: string | null;
  reason: string | null;
  status: string | null;
  created_at?: string | null;
};

/**
 * Practices someone on the team has reported as resting on the wrong
 * source or company, and that haven't been reviewed yet. They are not
 * counted as met anywhere (home, results, roadmap) until the report is
 * resolved, so every page agrees.
 *
 * Returns lower-cased practice names, plus the number of comments left in
 * the last seven days (shown on the home page).
 */
export async function fetchFeedbackSummary(companyId: string): Promise<{
  disputed: Set<string>;
  commentsThisWeek: number;
}> {
  const { data } = await supabase
    .from("feedback")
    .select("subdomain, feedback_type, reason, status, created_at")
    .eq("company_id", companyId);

  const rows = (data ?? []) as FbRow[];
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  return {
    disputed: new Set(
      rows
        .filter(
          (f) =>
            (f.status ?? "open") === "open" &&
            parseReason(f.reason, f.feedback_type).kind === "wrong_source"
        )
        .map((f) => String(f.subdomain ?? "").trim().toLowerCase())
    ),
    commentsThisWeek: rows.filter(
      (f) => f.created_at && new Date(f.created_at).getTime() >= weekAgo
    ).length,
  };
}
