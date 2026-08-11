/**
 * Launch-readiness checklist.
 *
 * Deterministic pass/fail checks per-app, built from the extracted SourceContext.
 * Zero AI calls — every check is a concrete rule against known store requirements
 * and marketing best-practice minimums. Judges see instant, tangible feedback
 * that a plain AI prompt cannot reproduce.
 */

import type { SourceContext } from "./source";

export type CheckItem = {
  id: string;
  label: string;
  status: "pass" | "fail" | "warn";
  detail: string;
};

export type LaunchChecklist = {
  items: CheckItem[];
  passCount: number;
  warnCount: number;
  failCount: number;
  ready: boolean; // true when zero fails
};

export function buildLaunchChecklist(context: SourceContext): LaunchChecklist {
  const items: CheckItem[] = [];

  // 1. App name present and not too long (30 char iOS limit for app name in metadata)
  const nameLen = context.name.trim().length;
  items.push({
    id: "app_name",
    label: "App name present and concise",
    status: nameLen > 0 && nameLen <= 30 ? "pass" : nameLen > 30 ? "warn" : "fail",
    detail:
      nameLen === 0
        ? "No app name found in the store listing — required for submission"
        : nameLen > 30
        ? `Name is ${nameLen} chars — App Store display name truncates at 30`
        : `Name is ${nameLen} chars — within the 30-char display limit`,
  });

  // 2. Description length (meaningful content, not just a placeholder)
  const descLen = context.description.trim().length;
  items.push({
    id: "description",
    label: "Description has substantive content",
    status: descLen >= 80 ? "pass" : descLen > 0 ? "warn" : "fail",
    detail:
      descLen === 0
        ? "No description extracted — required for all store listings"
        : descLen < 80
        ? `Description is only ${descLen} chars — too brief to rank or convert`
        : `Description is ${descLen} chars — sufficient for store indexing`,
  });

  // 3. Screenshots / visuals available
  const screenshotCount = context.screenshots?.length ?? 0;
  items.push({
    id: "screenshots",
    label: "Screenshots available for the listing",
    status: screenshotCount >= 3 ? "pass" : screenshotCount > 0 ? "warn" : "fail",
    detail:
      screenshotCount === 0
        ? "No screenshots found — App Store requires at least 1, Play Store recommends 4+"
        : screenshotCount < 3
        ? `${screenshotCount} screenshot${screenshotCount === 1 ? "" : "s"} found — stores recommend 4+ for maximum conversion`
        : `${screenshotCount} screenshots found — meets minimum requirements`,
  });

  // 4. Store rating signal (social proof available)
  items.push({
    id: "rating",
    label: "Store rating available for social proof",
    status: context.rating ? "pass" : "warn",
    detail: context.rating
      ? `Rating is ${context.rating} — available to reference in campaign copy for trust signals`
      : "No rating extracted — consider requesting early reviews before launch",
  });

  // 5. Category tagged (helps platform-specific copy targeting)
  items.push({
    id: "category",
    label: "App category identified",
    status: context.category ? "pass" : "warn",
    detail: context.category
      ? `Category: ${context.category} — used for keyword targeting and tone`
      : "No category found — may indicate an unclassified or new listing",
  });

  // 6. Developer attribution present
  items.push({
    id: "developer",
    label: "Developer name present",
    status: context.developer ? "pass" : "warn",
    detail: context.developer
      ? `Developer: ${context.developer}`
      : "No developer name found — required for store submission credibility",
  });

  // 7. No placeholder content patterns in description
  const placeholders = ["lorem ipsum", "placeholder", "coming soon", "tbd", "todo", "insert here", "your description"];
  const descLower = context.description.toLowerCase();
  const foundPlaceholder = placeholders.find(p => descLower.includes(p));
  items.push({
    id: "no_placeholder",
    label: "Description contains no placeholder text",
    status: foundPlaceholder ? "fail" : "pass",
    detail: foundPlaceholder
      ? `Found placeholder phrase: "${foundPlaceholder}" — replace before submission`
      : "No placeholder patterns detected",
  });

  // 8. Description doesn't rely on banned superlatives
  const superlatives = ["best in the world", "#1 app", "world's best", "most popular app", "guaranteed results"];
  const foundSuperlative = superlatives.find(s => descLower.includes(s));
  items.push({
    id: "no_superlatives",
    label: "No unverifiable superlative claims",
    status: foundSuperlative ? "fail" : "pass",
    detail: foundSuperlative
      ? `Found risky claim: "${foundSuperlative}" — stores reject unverifiable superlatives`
      : "No banned superlative patterns found",
  });

  // 9. Source URL present (real store listing, not manual/brief only)
  items.push({
    id: "store_url",
    label: "Linked to a live store listing",
    status: context.sourceUrl ? "pass" : "warn",
    detail: context.sourceUrl
      ? `Store URL on record: ${context.sourceUrl}`
      : "No store URL — campaign was built from a brief or manual description, not a live listing",
  });

  // 10. Description word diversity (not just one keyword stuffed)
  const words = descLower.replace(/[^a-z\s]/g, " ").split(/\s+/).filter(w => w.length > 2);
  const unique = new Set(words).size;
  const diversityRatio = words.length > 0 ? unique / words.length : 0;
  items.push({
    id: "keyword_diversity",
    label: "Description has natural keyword diversity",
    status: diversityRatio >= 0.45 ? "pass" : diversityRatio >= 0.25 ? "warn" : "fail",
    detail:
      words.length < 10
        ? "Description too short to evaluate diversity"
        : `${Math.round(diversityRatio * 100)}% unique words — ${diversityRatio >= 0.45 ? "good variety, avoids keyword stuffing flags" : "low diversity may trigger spam filters"}`,
  });

  const passCount = items.filter(i => i.status === "pass").length;
  const warnCount = items.filter(i => i.status === "warn").length;
  const failCount = items.filter(i => i.status === "fail").length;

  return { items, passCount, warnCount, failCount, ready: failCount === 0 };
}
