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
import { DOMAIN_INFO, domainStyle } from "@/lib/domain-info";
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
 * (Ctrl+F) and linked to. Desktop gets a sticky row of domain tabs, mobile
 * a sticky domain picker; both mark the domain in view.
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
        .select("*")
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
        if (el && el.getBoundingClientRect().top <= 180) current = slug;
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
        <h1 className="text-4xl">Your Results</h1>
        {loadError ? (
          <p className="mt-3 text-slate-700">
            We couldn&apos;t load your results ({loadError}).{" "}
            <button onClick={load} className="font-semibold text-brand-dukeblue underline">
              Try again
            </button>
          </p>
        ) : !signedIn ? (
          <p className="mt-3 text-slate-700">
            <Link href="/login" className="font-semibold text-brand-dukeblue underline">
              Log in
            </Link>{" "}
            to see your results.
          </p>
        ) : (
          <p className="mt-3 text-slate-700">
            Your account isn&apos;t linked to a company yet.{" "}
            <Link href="/company-setup" className="font-semibold text-brand-dukeblue underline">
              Set up your company
            </Link>
            .
          </p>
        )}
      </div>
    );
  }

  const met = counts.get("meets") ?? 0;
  const total = allItems.length;
  const pct = total ? Math.round((met / total) * 100) : 0;
  const updatedTimes = responses
    .map((r) => (r as { created_at?: string | null }).created_at)
    .filter(Boolean)
    .map((d) => new Date(d as string).getTime());
  const updated = updatedTimes.length
    ? new Date(Math.max(...updatedTimes)).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
      {/* Header: title and the 31 practices at a glance */}
      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-end">
        <div>
          <p className="label-caps">
            {[companyName ?? "Your organization", updated ? `Updated ${updated}` : null]
              .filter(Boolean)
              .join(" · ")}
          </p>
          <h1 className="mt-2 text-4xl sm:text-5xl">Your Results</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-700">
            <strong className="font-semibold text-ink">
              {met} of {total} practices met
            </strong>{" "}
            ({pct}%){latestPeriod ? `, from the ${latestPeriod} reporting period` : ""}.
            Choose a domain, then open any practice to see why it was rated that way and
            where the evidence came from.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
            <button type="button" onClick={exportPdf} disabled={exporting} className="btn btn-secondary">
              <Download className="h-4 w-4" aria-hidden />
              {exporting ? "Preparing PDF…" : "Download PDF"}
            </button>
            <Link href="/framework#rating" className="link-more">
              How results work ›
            </Link>
          </div>
        </div>

        <div className="border border-slate-200 p-5">
          <p className="text-sm font-bold text-ink">All {total} practices</p>
          <ul className="mt-2 space-y-1.5">
            {domains.map((d) => (
              <li key={d.slug} className="flex items-center gap-2 text-[13px]">
                <a href={`#${d.slug}`} className="w-36 shrink-0 font-semibold text-slate-700 hover:underline">
                  {d.name}
                </a>
                <span className="flex gap-1">
                  {d.items.map((r) => (
                    <a
                      key={r.anchor}
                      href={`#${r.anchor}`}
                      title={`${r.subdomain}: ${STATUS_META[statusOf(r)].label}`}
                      aria-label={`${r.subdomain}: ${STATUS_META[statusOf(r)].label}`}
                      className={`block h-[18px] w-[18px] hover:outline hover:outline-2 hover:outline-offset-1 hover:outline-brand-navy ${STATUS_META[statusOf(r)].dot}`}
                    />
                  ))}
                </span>
              </li>
            ))}
          </ul>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-slate-700">
            {STATUS_ORDER.map((s) => (
              <li key={s} className="inline-flex items-center gap-1.5">
                <span className={`h-2.5 w-2.5 ${STATUS_META[s].dot}`} aria-hidden />
                {STATUS_META[s].label}
                <span className="font-semibold tabular-nums text-ink">{counts.get(s) ?? 0}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Domain tabs (desktop): jump to a domain; the one in view is marked */}
      <nav
        aria-label="Domains"
        className="sticky top-0 z-30 mt-10 hidden border-b border-slate-200 bg-white lg:block"
      >
        <ol className="grid grid-cols-5">
          {domains.map((d) => {
            const active = activeDomain === d.slug;
            const st = domainStyle(d.name);
            const dMet = d.items.filter((r) => statusOf(r) === "meets").length;
            return (
              <li key={d.slug}>
                <a
                  href={`#${d.slug}`}
                  aria-current={active ? "location" : undefined}
                  className={`-mb-px block h-full border-t-4 px-4 pb-3 pt-3 ${
                    active
                      ? "border-x border-b border-x-slate-200 border-b-white bg-white"
                      : "border-b border-b-slate-200 bg-whisper hover:bg-slate-100"
                  }`}
                  style={{ borderTopColor: active ? st.accent : "#dcdfe3" }}
                >
                  <span className="block text-[15px] font-bold text-ink">{d.name}</span>
                  <span className="block text-[13.5px] text-slate-600">
                    {dMet} of {d.items.length} met
                  </span>
                </a>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Mobile: sticky domain picker */}
      <div className="sticky top-0 z-30 -mx-4 mt-8 border-b border-slate-200 bg-white/95 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6 lg:hidden">
        <label className="flex items-center gap-3 text-sm">
          <span className="shrink-0 text-slate-500">Domain</span>
          <select
            value={activeDomain}
            onChange={(e) => {
              window.location.hash = e.target.value;
            }}
            className="min-w-0 flex-1 border border-slate-300 bg-white px-2 py-1.5 text-[15px] font-semibold text-ink"
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

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
        <p className="text-slate-600">
          <strong className="font-semibold text-slate-700">Not reported</strong> means nothing
          submitted covers the practice.{" "}
          <strong className="font-semibold text-slate-700">Does not currently meet</strong>{" "}
          means the evidence doesn&apos;t yet show it in place.
        </p>
        <span className="flex gap-5">
          <button type="button" onClick={() => setEverything(true)} className="font-bold text-brand-dukeblue hover:underline">
            Expand all
          </button>
          <button type="button" onClick={() => setEverything(false)} className="font-bold text-brand-dukeblue hover:underline">
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
                  <p className="text-[0.75rem] font-bold uppercase tracking-[0.1em]" style={{ color: st.text }}>
                    Domain {d.number} · {dMet} of {d.items.length} met
                  </p>
                  <h2 id={`${d.slug}-title`} className="mt-1">
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
                  </h2>
                  <p className="mt-1 max-w-3xl text-[15px] text-slate-600">
                    {DOMAIN_INFO[d.name]?.short}{" "}
                    <Link href={`/framework#domain-${d.slug}`} className="link-more whitespace-nowrap">
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
                        feedback.forSubdomain(r.subdomain).filter((e) => e.sync !== "save_failed").length
                      }
                      onOpenSource={(item) => setDrawer({ item, subdomain: r.subdomain })}
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

      <BackToTop />
      <SourceDrawer
        item={drawer?.item ?? null}
        subdomain={drawer?.subdomain ?? ""}
        onClose={() => setDrawer(null)}
      />
    </div>
  );
}
