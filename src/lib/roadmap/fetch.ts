import { createClient } from "@supabase/supabase-js";
import type { DomainMappingRow, QualitativeResponseRow } from "./types";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Fetch both roadmap source tables for one company.
 *
 * Notes on naming:
 *  - `qualitative_responses.Subtopic` is capitalized in the schema, so it
 *    must be quoted in the select string.
 *  - `domain_mapping.subtopic` is lowercase.
 * Responses are sorted oldest first by `created_at` (when present) so the
 * transform's "last row wins" rule means "latest wins" — the same rule as
 * the home and results pages.
 */
export async function fetchRoadmapData(companyId: string): Promise<{
  responses: QualitativeResponseRow[];
  mappings: DomainMappingRow[];
}> {
  const [responsesRes, mappingsRes] = await Promise.all([
    supabase
      .from("qualitative_responses")
      .select("*")
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
    responses: [...((responsesRes.data ?? []) as (QualitativeResponseRow & { created_at?: string | null })[])].sort(
      (a, b) =>
        (a.created_at ? new Date(a.created_at).getTime() : 0) -
        (b.created_at ? new Date(b.created_at).getTime() : 0),
    ),
    mappings: (mappingsRes.data ?? []) as DomainMappingRow[],
  };
}
