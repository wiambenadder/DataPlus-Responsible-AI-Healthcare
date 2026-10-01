import Link from "next/link";
import { ArrowLeft, Landmark, Scale } from "lucide-react";

import { ACCENT_STYLES, WORKSTREAMS } from "@/lib/workstreams";

/**
 * Temporary page for a codebook that hasn't been built yet. Replace the
 * route's page.tsx with the real codebook when it's ready, and set the
 * workstream's status to "live" in src/lib/workstreams.ts.
 */
export default function CodebookPlaceholder({
  id,
}: {
  id: "financing" | "policy";
}) {
  const stream = WORKSTREAMS.find((w) => w.id === id)!;
  const accent = ACCENT_STYLES[stream.accent];
  const Icon = id === "financing" ? Landmark : Scale;

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center sm:p-12">
          <span
            className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${accent.icon}`}
            aria-hidden
          >
            <Icon className="h-7 w-7" />
          </span>
          <p className={`mt-5 text-sm font-semibold ${accent.question}`}>
            {stream.question}
          </p>
          <h1 className="mx-auto mt-2 max-w-2xl text-4xl font-extrabold tracking-tight text-slate-900">
            {stream.title}
          </h1>
          <p className="mx-auto mt-4 max-w-xl leading-relaxed text-slate-500">
            {stream.description}
          </p>
          <p className="mx-auto mt-2 max-w-xl leading-relaxed text-slate-500">
            We&apos;re still building this one. Check back soon.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/hub"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back to all tools
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
