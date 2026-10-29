import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import InfoLayout, { InfoSection } from "@/_components/info/InfoLayout";
import { DOMAINS } from "@/lib/roadmap/framework";

export const metadata: Metadata = {
  title: "AI Readiness Assessment · Innovator Insights",
  description: "Learn how the AI readiness assessment turns your evidence into an assessment and practical roadmap before you begin.",
};

/** Public introduction to the assessment; "Begin" opens /report/assessment. */
export default function AIReadinessPage() {
  const practices = DOMAINS.reduce((total, domain) => total + domain.subdomains.length, 0);
  return (
    <InfoLayout
      label="Our tools"
      title="AI Readiness Assessment"
      lede={<>
        <p>Understand where your AI innovation stands, what your evidence supports, and what to strengthen before scaling in real-world health care.</p>
        <Link href="/report/assessment" className="btn btn-primary mt-6">Begin Your Assessment <ArrowRight size={18} aria-hidden /></Link>
      </>}
      sections={[
        { id: "how-it-works", title: "How It Works" },
        { id: "framework", title: "The Framework" },
        { id: "begin", title: "Before You Begin" },
      ]}
    >
      <InfoSection id="how-it-works" title="How It Works">
        <ol className="space-y-5">
          {[
            ["Share what you already have", "Use reports, evaluations, or policies that describe your innovation. Answer follow-up questions about practices your documents do not cover."],
            ["Review your assessment", "AI-assisted analysis organizes your evidence against a common framework. Review the ratings and supporting sources, and flag anything that needs correction."],
            ["Plan what comes next", "Use a six-stage roadmap to identify gaps and discuss practical next steps with your team and partners."],
          ].map(([title, text], index) => <li key={title} className="flex gap-4"><span className="flex h-9 w-9 shrink-0 items-center justify-center bg-blue-50 font-bold text-brand-navy" aria-hidden>{index + 1}</span><div><h3 className="font-bold text-brand-navy">{title}</h3><p className="mt-1 text-slate-600">{text}</p></div></li>)}
        </ol>
      </InfoSection>
      <InfoSection id="framework" title="The Framework">
        <p>The assessment uses Innovations in Healthcare’s framework: {practices} practices across five domains. It helps you consider the evidence behind your innovation throughout its development and use.</p>
        <ul className="grid gap-2 sm:grid-cols-2">{DOMAINS.map((domain) => <li key={domain.id} className="border-l-2 border-brand-teal bg-slate-50 px-4 py-3 text-sm font-semibold text-brand-navy">{domain.name}</li>)}</ul>
        <Link href="/framework" className="link-more inline-block">Explore the full framework →</Link>
      </InfoSection>
      <InfoSection id="begin" title="Before You Begin">
        <p>You can read this page and the framework without an account. To submit evidence, log in or create an account. Share only organization-level documents you have permission to use, with no patient records or personal information.</p>
        <p><Link href="/data-use" className="link-more">How we handle your data →</Link></p>
        <Link href="/report/assessment" className="btn btn-primary">Begin Your Assessment <ArrowRight size={18} aria-hidden /></Link>
      </InfoSection>
    </InfoLayout>
  );
}
