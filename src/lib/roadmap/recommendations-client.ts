import { supabase } from "@/lib/supabase";
import {
  needsRecommendation,
  type RecommendationOverview,
  type RecommendationPriority,
  type RecommendationResult,
} from "./recommendations";

export type RecommendationEntries = Partial<
  Record<string, RecommendationResult>
>;

const cacheKey = "ai-readiness-recommendations-v1";
const summaryCacheKey = "ai-readiness-recommendation-summary-v1";
const activeRuns = new Map<string, Promise<void>>();

function readSaved(snapshot: string): RecommendationEntries {
  try {
    const saved = JSON.parse(localStorage.getItem(cacheKey) ?? "null");
    if (saved?.snapshot === snapshot) return saved.entries;
  } catch {
    // Storage is optional.
  }
  return {};
}

function saveGenerated(snapshot: string, entries: RecommendationEntries) {
  try {
    const generated = Object.fromEntries(
      Object.entries(entries).filter(
        ([, result]) => result?.kind === "generated",
      ),
    );
    localStorage.setItem(
      cacheKey,
      JSON.stringify({ snapshot, entries: generated }),
    );
  } catch {
    // Storage is optional.
  }
}

async function request<T>(token: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch("/api/recommendations", {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  const payload = await response.json();
  if (!response.ok)
    throw new Error(payload.error || "We couldn’t load recommendations.");
  return payload;
}

export async function loadRecommendations(signal?: AbortSignal) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Log in to view recommendations.");

  const overview = await request<RecommendationOverview>(token, { signal });

  return {
    overview,
    prepare: (onProgress?: (entries: RecommendationEntries) => void) =>
      prepare(overview, token, onProgress),
    summarize: (entries: RecommendationEntries) =>
      summarize(overview, token, entries, signal),
  };
}

type Run = {
  entries: RecommendationEntries;
  listeners: Set<(entries: RecommendationEntries) => void>;
};

const progressBySnapshot = new Map<string, Run>();

async function prepare(
  overview: RecommendationOverview,
  token: string,
  onProgress?: (entries: RecommendationEntries) => void,
) {
  const { snapshot } = overview;
  const run = progressBySnapshot.get(snapshot) ?? {
    entries: readSaved(snapshot),
    listeners: new Set(),
  };
  if (onProgress) {
    run.listeners.add(onProgress);
    onProgress(run.entries);
  }

  const active = activeRuns.get(snapshot);
  if (active) {
    try {
      await active;
    } finally {
      if (onProgress) run.listeners.delete(onProgress);
    }
    return run.entries;
  }

  const queue = overview.practices
    .filter(
      (practice) => needsRecommendation(practice) && !run.entries[practice.id],
    )
    .map((practice) => practice.id);
  if (!queue.length) return run.entries;

  progressBySnapshot.set(snapshot, run);
  const work = (async () => {
    for (let start = 0; start < queue.length; start += 3) {
      const ids = queue.slice(start, start + 3);
      let batch: RecommendationEntries;
      try {
        batch = await request<RecommendationEntries>(token, {
          method: "POST",
          body: JSON.stringify({ ids, snapshot }),
        });
      } catch {
        batch = Object.fromEntries(
          ids.map((id) => [id, { kind: "unavailable" }]),
        );
      }
      run.entries = { ...run.entries, ...batch };
      saveGenerated(snapshot, run.entries);
      for (const notify of run.listeners) notify(run.entries);
    }
  })();
  activeRuns.set(snapshot, work);
  try {
    await work;
  } finally {
    activeRuns.delete(snapshot);
    progressBySnapshot.delete(snapshot);
  }
  return run.entries;
}

async function summarize(
  overview: RecommendationOverview,
  token: string,
  entries: RecommendationEntries,
  signal?: AbortSignal,
) {
  const summaryActions = overview.practices
    .filter(needsRecommendation)
    .flatMap(({ id }) => {
      const result = entries[id];
      return result?.kind === "generated"
        ? [{ id, action: result.action }]
        : [];
    });
  if (summaryActions.length === 0) return [];

  const payload = JSON.stringify({
    snapshot: overview.snapshot,
    summaryActions,
  });
  try {
    const saved = JSON.parse(localStorage.getItem(summaryCacheKey) ?? "null");
    if (saved?.payload === payload && Array.isArray(saved.priorities)) {
      return saved.priorities as RecommendationPriority[];
    }
  } catch {
    // Storage is optional.
  }

  const { priorities } = await request<{
    priorities: RecommendationPriority[];
  }>(token, {
    method: "POST",
    body: payload,
    signal,
  });
  try {
    localStorage.setItem(
      summaryCacheKey,
      JSON.stringify({ payload, priorities }),
    );
  } catch {
    // Storage is optional.
  }
  return priorities;
}

/** Starts preparation without delaying navigation to results. */
export function prepareAfterAssessment(scored: Response, period: string) {
  if (!scored.ok) return;
  void loadRecommendations()
    .then(({ overview, prepare }) => {
      if (overview.period === period) return prepare();
    })
    .catch(() => {
      // The Recommendations page can resume preparation when opened.
    });
}
