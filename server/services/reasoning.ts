/**
 * "Why this app" reasoning panel — deterministic explanation of which real
 * extracted signals (category, rating, keywords) shaped the generated copy.
 * No extra AI call: reuses the same keyword-derivation logic as the scoring
 * engine so the explanation and the score are always consistent with each
 * other, and cites concrete matched words rather than a vague AI summary.
 */

import type { Platform } from "./gemini";
import type { SourceContext } from "./source";
import { scoreListing } from "./listingScore";

export type ReasoningPoint = {
  signal: string;
  detail: string;
};

export function explainGeneration(content: string, platform: Platform, context: SourceContext): ReasoningPoint[] {
  const points: ReasoningPoint[] = [];
  const score = scoreListing(content, platform, context);

  const keywordRule = score.rules.find(r => r.id === "keyword_coverage");
  if (keywordRule && keywordRule.passed) {
    points.push({
      signal: "Real app data",
      detail: `Pulled from ${context.name}'s actual description/category — ${keywordRule.detail}`,
    });
  }

  if (context.rating) {
    const mentionsRating = content.includes(context.rating) || content.toLowerCase().includes("rated") || content.toLowerCase().includes("★");
    points.push({
      signal: "Store rating",
      detail: mentionsRating
        ? `Referenced the real ${context.rating} rating pulled from the store listing to build trust`
        : `A real ${context.rating} rating is available but wasn't referenced in this version — regenerating may surface it`,
    });
  }

  if (context.category) {
    points.push({
      signal: "App category",
      detail: `Tone and platform-specific structure chosen for a "${context.category}" app, not a generic template`,
    });
  }

  const ctaRule = score.rules.find(r => r.id === "cta_presence");
  if (ctaRule) {
    points.push({
      signal: "Conversion structure",
      detail: ctaRule.passed
        ? "Includes an explicit call to action, which the scoring engine confirmed is present"
        : "No explicit call to action detected — this version leans on description over conversion language",
    });
  }

  return points;
}
