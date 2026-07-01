"use client";

import React from "react";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { FRAMEWORK } from "@/lib/framework";

type ResponseRow = {
  id: string;
  domain: string | null;
  Subtopic: string;
  ai_assessment: string | null;
  ai_reasoning: string | null;
  question: string | null;
  answer: string | null;
  reporting_period: string | null;
};

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

export default function DashboardPage() {
  const [responses, setResponses] = useState<ResponseRow[]>([]);
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>(
    {}
  );
  const [activeDomain, setActiveDomain] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Assessment dashboard
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            AI Readiness Dashboard
          </h1>
               
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Review progress across domains, inspect subtopics, and explore the
            source reasoning behind each assessment.
          </p>
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
                              Original Response
                            </div>
                            <div className="border-l-4 border-blue-500 pl-4 text-sm leading-6 text-slate-600">
                              {row?.answer || "No response available."}
                            </div>
                          </div>

                          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:col-span-2">
                            <div className="mb-2 text-sm font-semibold text-slate-900">
                              Reporting Period
                            </div>
                            <div className="text-sm leading-6 text-slate-600">
                              {row?.reporting_period || "N/A"}
                            </div>
                          </div>
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
