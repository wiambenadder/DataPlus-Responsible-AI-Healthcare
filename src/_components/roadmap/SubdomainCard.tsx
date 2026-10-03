"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, RotateCcw } from "lucide-react";
import { subdomainAnchor } from "@/lib/assessment";
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
    <div className="border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
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
        <div id={panelId} className="border-t border-slate-100 px-4 py-3 text-sm">
          <Link
            href={`/dashboard#${subdomainAnchor(subdomain.domainName, subdomain.name)}`}
            className="font-semibold text-blue-600 hover:underline"
          >
            See the result, evidence and sources
          </Link>
          <p className="mt-1 text-xs text-slate-500">
            Recommendations for this criterion will be added here later.
          </p>
        </div>
      )}
    </div>
  );
}