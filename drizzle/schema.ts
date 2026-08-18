import { index, int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** External auth provider identifier (openId) returned from Clerk. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  plan: mysqlEnum("plan", ["free", "premium"]).default("free").notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 128 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const campaigns = mysqlTable(
  "campaigns",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    name: varchar("name", { length: 150 }).notNull(),
    sourceKind: mysqlEnum("sourceKind", ["url", "brief", "manual"]).notNull(),
    sourceUrl: text("sourceUrl"),
    sourceText: text("sourceText").notNull(),
    contextJson: text("contextJson").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("campaigns_user_updated_idx").on(table.userId, table.updatedAt)]
);

export const campaignOutputs = mysqlTable(
  "campaignOutputs",
  {
    id: int("id").autoincrement().primaryKey(),
    campaignId: int("campaignId").notNull(),
    platform: mysqlEnum("platform", ["appStore", "googlePlay", "twitter", "instagram", "linkedin", "productHunt"]).notNull(),
    content: text("content").notNull(),
    characterCount: int("characterCount").notNull(),
    characterLimit: int("characterLimit").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [uniqueIndex("campaign_outputs_campaign_platform_unique").on(table.campaignId, table.platform)]
);

export const imageUsagePeriods = mysqlTable(
  "imageUsagePeriods",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    periodKey: varchar("periodKey", { length: 7 }).notNull(),
    imageGenerationCount: int("imageGenerationCount").default(0).notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [uniqueIndex("image_usage_user_period_unique").on(table.userId, table.periodKey)]
);

export const guestImageAllowances = mysqlTable(
  "guestImageAllowances",
  {
    guestId: varchar("guestId", { length: 64 }).primaryKey(),
    imageGenerationCount: int("imageGenerationCount").default(0).notNull(),
    expiresAt: timestamp("expiresAt").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("guest_image_allowance_expiry_idx").on(table.expiresAt)]
);

export const campaignImages = mysqlTable(
  "campaignImages",
  {
    id: int("id").autoincrement().primaryKey(),
    campaignId: int("campaignId").notNull(),
    userId: int("userId").notNull(),
    prompt: text("prompt").notNull(),
    imageUrl: text("imageUrl").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("campaign_images_campaign_idx").on(table.campaignId)]
);

export const manualPremiumEntitlements = mysqlTable(
  "manualPremiumEntitlements",
  {
    id: int("id").autoincrement().primaryKey(),
    targetUserId: int("targetUserId").notNull(),
    grantedByUserId: int("grantedByUserId").notNull(),
    action: mysqlEnum("action", ["grant", "revoke"]).notNull(),
    note: varchar("note", { length: 280 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("manual_premium_target_created_idx").on(table.targetUserId, table.createdAt)]
);

export type Campaign = typeof campaigns.$inferSelect;
export type CampaignOutput = typeof campaignOutputs.$inferSelect;
export type ManualPremiumEntitlement = typeof manualPremiumEntitlements.$inferSelect;

/**
 * A user's connected auto-publish destination. Discord webhook is the only
 * supported kind for now — no OAuth needed, fastest reliable integration.
 */
export const publishConnections = mysqlTable(
  "publishConnections",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    kind: mysqlEnum("kind", ["discord", "slack", "telegram", "webhook"]).notNull(),
    label: varchar("label", { length: 120 }).notNull(),
    webhookUrl: text("webhookUrl").notNull(),
    isActive: mysqlEnum("isActive", ["true", "false"]).default("true").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("publish_connections_user_idx").on(table.userId)]
);

/**
 * Every post the app has actually published on the user's behalf, plus
 * whatever engagement signal we could recover. Feeds the feedback loop that
 * makes future regenerations reference what worked before.
 */
export const publishedPosts = mysqlTable(
  "publishedPosts",
  {
    id: int("id").autoincrement().primaryKey(),
    campaignId: int("campaignId").notNull(),
    userId: int("userId").notNull(),
    connectionId: int("connectionId").notNull(),
    platform: mysqlEnum("platform", ["appStore", "googlePlay", "twitter", "instagram", "linkedin", "productHunt"]).notNull(),
    content: text("content").notNull(),
    status: mysqlEnum("status", ["sent", "failed"]).notNull(),
    errorMessage: text("errorMessage"),
    reactionCount: int("reactionCount").default(0).notNull(),
    lastMetricsSyncAt: timestamp("lastMetricsSyncAt"),
    publishedAt: timestamp("publishedAt").defaultNow().notNull(),
  },
  table => [index("published_posts_user_idx").on(table.userId, table.publishedAt)]
);

/**
 * Cached cross-app pattern insights, recomputed as a user accumulates more
 * campaigns. Cheap to store, avoids recomputation on every dashboard load.
 */
export const patternInsights = mysqlTable(
  "patternInsights",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    insightText: text("insightText").notNull(),
    confidence: mysqlEnum("confidence", ["low", "medium", "high"]).notNull(),
    basedOnCampaignCount: int("basedOnCampaignCount").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("pattern_insights_user_idx").on(table.userId, table.createdAt)]
);

/**
 * Public campaign microsite — one row per campaign that's been made public.
 * slug is the shareable path segment.
 */
export const campaignMicrosites = mysqlTable(
  "campaignMicrosites",
  {
    id: int("id").autoincrement().primaryKey(),
    campaignId: int("campaignId").notNull().unique(),
    userId: int("userId").notNull(),
    slug: varchar("slug", { length: 80 }).notNull().unique(),
    isPublic: mysqlEnum("isPublic", ["true", "false"]).default("true").notNull(),
    viewCount: int("viewCount").default(0).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("campaign_microsites_user_idx").on(table.userId)]
);

export type PublishConnection = typeof publishConnections.$inferSelect;
export type PublishedPost = typeof publishedPosts.$inferSelect;
export type PatternInsight = typeof patternInsights.$inferSelect;
export type CampaignMicrosite = typeof campaignMicrosites.$inferSelect;
