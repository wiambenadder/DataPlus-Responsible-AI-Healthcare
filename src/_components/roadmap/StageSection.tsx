import { ArrowUpRight, CheckCircle2, Sparkles } from "lucide-react";
import type { RoadmapStage } from "@/lib/roadmap/types";
import DomainGroup from "./DomainGroup";

function StageStatePill({ stage }: { stage: RoadmapStage }) {
  if (stage.state === "complete") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
        Complete
      </span>
    );
  }
  if (stage.state === "in_progress") {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
        In Progress
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500 ring-1 ring-inset ring-slate-200">
      Not Started
    </span>
  );
}

/**
 * A full roadmap stage: header with score and state, subdomains grouped
 * by domain, and a placeholder block reserved for stage-level
 * recommendations (future recommendation / chatbot layer).
 */
export default function StageSection({
  stage,
  isCurrent,
}: {
  stage: RoadmapStage;
  isCurrent: boolean;
}) {
  const pct = Math.round(stage.score * 100);

  return (
    <section
      id={`stage-${stage.id}`}
      className={`scroll-mt-24 rounded-2xl border bg-white p-6 sm:p-8 ${
        isCurrent ? "border-blue-500 ring-1 ring-blue-500" : "border-slate-200"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
            Stage {stage.id}
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            {stage.name}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
            {stage.description}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            {isCurrent && (
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 ring-1 ring-inset ring-blue-200">
                Current Stage
              </span>
            )}
            <StageStatePill stage={stage} />
          </div>
          <p className="text-sm text-slate-500">
            <span
              className={`text-xl font-extrabold ${
                stage.state === "complete"
                  ? "text-emerald-600"
                  : stage.state === "in_progress"
                    ? "text-amber-500"
                    : "text-slate-400"
              }`}
            >
              {pct}%
            </span>{" "}
            · {stage.practicedCount} of {stage.totalCount} practiced
          </p>
          {stage.canAdvance && stage.state !== "complete" && (
            <p className="inline-flex items-center gap-1 text-xs font-medium text-blue-600">
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
              Above threshold — can advance while closing gaps
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {stage.domainGroups.map((group) => (
          <DomainGroup key={group.domainId} group={group} />
        ))}
      </div>

      {/* Reserved slot: stage-level recommendations / chatbot entry point */}
      <div className="mt-6 flex items-start gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" aria-hidden />
        <div>
          <p className="text-sm font-semibold text-slate-500">
            Stage recommendations
          </p>
          <p className="text-xs text-slate-400">
            Guidance on how to progress through this stage will appear here once
            the recommendation engine is connected.
          </p>
        </div>
      </div>
    </section>
  );
}
