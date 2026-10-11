/**
 * The three tools shown on the All Tools page (/hub) and on each codebook's
 * page.
 *
 * Edit this file to change a card's text, link, photo or status — no
 * component changes needed. When a codebook goes live, point `href` at its
 * real route and set `status` to "live".
 */
import type { PhotoKey } from "./photos";

export type WorkstreamStatus = "live" | "coming-soon";

export type Workstream = {
  id: "ai-readiness" | "financing" | "policy";
  title: string;
  /** One sentence under the title. */
  description: string;
  /** Longer introduction for the tool's own page. */
  intro: string;
  highlights: string[];
  /** "What you will be able to do" on the tool's own page. */
  features: { title: string; text: string }[];
  href: string;
  cta: string;
  status: WorkstreamStatus;
  photo: PhotoKey;
  /** Accent colour (Duke palette) for the card's top rule. */
  accent: string;
};

export const WORKSTREAMS: Workstream[] = [
  {
    id: "ai-readiness",
    title: "AI Readiness Assessment",
    description:
      "See how ready your AI tool is for real-world care, and what to strengthen next.",
    intro:
      "Upload the reports you already have, answer a few questions, and see how your tool measures up against 31 practices, each with the evidence behind its rating.",
    highlights: [
      "Upload existing reports and answer a few questions",
      "31 practices rated, each with its evidence",
      "A six-stage roadmap of next steps",
    ],
    features: [],
    href: "/report/assessment",
    cta: "Start the Assessment",
    status: "live",
    photo: "aiReadiness",
    accent: "#0577B1",
  },
  {
    id: "financing",
    title: "Financing Codebook",
    description:
      "How AI health tools are funded, and whether they last beyond the first grant.",
    intro:
      "The Financing Codebook will show how AI health tools are funded over time, and how close each is to paying its own way once the first grants end.",
    highlights: [
      "Who funded each tool, and at which stage",
      "How much a tool depends on grants",
      "Funders matched to innovators",
    ],
    features: [
      {
        title: "Follow the funding",
        text: "Who funded each tool, how much, and at which stage of its development.",
      },
      {
        title: "Measure grant dependence",
        text: "How much a tool relies on grants compared with revenue or government contracts.",
      },
      {
        title: "Find the right funders",
        text: "Funders matched to innovators by stage, region and focus area.",
      },
    ],
    href: "/financing-codebook",
    cta: "Learn More",
    status: "coming-soon",
    photo: "financing",
    accent: "#1D6363",
  },
  {
    id: "policy",
    title: "Policy Codebook",
    description:
      "The rules for AI in health in each country, before you build or launch.",
    intro:
      "The Policy Codebook will show the rules for AI in health in each country, including national AI strategies, medical software regulation and data protection laws, linked to the official documents.",
    highlights: [
      "AI and health policies on a world map",
      "Key rules for each country, with sources",
      "Search documents across countries",
    ],
    features: [
      {
        title: "Explore a world map",
        text: "See which countries have AI and health technology policies, at a glance.",
      },
      {
        title: "Read each country's rules",
        text: "Five key questions per country, each linked to the passage in the official document.",
      },
      {
        title: "Search across countries",
        text: "Filter documents by topic, region and how binding they are.",
      },
    ],
    href: "/policy-codebook",
    cta: "Learn More",
    status: "coming-soon",
    photo: "policy",
    accent: "#993399",
  },
];
