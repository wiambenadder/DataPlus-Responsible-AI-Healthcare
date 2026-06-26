"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardView, { WelcomeHero } from "../_components/DashboardView";

export default function DashboardRedesigned() {
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<any>(null);
  const [lastReport, setLastReport] = useState("No reports yet");
  const [reportCount, setReportCount] = useState(0);
  const [recentAssessments, setRecentAssessments] = useState<any[]>([]);

  useEffect(() => {
    loadHome();
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
      setLastReport(periods[periods.length - 1]);
      setRecentAssessments(reports.slice(0, 3));
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="flex items-center gap-3 text-slate-500">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
          Loading…
        </div>
      </main>
    );
  }

  if (!company) {
    return <WelcomeHero />;
  }

  return (
    <DashboardView
      company={company}
      reportCount={reportCount}
      lastReport={lastReport}
      recentAssessments={recentAssessments}
    />
  );
}
