import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "What's New · Innovator Insights",
};

/**
 * What changed after the first round of innovator testing. Each row pairs
 * what innovators told us with what changed and where to see it. Keep this
 * list current when further feedback is addressed.
 */
const CHANGES: { heard: string; changed: string; where: { href: string; label: string } }[] = [
  {
    heard: "Feedback disappeared after leaving the page, and the options were unclear.",
    changed:
      "Feedback is saved to your account and reloads every time. Choose \"This is accurate\", \"Needs revision\" or \"Wrong source or company\"; a comment is optional. You see Saving…, then Saved, and can retry if a save fails. You can edit or delete your own comments.",
    where: { href: "/dashboard", label: "Results" },
  },
  {
    heard: "It was hard to tell where a rating came from, or whether it was right.",
    changed:
      "Each practice shows why it was rated that way, a summary, a confidence level and the evidence: the exact passage or your answer as typed, with a link to the source document.",
    where: { href: "/dashboard", label: "Results" },
  },
  {
    heard: "Some ratings used another organization's work, such as a partner's trial.",
    changed:
      "Report \"Wrong source or company\" on any practice or piece of evidence. The practice is marked for review and isn't counted as met until the team has checked it, on every page.",
    where: { href: "/dashboard", label: "Results" },
  },
  {
    heard: "We answered a question, but the answer wasn't picked up.",
    changed:
      "\"We answered this, but it wasn't picked up\" is now a reason you can choose under Needs revision, so the team can find and fix these cases.",
    where: { href: "/dashboard", label: "Results" },
  },
  {
    heard: "Uploaded PDFs wouldn't open.",
    changed: "Documents now open through secure, time-limited links, with a clear message if a file can't be found.",
    where: { href: "/report/history", label: "Your Submissions" },
  },
  {
    heard: "Invitations went to the wrong address and couldn't be undone.",
    changed: "Email addresses are checked before an invitation is sent, pending invitations are listed, and you can cancel one.",
    where: { href: "/company", label: "Company and Team" },
  },
  {
    heard: "Long results pages were hard to move around.",
    changed:
      "Domain tabs stay at the top of the page, every domain and practice has its own link, you can expand or collapse everything, and Back to Top is always close.",
    where: { href: "/dashboard", label: "Results" },
  },
  {
    heard: "Terms such as Model Source were unclear, and so was what counts as met.",
    changed:
      "Every domain and practice is explained in plain language, along with what counts as met and the thresholds for each roadmap stage.",
    where: { href: "/framework", label: "The Framework" },
  },
  {
    heard: "The roadmap didn't say what to do next.",
    changed:
      "Each stage shows how many practices are needed to move on and the quickest next step. The Roadmap Assistant answers questions about your roadmap and the site.",
    where: { href: "/roadmap", label: "Roadmap" },
  },
  {
    heard: "\"Report\" in the menu was unclear, and the logo didn't look clickable.",
    changed: "The menu now says Submit Evidence and Results, with a Home link and plain descriptions.",
    where: { href: "/", label: "Home" },
  },
  {
    heard: "We weren't sure how our data and AI were used, or what not to upload.",
    changed:
      "A plain-language data page explains who can see your material and how AI is used, and the upload page warns against personal or patient information.",
    where: { href: "/data-use", label: "How We Use Your Data" },
  },
];

export default function WhatsNewPage() {
  return (
    <div>
      <div className="border-b border-slate-200 bg-whisper">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="text-sm text-slate-600">
            <Link href="/" className="hover:underline">
              Home
            </Link>
            <span className="mx-2" aria-hidden>
              ›
            </span>
            <span>What&apos;s New</span>
          </nav>
          <p className="label-caps mt-8">Help</p>
          <h1 className="mt-2 text-4xl sm:text-5xl">What&apos;s New</h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-700">
            Innovators who tested the platform told us what got in their way. Here is what we
            changed in response. Thank you to everyone who took part.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="section-head">
          <h2>Changes Based on Innovator Feedback</h2>
        </div>
        <div className="hidden grid-cols-[1fr_1.6fr_11rem] gap-8 border-b border-slate-200 py-3 text-[0.75rem] font-bold uppercase tracking-[0.1em] text-slate-500 md:grid">
          <span>What we heard</span>
          <span>What changed</span>
          <span>Where to see it</span>
        </div>
        <ul>
          {CHANGES.map((c) => (
            <li
              key={c.heard}
              className="grid gap-2 border-b border-slate-200 py-5 md:grid-cols-[1fr_1.6fr_11rem] md:gap-8"
            >
              <p className="font-serif text-[1.2rem] leading-snug text-brand-navy">{c.heard}</p>
              <p className="text-[15px] leading-relaxed text-slate-700">{c.changed}</p>
              <p>
                <Link href={c.where.href} className="link-more text-[15px]">
                  {c.where.label} ›
                </Link>
              </p>
            </li>
          ))}
        </ul>

        <p className="mt-8 max-w-3xl text-[15px] text-slate-600">
          Still to come: uploading new documents to an existing assessment, the Financing
          Codebook and the Policy Codebook. If something isn&apos;t working for you, use
          &ldquo;Is this right?&rdquo; on any result or ask the Roadmap Assistant.
        </p>
      </div>
    </div>
  );
}
