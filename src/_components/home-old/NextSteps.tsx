import Link from "next/link";
import {
  ArrowRight,
  FilePlus2,
  History,
  LayoutDashboard,
  Map,
} from "lucide-react";

/**
 * The launchpad: after the homepage has explained the platform, these
 * cards route users to the pages where the work happens. Order adapts
 * slightly to whether the user has any reports yet.
 *
 * The old "Upload documents" card was replaced by a "View your
 * history" card that jumps to the history timeline on this page.
 */
export default function NextSteps({ hasReports }: { hasReports: boolean }) {
  const actions = [
    {
      href: "/report",
      Icon: FilePlus2,
      title: hasReports ? "Continue reporting" : "Start your first report",
      body: hasReports
        ? "Add a new reporting period or finish answering open assessment questions."
        : "Answer the assessment questions — this is what powers everything else.",
      primary: !hasReports,
    },
    {
      href: "#history",
      Icon: History,
      title: "View your history",
      body: "Check everything that has been uploaded and done — past reports and documents.",
      primary: false,
    },
    {
      href: "/dashboard",
      Icon: LayoutDashboard,
      title: "Review your dashboard",
      body: "Inspect every domain and subdomain rating, with the AI's reasoning behind each one.",
      primary: false,
    },
    {
      href: "/roadmap",
      Icon: Map,
      title: "Explore your roadmap",
      body: "See your progress across the six stages of responsible AI adoption.",
      primary: hasReports,
    },
  ];

  return (
    <section aria-labelledby="next-steps">
      <div className="mb-4">
        <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
          Next steps
        </p>
        <h2
          id="next-steps"
          className="mt-1 text-2xl font-bold tracking-tight text-slate-900"
        >
          Where to go from here
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {actions.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className={`group flex flex-col rounded-2xl border p-6 transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              a.primary
                ? "border-blue-500 bg-blue-600 text-white"
                : "border-slate-200 bg-white"
            }`}
          >
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                a.primary ? "bg-white/15 text-white" : "bg-blue-50 text-blue-600"
              }`}
              aria-hidden
            >
              <a.Icon className="h-5 w-5" />
            </span>
            <h3
              className={`mt-4 text-base font-semibold ${
                a.primary ? "text-white" : "text-slate-900"
              }`}
            >
              {a.title}
            </h3>
            <p
              className={`mt-1.5 flex-1 text-sm leading-relaxed ${
                a.primary ? "text-blue-100" : "text-slate-500"
              }`}
            >
              {a.body}
            </p>
            <span
              className={`mt-4 inline-flex items-center gap-1.5 text-sm font-semibold ${
                a.primary ? "text-white" : "text-blue-600"
              }`}
            >
              Open
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
