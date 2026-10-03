"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  deleteFeedback,
  fetchCompanyFeedback,
  insertFeedback,
  normalizeName,
  rowToEntry,
  updateFeedback,
  type FeedbackDraft,
  type FeedbackEntry,
  type FeedbackKind,
} from "@/lib/feedback";

/**
 * All feedback for one company, held at page level.
 *
 * Because this lives above the collapsible sections, collapsing a domain
 * or subdomain no longer throws away what was submitted (the original
 * "my comment disappeared" bug). Everything is loaded from the database
 * on page load, so it also survives refreshes and coming back later.
 *
 * Unsent drafts are kept here too, so a half-written comment survives
 * collapsing its section.
 */
export function useFeedback(opts: {
  companyId: string | null;
  companyName: string | null;
}) {
  const { companyId, companyName } = opts;

  const [entries, setEntries] = useState<FeedbackEntry[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">(
    "loading"
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, FeedbackDraft>>({});
  const [now, setNow] = useState(() => Date.now());

  // Keep "Saved 2 minutes ago" current.
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  // Fetch, then apply the result. State is only set in the promise
  // callbacks, so this is safe to start from an effect.
  const fetchAll = useCallback(() => {
    if (!companyId) return;
    fetchCompanyFeedback(companyId).then(
      (rows) => {
        // Keep anything still in flight (or failed) locally.
        setEntries((prev) => [...rows, ...prev.filter((e) => e.id === null)]);
        setLoadState("ready");
      },
      (err) => {
        setLoadError(err instanceof Error ? err.message : String(err));
        setLoadState("error");
      }
    );
  }, [companyId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const load = useCallback(() => {
    setLoadState("loading");
    setLoadError(null);
    fetchAll();
  }, [fetchAll]);

  const bySubdomain = useMemo(() => {
    const map = new Map<string, FeedbackEntry[]>();
    for (const e of entries) {
      const k = normalizeName(e.subdomain);
      const list = map.get(k) ?? [];
      list.push(e);
      map.set(k, list);
    }
    return map;
  }, [entries]);

  const forSubdomain = useCallback(
    (subdomain: string) => bySubdomain.get(normalizeName(subdomain)) ?? [],
    [bySubdomain]
  );

  const patch = (key: string, changes: Partial<FeedbackEntry>) =>
    setEntries((prev) =>
      prev.map((e) => (e.key === key ? { ...e, ...changes } : e))
    );

  /* ---------------- drafts ---------------- */

  const emptyDraft: FeedbackDraft = { kind: null, reasons: [], comment: "" };

  const getDraft = useCallback(
    (subdomain: string) => drafts[normalizeName(subdomain)] ?? emptyDraft,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [drafts]
  );

  const setDraft = useCallback(
    (subdomain: string, update: Partial<FeedbackDraft>) =>
      setDrafts((prev) => {
        const k = normalizeName(subdomain);
        return {
          ...prev,
          [k]: { ...(prev[k] ?? { kind: null, reasons: [], comment: "" }), ...update },
        };
      }),
    []
  );

  /* ---------------- delete ---------------- */

  const remove = useCallback(
    async (key: string) => {
      const entry = entries.find((e) => e.key === key);
      if (!entry) return;

      // Never reached the database: just drop it.
      if (entry.id === null) {
        setEntries((prev) => prev.filter((e) => e.key !== key));
        return;
      }

      patch(key, { sync: "deleting", error: undefined });
      try {
        await deleteFeedback(entry.id);
        setEntries((prev) => prev.filter((e) => e.key !== key));
      } catch (err) {
        patch(key, {
          sync: "delete_failed",
          error: err instanceof Error ? err.message : String(err),
        });
      }
    },
    [entries]
  );

  /* ---------------- create / retry ---------------- */

  // Context needed to save a new entry (question/answer of the assessed row).
  const contextRef = useRef(
    new Map<string, { question: string | null; answer: string | null }>()
  );

  const runInsert = useCallback(
    async (entry: FeedbackEntry) => {
      if (!companyId) return false;
      patch(entry.key, { sync: "saving", error: undefined });
      const ctx = contextRef.current.get(entry.key) ?? {
        question: null,
        answer: null,
      };
      try {
        const row = await insertFeedback({
          companyId,
          companyName,
          domain: entry.domain,
          subdomain: entry.subdomain,
          question: ctx.question,
          answer: ctx.answer,
          kind: entry.kind,
          reasons: entry.reasons,
          comment: entry.comment,
        });
        const saved = rowToEntry(row);
        setEntries((prev) =>
          prev.map((e) =>
            e.key === entry.key
              ? { ...saved, key: entry.key, savedAt: saved.savedAt ?? Date.now() }
              : e
          )
        );
        contextRef.current.delete(entry.key);
        return true;
      } catch (err) {
        patch(entry.key, {
          sync: "save_failed",
          error: err instanceof Error ? err.message : String(err),
        });
        return false;
      }
    },
    [companyId, companyName]
  );

  /**
   * Adds the entry to the list straight away ("Saving…"), then saves it.
   * The draft is only cleared once the database confirms the save.
   */
  const submit = useCallback(
    async (args: {
      domain: string;
      subdomain: string;
      kind: FeedbackKind;
      reasons: string[];
      comment: string;
      question: string | null;
      answer: string | null;
    }) => {
      const k = normalizeName(args.subdomain);
      const draft = drafts[k];

      // Resubmitting after a failure reuses the failed entry, not a copy.
      const failedKey = draft?.pendingKey;
      const key =
        failedKey && entries.some((e) => e.key === failedKey)
          ? failedKey
          : `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

      const entry: FeedbackEntry = {
        key,
        id: null,
        domain: args.domain,
        subdomain: args.subdomain,
        kind: args.kind,
        reasons: args.kind === "needs_revision" ? args.reasons : [],
        comment: args.comment.trim(),
        reporterId: null,
        reporterEmail: null,
        reviewStatus: "open",
        savedAt: null,
        sync: "saving",
      };
      contextRef.current.set(key, {
        question: args.question,
        answer: args.answer,
      });

      setEntries((prev) =>
        prev.some((e) => e.key === key)
          ? prev.map((e) => (e.key === key ? entry : e))
          : [...prev, entry]
      );
      setDrafts((prev) => ({
        ...prev,
        [k]: { ...(prev[k] ?? emptyDraft), pendingKey: key },
      }));

      const ok = await runInsert(entry);
      if (ok) {
        setDrafts((prev) => {
          const next = { ...prev };
          delete next[k];
          return next;
        });
      }
      return ok;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [drafts, entries, runInsert]
  );

  const retry = useCallback(
    (key: string) => {
      const entry = entries.find((e) => e.key === key);
      if (!entry) return;
      if (entry.sync === "delete_failed") {
        remove(key);
        return;
      }
      runInsert(entry).then((ok) => {
        if (!ok) return;
        setDrafts((prev) => {
          const next = { ...prev };
          for (const [k, d] of Object.entries(next)) {
            if (d.pendingKey === key) delete next[k];
          }
          return next;
        });
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [entries, runInsert]
  );

  /* ---------------- edit ---------------- */

  /** Not optimistic: the edit form stays open until the save succeeds. */
  const edit = useCallback(
    async (
      key: string,
      kind: FeedbackKind,
      reasons: string[],
      comment: string
    ) => {
      const entry = entries.find((e) => e.key === key);
      if (!entry || entry.id === null) return false;
      try {
        const row = await updateFeedback(
          entry.id,
          kind,
          kind === "needs_revision" ? reasons : [],
          comment
        );
        const saved = rowToEntry(row);
        patch(key, {
          ...saved,
          key,
          savedAt: Date.now(),
          error: undefined,
        });
        return true;
      } catch (err) {
        throw err instanceof Error ? err : new Error(String(err));
      }
    },
    [entries]
  );

  return {
    entries,
    loadState,
    loadError,
    reload: load,
    now,
    forSubdomain,
    getDraft,
    setDraft,
    submit,
    retry,
    edit,
    remove,
  };
}

export type FeedbackApi = ReturnType<typeof useFeedback>;
