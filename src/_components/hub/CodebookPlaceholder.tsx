import Link from "next/link";
import Photo from "@/components/Photo";
import { WORKSTREAMS } from "@/lib/workstreams";

/**
 * Page for a codebook that hasn't been built yet: what it will do, plus an
 * illustrative preview. Replace the route's page.tsx with the real codebook
 * when it's ready, and set the workstream's status to "live" in
 * src/lib/workstreams.ts.
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
        <section className="mt-16" aria-labelledby="features-heading">
          <div className="section-head">
            <h2 id="features-heading">What You Will Be Able to Do</h2>
          </div>
          <ul className="mt-8 grid gap-10 md:grid-cols-3">
            {stream.features.map((f) => (
              <li key={f.title} className="border-t-4 pt-4" style={{ borderTopColor: stream.accent }}>
                <h3 className="text-lg font-bold text-ink">{f.title}</h3>
                <p className="mt-1 text-[15px] leading-relaxed text-slate-600">{f.text}</p>
              </li>
            ))}
          </ul>
        </section>

        {id === "financing" ? <FinancingPreview /> : <PolicyPreview />}

        <section className="mt-20 grid items-center gap-6 bg-whisper md:grid-cols-[260px_1fr_auto] md:pr-8">
          <div className="h-44">
            <Photo name="aiReadiness" width={600} />
          </div>
          <div className="px-6 md:px-0">
            <h2 className="text-[1.75rem]">Available Now: AI Readiness Assessment</h2>
            <p className="mt-1 text-[15px] text-slate-600">
              Free and open to anyone. Upload what you have and get a rating for each of 31
              practices.
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

function PreviewIntro({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <p className="label-caps">Preview</p>
      <h2 className="mt-2 text-[2rem]">{title}</h2>
      <p className="mt-3 text-[15.5px] leading-relaxed text-slate-600">{text}</p>
    </div>
  );
}

function Row({ label, tag, tone }: { label: string; tag: string; tone: string }) {
  return (
    <li className="flex items-center justify-between gap-4 border-b border-slate-200 py-3 text-[15px] last:border-0">
      <span>{label}</span>
      <span className={`tag ${tone}`}>{tag}</span>
    </li>
  );
}

const TONE = {
  green: "bg-[#d9ece9] text-[#174f4f]",
  blue: "bg-[#dbeaf6] text-[#04477a]",
  yellow: "bg-[#fbefc9] text-[#6e5200]",
  grey: "bg-slate-100 text-slate-700",
};

function FinancingPreview() {
  const parts = [
    ["Grants", 60, "#1D6363"],
    ["Earned revenue", 25, "#E89923"],
    ["Government contract", 15, "#0577B1"],
  ] as const;
  return (
    <section className="mt-20 grid gap-10 lg:grid-cols-[1fr_1.3fr]">
      <PreviewIntro
        title="A Tool's Funding Story"
        text="Each tool's funding is coded the same way, so you can compare how others went from pilot to scale. This example is illustrative, not real data."
      />
      <div className="border border-slate-200 p-6 sm:p-7">
        <p className="label-caps text-brand-teal">Example · Maternal health triage tool</p>
        <h3 className="mt-1 text-xl font-bold text-ink">Sources of funding, 2019–2025</h3>
        <div className="mt-5 flex h-5" role="img" aria-label="Grants 60 percent, earned revenue 25 percent, government contract 15 percent">
          {parts.map(([label, pct, color]) => (
            <span key={label} style={{ width: `${pct}%`, background: color }} />
          ))}
        </div>
        <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-700">
          {parts.map(([label, pct, color]) => (
            <li key={label} className="flex items-center gap-2">
              <span className="h-3 w-3" style={{ background: color }} aria-hidden />
              {label} {pct}%
            </li>
          ))}
        </ul>
        <ul className="mt-5 border-t border-slate-200">
          <Row label="2019 · Seed grant" tag="Philanthropy" tone={TONE.green} />
          <Row label="2021 · Pilot funding" tag="Development agency" tone={TONE.green} />
          <Row label="2024 · County health contract" tag="Government" tone={TONE.blue} />
        </ul>
      </div>
    </section>
  );
}

function PolicyPreview() {
  return (
    <section className="mt-20 grid gap-10 lg:grid-cols-[1fr_1.3fr]">
      <PreviewIntro
        title="A Country Page"
        text="Each policy is rated by how strongly it applies to innovators, from not mentioned to a binding requirement. This example is illustrative, not real data."
      />
      <div className="border border-slate-200 p-6 sm:p-7">
        <p className="label-caps text-brand-ironweed">Example country · AI in health</p>
        <h3 className="mt-1 text-xl font-bold text-ink">Five key questions</h3>
        <ul className="mt-3">
          <Row label="Is there a national AI strategy?" tag="Level 2 · Guidance" tone={TONE.blue} />
          <Row label="Must AI software be registered as a medical device?" tag="Level 3 · Required" tone={TONE.green} />
          <Row label="Are there rules on health data protection?" tag="Level 3 · Required" tone={TONE.green} />
          <Row label="Is there an AI ethics committee?" tag="Level 1 · Principles" tone={TONE.yellow} />
          <Row label="Are there rules for clinical algorithms?" tag="Level 0 · Not mentioned" tone={TONE.grey} />
        </ul>
      </div>
    </section>
  );
}
