import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const companyId = body.company_id;
    const reportingPeriod = body.reporting_period;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_KEY!
    );

    const openai = new OpenAI({
      apiKey: process.env.LITELLM_TOKEN,
      baseURL: "https://litellm.oit.duke.edu",
    });

    // Get all responses for this company and reporting period
    const { data: responses, error } = await supabase
      .from("qualitative_responses")
      .select("id, answer")
      .eq("company_id", companyId)
      .eq("reporting_period", reportingPeriod);

    if (error) {
      throw error;
    }

    for (const response of responses || []) {

      const prompt = `
You are an expert qualitative researcher.

Your task is to transform a qualitative research summary into a concise, client-ready set of bullet points.

The input may contain repeated evidence, multiple sources describing the same issue, or unnecessary detail. Your role is to synthesize this information into a small number of clear themes.

Guidelines:
- Combine related findings into a single bullet whenever possible.
- Remove repetition and redundant detail.
- Prioritize synthesis over listing individual pieces of evidence.
- Preserve important technical and contextual information.
- Do not add or infer information that is not present.
- Write in a professional, objective style suitable for a client report.
- Return only bullet points beginning with "- ".
- Do not mention the names of any company, use terms such as the company instead of their explicit name 

The bullets should read like executive-summary findings rather than interview notes.

${response.answer}
`;


      const aiResult = await openai.chat.completions.create({
        model: "gpt-5.2",
        temperature: 0,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const bulletPoints =
        aiResult.choices[0].message.content ?? "";

      const { error: updateError } = await supabase
        .from("qualitative_responses")
        .update({
          bullet_point_summary: bulletPoints,
        })
        .eq("id", response.id);

      if (updateError) {
        console.error("UPDATE ERROR:");
        console.error(updateError);
      } else {
        console.log(`Updated row ${response.id}`);
      }
    }

    return NextResponse.json({
      success: true,
      processed: responses?.length ?? 0,
    });

  } catch (error: any) {

    console.error("BULLET POINT SUMMARY ERROR:");
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}