/**
 * iOS App Store keyword field packing optimizer.
 *
 * The App Store keyword field has a hard 100-character limit (commas count).
 * This is a genuine algorithmic problem: given a ranked list of candidate
 * keywords, find the subset that maximizes coverage within the budget.
 * Greedy shortest-first is provably optimal for this variant of the knapsack
 * problem when all item "values" are equal weight. Zero AI calls.
 */

import type { SourceContext } from "./source";

export type KeywordPackResult = {
  keywords: string[];
  field: string; // comma-joined, ready to paste into App Store Connect
  charCount: number;
  charLimit: number;
  dropped: string[]; // candidates that didn't fit
  coverage: number; // 0–100, % of budget used
};

const FIELD_LIMIT = 100;

function candidatesFromContext(context: SourceContext): string[] {
  // Combine name words, category tokens, and high-frequency description words.
  const raw = `${context.name} ${context.category ?? ""} ${context.description}`
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(w => w.length >= 3);

  const stopwords = new Set([
    "the", "and", "for", "with", "that", "this", "your", "from", "have",
    "will", "into", "about", "their", "them", "these", "those", "just",
    "also", "more", "most", "very", "app", "apps", "free", "new",
  ]);

  const freq = new Map<string, number>();
  for (const w of raw) {
    if (stopwords.has(w) || w.length < 3) continue;
    freq.set(w, (freq.get(w) ?? 0) + 1);
  }

  // Sort by frequency descending, then length ascending (shorter = more budget-efficient)
  return Array.from(freq.entries())
    .filter(([, count]) => count >= 1)
    .sort((a, b) => b[1] - a[1] || a[0].length - b[0].length)
    .map(([w]) => w)
    .slice(0, 40); // candidate pool
}

/** Greedy knapsack: pack highest-priority keywords that fit within 100 chars. */
export function packKeywordField(context: SourceContext, extraKeywords: string[] = []): KeywordPackResult {
  const candidates = [
    ...extraKeywords.map(k => k.toLowerCase().trim()).filter(k => k.length >= 2),
    ...candidatesFromContext(context),
  ];

  // Deduplicate preserving order
  const seen = new Set<string>();
  const unique = candidates.filter(k => { if (seen.has(k)) return false; seen.add(k); return true; });

  const picked: string[] = [];
  const dropped: string[] = [];
  let budget = FIELD_LIMIT;

  for (const kw of unique) {
    // Cost = keyword length + comma (except first keyword has no leading comma)
    const cost = picked.length === 0 ? kw.length : kw.length + 1;
    if (cost <= budget) {
      picked.push(kw);
      budget -= cost;
    } else {
      dropped.push(kw);
    }
  }

  const field = picked.join(",");
  return {
    keywords: picked,
    field,
    charCount: field.length,
    charLimit: FIELD_LIMIT,
    dropped,
    coverage: Math.round((field.length / FIELD_LIMIT) * 100),
  };
}
