import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import InfoLayout, { InfoSection } from "@/_components/info/InfoLayout";
import Photo from "@/components/Photo";
import { SITE } from "@/lib/site";
import { PHOTOS } from "@/lib/photos";
import { DOMAINS } from "@/lib/roadmap/framework";

export const metadata: Metadata = {
  title: "AI Readiness Assessment · Innovator Insights",
  description: "Learn how the AI readiness assessment turns your evidence into an assessment and practical roadmap before you begin.",
};

export default function AIReadinessPage() {
  const practices = DOMAINS.reduce((total, domain) => total + domain.subdomains.length, 0);
  return (
    <InfoLayout
      label="Our tools"
      title="AI Readiness Assessment"
      lede={<>
        <p>Understand where your AI innovation stands, what your evidence supports, and what to strengthen before scaling in real-world health care.</p>
        <Link href="/report/assessment" className="btn btn-primary mt-6">Begin your assessment <ArrowRight size={18} aria-hidden /></Link>
      </>}
      sections={[
        { id: "how-it-works", title: "How It Works" },
        { id: "framework", title: "The Framework" },
        { id: "begin", title: "Begin Your Assessment" },
      ]}
    >
      <figure>
        <div className="relative h-80 overflow-hidden sm:h-96">
          <Photo name="innovators" width={1400} priority />
          <div className="absolute inset-x-0 bottom-0 bg-brand-navy/90 px-6 py-6 text-white sm:px-8">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-200">{SITE.org}</p>
            <p className="mt-2 max-w-xl font-serif text-2xl leading-snug">See how ready your AI tool is for real-world care, with the evidence behind every rating.</p>
          </div>
        </div>
        <figcaption className="mt-2 text-xs text-slate-500">Illustrative photo: <a href={PHOTOS.innovators.page} className="underline">{PHOTOS.innovators.photographer} / Unsplash</a></figcaption>
      </figure>
      <InfoSection id="how-it-works" title="From your evidence to your next steps">
        <ol className="space-y-5">
          {[
            ["Share what you already have", "Use reports, evaluations, or policies that describe your innovation. Answer follow-up questions about practices your documents do not cover."],
            ["Review your assessment", "AI-assisted analysis organizes your evidence against a common framework. Review the ratings and supporting sources, and flag anything that needs correction."],
            ["Plan what comes next", "Use a six-stage roadmap to identify gaps and discuss practical next steps with your team and partners."],
          ].map(([title, text], index) => <li key={title} className="flex gap-4"><span className="flex h-9 w-9 shrink-0 items-center justify-center bg-blue-50 font-bold text-brand-navy" aria-hidden>{index + 1}</span><div><h3 className="font-bold text-brand-navy">{title}</h3><p className="mt-1 text-slate-600">{text}</p></div></li>)}
        </ol>
      </InfoSection>
      <InfoSection id="framework" title="A shared framework for responsible AI">
        <p>The assessment uses Innovations in Healthcare’s framework: {practices} practices across five domains. It helps you consider the evidence behind your innovation throughout its development and use.</p>
        <ul className="grid gap-2 sm:grid-cols-2">{DOMAINS.map((domain) => <li key={domain.id} className="border-l-2 border-brand-teal bg-slate-50 px-4 py-3 text-sm font-semibold text-brand-navy">{domain.name}</li>)}</ul>
        <p>Results support reflection and planning. They are not a certification, regulatory approval, or ranking. AI can make mistakes; review its findings alongside your own expertise.</p>
        <Link href="/framework" className="link-more inline-block">Explore the full framework →</Link>
      </InfoSection>
      <InfoSection id="begin" title="Ready to begin?">
        <p>You can explore this introduction and the full framework without an account. To submit evidence and save your assessment, log in or create an account and connect your organization.</p>
        <p>Prepare organization-level documents you have permission to share. Do not include patient records or personal information.</p>
        <p><Link href="/data-use" className="link-more">Read how your data is used before sharing it →</Link></p>
        <Link href="/report/assessment" className="btn btn-primary">Begin your assessment <ArrowRight size={18} aria-hidden /></Link>
        <p className="text-sm text-slate-600">Already logged in? You’ll go directly to your assessment. Otherwise, you’ll be asked to log in first.</p>
      </InfoSection>
    </InfoLayout>
  );
}
