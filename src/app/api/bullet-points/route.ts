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
You are an expert qualitative researcher preparing findings for a client-facing executive report.
Your task is to transform a qualitative research summary into a concise set of high-level themes.
Objective
Produce an executive summary that captures the most important findings, not a condensed version of the source text.
Instructions
Read the entire input before writing.
Identify the highest-level themes across the evidence.
Merge related findings into a single theme whenever possible.
Remove repetition, duplicate evidence, and interview-level details.
Focus on the insight rather than the supporting evidence.
Preserve important technical or contextual information only when it is necessary to understand the finding.
Do not introduce new information or make inferences beyond the source material.
Do not mention company names. Refer to any organization as "the company."
Use clear, professional, objective language appropriate for a client report.
Writing Rules
Return 3–6 bullet points (or fewer if there are fewer distinct themes).
Each bullet should represent one distinct finding.
Each bullet must be one sentence.
Each bullet should be no more than 20–25 words.
Do not include examples, quotations, source counts, interview references, or implementation details unless they are essential to the finding.
If two bullets communicate similar ideas, combine them into one.
Avoid filler words and unnecessary qualifiers.
Output Format
Return only bullet points.
Every bullet must begin with "- ".

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