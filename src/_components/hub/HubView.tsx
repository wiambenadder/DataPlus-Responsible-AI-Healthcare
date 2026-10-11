import Link from "next/link";
import Photo from "@/components/Photo";
import { SITE } from "@/lib/site";
import { WORKSTREAMS, type Workstream } from "@/lib/workstreams";
import type { PhotoKey } from "@/lib/photos";

/**
 * All Tools page (also the signed-out home page): the entry point to the
 * AI Readiness Assessment, the Financing Codebook and the Policy Codebook.
 * Card content lives in src/lib/workstreams.ts.
 */
export default function HubView() {
  return (
    <div>
      {/* Hero: navy text panel beside a photo */}
      <section className="grid bg-brand-navy lg:grid-cols-[5fr_6fr]">
        <div className="flex flex-col justify-center px-4 py-14 sm:px-10 lg:py-20 lg:pl-[max(2rem,calc((100vw-80rem)/2+2rem))] lg:pr-14">
          <p className="text-[0.78rem] font-bold uppercase tracking-[0.1em] text-blue-200">
            {SITE.org}
          </p>
          <h1 className="mt-4 text-4xl text-white sm:text-5xl">
            Tools for Responsible AI in Global Health
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-blue-50">
            {SITE.name} helps teams building AI for health see how ready their tool is
            for real-world use, how similar tools are funded, and which policies apply
            where they work.
          </p>
          <p className="mt-8 flex flex-wrap gap-3">
            <Link href="/report/assessment" className="btn btn-light">
              Start the Assessment
            </Link>
            <Link href="/framework" className="btn btn-outline-light">
              How It Works
            </Link>
          </p>
        </div>
        <div className="relative h-72 sm:h-96 lg:h-auto lg:min-h-[480px]">
          <Photo name="hero" width={1600} priority />
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <section className="mt-16" aria-labelledby="tools-heading">
          <div className="section-head">
            <h2 id="tools-heading">Our Tools</h2>
            <p className="text-[15px] text-slate-600">Free and open to anyone</p>
          </div>
          <ul className="mt-8 grid gap-10 md:grid-cols-3 md:gap-8">
            {WORKSTREAMS.map((w) => (
              <li key={w.id}>
                <ToolCard stream={w} />
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-20" aria-labelledby="how-heading">
          <div className="section-head">
            <h2 id="how-heading">How the Assessment Works</h2>
            <Link href="/framework" className="link-more">
              Read about the framework ›
            </Link>
          </div>
          <ol className="mt-8 grid gap-10 md:grid-cols-3">
            {[
              [
                "Share what you have",
                "Upload reports you have already written, then answer short questions on anything they don't cover.",
              ],
              [
                "Check every rating",
                "Each practice shows the reason for its rating and the passage it came from. Tell us if something is wrong.",
              ],
              [
                "Plan your next steps",
                "A six-stage roadmap shows where your tool stands and what to work on next.",
              ],
            ].map(([title, text], i) => (
              <li key={title}>
                <p className="font-serif text-6xl leading-none text-brand-navy">{i + 1}</p>
                <h3 className="mt-3 text-lg font-bold text-ink">{title}</h3>
                <p className="mt-1 text-[15px] leading-relaxed text-slate-600">{text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-20" aria-labelledby="who-heading">
          <div className="section-head">
            <h2 id="who-heading">Who It&apos;s For</h2>
          </div>
          <ul className="mt-8 grid gap-10 md:grid-cols-3 md:gap-8">
            {(
              [
                [
                  "innovators",
                  "Innovators",
                  "See your strengths and gaps, with evidence you can share with partners.",
                  "center",
                ],
                [
                  "funders",
                  "Funders",
                  "Understand where a tool stands before and after you invest.",
                  "center",
                ],
                [
                  "healthSystems",
                  "Health systems and ministries",
                  "Compare tools on one framework when deciding what to adopt.",
                  "center 30%",
                ],
              ] as [PhotoKey, string, string, string][]
            ).map(([photo, title, text, pos]) => (
              <li key={title}>
                <div className="h-52">
                  <Photo name={photo} width={800} position={pos} />
                </div>
                <h3 className="mt-4 text-lg font-bold text-ink">{title}</h3>
                <p className="mt-1 text-[15px] leading-relaxed text-slate-600">{text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-20 grid gap-6 bg-whisper px-6 py-8 sm:px-10 md:grid-cols-[1fr_2fr] md:items-center">
          <p className="label-caps">About the Project</p>
          <p className="text-[17px] leading-relaxed text-slate-700">
            {SITE.name} is built by a Duke University team with {SITE.org}, using its
            framework for AI readiness in health.{" "}
            <Link href="/data-use" className="link-more">
              How we use your data ›
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}

function ToolCard({ stream }: { stream: Workstream }) {
  const live = stream.status === "live";
  return (
    <article className="flex h-full flex-col border-t-4" style={{ borderTopColor: stream.accent }}>
      <Link href={stream.href} className="block h-56" tabIndex={-1} aria-hidden>
        <Photo name={stream.photo} width={800} />
      </Link>
      <div className="flex flex-1 flex-col pt-5">
        <p
          className="text-[0.78rem] font-bold uppercase tracking-[0.1em]"
          style={{ color: live ? stream.accent : "#666d76" }}
        >
          {live ? "Available Now" : "Coming Soon"}
        </p>
        <h3 className="mt-1 font-serif text-[1.75rem] font-medium leading-tight text-brand-navy">
          <Link href={stream.href} className="hover:underline">
            {stream.title}
          </Link>
        </h3>
        <p className="mt-2 text-[15.5px] leading-relaxed text-slate-600">{stream.description}</p>
        <ul className="mb-6 mt-4 list-disc space-y-1.5 pl-5 text-[15px] text-slate-700 marker:text-slate-400">
          {stream.highlights.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
        <p className="mt-auto">
          <Link href={stream.href} className="link-more">
            {stream.cta} ›
          </Link>
        </p>
      </div>
    </article>
  );
}
