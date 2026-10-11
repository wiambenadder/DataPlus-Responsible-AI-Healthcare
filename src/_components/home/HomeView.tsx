import Link from "next/link";
import { slugify } from "@/lib/assessment";
import { DOMAIN_INFO } from "@/lib/domain-info";
import type { DomainId } from "@/lib/roadmap/framework";

export interface DomainProgress {
  domainId: DomainId;
  name: string;
  practiced: number;
  assessed: number;
  total: number;
}

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Signed-in home page, laid out like a DGHI page: a title band, a row of
 * large figures with links (as on the DGHI home page), results by
 * domain, and next steps as labelled cards.
 */
export default function HomeView({
  company,
  reportCount,
  domainProgress,
}: {
  company: any;
  reportCount: number;
  domainProgress: DomainProgress[];
}) {
  const name = company?.company_name ?? company?.name ?? "Your organisation";
  const orgType = company?.organization_type ?? company?.org_type;
  const established = company?.year_established ?? company?.established;

  const facts = [
    orgType,
    company?.country,
    established ? `Established ${established}` : null,
    staffLine(company?.full_time_staff, company?.part_time_staff),
  ].filter(Boolean);

  const met = domainProgress.reduce((n, d) => n + d.practiced, 0);
  const assessed = domainProgress.reduce((n, d) => n + d.assessed, 0);
  const total = domainProgress.reduce((n, d) => n + d.total, 0);
  const hasReports = reportCount > 0;

  const stats = [
    {
      figure: `${met}`,
      label: `of ${total} criteria met`,
      href: "/dashboard",
      cta: "See your results",
    },
    {
      figure: `${total - assessed}`,
      label: total - assessed === 1 ? "criterion with no evidence yet" : "criteria with no evidence yet",
      href: "/report/assessment",
      cta: hasReports ? "Add or update answers" : "Start your assessment",
    },
    {
      figure: "6",
      label: "roadmap stages to work through",
      href: "/roadmap",
      cta: "Open your roadmap",
    },
  ];

  const nextSteps = [
    {
      label: "Submit evidence",
      href: "/report/assessment",
      title: hasReports ? "Update your assessment" : "Start your assessment",
      body: hasReports
        ? "Change an answer or fill in criteria that have no evidence yet."
        : "Upload documents about your tool, then answer questions on anything they don't cover.",
      cta: hasReports ? "Update answers" : "Get started",
    },
    {
      label: "Check your results",
      href: "/dashboard",
      title: "See the evidence behind every result",
      body: "Each criterion shows what it was based on and where that came from. Tell us when something is wrong.",
      cta: "Open dashboard",
    },
    {
      label: "Learn the framework",
      href: "/framework",
      title: "What each domain and criterion means",
      body: "Plain-language explanations, what counts as met, and the thresholds for each roadmap stage.",
      cta: "Read the explainer",
    },
  ];

  return (
    <div>
      {/* Title band */}
      <div className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-10 sm:px-6 lg:px-8">
          <p className="label-caps">Welcome back</p>
          <h1 className="mt-2 text-4xl sm:text-5xl">{name}</h1>
          {facts.length > 0 && (
            <p className="mt-3 text-[16px] text-slate-700">{facts.join(" · ")}</p>
          )}
        </div>
      </div>

      {/* Figures */}
      <section aria-label="At a glance" className="bg-brand-navy text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-3 sm:px-6 lg:px-8">
          {stats.map((s) => (
            <div key={s.cta} className="border-l-4 border-brand-teal pl-5">
              <p className="font-serif text-5xl font-semibold leading-none">{s.figure}</p>
              <p className="mt-2 text-[16px] text-white/85">{s.label}</p>
              <Link
                href={s.href}
                className="mt-3 inline-block text-sm font-semibold uppercase tracking-[0.08em] text-white underline decoration-white/40 underline-offset-4 hover:decoration-white"
              >
                {s.cta} ›
              </Link>
            </div>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Results by domain */}
        <section aria-labelledby="results-heading">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="label-caps">Your results</p>
              <h2 id="results-heading" className="mt-1 text-3xl">
                Results by domain
              </h2>
            </div>
            <Link href="/dashboard" className="link-more">
              Open full results
            </Link>
          </div>

          <ul className="mt-6 divide-y divide-slate-200 border-y border-slate-200">
            {domainProgress.map((d, i) => (
              <li key={d.domainId}>
                <Link
                  href={`/dashboard#${slugify(d.name)}`}
                  className="group grid gap-2 py-5 sm:grid-cols-[minmax(0,1fr)_12rem] sm:items-center sm:gap-10"
                >
                  <span>
                    <span className="text-sm font-semibold text-slate-500">Domain {i + 1}</span>
                    <span className="block font-serif text-2xl font-semibold text-brand-navy group-hover:underline">
                      {d.name}
                    </span>
                    <span className="mt-0.5 block text-[15px] text-slate-700">{DOMAIN_INFO[d.name]?.short}</span>
                  </span>
                  <span>
                    <span className="block text-[15px] font-semibold text-slate-900">
                      {d.practiced} of {d.total} met
                    </span>
                    <span
                      className="mt-2 block h-2 w-full bg-slate-200"
                      role="img"
                      aria-label={`${d.practiced} of ${d.total} criteria met`}
                    >
                      <span
                        className="block h-full bg-brand-teal"
                        style={{ width: `${d.total ? (d.practiced / d.total) * 100 : 0}%` }}
                      />
                    </span>
                    <span className="mt-1 block text-xs text-slate-600">
                      {d.assessed} of {d.total} have evidence
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Next steps */}
        <section aria-labelledby="next-heading" className="mt-16">
          <p className="label-caps">Next steps</p>
          <h2 id="next-heading" className="mt-1 text-3xl">
            Where to go from here
          </h2>
          <ul className="mt-6 grid gap-6 md:grid-cols-3">
            {nextSteps.map((s) => (
              <li key={s.href} className="flex flex-col border-t-4 border-brand-navy bg-slate-50 p-6">
                <p className="label-caps">{s.label}</p>
                <h3 className="mt-2 font-serif text-2xl font-semibold leading-snug text-brand-navy">{s.title}</h3>
                <p className="mt-2 flex-1 text-[15px] text-slate-700">{s.body}</p>
                <Link href={s.href} className="btn btn-primary mt-5 self-start">
                  {s.cta}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function staffLine(fullTime: unknown, partTime: unknown): string | null {
  const ft = fullTime ?? null;
  const pt = partTime ?? null;
  if (ft === null && pt === null) return null;
  if (ft !== null && pt !== null) return `${ft} full-time and ${pt} part-time staff`;
  if (ft !== null) return `${ft} full-time staff`;
  return `${pt} part-time staff`;
}
