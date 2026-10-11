"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Link2 } from "lucide-react";
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
import OpenFileButton from "./OpenFileButton";

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
  accent = "#0577B1",
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
  /** Domain colour for the open panel's left rule. */
  accent?: string;
  /** The feedback area. */
  children: React.ReactNode;
}) {
  const [showAll, setShowAll] = useState(false);
  const panelId = `${result.anchor}-panel`;
  const [first, ...rest] = result.evidence;
  const moreCount = rest.length + result.otherEvidence.length;

  return (
    <li id={result.anchor} className="scroll-mt-28 border-b border-slate-200">
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={onToggle}
        className="group flex w-full flex-wrap items-center gap-x-4 gap-y-1.5 py-4 pl-1 pr-2 text-left hover:bg-slate-50 sm:flex-nowrap"
      >
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${
            expanded ? "" : "-rotate-90"
          }`}
          aria-hidden
        />
        <span className="min-w-0 flex-1 basis-[calc(100%-2.5rem)] text-[15.5px] font-bold text-ink sm:basis-auto">
          {result.subdomain}
        </span>
        <span className="flex items-center gap-4 pl-8 sm:pl-0">
          <StatusBadge status={status} />
          <span
            className={`w-28 whitespace-nowrap text-right text-[13.5px] ${
              feedbackCount ? "text-slate-700" : "text-slate-400"
            }`}
          >
            {feedbackCount
              ? `${feedbackCount} ${feedbackCount === 1 ? "comment" : "comments"}`
              : "No comments"}
          </span>
        </span>
      </button>

      {expanded && (
        <div
          id={panelId}
          className="mb-4 border-l-4 bg-slate-50 px-5 py-6 sm:px-7"
          style={{ borderLeftColor: accent }}
        >
          <div className="grid gap-8 md:grid-cols-2">
            {/* Left: the result and why */}
            <div>
              <h4 className="text-[0.75rem] font-bold uppercase tracking-[0.1em] text-brand-navy">
                Why this result
              </h4>
              <p className="mt-1.5 text-[15px] leading-relaxed text-slate-800">
                {whyThisResult(status, {
                  disputed,
                  hasEvidence: result.evidence.length > 0,
                })}
              </p>

              <h4 className="mt-5 text-[0.75rem] font-bold uppercase tracking-[0.1em] text-brand-navy">
                Summary
              </h4>
              <p className="mt-1.5 text-[15px] leading-relaxed text-slate-800">
                {result.summary ??
                  (status === "not_reported"
                    ? "No result yet. Nothing submitted so far covers this practice."
                    : "This practice hasn't been rated yet.")}
              </p>

              <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-5 gap-y-2 border-y border-slate-200 py-3 text-sm">
                <dt className="text-slate-500">Status</dt>
                <dd>
                  <StatusBadge status={status} size="sm" />
                  {disputed && result.baseStatus !== status && (
                    <span className="mt-1 block text-xs text-slate-500">
                      Rated “{STATUS_META[result.baseStatus].label}” before the source was
                      questioned.
                    </span>
                  )}
                </dd>
                <dt className="text-slate-500">Confidence</dt>
                <dd className="text-slate-800">
                  {confidence ? (
                    <>
                      <span
                        className={`font-semibold ${
                          confidence === "needs_verification" ? "text-brand-dukeblue" : ""
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

              <h4 className="mt-5 text-[0.75rem] font-bold uppercase tracking-[0.1em] text-brand-navy">
                What counts as met
              </h4>
              {result.criterion && (
                <p className="mt-1.5 text-[15px] leading-relaxed text-slate-700">{result.criterion}</p>
              )}
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                A practice already in place. Informal processes count; plans do not.{" "}
                <Link href="/framework#rating" className="link-more">
                  How ratings work
                </Link>
              </p>
            </div>

            {/* Right: the evidence */}
            <div>
              <h4 className="text-[0.75rem] font-bold uppercase tracking-[0.1em] text-brand-navy">
                Evidence
                {result.evidence.length + result.otherEvidence.length > 0 && (
                  <span className="ml-1 font-normal normal-case tracking-normal text-slate-500">
                    ({result.evidence.length}
                    {result.otherEvidence.length ? ` + ${result.otherEvidence.length} earlier` : ""})
                  </span>
                )}
              </h4>

              {first ? (
                <ul className="mt-2 space-y-6">
                  <EvidenceBlock item={first} onOpenSource={onOpenSource} onReportSource={onReportSource} />
                  {showAll &&
                    rest.map((item) => (
                      <EvidenceBlock
                        key={item.key}
                        item={item}
                        onOpenSource={onOpenSource}
                        onReportSource={onReportSource}
                      />
                    ))}
                </ul>
              ) : (
                <p className="mt-2 text-[15px] text-slate-600">
                  No evidence on file for this practice.{" "}
                  <Link href="/report/assessment" className="link-more">
                    Add evidence
                  </Link>
                </p>
              )}

              {showAll && result.otherEvidence.length > 0 && (
                <div className="mt-6 border-t border-slate-200 pt-4">
                  <p className="text-sm font-semibold text-slate-700">
                    Earlier evidence on file{" "}
                    <span className="font-normal text-slate-500">(not used for the current result)</span>
                  </p>
                  <ul className="mt-3 space-y-6">
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
                </div>
              )}

              {moreCount > 0 && (
                <button
                  type="button"
                  aria-expanded={showAll}
                  onClick={() => setShowAll((v) => !v)}
                  className="mt-4 text-sm font-bold text-brand-dukeblue hover:underline"
                >
                  {showAll ? "Show less evidence" : `Show all evidence (${moreCount} more)`}
                </button>
              )}
            </div>
          </div>

          {/* Feedback */}
          <div className="mt-6 border-t border-slate-200 pt-5">{children}</div>

          <button
            type="button"
            onClick={onCopyLink}
            className="mt-4 inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800"
          >
            <Link2 className="h-3.5 w-3.5" aria-hidden />
            {copied ? "Link copied" : "Copy link to this practice"}
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

      {item.quote && (
        <blockquote className="mt-1.5 font-serif text-[18px] leading-snug text-ink">
          “{item.quote}”
          <span className="mt-1 block font-sans text-xs not-italic text-slate-600">
            Exact passage{item.page ? `, page ${item.page}` : ""}
          </span>
        </blockquote>
      )}
      <blockquote
        className={`mt-1.5 whitespace-pre-line leading-relaxed text-slate-800 ${
          item.verbatim ? "font-serif text-[17px]" : "text-[15px]"
        }`}
      >
        {item.verbatim ? `“${text}”` : text}
      </blockquote>
      {long && (
        <button
          type="button"
          onClick={() => setFull((v) => !v)}
          className="mt-1 text-xs font-semibold text-brand-dukeblue hover:underline"
        >
          {full ? "Show less" : "Show full text"}
        </button>
      )}
      <p className="mt-1 text-xs text-slate-500">
        {item.verbatim
          ? "Exactly as your team submitted it."
          : "Summarized from the document by the platform — not a direct quote."}
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
        {item.kind === "document" && item.sourcePath ? (
          <OpenFileButton path={item.sourcePath}>View source</OpenFileButton>
        ) : (
          <button
            type="button"
            onClick={() => onOpenSource(item)}
            className="font-semibold text-brand-dukeblue hover:underline"
          >
            View source
          </button>
        )}
      </p>
      <button
        type="button"
        onClick={() => onReportSource(item)}
        className="mt-1 text-xs text-slate-600 underline decoration-slate-300 underline-offset-2 hover:text-brand-bronze hover:decoration-brand-bronze"
      >
        Report wrong source or company
      </button>
    </li>
  );
}
