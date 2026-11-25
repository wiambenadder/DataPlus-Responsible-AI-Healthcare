"use client";

import { useState } from "react";
import Image from "next/image";
import { DOMAINS, STAGES, STAGE_MAPPING, type DomainId } from "@/lib/roadmap/framework";
import { domainStyle } from "@/lib/domain-info";

const DIAGRAM_SRC = "/images/ai-implementation-framework.png";

type View = "table" | "diagram";

/**
 * The roadmap map on the Framework page, with two views to choose between:
 *  - Table: one row per domain, collapsed to a square per practice in each
 *    stage; open a domain (or all) to see the practice names. Built from
 *    STAGE_MAPPING, so it changes when the mapping does.
 *  - Diagram: the team's "AI Implementation Framework" slide as an image
 *    (public/images/ai-implementation-framework.png). Replace the file if
 *    the mapping changes, since the image does not update by itself.
 * Both are shown while the team decides which one to keep.
 */
export default function RoadmapMap() {
  const [view, setView] = useState<View>("table");

  return (
    <div>
      <div role="tablist" aria-label="Roadmap map view" className="flex gap-1 border-b border-slate-200">
        {(
          [
            ["table", "Table"],
            ["diagram", "Diagram"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`roadmap-tab-${id}`}
            aria-selected={view === id}
            aria-controls={`roadmap-panel-${id}`}
            onClick={() => setView(id)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold ${
              view === id
                ? "border-brand-navy text-brand-navy"
                : "border-transparent text-slate-600 hover:text-brand-navy"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`roadmap-panel-${view}`}
        aria-labelledby={`roadmap-tab-${view}`}
        className="mt-4 space-y-3"
      >
        {view === "table" ? <MapTable /> : <MapDiagram />}
      </div>
    </div>
  );
}

function MapDiagram() {
  return (
    <figure>
      <a href={DIAGRAM_SRC} target="_blank" rel="noopener" className="block border border-slate-200">
        <Image
          src={DIAGRAM_SRC}
          alt="AI Implementation Framework: the practices of the five domains placed across the six roadmap stages."
          width={1938}
          height={1106}
          sizes="(min-width: 1280px) 900px, 100vw"
          className="h-auto w-full"
        />
      </a>
      <figcaption className="mt-2 text-sm text-slate-600">
        Click the diagram to open it full size. The Table view lists the same practices.
      </figcaption>
    </figure>
  );
}

function MapTable() {
  const [open, setOpen] = useState<Set<DomainId>>(new Set());
  const allOpen = open.size === DOMAINS.length;

  function toggle(id: DomainId) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-600">
          Each square is one practice. Open a domain to see its practices.
          <span className="xl:hidden"> Scroll sideways to see all six stages.</span>
        </p>
        <button
          type="button"
          onClick={() => setOpen(allOpen ? new Set() : new Set(DOMAINS.map((d) => d.id)))}
          className="text-sm font-semibold text-brand-dukeblue hover:underline"
        >
          {allOpen ? "Close all domains" : "Open all domains"}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[52rem] table-fixed border-separate border-spacing-1 text-left text-[13.5px]">
          <caption className="sr-only">Where each practice sits, by domain and stage</caption>
          <thead>
            <tr>
              <td className="w-40" />
              {STAGES.map((s) => (
                <th key={s.id} scope="col" className="bg-brand-navy px-2 py-2 text-center font-semibold leading-snug text-white">
                  <span className="block text-base">{s.id}</span>
                  {s.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DOMAINS.map((d) => {
              const st = domainStyle(d.name);
              const isOpen = open.has(d.id);
              return (
                <tr key={d.id}>
                  <th scope="row" className="p-0 align-top">
                    <button
                      type="button"
                      onClick={() => toggle(d.id)}
                      aria-expanded={isOpen}
                      className="flex h-full w-full items-start justify-between gap-2 border-l-4 bg-slate-50 px-3 py-2 text-left font-semibold leading-snug hover:bg-slate-100"
                      style={{ borderColor: st.accent, color: st.text }}
                    >
                      <span>
                        <span className="block text-xs uppercase tracking-[0.08em]">{d.id}</span>
                        {d.name}
                      </span>
                      <span aria-hidden className={`mt-0.5 shrink-0 text-xs transition-transform ${isOpen ? "rotate-90" : ""}`}>
                        ▶
                      </span>
                    </button>
                  </th>
                  {STAGES.map((s) => {
                    const items = STAGE_MAPPING[s.id].filter((p) => p.domainId === d.id);
                    return (
                      <td key={s.id} className="bg-slate-50 p-1 align-top">
                        {items.length > 0 &&
                          (isOpen ? (
                            <ul className="space-y-1">
                              {items.map((p) => (
                                <li
                                  key={p.subdomain}
                                  className="border-l-2 bg-white px-2 py-1.5 leading-snug text-slate-800"
                                  style={{ borderColor: st.accent }}
                                >
                                  {p.subdomain}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <button
                              type="button"
                              onClick={() => toggle(d.id)}
                              title={items.map((p) => p.subdomain).join(", ")}
                              aria-label={`${d.name}, stage ${s.id}: ${items.map((p) => p.subdomain).join(", ")}`}
                              className="flex w-full flex-col items-start gap-1 px-1.5 py-1.5 text-left text-slate-700 hover:bg-white"
                            >
                              <span className="flex gap-0.5" aria-hidden>
                                {items.map((p) => (
                                  <span key={p.subdomain} className="h-2.5 w-2.5" style={{ background: st.accent }} />
                                ))}
                              </span>
                              <span className="text-xs" aria-hidden>
                                {items.length} {items.length === 1 ? "practice" : "practices"}
                              </span>
                            </button>
                          ))}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
