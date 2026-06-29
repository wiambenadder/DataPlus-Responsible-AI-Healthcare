import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

function cleanDomain(domain: string) {
  return domain
    .replace(/^D\d+\s*[-—–]+\s*/, "")
    .trim();
}

function cleanSubtopic(subpoint: string) {
  return subpoint
    .replace(/^D\d+\.\d+\s*/, "")
    .trim();
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_KEY!
    );

    const openai = new OpenAI({
      apiKey: process.env.LITELLM_TOKEN,
      baseURL: "https://litellm.oit.duke.edu",
    });

    // Get every completed extraction
    const { data: uploads, error } = await supabase
      .from("uploads")
      .select("*")
      .eq("extraction_status", "complete");

    if (error) {
      throw error;
    }

    // Process every uploaded document
    for (const upload of uploads || []) {

      const prompt = `
# Assessment Framework Extraction Prompt

## System Role

You are an expert qualitative researcher analysing interviews, reports,
PDFs and organisational documentation about AI health tools.

Your task is to extract evidence into a **fixed assessment framework**.
The framework consists of predefined Domains and Subpoints. Do **not**
invent new categories.

Your goal is **not** to summarise the document. Instead, identify and
synthesise all evidence relevant to each assessment subpoint.

------------------------------------------------------------------------

## General Instructions

-   Read the entire input text carefully.
-   Evaluate every subpoint independently.
-   A single passage may contribute to multiple subpoints.
-   Do not speculate or infer beyond what is reasonably supported.
-   If there is insufficient evidence for a subpoint, omit it.
-   Do not return subpoints with confidence below **0.50**.
-   Write in an objective research style.

------------------------------------------------------------------------

## Evidence Summary

For each relevant subpoint, write a comprehensive synthesis (roughly
100--300 words where enough evidence exists).

The summary should:

-   Combine all relevant evidence.
-   Preserve technical detail.
-   Be written as flowing prose.
-   Avoid repetition.
-   Remain factual and objective.

Example style:

"Jacaranda Health stated that they are authorised to collect data from
mothers through partner health facilities and operate under Ministry of
Health approval. They explained that the only personal identifier
collected is a mother's phone number, which is excluded from
machine-learning training datasets. They described that training data
consists primarily of message questions and responses, with
transformation handled by the machine learning team. They further stated
that a medical quality assurance team reviews training content for
clinical correctness. Training data is stored internally using random
UUIDs and is not shared or open sourced."

------------------------------------------------------------------------

## Confidence

1.00 = explicit, comprehensive evidence

0.90 = strong evidence

0.75 = moderate evidence

0.50 = weak but relevant evidence

Below 0.50 = omit.

------------------------------------------------------------------------
## JSON Output

Return JSON in exactly this format:

{
  "matches": [
    {
      "domain": "...",
      "subpoint": "...",
      "summary": "...",
      "confidence": 0.95,
      "coverage": "high"
    }
  ]
}
    }
  ]
}

Coverage values:

-   high
-   medium
-   low

------------------------------------------------------------------------

# Assessment Framework

## D1 --- Model Source

### D1.1 Governance & Stewardship

Definition: Evidence relating to ownership of training data, governance
structures, stewardship, access permissions, documented
responsibilities, governance agreements and policies.

Measured if: A formal governance policy assigns roles, rights and
responsibilities across partners.

### D1.2 Training Data Quality & Coverage

Definition: Evidence relating to data quality, completeness,
representativeness, cleaning, validation and QA before model training.

Measured if: A documented quality protocol is systematically applied
before training.

### D1.3 Timeliness

Definition: Evidence about keeping training data current, review
schedules, version control and retirement of outdated data.

Measured if: A documented review and retirement policy exists.

### D1.4 Data Interoperability & Reuse

Definition: Evidence relating to metadata, discoverability,
accessibility, interoperability and reuse.

Measured if: Data is structured with documented metadata and clear
access pathways.

### D1.5 Privacy & Security

Definition: Evidence relating to consent, anonymisation, privacy
protection, encryption, security controls and compliance.

Measured if: A formal compliance document (e.g. DPIA or equivalent)
exists and is reviewed.

### D1.6 Data Standards & Metadata

Definition: Evidence relating to recognised standards (FHIR, HL7 etc.)
and documented metadata.

Measured if: A recognised standard is documented and in use.

## D2 --- Model Development

### D2.1 Accuracy

Definition: Evidence about model accuracy metrics and comparison against
baselines. Measured if: Formal metrics are tracked against a defined
ground truth or comparator.

### D2.2 Model Validation & Reliability

Definition: Evidence about validation methods and repeatable reliability
testing. Measured if: A documented validation protocol exists.

### D2.3 AI System Design

Definition: Evidence describing system architecture, decision flow,
documentation and design rationale. Measured if: A system design
document or accessible plain-language description exists.

### D2.4 Cross-Population Performance

Definition: Evidence comparing performance across demographic groups or
deployment settings. Measured if: Performance is formally disaggregated
and documented.

### D2.5 Bias & Fairness Assessment

Definition: Evidence of recurring bias audits and fairness testing.
Measured if: Bias assessments occur on a defined recurring schedule.

### D2.6 Transparency & Explainability

Definition: Evidence explaining how model outputs are produced and
communicated to users. Measured if: User-facing explanations are
formally documented.

### D2.7 Robustness

Definition: Evidence of stress testing under unusual, noisy or
adversarial conditions. Measured if: Formal stress testing is documented
before major releases.

## D3 --- Model Deployment

### D3.1 Mechanism of Change

Definition: Evidence linking AI outputs to health outcomes through a
theory of change. Measured if: A documented theory of change and
indicator exist.

### D3.2 System Reliability & Capacity

Definition: Evidence on uptime, latency, scalability and monitoring.
Measured if: A formal monitoring system actively tracks these metrics.

### D3.3 Protocol & Safety Monitoring

Definition: Evidence of escalation procedures and safety monitoring.
Measured if: A documented safety protocol and incident log exist.

### D3.4 Responsible Use of AI

Definition: Evidence describing misuse prevention, guardrails and
acceptable use. Measured if: Documented use constraints are enforced.

### D3.5 Deployment Infrastructure & Integration

Definition: Evidence about integration with national health systems,
EHRs or DHIS2. Measured if: Active documented integration exists.

### D3.6 Implementation Outcomes

Definition: Evidence tracking implementation and operational use.
Measured if: Implementation metrics are formally reported.

## D4 --- Impact

### D4.1 Outcome Improvement

Definition: Evidence that AI improves measurable health outcomes.
Measured if: Improvement has been formally demonstrated through
structured evaluation.

### D4.2 Time to Action

Definition: Evidence measuring time between recommendation and action.
Measured if: Time-to-action is formally tracked.

### D4.3 Equity Effect

Definition: Evidence comparing outcomes across underserved populations.
Measured if: Outcome data is formally disaggregated by equity dimension.

### D4.4 Financial Sustainability

Definition: Evidence describing long-term financial sustainability
analyses. Measured if: A documented sustainability analysis exists.

### D4.5 Cost-Effectiveness

Definition: Evidence comparing costs with alternative approaches.
Measured if: A documented cost-effectiveness analysis exists.

### D4.6 Continued Oversight

Definition: Evidence describing governance after deployment. Measured
if: A named oversight body or formal review schedule exists.

## D5 --- Sustainability

### D5.1 Financial Viability

Definition: Evidence about long-term financial viability beyond current
grants. Measured if: A documented financial model demonstrates long-term
viability.

### D5.2 Business Model Clarity

Definition: Evidence describing revenue generation or sustainable
funding pathways. Measured if: A documented business model exists.

### D5.3 Health System Integration

Definition: Evidence showing embedding into routine health-system
processes. Measured if: Integration is formally documented.

### D5.4 Local Ownership & Capacity

Definition: Evidence of local capability to independently operate the
system. Measured if: Documented handover, governance and
capacity-building plans exist.

### D5.5 Policy & Financing Alignment

Definition: Evidence of inclusion in national policy or financing
documents. Measured if: The tool is referenced in at least one national
policy or financing document.

### D5.6 Long-Term Oversight

Definition: Evidence identifying who is responsible for oversight in
future years. Measured if: A named entity has documented responsibility
for multi-year oversight.

## Text to Analyse

${upload.extracted_text}

`;

      const aiResult =
        await openai.chat.completions.create({
          model: "gpt-5.4",
          temperature: 1,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        });

 const aiText =
  aiResult.choices[0].message.content ?? "";

console.log("GPT RESPONSE:");
console.log(aiText);

const aiJson =
  JSON.parse(aiText);

console.log("AI JSON:");
console.log(aiJson);

console.log("Matches Found:");
console.log(aiJson.matches);

for (const match of aiJson.matches) {

  const { data, error } = await supabase
    .from("domain_mapping")
    .insert({

      domain: cleanDomain(match.domain),
      
      subtopic: cleanSubtopic(match.subpoint),

      source_quotes: match.summary,

      source_pdf: upload.file_name,

      company_id: upload.company_id,
      
      upload_id: upload.id,

      confidence: match.confidence

    })
    .select();

  console.log("Inserted Row:");
  console.log(data);

  if (error) {
    console.log("INSERT ERROR:");
    console.log(error);
  }

}

    }

    return NextResponse.json({
      success: true,
      documentsProcessed: uploads?.length ?? 0,
    });

} catch (error: any) {

  console.error("DOMAIN MAPPING ERROR:");
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