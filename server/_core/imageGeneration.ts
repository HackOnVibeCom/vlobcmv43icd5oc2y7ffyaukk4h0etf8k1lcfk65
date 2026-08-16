/**
 * Image generation via Gemini 2.5 Flash Image ("Nano Banana") — free tier,
 * up to 500 requests/day. Unlike the old Cloudflare FLUX setup, this model
 * accepts an optional reference image (e.g. the app's real screenshot/logo),
 * so generated visuals can be grounded in the app's actual look rather than
 * a generic abstract render.
 */
import { storagePut } from "server/storage";
import { getGeminiConfig } from "../config";

export type GenerateImageOptions = {
  prompt: string;
  quality?: "low" | "medium" | "high";
  width?: number;
  height?: number;
  /** Optional reference image (e.g. app screenshot/logo) to ground the generation in real branding. */
  referenceImageUrl?: string;
};

export type GenerateImageResponse = {
  url?: string;
};

async function fetchAsBase64(url: string): Promise<{ data: string; mimeType: string } | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) return null;
    const mimeType = res.headers.get("content-type")?.split(";")[0] ?? "image/png";
    const buffer = Buffer.from(await res.arrayBuffer());
    return { data: buffer.toString("base64"), mimeType };
  } catch {
    return null;
  }
}

export async function generateImage(options: GenerateImageOptions): Promise<GenerateImageResponse> {
  const { apiKey, baseUrl } = getGeminiConfig();
  const model = "gemini-2.5-flash-image";

  const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];

  if (options.referenceImageUrl) {
    const reference = await fetchAsBase64(options.referenceImageUrl);
    if (reference) {
      parts.push({ inlineData: { mimeType: reference.mimeType, data: reference.data } });
    }
  }

  parts.push({ text: options.prompt });

  const response = await fetch(
    `${baseUrl}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts }],
      }),
      signal: AbortSignal.timeout(60_000),
    }
  );

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Image generation failed (${response.status}): ${detail}`);
  }

  const result = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ inlineData?: { data?: string; mimeType?: string } }> } }>;
  };

  const imagePart = result.candidates?.[0]?.content?.parts?.find(p => p.inlineData?.data);
  const b64 = imagePart?.inlineData?.data;
  if (!b64) throw new Error("Image generation returned no image data.");

  const mimeType = imagePart?.inlineData?.mimeType ?? "image/png";
  const ext = mimeType.split("/")[1] ?? "png";
  const buffer = Buffer.from(b64, "base64");
  const { url } = await storagePut(`generated/${Date.now()}.${ext}`, buffer, mimeType);
  return { url };
}

// Re-export stub so existing callers that imported listImageModels don't break
export async function listImageModels() {
  return {
    models: [
      { model: "gemini-2.5-flash-image", id: "gemini-2.5-flash-image", quality: "medium" },
    ],
  };
}
