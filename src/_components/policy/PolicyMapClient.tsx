"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Globe2, MapPin } from "lucide-react";
import type { PolicyCountry } from "@/lib/policy/types";

const positions: Record<string, string> = {
  MEX: "left-[18%] top-[47%]",
  KEN: "left-[59%] top-[55%]",
  RWA: "left-[57%] top-[60%]",
};

export default function PolicyMapClient({ countries }: { countries: PolicyCountry[] }) {
  const [selected, setSelected] = useState("RWA");
  const country = countries.find((item) => item.iso3 === selected) ?? countries[0];

  return (
    <div className="grid gap-5 lg:grid-cols-[17rem_minmax(0,1fr)]">
      <aside className="border bg-white p-5">
        <h2 className="text-xl">Map view</h2>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button type="button" className="btn btn-primary px-3 py-2 text-sm"><Globe2 size={16} aria-hidden /> Global</button>
          <button type="button" className="btn btn-secondary px-3 py-2 text-sm"><MapPin size={16} aria-hidden /> Region</button>
        </div>
        <div className="mt-6 border-t pt-5">
          <h3 className="font-bold text-brand-navy">Country status</h3>
          <p className="mt-3 flex items-center justify-between text-sm"><span><i className="mr-2 inline-block h-3 w-3 rounded-full bg-cyan-500" />Tracked sample</span><strong>3</strong></p>
          <p className="mt-2 flex items-center justify-between text-sm"><span><i className="mr-2 inline-block h-3 w-3 rounded-full bg-slate-300" />Not tracked</span><strong>192</strong></p>
        </div>
        <div className="mt-6 border-t pt-5">
          <h3 className="font-bold text-brand-navy">Governance status</h3>
          <p className="mt-3 text-sm"><i className="mr-2 inline-block h-3 w-3 rounded-full bg-emerald-500" />Established</p>
          <p className="mt-2 text-sm"><i className="mr-2 inline-block h-3 w-3 rounded-full bg-amber-400" />Proposed</p>
          <p className="mt-2 text-sm"><i className="mr-2 inline-block h-3 w-3 rounded-full bg-red-500" />Not established</p>
        </div>
        <p className="mt-6 bg-blue-50 p-3 text-xs leading-relaxed text-slate-600">Sample coverage only. Country counts and governance classifications are illustrative.</p>
      </aside>

      <div className="relative min-h-[32rem] overflow-hidden border bg-[#f4f8fb]">
        <Image
          src="/policy-dashboard-demo/assets/world-map.svg"
          alt=""
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 80vw"
          className="object-contain p-4 opacity-90"
        />
        {countries.map((item) => (
          <button
            key={item.iso3}
            type="button"
            onClick={() => setSelected(item.iso3)}
            aria-pressed={selected === item.iso3}
            className={`absolute ${positions[item.iso3]} z-10 flex min-h-10 -translate-x-1/2 -translate-y-1/2 items-center gap-1 text-xs font-bold text-brand-navy`}
          >
            <span className={`h-4 w-4 rounded-full border-2 border-white shadow ${selected === item.iso3 ? "bg-brand-navy ring-4 ring-blue-200" : "bg-cyan-500"}`} />
            <span className="bg-white/90 px-1.5 py-0.5 shadow-sm">{item.name}</span>
          </button>
        ))}

        <article className="absolute bottom-5 left-5 right-5 z-20 max-w-sm border-t-4 border-t-brand-dukeblue bg-white p-5 shadow-lg sm:left-auto sm:right-6 sm:w-80">
          <p className="label-caps">{country.iso3} · {country.documentCount} sample documents</p>
          <h2 className="mt-1 text-2xl">{country.name}</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{country.governanceSummary}</p>
          {country.iso3 === "RWA" || country.iso3 === "MEX" ? (
            <Link href={`/policy-codebook/countries/${country.iso3.toLowerCase()}`} className="mt-4 inline-flex items-center gap-2 font-bold text-brand-dukeblue hover:underline">
              Open country workspace <ArrowRight size={16} aria-hidden />
            </Link>
          ) : (
            <p className="mt-4 text-xs font-bold text-slate-500">Detailed workspace coming next</p>
          )}
        </article>
      </div>
    </div>
  );
}
