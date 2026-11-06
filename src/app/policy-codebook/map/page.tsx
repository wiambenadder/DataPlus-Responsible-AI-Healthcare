import PolicyMapClient from "@/_components/policy/PolicyMapClient";
import { listPolicyCountries } from "@/lib/policy/repository";

export default async function PolicyMapPage() {
  const countries = await listPolicyCountries();
  return <div className="mx-auto max-w-[96rem] px-4 py-8 sm:px-6 lg:px-8"><div className="mb-6 flex flex-wrap items-end justify-between gap-5"><div><p className="label-caps">Module B · Interactive Map</p><h1 className="mt-1 text-4xl sm:text-5xl">Global Health AI Policy Landscape</h1><p className="mt-3 max-w-3xl text-slate-600">Explore sample AI governance, regulation and policy information by country.</p></div><dl className="grid grid-cols-3 gap-2"><div className="border bg-white px-4 py-3"><dt className="text-xs text-slate-500">Countries</dt><dd className="font-serif text-2xl font-bold text-brand-navy">195</dd></div><div className="border bg-white px-4 py-3"><dt className="text-xs text-slate-500">Tracked samples</dt><dd className="font-serif text-2xl font-bold text-brand-navy">3</dd></div><div className="border bg-white px-4 py-3"><dt className="text-xs text-slate-500">Documents</dt><dd className="font-serif text-2xl font-bold text-brand-navy">8</dd></div></dl></div><PolicyMapClient countries={countries} /></div>;
}
