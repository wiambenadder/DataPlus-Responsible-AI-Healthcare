import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import InfoLayout, { InfoSection } from "@/_components/info/InfoLayout";
import { SITE, LINKS } from "@/lib/site";
import { PHOTOS, type PhotoKey } from "@/lib/photos";

export const metadata: Metadata = {
  title: "About · Innovator Insights",
};

const SECTIONS = [
  { id: "why", title: "Why We Built It" },
  { id: "framework", title: "Where the Framework Comes From" },
  { id: "behind", title: "Who Is Behind It" },
  { id: "teams", title: "Student Teams" },
  { id: "acknowledgments", title: "Acknowledgments and Credits" },
];

/*
 * Credits are copied from the official program pages (linked below). When a
 * name or role changes there, update it here too. Keep the two programs
 * separate: Data+ (summer 2026) and Bass Connections (2026–2027) are
 * different Duke programs with different teams.
 */
const BASS_CONNECTIONS_TEAM: [string, string[]][] = [
  ["Team leader", ["Lisa Bourget, Duke Global Health Institute"]],
  [
    "Graduate members",
    [
      "Oscar Briones Jiménez, Global Health – MS",
      "Abhay Sharma, Masters of Public Policy",
      "Reva Tharwani, Masters of Public Policy",
      "Alcade Fabrice Uwonkunda, Global Health – MS",
      "Grace Yang, Data Science – MS",
    ],
  ],
  [
    "Undergraduate members",
    [
      "Wiam Benadder, DKU-Interdisciplinary Studies (BS)",
      "Ava Francis, Undeclared",
      "Aanya Gupta, Undeclared",
      "Dadou Sabrina Théa Ikirezi, Computer Science (BS)",
      "Grace Kim, Undeclared",
      "Mia Liu, Undeclared",
      "Melina Malkani, Undeclared",
      "Saira Nagda, Public Policy (AB), Global Health (AB2)",
      "Jeanette Pan, Electrical & Computer Egr (BSE)",
      "Reese Ritter, Undeclared",
      "Nicole Tedja, Undeclared",
      "Celina Zhou, Economics (BS)",
    ],
  ],
  ["Community member", ["Manasseh Gihana Wandera, Society for Family Health"]],
  [
    "Contributors",
    [
      "Eunice Mutindi, Duke Global Health Institute",
      "Joao Ricardo Nickenig Vissoci, Duke Global Health Institute, School of Medicine",
      "Krishna Udayakumar, Duke Global Health Institute",
    ],
  ],
];

const DATA_PLUS_TEAM: [string, string[]][] = [
  ["Members", ["Jeanette Pan", "Mia Liu", "Wiam Benadder"]],
  ["Project lead", ["Lisa Bourget"]],
  ["Project manager", ["Catherine Gonzalez"]],
];

// Every photo the site currently shows. Add a key here when a page starts
// using a new photo, so it is credited.
const PHOTOS_IN_USE: PhotoKey[] = ["hero", "innovators", "financing", "policy"];

/**
 * About the platform: why it exists, where the framework comes from, who is
 * behind it, and credits for both student teams.
 */
export default function AboutPage() {
  return (
    <InfoLayout
      label="About"
      title="About Innovator Insights"
      lede={
        <p>
          A free, open-source platform that helps teams building AI for health
          see how ready their tool is for real-world use, and what to do next.
        </p>
      }
      sections={SECTIONS}
    >
      <InfoSection id="why" title="Why We Built It">
        <p>
          Most assessments of AI tools for health rely on expert reviews that
          take time, are hard to scale and give innovators little reason to
          take part. {SITE.name} offers a standard assessment instead. It reads
          the reports a team already has, rates them against 31 practices with
          the evidence behind each rating, and turns the results into a
          roadmap. Teams can come back and update it as their tool develops.
        </p>
        <p>
          <Link href="/framework" className="link-more">
            How the assessment works
          </Link>
        </p>
      </InfoSection>

      <InfoSection id="framework" title="Where the Framework Comes From">
        <p>
          The five domains and 31 practices come from research by {SITE.org}{" "}
          with health innovators. They follow an AI tool through its life: the
          data it learns from, how it is built and tested, how it runs safely
          in care, the difference it makes, and whether it can last.
        </p>
        <p>
          <Link href="/framework#domains" className="link-more">
            See the five domains and 31 practices
          </Link>
        </p>
      </InfoSection>

      <InfoSection id="behind" title="Who Is Behind It">
        <dl className="space-y-4">
          <Org name="Innovations in Healthcare" href={SITE.orgUrl}>
            A nonprofit hosted by Duke University. It developed the assessment
            framework through research with health innovators.
          </Org>
          <Org name="Duke Global Health Innovation Center (Duke GHIC)" href={SITE.dukeUrl}>
            A center of the Duke Global Health Institute that studies how
            health innovations grow and spread. It works closely with
            Innovations in Healthcare.
          </Org>
          <Org name="GEMINI" href={LINKS.gemini}>
            The Global Emergency Medicine Innovation, Implementation, and
            Informatics program at Duke.
          </Org>
          <Org name="Society for Family Health (Rwanda)">
            Our anchor partner, a health organization working in Rwanda.
          </Org>
        </dl>
      </InfoSection>

      <InfoSection id="teams" title="Student Teams">
        <p>
          Duke students built {SITE.name} through two Duke programs. Each has
          its own team and project page.
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          <Team
            program="Data+ 2026"
            project="Policy, Evidence and Financing for Responsible AI"
            about="A Duke summer research program."
            href={LINKS.dataPlus}
            linkText="Data+ project page, with the poster, prototype and code"
            credits={DATA_PLUS_TEAM}
          >
            This summer team built the first version of {SITE.name}: an
            open-source, AI-powered platform that gives innovators a standard
            assessment and a personal roadmap for using AI responsibly in
            health care. It points to strengths, gaps and practical
            improvements based on evidence, so evaluation becomes an ongoing
            process rather than a one-time review. Students worked across AI,
            global health and software engineering, with support from Duke
            GHIC, Innovations in Healthcare and GEMINI, and Society for Family
            Health (Rwanda) as anchor partner.
          </Team>
          <Team
            program="Bass Connections 2026–2027"
            project="AI Global Health: Policy, Evidence and Financing for Responsible AI"
            about="Duke's year-long research teams of faculty and students."
            href={LINKS.bassConnections}
            linkText="Bass Connections project page"
            credits={BASS_CONNECTIONS_TEAM}
          >
            A year-long team is building on this work, developing decision
            tools on AI policy, evidence and financing for health systems in
            low- and middle-income countries.
          </Team>
        </div>
      </InfoSection>

      <InfoSection id="acknowledgments" title="Acknowledgments and Credits">
        <p>
          We thank the health innovators who gave their time and feedback while
          we built the platform. Taking part does not mean endorsing the
          platform or its results, and we will only name organizations or
          share quotes with their permission.
        </p>
        <p>
          Photos are from Unsplash and are illustrative. The people shown are
          not platform users or endorsers.
        </p>
        <ul className="list-disc space-y-1 pl-5 text-[15px]">
          {PHOTOS_IN_USE.map((key) => (
            <li key={key}>
              {PHOTOS[key].alt}:{" "}
              <a href={PHOTOS[key].page} target="_blank" rel="noreferrer" className="link-more">
                {PHOTOS[key].photographer}
              </a>
            </li>
          ))}
        </ul>
      </InfoSection>
    </InfoLayout>
  );
}

/** One organization: linked name, then a plain-language line about it. */
function Org({ name, href, children }: { name: string; href?: string; children: ReactNode }) {
  return (
    <div>
      <dt className="font-bold text-brand-navy">
        {href ? (
          <a href={href} target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-brand-dukeblue">
            {name}
          </a>
        ) : (
          name
        )}
      </dt>
      <dd className="mt-1">{children}</dd>
    </div>
  );
}

/** Compact credit block for one program. */
function Team({
  program,
  project,
  about,
  href,
  linkText,
  credits,
  children,
}: {
  program: string;
  project: string;
  about: string;
  href: string;
  linkText: string;
  credits: [string, string[]][];
  children: ReactNode;
}) {
  return (
    <article className="border-t-4 border-brand-navy bg-slate-50 p-5">
      <h3 className="text-lg font-bold text-brand-navy">{program}</h3>
      <p className="text-sm text-slate-600">{about}</p>
      <p className="mt-2 font-serif text-xl italic leading-snug text-brand-navy">{project}</p>
      <p className="mt-3 text-[15px]">{children}</p>
      <dl className="mt-4 space-y-2 text-sm">
        {credits.map(([role, names]) => (
          <div key={role}>
            <dt className="text-xs font-bold uppercase tracking-[0.08em] text-slate-600">{role}</dt>
            <dd className="text-slate-800">{names.join(" · ")}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4">
        <a href={href} target="_blank" rel="noreferrer" className="link-more text-sm">
          {linkText}{"\u00a0"}↗
        </a>
      </p>
    </article>
  );
}
