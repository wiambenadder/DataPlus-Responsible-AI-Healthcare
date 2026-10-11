import Link from "next/link";
import { DOMAINS } from "@/lib/roadmap/framework";
import { DOMAIN_INFO } from "@/lib/domain-info";

/**
 * Public home page (nobody signed in), following the DGHI home page:
 * a navy hero, a mission statement, a row of large figures with links,
 * labelled cards, and a closing call to action.
 */
export default function WelcomeHero() {
  const criteria = DOMAINS.reduce((n, d) => n + d.subdomains.length, 0);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-navy text-white">
        <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-brand-dukeblue lg:block" aria-hidden />
        <div className="absolute inset-y-0 right-1/3 hidden w-2 bg-brand-teal lg:block" aria-hidden />
        <div className="absolute inset-y-0 right-0 hidden w-1/3 items-center justify-center px-10 lg:flex">
          <figure className="w-full max-w-sm bg-white p-6 text-slate-900 shadow-lg">
            <figcaption className="label-caps">Example result</figcaption>
            <p className="mt-2 font-serif text-2xl font-semibold text-brand-navy">Privacy &amp; Security</p>
            <p className="mt-3 inline-flex items-center gap-1.5 border border-brand-darkteal/30 bg-[#e7f2f2] px-2 py-0.5 text-xs font-semibold text-brand-darkteal">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-darkteal" aria-hidden />
              Meets criterion
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-slate-700">
              Consent is collected at registration and access to health data is
              limited to a named data protection lead.
            </p>
            <p className="mt-4 border-t border-slate-200 pt-3 text-sm text-slate-600">
              <span className="font-semibold text-slate-900">Source:</span> Data protection policy.pdf
            </p>
          </figure>
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/75">
              AI readiness for health innovators
            </p>
            <h1 className="mt-4 text-4xl font-normal leading-[1.1] text-white sm:text-6xl">
              Know how ready your AI tool is — and show the evidence.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-white/85">
              Share what you&apos;ve built and how you run it. Each of {criteria} criteria
              is assessed against your own documents and answers, with the source
              shown next to every result.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className="btn btn-light">
                Create an account
              </Link>
              <Link href="/login" className="btn border-white text-white hover:bg-white hover:text-brand-navy">
                Log in
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Mission */}
        <section aria-labelledby="mission" className="grid gap-6 py-14 md:grid-cols-[16rem_1fr] md:gap-12">
          <h2 id="mission" className="text-3xl">
            Our purpose
          </h2>
          <div className="space-y-4 text-lg leading-relaxed text-slate-800">
            <p>
              AI tools for health are being deployed faster than they can be
              evaluated by experts one at a time. Innovator Insights gives
              innovators a standard way to see where their tool stands — from the
              data it learns from to how it will be sustained — and what to
              strengthen next.
            </p>
            <p className="text-[16px] text-slate-600">
              It is open to anyone building or deploying an AI tool for health, and
              it is a decision aid, not a certification or a ranking.
            </p>
          </div>
        </section>
      </div>

      {/* Figures */}
      <section aria-label="The assessment in numbers" className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-3 sm:px-6 lg:px-8">
          {[
            [`${criteria}`, "Criteria assessed", "/framework#domains", "See the criteria"],
            ["5", "Domains, from data to sustainability", "/framework#domains", "Explore the domains"],
            ["6", "Roadmap stages with clear thresholds", "/framework#roadmap", "How stages work"],
          ].map(([fig, label, href, cta]) => (
            <div key={label} className="border-l-4 border-brand-teal pl-5">
              <p className="font-serif text-6xl font-semibold leading-none text-brand-navy">{fig}</p>
              <p className="mt-3 text-[16px] font-semibold text-slate-900">{label}</p>
              <Link href={href} className="link-more mt-2 inline-block text-sm">
                {cta} ›
              </Link>
            </div>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* How it works */}
        <section aria-labelledby="how" className="py-14">
          <p className="label-caps">How it works</p>
          <h2 id="how" className="mt-1 text-3xl">
            Three steps to your results
          </h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              ["Step 1", "Share your work", "Upload reports, evaluations or decks, then answer questions only on what they don't cover."],
              ["Step 2", "Check the evidence", "Every result shows the passage it rests on and the document it came from. Tell us when something is wrong."],
              ["Step 3", "Plan what's next", "Your roadmap orders the criteria into six stages and shows what it takes to move on."],
            ].map(([label, title, body]) => (
              <li key={label} className="border-t-4 border-brand-navy bg-white pt-5">
                <p className="label-caps">{label}</p>
                <h3 className="mt-2 font-serif text-2xl font-semibold text-brand-navy">{title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-slate-700">{body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Domains */}
        <section aria-labelledby="domains" className="border-t border-slate-200 py-14">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="label-caps">The framework</p>
              <h2 id="domains" className="mt-1 text-3xl">
                What is assessed
              </h2>
            </div>
            <Link href="/framework" className="link-more">
              The framework explained
            </Link>
          </div>
          <dl className="mt-6 divide-y divide-slate-200 border-y border-slate-200">
            {DOMAINS.map((d, i) => (
              <div key={d.id} className="grid gap-1 py-4 sm:grid-cols-[18rem_1fr] sm:gap-8">
                <dt className="font-serif text-xl font-semibold text-brand-navy">
                  <span className="mr-2 text-slate-400">{i + 1}.</span>
                  {d.name}
                </dt>
                <dd className="text-[15px] text-slate-700">{DOMAIN_INFO[d.name]?.short}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      {/* Closing call to action */}
      <section className="bg-brand-darkteal text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-4 py-10 sm:px-6 lg:px-8">
          <p className="max-w-2xl font-serif text-2xl leading-snug">
            Ready to see where your tool stands? Create a free account with any
            email address.
          </p>
          <Link href="/signup" className="btn btn-light">
            Create an account
          </Link>
        </div>
      </section>
    </div>
  );
}
