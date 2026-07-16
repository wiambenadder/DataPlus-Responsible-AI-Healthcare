"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

import { DOMAINS } from "@/lib/roadmap/framework";
import HomeView from "@/_components/home/HomeView";
import WelcomeHero from "@/_components/home/WelcomeHero";
import type { DomainProgress } from "@/_components/home/FrameworkOverview";

/**
 * Homepage / dashboard landing.
 *
 * Data flow: auth check → profile → company redirect → company +
 * reports. The reports feed the per-domain progress bars in the
 * framework overview and the report count for the Next Steps CTAs.
 */
export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<any>(null);
  const [reportCount, setReportCount] = useState(0);
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
      return; // keep loading=true so WelcomeHero never flashes before the redirect
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

    if (reports?.length) {
      const periods = [...new Set(reports.map((r: any) => r.reporting_period))];
      setReportCount(periods.length);
      setDomainProgress(computeDomainProgress(reports));
    } else {
      setDomainProgress(computeDomainProgress([]));
    }

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
  const latest = new Map<string, string>();

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