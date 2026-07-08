"use client";

import { useState } from "react";
import { FileSearch } from "lucide-react";
import type { EvidenceItem } from "@/lib/roadmap/types";

const PREVIEW_COUNT = 2;

/**
 * Source-traceability list backed by `domain_mapping`: quote, source
 * document, and extraction confidence. Shows a couple of items with a
 * "show all" toggle so long evidence lists stay compact.
 */
export default function EvidencePanel({ evidence }: { evidence: EvidenceItem[] }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? evidence : evidence.slice(0, PREVIEW_COUNT);

  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
        <FileSearch className="h-3.5 w-3.5" aria-hidden />
        Supporting evidence ({evidence.length})
      </p>

      <ul className="mt-2 space-y-2">
        {visible.map((item) => (
          <li
            key={item.mappingId}
            className="rounded-lg border border-slate-200 bg-white p-3"
          >
            {item.quote && (
              <p className="text-sm leading-relaxed text-slate-600">{item.quote}</p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
              {item.sourcePdf && (
                <span className="text-xs font-medium text-slate-500">
                  {item.sourcePdf}
                </span>
              )}
              {typeof item.confidence === "number" && (
                <span className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                    <span
                      className="block h-full rounded-full bg-blue-500"
                      style={{ width: `${Math.round(item.confidence * 100)}%` }}
                    />
                  </span>
                  {Math.round(item.confidence * 100)}% confidence
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>

      {evidence.length > PREVIEW_COUNT && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-700"
        >
          {showAll ? "Show fewer" : `Show all ${evidence.length} sources`}
        </button>
      )}
    </div>
  );
}
