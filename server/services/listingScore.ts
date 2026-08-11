/**
 * Deterministic ASO / listing quality scoring engine.
 *
 * Deliberately contains zero AI calls. Every rule here is a fixed,
 * explainable check against known App Store / Play Store ranking factors —
 * character limits, keyword density, structural completeness. This is the
 * single hardest-to-copy feature in the product: pasting a prompt into
 * ChatGPT cannot reproduce a scoring rubric, because there's no generation
 * involved, only rules applied to text that already exists.
 */

import type { Platform } from "./gemini";
import { PLATFORM_DETAILS } from "./gemini";
import type { SourceContext } from "./source";

export type ScoreRule = {
  id: string;
  label: string;
  passed: boolean;
  points: number;
  maxPoints: number;
  detail: string;
};

export type ListingScore = {
  total: number;
  maxTotal: number;
  grade: "A" | "B" | "C" | "D" | "F";
  rules: ScoreRule[];
};

function gradeFor(pct: number): ListingScore["grade"] {
  if (pct >= 90) return "A";
  if (pct >= 75) return "B";
  if (pct >= 60) return "C";
  if (pct >= 40) return "D";
  return "F";
}

/** Extracts plausible keyword candidates from the app's own context — category, name words, description nouns/adjectives via simple frequency, no AI. */
function deriveKeywords(context: SourceContext): string[] {
  const words = `${context.name} ${context.category ?? ""} ${context.description}`
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 3);
  const stopwords = new Set(["with", "that", "this", "your", "from", "have", "will", "into", "about", "their", "them", "these", "those", "just", "also", "more", "most", "very"]);
  const freq = new Map<string, number>();
  for (const w of words) {
    if (stopwords.has(w)) continue;
    freq.set(w, (freq.get(w) ?? 0) + 1);
  }
  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([w]) => w);
}

export function scoreListing(content: string, platform: Platform, context: SourceContext): ListingScore {
  const details = PLATFORM_DETAILS[platform];
  const rules: ScoreRule[] = [];
  const len = content.length;

  // Rule 1: character limit compliance — hard requirement, heavily weighted.
  const withinLimit = len > 0 && len <= details.limit;
  const utilizationPct = details.limit > 0 ? Math.min(100, (len / details.limit) * 100) : 0;
  rules.push({
    id: "char_limit",
    label: `Fits ${details.label} character limit (${details.limit})`,
    passed: withinLimit,
    points: withinLimit ? 25 : 0,
    maxPoints: 25,
    detail: withinLimit
      ? `${len}/${details.limit} characters (${Math.round(utilizationPct)}% of budget used)`
      : `${len}/${details.limit} characters — over the limit, will be rejected or truncated by the platform`,
  });

  // Rule 2: budget utilization — near-empty listings waste discoverable space, near-100% is ideal.
  const wellUtilized = utilizationPct >= 60;
  rules.push({
    id: "budget_utilization",
    label: "Uses enough of the available character budget",
    passed: wellUtilized,
    points: wellUtilized ? 15 : Math.round((utilizationPct / 60) * 15),
    maxPoints: 15,
    detail: wellUtilized
      ? "Good use of available space for keywords and messaging"
      : "Under-using the character budget leaves discoverability on the table — most platforms rank fuller listings higher",
  });

  // Rule 3: keyword coverage — does the generated copy actually reference words from the app's own real description/category?
  const keywords = deriveKeywords(context);
  const contentLower = content.toLowerCase();
  const matched = keywords.filter(k => contentLower.includes(k));
  const keywordCoveragePct = keywords.length > 0 ? (matched.length / keywords.length) * 100 : 0;
  const goodCoverage = keywordCoveragePct >= 30;
  rules.push({
    id: "keyword_coverage",
    label: "References real keywords from the app's own description/category",
    passed: goodCoverage,
    points: Math.round((keywordCoveragePct / 100) * 20),
    maxPoints: 20,
    detail: matched.length > 0
      ? `Matches ${matched.length}/${keywords.length} derived keywords: ${matched.join(", ")}`
      : "No overlap found with keywords derived from the app's actual description — copy may be too generic",
  });

  // Rule 4: call-to-action presence — simple lexical check for action verbs typical of converting copy.
  const ctaWords = ["download", "try", "get", "install", "start", "join", "sign up", "learn more", "discover", "explore"];
  const hasCta = ctaWords.some(w => contentLower.includes(w));
  rules.push({
    id: "cta_presence",
    label: "Includes a clear call to action",
    passed: hasCta,
    points: hasCta ? 15 : 0,
    maxPoints: 15,
    detail: hasCta ? "Found an action-oriented phrase" : "No clear call to action detected — listings without one convert lower",
  });

  // Rule 5: no banned/risky words that commonly trigger store review rejection.
  const bannedWords = ["guaranteed", "#1", "best app", "cure", "miracle", "risk-free", "free money"];
  const foundBanned = bannedWords.filter(w => contentLower.includes(w.toLowerCase()));
  rules.push({
    id: "compliance_words",
    label: "Avoids words that commonly trigger store review rejection",
    passed: foundBanned.length === 0,
    points: foundBanned.length === 0 ? 15 : Math.max(0, 15 - foundBanned.length * 8),
    maxPoints: 15,
    detail: foundBanned.length === 0
      ? "No flagged phrases found"
      : `Found potentially risky phrase(s): ${foundBanned.join(", ")} — App Store/Play Store reviewers commonly reject unverifiable superlative claims`,
  });

  // Rule 6: sentence/readability structure — very rough Flesch-Kincaid-style proxy, no AI.
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgWordsPerSentence = sentences.length > 0 ? content.split(/\s+/).filter(Boolean).length / sentences.length : 0;
  const readable = avgWordsPerSentence > 0 && avgWordsPerSentence <= 20;
  rules.push({
    id: "readability",
    label: "Sentences are readable (not run-on)",
    passed: readable,
    points: readable ? 10 : 5,
    maxPoints: 10,
    detail: `Average ${avgWordsPerSentence.toFixed(1)} words per sentence`,
  });

  const total = rules.reduce((sum, r) => sum + r.points, 0);
  const maxTotal = rules.reduce((sum, r) => sum + r.maxPoints, 0);
  const pct = maxTotal > 0 ? (total / maxTotal) * 100 : 0;

  return { total, maxTotal, grade: gradeFor(pct), rules };
}
