"use client";

import { useEffect, useRef, useState } from "react";
import { FileSearch, FileText, X } from "lucide-react";
import type { PolicyDocument } from "@/lib/policy/types";
import { DepthBadge, DocumentBadges } from "./PolicyBadge";
import PolicySourceViewer from "./PolicySourceViewer";

export default function PolicyDocumentDrawer({
  document,
  onClose,
}: {
  document: PolicyDocument | null;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [viewerPage, setViewerPage] = useState<number | null>(null);

  useEffect(() => {
    if (!document) return;
    const previousOverflow = window.document.body.style.overflow;
    window.document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (viewerPage !== null) setViewerPage(null);
        else onClose();
      }
    };
    window.document.addEventListener("keydown", dismiss);
    return () => {
      window.document.body.style.overflow = previousOverflow;
      window.document.removeEventListener("keydown", dismiss);
    };
  }, [document, onClose, viewerPage]);

  if (!document) return null;

  return (
    <div className="fixed inset-0 z-[80]" role="presentation">
      <button
        type="button"
        aria-label="Close policy analysis"
        className="absolute inset-0 bg-brand-darkblue/55"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="policy-drawer-title"
        className="absolute inset-y-0 right-0 w-full max-w-3xl overflow-y-auto bg-white shadow-2xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-5 py-4">
          <span className="text-sm font-bold text-brand-dukeblue">Detailed policy analysis</span>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 items-center gap-2 px-3 font-bold text-brand-navy hover:bg-blue-50"
          >
            <X size={18} aria-hidden /> Close
          </button>
        </div>
        <div className="p-5 sm:p-8">
          <div className="flex gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center bg-blue-50 text-brand-dukeblue">
              <FileText size={30} aria-hidden />
            </span>
            <div>
              <p className="label-caps">{document.country} · {document.year}</p>
              <h2 id="policy-drawer-title" className="mt-1 text-2xl sm:text-3xl">{document.title}</h2>
              <p className="mt-1 text-sm text-brand-dukeblue">{document.localTitle}</p>
            </div>
          </div>

          <dl className="mt-6 grid gap-4 border-y py-5 text-sm sm:grid-cols-3">
            <div><dt className="font-bold text-slate-500">Publication date</dt><dd>{formatDate(document.publicationDate)}</dd></div>
            <div><dt className="font-bold text-slate-500">Issuing body</dt><dd>{document.agency}</dd></div>
            <div><dt className="font-bold text-slate-500">Document number</dt><dd>{document.decreeNumber ?? "Not provided"}</dd></div>
          </dl>

          <div className="mt-5"><DocumentBadges document={document} /></div>
          <section className="mt-6 border bg-blue-50 p-5" aria-labelledby="summary-heading">
            <h3 id="summary-heading" className="font-bold text-brand-navy">Executive summary</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-700">{document.summary}</p>
          </section>

          <button type="button" onClick={() => setViewerPage(primaryPage(document))} className="btn btn-primary mt-4 w-full">
            View illustrative source <FileSearch size={16} aria-hidden />
          </button>

          <section className="mt-9" aria-labelledby="analysis-heading">
            <div className="section-head"><h2 id="analysis-heading" className="text-2xl">Codebook Content Analysis</h2></div>
            <p className="mt-3 text-sm text-slate-600">Sample findings demonstrate the intended citation and depth-rating structure.</p>
            <div className="mt-5 space-y-4">
              {document.findings.map((finding) => (
                <article key={finding.subdomain} className="border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h3 className="font-bold text-brand-navy">{finding.subdomain}</h3>
                    <DepthBadge rating={finding.depthRating} label={finding.ratingLabel} />
                  </div>
                  <blockquote className="mt-3 border-l-4 border-blue-200 pl-4 text-sm italic text-slate-700">“{finding.excerpt}”</blockquote>
                  {finding.page ? <button type="button" onClick={() => setViewerPage(finding.page!)} className="mt-3 min-h-10 border px-3 text-xs font-bold text-brand-dukeblue hover:bg-blue-50">Page {finding.page}{finding.article ? `, Article ${finding.article}` : ""} →</button> : <p className="mt-3 text-xs font-bold text-slate-500">No page reference</p>}
                </article>
              ))}
            </div>
          </section>

          <p className="mt-8 border-t pt-4 text-xs leading-relaxed text-slate-500">
            Prototype notice: records, excerpts, ratings and metrics shown here are illustrative and require verification before production publication.
          </p>
        </div>
      </aside>
      {viewerPage !== null && <PolicySourceViewer document={document} initialPage={viewerPage} onClose={() => setViewerPage(null)} />}
    </div>
  );
}

function primaryPage(document: PolicyDocument) {
  return document.findings.find((finding) => finding.page)?.page ?? 1;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}
