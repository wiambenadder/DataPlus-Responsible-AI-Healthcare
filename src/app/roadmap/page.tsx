"use client";

import Link from "next/link";

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
    <div>
      <div className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 pb-8 pt-6 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="text-sm text-slate-600">
            <Link href="/" className="hover:underline">Home</Link>
            <span className="mx-2" aria-hidden>›</span>
            <span>Roadmap</span>
          </nav>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="label-caps">Six stages</p>
              <h1 className="mt-2 text-4xl sm:text-5xl">Your roadmap</h1>
              <p className="mt-3 max-w-2xl text-[16px] text-slate-700">
                Your results grouped into six stages, roughly in the order an AI
                tool matures. Each stage shows what it takes to move on, and you
                can open any criterion to see the reasoning and evidence behind it.
              </p>
            </div>

            {model && model.reportingPeriods.length > 1 && (
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                Reporting period
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="border border-slate-300 bg-white px-3 py-2 text-sm font-normal"
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
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
      </div>
    </div>
  );
}