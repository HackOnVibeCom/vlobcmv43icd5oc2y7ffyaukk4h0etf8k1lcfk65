import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createPublishConnection,
  deactivatePublishConnection,
  getCampaignForUser,
  getPublishConnectionForUser,
  getTopPerformingPosts,
  listPublishConnections,
  listPublishedPostsForCampaign,
  listPublishedPostsForUser,
  recordPublishedPost,
} from "../db";
import { protectedProcedure, router } from "../_core/trpc";
import { isValidDiscordWebhookUrl, publishToDiscord } from "../services/discordPublish";
import { PLATFORMS } from "../services/gemini";

const platformSchema = z.enum(PLATFORMS);

export const publishRouter = router({
  listConnections: protectedProcedure.query(({ ctx }) => listPublishConnections(ctx.user.id)),

  connectDiscord: protectedProcedure
    .input(z.object({ label: z.string().trim().min(1).max(120), webhookUrl: z.string().trim().url() }))
    .mutation(async ({ ctx, input }) => {
      if (!isValidDiscordWebhookUrl(input.webhookUrl)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "That doesn't look like a valid Discord webhook URL. Grab it from Channel Settings → Integrations → Webhooks." });
      }
      const id = await createPublishConnection({ userId: ctx.user.id, kind: "discord", label: input.label, webhookUrl: input.webhookUrl });
      return { id };
    }),

  disconnect: protectedProcedure
    .input(z.object({ connectionId: z.number().int().positive() }))
    .mutation(({ ctx, input }) => deactivatePublishConnection(input.connectionId, ctx.user.id)),

  /**
   * Publishes one platform's generated copy for a campaign to a connected
   * destination, right now. This is the core "link in, watch it promote
   * itself" agency feature — no additional user input required beyond
   * picking which already-generated copy to send.
   */
  publishNow: protectedProcedure
    .input(z.object({ campaignId: z.number().int().positive(), platform: platformSchema, connectionId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const campaign = await getCampaignForUser(input.campaignId, ctx.user.id);
      if (!campaign) throw new TRPCError({ code: "NOT_FOUND", message: "Campaign not found." });

      const output = campaign.outputs.find(o => o.platform === input.platform);
      if (!output) throw new TRPCError({ code: "BAD_REQUEST", message: "Generate copy for this platform before publishing." });

      const connection = await getPublishConnectionForUser(input.connectionId, ctx.user.id);
      if (!connection) throw new TRPCError({ code: "NOT_FOUND", message: "Publish connection not found." });

      let appName = "your app";
      try {
        appName = (JSON.parse(campaign.contextJson) as { name?: string }).name ?? appName;
      } catch {
        // contextJson malformed — fall back to generic name, not fatal.
      }

      const result = await publishToDiscord(connection.webhookUrl, output.content, appName);

      await recordPublishedPost({
        campaignId: campaign.id,
        userId: ctx.user.id,
        connectionId: connection.id,
        platform: input.platform,
        content: output.content,
        status: result.success ? "sent" : "failed",
        errorMessage: result.errorMessage,
      });

      if (!result.success) {
        throw new TRPCError({ code: "BAD_GATEWAY", message: result.errorMessage ?? "Publishing failed." });
      }

      return { success: true } as const;
    }),

  history: protectedProcedure
    .input(z.object({ campaignId: z.number().int().positive().optional() }))
    .query(({ ctx, input }) =>
      input.campaignId ? listPublishedPostsForCampaign(input.campaignId, ctx.user.id) : listPublishedPostsForUser(ctx.user.id)
    ),

  /**
   * Manual engagement report-back. Discord webhooks can't read reactions on
   * their own (would need a bot token + gateway connection), so this lets a
   * user optionally log how a post performed, which then feeds the
   * regeneration feedback loop. Entirely optional — never blocks the main
   * publish flow.
   */
  reportEngagement: protectedProcedure
    .input(z.object({ postId: z.number().int().positive(), reactionCount: z.number().int().min(0).max(1_000_000) }))
    .mutation(async ({ ctx, input }) => {
      const { getDb } = await import("../db");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable." });
      const { publishedPosts } = await import("../../drizzle/schema");
      const { and, eq } = await import("drizzle-orm");
      await db
        .update(publishedPosts)
        .set({ reactionCount: input.reactionCount, lastMetricsSyncAt: new Date() })
        .where(and(eq(publishedPosts.id, input.postId), eq(publishedPosts.userId, ctx.user.id)));
      return { success: true } as const;
    }),

  topPerforming: protectedProcedure.query(({ ctx }) => getTopPerformingPosts(ctx.user.id)),
});
