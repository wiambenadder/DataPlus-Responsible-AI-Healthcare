import Link from "next/link";
import { DOMAINS } from "@/lib/roadmap/framework";
import type { DomainId } from "@/lib/roadmap/framework";

export interface DomainProgress {
  domainId: DomainId;
  name: string;
  practiced: number;
  assessed: number;
  total: number;
}

/**
 * The five-domain framework, shown as one card per domain with its
 * subdomain count and a live progress bar. Domain accent colors reuse
 * the same palette as the roadmap page (and the source framework deck),
 * so the homepage, dashboard, and roadmap all speak the same visual
 * language.
 */
export default function FrameworkOverview({
  domainProgress,
}: {
  domainProgress: DomainProgress[];
}) {
  const progressById = new Map(domainProgress.map((p) => [p.domainId, p]));

  return (
    <section
      aria-labelledby="framework-overview"
      className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
            The framework
          </p>
          <h2
            id="framework-overview"
            className="mt-1 text-2xl font-bold tracking-tight text-slate-900"
          >
            Five domains of AI readiness
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
            Every assessment maps to one of 31 subdomains across these five
            domains — following your AI solution from its data sources through
            development and deployment to real-world impact and long-term
            sustainability.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          View full dashboard →
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {DOMAINS.map((d) => {
          const p = progressById.get(d.id);
          const pct = p && p.total > 0 ? Math.round((p.practiced / p.total) * 100) : 0;
          return (
            <div
              key={d.id}
              className={`rounded-xl border ${d.accent.border} ${d.accent.bg} p-4`}
            >
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${d.accent.dot}`} aria-hidden />
                <p
                  className={`text-xs font-semibold uppercase tracking-wider ${d.accent.text}`}
                >
                  {d.id}
                </p>
              </div>
              <h3 className="mt-1.5 text-sm font-bold text-slate-900">{d.name}</h3>
              <p className="mt-0.5 text-xs text-slate-500">
                {d.subdomains.length} subdomains
              </p>

              <div className="mt-3">
                <div
                  className="h-1.5 w-full overflow-hidden rounded-full bg-white"
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${d.name}: ${pct}% practiced`}
                >
                  <div
                    className={`h-full rounded-full ${d.accent.dot}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="mt-1.5 text-xs font-medium text-slate-500">
                  {p ? `${p.practiced} of ${p.total} practiced` : "Not assessed yet"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
