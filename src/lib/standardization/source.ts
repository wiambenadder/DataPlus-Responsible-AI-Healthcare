// src/lib/standardization/source.ts
//
// Input abstraction. The engine reads a `WorkbookSource` and never cares where the
// bytes came from. Today that is a File picked in the browser. Later it can be a
// file pulled from Supabase storage — only this file changes, not the engine.

import type { Schema } from "./schema";

export interface WorkbookSource {
  /** Display label — usually the file name. */
  name: string;
  /** Raw .xlsx bytes. */
  bytes: ArrayBuffer;
  /** Optional explicit company; if absent, inferred from `name`. */
  company?: string;
}

/** Build a source from a browser File (e.g. from an <input type="file">). */
export async function fromFile(file: File): Promise<WorkbookSource> {
  return { name: file.name, bytes: await file.arrayBuffer() };
}

/** Build sources from a FileList / array of Files. */
export async function fromFiles(files: FileList | File[]): Promise<WorkbookSource[]> {
  return Promise.all(Array.from(files).map(fromFile));
}

/**
 * PLACEHOLDER for later. The upload page currently just stores files in Supabase;
 * once the bucket/table shape is decided, implement this to download bytes by key.
 * Kept here so the engine's input contract is already in place.
 */
export async function fromSupabase(_opts: {
  bucket: string;
  path: string;
  company?: string;
}): Promise<WorkbookSource> {
  throw new Error(
    "fromSupabase() is not implemented yet. Wire this up once the storage " +
      "bucket/table is finalized; the engine already accepts WorkbookSource.",
  );
}

/** Best-effort company name from a file name (mirrors the original pipeline's logic). */
export function inferCompany(name: string): string {
  let base = name.replace(/\.[^.]+$/, ""); // drop extension
  base = base.replace(/GHIG9[_\s]*reporting[_\s]*tool[_\s]*12[_\s]*month/i, "");
  base = base.replace(/_corrected/i, "").replace(/___?\d+_?/g, "");
  base = base.replace(/[_\s]+/g, " ").trim();
  return base || name;
}

export type { Schema };
