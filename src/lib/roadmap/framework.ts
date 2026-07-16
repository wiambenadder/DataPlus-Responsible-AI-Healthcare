/**
 * Roadmap framework configuration.
 *
 * This file is the single editable source of truth for:
 *  - the 5 domains and their subdomains (names copied verbatim from
 *    "Framework — 5 Domains" PPT, which is also how they appear in the
 *    `domain` / `Subtopic` columns in Supabase),
 *  - the 6 roadmap stages,
 *  - which subdomains sit in which stage (taken from the roadmap
 *    structure diagram — some subdomains are intentionally revisited
 *    in a later stage).
 *
 * The scoring rules live in `transform.ts`; nothing here hardcodes a
 * maturity algorithm, so when the final scoring logic lands you only
 * change the transform, not the framework.
 */

export const DOMAIN_IDS = ["D1", "D2", "D3", "D4", "D5"] as const;
export type DomainId = (typeof DOMAIN_IDS)[number];

export interface DomainDef {
  id: DomainId;
  /** Exact value stored in the Supabase `domain` column. */
  name: string;
  /** Tailwind accent classes, matching the PPT / roadmap color language. */
  accent: {
    bg: string;
    border: string;
    text: string;
    dot: string;
  };
  subdomains: string[];
}

export const DOMAINS: DomainDef[] = [
  {
    id: "D1",
    name: "Model Source",
    accent: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-700",
      dot: "bg-blue-500",
    },
    subdomains: [
      "Governance & Stewardship",
      "Training Data Quality & Coverage",
      "Timeliness",
      "Data Interoperability & Reuse",
      "Privacy & Security",
      "Data Standards & Metadata",
    ],
  },
  {
    id: "D2",
    name: "Model Development",
    accent: {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      text: "text-emerald-700",
      dot: "bg-emerald-500",
    },
    subdomains: [
      "Accuracy",
      "Model Validation & Reliability",
      "AI System Design",
      "Cross-Population Performance",
      "Bias & Fairness Assessment",
      "Transparency & Explainability",
      "Robustness",
    ],
  },
  {
    id: "D3",
    name: "Model Deployment",
    accent: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-700",
      dot: "bg-amber-500",
    },
    subdomains: [
      "Mechanism of Change",
      "System Reliability & Capacity",
      "Protocol & Safety Monitoring",
      "Responsible Use of AI",
      "Deployment Infrastructure & Integration",
      "Implementation Outcomes",
    ],
  },
  {
    id: "D4",
    name: "Impact",
    accent: {
      bg: "bg-rose-50",
      border: "border-rose-200",
      text: "text-rose-700",
      dot: "bg-rose-500",
    },
    subdomains: [
      "Outcome Improvement",
      "Time to Action",
      "Equity Effect",
      "Financial Sustainability",
      "Cost-Effectiveness",
      "Continued Oversight",
    ],
  },
  {
    id: "D5",
    name: "Sustainability",
    accent: {
      bg: "bg-violet-50",
      border: "border-violet-200",
      text: "text-violet-700",
      dot: "bg-violet-500",
    },
    subdomains: [
      "Financial Viability",
      "Business Model Clarity",
      "Health System Integration",
      "Local Ownership & Capacity",
      "Policy & Financing Alignment",
      "Long-Term Oversight",
    ],
  },
];

export const STAGE_IDS = [1, 2, 3, 4, 5, 6] as const;
export type StageId = (typeof STAGE_IDS)[number];

export interface StageDef {
  id: StageId;
  name: string;
  description: string;
}

export const STAGES: StageDef[] = [
  {
    id: 1,
    name: "Need & Governance",
    description:
      "Establish the clinical or operational need, governance structures, and the business case before building.",
  },
  {
    id: 2,
    name: "Infrastructure Readiness",
    description:
      "Confirm the data, system design, and fairness groundwork required to develop responsibly.",
  },
  {
    id: 3,
    name: "Prototype & Validation",
    description:
      "Build and validate the model — accuracy, reliability, and performance across populations.",
  },
  {
    id: 4,
    name: "Pilot & User Testing",
    description:
      "Deploy in a controlled setting with safety monitoring, responsible-use guardrails, and real users.",
  },
  {
    id: 5,
    name: "Scale & Integration",
    description:
      "Expand into routine use, integrate with health systems, and demonstrate outcomes at scale.",
  },
  {
    id: 6,
    name: "Oversight & Sustainability",
    description:
      "Sustain the solution long term — financing, policy alignment, equity, and continued oversight.",
  },
];

export interface StagePlacement {
  domainId: DomainId;
  /** Exact subdomain name (matches `Subtopic` / `subtopic` in Supabase). */
  subdomain: string;
  /**
   * True when this subdomain already appeared in an earlier stage and is
   * intentionally revisited here (per the roadmap structure diagram).
   */
  revisited?: boolean;
}

/**
 * Stage → subdomain mapping, transcribed from the roadmap structure
 * diagram (Roadmap Structure — Updated July 06). Edit here if the
 * mapping changes — the UI derives everything from this table.
 */
export const STAGE_MAPPING: Record<StageId, StagePlacement[]> = {
  1: [
    { domainId: "D1", subdomain: "Governance & Stewardship" },
    { domainId: "D1", subdomain: "Privacy & Security" },
    { domainId: "D1", subdomain: "Data Standards & Metadata" },
    { domainId: "D3", subdomain: "Mechanism of Change" },
    { domainId: "D4", subdomain: "Equity Effect" },
    { domainId: "D5", subdomain: "Business Model Clarity" },
  ],
  2: [
    { domainId: "D1", subdomain: "Training Data Quality & Coverage" },
    { domainId: "D1", subdomain: "Timeliness" },
    { domainId: "D1", subdomain: "Data Interoperability & Reuse" },
    { domainId: "D2", subdomain: "AI System Design" },
  ],
  3: [
    { domainId: "D2", subdomain: "Bias & Fairness Assessment" },
    { domainId: "D2", subdomain: "Accuracy" },
    { domainId: "D2", subdomain: "Model Validation & Reliability" },
    { domainId: "D2", subdomain: "Cross-Population Performance" },
    { domainId: "D2", subdomain: "Transparency & Explainability" },
  ],
  4: [
    { domainId: "D2", subdomain: "Robustness" },
    { domainId: "D3", subdomain: "Deployment Infrastructure & Integration" },
    { domainId: "D3", subdomain: "Protocol & Safety Monitoring" },
    { domainId: "D3", subdomain: "Responsible Use of AI" },
    { domainId: "D3", subdomain: "System Reliability & Capacity" },
    { domainId: "D3", subdomain: "Implementation Outcomes" },
    { domainId: "D4", subdomain: "Time to Action" },
  ],
  5: [
    { domainId: "D1", subdomain: "Timeliness", revisited: true },
    { domainId: "D1", subdomain: "Data Interoperability & Reuse", revisited: true },
    { domainId: "D4", subdomain: "Outcome Improvement" },
    { domainId: "D4", subdomain: "Cost-Effectiveness" },
    { domainId: "D5", subdomain: "Health System Integration" },
    { domainId: "D5", subdomain: "Local Ownership & Capacity" },
  ],
  6: [
    { domainId: "D4", subdomain: "Equity Effect", revisited: true },
    { domainId: "D4", subdomain: "Financial Sustainability" },
    { domainId: "D4", subdomain: "Continued Oversight" },
    { domainId: "D5", subdomain: "Financial Viability" },
    { domainId: "D5", subdomain: "Policy & Financing Alignment" },
    { domainId: "D5", subdomain: "Long-Term Oversight" },
  ],
};

/**
 * A stage counts as "ready to advance" when at least this share of its
 * subdomains are Practiced. Provisional — replace when the real scoring
 * rules are finalized.
 */
export const ADVANCE_THRESHOLD = 0.5;

/** Case/whitespace-insensitive key, used to join both Supabase tables. */
export function normKey(domain: string, subdomain: string): string {
  return `${domain.trim().toLowerCase()}::${subdomain.trim().toLowerCase()}`;
}

export function domainById(id: DomainId): DomainDef {
  return DOMAINS.find((d) => d.id === id)!;
}