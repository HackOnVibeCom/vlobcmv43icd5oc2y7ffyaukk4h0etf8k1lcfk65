/**
 * Image generation via Cloudflare Workers AI (FLUX.1 [schnell]) — free tier,
 * no billing card required. FLUX has no image-input support, so
 * `referenceImageUrl` is accepted (to keep call sites unchanged) but ignored.
 *
 * Two images come back from every call that supplies `overlayText`, both
 * generated from the same base prompt/scene:
 *   - `textUrl` — FLUX is asked to naturally render the promotional headline
 *     as part of the composition (the original approach).
 *   - `url`     — the identical scene, explicitly told to leave out all text.
 * No post-processing/compositing — just two independent FLUX generations.
 */
import { storagePut } from "server/storage";
import { ENV } from "./env";

export type GenerateImageOptions = {
  prompt: string;
  quality?: "low" | "medium" | "high";
  width?: number;
  height?: number;
  /** Accepted for call-site compatibility. FLUX can't ground on a reference image, so this is unused. */
  referenceImageUrl?: string;
  /** Promotional headline/subtext to ask FLUX to render directly into the "with text" image. */
  overlayText?: { headline: string; subtext?: string };
};

export type GenerateImageResponse = {
  /** Clean visual, no text — same scene as textUrl. */
  url?: string;
  /** Same scene with the promotional headline rendered into it (only present when overlayText was given). */
  textUrl?: string;
};

async function fluxGenerate(prompt: string, width?: number, height?: number): Promise<Buffer> {
  if (!ENV.cloudflareAccountId || !ENV.cloudflareApiToken) {
    throw new Error("CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKEN are not configured.");
  }

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ENV.cloudflareAccountId}/ai/run/@cf/black-forest-labs/flux-1-schnell`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ENV.cloudflareApiToken}`,
      },
      body: JSON.stringify({
        prompt,
        steps: 4,
        ...(width ? { width } : {}),
        ...(height ? { height } : {}),
      }),
      signal: AbortSignal.timeout(60_000),
    }
  );

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Image generation failed (${response.status}): ${detail}`);
  }

  const result = (await response.json()) as { result?: { image?: string }; success: boolean; errors?: unknown[] };
  const b64 = result.result?.image;
  if (!b64) throw new Error("Image generation returned no data.");
  return Buffer.from(b64, "base64");
}

export async function generateImage(options: GenerateImageOptions): Promise<GenerateImageResponse> {
  const cleanPrompt = `${options.prompt} No text, letters, numbers, or typography anywhere in the image.`;

  if (!options.overlayText) {
    const buffer = await fluxGenerate(cleanPrompt, options.width, options.height);
    const { url } = await storagePut(`generated/${Date.now()}.png`, buffer, "image/png");
    return { url };
  }

  const { headline, subtext } = options.overlayText;
  const textPrompt = `${options.prompt} Include a short, bold promotional headline reading "${headline}"${
    subtext ? ` with smaller supporting text reading "${subtext}"` : ""
  }, tastefully integrated into the composition as real typography.`;

  const [cleanBuffer, textBuffer] = await Promise.all([
    fluxGenerate(cleanPrompt, options.width, options.height),
    fluxGenerate(textPrompt, options.width, options.height),
  ]);

  const [{ url }, { url: textUrl }] = await Promise.all([
    storagePut(`generated/${Date.now()}-clean.png`, cleanBuffer, "image/png"),
    storagePut(`generated/${Date.now()}-text.png`, textBuffer, "image/png"),
  ]);

  return { url, textUrl };
}

// Re-export stub so existing callers that imported listImageModels don't break
export async function listImageModels() {
  return {
    models: [
      { model: "gpt-image-2-low", id: "gpt-image-2", quality: "low" },
      { model: "gpt-image-2-medium", id: "gpt-image-2", quality: "medium" },
      { model: "gpt-image-2-high", id: "gpt-image-2", quality: "high" },
    ],
  };
}
