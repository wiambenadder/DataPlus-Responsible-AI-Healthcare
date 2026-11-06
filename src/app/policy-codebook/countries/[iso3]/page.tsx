import Link from "next/link";
import { notFound } from "next/navigation";
import CountryWorkspace from "@/_components/policy/CountryWorkspace";
import { getPolicyCountry } from "@/lib/policy/repository";

export default async function CountryPolicyPage({ params }: { params: Promise<{ iso3: string }> }) {
  const { iso3 } = await params;
  const country = await getPolicyCountry(iso3);
  if (!country) notFound();
  return <div className="mx-auto max-w-[96rem] px-4 py-7 sm:px-6 lg:px-8"><Link href="/policy-codebook/map" className="mb-4 inline-flex min-h-11 items-center font-bold text-brand-dukeblue hover:underline">← Back to World Map</Link><CountryWorkspace country={country} /></div>;
}
