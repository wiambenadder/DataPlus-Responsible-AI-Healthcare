import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { company_id, reporting_period } = await request.json();

    if (!company_id || !reporting_period) {
      return NextResponse.json(
        { error: "Missing company_id or reporting_period" },
        { status: 400 }
      );
    }

    const { data: mappings, error: mappingError } = await supabase
      .from("domain_mapping")
      .select("*")
      .eq("company_id", company_id);
      
    if (mappingError) {
      return NextResponse.json({ error: mappingError.message }, { status: 500 });
    }

    const grouped: Record<string, {
      domain: string;
      Subtopic: string;
      texts: string[];
      sources: Set<string>;
    }> = {};

    for (const row of mappings || []) {
      const domain = row.domain;
      const Subtopic = row.subtopic;
      const text = row.source_quotes;
      const source = row.source_pdf || "Source";

      if (!domain || !Subtopic || !text) continue;

      const key = `${domain}__${Subtopic}`;

      if (!grouped[key]) {
        grouped[key] = {
          domain,
          Subtopic,
          texts: [],
          sources: new Set(),
        };
      }

      grouped[key].texts.push(text);
      grouped[key].sources.add(source);
    }

    const rowsToInsert = Object.values(grouped).map((group) => ({
      company_id,
      reporting_period,
      question: `Evidence extracted from ${Array.from(group.sources).join(", ")}`,
      answer: group.texts.join("\n\n"),
      domain: group.domain,
      Subtopic: group.Subtopic,
    }));

    const { error: insertError } = await supabase
      .from("qualitative_responses")
      .insert(rowsToInsert);

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      inserted: rowsToInsert.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}