import Link from "next/link";
import Photo from "@/components/Photo";
import { WORKSTREAMS } from "@/lib/workstreams";

/**
 * Page for a codebook that is still being built. It is kept deliberately
 * simple so the team building each codebook can change it freely: the
 * title, introduction and "Why It Matters" text all come from
 * src/lib/workstreams.ts. Replace the route's page.tsx with the real
 * codebook when it's ready, and set the workstream's status to "live".
 */
export default function CodebookPlaceholder({
  id,
}: {
  id: "financing" | "policy";
}) {
  const stream = WORKSTREAMS.find((w) => w.id === id)!;

  return (
    <div>
      <section className="grid border-b border-slate-200 lg:grid-cols-2">
        <div className="flex flex-col justify-center bg-whisper px-4 py-14 sm:px-10 lg:py-20 lg:pl-[max(2rem,calc((100vw-80rem)/2+2rem))] lg:pr-14">
          <nav aria-label="Breadcrumb" className="label-caps">
            <Link href="/hub" className="hover:underline">
              All Tools
            </Link>
            <span className="mx-2" aria-hidden>
              ›
            </span>
            <span>Coming Soon</span>
          </nav>
          <h1 className="mt-4 text-4xl sm:text-5xl">{stream.title}</h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-700">{stream.intro}</p>
        </div>
        <div className="relative h-72 sm:h-96 lg:h-auto lg:min-h-[420px]">
          <Photo name={stream.photo} width={1400} priority />
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mt-16 grid gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          {stream.why.length > 0 && (
            <section aria-labelledby="why-heading">
              <div className="section-head">
                <h2 id="why-heading">Why It Matters</h2>
              </div>
              <div className="mt-5 max-w-3xl space-y-4 text-[17px] leading-relaxed text-slate-700">
                {stream.why.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </section>
          )}

          <aside
            aria-labelledby="status-heading"
            className="self-start border-t-4 bg-whisper p-6"
            style={{ borderTopColor: stream.accent }}
          >
            <h2 id="status-heading" className="text-[1.6rem]">
              In Development
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-slate-700">
              This codebook is being built. This page will be updated as the work develops.
            </p>
            <p className="mt-4">
              <Link href="/hub" className="link-more">
                Back to All Tools ›
              </Link>
            </p>
          </aside>
        </div>

        <section className="mt-20 grid items-center gap-6 bg-whisper md:grid-cols-[260px_1fr_auto] md:pr-8">
          <div className="h-44">
            <Photo name="aiReadiness" width={600} />
          </div>
          <div className="px-6 md:px-0">
            <h2 className="text-[1.75rem]">Available Now: AI Readiness Assessment</h2>
            <p className="mt-1 text-[15px] text-slate-600">
              Free and open to anyone. Upload what you have and get a rating for each of 31
              practices, with the evidence behind it and a roadmap of next steps.
            </p>
          </div>
          <p className="px-6 pb-6 md:p-0">
            <Link href="/report/assessment" className="btn btn-primary">
              Start the Assessment
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
