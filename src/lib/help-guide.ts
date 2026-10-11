/**
 * Knowledge for the Roadmap Assistant (src/app/api/roadmap-help).
 *
 * - `HelpContext` is the company's roadmap, sent by the roadmap page so
 *   answers can be specific ("you need one more practice in Stage 1").
 * - `buildSystemPrompt` tells the language model how the site works.
 * - `guideAnswer` is a built-in answer used when the language model isn't
 *   configured or doesn't respond, so the assistant always helps.
 *
 * Keep the site description here in step with the pages it describes.
 */
import { DEFINITIONS } from "./definitions";
import { STAGES } from "./roadmap/framework";

export type HelpPractice = {
  name: string;
  domain: string;
  /** "Met" | "Not met yet" | "No evidence yet" | "Under review" */
  status: string;
};

export type HelpStage = {
  id: number;
  name: string;
  practiced: number;
  total: number;
  /** Practices needed to move on (half the stage, rounded up). */
  needed: number;
  state: string;
  practices: HelpPractice[];
};

export type HelpContext = {
  company: string | null;
  currentStage: number;
  overall: { met: number; total: number };
  stages: HelpStage[];
};

export type HelpMessage = { role: "user" | "assistant"; content: string };

/* ------------------------------------------------------------------ */
/* How the site works                                                  */
/* ------------------------------------------------------------------ */

const SITE_GUIDE = `
Innovator Insights is a free website from Innovations in Healthcare, built with a Duke University team. It assesses how ready a health AI tool is for real-world use against 31 practices in five domains: Model Source (the data the model learns from), Model Development (how it is built and tested), Model Deployment (how it runs safely in care), Impact (what changes, and at what cost) and Sustainability (whether it can last).

Pages:
- Home (/): overview of the company, practices met, the five domains and next steps.
- Submit Evidence > Upload Documents and Answer Questions (/report/assessment): upload PDFs or other documents the team already has (reports, evaluations, policies, decks). The platform reads them and maps passages to practices. Then it asks short questions only about practices the documents did not cover. Answers can be updated later.
- Submit Evidence > Your Submissions (/report/history): every document and answer already sent, with links to open them.
- Results (/dashboard): every practice with its status, the reason for the rating, a summary, confidence, and the evidence (an exact passage or the answer as typed) with a link to the source document. Each practice has an "Is this right?" choice: "This is accurate", "Needs revision" (with optional reasons) or "Wrong source or company". A comment is optional, and comments can be edited or deleted. A "Wrong source or company" report puts the practice under review, and it is not counted as met until the team reviews it. There is a Download PDF button.
- Roadmap (/roadmap): the practices grouped into six stages in the order an AI tool usually matures. Meeting half the practices in a stage (rounded up) means the team can move on to the next stage; meeting all of them completes the stage.
- Account > Company and Team (/company): invite colleagues by email, see pending invitations and cancel them.
- The Framework (/framework): what each domain and practice means and how ratings work.
- How We Use Your Data (/data-use).

Statuses on the Results page: "Meets criterion", "Partially meets", "Does not currently meet" (evidence does not yet show it in place), "Not reported" (nothing submitted covers it) and "Needs verification" (someone reported a wrong source). On the Roadmap these read "Met", "Not met yet", "No evidence yet" and "Under review".

What counts as met: something already in place — a process, policy, team, responsibility, workflow, metric or regular activity. Informal, early-stage or unmeasured practices count. Plans, intentions or awareness without action do not count. If evidence is unclear, the practice is not counted as met.

Stages:
${STAGES.map((s) => `${s.id}. ${s.name}: ${s.description}`).join("\n")}
`.trim();

const PRACTICES = DEFINITIONS.map((d) => `- ${d.subtopic} (${d.domain}): ${d.definition}`).join("\n");

function describeContext(ctx: HelpContext | null): string {
  if (!ctx || !ctx.stages.length) return "No roadmap data was provided for this company.";
  const lines = [
    `Company: ${ctx.company ?? "unknown"}. Practices met overall: ${ctx.overall.met} of ${ctx.overall.total}. Current stage: ${ctx.currentStage}.`,
  ];
  for (const s of ctx.stages) {
    lines.push(
      `Stage ${s.id} ${s.name} (${s.state}): ${s.practiced} of ${s.total} met; ${s.needed} needed to move on. ` +
        s.practices.map((p) => `${p.name} [${p.domain}]: ${p.status}`).join("; ")
    );
  }
  return lines.join("\n");
}

export function buildSystemPrompt(ctx: HelpContext | null): string {
  return `You are the Roadmap Assistant on Innovator Insights. You help health innovators understand their AI readiness roadmap and use the website.

Rules:
- Answer in plain, friendly, professional English, in two to six short sentences or a short list. Use sentence case. Spell out numbers one through nine.
- Be specific to this company's roadmap when the question is about progress. Name the practices and the page to use, with its menu path (for example "Submit Evidence > Upload Documents and Answer Questions").
- Never invent ratings, evidence, documents or features. You cannot see the company's documents, only the statuses below. You cannot change ratings; to dispute a rating, point to "Is this right?" on the Results page.
- Do not give legal, regulatory or medical advice. For country rules, say the Policy Codebook is coming soon.
- If you don't know, say so and suggest the Framework page or contacting the Innovations in Healthcare team.

How the site works:
${SITE_GUIDE}

The 31 practices and what evidence each looks for:
${PRACTICES}

This company's roadmap:
${describeContext(ctx)}`;
}

/* ------------------------------------------------------------------ */
/* Built-in answers (no language model needed)                         */
/* ------------------------------------------------------------------ */

const NUM = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
const spell = (n: number) => NUM[n] ?? String(n);

function list(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function findPractice(q: string) {
  const norm = (s: string) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z ]/g, " ");
  const nq = ` ${norm(q)} `;
  // Full name first, then the distinctive first word(s).
  return (
    DEFINITIONS.find((d) => nq.includes(` ${norm(d.subtopic).trim()} `)) ??
    DEFINITIONS.find((d) => {
      const words = norm(d.subtopic).split(/\s+/).filter((w) => w.length > 4 && w !== "model");
      return words.length > 0 && words.some((w) => nq.includes(` ${w} `));
    })
  );
}

function stageAnswer(ctx: HelpContext | null): string {
  if (!ctx || !ctx.stages.length) {
    return "Your roadmap fills in once you have results. Go to Submit Evidence > Upload Documents and Answer Questions to upload what you have; the stages update as soon as your ratings are ready.";
  }
  const stage = ctx.stages.find((s) => s.id === ctx.currentStage) ?? ctx.stages[0];
  const toGo = Math.max(0, stage.needed - stage.practiced);
  const noEvidence = stage.practices.filter((p) => p.status === "No evidence yet").map((p) => p.name);
  const notMet = stage.practices.filter((p) => p.status === "Not met yet").map((p) => p.name);
  const review = stage.practices.filter((p) => p.status === "Under review").map((p) => p.name);

  if (stage.state === "complete" && stage.id === 6) {
    return "You have met every practice in all six stages. Keep your evidence current: upload new documents when something changes, so your results stay accurate.";
  }

  const parts = [
    `You are in Stage ${stage.id}, ${stage.name}, with ${stage.practiced} of ${stage.total} practices met.`,
    toGo > 0
      ? `Meet ${spell(toGo)} more to move on to Stage ${Math.min(6, stage.id + 1)}.`
      : `You have met enough to move on to Stage ${Math.min(6, stage.id + 1)}; meeting the rest completes this stage.`,
  ];
  if (noEvidence.length)
    parts.push(
      `The quickest wins are usually practices with no evidence yet: ${list(noEvidence)}. If you already do these, upload a document that shows it or answer the question about it under Submit Evidence.`
    );
  if (notMet.length)
    parts.push(
      `${list(notMet)} ${notMet.length === 1 ? "is" : "are"} rated not met yet. Open ${notMet.length === 1 ? "it" : "them"} on the Results page to see why, then add evidence of anything already in place.`
    );
  if (review.length)
    parts.push(`${list(review)} ${review.length === 1 ? "is" : "are"} under review after a wrong-source report.`);
  return parts.join(" ");
}

const TOPICS: { test: RegExp; answer: string }[] = [
  {
    test: /upload|document|file|pdf|report.*(send|add)|add evidence|submit/i,
    answer:
      "Go to Submit Evidence > Upload Documents and Answer Questions. Upload the documents you already have, such as annual reports, evaluations, policies or pitch decks. The platform reads them and links passages to practices, then asks short questions only about practices they don't cover. You can come back and update your answers at any time; Your Submissions lists everything you have sent.",
  },
  {
    test: /wrong|incorrect|disagree|dispute|mistake|feedback|comment|revis/i,
    answer:
      "Open the practice on the Results page and use \"Is this right?\". Choose \"This is accurate\", \"Needs revision\" (you can pick reasons such as \"We answered this, but it wasn't picked up\") or \"Wrong source or company\". A comment is optional, and you can edit or delete your own comments. A wrong-source report marks the practice as under review, and it isn't counted as met until the team reviews it.",
  },
  {
    test: /not reported|no evidence|status|mean|partially|verification|under review|not met/i,
    answer:
      "\"No evidence yet\" (\"Not reported\" on Results) means nothing you submitted covers the practice. \"Not met yet\" (\"Does not currently meet\") means the evidence doesn't yet show the practice in place. \"Under review\" (\"Needs verification\") means someone reported that the rating rests on the wrong source or company. A practice counts as met when something is already in place; informal practices count, but plans don't.",
  },
  {
    test: /invite|team|colleague|member|add (a )?user/i,
    answer:
      "Go to Account > Company and Team. Enter a colleague's email address to invite them; pending invitations are listed there, and you can cancel one if it went to the wrong address.",
  },
  {
    test: /download|export|print|share/i,
    answer:
      "On the Results page, use Download PDF to save a copy of every practice with its status and reasoning. You can also copy a link to any domain or practice to share it with your team.",
  },
  {
    test: /privacy|data use|who (can )?see|confidential|secure/i,
    answer:
      "The How We Use Your Data page explains how your documents and answers are used. Avoid uploading patient-identifiable information; the platform only needs evidence about your tool and how it is run.",
  },
  {
    test: /count|met\b|criteria|criterion|how.*rat/i,
    answer:
      "A practice counts as met when your documents or answers describe something already in place: a process, policy, team, responsibility, workflow, metric or regular activity. Informal or early-stage practices count. Plans, intentions or awareness without action don't, and unclear evidence isn't counted. The Framework page explains each practice.",
  },
  {
    test: /financ|fund|grant|policy|regulat|law|country/i,
    answer:
      "The Financing Codebook and Policy Codebook are coming soon; you can preview them under All Tools. For now, the Sustainability domain covers financial viability, the business model and alignment with national policy and financing.",
  },
];

/** Answer from the site guide alone, used when the model isn't available. */
export function guideAnswer(question: string, ctx: HelpContext | null): string {
  const q = question.trim();
  const practice = findPractice(q);
  if (practice) {
    const p = ctx?.stages.flatMap((s) => s.practices).find((x) => x.name === practice.subtopic);
    return [
      `${practice.subtopic} (${practice.domain}) looks for: ${practice.definition}`,
      p ? `Your current status: ${p.status}.` : "",
      "It counts as met when something is already in place; informal practices count, plans don't.",
      "To add evidence, go to Submit Evidence > Upload Documents and Answer Questions and upload a document that shows it, or answer the question about it.",
    ]
      .filter(Boolean)
      .join(" ");
  }
  if (/stage|next|move on|progress|roadmap|advance|improve|priorit|focus|start/i.test(q)) {
    return stageAnswer(ctx);
  }
  const topic = TOPICS.find((t) => t.test.test(q));
  if (topic) return topic.answer;
  return `I can help with your roadmap and with using the site. Try asking what to do to reach the next stage, what a practice such as Privacy & Security looks for, how to upload documents, or how to report a rating that looks wrong. ${stageAnswer(ctx)}`;
}

/** Suggested first questions shown in the assistant. */
export function suggestedQuestions(ctx: HelpContext | null): string[] {
  const stage = ctx?.stages.find((s) => s.id === ctx.currentStage);
  const firstOpen =
    stage?.practices.find((p) => p.status === "No evidence yet") ??
    stage?.practices.find((p) => p.status === "Not met yet");
  return [
    stage && stage.id < 6 ? `How do I reach Stage ${stage.id + 1}?` : "What should I work on next?",
    firstOpen ? `What evidence counts for ${firstOpen.name}?` : "What counts as met?",
    "How do I upload a document?",
    "A rating looks wrong. What can I do?",
  ];
}
