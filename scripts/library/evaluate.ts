/**
 * Checks that the library search finds the right sources.
 *
 *   npx tsx scripts/library/evaluate.ts
 *
 * Reads library/eval-questions.csv: each row is a question an innovator
 * might ask, plus the slugs of the documents that should come up. It runs
 * the same search the Roadmap Assistant uses and reports, for each
 * question, whether an expected document is in the top results.
 *
 * Run it after every library update. Aim for at least 80% found.
 */
import path from "node:path";
import { detectPractices } from "../../src/lib/library/practices";
import { searchLibrary } from "../../src/lib/library/search";
import { LIBRARY_DIR, adminClient, list, loadEnv, readCsv } from "./lib";

async function main() {
  loadEnv();
  const db = adminClient();
  const rows = readCsv(path.join(LIBRARY_DIR, "eval-questions.csv")).filter((r) => r.question);
  if (!rows.length) {
    console.log("No questions in library/eval-questions.csv yet.");
    return;
  }

  let found = 0;
  for (const row of rows) {
    const expected = list(row.expected);
    // Same practice detection as the website, without a roadmap context.
    const practices = list(row.practices).length ? list(row.practices) : detectPractices(row.question, null).practices;
    const passages = await searchLibrary(db, row.question, practices);
    const slugs = [...new Set(passages.map((p) => p.slug))];
    const hit = expected.length === 0 || expected.some((s) => slugs.includes(s));
    if (hit) found++;
    console.log(`${hit ? "✓" : "✗"} ${row.question}`);
    if (!hit) console.log(`    expected ${expected.join(", ")}; got ${slugs.join(", ") || "nothing"}`);
  }
  const pct = Math.round((found / rows.length) * 100);
  console.log(`\nFound an expected source for ${found} of ${rows.length} questions (${pct}%).`);
  if (pct < 80) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
