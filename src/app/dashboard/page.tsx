"use client";

import React from "react";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { FRAMEWORK } from "@/lib/framework";
import FeedbackButtons from "@/_components/feedback/FeedbackButtons";
import jsPDF from "jspdf";

type ResponseRow = {
  id: string;
  domain: string | null;
  Subtopic: string;
  ai_assessment: string | null;
  ai_reasoning: string | null;
  question: string | null;
  answer: string | null;
  bullet_point_summary: string | null;
  reporting_period: string | null;
};

// Rows created from document extraction store a question that starts with
// this prefix (e.g. "Evidence extracted from uploaded report..."). Those
// rows show the bullet-point summary; rows sourced from an actual interview
// question show the user's raw typed answer instead.
const EXTRACTED_EVIDENCE_PREFIX = "evidence extracted";

function isExtractedFromDocument(question: string | null | undefined) {
  if (!question) return false;
  return question.trim().toLowerCase().startsWith(EXTRACTED_EVIDENCE_PREFIX);
}

function isPracticed(status: string | null) {
  return status === "Practiced";
}

function getDisplayStatus(status: string | null) {
  switch (status) {
    case "Practiced":
      return "Practiced";

    case "Not Practiced":
      return "Not Practiced";

    default:
      return "Not Yet Assessed";
  }
}

function getPercentage(practiced: number, total: number) {
  if (total === 0) return 0;
  return Math.round((practiced / total) * 100);
}

function getBadgeColor(status: string | null) {
  switch (status) {
    case "Practiced":
      return "bg-green-100 text-green-700 ring-1 ring-green-200";

    case "Not Practiced":
      return "bg-red-100 text-red-700 ring-1 ring-red-200";

    default:
      return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
  }
}

function getPercentageColor(percentage: number) {
  if (percentage >= 75) return "text-green-600";
  if (percentage >= 40) return "text-yellow-600";
  return "text-red-600";
}

/**
 * Parses a bullet_point_summary string into an array of clean bullet lines.
 * Handles newline-separated bullets and strips any leading bullet markers
 * (-, •, *, or "1.") that may already be present in the stored text.
 */
function parseBullets(summary: string | null | undefined): string[] {
  if (!summary) return [];
  return summary
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^[-•*]\s*|^\d+[.)]\s*/, "").trim())
    .filter(Boolean);
}

/**
 * Builds a full PDF report with every domain/subtopic "expanded" —
 * justification, question, response, and reporting period, and scores —
 * so it can be shared with someone without them needing the dashboard.
 */
function generatePDFReport(
  domainEntries: [string, string[]][],
  responses: ResponseRow[]
) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const maxWidth = pageWidth - margin * 2;
  let y = margin;

  function ensureSpace(lineHeight: number) {
    if (y + lineHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  }

  function addText(
    text: string,
    fontSize: number,
    style: "normal" | "bold" = "normal",
    color: string = "#1e293b"
  ) {
    doc.setFont("helvetica", style);
    doc.setFontSize(fontSize);
    doc.setTextColor(color);
    const lines = doc.splitTextToSize(text, maxWidth) as string[];
    for (const line of lines) {
      ensureSpace(fontSize * 1.4);
      doc.text(line, margin, y);
      y += fontSize * 1.4;
    }
  }

  function addBulletList(
    bullets: string[],
    fontSize: number,
    color: string = "#475569"
  ) {
    const bulletIndent = 12;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(fontSize);
    doc.setTextColor(color);
    for (const bullet of bullets) {
      const lines = doc.splitTextToSize(
        bullet,
        maxWidth - bulletIndent
      ) as string[];
      lines.forEach((line, idx) => {
        ensureSpace(fontSize * 1.4);
        const prefix = idx === 0 ? "•  " : "   ";
        doc.text(prefix + line, margin, y);
        y += fontSize * 1.4;
      });
    }
  }

  function addDivider() {
    ensureSpace(10);
    doc.setDrawColor("#e2e8f0");
    doc.line(margin, y, pageWidth - margin, y);
    y += 14;
  }

  const allSubtopics = domainEntries.flatMap(([, subtopics]) => subtopics);
  const overallPracticedCount = allSubtopics.filter((subtopic) => {
    const row = responses.find((r) => r.Subtopic === subtopic);
    return isPracticed(row?.ai_assessment ?? null);
  }).length;
  const overallPercentage = getPercentage(
    overallPracticedCount,
    allSubtopics.length
  );

  // --- Title block ---
  addText("AI Readiness Assessment Report", 20, "bold");
  y += 4;
  addText(
    `Generated: ${new Date().toLocaleDateString()}`,
    10,
    "normal",
    "#64748b"
  );
  y += 12;
  addText(
    `Overall Score: ${overallPercentage}% (${overallPracticedCount} of ${allSubtopics.length} topics practiced)`,
    12,
    "bold"
  );
  y += 18;

  // --- Each domain ---
  for (const [domain, subtopics] of domainEntries) {
    const practiced = subtopics.filter((subtopic) => {
      const row = responses.find((r) => r.Subtopic === subtopic);
      return isPracticed(row?.ai_assessment ?? null);
    }).length;
    const percent = getPercentage(practiced, subtopics.length);

    ensureSpace(34);
    doc.setFillColor("#eff6ff");
    doc.rect(margin, y - 4, maxWidth, 26, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor("#1d4ed8");
    doc.text(
      `${domain}  —  ${percent}% (${practiced}/${subtopics.length})`,
      margin + 6,
      y + 13
    );
    y += 32;

    for (const subtopic of subtopics) {
      const row = responses.find((r) => r.Subtopic === subtopic);
      const status = getDisplayStatus(row?.ai_assessment ?? null);
      const statusColor =
        status === "Practiced"
          ? "#15803d"
          : status === "Not Practiced"
          ? "#b91c1c"
          : "#475569";

      ensureSpace(20);
      addText(subtopic, 12, "bold", "#0f172a");
      addText(`Status: ${status}`, 10, "bold", statusColor);
      y += 4;

      addText("AI Justification", 10, "bold", "#334155");
      addText(
        row?.ai_reasoning || "No assessment available yet.",
        10,
        "normal",
        "#475569"
      );
      y += 4;

      addText("Source Question", 10, "bold", "#334155");
      addText(
        row?.question || "No source question available.",
        10,
        "normal",
        "#475569"
      );
      y += 4;

      // Extracted-evidence rows show the bullet-point summary; rows from an
      // actual interview question show the user's raw typed answer.
      const fromDocument = isExtractedFromDocument(row?.question);

      if (fromDocument) {
        addText("Summary Response", 10, "bold", "#334155");
        const bullets = parseBullets(row?.bullet_point_summary);
        if (bullets.length > 0) {
          addBulletList(bullets, 10);
        } else {
          addText("No response available.", 10, "normal", "#475569");
        }
      } else {
        addText("Original Response", 10, "bold", "#334155");
        addText(
          row?.answer || "No response available.",
          10,
          "normal",
          "#475569"
        );
      }
      y += 4;

      addText(
        `Reporting Period: ${row?.reporting_period || "N/A"}`,
        10,
        "normal",
        "#64748b"
      );
      y += 10;

      addDivider();
    }

    y += 8;
  }

  doc.save(`AI-Readiness-Assessment-${new Date().toISOString().slice(0, 10)}.pdf`);
}

export default function DashboardPage() {
  const [responses, setResponses] = useState<ResponseRow[]>([]);
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>(
    {}
  );
  const [activeDomain, setActiveDomain] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null); // NEW
  const [exporting, setExporting] = useState(false); // NEW

  const domainEntries = useMemo(
    () => Object.entries(FRAMEWORK) as [string, string[]][],
    []
  );

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
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

    setCompanyId(profile.company_id); // NEW

    const { data } = await supabase
      .from("qualitative_responses")
      .select("*")
      .eq("company_id", profile.company_id);

    const rows = (data || []) as ResponseRow[];
    setResponses(rows);

    if (!activeDomain && domainEntries.length > 0) {
      setActiveDomain(domainEntries[0][0]);
    }

    setLoading(false);
  }

  function toggleTopic(id: string) {
    setExpandedTopics((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }

  // NEW: export handler
  async function handleExport() {
    if (exporting || responses.length === 0) return;
    setExporting(true);
    try {
      generatePDFReport(domainEntries, responses);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
    } finally {
      setExporting(false);
    }
  }

  const allSubtopics = domainEntries.flatMap(([, subtopics]) => subtopics);

  const overallPracticedCount = allSubtopics.filter((subtopic) => {
    const row = responses.find((response) => response.Subtopic === subtopic);
    return isPracticed(row?.ai_assessment ?? null);
  }).length;

  const overallPercentage = getPercentage(
    overallPracticedCount,
    allSubtopics.length
  );

  const selectedDomainSubtopics =
    domainEntries.find(([domain]) => domain === activeDomain)?.[1] || [];

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="flex items-center gap-3 text-slate-500">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
          Loading dashboard...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                Assessment dashboard
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                AI Readiness Dashboard
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Review progress across domains, inspect subtopics, and explore
                the source reasoning behind each assessment.
              </p>
            </div>

            {/* NEW: export button */}
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting || responses.length === 0}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {exporting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Export Assessment
                </>
              )}
            </button>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-medium text-slate-500">
            Overall Topics Practiced
          </p>
          <div className="mt-3 flex items-end gap-3">
            <span
              className={`text-5xl font-bold tracking-tight sm:text-6xl ${getPercentageColor(
                overallPercentage
              )}`}
            >
              {overallPercentage}%
            </span>
            <span className="pb-2 text-sm text-slate-500">
              {overallPracticedCount} of {allSubtopics.length} topics
            </span>
          </div>
        </section>

       <div className="grid grid-cols-5 gap-3">
          {domainEntries.map(([domain, subtopics]) => {
            const practiced = subtopics.filter((subtopic) => {
              const row = responses.find(
                (response) => response.Subtopic === subtopic
              );
              return isPracticed(row?.ai_assessment ?? null);
            }).length;

            const percent = getPercentage(practiced, subtopics.length);
            const isActive = activeDomain === domain;

            return (
              <button
                key={domain}
                type="button"
                onClick={() => setActiveDomain(domain)}
                className={`rounded-2xl border bg-white p-5 text-left shadow-sm transition ${
                  isActive
                    ? "border-blue-600 ring-4 ring-blue-600/10"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="text-sm font-medium text-slate-500">
                  {domain}
                </div>
                <div
                  className={`mt-2 text-4xl font-bold tracking-tight ${getPercentageColor(
                    percent
                  )}`}
                >
                  {percent}%
                </div>
                <div className="mt-2 text-sm text-slate-500">
                  {practiced} of {subtopics.length} practiced
                </div>
              </button>
            );
          })}
        </div>

        {activeDomain ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex flex-col gap-2 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">
                  {activeDomain}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Expand each subtopic to review justification, question,
                  response, and reporting period.
                </p>
              </div>
              <div className="text-sm text-slate-500">
                {selectedDomainSubtopics.length} subtopics
              </div>
            </div>

            <div className="space-y-3">
              {selectedDomainSubtopics.map((subtopic) => {
                const row = responses.find(
                  (response) => response.Subtopic === subtopic
                );
                const isOpen = !!expandedTopics[subtopic];
                const displayStatus = getDisplayStatus(
                  row?.ai_assessment ?? null
                );
                const fromDocument = isExtractedFromDocument(row?.question);
                const bullets = fromDocument
                  ? parseBullets(row?.bullet_point_summary)
                  : [];

                return (
                  <article
                    key={subtopic}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/40"
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => toggleTopic(subtopic)}
                      className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left sm:px-5"
                    >
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold text-slate-900">
                          {subtopic}
                        </h3>
                      </div>

                      <div className="flex shrink-0 items-center gap-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getBadgeColor(
                            row?.ai_assessment ?? null
                          )}`}
                        >
                          {displayStatus}
                        </span>
                        <span className="grid h-8 w-8 place-items-center rounded-full border border-slate-200 bg-white text-slate-600">
                          {isOpen ? "−" : "+"}
                        </span>
                      </div>
                    </button>

                    {isOpen ? (
                      <div className="border-t border-slate-200 bg-white p-4 sm:p-5">
                        <div className="grid gap-4 lg:grid-cols-2">
                          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <div className="mb-2 text-sm font-semibold text-slate-900">
                              AI Justification
                            </div>
                            <div className="text-sm leading-6 text-slate-600">
                              {row?.ai_reasoning || "No assessment available yet."}
                            </div>
                          </div>

                          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <div className="mb-2 text-sm font-semibold text-slate-900">
                              Source Question
                            </div>
                            <div className="text-sm leading-6 text-slate-600">
                              {row?.question || "No source question available."}
                            </div>
                          </div>

                          <div className="rounded-2xl border border-slate-200 bg-white p-4 lg:col-span-2">
                            <div className="mb-2 text-sm font-semibold text-slate-900">
                              {fromDocument
                                ? "Summary Response"
                                : "Original Response"}
                            </div>
                            {fromDocument ? (
                              bullets.length > 0 ? (
                                <ul className="list-disc space-y-1.5 border-l-4 border-blue-500 pl-8 text-sm leading-6 text-slate-600">
                                  {bullets.map((bullet, idx) => (
                                    <li key={idx}>{bullet}</li>
                                  ))}
                                </ul>
                              ) : (
                                <div className="border-l-4 border-blue-500 pl-4 text-sm leading-6 text-slate-600">
                                  No response available.
                                </div>
                              )
                            ) : (
                              <div className="border-l-4 border-blue-500 pl-4 text-sm leading-6 text-slate-600">
                                {row?.answer || "No response available."}
                              </div>
                            )}
                          </div>

                          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:col-span-2">
                            <div className="mb-2 text-sm font-semibold text-slate-900">
                              Reporting Period
                            </div>
                            <div className="text-sm leading-6 text-slate-600">
                              {row?.reporting_period || "N/A"}
                            </div>
                          </div>

                          {/* NEW: feedback */}
                          {companyId && activeDomain ? (
                            <div className="rounded-2xl border border-slate-200 bg-white p-4 lg:col-span-2">
                              <div className="mb-1 text-sm font-semibold text-slate-900">
                                Was this assessment accurate?
                              </div>
                              <FeedbackButtons
                                companyId={companyId}
                                question={row?.question ?? null}
                                domain={activeDomain}
                                subdomain={subtopic}
                                answer={row?.answer ?? null}
                              />
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}