/**
 * Cross-app pattern learning.
 *
 * Builds insight statements purely from a user's own stored campaigns and
 * published-post engagement data — no AI call, no fabrication. Below the
 * minimum data threshold it explicitly says there isn't enough history yet,
 * rather than inventing a plausible-sounding but hollow insight (per the
 * "mock a little, not more" rule — this feature stays 100% real or silent).
 */

import { countCampaignsForUser, getDb, getTopPerformingPosts, listCampaignsForUser } from "../db";
import { campaignOutputs } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import type { SourceContext } from "./source";

export type PatternInsight = {
  text: string;
  confidence: "low" | "medium" | "high";
  basedOnCampaignCount: number;
};

const MIN_CAMPAIGNS_FOR_INSIGHT = 2;

export async function computePatternInsights(userId: number): Promise<PatternInsight[]> {
  const campaignCount = await countCampaignsForUser(userId);
  if (campaignCount < MIN_CAMPAIGNS_FOR_INSIGHT) {
    return [
      {
        text: `Generate ${MIN_CAMPAIGNS_FOR_INSIGHT - campaignCount} more campaign${MIN_CAMPAIGNS_FOR_INSIGHT - campaignCount === 1 ? "" : "s"} to unlock cross-app insights based on your own history.`,
        confidence: "low",
        basedOnCampaignCount: campaignCount,
      },
    ];
  }

  const insights: PatternInsight[] = [];
  const campaigns = await listCampaignsForUser(userId);
  const db = await getDb();

  // Insight 1: category-vs-platform performance, from real reaction counts if any exist.
  const topPosts = await getTopPerformingPosts(userId, 20);
  if (topPosts.length >= 2) {
    const byCategoryPlatform = new Map<string, { total: number; count: number }>();
    for (const post of topPosts) {
      const campaign = campaigns.find(c => c.id === post.campaignId);
      if (!campaign) continue;
      let category = "uncategorized";
      try {
        category = (JSON.parse(campaign.contextJson) as SourceContext).category ?? category;
      } catch {
        // skip malformed context
      }
      const key = `${category}::${post.platform}`;
      const entry = byCategoryPlatform.get(key) ?? { total: 0, count: 0 };
      entry.total += post.reactionCount;
      entry.count += 1;
      byCategoryPlatform.set(key, entry);
    }
    const ranked = Array.from(byCategoryPlatform.entries())
      .map(([key, { total, count }]) => ({ key, avg: total / count, count }))
      .filter(r => r.count >= 1)
      .sort((a, b) => b.avg - a.avg);
    if (ranked.length >= 2) {
      const [category, platform] = ranked[0].key.split("::");
      insights.push({
        text: `Your "${category}" campaigns get the strongest engagement on ${platform} — ${ranked[0].avg.toFixed(1)} avg reactions vs. ${ranked[ranked.length - 1].avg.toFixed(1)} on your weakest platform.`,
        confidence: ranked[0].count >= 3 ? "high" : "medium",
        basedOnCampaignCount: campaignCount,
      });
    }
  }

  // Insight 2: listing score trend across all saved outputs, real average from the scoring engine's own stored character data.
  if (db) {
    const allOutputs = await db.select().from(campaignOutputs);
    const userOutputIds = new Set(campaigns.map(c => c.id));
    const relevant = allOutputs.filter(o => userOutputIds.has(o.campaignId));
    if (relevant.length >= 3) {
      const overLimit = relevant.filter(o => o.characterCount > o.characterLimit).length;
      if (overLimit > 0) {
        insights.push({
          text: `${overLimit} of your ${relevant.length} saved listings exceed the platform character limit — those are likely being truncated or rejected on submission.`,
          confidence: "high",
          basedOnCampaignCount: campaignCount,
        });
      }
    }
  }

  // Insight 3: generation cadence — how often the user actually returns, a genuine retention signal.
  if (campaigns.length >= MIN_CAMPAIGNS_FOR_INSIGHT) {
    const sorted = [...campaigns].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const first = new Date(sorted[0].createdAt).getTime();
    const last = new Date(sorted[sorted.length - 1].createdAt).getTime();
    const spanDays = Math.max(1, (last - first) / (1000 * 60 * 60 * 24));
    const cadence = campaigns.length / spanDays;
    if (spanDays > 1) {
      insights.push({
        text: `You've launched ${campaigns.length} campaigns over ${Math.round(spanDays)} days — roughly one every ${(1 / cadence).toFixed(1)} days.`,
        confidence: "medium",
        basedOnCampaignCount: campaignCount,
      });
    }
  }

  if (insights.length === 0) {
    insights.push({
      text: "Not enough engagement data yet to surface a pattern — publish a few campaigns and report engagement to unlock this.",
      confidence: "low",
      basedOnCampaignCount: campaignCount,
    });
  }

  return insights;
}
