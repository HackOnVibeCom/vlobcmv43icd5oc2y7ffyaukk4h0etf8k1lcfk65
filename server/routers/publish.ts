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
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { isValidDiscordWebhookUrl, publishToDiscord } from "../services/discordPublish";
import { dispatchToWebhook, isValidWebhookUrl, PublishKind } from "../services/multiPublish";
import { PLATFORMS } from "../services/gemini";

const platformSchema = z.enum(PLATFORMS);
const kindSchema = z.enum(["discord", "slack", "telegram", "webhook"] as const);

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

  connectChannel: protectedProcedure
    .input(
      z.object({
        kind: kindSchema,
        label: z.string().trim().min(1).max(120),
        webhookUrl: z.string().trim().url(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!isValidWebhookUrl(input.webhookUrl, input.kind)) {
        let help = "Please check the webhook URL format.";
        if (input.kind === "discord") help = "Discord webhook URLs must match: https://discord.com/api/webhooks/...";
        if (input.kind === "slack") help = "Slack incoming webhooks must match: https://hooks.slack.com/services/...";
        if (input.kind === "telegram") help = "Telegram URL format: https://api.telegram.org/bot<TOKEN>/sendMessage?chat_id=<CHAT_ID>";
        throw new TRPCError({ code: "BAD_REQUEST", message: `Invalid URL for ${input.kind}. ${help}` });
      }
      const id = await createPublishConnection({
        userId: ctx.user.id,
        kind: input.kind,
        label: input.label,
        webhookUrl: input.webhookUrl,
      });
      return { id };
    }),

  disconnect: protectedProcedure
    .input(z.object({ connectionId: z.number().int().positive() }))
    .mutation(({ ctx, input }) => deactivatePublishConnection(input.connectionId, ctx.user.id)),

  testWebhook: publicProcedure
    .input(
      z.object({
        kind: kindSchema,
        webhookUrl: z.string().trim().url(),
        appName: z.string().optional().default("Pitchforge Demo"),
      })
    )
    .mutation(async ({ input }) => {
      if (!isValidWebhookUrl(input.webhookUrl, input.kind)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid webhook URL for selected channel." });
      }
      const sampleText = `🎉 Test broadcast from Pitchforge for ${input.appName}! Webhook connection confirmed working 100%.`;
      const result = await dispatchToWebhook(input.kind, input.webhookUrl, sampleText, input.appName, "Test Broadcast");
      if (!result.success) {
        throw new TRPCError({ code: "BAD_GATEWAY", message: result.errorMessage ?? "Webhook test failed." });
      }
      return { success: true };
    }),

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
        // contextJson malformed — fall back to generic name
      }

      const result = await dispatchToWebhook(
        connection.kind as PublishKind,
        connection.webhookUrl,
        output.content,
        appName,
        input.platform
      );

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

  publishToAll: protectedProcedure
    .input(z.object({ campaignId: z.number().int().positive(), platform: platformSchema }))
    .mutation(async ({ ctx, input }) => {
      const campaign = await getCampaignForUser(input.campaignId, ctx.user.id);
      if (!campaign) throw new TRPCError({ code: "NOT_FOUND", message: "Campaign not found." });

      const output = campaign.outputs.find(o => o.platform === input.platform);
      if (!output) throw new TRPCError({ code: "BAD_REQUEST", message: "Generate copy for this platform before publishing." });

      const connections = await listPublishConnections(ctx.user.id);
      if (!connections || connections.length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No active publish connections connected." });
      }

      let appName = "your app";
      try {
        appName = (JSON.parse(campaign.contextJson) as { name?: string }).name ?? appName;
      } catch {
        // contextJson fallback
      }

      const results = await Promise.allSettled(
        connections.map(async conn => {
          const res = await dispatchToWebhook(
            conn.kind as PublishKind,
            conn.webhookUrl,
            output.content,
            appName,
            input.platform
          );
          await recordPublishedPost({
            campaignId: campaign.id,
            userId: ctx.user.id,
            connectionId: conn.id,
            platform: input.platform,
            content: output.content,
            status: res.success ? "sent" : "failed",
            errorMessage: res.errorMessage,
          });
          if (!res.success) throw new Error(res.errorMessage || "Failed");
          return { connectionId: conn.id, label: conn.label };
        })
      );

      const successful = results.filter(r => r.status === "fulfilled").length;
      const failed = results.filter(r => r.status === "rejected").length;

      return {
        total: connections.length,
        successful,
        failed,
      };
    }),

  history: protectedProcedure
    .input(z.object({ campaignId: z.number().int().positive().optional() }))
    .query(({ ctx, input }) =>
      input.campaignId ? listPublishedPostsForCampaign(input.campaignId, ctx.user.id) : listPublishedPostsForUser(ctx.user.id)
    ),

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
