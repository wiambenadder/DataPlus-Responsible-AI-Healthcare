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

  return (
    <button
      type="button"
      onClick={() => onSelect(stage.id)}
      className={`group flex flex-col border bg-white p-4 text-left hover:border-slate-400 ${
        isCurrent ? "border-slate-200 border-t-4 border-t-blue-600" : "border-slate-200"
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">Stage {stage.id}</p>
        {isCurrent && (
          <span className="text-[11px] font-semibold text-blue-600">
            Current
          </span>
        )}
        {stage.state === "complete" && !isCurrent && (
          <CheckCircle2 className="h-4 w-4 text-emerald-700" aria-hidden />
        )}
      </div>

      <p className="mt-1 text-sm font-semibold text-slate-900">{stage.name}</p>

      <p className="mt-3 text-2xl font-semibold tabular-nums text-slate-900">
        {pct}%
      </p>
      <p className="mt-1 text-xs text-slate-500">
        {stage.practicedCount} of {stage.totalCount} criteria met
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
