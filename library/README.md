# Resource Library for the Roadmap Assistant

The Roadmap Assistant (on the Roadmap page and in Next Steps on the
overview) answers innovators' questions about what to do next. Before it
answers, it searches this library: papers, guidance documents and a short
"what to do next" note for each practice, all chosen by the team. Its
answer then cites the sources it used, with links.

This folder holds everything the team edits. Nothing here changes the
website until someone runs the loading script.

```
library/
  manifest.csv          one row per paper or guidance document
  notes.csv             approved "what to do next" notes, one per practice
  notes-draft.csv       AI drafts of notes, for review (made by a script)
  eval-questions.csv    test questions, to check the search finds the right sources
  papers/               the PDFs (not uploaded to GitHub, see Copyright)
  manifest.example.csv  two example rows
```

## How it works

1. **The team picks the documents** (about two per practice) and lists them
   in `manifest.csv`, tagged with the practices they support.
2. **The loading script** reads each document, splits it into short
   passages (keeping page numbers) and saves them in Supabase. If an
   embedding model is set up, each passage also gets an "embedding", a list
   of numbers that captures its meaning, so the search can match questions
   worded differently from the paper.
3. **When someone asks a question**, the website works out which practices
   it is about (from the words used, or the open practices in the person's
   current stage), finds the best passages for those practices, and gives
   them to the AI with the person's roadmap. The AI cites the passages it
   uses as [1], [2]; the website checks every citation against what the
   search found and lists those sources under the answer.

The team's notes are always shown first for their practice, because they
are written for innovators rather than researchers.

## One-time setup

1. **Database.** In Supabase, open SQL Editor, paste
   `docs/SUPABASE_LIBRARY.sql` and run it. It only adds new tables.
2. **Settings file.** In the project folder, create or edit `.env.local`
   (never commit this file) with:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=<Supabase → Project Settings → API → service_role key>
   LITELLM_TOKEN=<your Duke AI gateway key>
   LIBRARY_EMBEDDING_MODEL=<embedding model name, once confirmed, e.g. text-embedding-3-small>
   ```

   The service-role key can read and change everything in Supabase. Keep
   it private and never paste it into chat or commit it to GitHub.
3. **Website.** In Vercel → Project → Settings → Environment Variables, add
   `LIBRARY_EMBEDDING_MODEL` with the same value (`LITELLM_TOKEN` should
   already be there). Redeploy. The website and the loading script must use
   the same embedding model.

   No embedding model yet? Leave `LIBRARY_EMBEDDING_MODEL` out everywhere.
   The library still works with keyword search. When you add a model later,
   run the loading script with `--force` so every passage gets an embedding.

Install the project first if you haven't (`npm install`). The scripts run
with `npx tsx`, which downloads a small helper the first time.

## Adding documents

1. Save the PDF in `library/papers/` (or a `.txt` / `.md` file).
2. Add a row to `manifest.csv`. Excel or Google Sheets is fine; export as
   CSV.

   | Column | What to put |
   |---|---|
   | `slug` | Short unique name, lowercase with dashes, e.g. `who-ai-ethics-2021` |
   | `kind` | `paper` or `guidance` |
   | `title`, `authors`, `year`, `publisher` | As they should appear in the citation |
   | `url` | Public link where people can read it (DOI or official page) |
   | `license` | e.g. `CC BY 4.0`, `CC BY-NC-SA 3.0 IGO`, or `Duke Library access` |
   | `file` | File name in `library/papers/`, e.g. `who-ai-ethics-2021.pdf` |
   | `practices` | Practice names separated by `;` (exact names, listed below) |
   | `published` | `yes`, or `no` to hide it without deleting it |

3. Check the manifest (nothing is changed):

   ```
   npx tsx scripts/library/ingest.ts --check
   ```

   It lists any problems (a misspelt practice name, a missing file) and
   which practices still have fewer than two sources.
4. Load it:

   ```
   npx tsx scripts/library/ingest.ts
   ```

   Only new or changed documents are processed, so you can run it as often
   as you like. Add `--prune` to remove documents you deleted from the
   manifest, or `--force` to reload everything.

Scanned PDFs (pictures of pages) have no text to read; run them through
OCR first, for example Adobe Acrobat's "Recognize text".

## The "what to do next" notes

1. After loading the papers, draft notes with AI:

   ```
   npx tsx scripts/library/draft-notes.ts
   ```

   It writes `notes-draft.csv`: for each practice without an approved note,
   three to five practical sentences based only on that practice's sources.
2. **A person reviews every draft.** Edit the wording, check it against the
   sources, and copy approved rows into `notes.csv` with `approved` set to
   `yes`. Rows that aren't approved are never loaded.
3. Run `ingest.ts` again to load the approved notes.

## Checking the search

`eval-questions.csv` holds questions innovators are likely to ask. Fill in
`expected` with the slugs of the documents that should come up (separated
by `;`), then run:

```
npx tsx scripts/library/evaluate.ts
```

It shows, for each question, whether an expected document was found. Aim
for at least 80%. Run it after every library update.

## Copyright

- PDFs in `library/papers/` are **not** uploaded to GitHub (the repository
  is public). Each person who runs the loading script keeps their own copy.
- Prefer open-access papers and official guidance, and record the license.
- Passages are stored in Supabase only so the assistant can search them.
  The assistant is told to quote no more than one sentence and always links
  to the original.

## Practice names (copy exactly)

**Model Source:** Governance & Stewardship · Training Data Quality & Coverage · Timeliness · Data Interoperability & Reuse · Privacy & Security · Data Standards & Metadata

**Model Development:** Accuracy · Model Validation & Reliability · AI System Design · Cross-Population Performance · Bias & Fairness Assessment · Transparency & Explainability · Robustness

**Model Deployment:** Mechanism of Change · System Reliability & Capacity · Protocol & Safety Monitoring · Responsible Use of AI · Deployment Infrastructure & Integration · Implementation Outcomes

**Impact:** Outcome Improvement · Time to Action · Equity Effect · Financial Sustainability · Cost-Effectiveness · Continued Oversight

**Sustainability:** Financial Viability · Business Model Clarity · Health System Integration · Local Ownership & Capacity · Policy & Financing Alignment · Long-Term Oversight

The source of truth is `src/lib/roadmap/framework.ts`; the loading script
checks every name against it.

## Where the code is

| File | What it does |
|---|---|
| `docs/SUPABASE_LIBRARY.sql` | Tables and the `search_library` function |
| `scripts/library/ingest.ts` | Loading script |
| `scripts/library/draft-notes.ts` | AI drafts of the notes |
| `scripts/library/evaluate.ts` | Search test |
| `scripts/library/lib.ts`, `pdf-text.cjs` | Reading CSVs and PDFs, splitting into passages |
| `src/lib/library/search.ts` | The search, shared by the website and the scripts |
| `src/lib/library/practices.ts` | Works out which practices a question is about |
| `src/app/api/roadmap-help/route.ts` | The assistant: search, then answer with sources |
| `src/_components/roadmap/RoadmapAssistant.tsx` | The chat panel and its source list |
