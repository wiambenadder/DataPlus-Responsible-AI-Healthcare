import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

export async function POST(
  request: NextRequest
) {
  try {
    const body = await request.json();

    const reportingPeriod =
      body.reporting_period;

    const companyId =
      body.company_id;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_KEY!
    );

    const openai = new OpenAI({
      apiKey: process.env.LITELLM_TOKEN,
      baseURL: "https://litellm.oit.duke.edu",
    });

    const {
      data: rows,
      error,
    } = await supabase
      .from(
        "qualitative_responses"
      )
      .select("*")
      .eq(
        "reporting_period",
        reportingPeriod
      )
      .eq(
        "company_id",
        companyId
      );

    if (error) {
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

    for (const row of rows || []) {
      const domain =
        row.domain;

      const subtopic =
        row.Subtopic;

      const response =
        row.answer;

      const prompt = `
      
You are a qualitative research coder applying a predefined assessment framework.

Your task is to determine whether the company demonstrates a practice relevant to the specified domain and subtopic.

## Scope of Analysis

The domain and subtopic define the coding unit.

Use only the information contained in the company answer.

Do not use outside knowledge.

Do not infer practices, policies, governance structures, responsibilities, metrics, or workflows that are not explicitly described.

Do not evaluate whether the practice is good, effective, mature, complete, or compliant.

Your task is only to determine whether a relevant practice exists.

## Decision Process

### Question 1

Is there evidence that the company addresses the subtopic?

Evidence may include:
- processes
- practices
- workflows
- responsibilities
- governance mechanisms
- teams
- policies
- operational activities
- metrics
- monitoring activities
- documented approaches

If no evidence exists:
Classification = Not Practiced

If evidence exists:
Proceed to Question 2.

### Question 2

Does the answer describe an actual practice, process, responsibility, workflow, governance mechanism, policy, team, metric, or operational activity that addresses the subtopic?

If no:
Classification = Not Practiced

If yes:
Classification = Practiced

## Important Rules

A company may still be classified as Practiced even if:
- the practice is informal
- the practice is not measured
- the practice is incomplete
- the practice is weak
- the company explicitly states limitations

For example:
"We have a governance process but do not track metrics."
Classification: Practiced

"We are aware of this issue but do not currently do anything."
Classification: Not Practiced

If uncertain between Practiced and Not Practiced, choose Not Practiced.

## Output Rules

Return JSON only.

Return exactly this structure:

{{
  "ai_assessment": "Practiced or Not Practiced",
  "ai_reasoning": "Brief explanation based strictly on the company answer."
}}

## Inputs

Domain:
${domain}

Subtopic:
${subtopic}

Company Answer:
${response}
`;

      const aiResult =
        await openai.chat.completions.create(
          {
            model: "gpt-5.2",
            temperature: 0,
            messages: [
              {
                role: "user",
                content: prompt,
              },
            ],
          }
        );

      const aiText =
        aiResult.choices[0]
          .message.content ?? "";

      console.log(
        "AI OUTPUT:",
        aiText
      );

      const aiJson =
        JSON.parse(aiText);

      await supabase
        .from(
          "qualitative_responses"
        )
        .update({
          ai_assessment:
            aiJson.ai_assessment,
          ai_reasoning:
            aiJson.ai_reasoning,
        })
        .eq("id", row.id);
    }

    return NextResponse.json({
      success: true,
      rowsProcessed:
        rows?.length ?? 0,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error:
          "Assessment failed",
      },
      {
        status: 500,
      }
    );
  }
}