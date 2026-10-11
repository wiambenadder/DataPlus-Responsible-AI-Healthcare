/**
 * Turns raw database rows into what an assessment card shows:
 * a status, a confidence level, a plain-language summary, why that
 * result was given, the evidence it rests on and where that evidence
 * came from.
 *
 * Inputs (all for one company):
 *   qualitative_responses — one row per piece of evidence per subdomain,
 *     with the AI rating (`ai_assessment`) and its explanation.
 *     Document rows have question "Evidence extracted from a.pdf, b.pdf".
 *   domain_mapping        — per-document extracts behind document rows,
 *     with the file name, upload id and the extractor's confidence.
 *   uploads               — file name, storage path and upload date.
 */

import { DEFINITIONS } from "@/lib/definitions";
import { formatDate, normalizeName } from "@/lib/feedback-format";

/* ------------------------------------------------------------------ */
/* Row shapes                                                          */
/* ------------------------------------------------------------------ */

export type ResponseRow = {
  id: string;
  domain: string | null;
  Subtopic: string;
  ai_assessment: string | null;
  ai_reasoning: string | null;
  question: string | null;
  answer: string | null;
  bullet_point_summary: string | null;
  reporting_period: string | null;
  created_at?: string | null;
};

export type MappingRow = {
  id: number | string;
  domain: string | null;
  subtopic: string | null;
  source_quotes: string | null;
  source_pdf: string | null;
  confidence: number | null;
  upload_id: string | null;
  /** Optional, for when extraction starts saving them (see docs/AI_PROMPT_CHANGES.md). */
  source_excerpt?: string | null;
  page_number?: number | null;
};

export type UploadRow = {
  id: string;
  file_name: string | null;
  file_url: string | null;
  created_at: string | null;
};

/* ------------------------------------------------------------------ */
/* Status                                                              */
/* ------------------------------------------------------------------ */

export type Status =
  | "meets"
  | "partial"
  | "not_met"
  | "not_reported"
  | "needs_verification";

export const STATUS_META: Record<
  Status,
  { label: string; badge: string; dot: string; order: number }
> = {
  meets: {
    label: "Meets criterion",
    badge: "border-brand-darkteal/30 bg-[#e7f2f2] text-brand-darkteal",
    dot: "bg-brand-darkteal",
    order: 0,
  },
  partial: {
    label: "Partially meets",
    badge: "border-brand-bronze/35 bg-[#fbf1e4] text-[#7d4708]",
    dot: "bg-brand-bronze",
    order: 1,
  },
  not_met: {
    label: "Does not currently meet",
    badge: "border-[#a63a1b]/30 bg-[#f9ebe6] text-[#8c2d12]",
    dot: "bg-[#a63a1b]",
    order: 2,
  },
  not_reported: {
    label: "Not reported",
    badge: "border-slate-300 bg-slate-100 text-slate-700",
    dot: "bg-slate-400",
    order: 3,
  },
  needs_verification: {
    label: "Needs verification",
    badge: "border-brand-dukeblue/30 bg-blue-50 text-brand-dukeblue",
    dot: "bg-brand-dukeblue",
    order: 4,
  },
};

export const STATUS_ORDER: Status[] = [
  "meets",
  "partial",
  "not_met",
  "not_reported",
  "needs_verification",
];

/**
 * The assessment step currently writes "Practiced" / "Not Practiced".
 * "Partial…" is recognised so a three-level rating shows up correctly as
 * soon as the assessment prompt starts producing it.
 */
export function statusFromRating(rating: string | null | undefined): Status | null {
  const r = normalizeName(rating);
  if (!r) return null;
  if (r.includes("partial")) return "partial";
  if (r.startsWith("not") || r === "no") return "not_met";
  if (r === "practiced" || r === "yes" || r.startsWith("meets")) return "meets";
  return null;
}

/* ------------------------------------------------------------------ */
/* Confidence                                                          */
/* ------------------------------------------------------------------ */

export type Confidence = "high" | "moderate" | "needs_verification" | "self_reported";

export const CONFIDENCE_META: Record<Confidence, { label: string; help: string }> = {
  high: {
    label: "High",
    help: "The source states this explicitly.",
  },
  moderate: {
    label: "Moderate",
    help: "The source supports this, but not in full detail.",
  },
  needs_verification: {
    label: "Needs verification",
    help: "The supporting evidence is thin or has been questioned. Check the source.",
  },
  self_reported: {
    label: "Self-reported",
    help: "Based on an answer your team typed into the assessment.",
  },
};

function confidenceFromScore(score: number): Confidence {
  if (score >= 0.9) return "high";
  if (score >= 0.75) return "moderate";
  return "needs_verification";
}

/* ------------------------------------------------------------------ */
/* Evidence                                                            */
/* ------------------------------------------------------------------ */

export type EvidenceItem = {
  key: string;
  kind: "document" | "interview";
  /** The supporting text. */
  text: string;
  /** True when `text` is exactly what the company wrote or said. */
  verbatim: boolean;
  /** For interview answers: the question that was asked. */
  question: string | null;
  sourceTitle: string;
  sourceDate: string;
  /** Storage path of the original PDF, when we can find it. */
  sourcePath: string | null;
  reportingPeriod: string | null;
  /** Extractor confidence (0–1) for document evidence. */
  score: number | null;
  /** Rating of this piece of evidence, for "other evidence on file". */
  rating: Status | null;
  /** Exact passage from the document, when extraction provides one. */
  quote?: string | null;
  /** PDF page of `quote`, when known. */
  page?: number | null;
};

export type SubdomainResult = {
  domain: string;
  subdomain: string;
  /** e.g. "model-source--accuracy" — used for deep links. */
  anchor: string;
  criterion: string | null;
  /** Status from the data alone (before any feedback is considered). */
  baseStatus: Status;
  baseConfidence: Confidence | null;
  summary: string | null;
  /** The row the result comes from (its question/answer go with feedback). */
  primary: ResponseRow | null;
  evidence: EvidenceItem[];
  otherEvidence: EvidenceItem[];
  /** Reporting period of the result, if any. */
  reportingPeriod: string | null;
};

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function subdomainAnchor(domain: string, subdomain: string) {
  return `${slugify(domain)}--${slugify(subdomain)}`;
}

const DOC_PREFIX = "evidence extracted from";

export function isDocumentRow(row: ResponseRow | null | undefined): boolean {
  return normalizeName(row?.question).startsWith(DOC_PREFIX);
}

/** "Evidence extracted from a.pdf, b.pdf" → ["a.pdf", "b.pdf"] */
function filesFromQuestion(question: string | null): string[] {
  if (!question) return [];
  const rest = question.trim().slice(DOC_PREFIX.length).trim();
  return rest
    .split(/,\s+/)
    .map((f) => f.trim())
    .filter(Boolean);
}

export function parseBullets(summary: string | null | undefined): string[] {
  if (!summary) return [];
  return summary
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^[-•*]\s*|^\d+[.)]\s*/, "").trim())
    .filter(Boolean);
}

export function lookupCriterion(domain: string, subdomain: string): string | null {
  const d = normalizeName(domain);
  const s = normalizeName(subdomain);
  return (
    DEFINITIONS.find(
      (x) => normalizeName(x.domain) === d && normalizeName(x.subtopic) === s
    )?.definition ??
    DEFINITIONS.find((x) => normalizeName(x.subtopic) === s)?.definition ??
    null
  );
}

/* ------------------------------------------------------------------ */
/* Builder                                                             */
/* ------------------------------------------------------------------ */

export function buildResults(args: {
  framework: [string, string[]][];
  responses: ResponseRow[];
  mappings: MappingRow[];
  uploads: UploadRow[];
}): Map<string, SubdomainResult> {
  const { framework, responses, mappings, uploads } = args;

  const uploadById = new Map(uploads.map((u) => [String(u.id), u]));
  const uploadByName = new Map(
    uploads.map((u) => [normalizeName(u.file_name), u])
  );

  // Oldest → newest, so the last row for a subdomain is the latest result
  // (the same "latest wins" rule as the home page and the roadmap).
  const ordered = [...responses].sort((a, b) => {
    const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
    const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
    return ta - tb;
  });

  const responsesBySub = new Map<string, ResponseRow[]>();
  for (const r of ordered) {
    const k = normalizeName(r.Subtopic);
    if (!k) continue;
    responsesBySub.set(k, [...(responsesBySub.get(k) ?? []), r]);
  }

  const mappingsBySub = new Map<string, MappingRow[]>();
  for (const m of mappings) {
    const k = normalizeName(m.subtopic);
    if (!k) continue;
    mappingsBySub.set(k, [...(mappingsBySub.get(k) ?? []), m]);
  }

  function findUpload(m: { upload_id?: string | null; source_pdf?: string | null }) {
    return (
      (m.upload_id ? uploadById.get(String(m.upload_id)) : undefined) ??
      uploadByName.get(normalizeName(m.source_pdf)) ??
      null
    );
  }

  function documentEvidence(row: ResponseRow, rating: Status | null): EvidenceItem[] {
    const subMappings = mappingsBySub.get(normalizeName(row.Subtopic)) ?? [];

    if (subMappings.length > 0) {
      return subMappings
        .filter((m) => (m.source_quotes ?? "").trim())
        .map((m) => {
          const upload = findUpload(m);
          return {
            key: `map-${m.id}`,
            kind: "document" as const,
            text: (m.source_quotes ?? "").trim(),
            verbatim: false,
            question: null,
            sourceTitle: upload?.file_name ?? m.source_pdf ?? "Uploaded document",
            sourceDate: formatDate(upload?.created_at),
            sourcePath: upload?.file_url ?? null,
            reportingPeriod: row.reporting_period,
            score: typeof m.confidence === "number" ? m.confidence : null,
            rating,
            quote: m.source_excerpt?.trim() || null,
            page: typeof m.page_number === "number" ? m.page_number : null,
          };
        });
    }

    // No per-document extracts on file: fall back to the row itself.
    const files = filesFromQuestion(row.question);
    const upload = files.length === 1 ? uploadByName.get(normalizeName(files[0])) : null;
    const bullets = parseBullets(row.bullet_point_summary);
    return [
      {
        key: `row-${row.id}`,
        kind: "document",
        text: bullets.length ? bullets.join("\n") : (row.answer ?? "").trim(),
        verbatim: false,
        question: null,
        sourceTitle: files.length ? files.join(", ") : "Uploaded documents",
        sourceDate: formatDate(upload?.created_at ?? row.created_at),
        sourcePath: upload?.file_url ?? null,
        reportingPeriod: row.reporting_period,
        score: null,
        rating,
      },
    ];
  }

  function interviewEvidence(row: ResponseRow, rating: Status | null): EvidenceItem {
    return {
      key: `row-${row.id}`,
      kind: "interview",
      text: (row.answer ?? "").trim(),
      verbatim: true,
      question: row.question,
      sourceTitle: row.reporting_period
        ? `Assessment answer · ${row.reporting_period}`
        : "Assessment answer",
      sourceDate: formatDate(row.created_at),
      sourcePath: null,
      reportingPeriod: row.reporting_period,
      score: null,
      rating,
    };
  }

  function evidenceFor(row: ResponseRow): EvidenceItem[] {
    const rating = statusFromRating(row.ai_assessment);
    return isDocumentRow(row)
      ? documentEvidence(row, rating)
      : [interviewEvidence(row, rating)];
  }

  const results = new Map<string, SubdomainResult>();

  for (const [domain, subdomains] of framework) {
    for (const subdomain of subdomains) {
      const rows = responsesBySub.get(normalizeName(subdomain)) ?? [];
      const primary = rows.length ? rows[rows.length - 1] : null;
      const rated = statusFromRating(primary?.ai_assessment);

      const evidence = primary ? evidenceFor(primary).filter((e) => e.text) : [];
      const otherEvidence = rows
        .slice(0, -1)
        .reverse()
        .flatMap(evidenceFor)
        .filter((e) => e.text);

      // Status: what the latest rating says; evidence without a rating
      // yet needs a look; nothing at all is "not reported".
      const baseStatus: Status =
        rated ?? (primary ? "needs_verification" : "not_reported");

      // Confidence: extractor scores for documents, "self-reported" for
      // typed answers.
      let baseConfidence: Confidence | null = null;
      if (primary) {
        if (isDocumentRow(primary)) {
          const scores = evidence
            .map((e) => e.score)
            .filter((s): s is number => typeof s === "number");
          baseConfidence = scores.length
            ? confidenceFromScore(Math.max(...scores))
            : null;
        } else {
          baseConfidence = "self_reported";
        }
      }

      results.set(normalizeName(subdomain), {
        domain,
        subdomain,
        anchor: subdomainAnchor(domain, subdomain),
        criterion: lookupCriterion(domain, subdomain),
        baseStatus,
        baseConfidence,
        summary: primary?.ai_reasoning?.trim() || null,
        primary,
        evidence,
        otherEvidence,
        reportingPeriod: primary?.reporting_period ?? null,
      });
    }
  }

  return results;
}

/* ------------------------------------------------------------------ */
/* Explanations                                                        */
/* ------------------------------------------------------------------ */

/** One or two sentences on how the evidence maps to the criterion. */
export function whyThisResult(
  status: Status,
  opts: { disputed: boolean; hasEvidence: boolean }
): string {
  if (opts.disputed) {
    return "Someone on your team reported that this result may rest on the wrong source or company. Treat it as provisional until the team has checked it.";
  }
  switch (status) {
    case "meets":
      return "The evidence describes a practice or process that is already in place for this criterion, so the criterion is counted as met. The framework checks that a practice exists, not how mature it is.";
    case "partial":
      return "The evidence covers part of this criterion but leaves parts of it unaddressed.";
    case "not_met":
      return "The evidence does not describe a practice that is already in place for this criterion. This can also mean the relevant work wasn't covered in the material provided — when the evidence is unclear, the platform does not count the criterion as met.";
    case "needs_verification":
      return opts.hasEvidence
        ? "Evidence for this criterion is on file but has not been rated yet."
        : "This result needs to be checked before it is relied on.";
    case "not_reported":
    default:
      return "Nothing submitted so far covers this criterion: no answer was given and no uploaded document mentions it. It has not been assessed.";
  }
}
