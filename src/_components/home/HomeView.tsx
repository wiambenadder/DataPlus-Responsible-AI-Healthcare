import Link from "next/link";
import Photo from "@/components/Photo";
import { slugify } from "@/lib/assessment";
import { domainStyle } from "@/lib/domain-info";
import { ADVANCE_THRESHOLD, type DomainId } from "@/lib/roadmap/framework";
import type { RoadmapModel } from "@/lib/roadmap/types";

export interface DomainProgress {
  domainId: DomainId;
  name: string;
  practiced: number;
  assessed: number;
  total: number;
}

export interface HomeSummary {
  firstName: string | null;
  domainProgress: DomainProgress[];
  documents: string[];
  answers: number;
  lastUpdated: Date | null;
  team: string[];
  commentsThisWeek: number;
  roadmap: RoadmapModel;
}

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Signed-in home page: a grey title band with the company and the overall
 * figure, the five domains, next steps and the team.
 */
export default function HomeView({ company, summary }: { company: any; summary: HomeSummary }) {
  const name = company?.company_name ?? company?.name ?? "Your organization";
  const orgType = company?.organization_type ?? company?.org_type;
  const established = company?.year_established ?? company?.established;
  const staff = staffCount(company?.full_time_staff, company?.part_time_staff);

  const facts = [
    orgType,
    company?.country,
    established ? `Founded ${established}` : null,
    staff,
  ].filter(Boolean);

  const { domainProgress } = summary;
  const met = domainProgress.reduce((n, d) => n + d.practiced, 0);
  const assessed = domainProgress.reduce((n, d) => n + d.assessed, 0);
  const total = domainProgress.reduce((n, d) => n + d.total, 0);
  const pct = total ? Math.round((met / total) * 100) : 0;
  const noEvidence = total - assessed;
  const hasData = assessed > 0 || summary.documents.length > 0;

  const stage = summary.roadmap.stages.find((s) => s.id === summary.roadmap.currentStageId)!;
  const needed = Math.ceil(stage.totalCount * ADVANCE_THRESHOLD);
  const toGo = Math.max(0, needed - stage.practicedCount);
  const open = stage.domainGroups
    .flatMap((g) => g.subdomains)
    .filter((s) => s.status === "no_data" || s.status === "not_practiced")
    .map((s) => s.name);

  return (
    <div>
      {/* Title band */}
      <div className="border-b border-slate-200 bg-whisper">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_auto] md:items-end lg:px-8">
          <div>
            <p className="label-caps">
              {summary.firstName ? `Welcome back, ${summary.firstName}` : "Welcome back"}
            </p>
            <h1 className="mt-2 text-4xl sm:text-5xl">{name}</h1>
            {facts.length > 0 && (
              <p className="mt-3 text-[15px] text-slate-700">{facts.join("  ·  ")}</p>
            )}
            <p className="mt-1 text-[14.5px] text-slate-600">{sourceLine(summary)}</p>
          </div>

          <div className="md:text-right">
            <p className="font-serif leading-none text-brand-navy">
              <span className="text-7xl">{met}</span>
              <span className="ml-2 text-4xl text-slate-500">of {total}</span>
            </p>
            <p className="mt-2 text-[15px] text-slate-700">
              practices met <span className="text-slate-500">({pct} percent)</span>
            </p>
            <Link href="/dashboard" className="link-more mt-2 inline-block text-[15px]">
              See all results ›
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Domains */}
        <section className="mt-12" aria-labelledby="domains-heading">
          <div className="section-head">
            <h2 id="domains-heading">Your Five Domains</h2>
            <Link href="/framework#domains" className="link-more">
              What the domains mean ›
            </Link>
          </div>
          <ul className="mt-6 grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-5">
            {domainProgress.map((d, i) => {
              const st = domainStyle(d.name);
              return (
                <li key={d.domainId}>
                  <Link
                    href={`/dashboard#${slugify(d.name)}`}
                    className="group block border-t-4 pt-3"
                    style={{ borderTopColor: st.accent }}
                  >
                    <span
                      className="block text-[0.75rem] font-bold uppercase tracking-[0.1em]"
                      style={{ color: st.text }}
                    >
                      Domain {i + 1}
                    </span>
                    <span className="block text-lg font-bold text-ink group-hover:underline">
                      {d.name}
                    </span>
                    <span className="block min-h-[3rem] text-[14.5px] text-slate-600">{st.tagline}</span>
                    <span
                      className="mt-3 block h-1.5 bg-slate-200"
                      role="img"
                      aria-label={`${d.practiced} of ${d.total} practices met`}
                    >
                      <span
                        className="block h-full"
                        style={{
                          width: `${d.total ? (d.practiced / d.total) * 100 : 0}%`,
                          background: st.accent,
                        }}
                      />
                    </span>
                    <span className="mt-2 block text-[14.5px] text-ink">
                      <strong>
                        {d.practiced} of {d.total}
                      </strong>{" "}
                      met
                      {d.total - d.assessed > 0 && (
                        <span className="text-slate-500"> · {d.total - d.assessed} no evidence</span>
                      )}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Next steps */}
        <section className="mt-16" aria-labelledby="next-heading">
          <div className="section-head">
            <h2 id="next-heading">Next Steps</h2>
          </div>
          <div className="mt-6 grid gap-8 lg:grid-cols-[1.8fr_1fr_1fr]">
            <div className="grid bg-brand-navy text-white sm:grid-cols-[1fr_190px]">
              <div className="p-6 sm:p-7">
                <p className="text-[0.75rem] font-bold uppercase tracking-[0.1em] text-blue-200">
                  Roadmap · Stage {stage.id} of 6
                </p>
                <h3 className="mt-2 font-serif text-[1.75rem] font-medium leading-tight">
                  {!hasData
                    ? "Start your assessment"
                    : stage.state === "complete"
                      ? "All stages complete"
                      : toGo === 0
                        ? `Ready to move on from Stage ${stage.id}`
                        : `${toGo === 1 ? "One practice" : `${spell(toGo)} practices`} from Stage ${Math.min(6, stage.id + 1)}`}
                </h3>
                <p className="mb-5 mt-2 text-[15px] leading-relaxed text-blue-50">
                  {!hasData
                    ? "Upload what you have. Your roadmap fills in as soon as your first results are ready."
                    : toGo > 0 && open.length
                      ? `Meet ${listOr(open.slice(0, 2))}${open.length > 2 ? " or another open practice" : ""} to move on.`
                      : `${stage.name}: ${stage.practicedCount} of ${stage.totalCount} practices met.`}
                </p>
                <Link
                  href={hasData ? "/roadmap" : "/report/assessment"}
                  className="font-bold text-white underline decoration-white/60 underline-offset-4 hover:decoration-white"
                >
                  {hasData ? "Open your roadmap ›" : "Start the assessment ›"}
                </Link>
              </div>
              <div className="hidden h-full min-h-[200px] sm:block">
                <Photo name="aiReadinessAlt" width={500} />
              </div>
            </div>

            <NextCard
              title="Add Evidence"
              text={
                noEvidence > 0
                  ? `${capital(spell(noEvidence))} ${noEvidence === 1 ? "practice has" : "practices have"} no evidence yet. A short written answer can be enough.`
                  : "Upload new documents or update an answer when something changes."
              }
              href="/report/assessment"
              cta="Submit evidence"
            />
            <NextCard
              title="Check Your Ratings"
              text="Tell us if a rating is wrong or cites the wrong source or company."
              href="/dashboard"
              cta="Open results"
            />
          </div>
        </section>

        {/* Team */}
        <section
          aria-label="Your team"
          className="mt-12 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-slate-200 py-4 text-[15px]"
        >
          <strong className="text-ink">Your team</strong>
          <span className="text-slate-600">
            {summary.team.length ? summary.team.join(", ") : "Only you so far"}
          </span>
          {summary.commentsThisWeek > 0 && (
            <span className="text-slate-600">
              · {summary.commentsThisWeek} {summary.commentsThisWeek === 1 ? "comment" : "comments"} on
              your results this week
            </span>
          )}
          <Link href="/company" className="link-more ml-auto">
            Invite a colleague ›
          </Link>
        </section>

        <p className="mt-6 text-[15px] text-slate-600">
          We&apos;ve made changes based on feedback from innovators who tested the platform.{" "}
          <Link href="/whats-new" className="link-more">
            See what&apos;s new ›
          </Link>
        </p>
      </div>
    </div>
  );
}

function NextCard({ title, text, href, cta }: { title: string; text: string; href: string; cta: string }) {
  return (
    <div className="flex flex-col border-t border-slate-200 pt-5">
      <h3 className="font-serif text-[1.65rem] font-medium leading-tight text-brand-navy">{title}</h3>
      <p className="mb-5 mt-2 text-[15px] leading-relaxed text-slate-600">{text}</p>
      <p className="mt-auto">
        <Link href={href} className="link-more">
          {cta} ›
        </Link>
      </p>
    </div>
  );
}

function sourceLine(s: HomeSummary): string {
  if (!s.documents.length && !s.answers) return "No documents or answers yet.";
  const docs =
    s.documents.length === 1
      ? s.documents[0]
      : s.documents.length > 1
        ? `${s.documents.length} documents`
        : null;
  const from = docs ? `${docs} and your answers` : "your answers";
  const when = s.lastUpdated
    ? ` · updated ${s.lastUpdated.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
    : "";
  return `Evidence from ${from}${when}`;
}

function staffCount(fullTime: unknown, partTime: unknown): string | null {
  const ft = Number(fullTime ?? 0) || 0;
  const pt = Number(partTime ?? 0) || 0;
  if (!ft && !pt) return null;
  return `${ft + pt} staff`;
}

/** AP style: spell out one through nine. */
function spell(n: number): string {
  return ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"][n] ?? String(n);
}

function capital(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function listOr(items: string[]): string {
  return items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} or ${items[items.length - 1]}`;
}
