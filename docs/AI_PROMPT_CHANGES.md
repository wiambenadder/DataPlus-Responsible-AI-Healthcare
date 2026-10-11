# Proposed AI changes from innovator feedback

The website changes in this branch fix the display problems innovators
reported. The problems below come from the AI steps themselves, so they need
prompt changes. They are written up here, not applied, because the prompts
were calibrated against Jules' ratings and any change should be re-tested the
same way (accuracy against human ratings, and consistency over 5 runs).

Sources: the Platform Feedback Summary (Sept 2026) and the handover's
"Recommended immediate changes".

| # | Problem | Who reported it | File |
|---|---------|-----------------|------|
| 1 | "We said no" recorded as "no information" | Bive | `src/app/api/run-ai-assessment/route.ts` |
| 2 | Any answer counted as met | Bive | `src/app/api/run-ai-assessment/route.ts` |
| 3 | Company and partner mixed up | Bive (Pegasi) | `src/app/api/map-domains/route.ts`, `src/app/api/bullet-points/route.ts` |
| 4 | Another company's document in an assessment | Simprints (Jacaranda transcript) | `src/app/api/map-domains/route.ts` |
| 5 | Answers that differ by product | Sevamob (Time to Action) | `src/app/api/run-ai-assessment/route.ts` |
| 6 | Interview answers missed | Bive, Sevamob, Simprints (8 cases) | `src/app/api/map-domains/route.ts`, assessment page |
| 7 | No exact quotes to verify against | Simprints, handover | `src/app/api/map-domains/route.ts` |

---

## 1. Tell "we don't do this" apart from "no information"

**Now:** the rating prompt returns only `Practiced` / `Not Practiced`. A clear
"we don't have this" and a document that never mentions the topic both become
`Not Practiced`, and older summaries said "No answer from interviews".

**Change:** ask for one more field in the JSON output.

```text
Return exactly this structure:
{
  "ai_assessment": "Practiced or Not Practiced",
  "evidence_basis": "describes_practice | states_not_done | no_relevant_information",
  "ai_reasoning": "Brief explanation based strictly on the company answer."
}

evidence_basis:
- describes_practice: the answer describes something in place.
- states_not_done: the company explicitly says they do not do this yet.
- no_relevant_information: the answer does not address this subtopic.
```

**Storing it:** add a column (`alter table qualitative_responses add column
ai_evidence_basis text;`) and write it next to `ai_assessment`. Then in
`src/lib/assessment.ts`, `whyThisResult()` can say "You told us you don't do
this yet" or "Nothing you submitted covers this" instead of the generic text.

## 2. Stop treating any answer as a pass

**Now:** the prompt says a practice is `Practiced` "even if the practice is
informal / not measured / incomplete / weak". Bive's "our work on cost
effectiveness is scarce" was rated as met.

**Change:** add the middle level the handover already lists as future work.

```text
Classification options: "Practiced", "Partially Practiced", "Not Practiced".
- Practiced: a practice is in place and addresses the main point of the subtopic.
- Partially Practiced: something is in place but the company describes it as
  limited, early, ad hoc or covering only part of the subtopic.
- Not Practiced: nothing is in place, only plans or awareness.
```

The website already shows "Partially meets" for any `ai_assessment`
containing "partial" (`statusFromRating` in `src/lib/assessment.ts`). The
roadmap (`src/lib/roadmap/transform.ts`, `parseStatus`) only knows
"practiced" and "not practiced", so add a `partial` case there and decide
whether partial counts toward stage thresholds.

## 3. Name partner organisations

**Now:** both `map-domains` and `bullet-points` say *"Do not refer to any
company by name. Instead just say the company."* When a document describes a
partnership, every statement becomes "the company", so Bive and Pegasi's work
is merged (Pegasi works in several countries; the Bive–Pegasi alliance is
Colombia only).

**Change** (both prompts):

```text
Refer to the assessed organisation as "the company". When the text describes
work done by a partner, funder, government body or other organisation, name
that organisation and say so explicitly (for example "the partner, Pegasi,
operates in four countries; the joint programme with the company covers
Colombia only"). Never attribute a partner's practice to the company.
```

## 4. Catch documents about another organisation

**Now:** Simprints' "Jules Interview 2" (12 Feb) appears to be Jacaranda's
transcript. Nothing checks this.

**Change:** pass the company name into `map-domains` and ask for a flag.

```text
The assessed company is: ${companyName}.
Also return "document_about_other_organisation": true if this document is
mainly about a different organisation than the assessed company.
```

If true, mark the upload (e.g. `extraction_status = "needs_review"`) and show
a warning on the upload page instead of mapping it silently.

## 5. Answers that differ by product

**Now:** Sevamob's Time to Action depends on the model (SymptomsAI, DietAI,
SputumAI, XrayAI), and the rating missed it.

**Change** (rating prompt):

```text
If the company has several products and the answer differs by product,
evaluate the subtopic for each product mentioned, and classify as Practiced
if the practice is in place for the main product(s). Mention the differences
in ai_reasoning.
```

## 6. Interview answers that were missed

In 8 cases the platform said there was no answer; in 4 the company had
answered (Robustness, Deployment Infrastructure & Integration, Outcome
Improvement, Time to Action).

* **Long transcripts:** `map-domains` sends the whole `extracted_text` in one
  prompt. Split long documents into chunks (for example 6–8k words with
  overlap), map each chunk, and merge results per subpoint.
* **Weak evidence skips the question:** a subpoint mapped at confidence 0.5
  counts as "covered", so the follow-up question is never asked. In
  `loadInterviewQuestions` (`src/app/report/assessment/page.tsx`), also ask
  the question when the best confidence is below 0.75.
* **Questions that are too narrow:** Bive and Sevamob both missed the stress
  testing and DHIS2/EHR questions. Reword these in `src/lib/assessment-q.ts`
  so "no" and "partly" are invited answers.

## 7. Save exact quotes and page numbers

**Now:** `source_quotes` holds the AI's summary, not the document's words,
so innovators can't check a result against the source.

**Change:** ask `map-domains` for the passage and page.

```text
For each match also return:
"quote": the single most relevant passage, copied exactly (max 300 characters),
"page": the PDF page number it appears on, if known.
```

Store them in two new columns:

```sql
alter table domain_mapping add column source_excerpt text;
alter table domain_mapping add column page_number integer;
```

(For page numbers, have `process-upload` keep page breaks, e.g. insert
`[[page N]]` markers between pages.) **No website change is needed.** The
dashboard already reads these columns if they exist and shows the passage as
"Exact passage, page N" above the summary.

---

## How to test before switching

1. Re-run the changed prompt on the six pilot companies' existing documents.
2. Compare with Jules' ratings and with the innovators' feedback rows (the
   `feedback` table): the disliked items above are ready-made test cases.
3. Run each 5 times to check consistency, as in the original calibration.
4. Re-assess a company only after the team agrees on the new results, since
   ratings change for everyone once the prompt is live.
