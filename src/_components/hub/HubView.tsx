import Link from "next/link";
import { ArrowRight, Lightbulb, ClipboardCheck, Landmark } from "lucide-react";
import TestimonialCarousel from "./TestimonialCarousel";
import { TESTIMONIALS, type Testimonial } from "@/lib/testimonials";
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
    text: "See where your tool stands, what evidence backs it up, and what to work on next.",
  },
  {
    title: "Funders",
    icon: ClipboardCheck,
    text: "Use the same 31 practices to structure your review of a tool and decide what to ask the team.",
  },
  {
    title: "Ministries of health",
    icon: Landmark,
    text: "Use a shared framework to discuss whether a tool is ready for your health system.",
  },
];

// Draft slides for development only: placeholders, never real quotes.
const DRAFT_SLIDES: Testimonial[] = [1, 2, 3].map((n) => ({
  quote: "An innovator's words about using the platform will appear here once approved.",
  name: `Innovator ${n}`,
  role: "Role",
  organization: "Organization name",
  organizationUrl: "https://www.example.org/",
  photo: "",
  photoAlt: "",
}));

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
            Is Your Health AI Tool Ready for the Real World?
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-blue-50">
            {SITE.name} is a free platform for teams building AI for health
            care, and for the funders and ministries of health who work with
            them. Share the reports you already have and see how your tool
            measures up on 31 practices, with the evidence behind each rating
            and a roadmap of next steps.
          </p>
          <Link href="/ai-readiness" className="btn btn-light mt-8">
            Try the Assessment <ArrowRight size={18} aria-hidden />
          </Link>
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
                  {stream.status === "live" ? "Available now" : "In development"}
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

      {/* Innovator testimonials. Hidden on the live site until real,
          approved entries are added to src/lib/testimonials.ts; draft
          slides show in development so the layout can be reviewed. */}
      {(TESTIMONIALS.length > 0 || process.env.NODE_ENV !== "production") && (
        <section
          className="mx-auto max-w-7xl px-6 py-16 sm:px-8"
          aria-labelledby="experiences-heading"
        >
          <p className="label-caps">
            {TESTIMONIALS.length > 0 ? "In their words" : "In their words · Draft only"}
          </p>
          <h2 id="experiences-heading" className="mt-3 text-4xl">
            From Innovators Who Have Used It
          </h2>
          <div className="mt-8">
            <TestimonialCarousel
              items={TESTIMONIALS.length > 0 ? TESTIMONIALS : DRAFT_SLIDES}
              draft={TESTIMONIALS.length === 0}
            />
          </div>
        </section>
      )}

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
