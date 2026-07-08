import { supabase } from "@/lib/supabase"; // adjust to your existing client export
import type { DomainMappingRow, QualitativeResponseRow } from "./types";

/**
 * Fetch both roadmap source tables for one company.
 *
 * Notes on naming:
 *  - `qualitative_responses.Subtopic` is capitalized in the schema, so it
 *    must be quoted in the select string.
 *  - `domain_mapping.subtopic` is lowercase.
 * If a `created_at` column exists on `qualitative_responses`, add
 * `.order("created_at", { ascending: true })` so the transform's
 * "last row wins" rule means "latest wins".
 */
export async function fetchRoadmapData(companyId: string): Promise<{
  responses: QualitativeResponseRow[];
  mappings: DomainMappingRow[];
}> {
  const [responsesRes, mappingsRes] = await Promise.all([
    supabase
      .from("qualitative_responses")
      .select(
        'id, company_id, question, answer, domain, "Subtopic", ai_assessment, ai_reasoning, reporting_period, bullet_point_summary',
      )
      .eq("company_id", companyId),
    supabase
      .from("domain_mapping")
      .select(
        "id, domain, subtopic, source_quotes, source_pdf, confidence, upload_id, company_id",
      )
      .eq("company_id", companyId),
  ]);

  if (responsesRes.error) throw responsesRes.error;
  if (mappingsRes.error) throw mappingsRes.error;

  return {
    responses: (responsesRes.data ?? []) as QualitativeResponseRow[],
    mappings: (mappingsRes.data ?? []) as DomainMappingRow[],
  };
}
