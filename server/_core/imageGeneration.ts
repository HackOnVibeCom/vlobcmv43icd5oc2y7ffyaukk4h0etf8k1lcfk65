/**
 * Image generation via Cloudflare Workers AI (FLUX.1 [schnell]) — free tier,
 * no billing card required. FLUX has no image-input support, so
 * `referenceImageUrl` is accepted (to keep call sites unchanged) but ignored.
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
};

export type GenerateImageResponse = {
  url?: string;
};

export async function generateImage(options: GenerateImageOptions): Promise<GenerateImageResponse> {
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
        prompt: options.prompt,
        steps: 4,
        ...(options.width ? { width: options.width } : {}),
        ...(options.height ? { height: options.height } : {}),
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

  const buffer = Buffer.from(b64, "base64");
  const { url } = await storagePut(`generated/${Date.now()}.png`, buffer, "image/png");
  return { url };
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
