import type { Metadata } from "next";
import Link from "next/link";
import InfoLayout, { InfoSection } from "@/_components/info/InfoLayout";
import { DOMAINS, STAGES, STAGE_MAPPING, ADVANCE_THRESHOLD } from "@/lib/roadmap/framework";
import { DEFINITIONS } from "@/lib/definitions";
import { DOMAIN_INFO, MEETS_RULE } from "@/lib/domain-info";
import { STATUS_META, STATUS_ORDER, CONFIDENCE_META, slugify } from "@/lib/assessment";

export const metadata: Metadata = {
  title: "The framework explained · Innovator Insights",
};

const SECTIONS = [
  { id: "overview", title: "What the assessment is" },
  { id: "domains", title: "The five domains" },
  { id: "rating", title: "How a criterion is rated" },
  { id: "results", title: "What each result means" },
  { id: "roadmap", title: "Roadmap stages and thresholds" },
  { id: "process", title: "How your evidence is processed" },
];

function definitionOf(domain: string, subtopic: string) {
  return DEFINITIONS.find((d) => d.domain === domain && d.subtopic === subtopic)?.definition;
}

/**
 * Explains the framework in one place — requested by innovators who said
 * the platform only made sense if you already knew it.
 */
export default function FrameworkPage() {
  const total = DOMAINS.reduce((n, d) => n + d.subdomains.length, 0);
  const threshold = Math.round(ADVANCE_THRESHOLD * 100);

  return (
    <InfoLayout
      label="Help"
      title="The framework explained"
      lede={
        <p>
          Innovator Insights uses Innovations in Healthcare&apos;s AI readiness
          framework: {total} criteria in five domains that follow an AI tool from
          the data it learns from to its long-term future. This page explains what
          each part means and how results are worked out.
        </p>
      }
      sections={SECTIONS}
    >
      <InfoSection id="overview" title="What the assessment is">
        <p>
          You share documents about your tool and answer questions about how you
          build and run it. Each of the {total} criteria is then rated against what
          you shared, and every result shows the evidence and source it is based
          on.
        </p>
        <p>
          The assessment is a <strong>decision aid</strong>: it shows which
          practices your material already evidences and what to work on next. It
          is not a certification, an approval or a ranking against other
          organisations.
        </p>
      </InfoSection>

      <InfoSection id="domains" title="The five domains">
        <p>
          Each domain groups related criteria (sometimes called subdomains). Open a
          domain to see what each of its criteria looks for.
        </p>
        <div className="mt-6 space-y-4">
          {DOMAINS.map((d, i) => (
            <details
              key={d.id}
              id={`domain-${slugify(d.name)}`}
              className="group border border-slate-200 open:border-slate-300"
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 bg-slate-50 px-5 py-4 hover:bg-slate-100">
                <span>
                  <span className="label-caps">Domain {i + 1}</span>
                  <span className="mt-1 block font-serif text-2xl font-semibold text-brand-navy">{d.name}</span>
                  <span className="mt-1 block text-[15px] text-slate-700">{DOMAIN_INFO[d.name]?.short}</span>
                </span>
                <span className="mt-6 shrink-0 text-sm font-semibold text-brand-dukeblue">
                  <span className="group-open:hidden">Show {d.subdomains.length} criteria</span>
                  <span className="hidden group-open:inline">Hide criteria</span>
                </span>
              </summary>
              <div className="px-5 pb-5 pt-4">
                <p className="text-[15px] text-slate-700">{DOMAIN_INFO[d.name]?.long}</p>
                <dl className="mt-4 divide-y divide-slate-200 border-y border-slate-200">
                  {d.subdomains.map((s) => (
                    <div key={s} className="grid gap-1 py-3 sm:grid-cols-[14rem_1fr] sm:gap-6">
                      <dt className="font-semibold text-slate-900">{s}</dt>
                      <dd className="text-[15px] text-slate-700">{definitionOf(d.name, s) ?? "—"}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </details>
          ))}
        </div>
      </InfoSection>

      <InfoSection id="rating" title="How a criterion is rated">
        <p>{MEETS_RULE.summary}</p>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="border-t-4 border-brand-darkteal bg-slate-50 p-5">
            <p className="font-semibold text-slate-900">Counts as met</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[15px]">
              {MEETS_RULE.counts.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
          <div className="border-t-4 border-brand-bronze bg-slate-50 p-5">
            <p className="font-semibold text-slate-900">Does not count as met</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[15px]">
              {MEETS_RULE.doesNotCount.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        </div>
        <p>
          The rating checks whether a practice <em>exists</em>, not how mature or
          effective it is. If a result looks wrong — for example you answered a
          question but it shows as not met — tell us under that criterion on your{" "}
          <Link href="/dashboard" className="link-more">dashboard</Link>. Feedback goes
          to the platform team.
        </p>
      </InfoSection>

      <InfoSection id="results" title="What each result means">
        <dl className="divide-y divide-slate-200 border-y border-slate-200">
          {STATUS_ORDER.map((s) => (
            <div key={s} className="grid gap-1 py-3 sm:grid-cols-[14rem_1fr] sm:gap-6">
              <dt className="flex items-center gap-2 font-semibold text-slate-900">
                <span className={`h-2.5 w-2.5 rounded-full ${STATUS_META[s].dot}`} aria-hidden />
                {STATUS_META[s].label}
              </dt>
              <dd className="text-[15px] text-slate-700">
                {
                  {
                    meets: "Your material describes a practice that is in place for this criterion.",
                    partial: "Your material covers part of the criterion but not all of it. (The rating step doesn't produce this result yet.)",
                    not_met: "There is material on this criterion, but it doesn't show a practice in place — including when you told us you don't do this yet.",
                    not_reported: "Nothing you've submitted covers this criterion, so it hasn't been assessed.",
                    needs_verification: "There is evidence that hasn't been rated yet, or someone reported that the result rests on the wrong source or organisation.",
                  }[s]
                }
              </dd>
            </div>
          ))}
        </dl>
        <p className="font-semibold text-slate-900">Confidence</p>
        <ul className="list-disc space-y-1 pl-5 text-[15px]">
          {(["high", "moderate", "needs_verification", "self_reported"] as const).map((c) => (
            <li key={c}>
              <strong>{CONFIDENCE_META[c].label}:</strong> {CONFIDENCE_META[c].help}
            </li>
          ))}
        </ul>
      </InfoSection>

      <InfoSection id="roadmap" title="Roadmap stages and thresholds">
        <p>
          The roadmap groups the criteria into six stages, roughly in the order an
          AI tool matures. Some criteria appear in more than one stage because they
          matter again later.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            A stage is <strong>complete</strong> when every criterion in it is met.
          </li>
          <li>
            You are <strong>ready to move on</strong> from a stage once at least{" "}
            {threshold}% of its criteria are met, while you close the remaining gaps.
            This threshold is provisional and may change as scoring is finalised.
          </li>
          <li>
            Your <strong>current stage</strong> is the first stage that isn&apos;t complete.
          </li>
        </ul>
        <ol className="mt-6 space-y-6">
          {STAGES.map((stage) => {
            const items = STAGE_MAPPING[stage.id];
            const needed = Math.ceil(items.length * ADVANCE_THRESHOLD);
            return (
              <li key={stage.id} className="border-l-4 border-brand-navy pl-5">
                <p className="label-caps">Stage {stage.id}</p>
                <p className="mt-1 font-serif text-2xl font-semibold text-brand-navy">{stage.name}</p>
                <p className="mt-1 text-[15px] text-slate-700">{stage.description}</p>
                <p className="mt-2 text-[15px] text-slate-800">
                  <strong>{items.length} criteria.</strong> Ready to move on at {needed} met;
                  complete at {items.length} met.
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {items.map((p) => p.subdomain + (p.revisited ? " (revisited)" : "")).join(" · ")}
                </p>
              </li>
            );
          })}
        </ol>
      </InfoSection>

      <InfoSection id="process" title="How your evidence is processed">
        <ol className="list-decimal space-y-3 pl-5">
          <li>
            <strong>Text is read from your documents.</strong> Each PDF you upload
            is converted to text.
          </li>
          <li>
            <strong>Evidence is sorted into criteria.</strong> An AI model finds what
            the text says about each criterion and writes a short summary of it, with
            a confidence score. Evidence below 50% confidence is left out.
          </li>
          <li>
            <strong>You&apos;re only asked about the gaps.</strong> Questions are shown
            only for criteria your documents didn&apos;t cover.
          </li>
          <li>
            <strong>Each criterion is rated.</strong> An AI model applies the rules
            above to the evidence for that criterion and explains its decision in a
            sentence or two.
          </li>
          <li>
            <strong>You check the results.</strong> Every result shows the evidence
            and the document or answer it came from. Your feedback is reviewed by the
            platform team.
          </li>
        </ol>
        <p>
          AI models are reached through Duke University&apos;s AI gateway. Read{" "}
          <Link href="/data-use" className="link-more">how we use your data</Link>.
        </p>
      </InfoSection>
    </InfoLayout>
  );
}
