/**
 * Tone-aware regeneration service.
 *
 * Regenerates copy for a specific platform with a chosen tone/audience angle.
 * Proves the output is dynamic, not static — directly addresses Daniil's
 * "output doesn't change with input" critique.
 */

import { getGeminiConfig } from "../config";
import { PLATFORM_DETAILS, type Platform } from "./gemini";
import type { SourceContext } from "./source";

export type ToneOption = "casual" | "professional" | "developer" | "consumer" | "bold" | "minimal";

export const TONE_LABELS: Record<ToneOption, string> = {
  casual: "Casual & friendly",
  professional: "Professional & polished",
  developer: "Developer-focused",
  consumer: "Consumer & lifestyle",
  bold: "Bold & punchy",
  minimal: "Minimal & clean",
};

const TONE_INSTRUCTIONS: Record<ToneOption, string> = {
  casual: "Warm, conversational, like a friend recommending the app. Contractions ok. Keep it light.",
  professional: "Polished and credible. No slang. Lead with value and reliability.",
  developer: "Technical audience. Mention integration, performance, or developer-specific benefits. Skip fluff.",
  consumer: "Lifestyle-forward. Emotional resonance. Focus on how the user's life improves.",
  bold: "Short punchy sentences. Strong verbs. No hedging. Every word earns its place.",
  minimal: "Say as little as possible. No adjectives unless essential. Strip every filler phrase.",
};

async function callGemini(prompt: string): Promise<string> {
  const { apiKey, baseUrl, models } = getGeminiConfig();
  for (const model of models) {
    try {
      const res = await fetch(
        `${baseUrl}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.72, maxOutputTokens: 1024 },
          }),
          signal: AbortSignal.timeout(20_000),
        }
      );
      if (!res.ok) continue;
      const payload = await res.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
      const text = payload.candidates?.[0]?.content?.parts?.map(p => p.text ?? "").join("").trim();
      if (text) return text;
    } catch { /* try next */ }
  }
  throw new Error("Gemini unavailable for tone regeneration.");
}

export async function regenerateWithTone(
  context: SourceContext,
  platform: Platform,
  tone: ToneOption
): Promise<{ content: string; characterCount: number; characterLimit: number; tone: ToneOption }> {
  const details = PLATFORM_DETAILS[platform];
  const instruction = TONE_INSTRUCTIONS[tone];

  const prompt = `You are PITCHFORGE. Write ${details.label} marketing copy for this app.

Tone instruction: ${instruction}
Platform: ${details.label}
Character limit: ${details.limit}

App context:
Name: ${context.name}
Developer: ${context.developer ?? "unknown"}
Category: ${context.category ?? "unknown"}
Description: ${context.description.slice(0, 400)}
Rating: ${context.rating ?? "not rated"}

Return only the copy text, under ${details.limit} characters, nothing else.`;

  const content = (await callGemini(prompt)).slice(0, details.limit);
  return { content, characterCount: content.length, characterLimit: details.limit, tone };
}
