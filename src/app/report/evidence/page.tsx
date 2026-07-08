"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type EvidenceRow = {
  id: string;
  question: string;
  answer: string;
  domain: string;
  Subtopic: string;
  reporting_period: string;
};

// Must match the prefix used in the report page's isExtractedFromDocument().
// Keep these in sync — ideally both pull from a single shared constant/util.
const EXTRACTED_EVIDENCE_PREFIX = "evidence extracted";

function isExtractedFromDocument(question: string | null | undefined) {
  if (!question) return false;
  return question.trim().toLowerCase().startsWith(EXTRACTED_EVIDENCE_PREFIX);
}

export default function EditEvidencePage() {
  const router = useRouter();

  const [companyId, setCompanyId] = useState("");
  const [reportingPeriod, setReportingPeriod] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [rows, setRows] = useState<EvidenceRow[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [originalAnswers, setOriginalAnswers] = useState<string[]>([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", user.id)
      .single();

    if (!profile) {
      router.push("/company-setup");
      return;
    }

    setCompanyId(profile.company_id);

    const { data, error } = await supabase
      .from("qualitative_responses")
      .select("id, question, answer, domain, Subtopic, reporting_period")
      .eq("company_id", profile.company_id);

    if (error) {
      console.error("Error loading evidence rows:", error);
      setLoading(false);
      return;
    }

    const evidenceRows = ((data || []) as EvidenceRow[]).filter((r) =>
      isExtractedFromDocument(r.question)
    );

    setRows(evidenceRows);
    setAnswers(evidenceRows.map((r) => r.answer ?? ""));
    setOriginalAnswers(evidenceRows.map((r) => r.answer ?? ""));

    if (evidenceRows[0]) {
      setReportingPeriod(evidenceRows[0].reporting_period);
    }

    setLoading(false);
  }

  function updateAnswer(index: number, value: string) {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  async function handleSave() {
    if (saving) return;

    const changedIndexes = answers
      .map((answer, i) => (answer !== originalAnswers[i] ? i : -1))
      .filter((i) => i !== -1);

    if (changedIndexes.length === 0) {
      router.push("/dashboard");
      return;
    }

    setSaving(true);

    try {
      for (const i of changedIndexes) {
        const { error: updateError } = await supabase
          .from("qualitative_responses")
          .update({ answer: answers[i] })
          .eq("id", rows[i].id);

        if (updateError) {
          alert(updateError.message);
          return;
        }
      }

      // Scope re-assessment to only the evidence entries that actually
      // changed. Same NOTE as the interview edit flow: /api/run-ai-assessment
      // and /api/bullet-points need to read this `subtopics` field and only
      // reprocess matching rows for this to actually save work.
      const changedTopics = changedIndexes.map((i) => ({
        domain: rows[i].domain,
        subtopic: rows[i].Subtopic,
      }));

      await Promise.all([
        fetch("/api/run-ai-assessment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reporting_period: reportingPeriod,
            company_id: companyId,
            subtopics: changedTopics,
          }),
        }),
        fetch("/api/bullet-points", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reporting_period: reportingPeriod,
            company_id: companyId,
            subtopics: changedTopics,
          }),
        }),
      ]);

      router.push("/dashboard");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-slate-50">
        <div className="flex items-center gap-3 text-slate-500">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
          Loading evidence...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-3xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-2">Edit Extracted Evidence</h1>

        <p className="text-gray-500 mb-8">
          Review and correct the evidence pulled from your uploaded documents.
          Only changed entries will be re-assessed when you save.
        </p>

        {rows.length === 0 ? (
          <div className="bg-white border rounded-2xl shadow-sm p-8 text-center text-gray-500">
            No extracted evidence found for this submission.
          </div>
        ) : (
          <div className="space-y-6">
            {rows.map((row, i) => (
              <div
                key={row.id}
                className="bg-white rounded-2xl border shadow-sm p-6"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-blue-600">
                    {row.domain}
                  </span>
                  <span className="text-sm text-gray-400">{row.Subtopic}</span>
                </div>

                <div className="text-sm text-gray-500 mb-3 italic">
                  {row.question}
                </div>

                <textarea
                  value={answers[i] ?? ""}
                  onChange={(e) => updateAnswer(i, e.target.value)}
                  className="w-full h-32 border rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}

            <div className="flex justify-between">
              <button
                onClick={() => router.push("/dashboard")}
                className="border px-6 py-3 rounded-xl"
              >
                Cancel
              </button>

              <button
                disabled={saving}
                onClick={handleSave}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}