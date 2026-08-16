/**
 * Social preview image auto-generation.
 *
 * Wraps the existing generateImage() call with each platform's exact
 * social share dimensions instead of a single generic square — Twitter/OG
 * cards, Instagram posts, and LinkedIn shares all crop differently, so a
 * one-size image gets cropped badly by the platform itself. No new image
 * pipeline; this is a thin dimension/prompt spec layer over what already
 * exists (createImagePrompt + generateImage).
 */

import { createImagePrompt } from "./gemini";
import { generateImage } from "../_core/imageGeneration";
import type { Platform } from "./gemini";
import type { SourceContext } from "./source";

export const SOCIAL_IMAGE_SPECS: Record<Platform, { width: number; height: number; label: string }> = {
  appStore: { width: 1024, height: 1024, label: "App icon / store square (1:1)" },
  googlePlay: { width: 1024, height: 500, label: "Play feature graphic (1024x500)" },
  twitter: { width: 1200, height: 675, label: "X/Twitter card (16:9)" },
  instagram: { width: 1080, height: 1080, label: "Instagram post (1:1)" },
  linkedin: { width: 1200, height: 627, label: "LinkedIn share image (1.91:1)" },
  productHunt: { width: 1270, height: 760, label: "Product Hunt gallery (~1.67:1)" },
};

export type SocialImageResult = {
  url: string;
  width: number;
  height: number;
  label: string;
};

export async function generateSocialPreviewImage(context: SourceContext, platform: Platform): Promise<SocialImageResult> {
  const spec = SOCIAL_IMAGE_SPECS[platform];
  const basePrompt = createImagePrompt(context);
  const prompt = `${basePrompt} Composed for a ${spec.label} social share card — leave breathing room at the edges since platforms crop this frame.`;

  const { url } = await generateImage({ prompt, quality: "medium", width: spec.width, height: spec.height, referenceImageUrl: context.screenshots[0] });
  if (!url) throw new Error("Social preview image generation returned no image.");

  return { url, width: spec.width, height: spec.height, label: spec.label };
}
