/**
 * Drafts the per-practice "what to do next" notes with AI, for the team
 * to review.
 *
 *   npx tsx scripts/library/draft-notes.ts          practices without an approved note
 *   npx tsx scripts/library/draft-notes.ts --all    every practice
 *
 * Run it after ingest.ts has loaded the papers. For each practice it
 * reads the best passages from that practice's sources and asks the Duke
 * AI gateway for a short, practical note based only on them.
 *
 * Output: library/notes-draft.csv. Nothing goes to the website until a
 * person reviews a note, edits it if needed, copies the row into
 * library/notes.csv with approved = yes, and runs ingest.ts again.
 */
import path from "node:path";
import OpenAI from "openai";
import { DEFINITIONS } from "../../src/lib/definitions";
import { gateway, passagesForPrompt, searchLibrary } from "../../src/lib/library/search";
import { LIBRARY_DIR, PRACTICES, adminClient, loadEnv, need, readCsv, writeCsv } from "./lib";

const INSTRUCTIONS = `You help health AI innovators in low- and middle-income countries.
Write a short "what to do next" note for one practice of an AI readiness framework.

Rules:
- 3 to 5 sentences, plain language, no jargon, no headings or bullet points.
- Practical: what a small team could start doing in the next few months.
- Use ONLY the numbered passages provided. Do not add facts from elsewhere.
- Cite the passages you use as [1], [2].
- If the passages don't support useful advice, reply only with: NOT ENOUGH SOURCES`;

async function main() {
  loadEnv();
  const all = process.argv.includes("--all");
  const db = adminClient();
  const ai = new OpenAI({ apiKey: need("LITELLM_TOKEN"), baseURL: gateway(), timeout: 60_000 });
  const model = process.env.LIBRARY_NOTES_MODEL || "gpt-5.2";

  const approved = new Set(
    readCsv(path.join(LIBRARY_DIR, "notes.csv"))
      .filter((r) => /^(yes|true|1)$/i.test(r.approved || ""))
      .map((r) => r.practice)
  );
  const targets = PRACTICES.filter((p) => all || !approved.has(p));
  const drafts: Record<string, string>[] = [];

  for (const practice of targets) {
    const definition = DEFINITIONS.find((d) => d.subtopic === practice)?.definition ?? "";
    // Notes themselves are excluded so a draft is based on the papers.
    const passages = (await searchLibrary(db, `${practice}. ${definition}`, [practice], { count: 8 })).filter(
      (p) => p.kind !== "note" && p.practices.includes(practice)
    );
    if (passages.length === 0) {
      console.log(`  - ${practice}: no sources loaded yet, skipped`);
      continue;
    }
    const res = await ai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: INSTRUCTIONS },
        {
          role: "user",
          content: `Practice: ${practice}\nWhat it covers: ${definition}\n\nPassages:\n${passagesForPrompt(passages)}`,
        },
      ],
    });
    const text = res.choices[0]?.message?.content?.trim() ?? "";
    const used = [...new Set([...text.matchAll(/\[(\d+)\]/g)].map((m) => passages[Number(m[1]) - 1]?.slug).filter(Boolean))];
    drafts.push({
      practice,
      note: text.replace(/\s*\[\d+\]/g, ""),
      sources: used.join("; "),
      approved: "",
      reviewer_notes: text.startsWith("NOT ENOUGH") ? "Add better sources for this practice" : "",
    });
    console.log(`  ✓ ${practice}`);
  }

  const out = path.join(LIBRARY_DIR, "notes-draft.csv");
  writeCsv(out, drafts, ["practice", "note", "sources", "approved", "reviewer_notes"]);
  console.log(`\nWrote ${drafts.length} drafts to library/notes-draft.csv. Review them, then copy approved rows into library/notes.csv.`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
