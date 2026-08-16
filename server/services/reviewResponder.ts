/**
 * Review response draft generator.
 *
 * Takes a review text + star rating and drafts a developer response.
 * Recurring task that nobody else addressed — directly extends the product
 * beyond launch day into ongoing community management.
 */

import { getGeminiConfig } from "../config";
import type { SourceContext } from "./source";

export type ReviewInput = {
  reviewText: string;
  rating: 1 | 2 | 3 | 4 | 5;
  reviewerName?: string;
  platform: "appStore" | "googlePlay";
};

export type ReviewResponse = {
  draft: string;
  tone: "empathetic" | "grateful" | "constructive";
  characterCount: number;
  characterLimit: number;
};

const RESPONSE_LIMITS = { appStore: 350, googlePlay: 350 };

const TONE_MAP: Record<string, "empathetic" | "grateful" | "constructive"> = {
  "1": "empathetic",
  "2": "empathetic",
  "3": "constructive",
  "4": "grateful",
  "5": "grateful",
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
            generationConfig: { temperature: 0.6, maxOutputTokens: 512 },
          }),
          signal: AbortSignal.timeout(15_000),
        }
      );
      if (!res.ok) continue;
      const payload = await res.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
      const text = payload.candidates?.[0]?.content?.parts?.map(p => p.text ?? "").join("").trim();
      if (text) return text;
    } catch { /* try next */ }
  }
  throw new Error("Gemini unavailable for review response.");
}

export async function draftReviewResponse(context: SourceContext, review: ReviewInput): Promise<ReviewResponse> {
  const tone = TONE_MAP[String(review.rating)] ?? "constructive";
  const limit = RESPONSE_LIMITS[review.platform];
  const reviewerLine = review.reviewerName ? `Reviewer: ${review.reviewerName}` : "";

  const toneInstructions = {
    empathetic: "Be genuinely empathetic. Acknowledge the frustration specifically. Mention a fix or roadmap item if possible. Don't be defensive.",
    grateful: "Be warm and genuinely grateful. Reference something specific in their review. Invite them to share more feedback.",
    constructive: "Be friendly and constructive. Acknowledge the mixed experience. Explain any relevant context briefly.",
  };

  const prompt = `You are the developer of ${context.name} writing a ${review.platform === "appStore" ? "App Store" : "Google Play"} review response.

App: ${context.name}
${reviewerLine}
Star rating: ${review.rating}/5
Review: "${review.reviewText}"

${toneInstructions[tone]}

Rules:
- Under ${limit} characters
- Sound like a real human developer, not a corporate support bot
- No generic "Thank you for your feedback" openers
- No emojis
- Return only the response text, nothing else`;

  const draft = (await callGemini(prompt)).slice(0, limit);
  return { draft, tone, characterCount: draft.length, characterLimit: limit };
}

/** Sample reviews for guest demo when no real reviews are scraped */
export function getSampleReviews(): ReviewInput[] {
  return [
    { reviewText: "App keeps crashing on my iPhone 14 whenever I try to open the settings screen. Really frustrating.", rating: 2, reviewerName: "Sarah M.", platform: "appStore" },
    { reviewText: "Absolutely love this app. Does exactly what it says and the UI is clean. Would love dark mode!", rating: 5, reviewerName: "DevJohn42", platform: "googlePlay" },
    { reviewText: "Good concept but a bit slow to load sometimes. Would be 5 stars with better performance.", rating: 3, reviewerName: "Marcus T.", platform: "googlePlay" },
  ];
}
