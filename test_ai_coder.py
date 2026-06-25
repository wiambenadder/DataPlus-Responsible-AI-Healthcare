import os
import json
from dotenv import load_dotenv
from openai import OpenAI
from supabase import create_client

load_dotenv()

client = OpenAI(
    api_key=os.getenv("LITELLM_TOKEN"),
    base_url="https://litellm.oit.duke.edu"
)

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

result = (
    supabase
    .table("qualitative_responses")
    .select("*")
    .limit(50)
    .execute()
)

rows = result.data

for row in rows:
    domain = row["domain"]
    subtopic = row["Subtopic"]
    response = row["answer"]

    prompt = f"""
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
{domain}

Subtopic:
{subtopic}

Company Answer:
{response}
"""

    ai_result = client.chat.completions.create(
        model="gpt-5.2",
        temperature=0,
        messages=[
            {"role": "user", "content": prompt}
        ]
    )

    ai_text = ai_result.choices[0].message.content
    print("AI OUTPUT:", ai_text)

    ai_json = json.loads(ai_text)

    update_result = (
        supabase
        .table("qualitative_responses")
        .update({
            "ai_assessment": ai_json["ai_assessment"],
            "ai_reasoning": ai_json["ai_reasoning"]
        })
        .eq("id", row["id"])
        .execute()
    )

    print("UPDATED ROW:", row["id"])
    print(update_result.data)