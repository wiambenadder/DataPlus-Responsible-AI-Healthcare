"use client";

import Link from "next/link";
import { FileText, Upload } from "lucide-react";

export interface HistoryItem {
  id: string;
  kind: "report" | "document";
  title: string;
  date: string | null; // ISO timestamp from the database, or null
}

/**
 * History of what has been uploaded and done: submitted report periods
 * and uploaded documents, merged into one newest-first timeline.
 * Replaces the old "Overall topics practiced / Recent assessment
 * activity" snapshot and the upload CTA.
 */
export default function HistorySection({ history }: { history: HistoryItem[] }) {
  return (
    <section
      id="history"
      aria-labelledby="history-heading"
      className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
            History
          </p>
          <h2
            id="history-heading"
            className="mt-1 text-2xl font-bold tracking-tight text-slate-900"
          >
            What you&apos;ve uploaded and done
          </h2>
        </div>
        <Link
          href="/upload"
          className="text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          Upload a new document →
        </Link>
      </div>

      <ul className="mt-6 space-y-3">
        {history.length === 0 && (
          <li className="rounded-xl border border-dashed border-slate-200 p-5 text-sm text-slate-400">
            Nothing here yet — submit a report or upload a document and it
            will show up in your history.
          </li>
        )}
        {history.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  item.kind === "report"
                    ? "bg-blue-50 text-blue-600"
                    : "bg-emerald-50 text-emerald-600"
                }`}
                aria-hidden
              >
                {item.kind === "report" ? (
                  <FileText className="h-4 w-4" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
              </span>
              <div>
                <p className="text-sm font-medium text-slate-800">
                  {item.title}
                </p>
                <p className="text-xs text-slate-400">
                  {item.kind === "report" ? "Report" : "Document upload"}
                </p>
              </div>
            </div>
            <span className="shrink-0 text-xs font-medium text-slate-400">
              {formatDate(item.date)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function formatDate(date: string | null) {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
