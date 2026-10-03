import Link from "next/link";

const DOMAINS = [
  ["Model Source", "Where the training data comes from, who governs it and how it is protected."],
  ["Model Development", "How the model is built, validated and checked for bias."],
  ["Model Deployment", "How the tool runs in practice and is monitored for safety."],
  ["Impact", "What changes for patients and health systems, and at what cost."],
  ["Sustainability", "Whether the tool can be financed, owned and overseen for the long term."],
] as const;

/**
 * Shown when nobody is signed in. A navy band that continues the header,
 * then plain text: what you do, what you get back, what's assessed.
 * (The navbar comes from layout.tsx.)
 */
export default function WelcomeHero() {
  return (
    <div>
      <section className="border-t border-white/10 bg-blue-600 text-white">
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:px-8">
          <p className="text-[15px] text-white/75">
            AI readiness assessment for health innovators
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-[1.12] sm:text-5xl">
            See how ready your AI tool is, with the evidence behind every result.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/80">
            Upload your reports and answer a short set of questions. Each of 31
            criteria is rated against what you submitted, and every rating shows
            the passage and the document it came from.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="rounded bg-white px-5 py-2.5 text-[15px] font-semibold text-blue-600 hover:bg-blue-50"
            >
              Create an account
            </Link>
            <Link
              href="/login"
              className="rounded border border-white/60 px-5 py-2.5 text-[15px] font-semibold text-white hover:border-white hover:bg-white/10"
            >
              Log in
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <section aria-labelledby="how-heading" className="py-12">
          <h2 id="how-heading" className="sr-only">
            How it works
          </h2>
          <ol className="grid gap-10 md:grid-cols-3">
            {[
              [
                "Report",
                "Answer the assessment questions and upload the documents that describe your work: reports, decks, policies.",
              ],
              [
                "Check the evidence",
                "Each criterion is rated Meets, Partially meets, Does not currently meet or Not reported, with its source. Tell us when something is wrong.",
              ],
              [
                "Plan what's next",
                "The roadmap groups the criteria into six stages, from need and governance to long-term oversight.",
              ],
            ].map(([title, body], i) => (
              <li key={title} className="border-t-2 border-blue-600 pt-4">
                <p className="font-serif text-sm text-slate-500">Step {i + 1}</p>
                <h3 className="mt-1 text-lg font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-slate-600">{body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="domains-heading" className="border-t border-slate-300 py-12">
          <h2 id="domains-heading" className="text-2xl font-semibold text-slate-900">
            What is assessed
          </h2>
          <p className="mt-2 max-w-2xl text-[15px] text-slate-600">
            Five domains that follow a tool from its data to its long-term future.
          </p>
          <dl className="mt-6 divide-y divide-slate-200 border-y border-slate-200">
            {DOMAINS.map(([name, text], i) => (
              <div key={name} className="grid gap-1 py-3.5 sm:grid-cols-[16rem_1fr] sm:gap-6">
                <dt className="font-semibold text-slate-900">
                  <span className="mr-2 tabular-nums text-slate-400">{i + 1}.</span>
                  {name}
                </dt>
                <dd className="text-[15px] text-slate-600">{text}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </div>
  );
}
