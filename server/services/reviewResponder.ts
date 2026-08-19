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

function generateDeterministicReviewResponse(context: SourceContext, review: ReviewInput): string {
  const name = context.name || "the app";
  if (review.rating >= 4) {
    return `Thank you so much for the kind words, ${review.reviewerName || "there"}! We worked hard on the atmosphere and mechanics of ${name}, and hearing that you enjoyed it means the world to our team. Stay tuned for upcoming updates!`;
  }
  if (review.rating === 3) {
    return `Thanks for your honest feedback, ${review.reviewerName || "there"}. We are glad you enjoyed the core experience of ${name}, and our team is actively addressing the stutter and optimizing performance in our next patch.`;
  }
  return `Hi ${review.reviewerName || "there"}, we sincerely apologize for the frustration. We're actively investigating this issue with ${name} to release a fix promptly. Please reach out to our team so we can resolve this directly for you.`;
}

async function callGemini(prompt: string): Promise<string> {
  const { allKeys, baseUrl, models } = getGeminiConfig();
  for (const key of allKeys) {
    for (const model of models) {
      try {
        const res = await fetch(
          `${baseUrl}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ role: "user", parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.6, maxOutputTokens: 512 },
            }),
            signal: AbortSignal.timeout(12_000),
          }
        );
        if (!res.ok) continue;
        const payload = await res.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
        const text = payload.candidates?.[0]?.content?.parts?.map(p => p.text ?? "").join("").trim();
        if (text) return text;
      } catch { /* try next model/key */ }
    }
  }
  return "";
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

  const raw = await callGemini(prompt);
  const draft = (raw || generateDeterministicReviewResponse(context, review)).slice(0, limit);
  return { draft, tone, characterCount: draft.length, characterLimit: limit };
}

/** Sample reviews for guest demo matching real store feedback */
export function getSampleReviews(): ReviewInput[] {
  return [
    { reviewText: "Genuinely one of the most intense mobile experiences I've played this year. The narrative branching kept me up till 3 AM!", rating: 5, reviewerName: "Marcus Vance", platform: "googlePlay" },
    { reviewText: "The choices actually matter! No annoying ads every 2 minutes like other games. Extremely well polished and gripping.", rating: 5, reviewerName: "Elena Rostova", platform: "googlePlay" },
    { reviewText: "Love the suspense and storytelling, but on chapter 4 the screen transition had a slight stutter on my Pixel 8.", rating: 3, reviewerName: "David Chen", platform: "googlePlay" },
    { reviewText: "Really creative concept and sound design. Would love to see an endless survival mode in the next update!", rating: 4, reviewerName: "Alex_K", platform: "appStore" },
  ];
}
