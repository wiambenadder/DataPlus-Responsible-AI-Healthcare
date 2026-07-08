"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { fetchRoadmapData } from "@/lib/roadmap/fetch";
import { buildRoadmapModel } from "@/lib/roadmap/transform";
import type {
  DomainMappingRow,
  QualitativeResponseRow,
  RoadmapModel,
} from "@/lib/roadmap/types";
import StageProgressCard from "@/_components/roadmap/StageProgressCard";
import StageSection from "@/_components/roadmap/StageSection";

async function resolveCompanyId(): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .single();

  if (error) {
    throw error;
  }

  return profile?.company_id ?? null;
}

export default function RoadmapPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [responses, setResponses] = useState<QualitativeResponseRow[]>([]);
  const [mappings, setMappings] = useState<DomainMappingRow[]>([]);
  const [period, setPeriod] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const id = await resolveCompanyId();
        if (!id) {
          if (!cancelled) {
            setError("No company found for the current user.");
            setLoading(false);
          }
          return;
        }

        const { responses, mappings } = await fetchRoadmapData(id);
        if (!cancelled) {
          setCompanyId(id);
          setResponses(responses);
          setMappings(mappings);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : "Failed to load roadmap data."
          );
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const model: RoadmapModel | null = useMemo(() => {
    if (!companyId) return null;
    return buildRoadmapModel(companyId, responses, mappings, period || null);
  }, [companyId, responses, mappings, period]);

  const scrollToStage = (id: number) => {
    document
      .getElementById(`stage-${id}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-slate-50">

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
                Readiness Roadmap
              </p>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                AI Readiness Roadmap
              </h1>
              <p className="mt-3 max-w-2xl text-slate-500">
                Follow your progress through the six stages of responsible AI
                adoption. Each stage groups the framework subdomains that matter
                at that point in the journey — expand any subdomain to see the
                assessment reasoning and supporting evidence.
              </p>
            </div>

            {model && model.reportingPeriods.length > 1 && (
              <label className="flex items-center gap-2 text-sm text-slate-500">
                Reporting period
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <option value="">All periods</option>
                  {model.reportingPeriods.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
        </div>

        {loading && (
          <div className="mt-10 flex items-center justify-center gap-2 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            Loading roadmap…
          </div>
        )}

        {error && !loading && (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
            {error} Check your Supabase connection and that the
            <code className="mx-1 rounded bg-white px-1">qualitative_responses</code>
            and
            <code className="mx-1 rounded bg-white px-1">domain_mapping</code>
            tables are readable for this user.
          </div>
        )}

        {model && !loading && !error && (
          <>
            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
              {model.stages.map((stage) => (
                <StageProgressCard
                  key={stage.id}
                  stage={stage}
                  isCurrent={stage.id === model.currentStageId}
                  onSelect={scrollToStage}
                />
              ))}
            </div>

            <div className="mt-8 space-y-6">
              {model.stages.map((stage) => (
                <StageSection
                  key={stage.id}
                  stage={stage}
                  isCurrent={stage.id === model.currentStageId}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}