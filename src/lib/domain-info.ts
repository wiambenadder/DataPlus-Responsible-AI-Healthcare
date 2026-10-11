/**
 * Plain-language descriptions of the five domains, shown on the framework
 * page, the dashboard and the home page. Innovators said "Model Source"
 * in particular was unclear, so each one says what it covers in everyday
 * words.
 */
export const DOMAIN_INFO: Record<string, { short: string; long: string }> = {
  "Model Source": {
    short: "The data your model learns from: who owns it, its quality, and how it's protected.",
    long: "Model Source is about the data behind your AI, not the model itself. It asks who owns and governs the training data, whether it is good enough and current enough to learn from, whether it follows recognized data standards, whether others could reuse it appropriately, and how privacy and security are protected.",
  },
  "Model Development": {
    short: "How the model is built, tested and checked for bias.",
    long: "Model Development covers how the AI system is designed and tested: how accurate and reliable it is, whether it performs equally well for different groups of people, whether bias has been assessed, how explainable its outputs are, and how it copes with messy or unusual input.",
  },
  "Model Deployment": {
    short: "How the tool runs in real settings and is kept safe.",
    long: "Model Deployment looks at the tool in use: how it is expected to change care, the infrastructure it runs on and connects to, whether it is reliable at scale, how safety is monitored, how responsible use is ensured, and what happened when it was put into practice.",
  },
  Impact: {
    short: "What changes for patients and health systems, and at what cost.",
    long: "Impact asks for evidence that the tool makes a difference: better health outcomes, faster action on its recommendations, fair benefits for underserved groups, the financial picture and cost-effectiveness, and continued oversight after deployment.",
  },
  Sustainability: {
    short: "Whether the tool can be funded, owned and overseen for the long term.",
    long: "Sustainability is about the tool's future: a viable financial and business model, integration into routine health-system processes, local ownership and capacity to run it, alignment with national policy and financing, and who will oversee it in the years ahead.",
  },
};

/**
 * What "Meets criterion" means today. This mirrors the rules in the
 * rating step (src/app/api/run-ai-assessment/route.ts) — update both
 * together.
 */
export const MEETS_RULE = {
  summary:
    "A practice counts as met when your documents or answers describe something that is actually in place for it: a process, policy, team, responsibility, workflow, metric or regular activity.",
  counts: [
    "Informal or early-stage practices",
    "Practices that aren't measured yet",
    "Practices you describe as incomplete or limited",
  ],
  doesNotCount: [
    "Plans or intentions that haven't started",
    "Awareness of an issue without action on it",
    "Evidence that is unclear; the platform then does not count the practice as met",
  ],
};

/**
 * Duke secondary colours for the five domains. `accent` is for rules and
 * bars; `text` is a darker shade that passes contrast on white. `tagline`
 * is a short description for compact cards.
 */
export const DOMAIN_STYLE: Record<string, { accent: string; text: string; tagline: string }> = {
  "Model Source": { accent: "#0577B1", text: "#00539B", tagline: "The data your model learns from" },
  "Model Development": { accent: "#339898", text: "#1D6363", tagline: "How it is built and tested" },
  "Model Deployment": { accent: "#E89923", text: "#8a5300", tagline: "How it runs safely in care" },
  Impact: { accent: "#C84E00", text: "#a03f00", tagline: "What changes, and at what cost" },
  Sustainability: { accent: "#993399", text: "#7a2a7a", tagline: "Whether it can last" },
};

export function domainStyle(name: string) {
  return DOMAIN_STYLE[name] ?? { accent: "#012169", text: "#012169", tagline: "" };
}
