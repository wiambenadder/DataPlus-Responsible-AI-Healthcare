import Link from "next/link";
import { ArrowRight, Lightbulb, ClipboardCheck, Landmark } from "lucide-react";
import TestimonialCarousel from "./TestimonialCarousel";
import { TESTIMONIALS } from "@/lib/testimonials";
import Photo from "@/components/Photo";
import { SITE, LINKS } from "@/lib/site";
import { WORKSTREAMS } from "@/lib/workstreams";
import { PHOTOS } from "@/lib/photos";

// Plain wording on purpose: most visitors are here for the first time, so
// say what each audience can do rather than using slogans.
const AUDIENCES = [
  {
    title: "Innovators",
    icon: Lightbulb,
    text: "Check your tool's readiness today and see what to work on next. Soon, learn how similar tools were funded and which rules apply where you work.",
  },
  {
    title: "Funders",
    icon: ClipboardCheck,
    text: "Use the same 31 practices to review a tool and decide what to ask the team. Soon, see how similar tools have been funded over time.",
  },
  {
    title: "Ministries of health",
    icon: Landmark,
    text: "Use a shared framework to discuss whether a tool is ready for your health system. Soon, compare AI and health policies across countries.",
  },
];

// Shown until real, approved testimonials are added to
// src/lib/testimonials.ts. They describe what each story will cover and
// are never presented as quotes from real people.
const PLACEHOLDER_STORIES = [
  "How an innovator used the assessment to find their next step toward scaling.",
  "What a team learned from the evidence behind its ratings.",
  "How an innovator shared their roadmap with partners and funders.",
];

// The question each tool answers, shown in the hero.
const TOOL_QUESTIONS: Record<string, string> = {
  "ai-readiness": "Is it ready for real-world care?",
  financing: "How could it be funded for the long term?",
  policy: "Which rules apply where you work?",
};

/** Underlined link to an outside site, opening in a new tab. */
function Ext({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="font-semibold text-brand-dukeblue underline underline-offset-4 hover:text-brand-navy"
    >
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

/**
 * Home page (also /hub). Order: what it is, who is behind it, who it's for,
 * the tools, then a short note on data. Card content for the tools lives in
 * src/lib/workstreams.ts; outside links live in src/lib/site.ts.
 */
export default function HubView() {
  return (
    <div>
      <section
        className="grid bg-brand-navy lg:grid-cols-2"
        aria-labelledby="hero-title"
      >
        <div className="px-6 py-14 sm:px-10 lg:py-20 lg:pl-[max(2rem,calc((100vw-80rem)/2+2rem))] lg:pr-12">
          <h1
            id="hero-title"
            className="max-w-xl text-5xl text-white sm:text-6xl"
          >
            Helping Health AI Tools Work in the Real World
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-blue-50">
            {SITE.name} is a free platform for teams building AI for health
            care, and for the funders and ministries of health who work with
            them. It brings together three tools for the questions every AI
            health tool faces:
          </p>
          {/* One line per tool, from src/lib/workstreams.ts, so the hero
              always matches the tools section below. */}
          <ul className="mt-5 max-w-xl space-y-3">
            {WORKSTREAMS.map((tool) => (
              <li key={tool.id} className="border-l-2 border-blue-200/60 pl-4">
                <p className="text-[17px] font-semibold text-white">
                  {TOOL_QUESTIONS[tool.id]}
                </p>
                <p className="text-[15px] text-blue-100">
                  <Link href={tool.href} className="underline underline-offset-4 hover:text-white">
                    {tool.title}
                  </Link>
                  {" · "}
                  {tool.status === "live" ? "Available now" : "Coming soon"}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-8 flex flex-wrap gap-3">
            <Link href="/ai-readiness" className="btn btn-light">
              Try the Assessment <ArrowRight size={18} aria-hidden />
            </Link>
            <Link href="/hub#tools" className="btn btn-outline-light">
              Explore All Tools
            </Link>
          </p>
          <p className="mt-4 text-sm text-blue-100">
            <Link href="/data-use" className="underline underline-offset-4 hover:text-white">
              How we handle your data
            </Link>
          </p>
        </div>
        <figure className="relative min-h-80 lg:min-h-[570px]">
          <Photo name="hero" width={1400} priority />
          <figcaption className="absolute inset-x-0 bottom-0 bg-brand-darkblue/90 px-5 py-2 text-xs text-white">
            Illustrative photo:{" "}
            <a href={PHOTOS.hero.page} className="underline">
              {PHOTOS.hero.photographer} / Unsplash
            </a>
          </figcaption>
        </figure>
      </section>

      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <section
          id="who-we-are"
          className="scroll-mt-8 grid gap-8 border-b py-16 lg:grid-cols-[1fr_1.65fr] lg:gap-20"
          aria-labelledby="about-heading"
        >
          <div>
            <p className="label-caps">Who we are</p>
            <h2 id="about-heading" className="mt-3 text-4xl sm:text-5xl">
              Built at Duke, Based on Research With Innovators
            </h2>
          </div>
          {/* Each organization is named in full and linked, so first-time
              visitors can see who they are without knowing the acronyms. */}
          <div className="space-y-5 text-lg leading-relaxed text-slate-700">
            <p>
              {SITE.name} was built by Duke University students through two
              Duke programs: <Ext href={LINKS.dataPlus}>Data+</Ext>, a summer
              research program, and{" "}
              <Ext href={LINKS.bassConnections}>Bass Connections</Ext>, a
              year-long research team.
            </p>
            <p>
              The assessment is based on a framework that{" "}
              <Ext href={SITE.orgUrl}>Innovations in Healthcare</Ext>, a
              nonprofit hosted by Duke University, developed through research
              with health innovators. Innovations in Healthcare works closely
              with the{" "}
              <Ext href={SITE.dukeUrl}>Duke Global Health Innovation Center</Ext>
              , which studies how health innovations grow and spread. Both
              support this project.
            </p>
            <Link href="/about" className="link-more inline-block text-base">
              About the project and team →
            </Link>
          </div>
        </section>

        <section
          id="audiences"
          className="scroll-mt-8 py-16"
          aria-labelledby="audiences-heading"
        >
          <h2 id="audiences-heading" className="text-4xl sm:text-5xl">
            Who It&apos;s For
          </h2>
          <div className="mt-9 grid gap-8 md:grid-cols-3">
            {AUDIENCES.map(({ title, icon: Icon, text }) => (
              <article
                key={title}
                className="border-t-2 border-brand-teal pt-5"
              >
                <Icon size={28} className="text-brand-teal" aria-hidden />
                <h3 className="mt-4 text-xl font-bold text-brand-navy">{title}</h3>
                <p className="mt-2 text-slate-600">{text}</p>
              </article>
            ))}
          </div>
        </section>
      </div>

      <section
        id="tools"
        className="scroll-mt-8 bg-whisper py-16"
        aria-labelledby="tools-heading"
      >
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <p className="label-caps">Our tools</p>
          <h2 id="tools-heading" className="mt-3 text-4xl sm:text-5xl">
            Start With the Question You Need Answered
          </h2>
          <div className="mt-9 grid gap-6 md:grid-cols-3">
            {WORKSTREAMS.map((stream) => (
              <article
                key={stream.id}
                className="flex flex-col border border-t-4 bg-white p-6"
                style={{ borderTopColor: stream.accent }}
              >
                <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  {stream.status === "live" ? "Available now" : "Coming soon"}
                </p>
                <h3 className="mt-3 font-serif text-3xl leading-tight text-brand-navy">
                  {stream.title}
                </h3>
                <p className="mb-8 mt-4 text-slate-600">{stream.description}</p>
                <Link
                  href={stream.href}
                  className={`btn mt-auto self-start ${stream.status === "live" ? "btn-primary" : "btn-secondary"}`}
                >
                  {stream.status === "live"
                    ? "Explore the Assessment"
                    : `About the ${stream.title}`}{" "}
                  →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Innovator testimonials. Until approved entries are added to
          src/lib/testimonials.ts, the carousel shows "coming soon" slides
          that say what each story will cover (no invented quotes). */}
      <section
        className="mx-auto max-w-7xl px-6 py-16 sm:px-8"
        aria-labelledby="experiences-heading"
      >
        <p className="label-caps">
          {TESTIMONIALS.length > 0 ? "In their words" : "In their words · Coming soon"}
        </p>
        <h2 id="experiences-heading" className="mt-3 text-4xl">
          Stories From Innovators
        </h2>
        <div className="mt-8">
          <TestimonialCarousel items={TESTIMONIALS} placeholders={PLACEHOLDER_STORIES} />
        </div>
      </section>

      <section
        className="mx-auto grid max-w-7xl gap-8 px-6 py-16 sm:px-8 md:grid-cols-[1fr_1.6fr]"
        aria-labelledby="trust-heading"
      >
        <div>
          <p className="label-caps">Data and trust</p>
          <h2 id="trust-heading" className="mt-3 text-4xl">
            Know What You Share
          </h2>
        </div>
        <div className="space-y-4 text-slate-700">
          <p>
            The assessment reads the documents and answers you share. Please
            don&apos;t upload patient records or personal information. AI can
            make mistakes, so every rating shows the evidence behind it.
          </p>
          <Link href="/data-use" className="link-more inline-block">
            How we handle your data →
          </Link>
        </div>
      </section>
    </div>
  );
}
