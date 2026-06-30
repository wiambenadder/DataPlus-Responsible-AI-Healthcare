"use client";

import Link from "next/link";
import type { ReactNode } from "react";

/* ---------- small helpers ---------- */

function statusChip(value?: string | null) {
  const v = (value ?? "").toLowerCase().trim();
  if (!v) return "border-slate-200 bg-slate-50 text-slate-500";
  if (
    v.includes("not ") ||
    v.startsWith("no") ||
    v.includes("missing") ||
    v.includes("partial") ||
    v.includes("weak")
  )
    return "border-amber-200 bg-amber-50 text-amber-700";
  if (
    v.includes("practiced") ||
    v.includes("complete") ||
    v.includes("yes") ||
    v.includes("strong")
  )
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  return "border-slate-200 bg-slate-100 text-slate-600";
}

function StatCard({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:border-slate-300">
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </div>
      <div className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-slate-900">
        {value ?? "—"}
      </div>
    </div>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <header className="border-b border-slate-100 px-6 py-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-700">
          {title}
        </h2>
      </header>
      <div className="p-6">{children}</div>
    </section>
  );
}

/* ---------- logged-out hero ---------- */

export function WelcomeHero() {
  return (
    <main className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-16">
      <div className="max-w-2xl text-center">
        <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700">
          Data Intelligence Platform
        </span>
        <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Welcome to Innovator Insights
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-slate-600">
          Assess organizational readiness, collect structured reporting, and
          generate AI-supported insights across the full innovation lifecycle.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/redesign/login"
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-600/30"
          >
            Sign In
          </Link>
          <Link
            href="/redesign/signup"
            className="rounded-lg border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-900 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-300/60"
          >
            Create Account
          </Link>
        </div>
      </div>
    </main>
  );
}

/* ---------- dashboard ---------- */

type DashboardViewProps = {
  company: any;
  reportCount: number;
  lastReport: string;
  recentAssessments: any[];
};

export default function DashboardView({
  company,
  reportCount,
  lastReport,
  recentAssessments,
}: DashboardViewProps) {
  const hasReports = reportCount > 0;

  const pendingTasks: string[] = [];
  if (!hasReports) pendingTasks.push("Submit your first reporting period");
  if (!company?.full_time_staff || !company?.year_established)
    pendingTasks.push("Complete your company profile");
  pendingTasks.push("Review your AI readiness dashboard");

  const initials = (company?.company_name ?? "?")
    .split(" ")
    .map((w: string) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const meta = [company?.organization_type, company?.country]
    .filter(Boolean)
    .join(" · ");

  return (
    <main className="min-h-[calc(100vh-80px)] bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 pb-12 pt-10 sm:px-6 sm:pt-12">
        {/* Company header */}
        <section className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <span
                aria-hidden="true"
                className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-lg font-bold text-white shadow-sm ring-1 ring-inset ring-white/20"
              >
                {initials}
              </span>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  {company?.company_name ?? "Your organization"}
                </h1>
                {meta ? (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {company?.organization_type ? (
                      <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600">
                        {company.organization_type}
                      </span>
                    ) : null}
                    {company?.country ? (
                      <span className="text-sm text-slate-500">
                        {company.country}
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-6 py-3 text-center">
              <div className="text-2xl font-semibold tabular-nums text-slate-900">
                {reportCount}
              </div>
              <div className="mt-0.5 text-xs font-medium uppercase tracking-wider text-slate-500">
                Reports submitted
              </div>
            </div>
          </div>
        </section>

        {/* Status band */}
        <section className="mt-5 overflow-hidden rounded-xl border border-blue-700/20 bg-gradient-to-br from-blue-700 to-blue-800 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-6 sm:px-8">
            <div className="flex items-start gap-4">
              <span
                aria-hidden="true"
                className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white/15"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6" />
                  <path d="M9 15h6" />
                </svg>
              </span>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {hasReports ? "Continue reporting" : "Get started"}
                </h2>
                <p className="mt-1 text-sm text-blue-100">
                  {hasReports
                    ? `Last report: ${lastReport}`
                    : "You haven't submitted any reports yet. Begin your first one to unlock insights."}
                </p>
              </div>
            </div>
            <Link
              href="/report/assessment"
              className="rounded-lg bg-white px-5 py-2.5 font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-white/40"
            >
              {hasReports ? "Continue →" : "Start now →"}
            </Link>
          </div>
        </section>

        {/* Stats */}
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <StatCard label="Full-time staff" value={company?.full_time_staff} />
          <StatCard label="Part-time staff" value={company?.part_time_staff} />
          <StatCard label="Established" value={company?.year_established} />
        </div>

        {/* Lower section */}
        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SectionCard title="Recent assessment activity">
              {recentAssessments.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No assessments yet. Submitted responses will appear here.
                </p>
              ) : (
                <ul className="space-y-3">
                  {recentAssessments.map((assessment) => (
                    <li
                      key={assessment.id}
                      className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white px-4 py-3.5 transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      <span className="font-medium text-slate-900">
                        {assessment.Subtopic ?? "Assessment"}
                      </span>
                      <span
                        className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusChip(
                          assessment.ai_assessment
                        )}`}
                      >
                        {assessment.ai_assessment ?? "Pending"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
          </div>

          <div className="space-y-5">
            <SectionCard title="Pending tasks">
              <ul className="space-y-3">
                {pendingTasks.map((task, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-blue-600" aria-hidden="true">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M9 12l2 2 4-4" />
                    </svg>
                    <span className="leading-snug text-slate-700">{task}</span>
                  </li>
                ))}
              </ul>
            </SectionCard>

            <SectionCard title="Reminder">
              <p className="text-sm leading-relaxed text-slate-600">
                Continue submitting interview responses and review your AI
                readiness dashboard for updated assessments and recommendations.
              </p>
            </SectionCard>
          </div>
        </div>
      </div>
    </main>
  );
}
