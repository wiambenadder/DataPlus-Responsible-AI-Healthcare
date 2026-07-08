"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { DOMAINS } from "@/lib/roadmap/framework";
import HomeView from "@/_components/home/HomeView";
import WelcomeHero from "@/_components/home/WelcomeHero";
import type { DomainProgress } from "@/_components/home/FrameworkOverview";
import type { HistoryItem } from "@/_components/home/HistorySection";

/**
 * Homepage / dashboard landing.
 *
 * Data flow: auth check → profile → company redirect → company +
 * reports + uploaded documents. The reports feed two things: the
 * per-domain progress bars in the framework overview, and the
 * "reports submitted" entries in the history timeline. Uploaded
 * documents (if the table exists) are merged into the same timeline.
 */
export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<any>(null);
  const [reportCount, setReportCount] = useState(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [domainProgress, setDomainProgress] = useState<DomainProgress[]>([]);

  useEffect(() => {
    loadHome();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadHome() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", user.id)
      .single();

    if (!profile) {
      setLoading(false);
      return;
    }

    if (!profile.company_id) {
      router.push("/company-setup");
      return;
    }

    const { data: companyData } = await supabase
      .from("companies")
      .select("*")
      .eq("id", profile.company_id)
      .single();
    setCompany(companyData);

    const { data: reports } = await supabase
      .from("qualitative_responses")
      .select("*")
      .eq("company_id", profile.company_id);

    const items: HistoryItem[] = [];

    if (reports?.length) {
      setDomainProgress(computeDomainProgress(reports));

      // One history entry per reporting period, dated by its latest row.
      const byPeriod = new Map<string, string | null>();
      for (const r of reports as any[]) {
        const period = String(r?.reporting_period ?? "").trim();
        if (!period) continue;
        const prev = byPeriod.get(period);
        const created = r?.created_at ?? null;
        if (!prev || (created && created > prev)) {
          byPeriod.set(period, created);
        }
      }
      setReportCount(byPeriod.size);

      for (const [period, createdAt] of byPeriod) {
        items.push({
          id: `report-${period}`,
          kind: "report",
          title: `Report submitted — ${period}`,
          date: createdAt,
        });
      }
    } else {
      setDomainProgress(computeDomainProgress([]));
    }

    // Uploaded documents. If your table is named differently, change
    // the table name and column mapping here.
    const { data: docs, error: docsError } = await supabase
      .from("documents")
      .select("*")
      .eq("company_id", profile.company_id)
      .order("created_at", { ascending: false });

    if (!docsError && docs?.length) {
      for (const d of docs as any[]) {
        items.push({
          id: `doc-${d.id}`,
          kind: "document",
          title:
            d.file_name ?? d.name ?? d.title ?? "Uploaded document",
          date: d.created_at ?? null,
        });
      }
    }

    // Newest first (entries without a date sink to the bottom).
    items.sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return a.date < b.date ? 1 : -1;
    });

    setHistory(items);
    setLoading(false);
  }

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-500" role="status">
          <span
            className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600"
            aria-hidden
          />
          Loading…
        </div>
      </main>
    );
  }

  if (!company) {
    return <WelcomeHero />;
  }

  return (
    <HomeView
      company={company}
      reportCount={reportCount}
      history={history}
      domainProgress={domainProgress}
    />
  );
}

/**
 * Derive practiced/total per framework domain from qualitative_responses
 * rows. Latest row per (domain, Subtopic) wins — same rule as the
 * roadmap page. Case/whitespace differences are normalized.
 */
function computeDomainProgress(reports: any[]): DomainProgress[] {
  const latest = new Map<string, string>(); // key -> ai_assessment
  for (const r of reports) {
    if (!r?.domain || !r?.Subtopic) continue;
    const key = `${String(r.domain).trim().toLowerCase()}::${String(r.Subtopic)
      .trim()
      .toLowerCase()}`;
    latest.set(key, String(r.ai_assessment ?? "").trim().toLowerCase());
  }

  return DOMAINS.map((d) => {
    let practiced = 0;
    let assessed = 0;
    for (const sub of d.subdomains) {
      const key = `${d.name.toLowerCase()}::${sub.trim().toLowerCase()}`;
      const status = latest.get(key);
      if (status) assessed += 1;
      if (status === "practiced") practiced += 1;
    }
    return {
      domainId: d.id,
      name: d.name,
      practiced,
      assessed,
      total: d.subdomains.length,
    };
  });
}
