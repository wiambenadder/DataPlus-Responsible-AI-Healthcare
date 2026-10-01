/**
 * The three workstreams shown on the hub page (/hub).
 *
 * Edit this file to change a card's text, link, or status — no
 * component changes needed. When a codebook goes live, point `href`
 * at its real route and set `status` to "live".
 */

export type WorkstreamStatus = "live" | "coming-soon";

export type WorkstreamAccent = "blue" | "emerald" | "violet";

export type Workstream = {
  id: "ai-readiness" | "financing" | "policy";
  eyebrow: string;
  title: string;
  description: string;
  highlights: string[];
  href: string;
  cta: string;
  status: WorkstreamStatus;
  accent: WorkstreamAccent;
};

export const WORKSTREAMS: Workstream[] = [
  {
    id: "ai-readiness",
    eyebrow: "Assessment",
    title: "AI Readiness Assessment",
    description:
      "Report on how you build and deploy AI and get an evidence-backed rating across 5 domains and 31 subdomains, plus a staged roadmap.",
    highlights: [
      "Upload documents and answer follow-up questions",
      "Practiced / Not Practiced ratings with sourced reasoning",
      "Six-stage roadmap for what to strengthen next",
    ],
    href: "/",
    cta: "Open assessment",
    status: "live",
    accent: "blue",
  },
  {
    id: "financing",
    eyebrow: "Codebook",
    title: "Financing Codebook",
    description:
      "A structured reference of funding sources and financing models for sustaining AI solutions in healthcare.",
    highlights: [
      "Funding sources and financing models",
      "Organized and tagged for search",
      "Linked to roadmap recommendations",
    ],
    href: "/financing-codebook",
    cta: "Open financing codebook",
    status: "coming-soon",
    accent: "emerald",
  },
  {
    id: "policy",
    eyebrow: "Codebook",
    title: "Policy Codebook",
    description:
      "A structured reference of the policies, regulations, and guidance that shape how AI is used in healthcare.",
    highlights: [
      "Regulations, guidance, and governance frameworks",
      "Organized and tagged for search",
      "Linked to roadmap recommendations",
    ],
    href: "/policy-codebook",
    cta: "Open policy codebook",
    status: "coming-soon",
    accent: "violet",
  },
];

/** Tailwind classes per accent, matching the domain colors on the home page. */
export const ACCENT_STYLES: Record<
  WorkstreamAccent,
  { icon: string; eyebrow: string; dot: string; ring: string }
> = {
  blue: {
    icon: "bg-blue-600 text-white",
    eyebrow: "text-blue-600",
    dot: "bg-blue-500",
    ring: "hover:border-blue-300",
  },
  emerald: {
    icon: "bg-emerald-600 text-white",
    eyebrow: "text-emerald-600",
    dot: "bg-emerald-500",
    ring: "hover:border-emerald-300",
  },
  violet: {
    icon: "bg-violet-600 text-white",
    eyebrow: "text-violet-600",
    dot: "bg-violet-500",
    ring: "hover:border-violet-300",
  },
};
