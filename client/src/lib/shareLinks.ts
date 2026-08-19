/**
 * Builds one-click "share intent" URLs for social platforms. Clicking one
 * opens that platform's native share/compose window pre-filled with the
 * campaign copy — no OAuth, no API keys, no billing.
 */
export type ShareLinks = {
  twitter: string;
  whatsapp: string;
  telegram: string;
  email: string;
  linkedin?: string;
  facebook?: string;
  reddit?: string;
};

export function buildShareLinks(text: string, url?: string, subject?: string): ShareLinks {
  const encodedText = encodeURIComponent(text);
  const encodedUrl = url ? encodeURIComponent(url) : "";
  const combinedBody = url ? encodeURIComponent(`${text}\n\n${url}`) : encodedText;

  const links: ShareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}${url ? `&url=${encodedUrl}` : ""}`,
    whatsapp: `https://wa.me/?text=${combinedBody}`,
    telegram: `https://t.me/share/url?${url ? `url=${encodedUrl}&` : ""}text=${encodedText}`,
    email: `mailto:?subject=${encodeURIComponent(subject ?? "Check this out")}&body=${combinedBody}`,
  };

  if (url) {
    links.linkedin = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    links.facebook = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
    links.reddit = `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedText}`;
  }

  return links;
}

export function openShareLink(href: string) {
  window.open(href, "_blank", "noopener,noreferrer,width=650,height=680");
}

/**
 * Supported 1-click native web compose upload platforms
 */
const PLATFORMS_WITH_UPLOAD = new Set(["twitter", "linkedin", "reddit", "whatsapp", "telegram", "facebook"]);

export async function platformUploadUrl(platform: string, text: string, url?: string): Promise<{ label: string; href: string; copiedFirst: boolean } | null> {
  const encodedText = encodeURIComponent(text);
  const encodedUrl = url ? encodeURIComponent(url) : "";
  const combined = url ? encodeURIComponent(`${text}\n\n${url}`) : encodedText;

  if (platform === "twitter") {
    return {
      label: "1-Click Post to X / Twitter",
      href: `https://twitter.com/intent/tweet?text=${encodedText}${url ? `&url=${encodedUrl}` : ""}`,
      copiedFirst: false,
    };
  }

  if (platform === "reddit") {
    return {
      label: "1-Click Submit to Reddit",
      href: `https://www.reddit.com/submit?title=${encodedText}${url ? `&url=${encodedUrl}` : ""}`,
      copiedFirst: false,
    };
  }

  if (platform === "telegram") {
    return {
      label: "1-Click Broadcast to Telegram",
      href: `https://t.me/share/url?${url ? `url=${encodedUrl}&` : ""}text=${encodedText}`,
      copiedFirst: false,
    };
  }

  if (platform === "whatsapp") {
    return {
      label: "1-Click Share to WhatsApp",
      href: `https://wa.me/?text=${combined}`,
      copiedFirst: false,
    };
  }

  if (platform === "linkedin") {
    // LinkedIn requires URL on share-offsite, copies body text to clipboard for instant 1-keystroke paste
    await navigator.clipboard.writeText(text).catch(() => {});
    return {
      label: "1-Click Open in LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl || "https://apps.apple.com"}`,
      copiedFirst: true,
    };
  }

  if (platform === "facebook") {
    await navigator.clipboard.writeText(text).catch(() => {});
    return {
      label: "1-Click Share to Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl || "https://apps.apple.com"}`,
      copiedFirst: true,
    };
  }

  return null;
}
