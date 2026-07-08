"use client";

import CompanyHeader from "./CompanyHeader";
import HowItWorks from "./HowItWorks";
import FrameworkOverview, { type DomainProgress } from "./FrameworkOverview";
import HistorySection, { type HistoryItem } from "./HistorySection";
import NextSteps from "./NextSteps";

/**
 * The signed-in homepage. Section order tells a story:
 *   1. Who you are (company profile info)
 *   2. How the platform works (each step links to its page)
 *   3. The framework you're being assessed against (with live progress)
 *   4. Your history (reports submitted + documents uploaded)
 *   5. Where to go next (CTA launchpad into the rest of the app)
 *
 * Note: the navbar is rendered by layout.tsx, so it is intentionally
 * NOT rendered here — that was causing the duplicated navigation bar.
 */
export default function HomeView({
  company,
  reportCount,
  history,
  domainProgress,
}: {
  company: any;
  reportCount: number;
  history: HistoryItem[];
  domainProgress: DomainProgress[];
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <CompanyHeader company={company} />
        <HowItWorks />
        <FrameworkOverview domainProgress={domainProgress} />
        <HistorySection history={history} />
        <NextSteps hasReports={reportCount > 0} />
      </main>
    </div>
  );
}
