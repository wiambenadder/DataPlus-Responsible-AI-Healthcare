# Integration Notes — wiring the standardization module into DataPlus

Read this once before moving files. It covers: what to delete, what to add, the
install step, how to organize the branch, and the Supabase/`.env` situation.

---

## 1. The structure problem to fix first

`main` uses a **`src/`** layout (`src/app`, `src/lib`) and your `@/*` alias points
at `./src/*` (confirmed in `tsconfig.json`). Your earlier standardization work was
created at the **repo root** (`app/`, `lib/`). Those two layouts can't coexist.

**Target layout (everything under `src/`):**

```
src/
  app/
    standardize/
      page.tsx              # thin server wrapper (keep yours)
      StandardizeClient.tsx # 'use client' island (keep yours, see §4)
    upload/page.tsx         # existing, unchanged
  lib/
    supabase.ts             # existing, unchanged
    standardization/        # <-- REPLACE entirely with the files in this package
docs/
  STEP3_DATA_STANDARDISATION_SPEC.md   # <-- replace with this package's version
```

---

## 2. What to remove vs. replace

**Delete (wrong location or superseded):**

- Any root-level `app/` and `lib/` directories from your earlier work — the real
  ones live under `src/`. If a root `app/` duplicates `src/app/`, remove the root copy.
- Your previous `lib/standardization/*.ts` — they are replaced wholesale.

**Replace with this package:**

- `src/lib/standardization/` → use all files here:
  `schema.json`, `types.ts`, `schema.ts`, `normalize.ts`, `catalog.ts`,
  `parse.ts`, `source.ts`, `engine.ts`, `aggregate.ts`, `export.ts`, `index.ts`.
- `docs/STEP3_DATA_STANDARDISATION_SPEC.md` → this package's version.

**Add at repo root (if missing):**

- `.gitignore` (this package's version) — see §5.
- `GROUND_RULES.md` (included) — referenced by the spec.

**Keep as-is:** `src/app/standardize/page.tsx`, `StandardizeClient.tsx`,
`src/app/upload/page.tsx`, `src/lib/supabase.ts`.

The biggest change vs. what you had: the schema is no longer hardcoded in
`schema.ts`. It now lives in `schema.json` and `schema.ts` is a typed loader.
That is the "schema is data, not code" rule — edit indicators in the JSON.

---

## 3. Install the two new dependencies

```bash
npm install xlsx fuzzball
```

Both ship their own TypeScript types — no `@types/*` needed. The module
typechecks clean under your exact `tsconfig.json` (strict mode) and was verified
end-to-end against the five reference files.

---

## 4. Wiring the page (browser island)

Keep the work in the `'use client'` island you already have. That is the right
call for Next.js 16 — it sidesteps every breaking change in this version (async
`params`/`cookies`/`headers`, the `use cache` directive, Turbopack, `proxy.ts`).
Inside `StandardizeClient.tsx`:

```ts
"use client";
import { fromFiles, processAll, buildExports, downloadBlob } from "@/lib/standardization";

const EXPECTED = ["Jacaranda Health","Bive","Sevamob","mDoc","Munai Health","Simprints"];

async function onRun(files: FileList) {
  const sources = await fromFiles(files);
  const run = processAll(sources, EXPECTED);
  const bundle = buildExports(run, EXPECTED);
  bundle.companyWorkbooks.forEach(w => downloadBlob(w.blob, `${w.company}_cleaned.xlsx`));
  downloadBlob(bundle.funderQuantitative, "funder_view_quantitative.csv");
  downloadBlob(bundle.funderQualitative, "funder_view_qualitative.csv");
  downloadBlob(bundle.log, "standardization_log.json");
}
```

Note: `downloadBlob` touches `document`, so only call it in the client island,
never in a server component or Server Action.

---

## 5. Supabase and `.gitignore` — what actually matters

`src/lib/supabase.ts` is **fine to keep in the repo**. It contains no secrets —
only references to environment variables:

```ts
process.env.NEXT_PUBLIC_SUPABASE_URL!
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
```

The actual values go in a local file named **`.env.local`**, which the included
`.gitignore` excludes. So each person keeps their own keys locally and they never
get pushed. Create your `.env.local` (do not commit it):

```
NEXT_PUBLIC_SUPABASE_URL=...your project url...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...your anon key...
```

If `.env.local` was ever committed before the `.gitignore` existed, untrack it
once with `git rm --cached .env.local` and commit that change.

(One caveat: `NEXT_PUBLIC_` variables are exposed to the browser by design. The
anon key is meant to be protected by Supabase Row Level Security, not secrecy —
so set up RLS on your tables/buckets. The service-role key must never carry a
`NEXT_PUBLIC_` prefix and never reaches the client.)

The engine does **not** read Supabase yet, and that's intentional — storing files
in Supabase can come later. For now, files come straight from the upload input
via `fromFiles()`. When you finalize the bucket/table, implement `fromSupabase()`
in `source.ts`; nothing else changes.

---

## 6. Branch workflow

Since your work already landed on `main`, do the restructure on a fresh branch
and open a PR rather than committing to `main` directly:

```bash
git checkout main
git pull origin main
git checkout -b refactor/standardization-src-layout

# move into src/ with history preserved (if root copies still exist)
git mv app/standardize src/app/standardize 2>/dev/null || true
git mv lib/standardization src/lib/standardization 2>/dev/null || true

# drop in the replacement files from this package, then:
npm install xlsx fuzzball
npx tsc --noEmit          # must pass
npm run dev               # smoke-test /standardize

git add -A
git commit -m "Restructure standardization into src/ and replace engine (schema-as-data)"
git push -u origin refactor/standardization-src-layout
# open PR #3
```

Keeping it on a branch + PR means a teammate can review the structure change, and
`main` stays deployable while you work.

---

## 7. Quick checklist

- [ ] root `app/` and `lib/` removed; everything under `src/`
- [ ] `src/lib/standardization/` replaced with this package
- [ ] `docs/STEP3_DATA_STANDARDISATION_SPEC.md` replaced
- [ ] `.gitignore` and `GROUND_RULES.md` at repo root
- [ ] `npm install xlsx fuzzball`
- [ ] `.env.local` created locally, not committed
- [ ] `npx tsc --noEmit` passes
- [ ] `/standardize` runs and downloads the cleaned files
