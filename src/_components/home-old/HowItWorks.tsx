import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  FileSearch,
  LayoutDashboard,
  Map,
} from "lucide-react";

const STEPS = [
  {
    Icon: ClipboardList,
    title: "Share your work",
    body: "Answer assessment questions and upload documents — reports, decks, anything that shows how you build and deploy AI.",
    href: "/report",
  },
  {
    Icon: FileSearch,
    title: "AI reviews the evidence",
    body: "Our agents extract, organize, and assess your responses against the framework, quoting the sources behind every rating.",
    href: "/upload",
  },
  {
    Icon: LayoutDashboard,
    title: "See where you stand",
    body: "Every subdomain is rated Practiced or Not Practiced on your dashboard, with the reasoning attached.",
    href: "/dashboard",
  },
  {
    Icon: Map,
    title: "Follow your roadmap",
    body: "The roadmap orders it all into six stages — from need & governance to long-term oversight — so you know what comes next.",
    href: "/roadmap",
  },
];

/**
 * "How it works" — a compressed, user-facing version of the system
 * architecture: data input → AI agents → ratings → roadmap.
 * Each step links to the page where that step happens.
 */
export default function HowItWorks() {
  return (
    <section
      aria-labelledby="how-it-works"
      className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"
    >
      <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
        How it works
      </p>
      <h2
        id="how-it-works"
        className="mt-1 text-2xl font-bold tracking-tight text-slate-900"
      >
        From your reports to a readiness roadmap
      </h2>

      <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, i) => (
          <li key={step.title}>
            <Link
              href={step.href}
              className="group flex h-full flex-col rounded-xl border border-slate-200 bg-slate-50 p-5 transition hover:border-blue-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white"
                  aria-hidden
                >
                  <step.Icon className="h-5 w-5" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Step {i + 1}
                </span>
              </div>
              <h3 className="mt-3 text-sm font-semibold text-slate-900">
                {step.title}
              </h3>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-500">
                {step.body}
              </p>
              <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600">
                Go
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
