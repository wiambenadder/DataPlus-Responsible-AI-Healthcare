import Link from "next/link";
import { subdomainAnchor } from "@/lib/assessment";
import { ADVANCE_THRESHOLD } from "@/lib/roadmap/framework";
import type { RoadmapStage, RoadmapSubdomain } from "@/lib/roadmap/types";
import StatusBadge from "./StatusBadge";

const STATE_TAG: Record<RoadmapStage["state"], { label: string; cls: string }> = {
  complete: { label: "Complete", cls: "bg-[#d9ece9] text-[#174f4f]" },
  in_progress: { label: "In progress", cls: "bg-[#dbeaf6] text-[#04477a]" },
  not_started: { label: "Not started", cls: "bg-slate-100 text-slate-700" },
};

/**
 * One stage in the step-by-step list: a numbered circle on a vertical
 * line, a header row, and (when open) the stage's practices with their
 * status, the threshold to move on, and the quickest next step.
 */
export default function StageStep({
  stage,
  isCurrent,
  open,
  onToggle,
  onAsk,
  first,
  last,
}: {
  first: boolean;
  last: boolean;
  stage: RoadmapStage;
  isCurrent: boolean;
  open: boolean;
  onToggle: () => void;
  onAsk: (question: string) => void;
}) {
  const practices = stage.domainGroups.flatMap((g) => g.subdomains);
  const needed = Math.ceil(stage.totalCount * ADVANCE_THRESHOLD);
  const toGo = Math.max(0, needed - stage.practicedCount);
  const quick =
    practices.find((p) => p.status === "no_data") ?? practices.find((p) => p.status === "not_practiced");
  const tag = STATE_TAG[stage.state];
  const bodyId = `stage-${stage.id}-body`;

  return (
    <li id={`stage-${stage.id}`} className="relative scroll-mt-24 pl-16">
      {/* Vertical line and numbered circle */}
      <span
        className="absolute left-[19px] w-0.5 bg-slate-300"
        style={{ top: first ? "1.5rem" : 0, bottom: last ? "calc(100% - 1.5rem)" : 0 }}
        aria-hidden
      />
      <span
        className={`absolute left-0 top-2.5 grid h-10 w-10 place-items-center rounded-full border-2 text-base font-bold ${
          isCurrent
            ? "border-brand-navy bg-brand-navy text-white"
            : stage.state === "complete"
              ? "border-brand-teal bg-brand-teal text-white"
              : "border-slate-500 bg-white text-ink"
        }`}
        aria-hidden
      >
        {stage.id}
      </span>

      <h3 className="border-b border-slate-200">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={onToggle}
          className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 py-4 text-left"
        >
          <span className="sr-only">Stage {stage.id}: </span>
          <span className="min-w-0 flex-1 text-[1.2rem] font-bold text-ink hover:underline">
            {stage.name}
          </span>
          <span className="text-sm text-slate-600">
            {stage.practicedCount} of {stage.totalCount} practices met
          </span>
          {isCurrent && <span className="tag bg-brand-navy text-white">Current stage</span>}
          <span className={`tag ${tag.cls}`}>{tag.label}</span>
          <span className="w-12 text-right text-sm font-bold text-brand-dukeblue">
            {open ? "Hide" : "Show"}
          </span>
        </button>
      </h3>

      {open && (
        <div id={bodyId} className="border-b border-slate-200 pb-7 pt-4">
          <p className="text-[15px] leading-relaxed text-slate-700">{stage.description}</p>
          <p className="mt-2 text-[15px] text-slate-700">
            {stage.state === "complete" ? (
              <>All {stage.totalCount} practices met. This stage is complete.</>
            ) : toGo === 0 ? (
              <>
                <strong className="font-semibold text-ink">Ready to move on.</strong> Meet the remaining{" "}
                {stage.totalCount - stage.practicedCount} to complete the stage.
              </>
            ) : (
              <>
                Meet <strong className="font-semibold text-ink">{needed} of {stage.totalCount}</strong> to move on
                ({toGo} more to go); meet all {stage.totalCount} to complete the stage.
              </>
            )}{" "}
            <Link href="/framework#roadmap" className="link-more">
              How stages work
            </Link>
          </p>

          <ul className="mt-4">
            {practices.map((p) => (
              <PracticeRow key={`${p.domainId}-${p.name}`} practice={p} />
            ))}
          </ul>

          {quick && stage.state !== "complete" && (
            <div className="mt-5 border-l-4 border-brand-dukeblue bg-blue-50 px-5 py-4 text-[15px] leading-relaxed">
              <strong className="font-semibold text-ink">Quickest next step: </strong>
              {quick.status === "no_data" ? (
                <>
                  {quick.name} has no evidence yet. If you already do this, a document that shows
                  it, or a short written answer, may be enough.{" "}
                  <Link href="/report/assessment" className="link-more">
                    Add evidence ›
                  </Link>
                </>
              ) : (
                <>
                  {quick.name} isn&apos;t met yet. See why on the results page, then add evidence of
                  anything already in place.{" "}
                  <Link
                    href={`/dashboard#${subdomainAnchor(quick.domainName, quick.name)}`}
                    className="link-more"
                  >
                    See why ›
                  </Link>
                </>
              )}
            </div>
          )}

          <p className="mt-4">
            <button
              type="button"
              onClick={() =>
                onAsk(
                  stage.state === "complete"
                    ? `What should I keep doing for Stage ${stage.id}, ${stage.name}?`
                    : `How do I make progress in Stage ${stage.id}, ${stage.name}?`
                )
              }
              className="text-[15px] font-bold text-brand-dukeblue underline decoration-1 underline-offset-4 hover:decoration-2"
            >
              Ask the assistant about this stage
            </button>
          </p>
        </div>
      )}
    </li>
  );
}

function PracticeRow({ practice: p }: { practice: RoadmapSubdomain }) {
  return (
    <li className="grid grid-cols-1 gap-x-4 gap-y-1 border-t border-slate-100 py-3 first:border-t-0 sm:grid-cols-[minmax(0,1fr)_11rem_9.5rem] sm:items-center">
      <span>
        <Link
          href={`/dashboard#${subdomainAnchor(p.domainName, p.name)}`}
          className="font-bold text-ink hover:text-brand-dukeblue hover:underline"
        >
          {p.name}
        </Link>
        {p.revisited && <span className="ml-2 text-xs text-slate-500">(revisited from an earlier stage)</span>}
      </span>
      <span className="text-[13.5px] text-slate-600">{p.domainName}</span>
      <span>
        <StatusBadge status={p.status} />
      </span>
    </li>
  );
}
