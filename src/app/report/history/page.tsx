"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

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
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="flex items-center gap-3 text-slate-500">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
          Loading history...
        </div>
      </main>
    );
  }

  const periods = Object.keys(interviewReports).sort().reverse();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6">
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 mb-2">
            Assessment
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Report History
          </h1>
        </div>

        {/*
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">
            Background Report History
          </h2>

          <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
            <button
              onClick={() => setBackgroundOpen(!backgroundOpen)}
              className="w-full p-5 flex justify-between items-center text-left"
            >
              <div>
                <div className="font-semibold text-lg">
                  Company Background
                </div>

                <div className="text-sm text-gray-500">
                  {backgroundRows.length} responses
                </div>
              </div>

              <div className="text-xl">{backgroundOpen ? "−" : "+"}</div>
            </button>

            {backgroundOpen && (
              <div className="border-t p-5">
                {backgroundRows.length === 0 ? (
                  <p className="text-gray-500">
                    No background report submitted yet.
                  </p>
                ) : (
                  backgroundRows.map((row) => (
                    <EditableBackgroundResponse
                      key={row.id}
                      row={row}
                      onSave={saveBackgroundResponse}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        </div>
        */}

        {/* Consistent, generous gap between the two major sections below. */}
        <div className="space-y-10">
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">
              Interview Report History
            </h2>

            {periods.length === 0 && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm text-slate-500">
                No interview reports found.
              </div>
            )}

            <div className="space-y-4">
              {periods.map((period) => (
                <div
                  key={period}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                >
                  <button
                    onClick={() =>
                      setOpenInterview((prev) => ({
                        ...prev,
                        [period]: !prev[period],
                      }))
                    }
                    className="flex w-full items-center justify-between gap-4 p-5 text-left"
                  >
                    <div>
                      <div className="font-semibold text-lg text-slate-900">
                        {period}
                      </div>

                      <div className="text-sm text-slate-500">
                        {interviewReports[period].length} responses
                      </div>
                    </div>

                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-slate-600">
                      {openInterview[period] ? "−" : "+"}
                    </span>
                  </button>

                  {openInterview[period] && (
                    <div className="border-t border-slate-200 p-5">
                      {interviewReports[period].map((row) => (
                        <div
                          key={row.id}
                          className="border-b border-slate-100 pb-5 mb-5 last:border-b-0 last:mb-0 last:pb-0"
                        >
                          {(row.domain || row.Subtopic) && (
                            <div className="text-sm text-slate-500 mb-2">
                              {row.domain}
                              {row.domain && row.Subtopic && " • "}
                              {row.Subtopic}
                            </div>
                          )}

                          <div className="font-medium text-slate-900 mb-2">
                            {row.question}
                          </div>

                          <div className="text-slate-700 whitespace-pre-wrap mb-4">
                            {row.answer}
                          </div>

                          {(row.ai_assessment || row.ai_reasoning) && (
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                              <div className="font-medium text-slate-900 mb-1">
                                AI Assessment
                              </div>

                              <div className="mb-3 text-slate-700">
                                {row.ai_assessment || "Pending"}
                              </div>

                              <div className="font-medium text-slate-900 mb-1">
                                AI Reasoning
                              </div>

                              <div className="text-slate-700">
                                {row.ai_reasoning || "No reasoning yet."}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">
              Uploaded Documents
            </h2>

            {uploads.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm text-slate-500">
                No uploaded documents.
              </div>
            ) : (
              <div className="space-y-4">
                {uploads.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div>
                      <div className="text-lg font-semibold text-slate-900">
                        📄 {file.file_name}
                      </div>

                      <div className="mt-2 text-sm text-slate-500">
                        PDF Document
                      </div>

                      <div className="mt-1 text-xs text-slate-400">
                        Uploaded{" "}
                        {file.created_at &&
                          new Date(file.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <a
                      href={
                        supabase.storage
                          .from("reports")
                          .getPublicUrl(file.file_url).data.publicUrl
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                    >
                      View PDF
                    </a>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}