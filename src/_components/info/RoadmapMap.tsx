"use client";

import { useState } from "react";
import Image from "next/image";
import { DOMAINS, STAGES, STAGE_MAPPING, type DomainId } from "@/lib/roadmap/framework";
import { domainStyle } from "@/lib/domain-info";

const DIAGRAM = "/images/ai-implementation-framework.png";

/**
 * Shows where each practice sits, in two ways, so the team can pick one.
 * Delete the option that isn't chosen. The table updates itself from
 * STAGE_MAPPING; the image doesn't, so replace it if the stages change.
 */
export default function RoadmapMap() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="label-caps">Option A: Table</p>
        <MapTable />
      </div>
      <div className="space-y-3">
        <p className="label-caps">Option B: Diagram</p>
        <MapDiagram />
      </div>
    </div>
  );
}

function MapDiagram() {
  return (
    <figure>
      <a href={DIAGRAM} target="_blank" rel="noopener" className="block border border-slate-200">
        <Image
          src={DIAGRAM}
          alt="AI Implementation Framework: the practices of the five domains placed across the six roadmap stages."
          width={1938}
          height={1106}
          sizes="(min-width: 1280px) 900px, 100vw"
          className="h-auto w-full"
        />
      </a>
      <figcaption className="mt-2 text-sm text-slate-600">Click the diagram to open it full size.</figcaption>
    </figure>
  );
}

function MapTable() {
  const [open, setOpen] = useState<Set<DomainId>>(new Set());
  const allOpen = open.size === DOMAINS.length;

  function toggle(id: DomainId) {
    const next = new Set(open);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setOpen(next);
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
                  <th scope="row" className="border-l-4 bg-slate-50 p-0 align-top" style={{ borderColor: st.accent }}>
                    <button
                      type="button"
                      onClick={() => toggle(d.id)}
                      aria-expanded={isOpen}
                      className="flex w-full items-start justify-between gap-2 px-3 py-2 text-left font-semibold leading-snug hover:bg-slate-100"
                      style={{ color: st.text }}
                    >
                      <span>
                        <span className="block text-xs uppercase tracking-[0.08em]">{d.id}</span>
                        {d.name}
                      </span>
                      <span aria-hidden className={`mt-0.5 text-xs transition-transform ${isOpen ? "rotate-90" : ""}`}>
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
                            // Closed: one square per practice. Hover shows the names.
                            <button
                              type="button"
                              onClick={() => toggle(d.id)}
                              title={items.map((p) => p.subdomain).join(", ")}
                              className="flex w-full flex-col items-start gap-1 px-1.5 py-1.5 text-left text-slate-700 hover:bg-white"
                            >
                              <span className="flex gap-0.5" aria-hidden>
                                {items.map((p) => (
                                  <span key={p.subdomain} className="h-2.5 w-2.5" style={{ background: st.accent }} />
                                ))}
                              </span>
                              <span className="text-xs">
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
