// Framework for organizing responsible AI use cases in healthcare, shows each subdomain within the main domains

// src/lib/framework.ts
import { DOMAINS } from "@/lib/roadmap/framework";

/**
 * Legacy shape used by the dashboard page:
 * { "Model Source": ["Governance & Stewardship", ...], ... }
 * Derived from the roadmap framework so there is one source of truth.
 */

export const FRAMEWORK = {
  "Model Source": [
    "Governance & Stewardship",
    "Training Data Quality & Coverage",
    "Timeliness",
    "Data Interoperability & Reuse",
    "Privacy & Security",
    "Data Standards & Metadata",
  ],

  "Model Development": [
    "Accuracy",
    "Model Validation & Reliability",
    "AI System Design",
    "Cross-Population Performance",
    "Bias & Fairness Assessment",
    "Transparency & Explainability",
    "Robustness",
  ],

  "Model Deployment": [
    "Mechanism of Change",
    "System Reliability & Capacity",
    "Protocol & Safety Monitoring",
    "Responsible Use of AI",
    "Deployment Infrastructure & Integration",
    "Implementation Outcomes",
  ],

  Impact: [
    "Outcome Improvement",
    "Time to Action",
    "Equity Effect",
    "Financial Sustainability",
    "Cost-Effectiveness",
    "Continued Oversight",
  ],

  Sustainability: [
    "Financial Viability",
    "Business Model Clarity",
    "Health System Integration",
    "Local Ownership & Capacity",
    "Policy & Financing Alignment",
    "Long-Term Oversight",
  ],
};