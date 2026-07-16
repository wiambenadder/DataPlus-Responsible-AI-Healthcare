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
  const [submittedType, setSubmittedType] = useState<FeedbackType | null>(null);
  const [reason, setReason] = useState("");
  const [savedReason, setSavedReason] = useState("");
  const [feedbackId, setFeedbackId] = useState<string | number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasSavedFeedback = feedbackId !== null;
  const hasUnsavedChanges =
    pendingType !== submittedType || reason.trim() !== savedReason;

  function openNoteFor(type: FeedbackType) {
    setError(null);
    setPendingType(type);
  }

  function cancelNote() {
    setError(null);

    if (hasSavedFeedback && submittedType) {
      setPendingType(submittedType);
      setReason(savedReason);
      return;
    }

    setPendingType(null);
    setReason("");
  }

  async function submitFeedback() {
    if (!pendingType) return;

    const trimmedReason = reason.trim();

    if (!trimmedReason) {
      setError("Please add a short note explaining your feedback.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    let data = null;
    let saveError = null;

    if (feedbackId) {
      const result = await supabase
        .from("feedback")
        .update({
          feedback_type: pendingType,
          reason: trimmedReason,
        })
        .eq("id", feedbackId)
        .select()
        .single();

      data = result.data;
      saveError = result.error;
    } else {
      const result = await supabase
        .from("feedback")
        .insert({
          company_id: companyId,
          company_name: companyName ?? null,
          question,
          domain,
          subdomain,
          answer,
          feedback_type: pendingType,
          reason: trimmedReason,
          reported_by: user?.id ?? null,
          reporter_email: user?.email ?? null,
        })
        .select()
        .single();

      data = result.data;
      saveError = result.error;
    }

    if (saveError || !data) {
      setSubmitting(false);
      console.error("Feedback save error:", saveError);
      setError(saveError?.message || "Something went wrong submitting your feedback. Please try again.");
      return;
    }

    fetch("/api/feedback/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feedbackId: data.id }),
    }).catch(() => {});

    setSubmitting(false);
    setFeedbackId(data.id);
    setSubmittedType(pendingType);
    setSavedReason(trimmedReason);
    setReason(trimmedReason);
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

      {hasSavedFeedback && !hasUnsavedChanges ? (
        <div className="mt-3 rounded-2xl border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
          Thank you — your feedback was recorded.
        </div>
      ) : null}

      {pendingType ? (
        <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">
            {hasSavedFeedback ? "Your feedback" : "Why? (required)"}
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

          {hasSavedFeedback && submittedType ? (
            <p className="mt-2 text-xs font-medium text-slate-500">
              Saved feedback: {submittedType === "like" ? "👍 Like" : "👎 Dislike"}
            </p>
          ) : null}

          {error ? (
            <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>
          ) : null}

          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              disabled={submitting}
              onClick={submitFeedback}
              className="rounded-full bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting
                ? "Submitting..."
                : hasSavedFeedback
                ? "Update feedback"
                : "Submit feedback"}
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