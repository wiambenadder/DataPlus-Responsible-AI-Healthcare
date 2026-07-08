import type { DomainId, StageId } from "./framework";

/* ------------------------------------------------------------------ */
/* Supabase row shapes (match the exported CSV columns exactly)        */
/* ------------------------------------------------------------------ */

/** Row in `qualitative_responses`. NOTE: `Subtopic` is capitalized in this table. */
export interface QualitativeResponseRow {
  id: string;
  company_id: string;
  question: string | null;
  answer: string | null;
  domain: string | null;
  Subtopic: string | null;
  ai_assessment: string | null; // "Practiced" | "Not Practiced" (free text in DB)
  ai_reasoning: string | null;
  reporting_period: string | null;
  bullet_point_summary: string | null;
}

/** Row in `domain_mapping`. NOTE: `subtopic` is lowercase in this table. */
export interface DomainMappingRow {
  id: number;
  domain: string | null;
  subtopic: string | null;
  source_quotes: string | null;
  source_pdf: string | null;
  confidence: number | null;
  upload_id: string | null;
  company_id: string | null;
}

/* ------------------------------------------------------------------ */
/* UI view model                                                       */
/* ------------------------------------------------------------------ */

export type SubdomainStatus = "practiced" | "not_practiced" | "no_data";

/** One assessment record shown inside the detail panel. */
export interface AssessmentDetail {
  responseId: string;
  status: SubdomainStatus;
  reasoning: string | null;
  answer: string | null;
  question: string | null;
  reportingPeriod: string | null;
  bulletSummary: string | null;
}

/** One source-traceability record from `domain_mapping`. */
export interface EvidenceItem {
  mappingId: number;
  quote: string | null;
  sourcePdf: string | null;
  confidence: number | null; // 0..1
  uploadId: string | null;
}

/** A subdomain as it appears inside one stage column. */
export interface RoadmapSubdomain {
  domainId: DomainId;
  domainName: string;
  name: string;
  status: SubdomainStatus;
  revisited: boolean;
  /** All assessments for this (company, domain, subdomain), newest-style first. */
  assessments: AssessmentDetail[];
  /** Source quotes / documents backing this subdomain. */
  evidence: EvidenceItem[];
}

export interface RoadmapDomainGroup {
  domainId: DomainId;
  domainName: string;
  subdomains: RoadmapSubdomain[];
}

export type StageState = "complete" | "in_progress" | "not_started";

export interface RoadmapStage {
  id: StageId;
  name: string;
  description: string;
  /** Practiced placements / total placements in this stage (0..1). */
  score: number;
  practicedCount: number;
  totalCount: number;
  state: StageState;
  /** Provisional: score >= ADVANCE_THRESHOLD even if not complete. */
  canAdvance: boolean;
  domainGroups: RoadmapDomainGroup[];
}

export interface RoadmapModel {
  companyId: string;
  stages: RoadmapStage[];
  /** First stage that is not complete — highlighted as "current". */
  currentStageId: StageId;
  overall: { practiced: number; total: number };
  /** Reporting periods found for this company, for the period filter. */
  reportingPeriods: string[];
}
