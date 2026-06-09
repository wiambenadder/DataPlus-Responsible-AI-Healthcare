// lib/standardization/catalog.ts
// ---------------------------------------------------------------------------
// THE EDITABLE STANDARD ("changeable metrics" from the backend notes).
//
// This is the ONLY file you edit when metrics change between cohorts
// (GHIG9 -> GHIG10 -> ...). Add, remove, or re-domain an indicator here and
// the engine, the views, and the exports all follow automatically. No data
// shape changes, because every value still becomes a StandardizedRecord.
//
// Matching strategy (deterministic, no AI needed for the prototype):
//   A source column header is matched to an indicator if its normalized form
//   equals the indicator's normalized label OR any of its normalized aliases.
//   Aliases exist only where a source uses a different name than the label
//   (e.g. the summary tab's "New Points of Care" vs the long official name,
//   or the typo "On schdule").
// ---------------------------------------------------------------------------

import { normalizeHeader } from "./normalize";
import type {
  DomainId,
  IndicatorCategory,
  ValueType,
} from "./schema";

export interface CatalogIndicator {
  id: string;
  label: string;
  domain: DomainId;
  category: IndicatorCategory;
  valueType: ValueType;
  unit?: string;
  aliases?: string[];
}

export const INDICATOR_CATALOG: CatalogIndicator[] = [
  // ---- Project management / work-plan status -----------------------------
  { id: "activities_total", label: "Total activities in work plan", domain: "project_management", category: "project_status", valueType: "number", aliases: ["Total", "Total activities in work plans"] },
  { id: "activities_complete", label: "Total activities completed", domain: "project_management", category: "project_status", valueType: "number", aliases: ["Complete"] },
  { id: "activities_on_schedule", label: "Total activities on schedule", domain: "project_management", category: "project_status", valueType: "number", aliases: ["On schedule", "On schdule"] },
  { id: "activities_delayed", label: "Total activities delayed", domain: "project_management", category: "project_status", valueType: "number", aliases: ["Delayed"] },
  { id: "reason_for_delay", label: "Reason for Delay", domain: "project_management", category: "qualitative", valueType: "text" },
  { id: "plan_for_completion", label: "Plan for completion or course correction", domain: "project_management", category: "qualitative", valueType: "text" },
  { id: "estimated_completion_date", label: "Estimated completion date for course correction", domain: "project_management", category: "qualitative", valueType: "text" },

  // ---- Infrastructure & points of care -----------------------------------
  { id: "new_points_of_care", label: "Number of new points of care established", domain: "infrastructure_points_of_care", category: "output", valueType: "number", aliases: ["New Points of Care"] },
  { id: "new_care_decision_pathways", label: "Number of new care decision pathway established", domain: "infrastructure_points_of_care", category: "output", valueType: "number" },
  { id: "new_resource_allocation_pathways", label: "Number of pathways for new resource allocation established", domain: "infrastructure_points_of_care", category: "output", valueType: "number" },
  { id: "new_healthcare_access_points", label: "Number of new healthcare access point established", domain: "infrastructure_points_of_care", category: "output", valueType: "number" },
  { id: "points_of_care_expanded", label: "Number of existing points of care with expanded services", domain: "infrastructure_points_of_care", category: "output", valueType: "number" },
  { id: "facilities_strengthened", label: "Total number of facilities strengthened", domain: "infrastructure_points_of_care", category: "output", valueType: "number", aliases: ["Points of care strengthened"] },
  { id: "poc_with_ai_platform", label: "Number of points of care with the AI technology platform implemented", domain: "infrastructure_points_of_care", category: "output", valueType: "number" },
  { id: "poc_updated_immunization", label: "Number of points of care with new/updated immunization micro-plans", domain: "infrastructure_points_of_care", category: "output", valueType: "number" },
  { id: "poc_updated_clinical", label: "Number of points of care with new/updated clinical practice protocols", domain: "infrastructure_points_of_care", category: "output", valueType: "number" },
  { id: "poc_updated_lab", label: "Number of points of care with new/updated laboratory protocols", domain: "infrastructure_points_of_care", category: "output", valueType: "number" },
  { id: "facilities_updated_supply_chain", label: "Number of facilities with new/updated supply chain management procedures", domain: "infrastructure_points_of_care", category: "output", valueType: "number" },

  // ---- Reach (geographies) ------------------------------------------------
  { id: "subnational_geographies", label: "Total number of sub-national geographies operating in through GHIG9 project", domain: "reach_service_delivery", category: "output", valueType: "number", aliases: ["Subnational areas", "Total number of sub-national geographies (districts/states/provinces) operating in through GHIG9 project"] },
  { id: "areas_total", label: "Total number of urban, peri-urban, and/ or rural areas operating in through GHIG9 project", domain: "reach_service_delivery", category: "output", valueType: "number", aliases: ["Urban, peri-urban and rural areas reached"] },
  { id: "urban_areas", label: "Number of urban areas operating in through GHIG9 project", domain: "reach_service_delivery", category: "output", valueType: "number" },
  { id: "periurban_areas", label: "Number of peri-urban areas operating in through GHIG9 project", domain: "reach_service_delivery", category: "output", valueType: "number" },
  { id: "rural_areas", label: "Number of rural areas operating in through GHIG9 project", domain: "reach_service_delivery", category: "output", valueType: "number" },

  // ---- Data & AI systems --------------------------------------------------
  { id: "data_collected", label: "Number of new data collected/acquired", domain: "data_ai_systems", category: "output", valueType: "number", aliases: ["Points of data collected or acquired"] },
  { id: "ai_algorithms_created", label: "Number of new AI algorithms created", domain: "data_ai_systems", category: "output", valueType: "number", aliases: ["Ai algorithms created"] },
  { id: "ai_solutions_integrated", label: "Number of AI solutions integrated to the product", domain: "data_ai_systems", category: "output", valueType: "number" },
  { id: "ai_trainings", label: "Number of trainings/fine tunings of the AI tool conducted", domain: "data_ai_systems", category: "output", valueType: "number" },
  { id: "cloud_structures", label: "Number of new cloud/local structure established for data base management or AI deployment", domain: "data_ai_systems", category: "output", valueType: "number" },
  { id: "data_governance_policies", label: "Number of data governance policies established for data sources", domain: "data_ai_systems", category: "output", valueType: "number" },
  { id: "security_measures", label: "Number of security measures established for data protections", domain: "data_ai_systems", category: "output", valueType: "number" },
  { id: "ai_accuracy_safeguards", label: "Number of safeguards for AI accuracy established", domain: "data_ai_systems", category: "output", valueType: "number" },
  { id: "ai_accuracy_improvements", label: "Number of AI accuracy improvements deployed", domain: "data_ai_systems", category: "output", valueType: "number" },
  { id: "ai_evaluations", label: "Number of AI implementation evaluations conducted", domain: "data_ai_systems", category: "output", valueType: "number" },

  // ---- Partnerships, community & knowledge --------------------------------
  { id: "partnerships_total", label: "Total number of new partnerships formed (including any partnerships with points of care)", domain: "partnerships_community_knowledge", category: "output", valueType: "number" },
  { id: "partnerships_poc", label: "Number of new partnerships formed with points of care", domain: "partnerships_community_knowledge", category: "output", valueType: "number", aliases: ["Number of new partnerships formed with points of care (for innovators who do not operate their own facilities or points of care)"] },
  { id: "awareness_campaigns", label: "Number of community awareness /education campaigns", domain: "partnerships_community_knowledge", category: "output", valueType: "number" },
  { id: "campaign_individuals_reached", label: "Number of individuals reached through community awareness /education campaigns", domain: "partnerships_community_knowledge", category: "output", valueType: "number", aliases: ["Individuals educated through community awareness"] },
  { id: "patients_educated_visits", label: "Number of patients educated during patient visits on prevention and care", domain: "partnerships_community_knowledge", category: "output", valueType: "number", aliases: ["Patients educated through community awareness"] },
  { id: "individuals_reached_other", label: "Number of individuals reached through other community awareness and education efforts", domain: "partnerships_community_knowledge", category: "output", valueType: "number" },
  { id: "research_publications", label: "Number of research publications, white papers, toolkits, policy papers, position papers, briefings, and other knowledge products supported by GHIG9 project", domain: "partnerships_community_knowledge", category: "output", valueType: "number" },

  // ---- Reach & service delivery (patients) --------------------------------
  { id: "catchment_population", label: "Number of people in catchment areas with access to GHIG-affiliated points of care", domain: "reach_service_delivery", category: "output", valueType: "number", aliases: ["People in catchment areas with access to GHIG-affiliated points of care", "People acessing GHIG-affiliated points of care"] },
  { id: "patients_reached_total", label: "Total number of patients reached with direct healthcare services for target diseases area", domain: "reach_service_delivery", category: "output", valueType: "number", aliases: ["Patients with direct healthcare services"] },
  { id: "patients_reached_female", label: "Number of FEMALE patients reached with direct healthcare services for your target diseases area", domain: "reach_service_delivery", category: "output", valueType: "number" },
  { id: "patients_reached_male", label: "Number of MALE patients reached with direct healthcare services for your target diseases area", domain: "reach_service_delivery", category: "output", valueType: "number" },
  { id: "patients_low_income", label: "Total number of patients from LOW-INCOME HOUSEHOLDS reached with direct healthcare services for your target diseases area", domain: "reach_service_delivery", category: "output", valueType: "number" },
  { id: "patients_marginalized", label: "Total number of patients from MARGINALIZED COMMUNITIES reached with direct healthcare services for your target diseases area", domain: "reach_service_delivery", category: "output", valueType: "number" },
  { id: "children_u5_reached", label: "Total number of Children Under 5 years reached with direct healthcare services", domain: "reach_service_delivery", category: "output", valueType: "number", aliases: ["Children under 5 with direct healthcare services"] },

  // ---- Workforce & training ----------------------------------------------
  { id: "health_workers_trained_total", label: "Total number of health workers trained", domain: "workforce_training", category: "output", valueType: "number", aliases: ["Staff members trained"] },
  { id: "clinical_workers_trained", label: "Total number of unique clinical workers trained", domain: "workforce_training", category: "output", valueType: "number" },
  { id: "nonclinical_workers_trained", label: "Total number of unique non-clinical workers trained", domain: "workforce_training", category: "output", valueType: "number" },
  { id: "workers_trained_ai", label: "Number of healthcare workers trained in AI platforms, tools, or technology", domain: "workforce_training", category: "output", valueType: "number" },
  { id: "job_aids_created", label: "Number of job aids, health worker education materials, or other support materials for staff created", domain: "workforce_training", category: "output", valueType: "number" },

  // ---- Vaccinations -------------------------------------------------------
  { id: "vaccinations_total", label: "Total number of individuals receiving vaccinations (all sexes and ages)", domain: "health_outcomes", category: "output", valueType: "number", aliases: ["Individuals receiving vaccinations"] },

  // ---- Outcomes (rates / Y-N) --------------------------------------------
  { id: "pct_workers_trained", label: "Percent of health and lab workers trained", domain: "workforce_training", category: "outcome", valueType: "percent", unit: "%" },
  { id: "pct_workers_improved_knowledge", label: "Percent of healthcare workers with improved knowledge", domain: "health_outcomes", category: "outcome", valueType: "percent", unit: "%" },
  { id: "pct_people_accessing_ai", label: "Percentage of people accessing the AI tool", domain: "data_ai_systems", category: "outcome", valueType: "percent", unit: "%" },
  { id: "pct_patients_accessing_ai_care", label: "Percent of patients accessing care supported by the AI platform", domain: "data_ai_systems", category: "outcome", valueType: "percent", unit: "%" },
  { id: "pct_children_fully_vaccinated", label: "Percent of children aged 12-23 months that have received the last recommended dose for each vaccine in national schedule", domain: "health_outcomes", category: "outcome", valueType: "percent", unit: "%" },
  { id: "pct_women_cancer_screened", label: "Percent of women screened for cancer", domain: "health_outcomes", category: "outcome", valueType: "percent", unit: "%" },
  { id: "pct_anc_visits", label: "Percent of pregnant women attending at least four antenatal (ANC) visits.", domain: "health_outcomes", category: "outcome", valueType: "percent", unit: "%" },
  { id: "pct_amr_adherence", label: "Percent of Clinicians Adhering to Antimicrobial Stewardship Interventions", domain: "health_outcomes", category: "outcome", valueType: "percent", unit: "%" },
  { id: "pct_change_utilization", label: "Percent change in healthcare utilization in the community", domain: "health_outcomes", category: "outcome", valueType: "percent", unit: "%" },
  { id: "pct_change_cost", label: "Percent change in average cost per patient served", domain: "health_outcomes", category: "outcome", valueType: "percent", unit: "%" },
  { id: "policy_changes", label: "Changes in policies, budget allocations, endorsements or adoption", domain: "partnerships_community_knowledge", category: "qualitative", valueType: "text" },

  // ---- Project summary / profile fields (qualitative + descriptive) -------
  { id: "years_in_program", label: "Years in Program", domain: "project_management", category: "output", valueType: "number" },
  { id: "country", label: "Project Implementation Country", domain: "project_management", category: "qualitative", valueType: "text" },
  { id: "org_type", label: "Organization Type", domain: "project_management", category: "qualitative", valueType: "text" },
  { id: "project_description", label: "GHIG9 Project Description", domain: "project_management", category: "qualitative", valueType: "text" },
  { id: "challenges", label: "Challenges", domain: "project_management", category: "qualitative", valueType: "text" },
  { id: "accomplishments", label: "Accomplishments", domain: "project_management", category: "qualitative", valueType: "text" },
  { id: "lessons_learned", label: "Lessons Learned", domain: "project_management", category: "qualitative", valueType: "text" },
];

// ---- Lookup index: normalized header -> indicator --------------------------
const INDEX: Map<string, CatalogIndicator> = (() => {
  const m = new Map<string, CatalogIndicator>();
  for (const ind of INDICATOR_CATALOG) {
    m.set(normalizeHeader(ind.label), ind);
    for (const a of ind.aliases ?? []) m.set(normalizeHeader(a), ind);
  }
  return m;
})();

// Exact (post-normalization) match. Deterministic and explainable.
export function matchIndicator(header: string): CatalogIndicator | undefined {
  return INDEX.get(normalizeHeader(header));
}

export function getIndicator(id: string): CatalogIndicator | undefined {
  return INDICATOR_CATALOG.find((i) => i.id === id);
}
