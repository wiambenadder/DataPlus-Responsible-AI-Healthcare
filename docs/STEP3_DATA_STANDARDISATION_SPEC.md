# Step 3 — Data Standardization Spec

**Route:** `/standardize` · **Module:** `src/lib/standardization` · **Runtime:** browser (`'use client'` island)

This is the contract for how grantee reporting files are turned into clean,
comparable data. It is written so a non-engineer can read it and an engineer can
build to it. The behavioral rules are non-negotiable and are also stated in
`GROUND_RULES.md`.

---

## 1. What this step does

Grantees submit a 12-month reporting workbook (`.xlsx`). The files share a common
template but they tend to drift in wording and structure. Step 3 reads each file, maps it onto
a canonical master schema, cleans the values, and produces:

- a **cleaned workbook per company** (Outputs / Outcomes / Qualitative / Mapping Log),
- a **cross-company funder view** (quantitative aligned by metric; qualitative in long form),
- a **machine-readable audit log** of every mapping decision.

The work runs entirely in the browser. The page is a thin client island; all
logic lives in framework-agnostic modules so it can also run in a Server Action
or a test unchanged.

---

## 2. The canonical schema

Each grantee file has three data sheets: **Project Status**, **Outputs**,
**Outcomes**. In these files a *row* is an indicator and the *columns* are
positional, so the canonical schema is a catalogue of indicator rows plus a
column layout — not a set of column headers.

The schema was inferred from the real submitted files and lives in
`schema.json` (the single source of truth). It currently holds **60 Outputs +
15 Outcomes = 75 indicators**, all present in all reference files. The
partial-coverage lists are empty but are still checked automatically for future
files.

`schema.json` is editable by hand: add an indicator, add a sheet alias, mark a
column qualitative, or retune a fuzzy threshold without touching any `.ts` file.
Row/column indices in the schema are **1-based**; `parse.ts` converts them to the
0-based grid SheetJS produces.

---

## 3. The rules the pipeline never breaks

1. **Narrative answers are preserved verbatim** — only outer-whitespace trimming
   and encoding repair are allowed. Tagged `isQualitative: true`.
2. **Missing numbers are flagged (`null`), never imputed.**
3. **Nothing is dropped silently** — unparseable numbers keep their original text
   in `raw`; unmatched indicators are logged, not discarded; `#DIV/0!` and other
   spreadsheet errors are treated as missing.
4. **Numbers are standardized, meaning is not** — strip currency/commas, `45%` →
   `0.45`, dates → ISO-8601; values too vague to date are left missing.
5. **The schema is data, not code** (`schema.json`).
6. **The master schema is inferred from real files**; indicators in only some
   files are flagged as partial coverage.
7. **A missing grantee is handled gracefully** — reported in the log and given an
   all-blank column in the funder view.
8. **Only known structural noise is removed** — instruction sheets, the indicator
   reference library, repeated mid-sheet header rows, and rows marked `DELETE`.
9. **Matching is conservative** — wording drift is absorbed; genuinely different
   disaggregations are not merged; below-threshold matches are reported.
10. **Every run is auditable** via the log.

---

## 4. Module layout

```
src/lib/standardization/
  schema.json    canonical master schema (DATA — edit this)
  types.ts       shared types (the rules show up in the types)
  schema.ts      typed loader over schema.json
  normalize.ts   pure cleaning: cleanNumber, cleanQualitative, toIsoDate
  catalog.ts     fuzzy matching (fuzzball): sheets, columns, indicators
  parse.ts       SheetJS reading + positional row extraction + noise skipping
  source.ts      input abstraction (File now; Supabase adapter stubbed)
  engine.ts      orchestration: processSource / processAll -> StandardizedFile
  aggregate.ts   buildFunderView (quantitative + qualitative)
  export.ts      browser downloads: cleaned xlsx, funder CSVs, log JSON
  index.ts       public API barrel
```

Data flow: `WorkbookSource → parse → catalog (match) → normalize (clean) →
StandardizedFile → aggregate (funder view) → export (Blobs)`.

---

## 5. Public API

```ts
import {
  fromFiles, processAll, buildExports, downloadBlob,
} from "@/lib/standardization";

const EXPECTED = ["Jacaranda Health","Bive","Sevamob","mDoc","Munai Health","Simprints"];

const sources = await fromFiles(inputEl.files!);     // File[] -> WorkbookSource[]
const run     = processAll(sources, EXPECTED);        // -> RunResult (+ missingCompanies)
const bundle  = buildExports(run, EXPECTED);          // -> in-memory Blobs

bundle.companyWorkbooks.forEach(w => downloadBlob(w.blob, `${w.company}_cleaned.xlsx`));
downloadBlob(bundle.funderQuantitative, "funder_view_quantitative.csv");
downloadBlob(bundle.funderQualitative, "funder_view_qualitative.csv");
downloadBlob(bundle.log, "standardization_log.json");
```

`processSource` / `processAll` are pure (bytes in, data out) and never throw on
dirty data — they record problems in the log instead.

---

## 6. Dependencies

- `xlsx` (SheetJS) — read/write workbooks in the browser.
- `fuzzball` — fuzzy matching; same algorithm family as the original Python
  `rapidfuzz`, so the thresholds (indicator 88, column 80) transfer.

Both ship their own TypeScript types. PDF export is out of scope for this step;
add `jspdf` + `jspdf-autotable` later if a per-company PDF is required.

---

## 7. Where Supabase fits (later)

Today the upload page stores the file in Supabase and nothing else is wired.
The engine does not read Supabase directly — it takes a `WorkbookSource`
(`{ name, bytes }`). When the storage bucket/table is finalized, implement
`fromSupabase()` in `source.ts` to download bytes by key; nothing else in the
pipeline changes. Until then, `fromFiles()` (direct browser upload) is the
working input path.

---

## 8. Verification baseline

Run against the five reference files, the engine must reproduce: 75/75 indicators
matched per file, 0 unmatched, qualitative answers preserved byte-for-byte,
Jacaranda Health reported missing and shown as an empty funder-view column,
`#DIV/0!` and free-text numeric cells resolved to missing with their raw text
retained, and `4/15/2025 → 2025-04-15` while `Q1 2025 → missing`.
