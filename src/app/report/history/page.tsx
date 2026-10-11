"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import OpenFileButton from "@/_components/assessment/OpenFileButton";
import Link from "next/link";

type InterviewRow = {
  id: string;
  reporting_period: string | null;
  question: string;
  answer: string;
  domain: string | null;
  Subtopic: string | null;
  ai_assessment: string | null;
  ai_reasoning: string | null;
};

type BackgroundRow = {
  id: string;
  section: string | null;
  question: string;
  answer: string;
};

type UploadRow = {
  id: string;
  file_name: string;
  file_type: string | null;
  file_url: string;
  created_at: string | null;
};

function EditableBackgroundResponse({
  row,
  onSave,
}: {
  row: BackgroundRow;
  onSave: (id: string, answer: string) => void;
}) {
  const [answer, setAnswer] = useState(row.answer || "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave(row.id, answer);
    setSaving(false);
  }

  return (
    <div className="border-b border-slate-100 last:border-b-0 py-5">
      {row.section && (
        <div className="text-sm font-medium text-blue-600 mb-2">
          {row.section}
        </div>
      )}

      <div className="font-medium text-slate-900 mb-3">{row.question}</div>

      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        className="w-full h-32 resize-none rounded-xl border border-slate-200 p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-3 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}

export default function HistoryPage() {
  const [loading, setLoading] = useState(true);
  const [backgroundRows, setBackgroundRows] = useState<BackgroundRow[]>([]);
  const [uploads, setUploads] = useState<UploadRow[]>([]);

  const [interviewReports, setInterviewReports] = useState<
    Record<string, InterviewRow[]>
  >({});
  const [backgroundOpen, setBackgroundOpen] = useState(false);
  const [openInterview, setOpenInterview] = useState<Record<string, boolean>>(
    {}
  );

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", user.id)
      .single();

    if (!profile) {
      setLoading(false);
      return;
    }

    const { data: backgroundData } = await supabase
      .from("company_background_reports")
      .select("*")
      .eq("company_id", profile.company_id);

    setBackgroundRows(backgroundData || []);

    const { data: interviewData } = await supabase
      .from("qualitative_responses")
      .select("*")
      .eq("company_id", profile.company_id);

    const filteredInterviewData = (interviewData || []).filter(
      (row: any) => !row.question?.startsWith("Evidence extracted from")
    );

    const { data: uploadData, error: uploadError } = await supabase
      .from("uploads")
      .select("*")
      .eq("company_id", profile.company_id);

    console.log(uploadData);
    console.log(uploadError);

    setUploads(uploadData || []);

    const grouped: Record<string, InterviewRow[]> = {};

    filteredInterviewData.forEach((row: any) => {
      const period = row.reporting_period || "Unknown Period";

      if (!grouped[period]) {
        grouped[period] = [];
      }

      grouped[period].push(row);
    });

    setInterviewReports(grouped);
    setLoading(false);
  }

  async function saveBackgroundResponse(id: string, answer: string) {
    const { error } = await supabase
      .from("company_background_reports")
      .update({ answer })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    setBackgroundRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, answer } : row))
    );

    alert("Background response saved");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-500">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
          Loading history...
        </div>
      </main>
    );
  }

  const periods = Object.keys(interviewReports).sort().reverse();

  const statusLabel = (v: string | null | undefined) => {
    const r = (v ?? "").trim().toLowerCase();
    if (r === "practiced") return "Meets criterion";
    if (r.startsWith("not")) return "Does not currently meet";
    return v ? v : "Not rated yet";
  };

  return (
    <div>
      <div className="border-b border-slate-200 bg-whisper">
        <div className="mx-auto max-w-5xl px-4 pb-8 pt-6 sm:px-6">
          <nav aria-label="Breadcrumb" className="text-sm text-slate-600">
            <Link href="/" className="hover:underline">Home</Link>
            <span className="mx-2" aria-hidden>›</span>
            <span>Your Submissions</span>
          </nav>
          <p className="label-caps mt-6">Submit Evidence</p>
          <h1 className="mt-2 text-4xl">Your Submissions</h1>
          <p className="mt-3 max-w-2xl text-[16px] text-slate-700">
            Everything your organization has sent so far: your answers by
            reporting period, and the documents you uploaded.{" "}
            <Link href="/report/assessment" className="font-semibold text-brand-dukeblue underline underline-offset-2">
              Edit your answers
            </Link>
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-12 px-4 py-10 sm:px-6">
        {/* The company background report section is switched off; see git history to restore it. */}

        <section aria-labelledby="answers-title">
          <h2 id="answers-title" className="text-3xl">Your Answers</h2>

          {periods.length === 0 ? (
            <p className="mt-4 text-slate-600">No answers submitted yet.</p>
          ) : (
            <div className="mt-4 divide-y divide-slate-200 border-y border-slate-200">
              {periods.map((period) => (
                <div key={period}>
                  <button
                    onClick={() =>
                      setOpenInterview((prev) => ({ ...prev, [period]: !prev[period] }))
                    }
                    aria-expanded={!!openInterview[period]}
                    className="flex w-full items-center justify-between gap-4 py-4 text-left hover:bg-slate-50"
                  >
                    <span>
                      <span className="block font-serif text-xl font-semibold text-brand-navy">{period}</span>
                      <span className="text-sm text-slate-600">
                        {interviewReports[period].length} answers
                      </span>
                    </span>
                    <span className="text-sm font-semibold text-brand-dukeblue">
                      {openInterview[period] ? "Hide" : "Show"}
                    </span>
                  </button>

                  {openInterview[period] && (
                    <div className="space-y-6 pb-6">
                      {interviewReports[period].map((row) => (
                        <div key={row.id} className="border-l-4 border-slate-200 pl-4">
                          {row.Subtopic && (
                            <p className="label-caps">
                              {row.domain} · {row.Subtopic}
                            </p>
                          )}
                          <p className="mt-1 font-semibold text-slate-900">{row.question}</p>
                          <p className="mt-1 whitespace-pre-wrap text-[15px] text-slate-800">{row.answer}</p>
                          {(row.ai_assessment || row.ai_reasoning) && (
                            <p className="mt-2 text-sm text-slate-600">
                              <span className="font-semibold text-slate-800">
                                Result: {statusLabel(row.ai_assessment)}.
                              </span>{" "}
                              {row.ai_reasoning}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section aria-labelledby="docs-title">
          <h2 id="docs-title" className="text-3xl">Uploaded Documents</h2>

          {uploads.length === 0 ? (
            <p className="mt-4 text-slate-600">No documents uploaded yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-slate-200 border-y border-slate-200">
              {uploads.map((file) => (
                <li key={file.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">{file.file_name}</p>
                    <p className="text-sm text-slate-600">
                      PDF
                      {file.created_at &&
                        ` · uploaded ${new Date(file.created_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}`}
                    </p>
                  </div>
                  {file.file_url ? (
                    <OpenFileButton path={file.file_url} className="btn btn-secondary">
                      Open PDF
                    </OpenFileButton>
                  ) : (
                    <span className="text-sm text-slate-600">File not available</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}