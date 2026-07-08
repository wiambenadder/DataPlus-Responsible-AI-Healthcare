"use client";

import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import type { RoadmapStage } from "@/lib/roadmap/types";

/**
 * Compact per-stage summary card for the top overview strip. Visual
 * language matches the dashboard's domain cards: white card, small
 * title, big colored percentage, "x of y" caption.
 */
export default function StageProgressCard({
  stage,
  isCurrent,
  onSelect,
}: {
  stage: RoadmapStage;
  isCurrent: boolean;
  onSelect: (id: number) => void;
}) {
  const pct = Math.round(stage.score * 100);
  const pctColor =
    stage.state === "complete"
      ? "text-emerald-600"
      : stage.state === "in_progress"
        ? "text-amber-500"
        : "text-slate-400";

  return (
    <button
      type="button"
      onClick={() => onSelect(stage.id)}
      className={`group flex flex-col rounded-2xl border bg-white p-5 text-left transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
        isCurrent ? "border-blue-500 ring-1 ring-blue-500" : "border-slate-200"
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Stage {stage.id}
        </p>
        {isCurrent && (
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-600">
            Current
          </span>
        )}
        {stage.state === "complete" && !isCurrent && (
          <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden />
        )}
      </div>

      <p className="mt-1 text-sm font-semibold text-slate-900">{stage.name}</p>

      <p className={`mt-3 text-3xl font-extrabold tracking-tight ${pctColor}`}>
        {pct}%
      </p>
      <p className="mt-1 text-xs text-slate-500">
        {stage.practicedCount} of {stage.totalCount} practiced
      </p>

      {stage.canAdvance && stage.state !== "complete" && (
        <p className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-blue-600">
          <ArrowUpRight className="h-3 w-3" aria-hidden />
          Ready to advance
        </p>
      )}
    </button>
  );
}
