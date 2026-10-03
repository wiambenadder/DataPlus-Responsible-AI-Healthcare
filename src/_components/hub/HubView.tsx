import Link from "next/link";
import { WORKSTREAMS, type Workstream } from "@/lib/workstreams";

/**
 * Hub page: the entry point to the three workstreams — the AI Readiness
 * Assessment, the Financing Codebook and the Policy Codebook. Content
 * lives in src/lib/workstreams.ts. (The navbar comes from layout.tsx.)
 */
export default function HubView() {
  return (
    <div>
      <section className="border-t border-white/10 bg-blue-600 text-white">
        <div className="mx-auto max-w-7xl px-4 pb-14 pt-12 sm:px-6 sm:pt-16 lg:px-8">
          <p className="text-[15px] text-white/75">Innovator Insights</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-[1.12] sm:text-5xl">
            Three questions every AI health tool has to answer
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/80">
            Does it work? Can it last? Is it allowed? Each tool below takes on
            one of them, so you can see where you stand and what to do next.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="sr-only">Tools</h2>
        <ul className="grid gap-10 md:grid-cols-3">
          {WORKSTREAMS.map((w) => (
            <li key={w.id}>
              <WorkstreamColumn stream={w} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function WorkstreamColumn({ stream }: { stream: Workstream }) {
  const comingSoon = stream.status === "coming-soon";

  return (
    <article className="flex h-full flex-col border-t-2 border-blue-600 pt-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-serif text-lg italic text-slate-600">{stream.question}</p>
        {comingSoon && (
          <span className="text-xs font-semibold text-slate-500">In development</span>
        )}
      </div>
      <h3 className="mt-1 font-serif text-2xl font-semibold text-slate-900">
        <Link href={stream.href} className="hover:text-blue-600 hover:underline">
          {stream.title}
        </Link>
      </h3>
      <p className="mt-2 text-[15px] leading-relaxed text-slate-700">
        {stream.description}
      </p>

      <ul className="mt-4 flex-1 list-disc space-y-1.5 pl-5 text-[15px] text-slate-600 marker:text-slate-400">
        {stream.highlights.map((h) => (
          <li key={h}>{h}</li>
        ))}
      </ul>

      <p className="mt-5">
        <Link
          href={stream.href}
          className={
            comingSoon
              ? "text-[15px] font-semibold text-blue-600 hover:underline"
              : "inline-block rounded bg-blue-600 px-4 py-2 text-[15px] font-semibold text-white hover:bg-blue-700"
          }
        >
          {stream.cta}
        </Link>
      </p>
    </article>
  );
}
