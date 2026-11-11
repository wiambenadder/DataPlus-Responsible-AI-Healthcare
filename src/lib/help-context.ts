/**
 * Turns a company's roadmap into the summary the Roadmap Assistant gets
 * with each question. Shared by the Roadmap page and the overview, so the
 * assistant knows the same things in both places.
 */
import type { HelpContext } from "./help-guide";
import { ADVANCE_THRESHOLD } from "./roadmap/framework";
import type { RoadmapModel, SubdomainStatus } from "./roadmap/types";

const STATUS_WORDS: Record<SubdomainStatus, string> = {
  practiced: "Met",
  not_practiced: "Not met yet",
  no_data: "No evidence yet",
  under_review: "Under review",
};

export function helpContextFromModel(model: RoadmapModel, company: string | null): HelpContext {
  return {
    company,
    currentStage: model.currentStageId,
    overall: { met: model.overall.practiced, total: model.overall.total },
    stages: model.stages.map((s) => ({
      id: s.id,
      name: s.name,
      practiced: s.practicedCount,
      total: s.totalCount,
      needed: Math.ceil(s.totalCount * ADVANCE_THRESHOLD),
      state: s.state.replace("_", " "),
      practices: s.domainGroups.flatMap((g) =>
        g.subdomains.map((p) => ({ name: p.name, domain: p.domainName, status: STATUS_WORDS[p.status] }))
      ),
    })),
  };
}
