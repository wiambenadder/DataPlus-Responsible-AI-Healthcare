import { DOMAINS } from "@/lib/roadmap/framework";

/**
 * We keep this simple shape for the Results page:
 * { "Model Source": ["Governance & Stewardship", ...], ... }
 * It is built from the roadmap framework, so the practices are only
 * listed in one place.
 */
export const FRAMEWORK: Record<string, string[]> = Object.fromEntries(
  DOMAINS.map((d) => [d.name, d.subdomains]),
);
