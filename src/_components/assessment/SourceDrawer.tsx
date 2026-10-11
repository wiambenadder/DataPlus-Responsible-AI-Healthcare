"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import OpenFileButton from "./OpenFileButton";
import type { EvidenceItem } from "@/lib/assessment";

/**
 * Side panel showing a source in full: the question and the answer as
 * typed, or the document extract with a link to the original file.
 */
export default function SourceDrawer({
  item,
  subdomain,
  onClose,
}: {
  item: EvidenceItem | null;
  subdomain: string;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!item) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [item, onClose]);

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-labelledby="source-drawer-title">
      <button
        type="button"
        aria-label="Close source"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-slate-900/30"
      />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col border-l border-slate-200 bg-white">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs text-slate-500">Source for · {subdomain}</p>
            <h2 id="source-drawer-title" className="mt-0.5 text-lg font-semibold text-slate-900">
              {item.sourceTitle}
            </h2>
            {item.sourceDate && (
              <p className="mt-0.5 text-sm text-slate-500">{item.sourceDate}</p>
            )}
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="h-5 w-5" aria-hidden />
            <span className="sr-only">Close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {item.kind === "interview" ? (
            <>
              <p className="text-sm font-semibold text-slate-700">Question asked</p>
              <p className="mt-1 text-[15px] leading-relaxed text-slate-800">
                {item.question || "—"}
              </p>
              <p className="mt-5 text-sm font-semibold text-slate-700">
                Answer, exactly as submitted
              </p>
              <p className="mt-1 whitespace-pre-line border-l-2 border-blue-600 pl-4 text-[15px] leading-relaxed text-slate-800">
                {item.text}
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-slate-700">
                What the platform extracted from this document
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Summarised by the platform, not a direct quote. Check it against
                the original document.
              </p>
              <p className="mt-3 whitespace-pre-line border-l-2 border-slate-300 pl-4 text-[15px] leading-relaxed text-slate-800">
                {item.text}
              </p>
              {item.sourcePath ? (
                <p className="mt-5">
                  <OpenFileButton path={item.sourcePath} className="btn btn-primary">
                    Open the original document
                  </OpenFileButton>
                </p>
              ) : (
                <p className="mt-5 text-sm text-slate-600">
                  The original file couldn&apos;t be found among your uploads.
                </p>
              )}
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
