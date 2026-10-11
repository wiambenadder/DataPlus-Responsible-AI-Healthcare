"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { fetchRoadmapData } from "@/lib/roadmap/fetch";
import { buildRoadmapModel } from "@/lib/roadmap/transform";
import { applyDisputes } from "@/lib/roadmap/disputes";
import { ADVANCE_THRESHOLD } from "@/lib/roadmap/framework";
import { fetchFeedbackSummary } from "@/lib/disputes";
import type { HelpContext } from "@/lib/help-guide";
import type {
  DomainMappingRow,
  QualitativeResponseRow,
  RoadmapModel,
  SubdomainStatus,
} from "@/lib/roadmap/types";
import StageStep from "@/_components/roadmap/StageStep";
import RoadmapAssistant, { type AssistantHandle } from "@/_components/roadmap/RoadmapAssistant";

const STATUS_WORDS: Record<SubdomainStatus, string> = {
  practiced: "Met",
  not_practiced: "Not met yet",
  no_data: "No evidence yet",
  under_review: "Under review",
};

type Loaded = {
  companyId: string;
  companyName: string | null;
  responses: QualitativeResponseRow[];
  mappings: DomainMappingRow[];
  disputed: Set<string>;
};

async function load(): Promise<Loaded | { error: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "signed_out" };

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .single();
  if (error) throw error;
  const companyId = profile?.company_id as string | undefined;
  if (!companyId) return { error: "no_company" };

  const [{ responses, mappings }, company, feedback] = await Promise.all([
    fetchRoadmapData(companyId),
    supabase.from("companies").select("company_name").eq("id", companyId).single(),
    fetchFeedbackSummary(companyId),
  ]);
  return {
    companyId,
    companyName: (company.data?.company_name as string | undefined) ?? null,
    responses,
    mappings,
    disputed: feedback.disputed,
  };
}

/**
 * Roadmap: the 31 practices in six stages. A flat tracker shows every
 * stage at a glance; below, the stages are listed step by step (as on
 * GOV.UK and university sites), with the current stage open. The Roadmap
 * Assistant answers questions about the roadmap and the site.
 */
export default function RoadmapPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Loaded | null>(null);
  const [period, setPeriod] = useState("");
  const [openStages, setOpenStages] = useState<Set<number> | null>(null);
  const assistant = useRef<AssistantHandle>(null);

  useEffect(() => {
    load().then(
      (res) => {
        if ("error" in res) setError(res.error);
        else setData(res);
        setLoading(false);
      },
      (e) => {
        setError(e instanceof Error ? e.message : "Failed to load roadmap data.");
        setLoading(false);
      }
    );
  }, []);

  const model: RoadmapModel | null = useMemo(() => {
    if (!data) return null;
    return applyDisputes(
      buildRoadmapModel(data.companyId, data.responses, data.mappings, period || null),
      data.disputed
    );
  }, [data, period]);

  const context: HelpContext | null = useMemo(() => {
    if (!model) return null;
    return {
      company: data?.companyName ?? null,
      currentStage: model.currentStageId,
      overall: { met: model.overall.practiced, total: model.overall.total },
      stages: model.stages.map((s) => ({
        id: s.id,
        name: s.name,
        practiced: s.practicedCount,
        total: s.totalCount,
        needed: Math.ceil(s.totalCount * ADVANCE_THRESHOLD),
        state: s.state.replace("_", " "),
        practices: s.domainGroups.flatMap((g) =>
          g.subdomains.map((p) => ({ name: p.name, domain: p.domainName, status: STATUS_WORDS[p.status] }))
        ),
      })),
    };
  }, [model, data]);

  // The current stage starts open; after that, the reader decides.
  const open = openStages ?? new Set(model ? [model.currentStageId] : []);
  const allOpen = model ? model.stages.every((s) => open.has(s.id)) : false;

  const toggle = (id: number) => {
    const next = new Set(open);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setOpenStages(next);
  };

  const goTo = (id: number) => {
    setOpenStages(new Set(open).add(id));
    requestAnimationFrame(() =>
      document.getElementById(`stage-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" })
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-slate-500" role="status">
        Loading your roadmap…
      </div>
    );
  }

  if (error || !model) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <h1 className="text-4xl">Your Roadmap</h1>
        <p className="mt-3 text-slate-700">
          {error === "signed_out" ? (
            <>
              <Link href="/login" className="link-more">
                Log in
              </Link>{" "}
              to see your roadmap.
            </>
          ) : error === "no_company" ? (
            <>
              Your account isn&apos;t linked to a company yet.{" "}
              <Link href="/company-setup" className="link-more">
                Set up your company
              </Link>
            </>
          ) : (
            <>We couldn&apos;t load your roadmap ({error}). Refresh the page to try again.</>
          )}
        </p>
      </div>
    );
  }

  const hasData = model.stages.some((s) => s.state !== "not_started");

  return (
    <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
      <div className="mt-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="label-caps">{data?.companyName ?? "Your organization"}</p>
          <h1 className="mt-2 text-4xl sm:text-5xl">Your Roadmap</h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-700">
            Six stages, in the order an AI tool usually matures. Meet half the practices in a
            stage to move on to the next; meet all of them to complete it.
          </p>
        </div>
        {model.reportingPeriods.length > 1 && (
          <label className="flex items-center gap-2 text-sm font-semibold text-ink">
            Reporting period
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="border border-slate-300 bg-white px-3 py-2 text-sm font-normal"
            >
              <option value="">Latest</option>
              {model.reportingPeriods.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {/* Stage tracker */}
      <ol className="mt-8 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-6">
        {model.stages.map((s) => {
          const cur = s.id === model.currentStageId;
          return (
            <li key={s.id}>
              <button type="button" onClick={() => goTo(s.id)} className="group block w-full text-left">
                <span className={`block h-2 ${cur ? "bg-blue-200" : "bg-slate-200"}`}>
                  <span
                    className={`block h-full ${cur ? "bg-brand-dukeblue" : s.state === "complete" ? "bg-brand-teal" : "bg-brand-navy"}`}
                    style={{ width: `${Math.round(s.score * 100)}%` }}
                  />
                </span>
                <span
                  className={`mt-3 block text-[0.72rem] font-bold uppercase tracking-[0.1em] ${
                    cur ? "text-brand-dukeblue" : "text-slate-500"
                  }`}
                >
                  Stage {s.id}
                  {cur ? " · Current" : s.state === "complete" ? " · Complete" : ""}
                </span>
                <span className="mt-0.5 block text-[15px] font-bold leading-snug text-ink group-hover:underline">
                  {s.name}
                </span>
                <span className="block text-[13.5px] text-slate-600">
                  {s.practicedCount} of {s.totalCount} met
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {!hasData && (
        <p className="mt-8 border-l-4 border-brand-dukeblue bg-blue-50 px-5 py-4 text-[15px]">
          Your roadmap fills in once your first results are ready.{" "}
          <Link href="/report/assessment" className="link-more">
            Upload documents and answer questions ›
          </Link>
        </p>
      )}

      <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <section aria-labelledby="stages-heading">
          <div className="section-head">
            <h2 id="stages-heading">Stages and Practices</h2>
            <button
              type="button"
              onClick={() => setOpenStages(allOpen ? new Set() : new Set(model.stages.map((s) => s.id)))}
              className="link-more"
            >
              {allOpen ? "Hide all stages" : "Show all stages"}
            </button>
          </div>
          <ol className="mt-4">
            {model.stages.map((s, i) => (
              <StageStep
                key={s.id}
                stage={s}
                isCurrent={s.id === model.currentStageId}
                open={open.has(s.id)}
                onToggle={() => toggle(s.id)}
                onAsk={(q) => assistant.current?.ask(q)}
                first={i === 0}
                last={i === model.stages.length - 1}
              />
            ))}
          </ol>
          <p className="mt-6 text-[14.5px] text-slate-600">
            Ratings come from your results page.{" "}
            <Link href="/dashboard" className="link-more">
              See the evidence for each practice ›
            </Link>
          </p>
        </section>

        <div className="lg:sticky lg:top-6">
          <RoadmapAssistant ref={assistant} context={context} />
        </div>
      </div>
    </div>
  );
}
