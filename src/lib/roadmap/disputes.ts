import type { StageId } from "./framework";
import type { RoadmapModel, RoadmapStage } from "./types";

/**
 * Practices someone reported as resting on the wrong source or company
 * (see src/lib/disputes.ts) are shown as "Under review" and not counted as
 * met until the report is resolved — the same rule as the home and results
 * pages. Recomputes stage counts, states and the current stage.
 */
export function applyDisputes(model: RoadmapModel, disputed: Set<string>): RoadmapModel {
  if (disputed.size === 0) return model;

  const stages: RoadmapStage[] = model.stages.map((stage) => {
    const domainGroups = stage.domainGroups.map((g) => ({
      ...g,
      subdomains: g.subdomains.map((s) =>
        s.status === "practiced" && disputed.has(s.name.trim().toLowerCase())
          ? { ...s, status: "under_review" as const }
          : s
      ),
    }));
    const all = domainGroups.flatMap((g) => g.subdomains);
    const practicedCount = all.filter((s) => s.status === "practiced").length;
    const assessedCount = all.filter((s) => s.status !== "no_data").length;
    const totalCount = all.length;
    const score = totalCount ? practicedCount / totalCount : 0;
    return {
      ...stage,
      domainGroups,
      practicedCount,
      score,
      canAdvance: stage.canAdvance && score >= 0.5,
      state:
        practicedCount === totalCount && totalCount > 0
          ? "complete"
          : assessedCount > 0
            ? "in_progress"
            : "not_started",
    };
  });

  return {
    ...model,
    stages,
    currentStageId: (stages.find((s) => s.state !== "complete")?.id ?? 6) as StageId,
    overall: {
      practiced: stages.reduce((n, s) => n + s.practicedCount, 0),
      total: model.overall.total,
    },
  };
}
