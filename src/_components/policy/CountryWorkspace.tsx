"use client";

import { useMemo, useState } from "react";
import { FileSearch, FileText, Search } from "lucide-react";
import type {
  AssessmentItem,
  PolicyCategory,
  PolicyCountryDetails,
  PolicyDocument,
} from "@/lib/policy/types";
import PolicyDocumentDrawer from "./PolicyDocumentDrawer";
import { DocumentBadges, PolicyBadge } from "./PolicyBadge";

const categories: { value: PolicyCategory; label: string }[] = [
  { value: "governance", label: "Governance & Oversight" },
  { value: "software", label: "Medical Software / SaMD" },
  { value: "privacy", label: "Clinical Data & Privacy" },
  { value: "validation", label: "Validation & Bias" },
  { value: "cybersecurity", label: "Liability & Cybersecurity" },
];

export default function CountryWorkspace({ country }: { country: PolicyCountryDetails }) {
  const [section, setSection] = useState<"summary" | "repository">("summary");
  const [level, setLevel] = useState<"ai" | "baseline">("ai");
  const [category, setCategory] = useState<PolicyCategory>("governance");
  const [query, setQuery] = useState("");
  const [selectedDocument, setSelectedDocument] = useState<PolicyDocument | null>(null);

  const documents = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return country.documents.filter(
      (document) =>
        document.categories.includes(category) &&
        (!normalized ||
          `${document.title} ${document.localTitle} ${document.agency}`
            .toLowerCase()
            .includes(normalized)),
    );
  }, [category, country.documents, query]);

  return (
    <>
      <div className="border bg-white">
        <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <div className="flex flex-wrap items-center gap-3"><span className="text-5xl" aria-hidden>🇷🇼</span><div><div className="flex items-center gap-3"><h1 className="text-4xl uppercase">{country.name}</h1><PolicyBadge>ISO: {country.iso3}</PolicyBadge></div><p className="text-sm text-slate-600">Last updated: {country.updatedAt}</p></div></div>
            <div className="mt-5 flex flex-wrap gap-2">{country.agencies.map((agency) => <span key={agency} className="border px-3 py-1.5 text-xs font-bold text-brand-navy">{agency}</span>)}</div>
          </div>
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            {[['Population', country.population], ['Income level', country.incomeLevel], ['Health spending', country.healthSpending], ['Internet', country.internetConnectivity]].map(([label, value]) => (
              <div key={label} className="border p-3"><dt className="text-xs font-bold text-slate-500">{label}</dt><dd className="mt-1 font-serif text-xl font-semibold text-brand-navy">{value}</dd></div>
            ))}
          </dl>
        </div>

        <div role="tablist" aria-label="Country policy sections" className="flex overflow-x-auto border-t px-4">
          <Tab selected={section === "summary"} onClick={() => setSection("summary")}><FileText size={18} aria-hidden /> Section 1: Summary Assessment</Tab>
          <Tab selected={section === "repository"} onClick={() => setSection("repository")}><FileSearch size={18} aria-hidden /> Section 2: Document Repository <span className="bg-blue-50 px-2 py-0.5 text-xs">{country.documents.length} samples</span></Tab>
        </div>
      </div>

      {section === "summary" ? (
        <section className="mt-5" aria-labelledby="assessment-heading">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Assessment level">
            <Tab selected={level === "ai"} onClick={() => setLevel("ai")}>Level 1: AI in Health</Tab>
            <Tab selected={level === "baseline"} onClick={() => setLevel("baseline")}>Level 2: Baseline Health Tech</Tab>
          </div>
          <h2 id="assessment-heading" className="sr-only">{level === "ai" ? "AI in health" : "Baseline health technology"} assessment</h2>
          <div className="mt-4 space-y-3">
            {country.assessments[level].map((item, index) => (
              <AssessmentRow key={item.id} item={item} index={index} documents={country.documents} onOpen={setSelectedDocument} />
            ))}
          </div>
        </section>
      ) : (
        <section className="mt-5" aria-labelledby="repository-heading">
          <h2 id="repository-heading" className="sr-only">Policy document repository</h2>
          <label className="flex items-center gap-3 border bg-white px-4 py-3"><Search size={20} aria-hidden className="text-brand-dukeblue" /><span className="sr-only">Search documents</span><input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full border-0 p-0 outline-none" placeholder="Search documents by title, type or keyword…" /></label>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-2">{categories.map((item) => <button key={item.value} type="button" onClick={() => setCategory(item.value)} aria-pressed={category === item.value} className={`min-h-11 shrink-0 border px-4 text-sm font-bold ${category === item.value ? "bg-brand-navy text-white" : "bg-white text-brand-navy hover:bg-blue-50"}`}>{item.label}</button>)}</div>
          <div className="mt-3 space-y-3">{documents.length ? documents.map((document) => <DocumentRow key={document.id} document={document} onOpen={setSelectedDocument} />) : <p className="border bg-white p-8 text-center text-slate-600">No sample documents match these filters.</p>}</div>
        </section>
      )}

      <PolicyDocumentDrawer document={selectedDocument} onClose={() => setSelectedDocument(null)} />
    </>
  );
}

function Tab({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" role="tab" aria-selected={selected} onClick={onClick} className={`inline-flex min-h-14 items-center gap-2 border-b-4 px-5 text-sm font-bold ${selected ? "border-brand-dukeblue text-brand-navy" : "border-transparent text-slate-500 hover:text-brand-navy"}`}>{children}</button>;
}

function AssessmentRow({ item, index, documents, onOpen }: { item: AssessmentItem; index: number; documents: PolicyDocument[]; onOpen: (document: PolicyDocument) => void }) {
  const source = documents.find((document) => document.id === item.sourceDocumentId);
  const tones = { binding: "green", draft: "yellow", none: "gray", extension: "purple" } as const;
  return <article className="grid gap-4 border bg-white p-4 sm:grid-cols-[3rem_minmax(13rem,1fr)_2fr_auto] sm:items-center"><span className="grid h-10 w-10 place-items-center rounded-full bg-blue-50 font-bold text-brand-navy">{index + 1}</span><div><h3 className="font-bold text-brand-navy">{item.title}</h3><div className="mt-2"><PolicyBadge tone={tones[item.statusTone]}>{item.status}</PolicyBadge></div></div><dl className="grid gap-2 text-sm">{item.details.map((detail) => <div key={detail.label} className="grid gap-1 sm:grid-cols-[9rem_1fr]"><dt className="font-bold text-slate-500">{detail.label}</dt><dd>{detail.text}</dd></div>)}</dl>{source && <button type="button" onClick={() => onOpen(source)} className="btn btn-secondary whitespace-nowrap px-3 py-2 text-sm">View source</button>}</article>;
}

function DocumentRow({ document, onOpen }: { document: PolicyDocument; onOpen: (document: PolicyDocument) => void }) {
  return <article className="grid gap-4 border bg-white p-4 md:grid-cols-[8rem_minmax(16rem,1.25fr)_1fr_auto] md:items-center"><div><strong className="text-sm text-brand-navy">{document.year}</strong><p className="text-xs text-slate-500">Publication year</p></div><div><h3 className="font-bold text-brand-navy">{document.title}</h3><p className="text-sm text-brand-dukeblue">{document.localTitle}</p><p className="mt-2 text-xs text-slate-600">{document.agency}</p></div><div><DocumentBadges document={document} /><p className="mt-2 text-xs leading-relaxed text-slate-600">{document.summary}</p></div><button type="button" onClick={() => onOpen(document)} className="btn btn-primary whitespace-nowrap px-4 py-2 text-sm">Open analysis</button></article>;
}
