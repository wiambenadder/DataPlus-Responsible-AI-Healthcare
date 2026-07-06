"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";

type FeedbackType = "like" | "dislike";

type FeedbackButtonsProps = {
  companyId: string;
  companyName?: string | null;
  question: string | null;
  domain: string;
  subdomain: string;
  answer: string | null;
};

export default function FeedbackButtons({
  companyId,
  companyName,
  question,
  domain,
  subdomain,
  answer,
}: FeedbackButtonsProps) {
  const [pendingType, setPendingType] = useState<FeedbackType | null>(null);
  const [reason, setReason] = useState("");
  const [submittedType, setSubmittedType] = useState<FeedbackType | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openNoteFor(type: FeedbackType) {
    setError(null);
    setPendingType(type);
  }

  function cancelNote() {
    setPendingType(null);
    setReason("");
    setError(null);
  }

  async function submitFeedback() {
    if (!pendingType) return;

    if (!reason.trim()) {
      setError("Please add a short note explaining your feedback.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error: insertError } = await supabase
      .from("feedback")
      .insert({
        company_id: companyId,
        company_name: companyName ?? null,
        question,
        domain,
        subdomain,
        answer,
        feedback_type: pendingType,
        reason: reason.trim(),
        reported_by: user?.id ?? null,
        reporter_email: user?.email ?? null,
      })
      .select()
      .single();

    if (insertError || !data) {
      setSubmitting(false);
      setError("Something went wrong submitting your feedback. Please try again.");
      return;
    }

    // Fire-and-forget the email notification. The feedback row is already
    // saved, so a failed email shouldn't block or error out the UI.
    fetch("/api/feedback/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feedbackId: data.id }),
    }).catch(() => {});

    setSubmitting(false);
    setSubmittedType(pendingType);
    setPendingType(null);
    setReason("");
  }

  if (submittedType) {
    return (
      <div className="mt-3 text-sm font-medium text-slate-500">
        Thanks — your {submittedType === "like" ? "positive" : "negative"} feedback was recorded.
      </div>
    );
  }

  return (
    <div className="mt-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => openNoteFor("like")}
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
            pendingType === "like"
              ? "border-green-600 bg-green-50 text-green-700"
              : "border-slate-200 text-slate-500 hover:border-green-300 hover:text-green-700"
          }`}
        >
          👍 Like
        </button>
        <button
          type="button"
          onClick={() => openNoteFor("dislike")}
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
            pendingType === "dislike"
              ? "border-red-600 bg-red-50 text-red-700"
              : "border-slate-200 text-slate-500 hover:border-red-300 hover:text-red-700"
          }`}
        >
          👎 Dislike
        </button>
      </div>

      {pendingType ? (
        <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">
            Why? (required)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder={
              pendingType === "like"
                ? "What made this assessment accurate or useful?"
                : "What's inaccurate or missing about this assessment?"
            }
            className="w-full resize-none rounded-xl border border-slate-200 bg-white p-2.5 text-sm text-slate-700 focus:border-blue-400 focus:outline-none"
          />
          {error ? <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p> : null}
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              disabled={submitting}
              onClick={submitFeedback}
              className="rounded-full bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit feedback"}
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={cancelNote}
              className="rounded-full border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-500 hover:bg-white"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
