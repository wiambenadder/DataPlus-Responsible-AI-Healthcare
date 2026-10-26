import type { Metadata } from "next";
import Link from "next/link";
import InfoLayout, { InfoSection } from "@/_components/info/InfoLayout";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "About · Innovator Insights",
};

const SECTIONS = [
  { id: "why", title: "Why This Platform" },
  { id: "what", title: "What It Does" },
  { id: "framework", title: "Where the Framework Comes From" },
  { id: "who", title: "Who It's For" },
  { id: "behind", title: "Who Is Behind It" },
  { id: "team", title: "Project Team" },
  { id: "acknowledgments", title: "Acknowledgments and Credits" },
];

/**
 * About the platform: the problem it addresses, what it does, where the
 * framework comes from and who supports it. Wording follows the project
 * description from the team.
 */
export default function AboutPage() {
  return (
    <InfoLayout
      label="About"
      title="About Innovator Insights"
      lede={
        <p>
          An open-source platform that helps teams building AI for health see
          how ready their tool is for responsible, real-world use, and what to
          do next.
        </p>
      }
      sections={SECTIONS}
    >
      <InfoSection id="why" title="Why This Platform">
        <p>
          AI tools for health are being developed faster than they can be
          evaluated. Most assessments rely on expert-led reviews that take time,
          are hard to scale, and give innovators little reason to take part.
        </p>
        <p>
          {SITE.name} turns evaluation from a one-time review into an ongoing
          process that encourages continuous improvement and supports the
          responsible adoption of AI in health care.
        </p>
      </InfoSection>

      <InfoSection id="what" title="What It Does">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>A standard assessment.</strong> Your documents and answers
            are compared against the same 31 practices for every tool, using
            AI-assisted analysis, so results are consistent and comparable.
          </li>
          <li>
            <strong>Evidence you can check.</strong> Every rating shows the
            reason and the passage it came from, and you can tell us when
            it&apos;s wrong.
          </li>
          <li>
            <strong>A personal roadmap.</strong> The practices are ordered into
            six stages, so you can see your strengths, your gaps and the next
            steps to take.
          </li>
        </ul>
        <p>
          Results are a decision aid, not a certification or a ranking.{" "}
          <Link href="/framework" className="link-more">
            How the assessment works
          </Link>
        </p>
      </InfoSection>

      <InfoSection id="framework" title="Where the Framework Comes From">
        <p>
          The five domains and 31 practices come from research by {SITE.org} and
          its work with health innovators. They follow an AI tool through its
          life: the data it learns from, how it is built and tested, how it runs
          safely in care, the difference it makes, and whether it can last.
        </p>
        <p>
          <Link href="/framework#domains" className="link-more">
            See the five domains and 31 practices
          </Link>
        </p>
      </InfoSection>

      <InfoSection id="who" title="Who It's For">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Innovators</strong> building or deploying AI tools for
            health, to see where they stand and show their evidence to partners.
          </li>
          <li>
            <strong>Funders</strong>, to understand where a tool stands before
            and after investing.
          </li>
          <li>
            <strong>Health systems and ministries</strong>, to compare tools on
            one framework when deciding what to adopt.
          </li>
        </ul>
        <p>The platform is free and open to anyone, with any email address.</p>
      </InfoSection>

      <InfoSection id="behind" title="Who Is Behind It">
        <p>
          {SITE.name} is supported by the Duke Global Health Innovation Center
          (Duke GHIC), {SITE.org} (IiH) and GEMINI, the Global Emergency
          Medicine Innovation, Implementation, and Informatics Program at Duke,
          in partnership with our anchor partner, Society for Family Health
          (Rwanda).
        </p>
        <p>
          It is built by a team of Duke University students working at the
          intersection of artificial intelligence, global health and software
          engineering.
        </p>
      </InfoSection>
      <InfoSection id="team" title="Project Team">
        <p>
          Developed through the Duke Bass Connections team.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Lisa Bourget, MBA — Project Lead</li>
          <li>Joao Ricardo Nickenig Vissoci, Ph.D. — Project Advisor</li>
          <li>Catherine Gonzalez — Project Manager</li>
          <li>Eunice Mutindi — Project Advisor</li>
        </ul>
        <p>
          Duke GHIC supports the project’s global health innovation focus.
          Innovations in Healthcare provides the assessment framework and domain
          expertise. GEMINI at Duke supports the project alongside anchor
          partner Society for Family Health (Rwanda).
        </p>
      </InfoSection>
      <InfoSection id="acknowledgments" title="Acknowledgments and Credits">
        <p>
          We thank the Duke Data+ program, project advisors, and health
          innovators who have contributed time and feedback. Individual
          participating organizations and quotes will be added with permission.
          Participation does not imply endorsement of the platform or its
          findings.
        </p>
        <p>
          The homepage uses an illustrative photograph by{" "}
          <a
            href="https://unsplash.com/photos/DbCfSrTnflA"
            className="link-more"
          >
            Nappy on Unsplash
          </a>
          . People pictured are not presented as platform users or endorsers.
        </p>
        <p>
          Before wider release, the team will confirm written permission for
          website photography and agreed credits, and review the image selection
          for representation across regions, including Asia.
        </p>
      </InfoSection>
    </InfoLayout>
  );
}
