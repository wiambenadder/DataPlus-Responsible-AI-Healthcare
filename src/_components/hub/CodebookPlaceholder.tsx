import Link from "next/link";
import { WORKSTREAMS } from "@/lib/workstreams";

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

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
        <Link href="/hub" className="hover:text-slate-900 hover:underline">
          All tools
        </Link>
        <span className="mx-2" aria-hidden>/</span>
        <span className="text-slate-700">{stream.title}</span>
      </nav>

      <p className="mt-8 font-serif text-lg italic text-slate-600">{stream.question}</p>
      <h1 className="mt-1 text-4xl font-semibold text-slate-900">{stream.title}</h1>
      <p className="mt-4 text-lg leading-relaxed text-slate-700">{stream.description}</p>

      <div className="mt-8 border-l-4 border-blue-600 bg-white px-5 py-4">
        <p className="font-semibold text-slate-900">This tool is still being built.</p>
        <p className="mt-1 text-[15px] text-slate-600">What it will let you do:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-[15px] text-slate-700 marker:text-slate-400">
          {stream.highlights.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      </div>

      <p className="mt-8">
        <Link href="/hub" className="text-[15px] font-semibold text-blue-600 hover:underline">
          Back to all tools
        </Link>
      </p>
    </div>
  );
}
