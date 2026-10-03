/**
 * Feedback on assessment results — database calls from the browser.
 * Formatting/parsing lives in ./feedback-format (see the notes there on
 * how the existing `feedback` table is used without a migration).
 */

import { supabase } from "@/lib/supabase";
import {
  encodeReason,
  rowToEntry,
  type FeedbackEntry,
  type FeedbackKind,
  type FeedbackRow,
} from "@/lib/feedback-format";

export * from "@/lib/feedback-format";

/* ------------------------------------------------------------------ */
/* Database calls                                                      */
/* ------------------------------------------------------------------ */

export async function fetchCompanyFeedback(
  companyId: string
): Promise<FeedbackEntry[]> {
  const { data, error } = await supabase
    .from("feedback")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return ((data ?? []) as FeedbackRow[]).map(rowToEntry);
}


export async function insertFeedback(args: {
  companyId: string;
  companyName: string | null;
  domain: string;
  subdomain: string;
  question: string | null;
  answer: string | null;
  kind: FeedbackKind;
  reasons: string[];
  comment: string;
}): Promise<FeedbackRow> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("feedback")
    .insert({
      company_id: args.companyId,
      company_name: args.companyName,
      domain: args.domain,
      subdomain: args.subdomain,
      question: args.question,
      answer: args.answer,
      feedback_type: args.kind === "accurate" ? "like" : "dislike",
      reason: encodeReason(args.kind, args.reasons, args.comment),
      reported_by: user?.id ?? null,
      reporter_email: user?.email ?? null,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message || "The server did not confirm the save.");
  }

  // Email the team; never block or fail the save on this.
  fetch("/api/feedback/notify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ feedbackId: (data as FeedbackRow).id }),
  }).catch(() => {});

  return data as FeedbackRow;
}

export async function updateFeedback(
  id: string | number,
  kind: FeedbackKind,
  reasons: string[],
  comment: string
): Promise<FeedbackRow> {
  const { data, error } = await supabase
    .from("feedback")
    .update({
      feedback_type: kind === "accurate" ? "like" : "dislike",
      reason: encodeReason(kind, reasons, comment),
    })
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    throw new Error(
      error?.message ||
        "The change wasn't saved. You may not have permission to edit this."
    );
  }
  return data as FeedbackRow;
}

export async function deleteFeedback(id: string | number): Promise<void> {
  // `.select()` makes Supabase return the deleted rows, so a delete that
  // row-level security silently blocked is reported instead of looking
  // like a success.
  const { data, error } = await supabase
    .from("feedback")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) throw new Error(error.message);
  if (!data || data.length === 0) {
    throw new Error(
      "The feedback wasn't deleted. You may not have permission to delete it."
    );
  }
}
