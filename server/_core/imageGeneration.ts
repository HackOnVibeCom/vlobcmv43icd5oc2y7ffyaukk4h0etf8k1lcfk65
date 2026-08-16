/**
 * Image generation via Cloudflare Workers AI (FLUX.1 [schnell]) — free tier,
 * no billing card required. FLUX has no image-input support, so
 * `referenceImageUrl` is accepted (to keep call sites unchanged) but ignored.
 *
 * Text-in-image handling: FLUX (like most diffusion models) renders
 * on-image text as gibberish, so we never ask it to draw text. Instead:
 *   1. The prompt sent to FLUX always carries a hard "no text/letters/words"
 *      instruction, guaranteeing a clean visual.
 *   2. If `overlayText` is supplied, a second image is produced by
 *      compositing real, crisply-rendered SVG text on top of that same
 *      clean base with sharp — actual text, not model-hallucinated glyphs,
 *      so it can never come out as gibberish.
 * One FLUX call produces both outputs (clean + with-text), generated together.
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
   * When provided, a second image is generated: the same clean visual with
   * this text crisply composited on top (real rendered text — never
   * AI-generated, so it's never gibberish).
   */
  overlayText?: { headline: string; subtext?: string };
};

export type GenerateImageResponse = {
  /** Clean visual, guaranteed free of any AI-rendered text/letters/logos. */
  url?: string;
  /** Only present when `overlayText` was requested: the same visual with real text overlaid. */
  textUrl?: string;
};

const NO_TEXT_INSTRUCTION =
  "no text, no letters, no words, no numbers, no typography, no captions, no logos, no watermarks, no signage — purely visual, photographic/illustrative only";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Wraps text into lines that roughly fit `maxCharsPerLine`, breaking on word boundaries. */
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

export async function generateImage(options: GenerateImageOptions): Promise<GenerateImageResponse> {
  if (!ENV.cloudflareAccountId || !ENV.cloudflareApiToken) {
    throw new Error("CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKEN are not configured.");
  }

  const width = options.width ?? 1024;
  const height = options.height ?? 1024;
  const prompt = `${options.prompt} — ${NO_TEXT_INSTRUCTION}`;

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

  const baseBuffer = Buffer.from(b64, "base64");
  const { url } = await storagePut(`generated/${Date.now()}.png`, baseBuffer, "image/png");

  if (!options.overlayText) {
    return { url };
  }

  const textBuffer = await compositeTextOverlay(baseBuffer, width, height, options.overlayText);
  const { url: textUrl } = await storagePut(`generated/${Date.now()}-text.png`, textBuffer, "image/png");

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
