import OpenAI from "openai";
import { gateway } from "@/lib/library/search";
import type { HelpMessage } from "@/lib/help-guide";

/** Shared model entry point for chat and assessment recommendations. */
export async function generateAssistantReply(
  system: string,
  messages: HelpMessage[],
  signal?: AbortSignal,
): Promise<string | undefined> {
  const apiKey = process.env.LITELLM_TOKEN;
  if (!apiKey) return;
  const client = new OpenAI({
    apiKey,
    baseURL: gateway(),
    timeout: 30_000,
    maxRetries: 0,
  });
  const completion = await client.chat.completions.create(
    {
      model: process.env.HELP_CHAT_MODEL || "gpt-5.2",
      messages: [{ role: "system", content: system }, ...messages],
    },
    { signal },
  );
  return completion.choices[0]?.message?.content?.trim();
}
