/**
 * Roadmap Assistant.
 *
 * POST { messages: [{ role, content }...], context: HelpContext }
 * Header: Authorization: Bearer <Supabase access token>
 *
 * Answers questions about the company's roadmap and about using the site.
 * Uses the Duke LiteLLM gateway (same as the other AI routes) when
 * LITELLM_TOKEN is set; otherwise, or if the model fails, it answers from
 * the built-in guide in src/lib/help-guide.ts so people always get help.
 *
 * Optional env: HELP_CHAT_MODEL (default "gpt-5.2").
 *
 * Response: { reply: string, source: "ai" | "guide" }
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import {
  buildSystemPrompt,
  guideAnswer,
  type HelpContext,
  type HelpMessage,
} from "@/lib/help-guide";

const MAX_MESSAGES = 12;
const MAX_CHARS = 1500;

export async function POST(request: NextRequest) {
  // Signed-in users only.
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) {
    return NextResponse.json({ error: "Please log in to use the assistant." }, { status: 401 });
  }
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: auth, error: authError } = await supabase.auth.getUser(token);
  if (authError || !auth?.user) {
    return NextResponse.json({ error: "Please log in to use the assistant." }, { status: 401 });
  }

  let body: { messages?: unknown; context?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const messages = sanitizeMessages(body.messages);
  const last = messages[messages.length - 1];
  if (!last || last.role !== "user") {
    return NextResponse.json({ error: "Ask a question first." }, { status: 400 });
  }
  const context = sanitizeContext(body.context);

  if (process.env.LITELLM_TOKEN) {
    try {
      const openai = new OpenAI({
        apiKey: process.env.LITELLM_TOKEN,
        baseURL: "https://litellm.oit.duke.edu",
        timeout: 30_000,
        maxRetries: 1,
      });
      const completion = await openai.chat.completions.create({
        model: process.env.HELP_CHAT_MODEL || "gpt-5.2",
        messages: [{ role: "system", content: buildSystemPrompt(context) }, ...messages],
      });
      const reply = completion.choices[0]?.message?.content?.trim();
      if (reply) return NextResponse.json({ reply, source: "ai" });
    } catch (err) {
      console.error("Roadmap assistant: model call failed, using the guide", err);
    }
  }

  return NextResponse.json({ reply: guideAnswer(last.content, context), source: "guide" });
}

function sanitizeMessages(raw: unknown): HelpMessage[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (m): m is HelpMessage =>
        !!m &&
        typeof m === "object" &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0
    )
    .slice(-MAX_MESSAGES)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));
}

function sanitizeContext(raw: unknown): HelpContext | null {
  if (!raw || typeof raw !== "object") return null;
  const c = raw as Partial<HelpContext>;
  if (!Array.isArray(c.stages)) return null;
  const str = (v: unknown, n = 120) => (typeof v === "string" ? v.slice(0, n) : "");
  const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : 0);
  return {
    company: typeof c.company === "string" ? c.company.slice(0, 120) : null,
    currentStage: num(c.currentStage) || 1,
    overall: { met: num(c.overall?.met), total: num(c.overall?.total) },
    stages: c.stages.slice(0, 6).map((s) => ({
      id: num(s?.id),
      name: str(s?.name),
      practiced: num(s?.practiced),
      total: num(s?.total),
      needed: num(s?.needed),
      state: str(s?.state, 20),
      practices: (Array.isArray(s?.practices) ? s.practices : []).slice(0, 10).map((p) => ({
        name: str(p?.name),
        domain: str(p?.domain),
        status: str(p?.status, 30),
      })),
    })),
  };
}
