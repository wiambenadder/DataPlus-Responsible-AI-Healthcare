"use client";

import { useState } from "react";
import { ChevronDown, FileText, RotateCcw } from "lucide-react";
import type { RoadmapSubdomain } from "@/lib/roadmap/types";
import StatusBadge from "./StatusBadge";

export default function SubdomainCard({
  subdomain,
}: {
  subdomain: RoadmapSubdomain;
}) {
  const [open, setOpen] = useState(false);
  const panelId = `subdomain-panel-${subdomain.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
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

        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden
        />
      </button>

      {open && (
        <div id={panelId} className="border-t border-slate-100 px-4 py-4">
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