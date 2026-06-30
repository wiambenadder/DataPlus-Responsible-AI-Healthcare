import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();

    if (!rawBody) {
      return NextResponse.json(
        { error: "Request body is empty" },
        { status: 400 }
      );
    }

    const { company_id, reporting_period } = JSON.parse(rawBody);

    if (!company_id || !reporting_period) {
      return NextResponse.json(
        {
          error: "Missing company_id or reporting_period",
        },
        { status: 400 }
      );
    }

    const { data: mappings, error: mappingError } = await supabase
      .from("domain_mapping")
      .select("*")
      .eq("company_id", company_id);

    if (mappingError) {
      return NextResponse.json(
        { error: mappingError.message },
        { status: 500 }
      );
    }

    if (!mappings || mappings.length === 0) {
      return NextResponse.json({
        success: true,
        inserted: 0,
        message: "No domain mappings found",
      });
    }

    const grouped: Record<
      string,
      {
        domain: string;
        subtopic: string;
        texts: string[];
      }
    > = {};

    mappings.forEach((row: any) => {
      const domain = row.domain;
      const subtopic = row.subtopic;

      const text =
        row.mapped_text ||
        row.text ||
        row.response_text ||
        row.evidence ||
        row.answer;

      const source =
        row.source ||
        row.file_name ||
        row.source_document ||
        "Source";

      if (!domain || !subtopic || !text) return;

      const key = `${domain.trim()}__${subtopic.trim()}`;

      if (!grouped[key]) {
        grouped[key] = {
          domain: domain.trim(),
          subtopic: subtopic.trim(),
          texts: [],
        };
      }

      grouped[key].texts.push(`=== ${source} ===\n${text}`);
    });

    const rows = Object.values(grouped).map((group) => ({
      company_id,
      reporting_period,
      question: "Evidence extracted from uploaded documentation",
      answer: group.texts.join("\n\n"),
      domain: group.domain,
      Subtopic: group.subtopic,
    }));

    if (rows.length === 0) {
      return NextResponse.json({
        success: true,
        inserted: 0,
        message: "No usable mapped evidence found",
      });
    }

    const { error: insertError } = await supabase
      .from("qualitative_responses")
      .insert(rows);

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      inserted: rows.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: err.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}