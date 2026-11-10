/**
 * Works out which practices (subdomains) a question is about, so the
 * library search can look in the right documents first.
 *
 * No AI call: it matches practice names, a few distinctive words and
 * domain names. When nothing matches, it uses the practices the person
 * still has to meet in their current stage, because "what should I do
 * next?" is the most common question.
 */
import { DOMAINS, STAGE_MAPPING, type StageId } from "../roadmap/framework";

type Ctx = {
  currentStage: number;
  stages: { id: number; practices: { name: string; status: string }[] }[];
} | null;

const ALL = DOMAINS.flatMap((d) => d.subdomains);

// Words too general to point at one practice.
const COMMON = new Set([
  "model", "data", "system", "systems", "health", "assessment", "design", "use",
  "long", "term", "time", "action", "change", "outcomes", "outcome", "capacity",
  "integration", "reliability", "oversight", "improvement", "quality", "coverage",
  "clarity", "local", "responsible", "deployment", "infrastructure", "protocol",
  "standards", "effect", "performance", "validation", "mechanism", "business",
  "implementation", "continued", "policy", "financing", "alignment", "financial",
]);

const norm = (s: string) =>
  s.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();

// Distinctive words for each practice, e.g. "bias", "fairness", "privacy".
const KEYWORDS: Record<string, string[]> = Object.fromEntries(
  ALL.map((name) => [
    name,
    norm(name)
      .split(" ")
      .filter((w) => w.length >= 5 && w !== "and" && !COMMON.has(w)),
  ])
);

// A few everyday words people use instead of the practice names.
const EXTRA: Record<string, string[]> = {
  "Bias & Fairness Assessment": ["biased", "unfair", "fair"],
  "Privacy & Security": ["confidential", "consent", "encrypt", "encryption", "breach", "gdpr"],
  "Cross-Population Performance": ["subgroup", "subgroups", "women", "children", "elderly", "populations"],
  "Transparency & Explainability": ["explain", "explainable", "transparent"],
  "Cost-Effectiveness": ["cost", "costs", "economic"],
  "Financial Viability": ["revenue", "funding", "grant", "grants", "money"],
  "Business Model Clarity": ["pricing", "customers", "customer"],
  "Protocol & Safety Monitoring": ["safety", "adverse", "incident", "incidents"],
  "Local Ownership & Capacity": ["ownership", "handover", "training staff"],
  "Data Interoperability & Reuse": ["interoperable", "fhir", "hl7", "standards"],
  "Model Validation & Reliability": ["validate", "validated", "validation"],
  "Accuracy": ["accurate", "sensitivity", "specificity", "error rate"],
};

function mentioned(q: string, words: string[]) {
  return words.some((w) => new RegExp(`(^| )${norm(w)}( |$)`).test(q));
}

export function detectPractices(question: string, ctx: Ctx): string[] | null {
  const q = norm(question);

  // 1. Practice names written out, or their distinctive words.
  const named = ALL.filter((name) => q.includes(norm(name)));
  if (named.length) return named;
  const byWords = ALL.filter((name) => mentioned(q, [...KEYWORDS[name], ...(EXTRA[name] ?? [])]));
  if (byWords.length) return byWords;

  // 2. A domain named ("model deployment", "sustainability").
  const domains = DOMAINS.filter((d) => q.includes(norm(d.name)));
  if (domains.length) return domains.flatMap((d) => d.subdomains);

  // 3. "Stage 3" → that stage's practices.
  const stage = q.match(/stage (\d)/);
  if (stage) {
    const placements = STAGE_MAPPING[Number(stage[1]) as StageId];
    if (placements) return [...new Set(placements.map((p) => p.subdomain))];
  }

  // 4. Default: what's still open in the current stage.
  const current = ctx?.stages.find((s) => s.id === ctx.currentStage);
  const open = current?.practices.filter((p) => p.status !== "Met").map((p) => p.name) ?? [];
  return open.length ? open : null;
}
