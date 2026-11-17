import { statusFromRating } from "../assessment";
import {
  ADVANCE_THRESHOLD,
  STAGES,
  STAGE_MAPPING,
  domainById,
  normKey,
} from "./framework";
import type { StageId } from "./framework";
import type {
  AssessmentDetail,
  DomainMappingRow,
  EvidenceItem,
  QualitativeResponseRow,
  RoadmapDomainGroup,
  RoadmapModel,
  RoadmapStage,
  RoadmapSubdomain,
  SubdomainStatus,
} from "./types";

/** Older assessment tables may have a reporting period but no row timestamp. */
export function orderAssessmentResponses<T extends QualitativeResponseRow>(rows: T[]): T[] {
  return [...rows].sort((a, b) =>
    (Date.parse(a.created_at ?? "") || 0) - (Date.parse(b.created_at ?? "") || 0)
  );
}

export function latestAssessmentPeriod(rows: QualitativeResponseRow[]): string | null {
  const assessed = rows.filter((row) => row.domain && row.Subtopic && row.reporting_period);
  const dated = assessed.findLast((row) => Number.isFinite(Date.parse(row.created_at ?? "")));
  if (dated) return dated.reporting_period;

  const periods = [...new Set(assessed.flatMap((row) => row.reporting_period ? [row.reporting_period] : []))];
  const datedPeriods = periods.map((period) => {
    const quarter = /^Q([1-4])\s+(\d{4})$/i.exec(period.trim());
    const time = quarter ? Date.UTC(Number(quarter[2]), Number(quarter[1]) * 3, 0) : Date.parse(period);
    return { period, time };
  });
  if (datedPeriods.every(({ time }) => Number.isFinite(time))) {
    return datedPeriods.sort((a, b) => b.time - a.time)[0]?.period ?? null;
  }
  return assessed.at(-1)?.reporting_period ?? null;
}

/** Map the free-text `ai_assessment` value to a typed status. */
function parseStatus(value: string | null | undefined): SubdomainStatus {
  switch (statusFromRating(value)) {
    case "meets": return "practiced";
    case "not_met": return "not_practiced";
    default: return "under_review";
  }
}

/**
 * Build the full roadmap view model for one company.
 *
 * Joining strategy: both tables are keyed on (company_id, domain,
 * subdomain name). `qualitative_responses` uses `Subtopic` and
 * `domain_mapping` uses `subtopic`, and casing/whitespace of the values
 * is not guaranteed, so everything is joined through `normKey()`.
 *
 * `reportingPeriod` (optional): when provided, only responses from that
 * period drive the status; other periods remain visible in the detail
 * panel. When omitted, the last row returned per subdomain drives the
 * status (add an `order by created_at` in the query once that column is
 * exposed, so "last" means "latest").
 */
export function buildRoadmapModel(
  companyId: string,
  responses: QualitativeResponseRow[],
  mappings: DomainMappingRow[],
  reportingPeriod?: string | null,
): RoadmapModel {
  /* Index responses by normalized (domain, subdomain). */
  const responsesByKey = new Map<string, QualitativeResponseRow[]>();
  const periods = new Set<string>();

  for (const row of responses) {
    if (!row.domain || !row.Subtopic) continue;
    if (row.reporting_period) periods.add(row.reporting_period);
    const key = normKey(row.domain, row.Subtopic);
    const list = responsesByKey.get(key) ?? [];
    list.push(row);
    responsesByKey.set(key, list);
  }

  /* Index evidence by normalized (domain, subdomain). */
  const evidenceByKey = new Map<string, DomainMappingRow[]>();
  for (const row of mappings) {
    if (!row.domain || !row.subtopic) continue;
    const key = normKey(row.domain, row.subtopic);
    const list = evidenceByKey.get(key) ?? [];
    list.push(row);
    evidenceByKey.set(key, list);
  }

  /* Cache subdomain models so a revisited subdomain (e.g. Timeliness in
     Stage 2 and Stage 5) reflects the same data in both stages. */
  const subdomainCache = new Map<string, Omit<RoadmapSubdomain, "revisited">>();

  function buildSubdomain(domainId: RoadmapSubdomain["domainId"], name: string) {
    const domain = domainById(domainId);
    const key = normKey(domain.name, name);
    const cached = subdomainCache.get(key);
    if (cached) return cached;

    const rows = responsesByKey.get(key) ?? [];

    const assessments: AssessmentDetail[] = rows.map((r) => ({
      responseId: r.id,
      status: parseStatus(r.ai_assessment),
      reasoning: r.ai_reasoning,
      answer: r.answer,
      question: r.question,
      reportingPeriod: r.reporting_period,
      bulletSummary: r.bullet_point_summary,
    }));

    /* Rows in the selected period (or all rows) decide the status. */
    const scoped = reportingPeriod
      ? assessments.filter((a) => a.reportingPeriod === reportingPeriod)
      : assessments;
    const driver = scoped.length > 0 ? scoped[scoped.length - 1] : undefined;

    const evidence: EvidenceItem[] = (evidenceByKey.get(key) ?? [])
      .map((m) => ({
        mappingId: m.id,
        quote: m.source_quotes,
        sourcePdf: m.source_pdf,
        confidence: m.confidence,
        uploadId: m.upload_id,
      }))
      .sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0));

    const model = {
      domainId,
      domainName: domain.name,
      name,
      status: driver ? driver.status : ("no_data" as SubdomainStatus),
      assessments,
      evidence,
    };
    subdomainCache.set(key, model);
    return model;
  }

  /* Assemble stages from the mapping table. */
  const stages: RoadmapStage[] = STAGES.map((stageDef) => {
    const placements = STAGE_MAPPING[stageDef.id];

    /* Group placements by domain, preserving domain order D1..D5. */
    const groups = new Map<string, RoadmapDomainGroup>();
    for (const placement of placements) {
      const base = buildSubdomain(placement.domainId, placement.subdomain);
      const sub: RoadmapSubdomain = { ...base, revisited: !!placement.revisited };
      const g = groups.get(placement.domainId) ?? {
        domainId: placement.domainId,
        domainName: domainById(placement.domainId).name,
        subdomains: [],
      };
      g.subdomains.push(sub);
      groups.set(placement.domainId, g);
    }
    const domainGroups = [...groups.values()].sort((a, b) =>
      a.domainId.localeCompare(b.domainId),
    );

    const all = domainGroups.flatMap((g) => g.subdomains);
    const practicedCount = all.filter((s) => s.status === "practiced").length;
    const assessedCount = all.filter((s) => s.status !== "no_data").length;
    const totalCount = all.length;
    const score = totalCount > 0 ? practicedCount / totalCount : 0;

    const state: RoadmapStage["state"] =
      practicedCount === totalCount && totalCount > 0
        ? "complete"
        : assessedCount > 0
          ? "in_progress"
          : "not_started";

    return {
      id: stageDef.id,
      name: stageDef.name,
      description: stageDef.description,
      score,
      practicedCount,
      totalCount,
      state,
      canAdvance: score >= ADVANCE_THRESHOLD,
      domainGroups,
    };
  });

  const currentStageId = (stages.find((s) => s.state !== "complete")?.id ??
    6) as StageId;


  return {
    companyId,
    stages,
    currentStageId,
    overall: uniquePracticeCounts(stages),
    reportingPeriods: [...periods].sort(),
  };
}


/** The overall score counts each practice once, even when a later stage revisits it. */
export function uniquePracticeCounts(stages: RoadmapStage[]): RoadmapModel["overall"] {
  const unique = new Map<string, SubdomainStatus>();
  for (const stage of stages) {
    for (const group of stage.domainGroups) {
      for (const practice of group.subdomains) {
        unique.set(normKey(practice.domainName, practice.name), practice.status);
      }
    }
  }
  return { practiced: [...unique.values()].filter((status) => status === "practiced").length, total: unique.size };
}
