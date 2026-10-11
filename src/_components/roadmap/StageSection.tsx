import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { RoadmapStage } from "@/lib/roadmap/types";
import { ADVANCE_THRESHOLD } from "@/lib/roadmap/framework";
import DomainGroup from "./DomainGroup";

function StageStatePill({ stage }: { stage: RoadmapStage }) {
  const label =
    stage.state === "complete"
      ? "Complete"
      : stage.state === "in_progress"
        ? "In progress"
        : "Not started";
  return (
    <span className="rounded border border-slate-300 px-2 py-0.5 text-xs font-semibold text-slate-700">
      {label}
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
  const needed = Math.ceil(stage.totalCount * ADVANCE_THRESHOLD);

  return (
    <section
      id={`stage-${stage.id}`}
      className={`scroll-mt-6 border border-slate-200 bg-white p-6 sm:p-8 ${
        isCurrent ? "border-t-4 border-t-brand-teal" : "border-t-4 border-t-brand-navy"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="label-caps">Stage {stage.id}</p>
          <h2 className="mt-1 text-[1.7rem] font-semibold">
            {stage.name}
          </h2>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-slate-700">
            {stage.description}
          </p>
          <p className="mt-2 text-sm text-slate-800">
            <strong className="font-semibold">Thresholds:</strong> ready to move on at{" "}
            {needed} of {stage.totalCount} criteria met · complete at {stage.totalCount} of{" "}
            {stage.totalCount}.{" "}
            <Link href="/framework#roadmap" className="font-semibold text-brand-dukeblue underline underline-offset-2">
              How stages work
            </Link>
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            {isCurrent && (
              <span className="bg-brand-teal px-2 py-0.5 text-xs font-bold uppercase tracking-[0.08em] text-white">
                Current stage
              </span>
            )}
            <StageStatePill stage={stage} />
          </div>
          <p className="text-sm text-slate-500">
            <span className="text-xl font-semibold tabular-nums text-slate-900">
              {pct}%
            </span>{" "}
            · {stage.practicedCount} of {stage.totalCount} criteria met
          </p>
          {stage.canAdvance && stage.state !== "complete" && (
            <p className="inline-flex items-center gap-1 text-xs font-medium text-blue-600">
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
              Above the threshold to move on, with some gaps left to close
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
      <div className="mt-6 border-t border-slate-200 pt-4">
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
