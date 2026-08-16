/**
 * Builds one-click "share intent" URLs for social platforms. Clicking one
 * opens that platform's native share/compose window pre-filled with the
 * campaign copy — no OAuth, no API keys, no billing. The person still hits
 * "Post" on the platform's own screen (no platform allows a truly silent
 * auto-post without an authenticated API integration), but nothing needs
 * typing or pasting.
 */
export type ShareLinks = {
  twitter: string;
  whatsapp: string;
  telegram: string;
  email: string;
  /** Only present when a source URL is available — LinkedIn and Reddit need a URL to share meaningfully. */
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
  window.open(href, "_blank", "noopener,noreferrer,width=600,height=650");
}
