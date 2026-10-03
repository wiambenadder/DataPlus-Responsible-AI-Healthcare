"use client";

import { useState } from "react";
import { ChevronDown, ExternalLink, Link2 } from "lucide-react";
import {
  CONFIDENCE_META,
  STATUS_META,
  whyThisResult,
  type Confidence,
  type EvidenceItem,
  type Status,
  type SubdomainResult,
} from "@/lib/assessment";
import StatusBadge from "./StatusBadge";

/**
 * One subdomain: a one-line row (name, status, feedback count) that
 * expands into the full result — status, confidence, summary, why, the
 * evidence and its source — followed by the feedback area.
 */
export default function SubdomainItem({
  result,
  status,
  confidence,
  disputed,
  expanded,
  onToggle,
  feedbackCount,
  onOpenSource,
  onReportSource,
  onCopyLink,
  copied,
  children,
}: {
  result: SubdomainResult;
  status: Status;
  confidence: Confidence | null;
  disputed: boolean;
  expanded: boolean;
  onToggle: () => void;
  feedbackCount: number;
  onOpenSource: (item: EvidenceItem) => void;
  onReportSource: (item: EvidenceItem) => void;
  onCopyLink: () => void;
  copied: boolean;
  /** The feedback area. */
  children: React.ReactNode;
}) {
  const [showEvidence, setShowEvidence] = useState(false);
  const panelId = `${result.anchor}-panel`;
  const evidenceCount = result.evidence.length + result.otherEvidence.length;

  return (
    <li id={result.anchor} className="scroll-mt-32 lg:scroll-mt-24">
      <div className="flex items-stretch">
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={panelId}
          onClick={onToggle}
          className="group flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-1.5 py-3.5 pl-1 pr-2 text-left hover:bg-slate-50 sm:flex-nowrap"
        >
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${
              expanded ? "" : "-rotate-90"
            }`}
            aria-hidden
          />
          <span className="min-w-0 flex-1 basis-[calc(100%-2.5rem)] text-[15px] font-semibold text-slate-900 sm:basis-auto">
            {result.subdomain}
          </span>
          <span className="flex items-center gap-3 pl-8 sm:pl-0">
            <StatusBadge status={status} />
            <span
              className={`w-24 whitespace-nowrap text-xs ${
                feedbackCount ? "font-semibold text-slate-700" : "text-slate-500"
              }`}
            >
              Feedback ({feedbackCount})
            </span>
          </span>
        </button>
      </div>

      {expanded && (
        <div id={panelId} className="pb-6 pl-1 sm:pl-8 sm:pr-2">
          {/* Criterion */}
          {result.criterion && (
            <p className="text-sm leading-relaxed text-slate-600">
              <span className="font-semibold text-slate-700">Criterion. </span>
              {result.criterion}
            </p>
          )}

          {/* Status & confidence */}
          <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 border-y border-slate-200 py-3 text-sm sm:grid-cols-[auto_auto_auto_1fr]">
            <dt className="text-slate-500">Status</dt>
            <dd>
              <StatusBadge status={status} />
              {disputed && result.baseStatus !== status && (
                <span className="mt-1 block text-xs text-slate-500">
                  Rated “{STATUS_META[result.baseStatus].label}” before the
                  source was questioned.
                </span>
              )}
            </dd>
            <dt className="text-slate-500">Confidence</dt>
            <dd className="text-slate-800">
              {confidence ? (
                <>
                  <span
                    className={`font-semibold ${
                      confidence === "needs_verification" ? "text-violet-900" : ""
                    }`}
                  >
                    {CONFIDENCE_META[confidence].label}
                  </span>
                  <span className="block text-xs text-slate-500">
                    {disputed
                      ? "A source was reported as wrong. Check it before relying on this result."
                      : CONFIDENCE_META[confidence].help}
                  </span>
                </>
              ) : (
                <span className="text-slate-500">—</span>
              )}
            </dd>
          </dl>

          {/* Summary */}
          <h4 className="mt-5 text-sm font-semibold text-slate-900">Summary</h4>
          <p className="mt-1 text-[15px] leading-relaxed text-slate-800">
            {result.summary ??
              (status === "not_reported"
                ? "No result yet. Nothing submitted so far covers this criterion."
                : "This criterion hasn't been rated yet.")}
          </p>

          {/* Why */}
          <h4 className="mt-4 text-sm font-semibold text-slate-900">
            Why this result
          </h4>
          <p className="mt-1 text-[15px] leading-relaxed text-slate-700">
            {whyThisResult(status, {
              disputed,
              hasEvidence: result.evidence.length > 0,
            })}
          </p>

          {/* Evidence */}
          {evidenceCount > 0 ? (
            <div className="mt-4">
              <button
                type="button"
                aria-expanded={showEvidence}
                onClick={() => setShowEvidence((v) => !v)}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:underline"
              >
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${showEvidence ? "" : "-rotate-90"}`}
                  aria-hidden
                />
                {showEvidence ? "Hide evidence" : "View evidence"}
                <span className="font-normal text-slate-500">
                  ({result.evidence.length}
                  {result.otherEvidence.length
                    ? ` + ${result.otherEvidence.length} earlier`
                    : ""}
                  )
                </span>
              </button>

              {showEvidence && (
                <div className="mt-3 border-l-2 border-slate-200 pl-4">
                  <h4 className="text-sm font-semibold text-slate-900">
                    Evidence used
                  </h4>
                  <ul className="mt-2 space-y-5">
                    {result.evidence.map((item) => (
                      <EvidenceBlock
                        key={item.key}
                        item={item}
                        onOpenSource={onOpenSource}
                        onReportSource={onReportSource}
                      />
                    ))}
                  </ul>

                  {result.otherEvidence.length > 0 && (
                    <details className="group mt-5">
                      <summary className="cursor-pointer text-sm font-semibold text-slate-700 hover:text-slate-900">
                        Earlier evidence on file ({result.otherEvidence.length})
                        <span className="ml-1 font-normal text-slate-500">
                          — not used for the current result
                        </span>
                      </summary>
                      <ul className="mt-3 space-y-5">
                        {result.otherEvidence.map((item) => (
                          <EvidenceBlock
                            key={item.key}
                            item={item}
                            showRating
                            onOpenSource={onOpenSource}
                            onReportSource={onReportSource}
                          />
                        ))}
                      </ul>
                    </details>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              No evidence on file for this criterion.
            </p>
          )}

          {/* Feedback */}
          <div className="mt-6 border-t border-slate-200 pt-4">{children}</div>

          <button
            type="button"
            onClick={onCopyLink}
            className="mt-4 inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800"
          >
            <Link2 className="h-3.5 w-3.5" aria-hidden />
            {copied ? "Link copied" : "Copy link to this criterion"}
          </button>
        </div>
      )}
    </li>
  );
}

function EvidenceBlock({
  item,
  showRating,
  onOpenSource,
  onReportSource,
}: {
  item: EvidenceItem;
  showRating?: boolean;
  onOpenSource: (item: EvidenceItem) => void;
  onReportSource: (item: EvidenceItem) => void;
}) {
  const long = item.text.length > 600;
  const [full, setFull] = useState(!long);
  const text = full ? item.text : `${item.text.slice(0, 560).trimEnd()}…`;

  return (
    <li>
      {item.kind === "interview" && item.question && (
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-slate-700">Question: </span>
          {item.question}
        </p>
      )}

      <blockquote
        className={`mt-1.5 whitespace-pre-line text-[15px] leading-relaxed text-slate-800 ${
          item.verbatim ? "font-serif italic" : ""
        }`}
      >
        {item.verbatim ? `“${text}”` : text}
      </blockquote>
      {long && (
        <button
          type="button"
          onClick={() => setFull((v) => !v)}
          className="mt-1 text-xs font-semibold text-blue-600 hover:underline"
        >
          {full ? "Show less" : "Show full text"}
        </button>
      )}
      <p className="mt-1 text-xs text-slate-500">
        {item.verbatim
          ? "Exactly as your team submitted it."
          : "Summarised from the document by the platform — not a direct quote."}
      </p>

      <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
        <span className="text-slate-500">Source:</span>
        <span className="font-semibold text-slate-900">{item.sourceTitle}</span>
        {item.sourceDate && (
          <>
            <span className="text-slate-400" aria-hidden>·</span>
            <span className="text-slate-600">{item.sourceDate}</span>
          </>
        )}
        {showRating && item.rating && (
          <>
            <span className="text-slate-400" aria-hidden>·</span>
            <span className="text-slate-600">
              rated “{STATUS_META[item.rating].label}”
            </span>
          </>
        )}
        <span className="text-slate-400" aria-hidden>·</span>
        {item.kind === "document" && item.sourceUrl ? (
          <a
            href={item.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:underline"
          >
            View source
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            <span className="sr-only">(opens the document in a new tab)</span>
          </a>
        ) : (
          <button
            type="button"
            onClick={() => onOpenSource(item)}
            className="font-semibold text-blue-600 hover:underline"
          >
            View source
          </button>
        )}
      </p>
      <button
        type="button"
        onClick={() => onReportSource(item)}
        className="mt-1 text-xs text-slate-600 underline decoration-slate-300 underline-offset-2 hover:text-rose-800 hover:decoration-rose-800"
      >
        Report wrong source or company
      </button>
    </li>
  );
}
