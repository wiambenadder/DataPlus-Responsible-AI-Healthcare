# Step 3 — Data Standardisation: Specification & Reasoning

This document explains *what* the standardisation step does and *why* each rule
exists. It is written so you can understand the decisions
without reading the code.

## The problem we are solving

Today every grantee's data lives in a wide, one-size-fits-all Excel workbook
(the GHIG9 aggregate file). Within a single workbook the layout shifts from
sheet to sheet: the grantee name is in column A on one sheet and column B on
another; reporting periods ("6-Month Data", "12-Month Data") are written as
labels *inside* the sheet; hundreds of indicator columns are separated by blank
"spacer" columns; many cells are empty because the indicator does not apply to
that company; and totals are typed directly into the sheet.

That format is hard to compare across companies, hard to track over time, and
fragile when metrics change between cohorts. Standardisation converts all of it
into one predictable structure.

## The standard: one flat record per data point

Every value becomes a `StandardizedRecord` (see `lib/standardization/schema.ts`):
grantee, period, indicator, domain, category, value type, the value itself, an
optional numerator/denominator, an `applies` flag, a unit, and the exact source
cell it came from. One indicator, for one company, at one reporting period, is
one record.

This "tidy/long" shape is the whole point. Because every company's data is the
same shape, the funder view can group by indicator and lay companies side by
side, and the innovator view can line a company's own values up across periods.
Adding or removing an indicator never changes the shape — only the catalog.

## Reporting periods are first-class

Grantees report at sign-up (a **baseline** drawn from their work plan and theory
of change) and then at **3, 6, 9, and 12 months**. Period is part of every
record, so progress over time falls out naturally and the baseline can later
serve as the reference point for validation in Step 4. When a sheet carries its
own period markers (as the GHIG9 Outputs/Outcomes sheets do), the engine reads
them; otherwise it uses the period the innovator selected at upload.

## The rules, and why each one exists

**Blank is not zero.** An empty cell means "this indicator does not apply to
this company", which is different from a real measured value of 0. Collapsing
the two would invent data and distort every average. We therefore store an
`applies` flag: `applies = false` (blank) is excluded from totals and never
counted as missing; `applies = true` with no value yet means "applies but not
reported", which is exactly what Step 4 (validation) should chase. This directly
addresses the recurring note that *"some of the indicators don't always apply"*
(the GHIG10 concern).

**Qualitative answers are kept verbatim.** Free-text fields (reasons for delay,
challenges, accomplishments, lessons learned, policy changes) are stored exactly
as written and never summarised. Summarising would strip the nuance funders rely
on, per the team's explicit instruction.

**Totals are recomputed, never trusted.** The source sheets contain typed "Total"
and "Number reporting" rows. The engine skips those rows and recomputes
aggregates from the clean records instead, so the funder numbers are always
reproducible and traceable rather than inheriting any stale or hand-edited cell.

**Nothing is dropped silently.** Any column the engine cannot confidently map to
a catalog indicator is reported as an *unmapped column* (with sample values), not
discarded. The UI shows these so a person — or, later, an AI assistant — can map
them. This is also how the standard grows for a new cohort.

**The core is deterministic (no AI).** Standardisation is a fixed
transformation: the same file always produces the same output, and every value
links back to a sheet and cell. This matches the project's risk framing, where
descriptive data handling ("Bot 1") is the lowest-risk, human-in-the-loop layer.
AI is optional and only suggested for fuzzy-matching unmapped column names; it
never silently rewrites values.

## Changeable metrics: the indicator catalog

`lib/standardization/catalog.ts` is the single editable list of indicators. Each
entry has an id, a human label, a domain, a category, a value type, an optional
unit, and aliases (alternate column names seen in the wild, including typos like
"On schdule" and the short summary names from the workbook's summary tab). To
support a new cohort you edit only this file; everything downstream follows. This
is the "changeable metrics" requirement from the backend notes, implemented as
plain configuration.

## The 6-domain framework (provisional — input needed)

The funder wants recommendations and grouping organised around the 6-domain
framework that Alcade is developing. We do not yet have that final list, so the
domains in `schema.ts` are a working set inferred from the data and the existing
summary tab (Reach & Service Delivery, Health Outcomes, Data & AI Systems,
Workforce & Training, Infrastructure & Points of Care, Partnerships/Community/
Knowledge, plus Project Management for work-plan progress). Each indicator is
tagged with one domain in one place, so swapping in the official six is a small,
contained change. **To finalise this we need Alcade's domain documentation.**

## Two outputs

**Innovator format** — one company's data grouped by domain, with a period-over-
period progress summary, exportable to Excel and to PDF (via the browser's print
function in the prototype). This is the company's own record of what they
reported.

**Funder format** — a portfolio aggregate (each indicator's total and how many
companies reported it, per period) plus a per-period matrix that places every
company side by side. This is the "separate format of all companies for funders"
the outline calls for.

## How this was validated against the real file

Running the engine on `GHIG9_12-month_Data_Aggregate.xlsx` produced 632 clean
records for the six grantees across the 6-month and 12-month periods. Recomputed
funder totals match the workbook's own totals (e.g. patients reached with direct
services at 12 months = 50,257; new AI algorithms = 30; individuals vaccinated =
5,396), the blank-vs-zero rule behaves correctly (a grantee with no AI-algorithm
entry is recorded as `applies = false`, not 0), and per-company progress between
periods is computed from the records (e.g. mDoc's patients reached roughly
doubled from 6 to 12 months).

## Open questions / documents that would sharpen this

1. **Alcade's 6-domain framework** — to replace the provisional domains and to
   anchor the Step 5 recommendations.
2. **The GHIG10 indicator list** — to confirm which indicators change between
   cohorts and to test the "changeable metrics" path on a second template.
3. **A filled-in qualitative example** — the accomplishments/challenges/lessons
   sheet in the sample is empty; a populated one would let us confirm the
   verbatim-text handling against real content.
4. **The exact funder (Pfizer) report layout** — the precise columns and order
   reviewers expect, so the funder export matches their existing mental model.
5. **Baseline/work-plan format** — what a grantee submits at registration, so the
   baseline period is populated for the Step 4 validation handoff.
