import { and, desc, eq, gt, lt, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { campaignImages, campaignMicrosites, campaignOutputs, campaigns, guestImageAllowances, imageUsagePeriods, InsertUser, manualPremiumEntitlements, patternInsights, publishConnections, publishedPosts, users } from "../drizzle/schema";
import { ENV } from "./_core/env";
import type { GeneratedCopy } from "./services/gemini";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  const values: InsertUser = { openId: user.openId, lastSignedIn: new Date() };
  const updateSet: Record<string, unknown> = { lastSignedIn: new Date() };
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  return (await db.select().from(users).where(eq(users.openId, openId)).limit(1))[0];
}

export async function createCampaign(input: {
  userId: number;
  name: string;
  sourceKind: "url" | "brief" | "manual";
  sourceUrl?: string;
  sourceText: string;
  contextJson: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable. Try again shortly.");
  const result = await db.insert(campaigns).values(input);
  return Number(result[0].insertId);
}

export async function setCampaignOutput(campaignId: number, output: GeneratedCopy) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable. Try again shortly.");
  await db
    .insert(campaignOutputs)
    .values({ campaignId, platform: output.platform, content: output.content, characterCount: output.characterCount, characterLimit: output.characterLimit })
    .onDuplicateKeyUpdate({
      set: { content: output.content, characterCount: output.characterCount, characterLimit: output.characterLimit, updatedAt: new Date() },
    });
}

export async function listCampaignsForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(campaigns).where(eq(campaigns.userId, userId)).orderBy(desc(campaigns.updatedAt));
}

export async function getCampaignForUser(campaignId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const campaign = (await db.select().from(campaigns).where(and(eq(campaigns.id, campaignId), eq(campaigns.userId, userId))).limit(1))[0];
  if (!campaign) return undefined;
  const outputs = await db.select().from(campaignOutputs).where(eq(campaignOutputs.campaignId, campaign.id));
  const images = await db.select().from(campaignImages).where(eq(campaignImages.campaignId, campaign.id)).orderBy(desc(campaignImages.createdAt));
  return { ...campaign, outputs, images };
}

export async function renameCampaign(campaignId: number, userId: number, name: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable. Try again shortly.");
  await db.update(campaigns).set({ name }).where(and(eq(campaigns.id, campaignId), eq(campaigns.userId, userId)));
  return { success: true } as const;
}

export async function deleteCampaign(campaignId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable. Try again shortly.");
  const campaign = (await db.select().from(campaigns).where(and(eq(campaigns.id, campaignId), eq(campaigns.userId, userId))).limit(1))[0];
  if (!campaign) return;
  await db.delete(campaignOutputs).where(eq(campaignOutputs.campaignId, campaignId));
  await db.delete(campaignImages).where(eq(campaignImages.campaignId, campaignId));
  await db.delete(campaigns).where(and(eq(campaigns.id, campaignId), eq(campaigns.userId, userId)));
}

export async function getImageUsageForPeriod(userId: number, periodKey: string) {
  const db = await getDb();
  if (!db) return undefined;
  return (await db.select().from(imageUsagePeriods).where(and(eq(imageUsagePeriods.userId, userId), eq(imageUsagePeriods.periodKey, periodKey))).limit(1))[0];
}

export async function incrementImageUsage(userId: number, periodKey: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable. Try again shortly.");
  await db
    .insert(imageUsagePeriods)
    .values({ userId, periodKey, imageGenerationCount: 1 })
    .onDuplicateKeyUpdate({ set: { imageGenerationCount: sql`${imageUsagePeriods.imageGenerationCount} + 1`, updatedAt: new Date() } });
  const usage = await getImageUsageForPeriod(userId, periodKey);
  return usage?.imageGenerationCount ?? 1;
}

export function isGuestImageAllowanceActive(allowance: { expiresAt: Date } | null | undefined, now = new Date()) {
  return Boolean(allowance && allowance.expiresAt > now);
}

export async function getGuestImageAllowance(guestId: string, now = new Date()) {
  const db = await getDb();
  if (!db) return undefined;
  const allowance = (await db.select().from(guestImageAllowances).where(eq(guestImageAllowances.guestId, guestId)).limit(1))[0];
  if (!isGuestImageAllowanceActive(allowance, now)) return undefined;
  return allowance;
}

export async function consumeGuestImageCredit(guestId: string, limit = 10, now = new Date()) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable. Try again shortly.");
  const existing = await getGuestImageAllowance(guestId, now);
  if (!existing) {
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    await db
      .insert(guestImageAllowances)
      .values({ guestId, imageGenerationCount: 0, expiresAt })
      .onDuplicateKeyUpdate({ set: { imageGenerationCount: 0, expiresAt, updatedAt: now } });
  }
  const result = await db
    .update(guestImageAllowances)
    .set({ imageGenerationCount: sql`${guestImageAllowances.imageGenerationCount} + 1`, updatedAt: now })
    .where(and(eq(guestImageAllowances.guestId, guestId), lt(guestImageAllowances.imageGenerationCount, limit), gt(guestImageAllowances.expiresAt, now)));
  if ((result[0] as { affectedRows?: number }).affectedRows !== 1) return undefined;
  const allowance = await getGuestImageAllowance(guestId, now);
  const used = allowance?.imageGenerationCount ?? limit;
  return { used, remaining: Math.max(0, limit - used), expiresAt: allowance?.expiresAt ?? new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) };
}

export async function saveCampaignImage(input: { campaignId: number; userId: number; prompt: string; imageUrl: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable. Try again shortly.");
  await db.insert(campaignImages).values(input);
}

export async function setUserPlan(userId: number, plan: "free" | "premium", stripe?: { customerId?: string; subscriptionId?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable. Try again shortly.");
  await db
    .update(users)
    .set({
      plan,
      ...(stripe?.customerId ? { stripeCustomerId: stripe.customerId } : {}),
      ...(stripe?.subscriptionId ? { stripeSubscriptionId: stripe.subscriptionId } : {}),
    })
    .where(eq(users.id, userId));
}

export async function findUserForManualPremium(email: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable. Try again shortly.");
  return (await db
    .select({ id: users.id, name: users.name, email: users.email, plan: users.plan, stripeSubscriptionId: users.stripeSubscriptionId })
    .from(users)
    .where(eq(users.email, email.trim().toLowerCase()))
    .limit(1))[0];
}

export async function setManualPremiumEntitlement(input: {
  targetUserId: number;
  grantedByUserId: number;
  action: "grant" | "revoke";
  note?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable. Try again shortly.");
  const target = (await db.select().from(users).where(eq(users.id, input.targetUserId)).limit(1))[0];
  if (!target) throw new Error("The selected member no longer exists.");
  if (input.action === "revoke" && target.stripeSubscriptionId) {
    throw new Error("This member has an active Stripe subscription. Manage the paid subscription through Stripe instead of revoking manual access.");
  }
  await db.update(users).set({ plan: input.action === "grant" ? "premium" : "free" }).where(eq(users.id, target.id));
  await db.insert(manualPremiumEntitlements).values({
    targetUserId: target.id,
    grantedByUserId: input.grantedByUserId,
    action: input.action,
    note: input.note?.trim() || null,
  });
  return { id: target.id, name: target.name, email: target.email, plan: input.action === "grant" ? "premium" as const : "free" as const, stripeSubscriptionId: target.stripeSubscriptionId };
}

type ManualPremiumAuditRecord = {
  id: number;
  targetUserId: number;
  targetName: string | null;
  targetEmail: string | null;
  targetPlan: "free" | "premium" | null;
  targetStripeSubscriptionId: string | null;
  action: "grant" | "revoke";
  note: string | null;
  performedByUserId: number;
  performedByName: string | null;
  performedByEmail: string | null;
  createdAt: Date;
};

export async function getManualPremiumAudit(search = "") {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable. Try again shortly.");
  const [entitlements, memberRows] = await Promise.all([
    db.select().from(manualPremiumEntitlements).orderBy(desc(manualPremiumEntitlements.createdAt)),
    db.select({ id: users.id, name: users.name, email: users.email, plan: users.plan, stripeSubscriptionId: users.stripeSubscriptionId }).from(users),
  ]);
  const memberById = new Map(memberRows.map(member => [member.id, member]));
  const records: ManualPremiumAuditRecord[] = entitlements.map(entitlement => {
    const target = memberById.get(entitlement.targetUserId);
    const performer = memberById.get(entitlement.grantedByUserId);
    return {
      id: entitlement.id,
      targetUserId: entitlement.targetUserId,
      targetName: target?.name ?? null,
      targetEmail: target?.email ?? null,
      targetPlan: target?.plan ?? null,
      targetStripeSubscriptionId: target?.stripeSubscriptionId ?? null,
      action: entitlement.action,
      note: entitlement.note,
      performedByUserId: entitlement.grantedByUserId,
      performedByName: performer?.name ?? null,
      performedByEmail: performer?.email ?? null,
      createdAt: entitlement.createdAt,
    };
  });
  const term = search.trim().toLowerCase();
  const matchesSearch = (record: ManualPremiumAuditRecord) => !term || [
    record.targetName,
    record.targetEmail,
    record.performedByName,
    record.performedByEmail,
    record.note,
    record.action,
  ].filter(Boolean).join(" ").toLowerCase().includes(term);
  const events = records.filter(matchesSearch);
  const latestByTarget = new Map<number, ManualPremiumAuditRecord>();
  for (const record of records) if (!latestByTarget.has(record.targetUserId)) latestByTarget.set(record.targetUserId, record);
  const members = Array.from(latestByTarget.values()).filter(record =>
    record.action === "grant" && record.targetPlan === "premium" && !record.targetStripeSubscriptionId && matchesSearch(record)
  );
  return { members, events };
}

// --- Publish connections (Discord webhook auto-publish) ---

export async function listPublishConnections(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(publishConnections).where(and(eq(publishConnections.userId, userId), eq(publishConnections.isActive, "true")));
}

export async function createPublishConnection(input: {
  userId: number;
  kind: "discord" | "slack" | "telegram" | "webhook";
  label: string;
  webhookUrl: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable. Try again shortly.");
  const result = await db.insert(publishConnections).values(input);
  return Number(result[0].insertId);
}

export async function deactivatePublishConnection(connectionId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable. Try again shortly.");
  await db.update(publishConnections).set({ isActive: "false" }).where(and(eq(publishConnections.id, connectionId), eq(publishConnections.userId, userId)));
  return { success: true } as const;
}

export async function getPublishConnectionForUser(connectionId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  return (await db.select().from(publishConnections).where(and(eq(publishConnections.id, connectionId), eq(publishConnections.userId, userId))).limit(1))[0];
}

// --- Published posts (auto-publish history + engagement feedback loop) ---

export async function recordPublishedPost(input: {
  campaignId: number;
  userId: number;
  connectionId: number;
  platform: "appStore" | "googlePlay" | "twitter" | "instagram" | "linkedin" | "productHunt";
  content: string;
  status: "sent" | "failed";
  errorMessage?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable. Try again shortly.");
  const result = await db.insert(publishedPosts).values(input);
  return Number(result[0].insertId);
}

export async function listPublishedPostsForUser(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(publishedPosts).where(eq(publishedPosts.userId, userId)).orderBy(desc(publishedPosts.publishedAt)).limit(limit);
}

export async function listPublishedPostsForCampaign(campaignId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(publishedPosts).where(and(eq(publishedPosts.campaignId, campaignId), eq(publishedPosts.userId, userId))).orderBy(desc(publishedPosts.publishedAt));
}

/** Best-performing posts by reaction count, used to inform future regenerations. */
export async function getTopPerformingPosts(userId: number, limit = 5) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(publishedPosts)
    .where(and(eq(publishedPosts.userId, userId), eq(publishedPosts.status, "sent")))
    .orderBy(desc(publishedPosts.reactionCount))
    .limit(limit);
}

// --- Pattern insights (cross-app learning) ---

export async function getLatestPatternInsights(userId: number, limit = 3) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(patternInsights).where(eq(patternInsights.userId, userId)).orderBy(desc(patternInsights.createdAt)).limit(limit);
}

export async function savePatternInsight(input: { userId: number; insightText: string; confidence: "low" | "medium" | "high"; basedOnCampaignCount: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable. Try again shortly.");
  await db.insert(patternInsights).values(input);
}

export async function countCampaignsForUser(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const rows = await db.select({ count: sql<number>`count(*)` }).from(campaigns).where(eq(campaigns.userId, userId));
  return Number(rows[0]?.count ?? 0);
}

// --- Campaign microsites ---

export async function createOrGetMicrosite(campaignId: number, userId: number, slug: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable. Try again shortly.");
  const existing = (await db.select().from(campaignMicrosites).where(and(eq(campaignMicrosites.campaignId, campaignId), eq(campaignMicrosites.userId, userId))).limit(1))[0];
  if (existing) return existing;
  await db.insert(campaignMicrosites).values({ campaignId, userId, slug });
  return (await db.select().from(campaignMicrosites).where(and(eq(campaignMicrosites.campaignId, campaignId), eq(campaignMicrosites.userId, userId))).limit(1))[0];
}

export async function getMicrositeBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const site = (await db.select().from(campaignMicrosites).where(and(eq(campaignMicrosites.slug, slug), eq(campaignMicrosites.isPublic, "true"))).limit(1))[0];
  if (!site) return undefined;
  await db.update(campaignMicrosites).set({ viewCount: sql`${campaignMicrosites.viewCount} + 1` }).where(eq(campaignMicrosites.id, site.id));
  const campaign = (await db.select().from(campaigns).where(eq(campaigns.id, site.campaignId)).limit(1))[0];
  if (!campaign) return undefined;
  const outputs = await db.select().from(campaignOutputs).where(eq(campaignOutputs.campaignId, campaign.id));
  const images = await db.select().from(campaignImages).where(eq(campaignImages.campaignId, campaign.id)).orderBy(desc(campaignImages.createdAt)).limit(1);
  return { site, campaign, outputs, images };
}
