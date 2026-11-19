"use client";

import { useState } from "react";
import { ChevronDown, FileText, RotateCcw } from "lucide-react";
import type { RoadmapSubdomain } from "@/lib/roadmap/types";
import StatusBadge from "./StatusBadge";
import EvidencePanel from "./EvidencePanel";

/**
 * One subdomain inside a stage. The collapsed row shows name + status;
 * expanding reveals the AI reasoning, the underlying answer, reporting
 * periods, and the source-traceability evidence list. A dedicated
 * "Recommendations" slot is stubbed for the future recommendation /
 * chatbot layer.
 */
export default function SubdomainCard({ subdomain }: { subdomain: RoadmapSubdomain }) {
  const [open, setOpen] = useState(false);
  const hasDetail = subdomain.assessments.length > 0 || subdomain.evidence.length > 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => hasDetail && setOpen((v) => !v)}
        aria-expanded={open}
        className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
          hasDetail ? "hover:bg-slate-50" : "cursor-default"
        }`}
      >
        <span className="flex-1 text-sm font-medium text-slate-800">
          {subdomain.name}
          {subdomain.revisited && (
            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500 align-middle">
              <RotateCcw className="h-3 w-3" aria-hidden />
              Revisited
            </span>
          )}
        </span>

        <StatusBadge status={subdomain.status} />

        {hasDetail && (
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
            aria-hidden
          />
        )}
      </button>

      {open && (
        <div className="border-t border-slate-100 px-4 py-4 space-y-4">
          {/* Assessment details from qualitative_responses */}
          {subdomain.assessments.map((a) => (
            <div key={a.responseId} className="rounded-lg bg-slate-50 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={a.status} />
                {a.reportingPeriod && (
                  <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-medium text-slate-500 ring-1 ring-inset ring-slate-200">
                    {a.reportingPeriod}
                  </span>
                )}
              </div>
              {a.reasoning && (
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  <span className="font-semibold text-slate-700">Why: </span>
                  {a.reasoning}
                </p>
              )}
              {a.answer && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs font-semibold text-blue-600 hover:text-blue-700">
                    View full response
                  </summary>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                    {a.answer}
                  </p>
                </details>
              )}
            </div>
          ))}

          {subdomain.assessments.length === 0 && (
            <p className="text-sm text-slate-500">
              No assessment has been recorded for this subdomain yet.
            </p>
          )}

          {/* Source traceability from domain_mapping */}
          {subdomain.evidence.length > 0 && (
            <EvidencePanel evidence={subdomain.evidence} />
          )}

          {/* Slot for the future recommendation / chatbot layer */}
          <div className="flex items-start gap-2 rounded-lg border border-dashed border-slate-200 p-3">
            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" aria-hidden />
            <p className="text-xs text-slate-400">
              Tailored recommendations for this subdomain will appear here in a
              future release.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
