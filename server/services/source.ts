import mammoth from "mammoth";

export type SourceKind = "url" | "brief" | "manual";

export type SourceContext = {
  name: string;
  developer?: string;
  description: string;
  category?: string;
  rating?: string;
  sourceUrl?: string;
  screenshots: string[];
  sourceKind: SourceKind;
};

type UploadedBrief = {
  name: string;
  mimeType: string;
  base64: string;
};

const MAX_BRIEF_BYTES = 10 * 1024 * 1024;

function decodeEntities(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function normalizeText(value?: string | null) {
  return decodeEntities((value ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim());
}

function firstMeta(html: string, key: string) {
  const expression = new RegExp(`<meta[^>]+(?:name|property)=["']${key}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i");
  const reversed = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${key}["'][^>]*>`, "i");
  return normalizeText(html.match(expression)?.[1] ?? html.match(reversed)?.[1]);
}

function firstMatch(html: string, expression: RegExp) {
  return normalizeText(html.match(expression)?.[1]);
}

function screenshotUrls(html: string) {
  const matches = Array.from(html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi))
    .map(match => match[1])
    .filter(url => /^https?:\/\//.test(url))
    .filter(url => !/logo|icon|avatar/i.test(url));
  return Array.from(new Set(matches)).slice(0, 3);
}

function assertSafeSourceUrl(rawUrl: string) {
  const url = new URL(rawUrl);
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("Use an HTTP or HTTPS app-store URL.");
  }
  const blockedHosts = ["localhost", "127.0.0.1", "0.0.0.0", "::1", "metadata.google.internal"];
  if (blockedHosts.includes(url.hostname) || /^10\.|^192\.168\.|^172\.(1[6-9]|2\d|3[0-1])\./.test(url.hostname)) {
    throw new Error("That source URL cannot be fetched for security reasons.");
  }
  return url;
}

export async function extractStoreContext(rawUrl: string): Promise<SourceContext> {
  const url = assertSafeSourceUrl(rawUrl);
  const response = await fetch(url, {
    headers: {
      "User-Agent": "PITCHFORGE/1.0 (campaign source extraction)",
      Accept: "text/html,application/xhtml+xml",
    },
    signal: AbortSignal.timeout(12_000),
    redirect: "follow",
  });

  if (!response.ok) throw new Error(`The store page returned HTTP ${response.status}.`);
  const contentLength = Number(response.headers.get("content-length") ?? 0);
  if (contentLength > 2_000_000) throw new Error("That store page is too large to process safely.");

  const html = await response.text();
  const isGooglePlay = url.hostname.includes("play.google.com");
  const isAppStore = url.hostname.includes("apps.apple.com");
  const name = firstMeta(html, "og:title") || firstMatch(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i) || "Untitled app";
  const description = firstMeta(html, "og:description") || firstMeta(html, "description") || firstMatch(html, /"description"\s*:\s*"([^"]+)/i);
  const rating = firstMatch(html, /"ratingValue"\s*:\s*"?([\d.]+)/i) || firstMatch(html, /aria-label=["'][^"']*?([\d.]+)\s*(?:star|rating)/i);
  const developer = isGooglePlay
    ? firstMatch(html, /itemprop=["']author["'][^>]*>([\s\S]*?)<\//i)
    : firstMeta(html, "author");
  const category = firstMatch(html, /itemprop=["']genre["'][^>]*>([\s\S]*?)<\//i) || (isAppStore ? "iOS app" : isGooglePlay ? "Android app" : undefined);

  if (!description) throw new Error("PITCHFORGE could not find a usable description on that page. Paste the app description instead.");

  return {
    name,
    developer: developer || undefined,
    description,
    category,
    rating: rating || undefined,
    sourceUrl: url.toString(),
    screenshots: screenshotUrls(html),
    sourceKind: "url",
  };
}

async function extractPdfText(buffer: Buffer) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const document = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
  const pages = await Promise.all(
    Array.from({ length: document.numPages }, async (_, index) => {
      const page = await document.getPage(index + 1);
      const content = await page.getTextContent();
      return content.items.map(item => ("str" in item ? item.str : "")).join(" ");
    })
  );
  return pages.join("\n");
}

export async function extractBriefContext(file: UploadedBrief): Promise<SourceContext> {
  const buffer = Buffer.from(file.base64, "base64");
  if (!buffer.length || buffer.byteLength > MAX_BRIEF_BYTES) {
    throw new Error("Upload a brief smaller than 10 MB.");
  }

  const filename = file.name.toLowerCase();
  let text = "";
  if (file.mimeType === "application/pdf" || filename.endsWith(".pdf")) {
    text = await extractPdfText(buffer);
  } else if (
    file.mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    filename.endsWith(".docx")
  ) {
    text = (await mammoth.extractRawText({ buffer })).value;
  } else if (file.mimeType.startsWith("text/") || filename.endsWith(".txt") || filename.endsWith(".md")) {
    text = buffer.toString("utf8");
  } else {
    throw new Error("Use a PDF, DOCX, TXT, or Markdown brief.");
  }

  return contextFromText(text, "brief", file.name);
}

export function contextFromText(rawText: string, sourceKind: SourceKind = "manual", fallbackName = "Untitled campaign"): SourceContext {
  const text = normalizeText(rawText);
  if (text.length < 24) throw new Error("Add a more detailed app description before generating copy.");
  const heading = rawText.match(/^\s*#?\s*([^\n]{3,100})/m)?.[1]?.trim();
  const firstSentence = text.split(/(?<=[.!?])\s+/)[0] ?? text;
  return {
    name: heading && !heading.toLowerCase().includes("brief") ? heading : fallbackName.replace(/\.[^.]+$/, ""),
    description: text,
    category: undefined,
    screenshots: [],
    sourceKind,
    developer: undefined,
    rating: undefined,
    sourceUrl: undefined,
  };
}
