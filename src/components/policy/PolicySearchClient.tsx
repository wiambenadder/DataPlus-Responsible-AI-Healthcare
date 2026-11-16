"use client";

import { useEffect, useState } from "react";
import { Filter, Search } from "lucide-react";
import type { PolicyCountry, PolicyDocument } from "@/lib/policy/types";
import PolicyDocumentDrawer from "./PolicyDocumentDrawer";
import { DocumentBadges } from "./PolicyBadge";

type ResponseBody = { documents: PolicyDocument[]; count: number };

export default function PolicySearchClient({ countries, initialDocuments }: { countries: PolicyCountry[]; initialDocuments: PolicyDocument[] }) {
  const [query, setQuery] = useState("");
  const [selectedCountries, setSelectedCountries] = useState<string[]>(countries.map((country) => country.iso3));
  const [documents, setDocuments] = useState(initialDocuments);
  const [loading, setLoading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<PolicyDocument | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      selectedCountries.forEach((country) => params.append("country", country));
      setLoading(true);
      try {
        const response = await fetch(`/api/policy/documents?${params.toString()}`, { signal: controller.signal });
        if (!response.ok) throw new Error("Search request failed");
        const body = (await response.json()) as ResponseBody;
        setDocuments(body.documents);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) console.error(error);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 180);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [query, selectedCountries]);

  function toggleCountry(code: string) {
    setSelectedCountries((current) => current.includes(code) ? current.filter((item) => item !== code) : [...current, code]);
  }

  function clearFilters() { setQuery(""); setSelectedCountries([]); }

  return (
    <>
      <div className="grid gap-5 lg:grid-cols-[19rem_minmax(0,1fr)]">
        <aside className="self-start border bg-white p-5 lg:sticky lg:top-28">
          <div className="flex items-center justify-between gap-3"><h2 className="flex items-center gap-2 text-xl"><Filter size={19} aria-hidden /> Filters</h2><button type="button" onClick={clearFilters} className="text-xs font-bold text-brand-dukeblue hover:underline">Clear</button></div>
          <fieldset className="mt-5 border-t pt-5"><legend className="font-bold text-brand-navy">Country</legend><div className="mt-3 space-y-3">{countries.map((country) => <label key={country.iso3} className="flex cursor-pointer items-center gap-3 text-sm"><input type="checkbox" checked={selectedCountries.includes(country.iso3)} onChange={() => toggleCountry(country.iso3)} className="h-4 w-4 accent-brand-dukeblue" /><span>{country.name} ({country.iso3})</span><strong className="ml-auto text-slate-500">{country.documentCount}</strong></label>)}</div></fieldset>
          <fieldset className="mt-6 border-t pt-5"><legend className="font-bold text-brand-navy">Geographic region</legend><label className="mt-3 flex items-center gap-3 text-sm"><input type="checkbox" defaultChecked className="h-4 w-4 accent-brand-dukeblue" /> Africa</label><label className="mt-3 flex items-center gap-3 text-sm"><input type="checkbox" defaultChecked className="h-4 w-4 accent-brand-dukeblue" /> Latin America &amp; Caribbean</label></fieldset>
          <fieldset className="mt-6 border-t pt-5"><legend className="font-bold text-brand-navy">Policy typology</legend>{["Guideline", "Regulation", "Strategy", "Law"].map((format, index) => <label key={format} className="mt-3 flex items-center gap-3 text-sm"><input type="checkbox" defaultChecked={index < 2} className="h-4 w-4 accent-brand-dukeblue" /> {format}</label>)}</fieldset>
          <p className="mt-6 bg-blue-50 p-3 text-xs leading-relaxed text-slate-600">Country and keyword controls query the new Policy Codebook API. Additional filter groups are visual placeholders for the next data phase.</p>
        </aside>
        <section aria-labelledby="results-heading">
          <label className="flex items-center gap-3 border bg-white px-4 py-3"><Search size={22} aria-hidden className="text-brand-dukeblue" /><span className="sr-only">Search policy instruments</span><input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full border-0 p-0 text-base outline-none" placeholder="Search laws, keywords, technical terms or issuing bodies…" /><span className="shrink-0 text-xs font-bold text-slate-500">{loading ? "Searching…" : `${documents.length} samples`}</span></label>
          <h2 id="results-heading" className="sr-only">Search results</h2>
          <div className="mt-4 space-y-3" aria-live="polite" aria-busy={loading}>
            {documents.length ? documents.map((document) => <article key={document.id} className="grid gap-4 border bg-white p-5 md:grid-cols-[6rem_minmax(0,1fr)_auto] md:items-center"><div className="flex items-center gap-2 md:block"><span className="text-3xl" aria-hidden>{flagFor(document.countryCode)}</span><div><strong className="text-brand-navy">{document.countryCode}</strong><p className="text-xs text-slate-500">{document.country}</p></div></div><div><p className="text-xs text-slate-500">{document.year} · {document.format}</p><h3 className="mt-1 font-bold text-brand-navy">{document.title}</h3><p className="text-sm text-brand-dukeblue">{document.localTitle}</p><p className="mt-2 text-xs text-slate-600">{document.agency}</p><div className="mt-3"><DocumentBadges document={document} /></div></div><button type="button" onClick={() => setSelectedDocument(document)} className="btn btn-primary whitespace-nowrap px-4 py-2 text-sm">Open analysis</button></article>) : <div className="border bg-white p-10 text-center"><h3 className="font-bold text-brand-navy">No sample instruments found</h3><p className="mt-1 text-sm text-slate-600">Clear the filters or try a broader keyword.</p></div>}
          </div>
        </section>
      </div>
      <PolicyDocumentDrawer document={selectedDocument} onClose={() => setSelectedDocument(null)} />
    </>
  );
}

function flagFor(code: string) {
  return ({ RWA: "🇷🇼", KEN: "🇰🇪", MEX: "🇲🇽", ZAF: "🇿🇦", COL: "🇨🇴" } as Record<string, string>)[code] ?? "🌐";
}
