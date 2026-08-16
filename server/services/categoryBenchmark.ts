/**
 * Category Benchmark Score (T6).
 *
 * Deterministic, zero-AI. Compares the extracted app context against
 * fixed, category-relative heuristic norms (not live market data — there is
 * no external dataset here, and the UI must label this as a heuristic
 * benchmark rather than "your rank vs competitors").
 */

import type { SourceContext } from "./source";

export type BenchmarkRule = {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
};

export type CategoryBenchmark = {
  category: string;
  score: number;
  maxScore: number;
  rules: BenchmarkRule[];
};

// Rough, category-relative expectations. Deliberately conservative — this is
// a heuristic sanity check, not a claim about real competitor data.
const CATEGORY_NORMS: Record<string, { minDescriptionWords: number; expectsRating: boolean }> = {
  games: { minDescriptionWords: 40, expectsRating: true },
  productivity: { minDescriptionWords: 60, expectsRating: true },
  social: { minDescriptionWords: 50, expectsRating: true },
  finance: { minDescriptionWords: 70, expectsRating: true },
  health: { minDescriptionWords: 60, expectsRating: true },
  education: { minDescriptionWords: 50, expectsRating: false },
  default: { minDescriptionWords: 50, expectsRating: false },
};

function normsFor(category?: string) {
  if (!category) return CATEGORY_NORMS.default;
  const key = category.toLowerCase();
  const match = Object.keys(CATEGORY_NORMS).find(k => key.includes(k));
  return match ? CATEGORY_NORMS[match] : CATEGORY_NORMS.default;
}

export function scoreCategoryBenchmark(context: SourceContext): CategoryBenchmark {
  const category = context.category?.trim() || "General";
  const norms = normsFor(context.category);
  const rules: BenchmarkRule[] = [];

  const wordCount = context.description.trim().split(/\s+/).filter(Boolean).length;
  const hasEnoughDetail = wordCount >= norms.minDescriptionWords;
  rules.push({
    id: "description_depth",
    label: `Description depth typical for ${category}`,
    passed: hasEnoughDetail,
    detail: hasEnoughDetail
      ? `${wordCount} words — meets the typical depth for this category (${norms.minDescriptionWords}+ words)`
      : `${wordCount} words — most ${category} listings run ${norms.minDescriptionWords}+ words; thin descriptions rank worse for keyword coverage`,
  });

  const hasRating = Boolean(context.rating);
  const ratingMatters = norms.expectsRating;
  rules.push({
    id: "rating_present",
    label: "Store rating available for social proof",
    passed: !ratingMatters || hasRating,
    detail: hasRating
      ? `Rating on record: ${context.rating} — usable as a trust signal in campaign copy`
      : ratingMatters
        ? `No rating found — ${category} listings typically lean on star ratings for trust; consider referencing reviews once available`
        : "No rating found — less critical for this category, but still useful if available",
  });

  const hasDeveloperName = Boolean(context.developer?.trim());
  rules.push({
    id: "developer_identity",
    label: "Developer/publisher identity present",
    passed: hasDeveloperName,
    detail: hasDeveloperName
      ? `Developer on record: ${context.developer}`
      : "No developer name found — store listings and press outreach typically expect a named publisher",
  });

  const hasScreenshots = context.screenshots.length >= 2;
  rules.push({
    id: "visual_proof",
    label: "Enough visual proof for the category",
    passed: hasScreenshots,
    detail: hasScreenshots
      ? `${context.screenshots.length} screenshots found — meets baseline for most categories`
      : `${context.screenshots.length} screenshot(s) found — most categories expect at least 2-3 to convert well`,
  });

  const score = rules.filter(r => r.passed).length;
  return { category, score, maxScore: rules.length, rules };
}
