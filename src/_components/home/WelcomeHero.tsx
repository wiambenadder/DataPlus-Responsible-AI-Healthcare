"use client";

import Link from "next/link";
import { ArrowRight, ClipboardList, FileSearch, Map } from "lucide-react";

/**
 * Shown when there is no company context (signed out, or profile/company
 * lookup failed). Explains the platform in the same visual language as
 * the signed-in homepage and routes to login / sign up.
 *
 * Note: the navbar is rendered by layout.tsx, so it is intentionally
 * NOT rendered here — that was causing the duplicated navigation bar.
 */
export default function WelcomeHero() {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center sm:p-12">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
            Innovator Insights
          </p>
          <h1 className="mx-auto mt-3 max-w-2xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Understand your AI readiness — with evidence, not guesswork
          </h1>
          <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-slate-500">
            Report on how you build and deploy AI, and get an evidence-backed
            assessment across five domains — Model Source, Model Development,
            Model Deployment, Impact, and Sustainability — plus a staged
            roadmap for what to strengthen next.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              Get started
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              Log in
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            {
              Icon: ClipboardList,
              title: "Report",
              body: "Answer assessment questions and upload the documents that show your work.",
            },
            {
              Icon: FileSearch,
              title: "Get assessed",
              body: "AI agents rate all 31 subdomains as Practiced or Not Practiced, with sourced reasoning.",
            },
            {
              Icon: Map,
              title: "Follow the roadmap",
              body: "Six stages, from need & governance to long-term oversight, show you what's next.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-slate-200 bg-white p-6"
            >
              <span
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"
                aria-hidden
              >
                <f.Icon className="h-5 w-5" />
              </span>
              <h2 className="mt-4 text-base font-semibold text-slate-900">
                {f.title}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
