"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import StatusBadge from "@/_components/roadmap/StatusBadge";
import { DOMAIN_STYLE } from "@/lib/domain-info";
import type { Source } from "@/lib/library/search";
import { DOMAINS } from "@/lib/roadmap/framework";
import {
  needsRecommendation,
  type RecommendationOverview,
  type RecommendationPractice,
  type RecommendationPriority,
  type RecommendationResult,
} from "@/lib/roadmap/recommendations";
import {
  loadRecommendations,
  type RecommendationEntries,
} from "@/lib/roadmap/recommendations-client";

function practiceAnchor(practice: RecommendationPractice) {
  return `practice-${practice.domainId}-${practice.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

function sourceUrl(source: Source) {
  if (!source.url) return null;
  try {
    const url = new URL(source.url);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (source.page && /\.pdf$/i.test(url.pathname) && !url.hash)
      url.hash = `page=${source.page}`;
    return url.href;
  } catch {
    return null;
  }
}

function SourceLinks({
  sources,
  related,
}: {
  sources: Source[];
  related: boolean;
}) {
  return (
    <div className="mt-4 border-t border-slate-200 pt-3 text-sm">
      <p className="font-semibold text-ink">
        {related ? "Related reading" : "Sources used"}
      </p>
      <ul className="mt-2 space-y-2">
        {sources.map((source) => {
          const href = sourceUrl(source);
          return (
            <li key={source.n}>
              {!related && (
                <span className="mr-2 text-slate-600">[{source.n}]</span>
              )}
              {href ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="link-more"
                >
                  {source.title}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              ) : (
                <span className="font-medium text-ink">{source.title}</span>
              )}
              {source.page && (
                <span className="ml-2 text-slate-600">p. {source.page}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function PracticeAdvice({ entry }: { entry?: RecommendationResult }) {
  if (entry?.kind === "generated") {
    return (
      <div
        className="mt-4 border-l-4 border-brand-teal bg-slate-50 p-4"
        aria-live="polite"
      >
        <h3 className="text-base font-bold text-brand-navy">
          Suggested next step
        </h3>
        <p className="mt-1 text-slate-700">{entry.action}</p>
        <h3 className="mt-3 text-base font-bold text-brand-navy">
          Evidence to collect
        </h3>
        <p className="mt-1 text-slate-700">{entry.evidence}</p>
        <SourceLinks sources={entry.sources} related={false} />
      </div>
    );
  }
  if (entry?.kind === "reading") {
    return (
      <div className="mt-4" aria-live="polite">
        <p className="text-sm text-slate-700">
          The assistant didn’t produce a cited recommendation. You can still
          review these library matches.
        </p>
        <SourceLinks sources={entry.sources} related />
      </div>
    );
  }
  const message = !entry
    ? "Preparing a recommendation…"
    : entry.kind === "no_sources"
      ? "No matching passages were found for this practice in the resource library."
      : "We couldn’t prepare this recommendation. Reload the page to try again.";
  return (
    <p className="mt-3 text-sm text-slate-700" role="status">
      {message}
    </p>
  );
}

export default function RecommendationsPage() {
  const [overview, setOverview] = useState<RecommendationOverview | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [entries, setEntries] = useState<RecommendationEntries>({});
  const [priorities, setPriorities] = useState<RecommendationPriority[] | null>(
    null,
  );
  const [summaryFailed, setSummaryFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    loadRecommendations(controller.signal)
      .then(async ({ overview, prepare, summarize }) => {
        if (controller.signal.aborted) return;
        setOverview(overview);
        const results = await prepare((results) => {
          if (!controller.signal.aborted) setEntries(results);
        });
        if (controller.signal.aborted) return;
        try {
          const summary = await summarize(results);
          if (!controller.signal.aborted) setPriorities(summary);
        } catch {
          if (!controller.signal.aborted) setSummaryFailed(true);
        }
      })
      .catch((error: Error) => {
        if (!controller.signal.aborted) setLoadError(error.message);
      });
    return () => controller.abort();
  }, []);

  const practices = overview?.practices.filter(needsRecommendation) ?? [];
  const hasIncompleteAdvice = practices.some(
    ({ id }) => entries[id]?.kind !== "generated",
  );
  const groups = DOMAINS.map((domain) => ({
    ...domain,
    practices: practices.filter((practice) => practice.domainId === domain.id),
  })).filter((domain) => domain.practices.length > 0);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      <header>
        <p className="label-caps">
          {overview?.company || "AI Readiness Assessment"}
        </p>
        <h1 className="mt-2 text-4xl sm:text-5xl">Recommendations</h1>
        <p className="mt-3 max-w-3xl text-lg text-slate-700">
          See what to work on after your AI Readiness Assessment, with next
          steps and sources from the resource library.
        </p>
        {overview?.period && (
          <p className="mt-3 text-sm text-slate-600">
            Latest reporting period: {overview.period}
          </p>
        )}
      </header>

      {loadError ? (
        <p className="mt-8 text-slate-700" role="alert">
          {loadError}{" "}
          {loadError.startsWith("Log in") && (
            <Link href="/login" className="link-more">
              Go to login
            </Link>
          )}
        </p>
      ) : !overview ? (
        <p className="mt-8 text-slate-600" role="status">
          Loading your assessment…
        </p>
      ) : !overview.hasAssessment || !practices.length ? (
        <div className="mt-8 border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-2xl">
            {overview.hasAssessment
              ? "No recommendations to prepare"
              : "Your assessment is not ready yet"}
          </h2>
          <p className="mt-2 text-slate-700">
            {overview.hasAssessment
              ? "No practices are marked Does not currently meet in this assessment."
              : "Once your first assessment is ready, you can get recommendations for the practices that need attention."}
          </p>
          <Link
            href={
              overview.hasAssessment
                ? "/assessment-overview"
                : "/report/assessment"
            }
            className="link-more mt-3 inline-block"
          >
            {overview.hasAssessment
              ? "View Assessment Summary"
              : "Go to the assessment"}
          </Link>
        </div>
      ) : (
        <>
          <section
            aria-labelledby="priorities-title"
            className="mt-8 border border-slate-200 bg-slate-50 p-5 sm:p-7"
          >
            <h2 id="priorities-title" className="text-3xl">
              Recommendation summary
            </h2>
            {priorities?.length ? (
              <>
                <ol className="mt-5 list-decimal divide-y divide-slate-200 pl-6 marker:font-bold marker:text-brand-dukeblue">
                  {priorities.map((priority, index) => (
                    <li key={index} className="py-3 pl-2 first:pt-0">
                      <h3 className="text-lg font-bold text-brand-navy">
                        {priority.title}
                      </h3>
                      <p className="mt-1 max-w-3xl text-slate-700">
                        {priority.description}
                      </p>
                    </li>
                  ))}
                </ol>
                {hasIncompleteAdvice && (
                  <p className="mt-2 text-sm text-slate-600">
                    This summary reflects the recommendations available so far.
                  </p>
                )}
              </>
            ) : (
              <p className="mt-3 text-sm text-slate-700" role="status">
                {summaryFailed
                  ? "The summary is unavailable. You can still review the recommendations below."
                  : priorities
                    ? "No cited recommendations are available yet. Expand a practice below to see what the library search found."
                    : "Preparing your recommendation summary…"}
              </p>
            )}
            <a
              href="#recommendation-details"
              className="link-more mt-4 inline-block text-sm"
            >
              View detailed recommendations
            </a>
          </section>

          <section
            id="recommendation-details"
            aria-labelledby="details-title"
            className="mt-10"
          >
            <h2 id="details-title" className="text-3xl">
              Recommendations by domain
            </h2>
            <p className="mt-2 text-slate-700">
              Open a practice to see what the assessment looks for, what to do
              next, and which resources to read.
            </p>
            <nav
              className="mt-4 flex flex-wrap gap-2"
              aria-label="Jump to a domain"
            >
              {groups.map((domain) => (
                <a
                  key={domain.id}
                  href={`#domain-${domain.id}`}
                  className="rounded-full border border-slate-300 px-3 py-1.5 text-sm font-semibold text-brand-navy hover:bg-slate-100"
                >
                  {domain.name} ({domain.practices.length})
                </a>
              ))}
            </nav>
            {groups.map((domain) => (
              <section
                key={domain.id}
                id={`domain-${domain.id}`}
                aria-labelledby={`heading-${domain.id}`}
                className="mt-7"
              >
                <h3
                  id={`heading-${domain.id}`}
                  className="border-l-4 pl-3 text-2xl"
                  style={{ borderColor: DOMAIN_STYLE[domain.name]?.accent }}
                >
                  {domain.name}
                </h3>
                <div className="mt-3 space-y-2">
                  {domain.practices.map((practice) => (
                    <details
                      key={practice.id}
                      id={practiceAnchor(practice)}
                      className="scroll-mt-40 border border-slate-200 bg-white"
                    >
                      <summary className="cursor-pointer px-4 py-4 text-brand-navy hover:bg-slate-50">
                        <span className="mx-2 inline font-semibold">
                          {practice.name}
                        </span>{" "}
                        <StatusBadge status={practice.status} />
                      </summary>
                      <div className="border-t border-slate-200 px-5 py-4">
                        {practice.criterion && (
                          <p className="text-sm text-slate-700">
                            <strong>What this practice looks for:</strong>{" "}
                            {practice.criterion}
                          </p>
                        )}
                        <PracticeAdvice entry={entries[practice.id]} />
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            ))}
          </section>

          <p className="mt-8 text-sm text-slate-600">
            Use these suggestions as a starting point for your team.{" "}
            <Link href="/assessment-overview" className="link-more">
              Review assessment evidence
            </Link>{" "}
            or{" "}
            <Link href="/roadmap" className="link-more">
              ask the Roadmap Assistant a follow-up question
            </Link>
            .
          </p>
        </>
      )}
    </div>
  );
}
