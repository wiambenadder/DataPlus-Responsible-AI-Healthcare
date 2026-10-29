import Link from "next/link";
import { slugify } from "@/lib/assessment";
import { countryFlag } from "@/lib/countryFlag";
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

/** The four steps of the assessment, each pointing to the page that does it. */
const GUIDE = [
  {
    title: "Share what you have",
    what: "Upload reports, evaluations or policies you already have, then answer short questions only on what they don't cover.",
    why: "No new paperwork, and nothing is rated on guesswork.",
    href: "/report/assessment",
    cta: "Submit Evidence",
  },
  {
    title: "Check every rating",
    what: "Each practice shows its rating, the reason for it and the exact passage it came from.",
    why: "You can see why, correct mistakes, and trust what you show others.",
    href: "/dashboard",
    cta: "Results",
  },
  {
    title: "Plan your next steps",
    what: "The roadmap orders the practices into six stages and shows which one to strengthen next.",
    why: "You know where to focus first instead of facing 31 practices at once.",
    href: "/roadmap",
    cta: "Roadmap",
  },
  {
    title: "Share your progress",
    what: "Download your results as a PDF and invite colleagues to review them with you.",
    why: "A clear, sourced summary to bring to funders, partners and ministries.",
    href: "/dashboard",
    cta: "Download from Results",
  },
];

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
    company?.country ? `${countryFlag(company.country)} (${company.country})` : null,
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
            <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-slate-700">
              This is your organization&apos;s overview. It shows how ready your AI tool is for
              responsible, real-world use, based on the documents and answers your team has
              shared, and what to work on next.
            </p>
          </div>

          <div className="md:text-right">
            <p className="font-serif leading-none text-brand-navy">
              <span className="text-7xl">{met}</span>
              <span className="ml-2 text-4xl text-slate-500">of {total}</span>
            </p>
            <p className="mt-2 text-[15px] text-slate-700">
              practices met <span className="text-slate-500">({pct}%)</span>
            </p>
            <p className="mt-1 max-w-[17rem] text-[13.5px] leading-snug text-slate-500 md:ml-auto">
              A practice is met when your evidence shows it is already in place.
            </p>
            <Link href="/dashboard" className="link-more mt-2 inline-block text-[15px]">
              See all results ›
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* A plain-language guide for innovators opening this page for the
            first time: what the assessment does, what each part of the site
            is for, and why it's worth their time. */}
        <section className="mt-12" aria-labelledby="how-heading">
          <div className="section-head">
            <h2 id="how-heading">How the Assessment Works</h2>
            <Link href="/framework" className="link-more">
              Read about the framework ›
            </Link>
          </div>
          <p className="mt-4 max-w-3xl text-[16px] leading-relaxed text-slate-700">
            The assessment compares what your team has shared with 31 practices that matter
            when an AI tool moves from a pilot into everyday care. You don&apos;t need to write
            anything new to start: it reads the reports you already have. In return you get an
            evidence-backed picture of your tool that you can act on and share.
          </p>
          <ol className="mt-8 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {GUIDE.map((g, i) => (
              <li key={g.title} className="flex flex-col">
                <p className="font-serif text-5xl leading-none text-brand-navy">{i + 1}</p>
                <h3 className="mt-3 text-lg font-bold text-ink">{g.title}</h3>
                <p className="mt-1 text-[15px] leading-relaxed text-slate-700">{g.what}</p>
                <p className="mb-4 mt-2 text-[14.5px] leading-relaxed text-slate-500">
                  <span className="font-semibold text-slate-600">Why it helps: </span>
                  {g.why}
                </p>
                <p className="mt-auto">
                  <Link href={g.href} className="link-more">
                    {g.cta} ›
                  </Link>
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* Domains */}
        <section className="mt-16" aria-labelledby="domains-heading">
          <div className="section-head">
            <h2 id="domains-heading">Your Five Domains</h2>
            <Link href="/framework#domains" className="link-more">
              What the domains mean ›
            </Link>
          </div>
          <p className="mt-4 max-w-3xl text-[16px] leading-relaxed text-slate-700">
            The 31 practices are grouped into five domains that follow an AI tool from the data
            it learns from to whether it can last. Innovations in Healthcare developed them
            through research with health innovators. A low score shows where to focus; open a
            domain to see each practice, its rating and the evidence behind it.
          </p>
          <ul className="mt-8 grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-5">
            {domainProgress.map((d, i) => {
              const st = domainStyle(d.name);
              return (
                <li key={d.domainId} className="flex">
                  <Link
                    href={`/dashboard#${slugify(d.name)}`}
                    className="group flex w-full flex-col border-t-4 pt-3"
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
                    <span className="block text-[14.5px] font-semibold text-slate-700">{st.tagline}</span>
                    <span className="mb-4 mt-1 block text-[14px] leading-snug text-slate-600">
                      {st.why}
                    </span>
                    <span
                      className="mt-auto block h-1.5 bg-slate-200"
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
          <p className="mt-4 max-w-3xl text-[16px] leading-relaxed text-slate-700">
            Three ways to strengthen your results: follow your roadmap, add evidence where it is
            missing, and check that each rating is right.
          </p>
          <div className="mt-8 grid gap-8 lg:grid-cols-[1.8fr_1fr_1fr]">
            <div className="bg-brand-navy text-white">
              <div className="p-6 sm:p-7">
                <p className="text-[0.75rem] font-bold uppercase tracking-[0.1em] text-blue-200">
                  Your Roadmap
                </p>
                <h3 className="mt-2 font-serif text-[1.75rem] font-medium leading-tight">
                  {!hasData ? "Your roadmap starts here" : `Stage ${stage.id} of 6: ${stage.name}`}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-blue-50">
                  The roadmap puts the 31 practices in the order an AI tool usually matures, in six
                  stages, from showing the need for the tool to overseeing it for the long term. It
                  shows which stage you are in and what to do to reach the next one.
                </p>
                <p className="mb-5 mt-3 border-t border-white/20 pt-3 text-[15px] leading-relaxed text-white">
                  {!hasData
                    ? "Upload what you have. Your stages fill in as soon as your first results are ready."
                    : stage.state === "complete"
                      ? "You have met every practice in all six stages. Keep your evidence up to date."
                      : toGo === 0
                        ? `You have met ${stage.practicedCount} of ${stage.totalCount} practices in this stage, enough to move on to Stage ${Math.min(6, stage.id + 1)}. Meet the remaining ${stage.totalCount - stage.practicedCount} to complete it.`
                        : `You have met ${stage.practicedCount} of ${stage.totalCount} practices in this stage. Meet ${toGo === 1 ? "one more" : `${spell(toGo)} more`}${open.length ? `, such as ${listOr(open.slice(0, 2))},` : ""} to move on to Stage ${Math.min(6, stage.id + 1)}.`}
                </p>
                <Link
                  href={hasData ? "/roadmap" : "/report/assessment"}
                  className="font-bold text-white underline decoration-white/60 underline-offset-4 hover:decoration-white"
                >
                  {hasData ? "Open your roadmap ›" : "Start the assessment ›"}
                </Link>
              </div>
            </div>

            <NextCard
              title="Add Evidence"
              text={`Ratings can only reflect what you share. ${
                noEvidence > 0
                  ? `${capital(spell(noEvidence))} ${noEvidence === 1 ? "practice has" : "practices have"} no evidence yet; a short written answer can be enough.`
                  : "Update an answer when something changes; changed answers are rated again."
              }`}
              href="/report/assessment"
              cta="Submit evidence"
            />
            <NextCard
              title="Check Your Ratings"
              text="Ratings are produced by AI from your evidence, so they can be wrong. Tell us when one is, or when it cites another organization's work, so the team can correct it."
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
