import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  Landmark,
  Scale,
  type LucideIcon,
} from "lucide-react";

import {
  ACCENT_STYLES,
  WORKSTREAMS,
  type Workstream,
} from "@/lib/workstreams";

const ICONS: Record<Workstream["id"], LucideIcon> = {
  "ai-readiness": BrainCircuit,
  financing: Landmark,
  policy: Scale,
};

/**
 * Hub page: the top-level entry point that links to the three
 * workstreams — the AI Readiness Assessment, the Financing Codebook
 * and the Policy Codebook. Card content lives in src/lib/workstreams.ts.
 *
 * Note: the navbar is rendered by layout.tsx, so it is intentionally
 * NOT rendered here.
 */
export default function HubView() {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero */}
        <section
          aria-labelledby="hub-title"
          className="rounded-2xl border border-slate-200 bg-white p-8 text-center sm:p-12"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
            Innovator Insights
          </p>
          <h1
            id="hub-title"
            className="mx-auto mt-3 max-w-3xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl"
          >
            Tools for responsible AI in healthcare
          </h1>
          <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-slate-500">
            Assess how ready your AI solution is for real-world use, then find
            the financing and policy resources that help you get there.
          </p>
        </section>

        {/* Workstreams */}
        <section aria-labelledby="workstreams">
          <div className="mb-4">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
              Workstreams
            </p>
            <h2
              id="workstreams"
              className="mt-1 text-2xl font-bold tracking-tight text-slate-900"
            >
              Where would you like to start?
            </h2>
          </div>

          <ul className="grid gap-4 md:grid-cols-3">
            {WORKSTREAMS.map((w) => (
              <li key={w.id}>
                <WorkstreamCard stream={w} />
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

function WorkstreamCard({ stream }: { stream: Workstream }) {
  const Icon = ICONS[stream.id];
  const accent = ACCENT_STYLES[stream.accent];
  const live = stream.status === "live";

  return (
    <Link
      href={stream.href}
      className={`group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 transition hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${accent.ring}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${accent.icon}`}
          aria-hidden
        >
          <Icon className="h-5 w-5" />
        </span>
        {live ? (
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
            Live
          </span>
        ) : (
          <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
            Coming soon
          </span>
        )}
      </div>

      <p
        className={`mt-5 text-xs font-semibold uppercase tracking-wider ${accent.eyebrow}`}
      >
        {stream.eyebrow}
      </p>
      <h3 className="mt-1 text-lg font-bold text-slate-900">{stream.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">
        {stream.description}
      </p>

      <ul className="mt-4 flex-1 space-y-2 border-t border-slate-100 pt-4">
        {stream.highlights.map((h) => (
          <li
            key={h}
            className="flex items-start gap-2.5 text-sm text-slate-600"
          >
            <span
              className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${accent.dot}`}
              aria-hidden
            />
            {h}
          </li>
        ))}
      </ul>

      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600">
        {live ? stream.cta : "Preview"}
        <ArrowRight
          className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </span>
    </Link>
  );
}
