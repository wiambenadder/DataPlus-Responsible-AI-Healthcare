import Link from "next/link";
import { WORKSTREAMS, type Workstream } from "@/lib/workstreams";

/**
 * Hub page: the entry point to the three workstreams — the AI Readiness
 * Assessment, the Financing Codebook and the Policy Codebook. Content
 * lives in src/lib/workstreams.ts.
 */
export default function HubView() {
  return (
    <div>
      <div className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="text-sm text-slate-600">
            <Link href="/" className="hover:underline">Home</Link>
            <span className="mx-2" aria-hidden>›</span>
            <span>All tools</span>
          </nav>
          <p className="label-caps mt-8">Innovator Insights</p>
          <h1 className="mt-2 max-w-3xl text-4xl sm:text-5xl">
            Three questions every AI health tool has to answer
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-700">
            Does it work? Can it last? Is it allowed? Each tool below takes on one
            of them, so you can see where you stand and what to do next.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="sr-only">Tools</h2>
        <ul className="grid gap-6 md:grid-cols-3">
          {WORKSTREAMS.map((w) => (
            <li key={w.id}>
              <WorkstreamCard stream={w} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function WorkstreamCard({ stream }: { stream: Workstream }) {
  const comingSoon = stream.status === "coming-soon";

  return (
    <article className="flex h-full flex-col border-t-4 border-brand-navy bg-slate-50 p-6">
      <p className="label-caps">{comingSoon ? "In development" : "Available now"}</p>
      <p className="mt-3 font-serif text-lg italic text-slate-600">{stream.question}</p>
      <h3 className="font-serif text-2xl font-semibold text-brand-navy">
        <Link href={stream.href} className="hover:underline">
          {stream.title}
        </Link>
      </h3>
      <p className="mt-2 text-[15px] leading-relaxed text-slate-700">{stream.description}</p>

      <ul className="mt-4 flex-1 list-disc space-y-1.5 pl-5 text-[15px] text-slate-700 marker:text-brand-teal">
        {stream.highlights.map((h) => (
          <li key={h}>{h}</li>
        ))}
      </ul>

      <p className="mt-6">
        <Link href={stream.href} className={comingSoon ? "btn btn-secondary" : "btn btn-primary"}>
          {stream.cta}
        </Link>
      </p>
    </article>
  );
}
