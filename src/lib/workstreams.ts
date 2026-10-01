/**
 * The three workstreams shown on the hub page (/hub).
 *
 * Edit this file to change a card's text, link, or status — no
 * component changes needed. When a codebook goes live, point `href`
 * at its real route and set `status` to "live".
 *
 * Each card is framed around the question its workstream answers
 * (from the requirements doc): Evidence asks whether a tool works,
 * Financing asks whether it can last, Policy asks whether it's allowed.
 */

export type WorkstreamStatus = "live" | "coming-soon";

export type WorkstreamAccent = "blue" | "emerald" | "violet";

export type Workstream = {
  id: "ai-readiness" | "financing" | "policy";
  /** The question this workstream answers, shown above the title. */
  question: string;
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
    question: "Does it work?",
    title: "AI Readiness Assessment",
    description:
      "Find out how ready your AI tool is for real-world use, and what to strengthen next.",
    highlights: [
      "Upload your reports and answer a few follow-up questions.",
      "See where you stand on 31 practices, with the evidence behind each.",
      "Get a step-by-step roadmap for what to work on next.",
    ],
    href: "/",
    cta: "Start your assessment",
    status: "live",
    accent: "blue",
  },
  {
    id: "financing",
    question: "Can it last?",
    title: "Financing Codebook",
    description:
      "See how AI health tools are funded, and whether they can keep going after the grant ends.",
    highlights: [
      "See who funded each tool, and in what order.",
      "Check how much a tool depends on grants.",
      "Funders can find innovators that match what they fund.",
    ],
    href: "/financing-codebook",
    cta: "See what's coming",
    status: "coming-soon",
    accent: "emerald",
  },
  {
    id: "policy",
    question: "Is it allowed?",
    title: "Policy Codebook",
    description:
      "Understand the rules for AI in health in each country, before you build or launch.",
    highlights: [
      "Explore AI and health tech policies on a world map.",
      "Read each country's key rules, linked to the source.",
      "Search policy documents across countries in one place.",
    ],
    href: "/policy-codebook",
    cta: "See what's coming",
    status: "coming-soon",
    accent: "violet",
  },
];

/** Tailwind classes per accent, matching the domain colors on the home page. */
export const ACCENT_STYLES: Record<
  WorkstreamAccent,
  { icon: string; question: string; dot: string; ring: string }
> = {
  blue: {
    icon: "bg-blue-600 text-white",
    question: "text-blue-600",
    dot: "bg-blue-500",
    ring: "hover:border-blue-300",
  },
  emerald: {
    icon: "bg-emerald-600 text-white",
    question: "text-emerald-600",
    dot: "bg-emerald-500",
    ring: "hover:border-emerald-300",
  },
  violet: {
    icon: "bg-violet-600 text-white",
    question: "text-violet-600",
    dot: "bg-violet-500",
    ring: "hover:border-violet-300",
  },
};
