import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createCampaign,
  getCampaignForUser,
  consumeGuestImageCredit,
  getGuestImageAllowance,
  getImageUsageForPeriod,
  incrementImageUsage,
  saveCampaignImage,
  setCampaignOutput,
} from "../db";
import { generateImage } from "../_core/imageGeneration";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { createImagePrompt, generateAllPlatformCopy, generateCopyForPlatform, PLATFORMS } from "../services/gemini";
import { scoreListing } from "../services/listingScore";
import { explainGeneration } from "../services/reasoning";
import { computePatternInsights } from "../services/patternInsights";
import { buildLaunchChecklist } from "../services/launchChecklist";
import { packKeywordField } from "../services/keywordPacker";
import { generateABVariants } from "../services/abVariants";
import { generateSocialPreviewImage } from "../services/socialImageGenerator";
import { contextFromText, extractBriefContext, extractStoreContext, type SourceContext } from "../services/source";

const platformSchema = z.enum(PLATFORMS);
const sourceInput = z.object({
  mode: z.enum(["url", "brief", "manual"]),
  url: z.string().url().optional(),
  description: z.string().trim().max(100_000).optional(),
  file: z
    .object({
      name: z.string().min(1).max(180),
      mimeType: z.string().min(1).max(120),
      base64: z.string().min(1).max(14_000_000),
    })
    .optional(),
});

const sourceContextSchema = z.object({
  name: z.string().min(1).max(150),
  developer: z.string().max(150).optional(),
  description: z.string().min(20).max(100_000),
  category: z.string().max(100).optional(),
  rating: z.string().max(30).optional(),
  sourceUrl: z.string().url().optional(),
  screenshots: z.array(z.string().url()).max(3),
  sourceKind: z.enum(["url", "brief", "manual"]),
});

async function resolveSource(input: z.infer<typeof sourceInput>): Promise<SourceContext> {
  if (input.mode === "url") {
    if (!input.url) throw new TRPCError({ code: "BAD_REQUEST", message: "Add an app-store URL first." });
    return extractStoreContext(input.url);
  }
  if (input.mode === "brief") {
    if (!input.file) throw new TRPCError({ code: "BAD_REQUEST", message: "Choose a brief to upload." });
    return extractBriefContext(input.file);
  }
  if (!input.description) throw new TRPCError({ code: "BAD_REQUEST", message: "Describe the app before generating." });
  return contextFromText(input.description);
}

function monthlyPeriod(now = new Date()) {
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

export const generatorRouter = router({
  prepare: publicProcedure.input(sourceInput).mutation(async ({ input }) => {
    try {
      return resolveSource(input);
    } catch (error) {
      throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "PITCHFORGE could not read that source." });
    }
  }),

  generatePlatform: publicProcedure
    .input(z.object({ context: sourceContextSchema, platform: platformSchema }))
    .mutation(async ({ input }) => {
      try {
        return await generateCopyForPlatform(input.context, input.platform);
      } catch (error) {
        throw new TRPCError({ code: "BAD_GATEWAY", message: error instanceof Error ? error.message : "PITCHFORGE could not generate that platform copy." });
      }
    }),

  saveCampaign: protectedProcedure
    .input(
      z.object({
        context: sourceContextSchema,
        outputs: z
          .array(z.object({ platform: platformSchema, content: z.string().min(1), characterCount: z.number().int(), characterLimit: z.number().int() }))
          .length(6),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const campaignId = await createCampaign({
        userId: ctx.user.id,
        name: input.context.name,
        sourceKind: input.context.sourceKind,
        sourceUrl: input.context.sourceUrl,
        sourceText: input.context.description,
        contextJson: JSON.stringify(input.context),
      });
      await Promise.all(input.outputs.map(output => setCampaignOutput(campaignId, output)));
      return { campaignId };
    }),

  generate: publicProcedure.input(sourceInput).mutation(async ({ ctx, input }) => {
    try {
      const context = await resolveSource(input);
      const outputs = await generateAllPlatformCopy(context);
      let campaignId: number | null = null;

      if (ctx.user) {
        campaignId = await createCampaign({
          userId: ctx.user.id,
          name: context.name,
          sourceKind: context.sourceKind,
          sourceUrl: context.sourceUrl,
          sourceText: context.description,
          contextJson: JSON.stringify(context),
        });
        await Promise.all(outputs.map(output => setCampaignOutput(campaignId!, output)));
      }

      return { campaignId, context, outputs, saved: Boolean(campaignId) };
    } catch (error) {
      throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "PITCHFORGE could not generate that campaign." });
    }
  }),

  regeneratePlatform: protectedProcedure
    .input(z.object({ campaignId: z.number().int().positive(), platform: platformSchema }))
    .mutation(async ({ ctx, input }) => {
      const campaign = await getCampaignForUser(input.campaignId, ctx.user.id);
      if (!campaign) throw new TRPCError({ code: "NOT_FOUND", message: "Campaign not found." });
      const context = JSON.parse(campaign.contextJson) as SourceContext;
      const output = await generateCopyForPlatform(context, input.platform);
      await setCampaignOutput(campaign.id, output);
      return output;
    }),

  /**
   * Deterministic listing quality score — zero AI calls, pure rules against
   * known ranking/compliance factors. Public because it costs nothing to
   * compute and works on any content the caller already has, including
   * pre-save drafts.
   */
  scoreListing: publicProcedure
    .input(z.object({ content: z.string().min(1).max(20_000), platform: platformSchema, context: sourceContextSchema }))
    .query(({ input }) => scoreListing(input.content, input.platform, input.context)),

  /** Deterministic explanation of which real extracted signals shaped the copy. */
  explainGeneration: publicProcedure
    .input(z.object({ content: z.string().min(1).max(20_000), platform: platformSchema, context: sourceContextSchema }))
    .query(({ input }) => explainGeneration(input.content, input.platform, input.context)),

  /** Cross-app pattern insights, built from the signed-in user's own campaign/engagement history. */
  patternInsights: protectedProcedure.query(({ ctx }) => computePatternInsights(ctx.user.id)),

  imageUsage: protectedProcedure.query(async ({ ctx }) => {
    const usage = await getImageUsageForPeriod(ctx.user.id, monthlyPeriod());
    const isPremium = ctx.user.plan === "premium";
    return {
      plan: ctx.user.plan,
      isPremium,
      used: usage?.imageGenerationCount ?? 0,
      limit: isPremium ? null : 20,
      remaining: isPremium ? null : Math.max(0, 20 - (usage?.imageGenerationCount ?? 0)),
    };
  }),

  guestImageUsage: publicProcedure.query(async ({ ctx }) => {
    if (ctx.user) return null;
    if (!ctx.guestId) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Guest image access could not be initialized." });
    const usage = await getGuestImageAllowance(ctx.guestId);
    const used = usage?.imageGenerationCount ?? 0;
    return { used, limit: 10, remaining: Math.max(0, 10 - used), expiresAt: usage?.expiresAt ?? null };
  }),

  generateGuestImage: publicProcedure
    .input(z.object({ context: sourceContextSchema }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user) throw new TRPCError({ code: "BAD_REQUEST", message: "Signed-in members should use their campaign image controls." });
      if (!ctx.guestId) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Guest image access could not be initialized." });
      const remaining = await getGuestImageAllowance(ctx.guestId);
      if ((remaining?.imageGenerationCount ?? 0) >= 10) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You have used your 10 guest image generations. Sign in for 20 monthly image credits or upgrade for unlimited images." });
      }
      const prompt = createImagePrompt(input.context);
      const { url, textUrl } = await generateImage({
        prompt,
        quality: "medium",
        referenceImageUrl: input.context.screenshots[0],
        overlayText: { headline: input.context.name, subtext: input.context.developer },
      });
      if (!url) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "PITCHFORGE could not create that image. Please try again." });
      const usage = await consumeGuestImageCredit(ctx.guestId, 10);
      if (!usage) throw new TRPCError({ code: "FORBIDDEN", message: "You have used your 10 guest image generations. Sign in for more image credits." });
      return { url, textUrl, remaining: usage.remaining, expiresAt: usage.expiresAt };
    }),

  generateImage: protectedProcedure
    .input(z.object({ campaignId: z.number().int().positive(), customPrompt: z.string().trim().min(12).max(1_500).optional() }))
    .mutation(async ({ ctx, input }) => {
      const campaign = await getCampaignForUser(input.campaignId, ctx.user.id);
      if (!campaign) throw new TRPCError({ code: "NOT_FOUND", message: "Campaign not found." });
      const period = monthlyPeriod();
      const usage = await getImageUsageForPeriod(ctx.user.id, period);
      const isPremium = ctx.user.plan === "premium";
      if (!isPremium && (usage?.imageGenerationCount ?? 0) >= 20) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You have used this month’s 20 free image generations. Upgrade to Premium for unlimited images." });
      }
      if (!isPremium && input.customPrompt) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Custom image prompts are available with Premium." });
      }

      const context = JSON.parse(campaign.contextJson) as SourceContext;
      const prompt = input.customPrompt ?? createImagePrompt(context);
      const { url, textUrl } = await generateImage({
        prompt,
        quality: isPremium ? "high" : "medium",
        referenceImageUrl: context.screenshots[0],
        overlayText: { headline: context.name, subtext: context.developer },
      });
      if (!url) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "PITCHFORGE could not create that image. Please try again." });
      const imageUsage = isPremium ? usage?.imageGenerationCount ?? 0 : await incrementImageUsage(ctx.user.id, period);
      await saveCampaignImage({ campaignId: campaign.id, userId: ctx.user.id, prompt, imageUrl: url });
      return { url, textUrl, prompt: isPremium ? prompt : undefined, remaining: isPremium ? null : Math.max(0, 20 - imageUsage) };
    }),

  /** Launch-readiness checklist — deterministic pass/fail per extracted app signal. */
  launchChecklist: publicProcedure
    .input(z.object({ context: sourceContextSchema }))
    .query(({ input }) => buildLaunchChecklist(input.context)),

  /** iOS App Store keyword field packer — greedy knapsack within 100-char limit. */
  packKeywords: publicProcedure
    .input(z.object({
      context: sourceContextSchema,
      extraKeywords: z.array(z.string().trim().min(2).max(40)).max(20).optional(),
    }))
    .query(({ input }) => packKeywordField(input.context, input.extraKeywords)),

  /** A/B variant generation with AI critic auto-pick. Two angles, critic picks the winner. */
  generateAB: protectedProcedure
    .input(z.object({ campaignId: z.number().int().positive(), platform: platformSchema }))
    .mutation(async ({ ctx, input }) => {
      const campaign = await getCampaignForUser(input.campaignId, ctx.user.id);
      if (!campaign) throw new TRPCError({ code: "NOT_FOUND", message: "Campaign not found." });
      const context = JSON.parse(campaign.contextJson) as SourceContext;
      try {
        return await generateABVariants(context, input.platform);
      } catch (error) {
        throw new TRPCError({ code: "BAD_GATEWAY", message: error instanceof Error ? error.message : "A/B generation failed." });
      }
    }),

  /** #37 Social preview image auto-gen — per-platform aspect ratio, reuses generateImage(). */
  generateSocialImage: publicProcedure
    .input(z.object({ context: sourceContextSchema, platform: platformSchema }))
    .mutation(async ({ input }) => {
      try {
        return await generateSocialPreviewImage(input.context, input.platform);
      } catch (error) {
        throw new TRPCError({ code: "BAD_GATEWAY", message: error instanceof Error ? error.message : "Social image generation failed." });
      }
    }),
});
