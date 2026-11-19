import { DOMAINS, STAGES, STAGE_MAPPING } from "@/lib/roadmap/framework";
import { domainStyle } from "@/lib/domain-info";

/**
 * The roadmap as a map: one row per domain and one column per stage, so
 * you can see where each practice sits. It is built from STAGE_MAPPING,
 * so it changes when the mapping does. On smaller screens the table scrolls
 * sideways.
 */
export default function RoadmapMap() {
  return (
    <>
      <p className="text-sm text-slate-600 xl:hidden">Scroll sideways to see all six stages.</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[56rem] table-fixed border-separate border-spacing-1 text-left text-[13.5px]">
          <caption className="sr-only">Where each practice sits, by domain and stage</caption>
          <thead>
            <tr>
              <td className="w-32" />
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
              return (
                <tr key={d.id}>
                  <th
                    scope="row"
                    className="border-l-4 bg-slate-50 px-3 py-2 font-semibold leading-snug"
                    style={{ borderColor: st.accent, color: st.text }}
                  >
                    <span className="block text-xs uppercase tracking-[0.08em]">{d.id}</span>
                    {d.name}
                  </th>
                  {STAGES.map((s) => {
                    const items = STAGE_MAPPING[s.id].filter((p) => p.domainId === d.id);
                    return (
                      <td key={s.id} className="bg-slate-50 p-1 align-top">
                        {items.length > 0 && (
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
                        )}
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
