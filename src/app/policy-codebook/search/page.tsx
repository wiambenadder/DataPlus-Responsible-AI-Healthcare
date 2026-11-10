import PolicySearchClient from "@/_components/policy/PolicySearchClient";
import { listPolicyCountries, listPolicyDocuments } from "@/lib/policy/repository";

export default async function PolicySearchPage() {
  const [countries, documents] = await Promise.all([listPolicyCountries(), listPolicyDocuments()]);
  return <div className="mx-auto max-w-[96rem] px-4 py-8 sm:px-6 lg:px-8"><div className="mb-6"><p className="label-caps">Module C · Advanced Search</p><h1 className="mt-1 text-4xl sm:text-5xl">Policy Instrument Repository</h1><p className="mt-3 max-w-3xl text-slate-600">Search illustrative policy instruments and inspect their sample codebook findings.</p></div><PolicySearchClient countries={countries} initialDocuments={documents} /></div>;
}
