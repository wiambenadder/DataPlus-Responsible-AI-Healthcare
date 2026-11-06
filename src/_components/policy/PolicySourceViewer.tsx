"use client";

import { useMemo, useRef, useState } from "react";
import { FileSearch, Search, X, ZoomIn, ZoomOut } from "lucide-react";
import type { PolicyDocument } from "@/lib/policy/types";

// Policy Dashboard v0.3: restores the v0.1 drawer-to-document-viewer flow
// inside the native Next.js module, while retaining Innovator Insights styling.
export default function PolicySourceViewer({
  document,
  initialPage,
  onClose,
}: {
  document: PolicyDocument;
  initialPage: number;
  onClose: () => void;
}) {
  const pages = useMemo(() => {
    const cited = document.findings.flatMap((finding) =>
      finding.page ? [finding.page] : [],
    );
    const values = cited.length ? cited : [1, 2, 3];
    return Array.from(new Set([initialPage - 1, initialPage, initialPage + 1, ...values]))
      .filter((page) => page > 0)
      .sort((a, b) => a - b);
  }, [document.findings, initialPage]);
  const [page, setPage] = useState(initialPage);
  const [zoom, setZoom] = useState(100);
  const [findOpen, setFindOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const citation = document.findings.find((finding) => finding.page === page);

  return (
    <div className="fixed inset-0 z-[100] bg-brand-darkblue/75 p-2 sm:p-5" role="presentation">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="source-viewer-title"
        className="mx-auto flex h-full max-w-[92rem] flex-col overflow-hidden bg-[#eef3f7] shadow-2xl"
      >
        <div className="flex min-h-16 flex-wrap items-center gap-3 border-b bg-white px-4 py-3 sm:px-6">
          <FileSearch className="text-brand-dukeblue" aria-hidden />
          <div className="min-w-0 flex-1">
            <h2 id="source-viewer-title" className="truncate text-lg font-bold sm:text-xl">Policy document viewer</h2>
            <p className="truncate text-xs text-slate-500">{document.title} · Page {page}</p>
          </div>
          {findOpen && <label className="hidden items-center gap-2 border px-3 py-2 sm:flex"><Search size={15} aria-hidden /><span className="sr-only">Find in document</span><input autoFocus className="w-40 border-0 p-0 text-sm outline-none" placeholder="Find in document" /></label>}
          <button type="button" onClick={() => setFindOpen((open) => !open)} className="hidden min-h-11 items-center gap-2 border px-3 text-sm font-bold text-brand-navy sm:inline-flex"><Search size={16} aria-hidden /> Find</button>
          <button ref={closeRef} type="button" onClick={onClose} className="inline-flex min-h-11 items-center gap-2 px-3 text-sm font-bold text-brand-navy hover:bg-blue-50"><X size={18} aria-hidden /> Close viewer</button>
        </div>

        <div className="grid min-h-0 flex-1 md:grid-cols-[17rem_minmax(0,1fr)]">
          <aside className="hidden overflow-y-auto border-r bg-white p-5 md:block">
            <p className="label-caps">Illustrative source</p>
            <h3 className="mt-2 font-bold leading-snug text-brand-navy">{document.title}</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">{document.agency} · {document.year}</p>
            <div className="mt-5 border-t pt-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Pages with citations</p>
              <div className="mt-2 space-y-1">
                {pages.map((value) => (
                  <button key={value} type="button" onClick={() => setPage(value)} aria-pressed={page === value} className={`flex min-h-11 w-full items-center justify-between px-3 text-left text-sm ${page === value ? "bg-blue-50 font-bold text-brand-dukeblue" : "text-slate-600 hover:bg-slate-50"}`}><span>Page {value}</span>{document.findings.some((finding) => finding.page === value) && <span className="text-[10px] uppercase">Citation</span>}</button>
                ))}
              </div>
            </div>
            <p className="mt-6 border-t pt-4 text-xs leading-relaxed text-slate-500">Dummy document content for interaction testing. It is not an official policy source.</p>
          </aside>

          <div className="relative overflow-auto p-3 sm:p-7">
            <div className="mb-3 flex items-center gap-2 md:hidden"><label className="text-xs font-bold text-brand-navy" htmlFor="mobile-source-page">Page</label><select id="mobile-source-page" value={page} onChange={(event) => setPage(Number(event.target.value))} className="bg-white px-3 py-2 text-sm">{pages.map((value) => <option key={value} value={value}>{value}</option>)}</select></div>
            <article
              aria-label={`Illustrative document page ${page}`}
              className="relative mx-auto min-h-[52rem] max-w-3xl bg-white px-6 py-12 text-[15px] leading-7 text-slate-800 shadow-lg sm:px-14 sm:py-16"
              style={{ width: `${zoom}%`, transformOrigin: "top center" }}
            >
              <p className="absolute right-7 top-6 text-sm text-slate-500">{page}</p>
              <div className="flex items-center gap-3 border-b-2 border-brand-teal pb-4 text-brand-darkteal"><span className="text-3xl" aria-hidden>{flagFor(document.countryCode)}</span><div><strong className="block">{document.agency}</strong><small>Health AI policy and medical-device guidance</small></div></div>
              <h2 className="mt-10 text-2xl text-slate-900">{citation?.article ? `${citation.article} ` : ""}{citation?.subdomain ?? sectionFor(page)}</h2>
              <p className="mt-5">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. This placeholder page demonstrates how an official policy document will appear beside its coded analysis.</p>
              <p className="mt-5">Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Policy authors may describe scope, responsible institutions, evidence expectations and implementation timelines in this section.</p>
              {citation ? <blockquote className="my-7 border-l-4 border-brand-persimmon bg-[#fff8d8] px-5 py-4 font-serif text-lg leading-8"><mark className="bg-[#ffe681]">{citation.excerpt}</mark><footer className="mt-2 font-sans text-xs font-bold text-slate-600">Highlighted citation · Page {page}{citation.article ? ` · Article ${citation.article}` : ""}</footer></blockquote> : <div className="my-7 border-l-4 border-blue-200 bg-blue-50 px-5 py-4"><strong className="text-brand-navy">Context page</strong><p className="mt-1 text-sm">This adjacent page is included to demonstrate continuous document navigation around a cited passage.</p></div>}
              <h3 className="mt-8 font-serif text-xl text-slate-900">Implementation considerations</h3>
              <p className="mt-3">Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
              <p className="mt-5">The production viewer can replace this text with OCR or verified document content while preserving page numbers, highlights and source references.</p>
              <p className="absolute bottom-8 left-6 right-6 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-red-700 sm:left-14 sm:right-14">Illustrative prototype page · Not an official document</p>
            </article>
            <div className="sticky bottom-4 mx-auto mt-4 flex w-max items-center gap-1 bg-brand-navy p-1.5 text-white shadow-lg" aria-label="Document zoom controls"><button type="button" onClick={() => setZoom((value) => Math.max(80, value - 10))} className="grid h-10 w-10 place-items-center bg-white/10 hover:bg-white/20" aria-label="Zoom out"><ZoomOut size={17} aria-hidden /></button><span className="min-w-14 text-center text-xs font-bold">{zoom}%</span><button type="button" onClick={() => setZoom((value) => Math.min(130, value + 10))} className="grid h-10 w-10 place-items-center bg-white/10 hover:bg-white/20" aria-label="Zoom in"><ZoomIn size={17} aria-hidden /></button></div>
          </div>
        </div>
      </section>
    </div>
  );
}

function sectionFor(page: number) {
  return ["Scope and definitions", "Evidence submission requirements", "Post-market monitoring"][page % 3];
}

function flagFor(code: string) {
  return ({ RWA: "🇷🇼", KEN: "🇰🇪", MEX: "🇲🇽", ZAF: "🇿🇦", COL: "🇨🇴" } as Record<string, string>)[code] ?? "🌐";
}
