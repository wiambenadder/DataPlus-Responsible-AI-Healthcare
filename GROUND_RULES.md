# GHIG9 Data Standardization — Ground Rules

These are the rules the standardization system follows every time it runs. They
exist to protect two things at once: **the integrity of what each grantee
actually reported**, and **the consistency the funder needs to compare grantees
side by side**. They are written here in plain language so that anyone on the
GHIG team — technical or not — can read them, agree with them, and hold the
system accountable to them.

You can hand this file to a new team member, paste it into a project wiki, or
keep it next to the code. It is meant to be embedded in the system as the
contract the pipeline lives by.

---

## Rule 1 — Narrative answers are preserved word-for-word

Free-text and narrative answers (project descriptions, explanations of delays,
notes, definitions written by the grantee) are **never** summarized, shortened,
reworded, paraphrased, or truncated — not at any step, not for any output.

The only changes ever allowed to a narrative answer are:

- trimming spaces at the very start and very end, and
- repairing garbled character encoding (for example, a mis-decoded apostrophe or
  dash turned back into the correct character).

Every narrative answer carries the marker **`is_qualitative = True`** so it is
unambiguous which fields are protected text.

*Why:* the grantee's own words are evidence. Summarizing them — even well —
destroys nuance the funder may need and introduces the pipeline's interpretation
where only the grantee's should stand.

---

## Rule 2 — Missing numbers are flagged, never invented

A number that is blank, unreadable, or not actually a number becomes **`NaN`**
(an explicit "missing" marker). The pipeline **never** imputes: it does not
guess, average, interpolate, carry a previous value forward, or fill a blank
with zero.

*Why:* a missing value and a value of zero mean very different things in grant
reporting. Filling a gap silently would manufacture data the grantee never
submitted.

---

## Rule 3 — Nothing is dropped silently

- If a cell that should hold a number actually contains text (e.g.
  *"Initial onboarding 2233 patients, Monthly repeat visits around 500"*), the
  cleaned number becomes `NaN` **and** the original text is kept in a companion
  `value_raw` field. The raw words are never lost.
- If an indicator row or column cannot be confidently matched to the master
  schema, it is **recorded in the log**, not discarded.
- Calculation errors that appear in source files (such as `#DIV/0!`) are treated
  as missing (`NaN`); they are never copied through as if they were data.

*Why:* the team must always be able to trace any cleaned value back to exactly
what the grantee typed, and must be able to see what the pipeline could not
place.

---

## Rule 4 — Numbers are standardized, meaning is not

Quantitative cleaning is limited to making numbers machine-readable:

- strip currency symbols (`$ £ € ₹ ¥`) and thousands separators (commas),
- convert percentage strings to fractions (`"45%"` → `0.45`),
- convert all recognizable dates to ISO-8601 (`YYYY-MM-DD`); dates too vague to
  pin down (e.g. `"Q1 2025"`, `"Month 6"`, `"Ongoing..."`) are left as missing
  rather than forced into a false precise date.

The pipeline changes the *format* of a number, never its *magnitude or meaning*.

---

## Rule 5 — The schema is data, not code

Every canonical indicator, every accepted sheet name, every column map, and every
matching threshold lives in **`schema_config.json`**. The team can add an
indicator, rename a sheet alias, or adjust a threshold by editing that file — no
Python changes required.

*Why:* the reporting tool will keep evolving. The people who own the indicators
should be able to update the system without needing an engineer.

---

## Rule 6 — The master schema comes from the real files

The canonical schema was **inferred from the actual submitted files**, not
invented. The system reads every grantee file, collects the indicator rows, and
builds the master list from what is genuinely there. Indicators that appear in
only some files are **flagged as partial coverage** rather than quietly assumed
to be universal.

*(In the current cohort, all 75 indicators — 60 Outputs + 15 Outcomes — appear in
all five submitted files; the partial-coverage list is therefore empty. The
flagging still runs automatically for future files.)*

---

## Rule 7 — A missing grantee is handled gracefully

If a company that is expected in a reporting period did not submit a file, the
pipeline does **not** crash and does **not** skip it. It records the company as
*missing from the period* in the log and gives it an all-blank (all-`NaN`) column
in the funder view, so the absence is visible rather than hidden.

*(Example in this cohort: Jacaranda Health was expected but no file was
provided; it appears as a clearly empty column.)*

---

## Rule 8 — Structural noise is removed, real data is kept

The reporting tool contains rows and sheets that are not grantee data:
instruction sheets, indicator-reference libraries, repeated header rows in the
middle of a sheet, and rows explicitly marked for deletion (`"DELETE"`,
`"SUGGEST DELETING"`). These are skipped. **Only** these known non-data elements
are removed; everything else flows through.

*Why:* counting a repeated header row as an indicator would inflate the numbers;
leaving instruction text in would pollute the funder view. But the line between
"noise" and "data" is drawn narrowly and explicitly, never by guesswork.

---

## Rule 9 — Matching is conservative

Fuzzy matching is used to absorb harmless wording drift (capitalization,
abbreviations, reordered columns, a parenthetical note like
*"(should equal sum of rows 8,9,10)"*). It runs against tuned thresholds
(indicator match ≥ 88, column match ≥ 80). Disaggregations that genuinely differ
— for example a `FEMALE` versus a `MALE` breakdown of the same indicator — are
**not** merged. When in doubt, the system keeps things separate and logs them
rather than collapsing distinct data together.

---

## Rule 10 — Every run is auditable

Each run writes `standardization_log.json` capturing, per file: company name,
source filename, reporting period(s) detected, processing timestamp, the columns
and indicators that were renamed or mapped, anything that could not be matched,
and any company missing from the period. A run you cannot inspect afterward is a
run you cannot trust.

---

### In one sentence

**Make the data consistent enough for the funder to compare, without ever
changing what a grantee actually said or filling in what they didn't.**
