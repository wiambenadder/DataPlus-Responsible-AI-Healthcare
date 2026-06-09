// lib/standardization/schema.ts
// ---------------------------------------------------------------------------
// THE STANDARD.
// Every company's data — no matter what their spreadsheet looks like — is
// transformed into a list of these flat records. One row = one indicator,
// for one grantee, at one reporting period. This "tidy/long" shape is what
// makes companies comparable to each other and to their own past reports.
// ---------------------------------------------------------------------------

// The reports a grantee files: at sign-up (baseline), then at fixed intervals.
export type ReportingPeriod =
  | "baseline" // submitted at registration (work plan / theory of change)
  | "3-month"
  | "6-month"
  | "9-month"
  | "12-month";

export const REPORTING_PERIODS: ReportingPeriod[] = [
  "baseline",
  "3-month",
  "6-month",
  "9-month",
  "12-month",
];

// What kind of indicator this is. Drives how it's validated and displayed.
//   project_status -> work-plan progress (activities complete / on track / delayed)
//   output         -> a count of things done (patients reached, algorithms built…)
//   outcome        -> a rate/percentage, often numerator/denominator, or a Y/N flag
//   qualitative    -> free text we keep VERBATIM (challenges, lessons, reasons)
export type IndicatorCategory =
  | "project_status"
  | "output"
  | "outcome"
  | "qualitative";

export type ValueType = "number" | "percent" | "boolean" | "text";

// The 6-domain framework is the funder's guiding lens (Alcade's work).
// We don't have the final list yet, so these are provisional and live in
// ONE place so they can be swapped without touching any data. See the spec.
export type DomainId =
  | "reach_service_delivery"
  | "health_outcomes"
  | "data_ai_systems"
  | "workforce_training"
  | "infrastructure_points_of_care"
  | "partnerships_community_knowledge"
  | "project_management"; // work-plan progress lives here

export interface Domain {
  id: DomainId;
  label: string;
  description: string;
}

export const DOMAINS: Domain[] = [
  {
    id: "reach_service_delivery",
    label: "Reach & Service Delivery",
    description: "Patients and populations reached with direct healthcare services.",
  },
  {
    id: "health_outcomes",
    label: "Health Outcomes",
    description: "Rates and changes in health outcomes (vaccination, screening, treatment).",
  },
  {
    id: "data_ai_systems",
    label: "Data & AI Systems",
    description: "AI models, data collected, governance, security, and accuracy work.",
  },
  {
    id: "workforce_training",
    label: "Workforce & Training",
    description: "Health workers trained and support materials produced.",
  },
  {
    id: "infrastructure_points_of_care",
    label: "Infrastructure & Points of Care",
    description: "Facilities and points of care established or strengthened.",
  },
  {
    id: "partnerships_community_knowledge",
    label: "Partnerships, Community & Knowledge",
    description: "Partnerships formed, community awareness, and knowledge products.",
  },
  {
    id: "project_management",
    label: "Project Management",
    description: "Work-plan progress: activities completed, on schedule, or delayed.",
  },
];

// ---------------------------------------------------------------------------
// The single record type everything produces and consumes.
// ---------------------------------------------------------------------------
export interface StandardizedRecord {
  grantee: string;
  period: ReportingPeriod;
  indicatorId: string; // canonical id from the catalog
  indicatorLabel: string; // human-readable label
  domain: DomainId;
  category: IndicatorCategory;
  valueType: ValueType;

  // The value, typed by valueType. null means "blank in the source".
  value: number | string | boolean | null;

  // Outcome indicators often carry the raw fraction behind a percentage.
  numerator?: number | null;
  denominator?: number | null;

  // CRITICAL distinction (see spec): did this indicator APPLY to this grantee?
  // Not every indicator applies to every company (the "GHIG10" problem).
  //   applies = false  ->  intentionally not measured; excludes it from
  //                        aggregates and never shows as a "missing data" flag.
  //   applies = true, value = null  ->  applies but not yet reported -> Step 4
  //                        (validation) will ask for it.
  applies: boolean;

  unit?: string;

  // Where this value came from, for traceability/audit.
  source: {
    file?: string;
    sheet?: string;
    cell?: string; // e.g. "Aggregate Outputs!M14"
  };
}

// A column header in the source that we could NOT confidently map to a
// catalog indicator. Surfaced to the user so they can map it (or an AI
// assistant can suggest a mapping). Standardisation never silently drops data.
export interface UnmappedColumn {
  sheet: string;
  header: string;
  sampleValues: (string | number | null)[];
}

export interface StandardizationResult {
  records: StandardizedRecord[];
  unmapped: UnmappedColumn[];
  grantees: string[];
  periodsFound: ReportingPeriod[];
  warnings: string[];
}
