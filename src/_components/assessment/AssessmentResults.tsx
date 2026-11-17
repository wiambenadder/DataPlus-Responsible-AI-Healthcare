"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ChevronDown, Download, Link2 } from "lucide-react";
import { FRAMEWORK } from "@/lib/framework";
import {
  STATUS_META,
  STATUS_ORDER,
  buildResults,
  slugify,
  type Confidence,
  type EvidenceItem,
  type MappingRow,
  type ResponseRow,
  type Status,
  type SubdomainResult,
  type UploadRow,
} from "@/lib/assessment";
import { normalizeName } from "@/lib/feedback-format";
import { DOMAIN_INFO, domainStyle } from "@/lib/domain-info";
import type { FeedbackApi } from "@/_components/feedback/useFeedback";
import FeedbackSection from "@/_components/feedback/FeedbackSection";
import SubdomainItem from "@/_components/assessment/SubdomainItem";
import SourceDrawer from "@/_components/assessment/SourceDrawer";
import BackToTop from "@/_components/assessment/BackToTop";

const DOMAIN_ENTRIES = Object.entries(FRAMEWORK) as [string, string[]][];
const DOMAIN_SLUGS = DOMAIN_ENTRIES.map(([d]) => slugify(d));

type Props = {
  companyName: string | null;
  user: { id: string; email: string | null };
  responses: ResponseRow[];
  mappings: MappingRow[];
  uploads: UploadRow[];
  feedback: FeedbackApi;
  children: ReactNode;
};

/** The assessment summary and evidence frame the roadmap stages. */
export default function AssessmentResults({
  companyName,
  user,
  responses,
  mappings,
  uploads,
  feedback,
  children,
}: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [collapsedDomains, setCollapsedDomains] = useState(
    () => new Set(DOMAIN_SLUGS),
  );
  const [drawer, setDrawer] = useState<{
    item: EvidenceItem;
    subdomain: string;
  } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState(false);
  const details = useRef<HTMLDetailsElement>(null);
  const [selectedAnchor, setSelectedAnchor] = useState<string | null>(null);

  const results = useMemo(
    () =>
      buildResults({
        framework: DOMAIN_ENTRIES,
        responses,
        mappings,
        uploads,
      }),
    [responses, mappings, uploads],
  );

  const domains = useMemo(
    () =>
      DOMAIN_ENTRIES.map(([name, subs], i) => ({
        name,
        slug: DOMAIN_SLUGS[i],
        number: i + 1,
        items: subs.map((s) => results.get(normalizeName(s))!),
      })),
    [results],
  );

  /* ---------------- status with feedback taken into account ---------------- */

  // An open "Wrong source or company" report puts the result in doubt.
  const disputedOf = useCallback(
    (r: SubdomainResult) =>
      feedback
        .forSubdomain(r.subdomain)
        .some(
          (e) =>
            e.kind === "wrong_source" &&
            e.reviewStatus === "open" &&
            e.id !== null &&
            e.sync !== "deleting",
        ),
    [feedback],
  );
  const statusOf = useCallback(
    (r: SubdomainResult): Status =>
      disputedOf(r) && r.baseStatus !== "not_reported"
        ? "needs_verification"
        : r.baseStatus,
    [disputedOf],
  );
  const confidenceOf = useCallback(
    (r: SubdomainResult): Confidence | null =>
      disputedOf(r) ? "needs_verification" : r.baseConfidence,
    [disputedOf],
  );

  const allItems = domains.flatMap((d) => d.items);
  const counts = new Map<Status, number>();
  allItems.forEach((r) =>
    counts.set(statusOf(r), (counts.get(statusOf(r)) ?? 0) + 1),
  );
  /* ---------------- deep links ---------------- */

  const applyHash = useCallback(() => {
    const target = window.location.hash.slice(1);
    if (!target) return;
    if (target === "assessment-details" && details.current) {
      details.current.open = true;
      details.current.scrollIntoView({ block: "start" });
      return;
    }
    const [domainSlug, subSlug] = target.split("--");
    if (!DOMAIN_SLUGS.includes(domainSlug)) return;
    if (details.current) details.current.open = true;

    setCollapsedDomains((prev) => {
      if (!prev.has(domainSlug)) return prev;
      const next = new Set(prev);
      next.delete(domainSlug);
      return next;
    });
    if (subSlug) setExpanded((prev) => new Set(prev).add(target));

    // Wait for the section to render open before scrolling to it.
    requestAnimationFrame(() =>
      requestAnimationFrame(() =>
        document.getElementById(target)?.scrollIntoView({ block: "start" }),
      ),
    );
  }, []);

  useEffect(() => {
    const first = requestAnimationFrame(applyHash);
    window.addEventListener("hashchange", applyHash);
    return () => {
      cancelAnimationFrame(first);
      window.removeEventListener("hashchange", applyHash);
    };
  }, [applyHash]);

  /* ---------------- expand / collapse ---------------- */

  const toggleItem = (anchor: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(anchor)) next.delete(anchor);
      else next.add(anchor);
      return next;
    });

  const setDomainItems = (slug: string, open: boolean) => {
    const anchors =
      domains.find((d) => d.slug === slug)?.items.map((r) => r.anchor) ?? [];
    setCollapsedDomains((prev) => {
      const next = new Set(prev);
      next.delete(slug);
      return next;
    });
    setExpanded((prev) => {
      const next = new Set(prev);
      anchors.forEach((a) => (open ? next.add(a) : next.delete(a)));
      return next;
    });
  };

  const setEverything = (open: boolean) => {
    setCollapsedDomains(open ? new Set() : new Set(DOMAIN_SLUGS));
    setExpanded(open ? new Set(allItems.map((r) => r.anchor)) : new Set());
  };

  const toggleDomain = (slug: string) =>
    setCollapsedDomains((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });

  /* ---------------- actions ---------------- */

  async function copyLink(anchor: string) {
    const url = `${window.location.origin}${window.location.pathname}#${anchor}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* clipboard can be blocked; the address bar still gets the link */
    }
    history.replaceState(null, "", `#${anchor}`);
    setCopied(anchor);
    setTimeout(() => setCopied((c) => (c === anchor ? null : c)), 2000);
  }

  function reportSource(r: SubdomainResult, item: EvidenceItem) {
    setExpanded((prev) => new Set(prev).add(r.anchor));
    const current = feedback.getDraft(r.subdomain);
    feedback.setDraft(r.subdomain, {
      kind: "wrong_source",
      comment: current.comment || `About the source “${item.sourceTitle}”: `,
    });
    setTimeout(() => {
      const box = document.getElementById(
        `fb-${r.anchor}-comment`,
      ) as HTMLTextAreaElement | null;
      if (!box) return;
      box.scrollIntoView({ block: "center" });
      box.focus();
      box.setSelectionRange(box.value.length, box.value.length);
    }, 60);
  }

  async function exportPdf() {
    setExporting(true);
    setExportError(false);
    try {
      const { generateAssessmentPdf } = await import("@/lib/assessment-pdf");
      generateAssessmentPdf({
        companyName,
        domains,
        statusOf,
        confidenceOf,
        disputedOf,
      });
    } catch (err) {
      setExportError(true);
      console.error("Failed to generate PDF:", err);
    } finally {
      setExporting(false);
    }
  }

  /* ---------------- render ---------------- */

  const met = counts.get("meets") ?? 0;
  const total = allItems.length;
  const pct = total ? Math.round((met / total) * 100) : 0;
  const selected = allItems.find((item) => item.anchor === selectedAnchor);

  return (
    <>
      <section
        aria-labelledby="assessment-summary"
        className="mt-8 border border-slate-200 bg-slate-50 p-5 sm:p-7"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 id="assessment-summary" className="text-3xl">
              Assessment at a glance
            </h2>
            <p className="mt-2 text-slate-700">
              {responses.length ? (
                <>
                  <strong>
                    {met} of {total} practices met
                  </strong>{" "}
                  ({pct}%)
                </>
              ) : (
                "No assessment results for this period yet."
              )}
            </p>
          </div>
          {responses.length > 0 && (
            <button
              type="button"
              onClick={exportPdf}
              disabled={exporting}
              className="btn btn-secondary"
            >
              <Download className="h-4 w-4" aria-hidden />
              {exporting ? "Preparing PDF…" : "Download PDF"}
            </button>
          )}
        </div>
        {exportError && (
          <p role="alert" className="mt-2 text-sm text-brand-bronze">
            Couldn&apos;t create the PDF. Please try again.
          </p>
        )}
        <p className="mt-5 text-sm text-slate-600">
          Each tile is one practice. Select it to see its rating and evidence.
        </p>
        <ul className="mt-3 divide-y divide-slate-200 border-y border-slate-200 bg-white">
          {domains.map((d) => {
            const dMet = d.items.filter((r) => statusOf(r) === "meets").length;
            return (
              <li
                key={d.slug}
                className="grid gap-2 p-3 sm:grid-cols-[minmax(10rem,13rem)_minmax(0,1fr)_6rem] sm:items-center sm:gap-4"
              >
                <a
                  href={`#${d.slug}`}
                  className="text-sm font-semibold text-brand-navy underline-offset-4 hover:underline"
                >
                  {d.name}
                  <span className="sr-only"> details</span>
                </a>
                <div
                  className="grid max-w-md grid-cols-7 gap-1.5"
                  aria-label={`${d.name} practices`}
                >
                  {d.items.map((r) => {
                    const status = STATUS_META[statusOf(r)];
                    const active = selectedAnchor === r.anchor;
                    return (
                      <button
                        key={r.anchor}
                        type="button"
                        aria-label={`${r.subdomain}: ${status.label}`}
                        aria-pressed={active}
                        title={`${r.subdomain}: ${status.label}`}
                        onClick={() =>
                          setSelectedAnchor(active ? null : r.anchor)
                        }
                        className={`flex min-h-11 min-w-0 items-center rounded-sm px-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy ${active ? "bg-blue-100 ring-2 ring-brand-navy" : "hover:bg-slate-100"}`}
                      >
                        <span
                          aria-hidden="true"
                          className={`block h-5 w-full rounded-sm ${status.dot}`}
                        />
                      </button>
                    );
                  })}
                </div>
                <span className="text-sm font-semibold tabular-nums text-slate-700 sm:text-right">
                  {dMet} of {d.items.length} met
                </span>
                {selected &&
                  d.items.some((item) => item.anchor === selected.anchor) && (
                    <div role="status" className="sm:col-span-3">
                      <div className="border-l-4 border-brand-dukeblue bg-blue-50 p-4">
                        <p className="text-sm font-semibold text-brand-navy">
                          {selected.subdomain}
                        </p>
                        <p className="mt-1 text-sm text-slate-700">
                          {STATUS_META[statusOf(selected)].label}
                        </p>
                        <a
                          href={`#${selected.anchor}`}
                          className="link-more mt-2 inline-block text-sm"
                        >
                          View rating and evidence
                        </a>
                      </div>
                    </div>
                  )}
              </li>
            );
          })}
        </ul>
        {responses.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-700">
            {STATUS_ORDER.filter((status) => counts.get(status)).map(
              (status) => (
                <li key={status} className="inline-flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 ${STATUS_META[status].dot}`}
                    aria-hidden
                  />
                  <span>
                    {STATUS_META[status].label}:{" "}
                    <strong>{counts.get(status)}</strong>
                  </span>
                </li>
              ),
            )}
          </ul>
        )}
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <a href="#next-steps" className="link-more">
            Jump to next steps ↓
          </a>
          <a
            href="#assessment-details"
            onClick={() => {
              if (details.current) details.current.open = true;
            }}
            className="link-more"
          >
            View assessment details
          </a>
          <Link href="/framework#rating" className="link-more">
            How ratings work
          </Link>
        </div>
      </section>

      {children}

      <details
        ref={details}
        id="assessment-details"
        className="group mt-12 scroll-mt-36 border border-slate-200 bg-white p-5 sm:p-7"
      >
        <summary className="cursor-pointer text-lg font-bold text-brand-navy">
          Assessment details and evidence
        </summary>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
          <p className="text-slate-600">
            <strong className="font-semibold text-slate-700">
              Not reported
            </strong>{" "}
            means nothing submitted covers the practice.{" "}
            <strong className="font-semibold text-slate-700">
              Does not currently meet
            </strong>{" "}
            means the evidence doesn&apos;t yet show it in place.
          </p>
          <span className="flex gap-5">
            <button
              type="button"
              onClick={() => setEverything(true)}
              className="font-bold text-brand-dukeblue hover:underline"
            >
              Expand all
            </button>
            <button
              type="button"
              onClick={() => setEverything(false)}
              className="font-bold text-brand-dukeblue hover:underline"
            >
              Collapse all
            </button>
          </span>
        </div>

        {/* Domains */}
        <div className="space-y-14">
          {domains.map((d) => {
            const collapsed = collapsedDomains.has(d.slug);
            const dMet = d.items.filter((r) => statusOf(r) === "meets").length;
            const allOpen = d.items.every((r) => expanded.has(r.anchor));
            const st = domainStyle(d.name);
            return (
              <section
                key={d.slug}
                id={d.slug}
                aria-labelledby={`${d.slug}-title`}
                className="scroll-mt-28 pt-8"
              >
                <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-slate-200 pb-4">
                  <div className="min-w-0">
                    <p
                      className="text-[0.75rem] font-bold uppercase tracking-[0.1em]"
                      style={{ color: st.text }}
                    >
                      Domain {d.number} · {dMet} of {d.items.length} met
                    </p>
                    <h3 id={`${d.slug}-title`} className="mt-1">
                      <button
                        type="button"
                        aria-expanded={!collapsed}
                        onClick={() => toggleDomain(d.slug)}
                        className="inline-flex items-center gap-2 text-left font-serif text-[2rem] font-medium text-brand-navy hover:text-brand-dukeblue"
                      >
                        {d.name}
                        <ChevronDown
                          className={`h-5 w-5 text-slate-400 transition-transform ${collapsed ? "-rotate-90" : ""}`}
                          aria-hidden
                        />
                      </button>
                    </h3>
                    <p className="mt-1 max-w-3xl text-[15px] text-slate-600">
                      {DOMAIN_INFO[d.name]?.short}{" "}
                      <Link
                        href={`/framework#domain-${d.slug}`}
                        className="link-more whitespace-nowrap"
                      >
                        About this domain
                      </Link>
                    </p>
                  </div>

                  <div className="flex items-center gap-5 text-sm">
                    {!collapsed && (
                      <button
                        type="button"
                        onClick={() => setDomainItems(d.slug, !allOpen)}
                        className="font-bold text-brand-dukeblue hover:underline"
                      >
                        {allOpen ? "Collapse all" : "Expand all"}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => copyLink(d.slug)}
                      className="inline-flex items-center gap-1 text-slate-500 hover:text-ink"
                      title="Copy a link to this domain"
                    >
                      <Link2 className="h-4 w-4" aria-hidden />
                      {copied === d.slug ? "Copied" : "Link"}
                    </button>
                  </div>
                </header>

                {!collapsed && (
                  <ul>
                    {d.items.map((r) => (
                      <SubdomainItem
                        key={r.anchor}
                        result={r}
                        status={statusOf(r)}
                        confidence={confidenceOf(r)}
                        disputed={disputedOf(r)}
                        expanded={expanded.has(r.anchor)}
                        onToggle={() => toggleItem(r.anchor)}
                        feedbackCount={
                          feedback
                            .forSubdomain(r.subdomain)
                            .filter((e) => e.sync !== "save_failed").length
                        }
                        onOpenSource={(item) =>
                          setDrawer({ item, subdomain: r.subdomain })
                        }
                        onReportSource={(item) => reportSource(r, item)}
                        onCopyLink={() => copyLink(r.anchor)}
                        copied={copied === r.anchor}
                        accent={st.accent}
                      >
                        <FeedbackSection
                          api={feedback}
                          domain={d.name}
                          subdomain={r.subdomain}
                          question={r.primary?.question ?? null}
                          answer={r.primary?.answer ?? null}
                          currentUser={user}
                          formId={`fb-${r.anchor}`}
                        />
                      </SubdomainItem>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      </details>
      <BackToTop />
      <SourceDrawer
        item={drawer?.item ?? null}
        subdomain={drawer?.subdomain ?? ""}
        onClose={() => setDrawer(null)}
      />
    </>
  );
}
