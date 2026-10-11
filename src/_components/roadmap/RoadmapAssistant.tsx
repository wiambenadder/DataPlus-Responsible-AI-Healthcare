"use client";

import { useImperativeHandle, useRef, useState, type Ref } from "react";
import { supabase } from "@/lib/supabase";
import {
  suggestedQuestions,
  type HelpContext,
  type HelpMessage,
} from "@/lib/help-guide";

export type AssistantHandle = { ask: (question: string) => void };

/**
 * Roadmap Assistant: a small chat panel for questions about the roadmap
 * and about using the site. Answers come from /api/roadmap-help.
 */
export default function RoadmapAssistant({
  context,
  ref,
}: {
  context: HelpContext | null;
  ref?: Ref<AssistantHandle>;
}) {
  const [messages, setMessages] = useState<HelpMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLElement>(null);

  const stage = context?.stages.find((s) => s.id === context.currentStage);
  const greeting = stage
    ? `Hello. You're in Stage ${stage.id}, ${stage.name}, with ${stage.practiced} of ${stage.total} practices met. Ask me what to work on next, what a practice means, or how to do something on the site.`
    : "Hello. Ask me what to work on next, what a practice means, or how to do something on the site.";

  async function send(text: string) {
    const question = text.trim();
    if (!question || busy) return;
    const next: HelpMessage[] = [...messages, { role: "user", content: question }];
    setMessages(next);
    setInput("");
    setError(null);
    setBusy(true);
    scrollDown();

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const res = await fetch("/api/roadmap-help", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ messages: next, context }),
      });
      const data = (await res.json().catch(() => ({}))) as { reply?: string; error?: string };
      if (!res.ok || !data.reply) throw new Error(data.error || "The assistant didn't respond.");
      setMessages((m) => [...m, { role: "assistant", content: data.reply! }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      // Put the question back so it can be sent again.
      setMessages((m) => m.slice(0, -1));
      setInput(question);
    } finally {
      setBusy(false);
      scrollDown();
    }
  }

  function scrollDown() {
    requestAnimationFrame(() => {
      const el = listRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }

  useImperativeHandle(ref, () => ({
    ask: (question: string) => {
      panelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      void send(question);
    },
  }));

  return (
    <section
      ref={panelRef}
      aria-labelledby="assistant-title"
      className="flex flex-col border border-slate-200 bg-white"
    >
      <div className="bg-brand-navy px-5 py-4 text-white">
        <h2 id="assistant-title" className="font-serif text-[1.5rem] font-medium text-white">
          Roadmap Assistant
        </h2>
        <p className="mt-0.5 text-[14px] text-blue-100">
          Ask how to move forward or how to use the site.
        </p>
      </div>

      <div
        ref={listRef}
        className="max-h-[26rem] min-h-[12rem] flex-1 space-y-4 overflow-y-auto px-5 py-4 text-[15px] leading-relaxed"
        aria-live="polite"
      >
        <p className="text-slate-800">{greeting}</p>

        {messages.map((m, i) =>
          m.role === "user" ? (
            <p key={i} className="ml-8 bg-blue-50 px-3.5 py-2.5 text-ink">
              {m.content}
            </p>
          ) : (
            <p key={i} className="whitespace-pre-line border-l-4 border-brand-navy pl-3.5 text-slate-800">
              {m.content}
            </p>
          )
        )}

        {busy && <p className="text-sm text-slate-500">Thinking…</p>}

        {messages.length === 0 && (
          <div>
            <p className="text-[0.75rem] font-bold uppercase tracking-[0.1em] text-slate-500">
              Try asking
            </p>
            <ul className="mt-2 space-y-2">
              {suggestedQuestions(context).map((q) => (
                <li key={q}>
                  <button
                    type="button"
                    onClick={() => send(q)}
                    className="w-full border border-slate-300 px-3 py-2 text-left text-[14.5px] text-brand-navy hover:border-brand-navy hover:bg-blue-50"
                  >
                    {q}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
        className="border-t border-slate-200 p-4"
      >
        <label htmlFor="assistant-input" className="sr-only">
          Your question
        </label>
        <textarea
          id="assistant-input"
          ref={inputRef}
          rows={2}
          value={input}
          maxLength={1500}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send(input);
            }
          }}
          placeholder="Type a question…"
          className="w-full resize-none border border-slate-300 p-2.5 text-[15px] placeholder:text-slate-400 focus:border-brand-dukeblue"
        />
        {error && (
          <p className="mt-1 text-sm text-rose-800" role="alert">
            {error} Your question is still here; press Send to try again.
          </p>
        )}
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500">Guidance only. It doesn&apos;t change your ratings.</p>
          <button type="submit" disabled={busy || !input.trim()} className="btn btn-primary py-2">
            Send
          </button>
        </div>
      </form>
    </section>
  );
}
