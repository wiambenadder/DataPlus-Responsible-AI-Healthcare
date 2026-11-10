/**
 * Search the resource library (the RAG part of the Roadmap Assistant).
 *
 * Used by the website (src/app/api/roadmap-help) and by the team's scripts
 * (scripts/library), so both search exactly the same way. The database
 * side is `search_library()` in docs/SUPABASE_LIBRARY.sql.
 *
 * Keep this file free of Next.js imports so the scripts can use it.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import OpenAI from "openai";

export type Passage = {
  /** Number the assistant cites, e.g. [1]. */
  n: number;
  slug: string;
  title: string;
  kind: "paper" | "guidance" | "note";
  url: string | null;
  authors: string | null;
  year: number | null;
  page: number | null;
  content: string;
  practices: string[];
};

/** What the website sends back with an answer: one line per source. */
export type Source = Pick<Passage, "n" | "title" | "kind" | "url" | "page" | "authors" | "year">;

/** Duke AI gateway (OpenAI-compatible). LITELLM_BASE_URL is for testing. */
export const gateway = () => process.env.LITELLM_BASE_URL || "https://litellm.oit.duke.edu";

/**
 * Turns text into an embedding with the Duke AI gateway, or returns null
 * when no embedding model is set up (search then uses keywords only).
 *
 * Set LIBRARY_EMBEDDING_MODEL (e.g. "text-embedding-3-small") in the
 * website's environment AND when running the loading script; both must
 * use the same model.
 */
export async function embed(texts: string[]): Promise<number[][] | null> {
  const model = process.env.LIBRARY_EMBEDDING_MODEL;
  const key = process.env.LITELLM_TOKEN;
  if (!model || !key || texts.length === 0) return null;
  const client = new OpenAI({ apiKey: key, baseURL: gateway(), timeout: 20_000, maxRetries: 1 });
  // "float" is the format every gateway supports.
  const res = await client.embeddings.create({ model, input: texts, encoding_format: "float" });
  return res.data.map((d) => d.embedding);
}

/**
 * Finds the best passages for a question.
 *
 * `practices` narrows the search to documents tagged with those practices
 * (see detectPractices). If that finds nothing, it searches the whole
 * library instead.
 */
export async function searchLibrary(
  db: SupabaseClient,
  question: string,
  practices: string[] | null,
  options: { count?: number; embedding?: number[] | null } = {}
): Promise<Passage[]> {
  const count = options.count ?? 6;
  let embedding = options.embedding;
  if (embedding === undefined) {
    try {
      embedding = (await embed([question]))?.[0] ?? null;
    } catch (err) {
      // Keyword search still works without an embedding.
      console.error("Library: embedding failed, using keywords only", err);
      embedding = null;
    }
  }

  const run = async (filter: string[] | null) => {
    const { data, error } = await db.rpc("search_library", {
      query_text: question,
      query_embedding: embedding ? JSON.stringify(embedding) : null,
      practice_filter: filter && filter.length ? filter : null,
      collection_filter: "ai-readiness",
      match_count: count,
    });
    if (error) throw error;
    return (data ?? []) as Omit<Passage, "n">[];
  };

  let rows = await run(practices);
  if (rows.length === 0 && practices && practices.length) rows = await run(null);
  return rows.map((r, i) => ({ ...r, n: i + 1 }));
}

/** The passages as numbered text for the assistant's instructions. */
export function passagesForPrompt(passages: Passage[]): string {
  return passages
    .map((p) => {
      const who = p.kind === "note" ? "Innovator Insights team note" : [p.authors, p.year].filter(Boolean).join(", ");
      const where = p.page ? `, p. ${p.page}` : "";
      return `[${p.n}] ${p.title}${who ? ` (${who})` : ""}${where}\n${p.content.trim()}`;
    })
    .join("\n\n");
}

/**
 * Keeps only real citations: removes [n] markers that don't match a
 * passage and returns the sources actually cited, in order.
 */
export function citedSources(reply: string, passages: Passage[]): { reply: string; sources: Source[] } {
  const byN = new Map(passages.map((p) => [p.n, p]));
  const cited: number[] = [];
  const cleaned = reply.replace(/\[(\d{1,2})\]/g, (match, num) => {
    const n = Number(num);
    if (!byN.has(n)) return "";
    if (!cited.includes(n)) cited.push(n);
    return match;
  });
  const sources = cited.map((n) => {
    const p = byN.get(n)!;
    return { n, title: p.title, kind: p.kind, url: p.url, page: p.page, authors: p.authors, year: p.year };
  });
  // Tidy spaces left where a made-up citation was removed.
  const tidy = cleaned.replace(/ {2,}/g, " ").replace(/ +([.,;:!?])/g, "$1").trim();
  return { reply: tidy, sources };
}
