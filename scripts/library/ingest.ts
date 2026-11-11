/**
 * Loads the resource library into Supabase.
 *
 *   npx tsx scripts/library/ingest.ts --check   check the manifest only
 *   npx tsx scripts/library/ingest.ts           load new and changed documents
 *   npx tsx scripts/library/ingest.ts --force   reload everything
 *   npx tsx scripts/library/ingest.ts --prune   also remove documents no
 *                                               longer in the manifest
 *
 * Reads library/manifest.csv (papers and guidance) and library/notes.csv
 * (the team's approved per-practice notes). Each document is split into
 * passages, given an embedding if LIBRARY_EMBEDDING_MODEL is set, and
 * saved. Unchanged documents are skipped, so it is safe to run often.
 *
 * Full instructions: library/README.md
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { embed } from "../../src/lib/library/search";
import {
  LIBRARY_DIR,
  PRACTICES,
  adminClient,
  chunkPages,
  closestPractice,
  list,
  loadEnv,
  readCsv,
  readPages,
  slugify,
  downloadPdf,
  type Chunk,
} from "./lib";

type Doc = {
  slug: string;
  kind: "paper" | "guidance" | "note";
  title: string;
  authors: string;
  year: number | null;
  publisher: string;
  url: string;
  license: string;
  practices: string[];
  published: boolean;
  /** Where the text comes from: a file, or (for notes) the note itself. */
  file?: string;
  text?: string;
};

const args = new Set(process.argv.slice(2));
const CHECK = args.has("--check");
const FORCE = args.has("--force");
const PRUNE = args.has("--prune");

async function main() {
  loadEnv();
  const { docs, problems } = readLibrary();

  // ---- 1. Check the manifest ------------------------------------------
  console.log(`Manifest: ${docs.filter((d) => d.kind !== "note").length} documents, ${docs.filter((d) => d.kind === "note").length} approved notes.`);
  reportCoverage(docs);
  if (problems.length) {
    console.log("\nProblems to fix first:");
    problems.forEach((p) => console.log(`  - ${p}`));
    process.exit(1);
  }
  if (CHECK) {
    console.log("\nManifest looks good. Run without --check to load it.");
    return;
  }

  // ---- 2. Load ----------------------------------------------------------
  const db = adminClient();
  if (!process.env.LIBRARY_EMBEDDING_MODEL) {
    console.log("\nLIBRARY_EMBEDDING_MODEL is not set: loading without embeddings (keyword search only).");
  }
  const { data: existing, error } = await db.from("library_documents").select("id, slug, content_hash, kind");
  if (error) throw new Error(`Can't read library_documents. Has docs/SUPABASE_LIBRARY.sql been run? ${error.message}`);
  const bySlug = new Map((existing ?? []).map((d) => [d.slug as string, d]));

  let loaded = 0;
  let skipped = 0;
  for (const doc of docs) {
    if (doc.text === undefined && !fs.existsSync(doc.file!)) {
      const ok = doc.url ? await downloadPdf(doc.url, doc.file!) : false;
      if (!ok) {
        console.log(`  ! ${doc.slug}: couldn't download a PDF from its link. Save the PDF as library/papers/${path.basename(doc.file!)} and run again.`);
        continue;
      }
      console.log(`  ↓ ${doc.slug}: downloaded from its link`);
    }
    const pages = doc.text !== undefined ? [doc.text] : await readPages(doc.file!);
    const chunks = chunkPages(pages, 1200, 200, doc.kind !== "note");
    if (chunks.length === 0) {
      console.log(`  ! ${doc.slug}: no text found (is it a scanned PDF? It needs OCR first). Skipped.`);
      continue;
    }
    const hash = crypto
      .createHash("sha256")
      .update(JSON.stringify({ ...doc, file: undefined, text: undefined }))
      .update(pages.join("\f"))
      .update(process.env.LIBRARY_EMBEDDING_MODEL ?? "")
      .digest("hex");
    if (!FORCE && bySlug.get(doc.slug)?.content_hash === hash) {
      skipped++;
      continue;
    }
    await saveDocument(db, doc, chunks, hash, bySlug.get(doc.slug)?.id as string | undefined);
    loaded++;
    console.log(`  ✓ ${doc.slug}: ${chunks.length} passages`);
  }

  // ---- 3. Documents that left the manifest -----------------------------
  const keep = new Set(docs.map((d) => d.slug));
  const gone = (existing ?? []).filter((d) => !keep.has(d.slug as string));
  if (gone.length) {
    if (PRUNE) {
      await db.from("library_documents").delete().in("id", gone.map((d) => d.id));
      console.log(`\nRemoved ${gone.length} documents no longer in the manifest.`);
    } else {
      console.log(`\n${gone.length} documents in Supabase are no longer in the manifest: ${gone.map((d) => d.slug).join(", ")}. Run with --prune to remove them.`);
    }
  }
  console.log(`\nDone: ${loaded} loaded, ${skipped} unchanged.`);
}

/** Reads manifest.csv and notes.csv and checks every row. */
function readLibrary(): { docs: Doc[]; problems: string[] } {
  const problems: string[] = [];
  const docs: Doc[] = [];
  const seen = new Set<string>();

  const checkPractices = (where: string, names: string[]) => {
    if (names.length === 0) problems.push(`${where}: no practices listed.`);
    for (const p of names) {
      if (!PRACTICES.includes(p)) problems.push(`${where}: "${p}" is not a practice name. Did you mean "${closestPractice(p)}"?`);
    }
  };

  readCsv(path.join(LIBRARY_DIR, "manifest.csv")).forEach((row, i) => {
    const where = `manifest.csv row ${i + 2}`;
    const slug = row.slug || slugify(row.title || "");
    if (!slug) return problems.push(`${where}: needs a slug or title.`);
    if (seen.has(slug)) problems.push(`${where}: slug "${slug}" is used twice.`);
    seen.add(slug);
    const kind = (row.kind || "paper").toLowerCase();
    if (kind !== "paper" && kind !== "guidance") problems.push(`${where}: kind must be "paper" or "guidance".`);
    // "subdomains" is accepted too, in case the team's sheet uses that word.
    const practices = list(row.practices || row.subdomains);
    checkPractices(where, practices);
    // No file? The PDF is downloaded from `url` when loading, if it's an
    // open-access PDF link. Otherwise save the PDF in library/papers/.
    const file = path.join(LIBRARY_DIR, "papers", row.file || `${slug}.pdf`);
    if (!row.file && !row.url) problems.push(`${where}: add the file name (saved in library/papers/) or a link to the PDF.`);
    else if (row.file && !fs.existsSync(file)) problems.push(`${where}: file library/papers/${row.file} not found.`);
    if (!row.license) problems.push(`${where}: add the license (e.g. "CC BY 4.0", or "Duke Library access").`);
    docs.push({
      slug,
      kind: kind as Doc["kind"],
      title: row.title,
      authors: row.authors,
      year: row.year ? Number(row.year) : null,
      publisher: row.publisher,
      url: row.url,
      license: row.license,
      practices,
      published: !/^(no|false|0)$/i.test(row.published || "yes"),
      file,
    });
  });

  readCsv(path.join(LIBRARY_DIR, "notes.csv")).forEach((row, i) => {
    if (!/^(yes|true|1)$/i.test(row.approved || "")) return; // drafts aren't loaded
    const where = `notes.csv row ${i + 2}`;
    checkPractices(where, [row.practice]);
    for (const s of list(row.sources)) if (!seen.has(s)) problems.push(`${where}: source "${s}" isn't in manifest.csv.`);
    const titles = list(row.sources).map((s) => docs.find((d) => d.slug === s)?.title).filter(Boolean);
    docs.push({
      slug: `note-${slugify(row.practice)}`,
      kind: "note",
      title: `What to do next: ${row.practice}`,
      authors: "Innovator Insights team",
      year: null,
      publisher: "",
      url: "",
      license: "",
      practices: [row.practice],
      published: true,
      text: row.note + (titles.length ? `\n\nBased on: ${titles.join("; ")}.` : ""),
    });
  });

  return { docs, problems };
}

function reportCoverage(docs: Doc[]) {
  const sources = (p: string) => docs.filter((d) => d.kind !== "note" && d.practices.includes(p)).length;
  const missing = PRACTICES.filter((p) => sources(p) < 2);
  const notes = new Set(docs.filter((d) => d.kind === "note").flatMap((d) => d.practices));
  console.log(`Practices with 2+ sources: ${PRACTICES.length - missing.length} of ${PRACTICES.length}. With an approved note: ${notes.size} of ${PRACTICES.length}.`);
  if (missing.length) console.log(`Fewer than 2 sources: ${missing.map((p) => `${p} (${sources(p)})`).join(", ")}`);
}

async function saveDocument(
  db: ReturnType<typeof adminClient>,
  doc: Doc,
  chunks: Chunk[],
  hash: string,
  existingId?: string
) {
  const row = {
    slug: doc.slug,
    kind: doc.kind,
    title: doc.title,
    authors: doc.authors || null,
    year: doc.year,
    publisher: doc.publisher || null,
    url: doc.url || null,
    license: doc.license || null,
    published: doc.published,
    // Set only after every passage is saved (below), so a run that fails
    // halfway is retried next time instead of being skipped.
    content_hash: null,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await db.from("library_documents").upsert(row, { onConflict: "slug" }).select("id").single();
  if (error || !data) throw new Error(`${doc.slug}: ${error?.message}`);
  const id = (data.id as string) ?? existingId;

  // Replace practice tags and passages.
  await db.from("library_document_practices").delete().eq("document_id", id);
  await db.from("library_chunks").delete().eq("document_id", id);
  const tags = doc.practices.map((subdomain) => ({ document_id: id, subdomain }));
  const { error: tagError } = await db.from("library_document_practices").insert(tags);
  if (tagError) throw new Error(`${doc.slug} practices: ${tagError.message}`);

  for (let i = 0; i < chunks.length; i += 64) {
    const batch = chunks.slice(i, i + 64);
    // Title in front of each passage helps the search find it.
    const vectors = await embed(batch.map((c) => `${doc.title}\n${c.content}`));
    // The database stores 1536 numbers per passage (docs/SUPABASE_LIBRARY.sql).
    if (vectors && vectors[0]?.length !== 1536) {
      throw new Error(
        `The embedding model returns ${vectors[0]?.length} numbers per passage, but the database expects 1536. Change 1536 in docs/SUPABASE_LIBRARY.sql to ${vectors[0]?.length} (see the note at the top of that file), or use text-embedding-3-small.`
      );
    }
    const rows = batch.map((c, j) => ({
      document_id: id,
      chunk_index: c.index,
      page: c.page,
      content: c.content,
      embedding: vectors ? JSON.stringify(vectors[j]) : null,
    }));
    const { error: chunkError } = await db.from("library_chunks").insert(rows);
    if (chunkError) throw new Error(`${doc.slug} passages: ${chunkError.message}`);
  }
  await db.from("library_documents").update({ content_hash: hash }).eq("id", id);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
