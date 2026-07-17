// Definitions for each domain of responsible AI use in healthcare, displayed on dashboard

export const DEFINITIONS = [
  // D1 — Model Source
  {
    domain: "Model Source",
    subtopic: "Governance & Stewardship",
    definition:
      "Evidence relating to ownership of training data, governance structures, stewardship, access permissions, documented responsibilities, governance agreements and policies.",
  },
  {
    domain: "Model Source",
    subtopic: "Training Data Quality & Coverage",
    definition:
      "Evidence relating to data quality, completeness, representativeness, cleaning, validation and QA before model training.",
  },
  {
    domain: "Model Source",
    subtopic: "Timeliness",
    definition:
      "Evidence about keeping training data current, review schedules, version control and retirement of outdated data.",
  },
  {
    domain: "Model Source",
    subtopic: "Data Interoperability & Reuse",
    definition:
      "Evidence relating to metadata, discoverability, accessibility, interoperability and reuse.",
  },
  {
    domain: "Model Source",
    subtopic: "Privacy & Security",
    definition:
      "Evidence relating to consent, anonymisation, privacy protection, encryption, security controls and compliance.",
  },
  {
    domain: "Model Source",
    subtopic: "Data Standards & Metadata",
    definition:
      "Evidence relating to recognised standards (FHIR, HL7 etc.) and documented metadata.",
  },

  // D2 — Model Development
  {
    domain: "Model Development",
    subtopic: "Accuracy",
    definition:
      "Evidence about model accuracy metrics and comparison against baselines.",
  },
  {
    domain: "Model Development",
    subtopic: "Model Validation & Reliability",
    definition:
      "Evidence about validation methods and repeatable reliability testing.",
  },
  {
    domain: "Model Development",
    subtopic: "AI System Design",
    definition:
      "Evidence describing system architecture, decision flow, documentation and design rationale.",
  },
  {
    domain: "Model Development",
    subtopic: "Cross-Population Performance",
    definition:
      "Evidence comparing performance across demographic groups or deployment settings.",
  },
  {
    domain: "Model Development",
    subtopic: "Bias & Fairness Assessment",
    definition:
      "Evidence of recurring bias audits and fairness testing.",
  },
  {
    domain: "Model Development",
    subtopic: "Transparency & Explainability",
    definition:
      "Evidence explaining how model outputs are produced and communicated to users.",
  },
  {
    domain: "Model Development",
    subtopic: "Robustness",
    definition:
      "Evidence of stress testing under unusual, noisy or adversarial conditions.",
  },

  // D3 — Model Deployment
  {
    domain: "Model Deployment",
    subtopic: "Mechanism of Change",
    definition:
      "Evidence linking AI outputs to health outcomes through a theory of change.",
  },
  {
    domain: "Model Deployment",
    subtopic: "System Reliability & Capacity",
    definition:
      "Evidence on uptime, latency, scalability and monitoring.",
  },
  {
    domain: "Model Deployment",
    subtopic: "Protocol & Safety Monitoring",
    definition:
      "Evidence of escalation procedures and safety monitoring.",
  },
  {
    domain: "Model Deployment",
    subtopic: "Responsible Use of AI",
    definition:
      "Evidence describing misuse prevention, guardrails and acceptable use.",
  },
  {
    domain: "Model Deployment",
    subtopic: "Deployment Infrastructure & Integration",
    definition:
      "Evidence about integration with national health systems, EHRs or DHIS2.",
  },
  {
    domain: "Model Deployment",
    subtopic: "Implementation Outcomes",
    definition:
      "Evidence tracking implementation and operational use.",
  },

  // D4 — Impact
  {
    domain: "Impact",
    subtopic: "Outcome Improvement",
    definition:
      "Evidence that AI improves measurable health outcomes.",
  },
  {
    domain: "Impact",
    subtopic: "Time to Action",
    definition:
      "Evidence measuring time between recommendation and action.",
  },
  {
    domain: "Impact",
    subtopic: "Equity Effect",
    definition:
      "Evidence comparing outcomes across underserved populations.",
  },
  {
    domain: "Impact",
    subtopic: "Financial Sustainability",
    definition:
      "Evidence describing long-term financial sustainability analyses.",
  },
  {
    domain: "Impact",
    subtopic: "Cost-Effectiveness",
    definition:
      "Evidence comparing costs with alternative approaches.",
  },
  {
    domain: "Impact",
    subtopic: "Continued Oversight",
    definition:
      "Evidence describing governance after deployment.",
  },

  // D5 — Sustainability
  {
    domain: "Sustainability",
    subtopic: "Financial Viability",
    definition:
      "Evidence about long-term financial viability beyond current grants.",
  },
  {
    domain: "Sustainability",
    subtopic: "Business Model Clarity",
    definition:
      "Evidence describing revenue generation or sustainable funding pathways.",
  },
  {
    domain: "Sustainability",
    subtopic: "Health System Integration",
    definition:
      "Evidence showing embedding into routine health-system processes.",
  },
  {
    domain: "Sustainability",
    subtopic: "Local Ownership & Capacity",
    definition:
      "Evidence of local capability to independently operate the system.",
  },
  {
    domain: "Sustainability",
    subtopic: "Policy & Financing Alignment",
    definition:
      "Evidence of inclusion in national policy or financing documents.",
  },
  {
    domain: "Sustainability",
    subtopic: "Long-Term Oversight",
    definition:
      "Evidence identifying who is responsible for oversight in future years.",
  },
];

// Optional helper: look up a definition by domain + subtopic
export function getDefinition(domain: string, subtopic: string): string | undefined {
  return DEFINITIONS.find(
    (d) => d.domain === domain && d.subtopic === subtopic
  )?.definition;
}