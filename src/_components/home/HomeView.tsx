import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { slugify } from "@/lib/assessment";
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
 * Signed-in home page: who you are, where you stand by domain, and where
 * to go next. Kept deliberately plain — a table and a list rather than
 * cards and icons.
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
  const name = company?.company_name ?? company?.name ?? "Your company";
  const orgType = company?.organization_type ?? company?.org_type;
  const established = company?.year_established ?? company?.established;

  const facts = [
    orgType,
    company?.country,
    established ? `Established ${established}` : null,
    staffLine(company?.full_time_staff, company?.part_time_staff),
  ].filter(Boolean);

  const totalMet = domainProgress.reduce((n, d) => n + d.practiced, 0);
  const total = domainProgress.reduce((n, d) => n + d.total, 0);
  const hasReports = reportCount > 0;

  const nextSteps = [
    {
      href: "/report/assessment",
      title: hasReports ? "Continue reporting" : "Start your first report",
      body: hasReports
        ? "Add a new reporting period, upload documents or finish open questions."
        : "Answer the assessment questions and upload documents. Everything else is built from this.",
    },
    {
      href: "/dashboard",
      title: "Review your results",
      body: "See every criterion with the evidence and source behind it, and flag anything that's wrong.",
    },
    {
      href: "/roadmap",
      title: "Read your roadmap",
      body: "The criteria in six stages, from need and governance to long-term oversight.",
    },
    {
      href: "/report/history",
      title: "Your submissions",
      body: "Earlier answers and the documents you've uploaded.",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
      <header className="border-b border-slate-300 pb-6">
        <p className="text-sm text-slate-500">Welcome back</p>
        <h1 className="mt-1 text-3xl font-semibold text-slate-900 sm:text-4xl">
          {name}
        </h1>
        {facts.length > 0 && (
          <p className="mt-2 text-[15px] text-slate-600">{facts.join(" · ")}</p>
        )}
      </header>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div>
          {/* Results by domain */}
          <section aria-labelledby="results-heading">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="results-heading" className="text-xl font-semibold text-slate-900">
                Your results by domain
              </h2>
              <Link
                href="/dashboard"
                className="text-sm font-semibold text-blue-600 hover:underline"
              >
                Open full results
              </Link>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              {hasReports
                ? `${totalMet} of ${total} criteria met so far.`
                : "No results yet — they appear here once you've submitted a report."}
            </p>

            <table className="mt-4 w-full border-y border-slate-300 bg-white text-left text-sm">
              <thead className="border-b border-slate-200 text-xs text-slate-500">
                <tr>
                  <th scope="col" className="px-4 py-2 font-semibold">Domain</th>
                  <th scope="col" className="px-4 py-2 font-semibold">Criteria met</th>
                  <th scope="col" className="hidden px-4 py-2 font-semibold sm:table-cell">
                    Assessed
                  </th>
                  <th scope="col" className="w-2/5 px-4 py-2">
                    <span className="sr-only">Progress</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {domainProgress.map((d, i) => (
                  <tr key={d.domainId} className="hover:bg-slate-50">
                    <th scope="row" className="px-4 py-3 font-normal">
                      <Link
                        href={`/dashboard#${slugify(d.name)}`}
                        className="font-semibold text-slate-900 hover:text-blue-600 hover:underline"
                      >
                        <span className="mr-1.5 tabular-nums text-slate-400">{i + 1}.</span>
                        {d.name}
                      </Link>
                    </th>
                    <td className="px-4 py-3 tabular-nums text-slate-800">
                      {d.practiced} of {d.total}
                    </td>
                    <td className="hidden px-4 py-3 tabular-nums text-slate-600 sm:table-cell">
                      {d.assessed} of {d.total}
                    </td>
                    <td className="px-4 py-3">
                      <div
                        className="h-1.5 w-full bg-slate-200"
                        role="img"
                        aria-label={`${d.practiced} of ${d.total} criteria met`}
                      >
                        <div
                          className="h-full bg-blue-600"
                          style={{ width: `${d.total ? (d.practiced / d.total) * 100 : 0}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Next steps */}
          <section aria-labelledby="next-heading" className="mt-12">
            <h2 id="next-heading" className="text-xl font-semibold text-slate-900">
              Next steps
            </h2>
            <ul className="mt-3 divide-y divide-slate-200 border-y border-slate-300">
              {nextSteps.map((s, i) => (
                <li key={s.href}>
                  <Link
                    href={s.href}
                    className="group flex items-start gap-4 px-1 py-4 hover:bg-white"
                  >
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-[15px] font-semibold group-hover:underline ${
                          i === 0 && !hasReports ? "text-blue-600" : "text-slate-900"
                        }`}
                      >
                        {s.title}
                      </p>
                      <p className="mt-0.5 text-sm text-slate-600">{s.body}</p>
                    </div>
                    <ArrowRight
                      className="mt-1 h-4 w-4 shrink-0 text-slate-400 group-hover:text-blue-600"
                      aria-hidden
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-900">
              How the assessment works
            </h2>
            <ol className="mt-3 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-slate-700 marker:text-slate-400">
              <li>
                <strong className="font-semibold text-slate-900">Share your work.</strong>{" "}
                Answer the questions and upload reports, decks or anything else that
                shows how you build and run your tool.
              </li>
              <li>
                <strong className="font-semibold text-slate-900">Evidence is mapped.</strong>{" "}
                The platform finds what your material says about each of 31
                criteria in five domains, and rates it. This step is AI-assisted.
              </li>
              <li>
                <strong className="font-semibold text-slate-900">Check the results.</strong>{" "}
                Every rating shows the evidence and the source it came from. If
                something is wrong, say so under that criterion.
              </li>
              <li>
                <strong className="font-semibold text-slate-900">Use the roadmap.</strong>{" "}
                The criteria are grouped into six stages so you can see what to
                work on next.
              </li>
            </ol>
          </section>

          <section className="text-sm leading-relaxed text-slate-600">
            <h2 className="font-sans text-sm font-semibold text-slate-900">
              What the results mean
            </h2>
            <dl className="mt-2 space-y-1.5">
              <div>
                <dt className="inline font-semibold text-slate-800">Meets criterion</dt>{" "}
                <dd className="inline">— the evidence shows the practice is in place.</dd>
              </div>
              <div>
                <dt className="inline font-semibold text-slate-800">Does not currently meet</dt>{" "}
                <dd className="inline">— the evidence doesn&apos;t yet show it in place.</dd>
              </div>
              <div>
                <dt className="inline font-semibold text-slate-800">Not reported</dt>{" "}
                <dd className="inline">— nothing you&apos;ve submitted covers it yet.</dd>
              </div>
            </dl>
          </section>
        </aside>
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
