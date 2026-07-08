"use client";

/**
 * Top section: company identity + one-line purpose of the platform +
 * stats pulled from the company profile (staff counts, year
 * established, country, organization type). Field names match the
 * `companies` table used by the company-profile page:
 * company_name, country, year_established, full_time_staff,
 * part_time_staff, organization_type.
 *
 * The "continue reporting" banner was removed per request — the
 * report CTA lives in the Next Steps section instead.
 */
export default function CompanyHeader({ company }: { company: any }) {
  const name = company?.company_name ?? company?.name ?? "Your company";

  const initials = String(name)
    .split(/\s+/)
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const orgType = company?.organization_type ?? company?.org_type;
  const established = company?.year_established ?? company?.established;

  return (
    <section aria-labelledby="home-welcome">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-xl font-bold text-white"
              aria-hidden
            >
              {initials}
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
                Welcome back
              </p>
              <h1
                id="home-welcome"
                className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl"
              >
                {name}
              </h1>
              <p className="mt-3 max-w-2xl leading-relaxed text-slate-500">
                Innovator Insights evaluates your organization&apos;s AI
                readiness across five domains — from where your data comes
                from to how your solution is sustained — and turns your
                reports into an evidence-backed roadmap for responsible AI
                adoption.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {orgType && (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    {orgType}
                  </span>
                )}
                {company?.country && (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    {company.country}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Company profile stats */}
          <dl className="grid grid-cols-3 gap-3 sm:gap-4">
            {company?.full_time_staff != null && (
              <StatCard
                label="Full-Time Staff"
                value={company.full_time_staff}
              />
            )}
            {company?.part_time_staff != null && (
              <StatCard
                label="Part-Time Staff"
                value={company.part_time_staff}
              />
            )}
            {established != null && (
              <StatCard label="Established" value={established} />
            )}
          </dl>
        </div>
      </div>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center">
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </dt>
      <dd className="mt-1 text-2xl font-extrabold text-slate-900">{value}</dd>
    </div>
  );
}
