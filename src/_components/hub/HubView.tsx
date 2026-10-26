import Link from "next/link";
import {
  ArrowRight,
  ClipboardCheck,
  Landmark,
  Lightbulb,
  ShieldCheck,
} from "lucide-react";
import ToolInfographic from "@/components/ToolInfographic";
import Photo from "@/components/Photo";
import { SITE } from "@/lib/site";
import { WORKSTREAMS } from "@/lib/workstreams";
import { PHOTOS } from "@/lib/photos";

const AUDIENCES = [
  {
    title: "For innovators",
    icon: Lightbulb,
    text: "Turn evidence into a clearer path forward. Identify strengths, gaps, and the next steps toward responsible scaling.",
  },
  {
    title: "For funders",
    icon: ClipboardCheck,
    text: "Structure your review of an innovation. Use the evidence and its gaps to identify questions for further diligence.",
  },
  {
    title: "For ministries of health",
    icon: Landmark,
    text: "Consider an innovation in the context of local needs. Use the framework to guide discussions about implementation and readiness.",
  },
];

const TESTIMONIALS = [
  [
    "Innovator perspective",
    "How the platform helped identify a next step toward scaling.",
  ],
  [
    "Funder perspective",
    "How a tool helped assess an innovation or identify questions for further review.",
  ],
  [
    "Ministry perspective",
    "How the platform supported consideration of local needs and implementation.",
  ],
];

export default function HubView() {
  return (
    <div>
      <section
        className="grid bg-brand-navy lg:grid-cols-2"
        aria-labelledby="hero-title"
      >
        <div className="px-6 py-14 sm:px-10 lg:py-20 lg:pl-[max(2rem,calc((100vw-80rem)/2+2rem))] lg:pr-12">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-200">
            Global health · Responsible AI
          </p>
          <h1
            id="hero-title"
            className="mt-6 max-w-xl text-5xl text-white sm:text-6xl"
          >
            A clearer path from AI innovation to health impact.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-blue-50">
            {SITE.name} helps health innovators, funders, and ministries
            understand AI readiness, examine evidence, and plan what comes next.
          </p>
          <p className="mt-4 max-w-lg text-[15px] text-blue-100">
            Built by a Duke University team, with support from the Duke Global
            Health Innovation Center and Innovations in Healthcare.
          </p>
          <Link href="/hub#tools" className="btn btn-light mt-8">
            Discover the platform <ArrowRight size={18} aria-hidden />
          </Link>
          <p className="mt-4 text-sm text-blue-100">
            <Link href="/data-use" className="underline underline-offset-4 hover:text-white">
              Learn about our approach before sharing any data.
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
              Research, experience,
              <br className="hidden sm:block" /> and a shared purpose.
            </h2>
          </div>
          <div className="space-y-5 text-slate-700">
            <p className="text-lg">
              Promising AI needs more than a good model to improve health. Teams
              need a practical way to examine evidence, understand gaps, and
              prepare for real-world use.
            </p>
            <p>
              Developed through the Duke Bass Connections team, this platform brings together
              Duke GHIC’s focus on scaling health innovations and the evaluation
              framework developed by Innovations in Healthcare. GEMINI at Duke
              supports the project, with Society for Family Health (Rwanda) as
              an anchor partner.
            </p>
            <Link href="/about" className="link-more inline-block">
              Meet the team and learn why we built this →
            </Link>
          </div>
        </section>

        <section
          id="audiences"
          className="scroll-mt-8 py-16"
          aria-labelledby="audiences-heading"
        >
          <p className="label-caps">Who this helps</p>
          <h2 id="audiences-heading" className="mt-3 text-4xl sm:text-5xl">
            Different roles. Better-informed decisions.
          </h2>
          <div className="mt-9 grid gap-8 md:grid-cols-3">
            {AUDIENCES.map(({ title, icon: Icon, text }) => (
              <article
                key={title}
                className="flex flex-col border-t-2 border-brand-teal pt-6"
              >
                <Icon size={28} className="text-brand-teal" aria-hidden />
                <h3 className="mt-5 text-xl font-bold text-brand-navy">
                  {title}
                </h3>
                <p className="mt-3 text-slate-600">{text}</p>
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
            Start with the question you need to answer.
          </h2>
          <p className="mt-4 max-w-2xl text-slate-600">
            Choose a tool to get started. The assessment is available now;
            financing and policy resources are in development.
          </p>
          <div className="mt-9 grid gap-6 md:grid-cols-3">
            {WORKSTREAMS.map((stream) => (
              <article
                key={stream.id}
                className="flex flex-col border border-t-4 bg-white p-6"
                style={{ borderTopColor: stream.accent }}
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    {stream.status === "live" ? "Available now" : "In development"}
                  </p>
                  <ToolInfographic stream={stream} />
                </div>
                <h3 className="mt-4 font-serif text-3xl leading-tight text-brand-navy">
                  {stream.title}
                </h3>
                <p className="mb-8 mt-4 text-slate-600">{stream.description}</p>
                <Link
                  href={stream.href}
                  className={`btn mt-auto self-start ${stream.status === "live" ? "btn-primary" : "btn-secondary"}`}
                >
                  {stream.status === "live"
                    ? "Start the assessment"
                    : `About the ${stream.id} codebook`}{" "}
                  →
                </Link>
                {stream.status === "live" && (
                  <Link
                    href="/framework"
                    className="link-more mt-4 self-start text-sm"
                  >
                    How the assessment works
                  </Link>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      {process.env.NODE_ENV !== "production" && (
        <section
          className="mx-auto max-w-7xl px-6 py-16 sm:px-8"
          aria-labelledby="experiences-heading"
        >
          <p className="label-caps">User experiences · Draft only</p>
          <h2 id="experiences-heading" className="mt-3 text-4xl">
            Learning from the people who use it.
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map(([title, prompt]) => (
              <article key={title} className="border border-dashed p-6">
                <h3 className="font-bold text-brand-navy">{title}</h3>
                <p className="mt-3 text-sm font-semibold text-brand-bronze">
                  Testimonial pending approval
                </p>
                <p className="mt-3 text-sm text-slate-600">{prompt}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      <section
        className="mx-auto grid max-w-7xl gap-8 px-6 py-16 sm:px-8 md:grid-cols-[1fr_1.6fr]"
        aria-labelledby="trust-heading"
      >
        <div>
          <ShieldCheck className="text-brand-teal" size={32} aria-hidden />
          <p className="label-caps mt-5">Data and trust</p>
          <h2 id="trust-heading" className="mt-3 text-4xl">
            Know what you share.
            <br />
            Understand the results.
          </h2>
        </div>
        <div className="space-y-5 text-slate-700">
          <p>
            The assessment uses documents about your innovation and answers
            about your practices to identify evidence and suggest next steps. Do
            not upload patient records, personal information, or confidential
            material you do not have permission to share.
          </p>
          <p>
            AI-generated results can be wrong. Review the supporting evidence
            and use the findings to guide discussion with your team and
            partners. Results are a decision aid, not a certification or
            ranking.
          </p>
          <Link href="/data-use" className="link-more inline-block">
            Read about data use, access, and deletion requests →
          </Link>
        </div>
      </section>
    </div>
  );
}
