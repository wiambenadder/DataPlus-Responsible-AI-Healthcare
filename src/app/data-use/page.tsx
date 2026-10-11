import type { Metadata } from "next";
import Link from "next/link";
import InfoLayout, { InfoSection } from "@/_components/info/InfoLayout";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "How we use your data · Innovator Insights",
};

const SECTIONS = [
  { id: "collect", title: "What we collect" },
  { id: "see", title: "Who can see it" },
  { id: "ai", title: "How AI is used" },
  { id: "publish", title: "Reports and case studies" },
  { id: "avoid", title: "What not to upload" },
  { id: "control", title: "Changing or removing your data" },
];

/*
 * NOTE FOR THE TEAM: this page states commitments to innovators. Check it
 * against your agreements with partners before launch, and keep it in
 * step with how the platform actually works.
 */
export default function DataUsePage() {
  return (
    <InfoLayout
      label="Help"
      title="How we use your data"
      lede={
        <p>
          What happens to the documents and answers you share with {SITE.name},
          who can see them, and what we will not do with them.
        </p>
      }
      sections={SECTIONS}
    >
      <InfoSection id="collect" title="What we collect">
        <ul className="list-disc space-y-1 pl-5">
          <li>Your name and email address, to give you an account.</li>
          <li>Your organisation&apos;s profile: name, country, year established, staff numbers and type.</li>
          <li>The PDF documents you upload and the text read from them.</li>
          <li>Your answers to the assessment questions.</li>
          <li>The results worked out from them, and any feedback you leave on those results.</li>
        </ul>
        <p>
          Everything is stored in the platform&apos;s database and file storage
          (Supabase), and the site is hosted on Vercel.
        </p>
      </InfoSection>

      <InfoSection id="see" title="Who can see it">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>People in your organisation</strong> who have an account and have
            joined it. You can see and remove members under{" "}
            <Link href="/company" className="link-more">Company and team</Link>.
          </li>
          <li>
            <strong>The platform team</strong>, who maintain the platform and review
            the feedback you send.
          </li>
        </ul>
        <p>Other organisations using the platform cannot see your documents, answers or results.</p>
      </InfoSection>

      <InfoSection id="ai" title="How AI is used">
        <p>
          The text of your documents and your answers is sent to AI models to sort
          the evidence into the framework&apos;s criteria, rate each criterion and
          summarise the results. The models are accessed through Duke
          University&apos;s AI gateway; under its terms, what you share is not used
          to train AI models.
        </p>
        <p>
          AI can make mistakes. That is why every result shows its evidence and
          source, and why you can tell us when something is wrong. See{" "}
          <Link href="/framework#process" className="link-more">how your evidence is processed</Link>.
        </p>
      </InfoSection>

      <InfoSection id="publish" title="Reports and case studies">
        <p>
          Results are a decision aid for your team. We will not publish your
          organisation&apos;s assessment, or name you in a case study or report,
          without your permission.
        </p>
      </InfoSection>

      <InfoSection id="avoid" title="What not to upload">
        <p>
          Don&apos;t upload anything that identifies patients or individuals —
          names, ID numbers, contact details, medical records or images of people.
          The assessment only needs to know how your tool and organisation work.
          Remove personal information from documents before you upload them.
        </p>
      </InfoSection>

      <InfoSection id="control" title="Changing or removing your data">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Edit your answers from{" "}
            <Link href="/report/assessment" className="link-more">Submit evidence</Link>.
          </li>
          <li>Edit or delete your own feedback under each criterion on your dashboard.</li>
          <li>
            To remove documents, your organisation&apos;s data or your account, contact
            the platform team
            {SITE.contactEmail ? (
              <>
                {" "}at{" "}
                <a href={`mailto:${SITE.contactEmail}`} className="link-more">
                  {SITE.contactEmail}
                </a>
              </>
            ) : null}
            .
          </li>
        </ul>
      </InfoSection>
    </InfoLayout>
  );
}
