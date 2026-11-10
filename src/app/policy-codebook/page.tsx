import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, FileSearch, Layers3 } from "lucide-react";

const steps = [
  { number: 1, title: "Document collection", text: "Official legislative texts, decrees, regulations and policy documents." },
  { number: 2, title: "Policy classification", text: "Each document is tagged by format, implementation stage and policy type." },
  { number: 3, title: "Codebook analysis", text: "Content is assessed using a four-level depth rubric and exact source references." },
  { number: 4, title: "Structured output", text: "Findings become searchable country assessments and document records." },
];

export default function PolicyCodebookPage() {
  return (
    <div className="mx-auto max-w-[96rem] px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="border bg-white p-5">
          <div className="flex items-start gap-3"><BookOpen className="mt-1 text-brand-dukeblue" aria-hidden /><div><h2 className="text-xl">Documentation Index</h2><p className="mt-1 text-xs leading-relaxed text-slate-600">Navigate the methodology and prototype scope.</p></div></div>
          <ol className="mt-5 space-y-1 text-sm">{["Project mission & audience", "Dual-layer analytical framework", "Four-level depth rubric", "Governance & partners", "Educational scope", "Version history & downloads"].map((label, index) => <li key={label} className={`${index === 0 ? "bg-blue-50 text-brand-navy" : "text-slate-600"} flex items-center gap-3 px-3 py-3`}><span className="grid h-7 w-7 place-items-center rounded-full bg-white font-bold text-brand-dukeblue">{index + 1}</span>{label}</li>)}</ol>
          <div className="mt-7 border-t-4 border-t-brand-dukeblue bg-blue-50 p-4"><p className="font-bold text-brand-navy">Building safer, more equitable AI health systems.</p><p className="mt-2 text-xs leading-relaxed text-slate-600">This first native version uses illustrative fixture data while the verified policy database is developed.</p></div>
        </aside>

        <div>
          <div className="border-b pb-6"><p className="label-caps">Module A · About the Tool</p><div className="mt-2 flex flex-wrap items-center gap-3"><h1 className="text-4xl sm:text-5xl">Methodology &amp; Framework</h1><span className="tag bg-blue-50 text-brand-dukeblue">Academic &amp; institutional</span></div><p className="mt-4 max-w-5xl text-slate-600">The proposed workflow combines systematic document screening, structured codebook analysis and a four-level depth rubric to evaluate AI health policy across countries and regulatory domains.</p></div>
          <section className="mt-6 grid border bg-white md:grid-cols-2 xl:grid-cols-4" aria-label="Policy analysis process">{steps.map((step) => <article key={step.number} className="border-b p-5 last:border-b-0 md:border-r md:last:border-r-0 xl:border-b-0"><span className="grid h-9 w-9 place-items-center rounded-full bg-brand-navy font-bold text-white">{step.number}</span><h2 className="mt-4 text-xl">{step.title}</h2><p className="mt-2 text-sm leading-relaxed text-slate-600">{step.text}</p></article>)}</section>
          <div className="mt-5 flex gap-3 border bg-blue-50 p-5"><CheckCircle2 className="shrink-0 text-brand-dukeblue" aria-hidden /><div><h2 className="text-lg">Evidence and traceability</h2><p className="mt-1 text-sm text-slate-600">Production findings will retain official URLs and exact page or article references. All current records are explicitly illustrative.</p></div></div>
          <section className="mt-8" aria-labelledby="start-heading"><div className="section-head"><div><p className="label-caps">Start exploring</p><h2 id="start-heading" className="mt-1 text-3xl">Choose a policy view</h2></div></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><Link href="/policy-codebook/map" className="group flex items-center gap-4 border-t-4 border-t-brand-dukeblue bg-white p-5 hover:bg-blue-50"><Layers3 className="text-brand-dukeblue" aria-hidden /><span><strong className="block text-brand-navy">Explore country policy landscapes</strong><small className="text-slate-600">Start with the world map, then open Rwanda&apos;s assessment.</small></span><ArrowRight className="ml-auto text-brand-dukeblue transition-transform group-hover:translate-x-1" aria-hidden /></Link><Link href="/policy-codebook/search" className="group flex items-center gap-4 border-t-4 border-t-brand-ironweed bg-white p-5 hover:bg-blue-50"><FileSearch className="text-brand-ironweed" aria-hidden /><span><strong className="block text-brand-navy">Search the policy repository</strong><small className="text-slate-600">Filter sample instruments and open codebook analysis.</small></span><ArrowRight className="ml-auto text-brand-dukeblue transition-transform group-hover:translate-x-1" aria-hidden /></Link></div></section>
        </div>
      </div>
    </div>
  );
}
