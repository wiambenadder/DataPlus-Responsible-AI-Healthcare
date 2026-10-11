"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { fetchFeedbackSummary } from "@/lib/disputes";
import { DOMAINS } from "@/lib/roadmap/framework";
import { buildRoadmapModel } from "@/lib/roadmap/transform";
import { applyDisputes } from "@/lib/roadmap/disputes";
import type { QualitativeResponseRow } from "@/lib/roadmap/types";
import HomeView, { type DomainProgress, type HomeSummary } from "@/_components/home/HomeView";
import HubView from "@/_components/hub/HubView";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Home page. Signed out: the All Tools page. Signed in: the company's
 * overview — progress by domain, the roadmap's next step, and the team.
 *
 * Data flow: auth check → profile → company redirect → company, answers,
 * uploads, team and feedback.
 */
type HomeData =
  | { kind: "public" }
  | { kind: "setup" }
  | { kind: "ok"; company: any; summary: HomeSummary };

/** Loads everything the home page needs. Sets no state. */
async function loadHome(): Promise<HomeData> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { kind: "public" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id, full_name")
    .eq("id", user.id)
    .single();
  if (!profile) return { kind: "public" };
  if (!profile.company_id) return { kind: "setup" };
  const cid = profile.company_id as string;

  const [companyRes, reportsRes, uploadsRes, membersRes, feedback] = await Promise.all([
    supabase.from("companies").select("*").eq("id", cid).single(),
    supabase.from("qualitative_responses").select("*").eq("company_id", cid),
    supabase.from("uploads").select("id, file_name, created_at").eq("company_id", cid),
    supabase.from("company_members").select("user_id").eq("company_id", cid),
    fetchFeedbackSummary(cid),
  ]);

  // Oldest first, so the newest answer for each practice wins (the same
  // rule as the results and roadmap pages).
  const reports = [...((reportsRes.data ?? []) as any[])].sort(
    (a, b) =>
      (a?.created_at ? new Date(a.created_at).getTime() : 0) -
      (b?.created_at ? new Date(b.created_at).getTime() : 0)
  );

  const memberIds = ((membersRes.data ?? []) as { user_id: string }[]).map((m) => m.user_id);
  let team: string[] = [];
  if (memberIds.length) {
    const { data: people } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", memberIds);
    team = ((people ?? []) as any[]).map((p) => p.full_name || p.email).filter(Boolean);
  }

  const uploads = (uploadsRes.data ?? []) as { file_name: string | null; created_at: string | null }[];
  const dates = [...reports.map((r) => r.created_at), ...uploads.map((u) => u.created_at)].filter(
    Boolean
  ) as string[];
  const lastUpdated = dates.length
    ? new Date(Math.max(...dates.map((d) => new Date(d).getTime())))
    : null;

  const roadmap = applyDisputes(
    buildRoadmapModel(cid, reports as QualitativeResponseRow[], []),
    feedback.disputed
  );

  return {
    kind: "ok",
    company: companyRes.data,
    summary: {
      firstName: (profile.full_name || "").split(" ")[0] || null,
      domainProgress: computeDomainProgress(reports, feedback.disputed),
      documents: uploads.map((u) => u.file_name).filter(Boolean) as string[],
      answers: reports.filter((r) => (r.answer ?? "").trim()).length,
      lastUpdated,
      team,
      commentsThisWeek: feedback.commentsThisWeek,
      roadmap,
    },
  };
}

export default function HomePage() {
  const router = useRouter();
  const [data, setData] = useState<HomeData | null>(null);

  useEffect(() => {
    loadHome().then(
      (res) => {
        // Keep the spinner up during the redirect so nothing flashes.
        if (res.kind === "setup") router.push("/company-setup");
        else setData(res);
      },
      () => setData({ kind: "public" })
    );
  }, [router]);

  if (!data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500" role="status">
          <span
            className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-brand-navy"
            aria-hidden
          />
          Loading…
        </div>
      </div>
    );
  }

  if (data.kind !== "ok" || !data.company) {
    return <HubView />;
  }

  return <HomeView company={data.company} summary={data.summary} />;
}

/**
 * Practices met / total per domain. The newest row per (domain, practice)
 * wins; practices reported as resting on the wrong source aren't counted
 * as met until reviewed.
 */
function computeDomainProgress(reports: any[], disputed: Set<string>): DomainProgress[] {
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
      if (status === "practiced" && !disputed.has(sub.trim().toLowerCase())) practiced += 1;
    }
    return { domainId: d.id, name: d.name, practiced, assessed, total: d.subdomains.length };
  });
}
