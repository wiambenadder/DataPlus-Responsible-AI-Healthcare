/**
 * Shared helpers for the library scripts (ingest, draft-notes, evaluate).
 * See library/README.md for how to use them.
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";
import { DOMAINS } from "../../src/lib/roadmap/framework";

export const ROOT = path.resolve(__dirname, "../..");
// LIBRARY_DIR can point elsewhere for testing; normally the repo's library/.
export const LIBRARY_DIR = process.env.LIBRARY_DIR || path.join(ROOT, "library");

/** Reads .env.local (the same file `npm run dev` uses), if present. */
export function loadEnv() {
  const file = path.join(ROOT, ".env.local");
  if (fs.existsSync(file)) process.loadEnvFile(file);
}

export function need(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(`Missing ${name}. Add it to .env.local (see library/README.md).`);
    process.exit(1);
  }
  return v;
}

/** Supabase client with the server key: it can write to the library. */
export function adminClient() {
  return createClient(need("NEXT_PUBLIC_SUPABASE_URL"), need("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Every practice name in the framework, exactly as the website uses it. */
export const PRACTICES = DOMAINS.flatMap((d) => d.subdomains);

/** Suggests the closest practice name for a typo in the manifest. */
export function closestPractice(name: string): string {
  const words = new Set(name.toLowerCase().split(/\W+/));
  let best = PRACTICES[0];
  let bestScore = -1;
  for (const p of PRACTICES) {
    const score = p.toLowerCase().split(/\W+/).filter((w) => words.has(w)).length;
    if (score > bestScore) [best, bestScore] = [p, score];
  }
  return best;
}

/* ------------------------------------------------------------------ */
/* CSV (Excel and Google Sheets both export this format)               */
/* ------------------------------------------------------------------ */

export function readCsv(file: string): Record<string, string>[] {
  if (!fs.existsSync(file)) return [];
  const text = fs.readFileSync(file, "utf8").replace(/^﻿/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += ch;
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  const [header, ...body] = rows.filter((r) => r.some((c) => c.trim()));
  if (!header) return [];
  const keys = header.map((h) => h.trim().toLowerCase());
  return body.map((r) => Object.fromEntries(keys.map((k, i) => [k, (r[i] ?? "").trim()])));
}

export function writeCsv(file: string, rows: Record<string, string>[], keys: string[]) {
  const esc = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const lines = [keys.join(","), ...rows.map((r) => keys.map((k) => esc(r[k] ?? "")).join(","))];
  fs.writeFileSync(file, lines.join("\n") + "\n");
}

/** "a; b; c" → ["a", "b", "c"] */
export const list = (v: string | undefined) =>
  (v ?? "")
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);

/* ------------------------------------------------------------------ */
/* Reading documents                                                   */
/* ------------------------------------------------------------------ */

/** Text of each page of a PDF (or the whole text of a .txt / .md file). */
export async function readPages(file: string): Promise<string[]> {
  const buf = fs.readFileSync(file);
  if (/\.(txt|md)$/i.test(file)) return [buf.toString("utf8")];
  // PDFs are read by pdf-text.cjs in a separate plain Node process: the
  // PDF reader bundled in pdf-parse breaks when loaded alongside tsx.
  const out = execFileSync(process.execPath, [path.join(__dirname, "pdf-text.cjs"), file], {
    maxBuffer: 200 * 1024 * 1024,
  });
  return JSON.parse(out.toString("utf8")) as string[];
}

export type Chunk = { index: number; page: number | null; content: string };

/**
 * Splits pages into passages of about `size` characters, overlapping by
 * `overlap`, so a sentence cut at the edge still appears whole in one
 * passage. Each passage remembers the page it starts on.
 */
export function chunkPages(pages: string[], size = 1200, overlap = 200, paged = true): Chunk[] {
  const chunks: Chunk[] = [];
  pages.forEach((raw, p) => {
    const text = raw.replace(/-\n(\w)/g, "$1").replace(/[ \t]+/g, " ").replace(/\n{2,}/g, "\n\n").trim();
    if (text.length < 40) return; // blank or cover pages
    let start = 0;
    while (start < text.length) {
      let end = Math.min(text.length, start + size);
      // End on a sentence or paragraph break when one is near.
      if (end < text.length) {
        const window = text.slice(start + Math.floor(size * 0.6), end);
        const cut = Math.max(window.lastIndexOf(". "), window.lastIndexOf("\n"));
        if (cut > 0) end = start + Math.floor(size * 0.6) + cut + 1;
      }
      const content = text.slice(start, end).trim();
      if (content.length >= 40) chunks.push({ index: chunks.length, page: paged ? p + 1 : null, content });
      if (end >= text.length) break;
      start = Math.max(end - overlap, start + 1);
    }
  });
  return chunks;
}

export const slugify = (s: string) =>
  s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
