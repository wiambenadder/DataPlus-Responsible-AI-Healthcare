import type { DomainId, StageId } from "./framework";
import type { SubdomainStatus } from "./types";
import type { Source } from "@/lib/library/search";

export type RecommendationPractice = {
  id: string;
  name: string;
  domainId: DomainId;
  stage: StageId;
  status: Exclude<SubdomainStatus, "practiced">;
  criterion: string | null;
};

export type RecommendationOverview = {
  snapshot: string;
  company: string | null;
  period: string | null;
  hasAssessment: boolean;
  metCount: number;
  practices: RecommendationPractice[];
};

export type RecommendationResult =
  | { kind: "generated"; action: string; evidence: string; sources: Source[] }
  | { kind: "reading"; sources: Source[] }
  | { kind: "no_sources" | "unavailable" };

export type RecommendationPriority = { title: string; description: string };

export function needsRecommendation(practice: RecommendationPractice) {
  return practice.status === "not_practiced";
}
