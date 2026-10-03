"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, Download, Link2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
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
import { useFeedback } from "@/_components/feedback/useFeedback";
import FeedbackSection from "@/_components/feedback/FeedbackSection";
import SubdomainItem from "@/_components/assessment/SubdomainItem";
import SourceDrawer from "@/_components/assessment/SourceDrawer";
import BackToTop from "@/_components/assessment/BackToTop";

const DOMAIN_ENTRIES = Object.entries(FRAMEWORK) as [string, string[]][];
const DOMAIN_SLUGS = DOMAIN_ENTRIES.map(([d]) => slugify(d));

/**
 * Assessment results.
 *
 * All five domains sit on one page so they can be scanned, searched
 * (Ctrl+F) and linked to. Desktop gets a sticky "On this page" sidebar,
 * mobile a sticky domain picker; both highlight the domain in view.
 * Every domain and criterion has its own URL fragment, e.g.
 *   /dashboard#model-source              → the Model Source domain
 *   /dashboard#model-source--timeliness  → that criterion, opened
 */
export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(true);
  const [user, setUser] = useState<{ id: string | null; email: string | null }>({
    id: null,
    email: null,
  });
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [responses, setResponses] = useState<ResponseRow[]>([]);
  const [mappings, setMappings] = useState<MappingRow[]>([]);
  const [uploads, setUploads] = useState<UploadRow[]>([]);

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [collapsedDomains, setCollapsedDomains] = useState<Set<string>>(new Set());
  const [activeDomain, setActiveDomain] = useState(DOMAIN_SLUGS[0]);
  const [drawer, setDrawer] = useState<{ item: EvidenceItem; subdomain: string } | null>(
    null
  );
  const [copied, setCopied] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const feedback = useFeedback({ companyId, companyName });

  /* ---------------- data ---------------- */

  /** Loads everything the page needs. Returns data; sets no state. */
  const fetchAll = useCallback(async () => {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (!authUser) return { kind: "signed_out" as const };

    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", authUser.id)
      .single();
    const viewer = { id: authUser.id, email: authUser.email ?? null };
    if (!profile?.company_id) return { kind: "no_company" as const, viewer };

    const cid: string = profile.company_id;
    const [companyRes, responsesRes, mappingsRes, uploadsRes] = await Promise.all([
      supabase.from("companies").select("company_name").eq("id", cid).single(),
      supabase.from("qualitative_responses").select("*").eq("company_id", cid),
      supabase
        .from("domain_mapping")
        .select("id, domain, subtopic, source_quotes, source_pdf, confidence, upload_id")
        .eq("company_id", cid),
      supabase
        .from("uploads")
        .select("id, file_name, file_url, created_at")
        .eq("company_id", cid),
    ]);
    if (responsesRes.error) throw new Error(responsesRes.error.message);

    return {
      kind: "ok" as const,
      viewer,
      companyId: cid,
      companyName: (companyRes.data?.company_name as string | undefined) ?? null,
      responses: (responsesRes.data ?? []) as ResponseRow[],
      // Sources are a nice-to-have: show results even if these fail.
      mappings: (mappingsRes.data ?? []) as MappingRow[],
      uploads: (uploadsRes.data ?? []) as UploadRow[],
    };
  }, []);

  const apply = useCallback((p: Promise<Awaited<ReturnType<typeof fetchAll>>>) => {
    p.then(
      (res) => {
        if (res.kind === "signed_out") setSignedIn(false);
        if (res.kind !== "signed_out") setUser(res.viewer);
        if (res.kind === "ok") {
          setCompanyId(res.companyId);
          setCompanyName(res.companyName);
          setResponses(res.responses);
          setMappings(res.mappings);
          setUploads(res.uploads);
        }
        setLoading(false);
      },
      (err) => {
        setLoadError(err instanceof Error ? err.message : String(err));
        setLoading(false);
      }
    );
  }, []);

  useEffect(() => {
    apply(fetchAll());
  }, [apply, fetchAll]);

  const load = () => {
    setLoading(true);
    setLoadError(null);
    apply(fetchAll());
  };

  const results = useMemo(
    () =>
      buildResults({
        framework: DOMAIN_ENTRIES,
        responses,
        mappings,
        uploads,
        sourceUrl: (u) =>
          u.file_url
            ? supabase.storage.from("reports").getPublicUrl(u.file_url).data.publicUrl
            : null,
      }),
    [responses, mappings, uploads]
  );

  const domains = useMemo(
    () =>
      DOMAIN_ENTRIES.map(([name, subs], i) => ({
        name,
        slug: DOMAIN_SLUGS[i],
        number: i + 1,
        items: subs.map((s) => results.get(normalizeName(s))!),
      })),
    [results]
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
            e.sync !== "deleting"
        ),
    [feedback]
  );
  const statusOf = useCallback(
    (r: SubdomainResult): Status =>
      disputedOf(r) && r.baseStatus !== "not_reported" ? "needs_verification" : r.baseStatus,
    [disputedOf]
  );
  const confidenceOf = useCallback(
    (r: SubdomainResult): Confidence | null =>
      disputedOf(r) ? "needs_verification" : r.baseConfidence,
    [disputedOf]
  );

  const allItems = domains.flatMap((d) => d.items);
  const counts = new Map<Status, number>();
  allItems.forEach((r) => counts.set(statusOf(r), (counts.get(statusOf(r)) ?? 0) + 1));
  const latestPeriod =
    [...responses].reverse().find((r) => r.reporting_period)?.reporting_period ?? null;

  /* ---------------- deep links ---------------- */

  const applyHash = useCallback(() => {
    const target = decodeURIComponent(window.location.hash.slice(1));
    if (!target) return;
    const [domainSlug, subSlug] = target.split("--");
    if (!DOMAIN_SLUGS.includes(domainSlug)) return;

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
        document.getElementById(target)?.scrollIntoView({ block: "start" })
      )
    );
  }, []);

  useEffect(() => {
    if (loading) return;
    const first = requestAnimationFrame(applyHash);
    window.addEventListener("hashchange", applyHash);
    return () => {
      cancelAnimationFrame(first);
      window.removeEventListener("hashchange", applyHash);
    };
  }, [loading, applyHash]);

  /* ---------------- which domain is in view ---------------- */

  useEffect(() => {
    if (loading) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      let current = DOMAIN_SLUGS[0];
      for (const slug of DOMAIN_SLUGS) {
        const el = document.getElementById(slug);
        if (el && el.getBoundingClientRect().top <= 160) current = slug;
      }
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (atBottom && window.scrollY > 0) current = DOMAIN_SLUGS[DOMAIN_SLUGS.length - 1];
      setActiveDomain(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [loading]);

  /* ---------------- expand / collapse ---------------- */

  const toggleItem = (anchor: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(anchor)) next.delete(anchor);
      else next.add(anchor);
      return next;
    });

  const setDomainItems = (slug: string, open: boolean) => {
    const anchors = domains.find((d) => d.slug === slug)?.items.map((r) => r.anchor) ?? [];
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
    setCollapsedDomains(new Set());
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
      const box = document.getElementById(`fb-${r.anchor}-comment`) as HTMLTextAreaElement | null;
      if (!box) return;
      box.scrollIntoView({ block: "center" });
      box.focus();
      box.setSelectionRange(box.value.length, box.value.length);
    }, 60);
  }

  async function exportPdf() {
    setExporting(true);
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
      console.error("Failed to generate PDF:", err);
    } finally {
      setExporting(false);
    }
  }

  /* ---------------- render ---------------- */

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-slate-500" role="status">
        Loading your results…
      </div>
    );
  }

  if (!signedIn || !companyId || loadError) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-semibold text-slate-900">Assessment results</h1>
        {loadError ? (
          <p className="mt-3 text-slate-700">
            We couldn&apos;t load your results ({loadError}).{" "}
            <button onClick={load} className="font-semibold text-blue-600 underline">
              Try again
            </button>
          </p>
        ) : !signedIn ? (
          <p className="mt-3 text-slate-700">
            <Link href="/login" className="font-semibold text-blue-600 underline">
              Log in
            </Link>{" "}
            to see your results.
          </p>
        ) : (
          <p className="mt-3 text-slate-700">
            Your account isn&apos;t linked to a company yet.{" "}
            <Link href="/company-setup" className="font-semibold text-blue-600 underline">
              Set up your company
            </Link>
            .
          </p>
        )}
      </div>
    );
  }

  const met = counts.get("meets") ?? 0;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
        <Link href="/" className="hover:text-slate-900 hover:underline">
          Home
        </Link>
        <span className="mx-2" aria-hidden>/</span>
        <span className="text-slate-700">Assessment results</span>
      </nav>

      {/* Header */}
      <header className="mt-3 flex flex-wrap items-end justify-between gap-4 border-b border-slate-300 pb-5">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-[2.1rem]">
            Assessment results
          </h1>
          <p className="mt-1.5 text-[15px] text-slate-600">
            {companyName ?? "Your company"}
            {latestPeriod && <> · Latest reporting period: {latestPeriod}</>}
          </p>
        </div>
        <button
          type="button"
          onClick={exportPdf}
          disabled={exporting}
          className="inline-flex items-center gap-2 rounded border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-800 hover:border-blue-600 hover:text-blue-600 disabled:opacity-60"
        >
          <Download className="h-4 w-4" aria-hidden />
          {exporting ? "Preparing PDF…" : "Download PDF"}
        </button>
      </header>

      {/* Where you stand */}
      <section aria-label="Summary" className="mt-5">
        <p className="text-[15px] text-slate-800">
          <strong className="font-semibold">
            {met} of {allItems.length}
          </strong>{" "}
          criteria met across five domains. Open any criterion to see the evidence
          behind its result, and tell us if something is wrong.
        </p>
        <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-700">
          {STATUS_ORDER.map((s) => (
            <li key={s} className="inline-flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${STATUS_META[s].dot}`} aria-hidden />
              {STATUS_META[s].label}
              <span className="font-semibold tabular-nums text-slate-900">
                {counts.get(s) ?? 0}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Mobile: sticky domain picker */}
      <div className="sticky top-14 z-30 -mx-4 mt-5 border-y border-slate-200 bg-slate-50/95 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6 lg:hidden">
        <label className="flex items-center gap-3 text-sm">
          <span className="shrink-0 text-slate-500">Domain</span>
          <select
            value={activeDomain}
            onChange={(e) => {
              window.location.hash = e.target.value;
            }}
            className="min-w-0 flex-1 rounded border border-slate-300 bg-white px-2 py-1.5 text-[15px] font-semibold text-slate-900"
          >
            {domains.map((d) => (
              <option key={d.slug} value={d.slug}>
                {d.number}. {d.name} ({d.items.filter((r) => statusOf(r) === "meets").length}/
                {d.items.length})
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6 lg:grid lg:grid-cols-[13.5rem_minmax(0,1fr)] lg:gap-10">
        {/* Desktop: sticky side navigation */}
        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <p className="text-xs font-semibold text-slate-500">On this page</p>
            <ol className="mt-2 border-l border-slate-300">
              {domains.map((d) => {
                const active = activeDomain === d.slug;
                const dMet = d.items.filter((r) => statusOf(r) === "meets").length;
                return (
                  <li key={d.slug}>
                    <a
                      href={`#${d.slug}`}
                      aria-current={active ? "location" : undefined}
                      className={`-ml-px flex items-baseline justify-between gap-2 border-l-[3px] py-1.5 pl-3 pr-1 text-sm ${
                        active
                          ? "border-blue-600 font-semibold text-blue-600"
                          : "border-transparent text-slate-700 hover:border-slate-400 hover:text-slate-900"
                      }`}
                    >
                      <span>
                        <span className="tabular-nums text-slate-400">{d.number}.</span>{" "}
                        {d.name}
                      </span>
                      <span className="text-xs font-normal tabular-nums text-slate-500">
                        {dMet}/{d.items.length}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ol>

            <div className="mt-5 flex gap-4 text-sm">
              <button
                type="button"
                onClick={() => setEverything(true)}
                className="font-semibold text-blue-600 hover:underline"
              >
                Expand all
              </button>
              <button
                type="button"
                onClick={() => setEverything(false)}
                className="font-semibold text-blue-600 hover:underline"
              >
                Collapse all
              </button>
            </div>

            <p className="mt-6 text-xs leading-relaxed text-slate-500">
              <span className="font-semibold text-slate-600">Not reported</span> means
              nothing submitted covers the criterion.{" "}
              <span className="font-semibold text-slate-600">Does not currently meet</span>{" "}
              means the evidence doesn&apos;t yet show the practice in place.
            </p>
          </div>
        </aside>

        {/* Domains */}
        <div className="space-y-6">
          {domains.map((d) => {
            const collapsed = collapsedDomains.has(d.slug);
            const dMet = d.items.filter((r) => statusOf(r) === "meets").length;
            const allOpen = d.items.every((r) => expanded.has(r.anchor));
            return (
              <section
                key={d.slug}
                id={d.slug}
                aria-labelledby={`${d.slug}-title`}
                className="scroll-mt-32 border border-slate-200 bg-white lg:scroll-mt-20"
              >
                <header className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3 border-b border-slate-200 px-4 py-4 sm:px-6">
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500">Domain {d.number}</p>
                    <h2 id={`${d.slug}-title`} className="mt-0.5">
                      <button
                        type="button"
                        aria-expanded={!collapsed}
                        onClick={() => toggleDomain(d.slug)}
                        className="inline-flex items-center gap-2 text-left text-2xl font-semibold text-slate-900 hover:text-blue-600"
                      >
                        {d.name}
                        <ChevronDown
                          className={`h-5 w-5 text-slate-400 transition-transform ${
                            collapsed ? "-rotate-90" : ""
                          }`}
                          aria-hidden
                        />
                      </button>
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      {dMet} of {d.items.length} criteria met
                    </p>
                    <DomainBar items={d.items} statusOf={statusOf} />
                  </div>

                  <div className="flex items-center gap-4 pt-5 text-sm">
                    {!collapsed && (
                      <button
                        type="button"
                        onClick={() => setDomainItems(d.slug, !allOpen)}
                        className="font-semibold text-blue-600 hover:underline"
                      >
                        {allOpen ? "Collapse all" : "Expand all"}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => copyLink(d.slug)}
                      className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900"
                      title="Copy a link to this domain"
                    >
                      <Link2 className="h-4 w-4" aria-hidden />
                      {copied === d.slug ? "Copied" : "Link"}
                    </button>
                  </div>
                </header>

                {!collapsed && (
                  <ul className="divide-y divide-slate-200 px-3 sm:px-5">
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
                        onOpenSource={(item) => setDrawer({ item, subdomain: r.subdomain })}
                        onReportSource={(item) => reportSource(r, item)}
                        onCopyLink={() => copyLink(r.anchor)}
                        copied={copied === r.anchor}
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
      </div>

      <BackToTop />
      <SourceDrawer
        item={drawer?.item ?? null}
        subdomain={drawer?.subdomain ?? ""}
        onClose={() => setDrawer(null)}
      />
    </div>
  );
}

/** Thin bar showing how the domain's criteria split across statuses. */
function DomainBar({
  items,
  statusOf,
}: {
  items: SubdomainResult[];
  statusOf: (r: SubdomainResult) => Status;
}) {
  const sorted = [...items].sort(
    (a, b) => STATUS_META[statusOf(a)].order - STATUS_META[statusOf(b)].order
  );
  return (
    <div className="mt-2 flex h-1.5 w-56 max-w-full gap-px overflow-hidden rounded-sm bg-slate-100" aria-hidden>
      {sorted.map((r) => (
        <span key={r.anchor} className={`flex-1 ${STATUS_META[statusOf(r)].dot}`} />
      ))}
    </div>
  );
}
