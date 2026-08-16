/**
 * Image generation via Cloudflare Workers AI (FLUX.1 [schnell]) — free tier,
 * no billing card required. FLUX has no image-input support, so
 * `referenceImageUrl` is accepted (to keep call sites unchanged) but ignored.
 *
 * Two genuinely different posters come back from every call:
 *   - `url`      — a clean, text-free visual (composition A).
 *   - `textUrl`  — a second, differently-composed visual (composition B)
 *                  with real promotional copy crisply overlaid via sharp/SVG.
 *                  That text is actually rendered, not model-hallucinated,
 *                  so it can never come out as gibberish.
 * Both are separate FLUX generations (different art-direction prompts), not
 * one image reused twice.
 */
import sharp from "sharp";
import { storagePut } from "server/storage";
import { ENV } from "./env";

export type GenerateImageOptions = {
  prompt: string;
  quality?: "low" | "medium" | "high";
  width?: number;
  height?: number;
  /** Accepted for call-site compatibility. FLUX can't ground on a reference image, so this is unused. */
  referenceImageUrl?: string;
  /**
   * Real promotional copy to crisply overlay on the second poster. If
   * omitted, both posters come back clean/text-free.
   */
  overlayText?: { headline: string; subtext?: string };
};

export type GenerateImageResponse = {
  /** Composition A — clean visual, no text. */
  url?: string;
  /** Composition B — different visual, with promotional text overlaid (only present when overlayText was given). */
  textUrl?: string;
};

const STYLE_KEYWORD_AVOID =
  "abstract atmospheric photography style, pure mood and metaphor, no interface elements";

/** Two distinct art-direction angles so the pair never looks like the same image twice. */
const COMPOSITION_VARIANTS = [
  "Composition: bold hero-centered focal subject, dramatic directional lighting, shallow depth of field, tight framing.",
  "Composition: wide environmental establishing shot, subject integrated into a larger scene, generous negative space at the edges, softer even lighting.",
] as const;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wrapText(text: string, maxCharsPerLine: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxCharsPerLine && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function buildTextOverlaySvg(width: number, height: number, headline: string, subtext?: string): string {
  const headlineSize = Math.round(width * 0.075);
  const subtextSize = Math.round(width * 0.032);
  const headlineLines = wrapText(headline, Math.max(10, Math.floor(width / (headlineSize * 0.6))));
  const subtextLines = subtext ? wrapText(subtext, Math.max(14, Math.floor(width / (subtextSize * 0.55)))) : [];

  const lineGap = headlineSize * 1.15;
  const blockHeight = headlineLines.length * lineGap + (subtextLines.length ? subtextLines.length * (subtextSize * 1.4) + subtextSize : 0);
  const scrimHeight = Math.min(height * 0.55, blockHeight + headlineSize * 2);
  const scrimY = height - scrimHeight;

  let y = height - blockHeight - headlineSize * 0.6;
  const headlineTspans = headlineLines
    .map(line => {
      const tspan = `<tspan x="${width / 2}" y="${y}">${escapeXml(line)}</tspan>`;
      y += lineGap;
      return tspan;
    })
    .join("");

  y += subtextSize * 0.3;
  const subtextTspans = subtextLines
    .map(line => {
      const tspan = `<tspan x="${width / 2}" y="${y}">${escapeXml(line)}</tspan>`;
      y += subtextSize * 1.4;
      return tspan;
    })
    .join("");

  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="scrim" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000000" stop-opacity="0" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0.72" />
    </linearGradient>
  </defs>
  <rect x="0" y="${scrimY}" width="${width}" height="${scrimHeight}" fill="url(#scrim)" />
  <text
    font-family="'DM Sans', 'Segoe UI', Arial, sans-serif"
    font-weight="700"
    font-size="${headlineSize}"
    fill="#ffffff"
    text-anchor="middle"
    style="paint-order: stroke; stroke: rgba(0,0,0,0.35); stroke-width: 2px;"
  >${headlineTspans}</text>
  ${subtextLines.length
    ? `<text font-family="'DM Sans', 'Segoe UI', Arial, sans-serif" font-weight="500" font-size="${subtextSize}" fill="#e8e8ea" text-anchor="middle">${subtextTspans}</text>`
    : ""}
</svg>`.trim();
}

async function compositeTextOverlay(
  baseBuffer: Buffer,
  width: number,
  height: number,
  overlayText: { headline: string; subtext?: string }
): Promise<Buffer> {
  const svg = buildTextOverlaySvg(width, height, overlayText.headline, overlayText.subtext);
  return sharp(baseBuffer)
    .resize(width, height, { fit: "cover" })
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .png()
    .toBuffer();
}

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
  const width = options.width ?? 1024;
  const height = options.height ?? 1024;

  const promptA = `${options.prompt} ${COMPOSITION_VARIANTS[0]} — ${STYLE_KEYWORD_AVOID}`;

  if (!options.overlayText) {
    const bufferA = await fluxGenerate(promptA, options.width, options.height);
    const { url } = await storagePut(`generated/${Date.now()}-a.png`, bufferA, "image/png");
    return { url };
  }

  const promptB = `${options.prompt} ${COMPOSITION_VARIANTS[1]} — ${STYLE_KEYWORD_AVOID}`;

  const [bufferA, bufferB] = await Promise.all([
    fluxGenerate(promptA, options.width, options.height),
    fluxGenerate(promptB, options.width, options.height),
  ]);

  const [{ url }, textBuffer] = await Promise.all([
    storagePut(`generated/${Date.now()}-a.png`, bufferA, "image/png"),
    compositeTextOverlay(bufferB, width, height, options.overlayText),
  ]);

  const { url: textUrl } = await storagePut(`generated/${Date.now()}-b-text.png`, textBuffer, "image/png");

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
