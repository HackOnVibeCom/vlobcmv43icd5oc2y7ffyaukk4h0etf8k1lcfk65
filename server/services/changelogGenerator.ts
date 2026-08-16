/**
 * Update / Changelog copy generator.
 *
 * Generates "What's New" release-note copy per platform for a version update.
 * Turns PITCHFORGE from a one-time launch tool into an ongoing workflow —
 * directly answers Mike's "would people use it again" criterion.
 */

import { getGeminiConfig } from "../config";
import type { SourceContext } from "./source";

export type ChangelogPlatform = "appStore" | "googlePlay" | "twitter" | "linkedin" | "productHunt";

export type ChangelogOutput = {
  platform: ChangelogPlatform;
  label: string;
  content: string;
  characterCount: number;
  characterLimit: number;
};

const CHANGELOG_LIMITS: Record<ChangelogPlatform, number> = {
  appStore: 4000,
  googlePlay: 500,
  twitter: 280,
  linkedin: 700,
  productHunt: 260,
};

const CHANGELOG_LABELS: Record<ChangelogPlatform, string> = {
  appStore: "App Store — What's New",
  googlePlay: "Play Store — Release Notes",
  twitter: "Twitter / X — Update Tweet",
  linkedin: "LinkedIn — Update Post",
  productHunt: "Product Hunt — Update Comment",
};

async function callGemini(prompt: string): Promise<string> {
  const { apiKey, baseUrl, models } = getGeminiConfig();
  for (const model of models) {
    try {
      const response = await fetch(
        `${baseUrl}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.65, maxOutputTokens: 1024 },
          }),
          signal: AbortSignal.timeout(20_000),
        }
      );
      if (!response.ok) continue;
      const payload = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
      const text = payload.candidates?.[0]?.content?.parts?.map(p => p.text ?? "").join("").trim();
      if (text) return text;
    } catch { /* try next */ }
  }
  throw new Error("Gemini unavailable for changelog generation.");
}

export async function generateChangelog(
  context: SourceContext,
  version: string,
  changes: string,
  platforms: ChangelogPlatform[] = ["appStore", "googlePlay", "twitter", "linkedin", "productHunt"]
): Promise<ChangelogOutput[]> {
  const results: ChangelogOutput[] = [];

  for (const platform of platforms) {
    const limit = CHANGELOG_LIMITS[platform];
    const label = CHANGELOG_LABELS[platform];

    const prompt = `You are PITCHFORGE writing ${label} copy for a version update.

App: ${context.name} by ${context.developer ?? "the developer"}
Category: ${context.category ?? "unknown"}
Version: ${version}
What changed: ${changes}

Write ${label} copy under ${limit} characters. Be specific about what changed. Sound human, not corporate. No hashtags unless Twitter. No emojis unless Twitter/Product Hunt. Return only the copy text, nothing else.`;

    const content = (await callGemini(prompt)).slice(0, limit);
    results.push({ platform, label, content, characterCount: content.length, characterLimit: limit });
  }

  return results;
}
