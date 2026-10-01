import Link from "next/link";
import {
  ArrowRight,
  ClipboardCheck,
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
  "ai-readiness": ClipboardCheck,
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
            Three questions every AI health tool has to answer
          </h1>
          <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-slate-500">
            Does it work? Can it last? Is it allowed? We&apos;re building a
            tool for each one, so you can see where you stand and what to do
            next.
          </p>
        </section>

        {/* Workstreams */}
        <section aria-labelledby="workstreams">
          <div className="mb-4">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
              Explore
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
  const comingSoon = stream.status === "coming-soon";

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
        {comingSoon && (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            Coming soon
          </span>
        )}
      </div>

      <p className={`mt-5 text-sm font-semibold ${accent.question}`}>
        {stream.question}
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
        {stream.cta}
        <ArrowRight
          className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </span>
    </Link>
  );
}
