import { z } from "zod";
import { createOrGetMicrosite, deleteCampaign, getCampaignForUser, getMicrositeBySlug, listCampaignsForUser, renameCampaign, setCampaignOutput } from "../db";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base || "campaign"}-${suffix}`;
}

export const campaignsRouter = router({
  list: protectedProcedure.query(({ ctx }) => listCampaignsForUser(ctx.user.id)),
  get: protectedProcedure.input(z.object({ campaignId: z.number().int().positive() })).query(({ ctx, input }) => getCampaignForUser(input.campaignId, ctx.user.id)),
  rename: protectedProcedure.input(z.object({ campaignId: z.number().int().positive(), name: z.string().trim().min(2).max(100) })).mutation(({ ctx, input }) =>
    renameCampaign(input.campaignId, ctx.user.id, input.name)
  ),
  saveOutput: protectedProcedure
    .input(z.object({
      campaignId: z.number().int().positive(),
      platform: z.enum(["appStore", "googlePlay", "twitter", "instagram", "linkedin", "productHunt"]),
      content: z.string().trim().min(1).max(3_000),
      characterLimit: z.number().int().positive(),
    }))
    .mutation(async ({ ctx, input }) => {
      const campaign = await getCampaignForUser(input.campaignId, ctx.user.id);
      if (!campaign) throw new Error("Campaign not found.");
      await setCampaignOutput(input.campaignId, {
        platform: input.platform,
        content: input.content,
        characterCount: input.content.length,
        characterLimit: input.characterLimit,
      });
      return { success: true } as const;
    }),
  remove: protectedProcedure.input(z.object({ campaignId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
    await deleteCampaign(input.campaignId, ctx.user.id);
    return { success: true } as const;
  }),

  /** Publishes a campaign to a public, shareable microsite URL. Idempotent — reuses the existing slug if already published. */
  publishMicrosite: protectedProcedure
    .input(z.object({ campaignId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const campaign = await getCampaignForUser(input.campaignId, ctx.user.id);
      if (!campaign) throw new Error("Campaign not found.");
      const site = await createOrGetMicrosite(input.campaignId, ctx.user.id, slugify(campaign.name));
      return site;
    }),

  /** Public lookup — no auth required, this is what the shareable link resolves. */
  getMicrosite: publicProcedure.input(z.object({ slug: z.string().min(1).max(80) })).query(({ input }) => getMicrositeBySlug(input.slug)),
});
