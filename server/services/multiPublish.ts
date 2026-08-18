/**
 * Multi-Platform Webhook Auto-Publish & Dispatcher Engine.
 * Supports Discord, Slack, Telegram, and Custom / Zapier / Make.com webhooks.
 */

export type PublishKind = "discord" | "slack" | "telegram" | "webhook";

export type PublishResult = {
  success: boolean;
  errorMessage?: string;
  destinationKind?: PublishKind;
};

const DISCORD_PATTERN = /^https:\/\/(discord\.com|discordapp\.com)\/api\/webhooks\/\d+\/[\w-]+$/;
const SLACK_PATTERN = /^https:\/\/hooks\.slack\.com\/services\/[A-Z0-9]+\/[A-Z0-9]+\/[A-Za-z0-9]+$/;
const TELEGRAM_PATTERN = /^https:\/\/api\.telegram\.org\/bot[\w:-]+\/sendMessage(?:\?chat_id=[-\w]+)?$/;

export function isValidWebhookUrl(url: string, kind: PublishKind): boolean {
  const trimmed = url.trim();
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) return false;
  if (kind === "discord") return DISCORD_PATTERN.test(trimmed);
  if (kind === "slack") return SLACK_PATTERN.test(trimmed);
  if (kind === "telegram") return trimmed.includes("api.telegram.org/bot") && trimmed.includes("sendMessage");
  return true; // generic custom webhook
}

/**
 * Dispatch copy directly to the given destination kind.
 */
export async function dispatchToWebhook(
  kind: PublishKind,
  webhookUrl: string,
  content: string,
  appName: string,
  platformName?: string
): Promise<PublishResult> {
  const trimmedUrl = webhookUrl.trim();

  try {
    if (kind === "discord") {
      const trimmed = content.length > 1900 ? `${content.slice(0, 1900)}…` : content;
      const res = await fetch(trimmedUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: trimmed,
          username: `Pitchforge — ${appName}`,
        }),
        signal: AbortSignal.timeout(15_000),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        return { success: false, errorMessage: `Discord rejected post (${res.status}): ${text.slice(0, 150)}`, destinationKind: kind };
      }
      return { success: true, destinationKind: kind };
    }

    if (kind === "slack") {
      const res = await fetch(trimmedUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `🚀 *Pitchforge Launch Copy — ${appName}* (${platformName || "Launch Post"})\n\n${content}`,
          blocks: [
            {
              type: "header",
              text: { type: "plain_text", text: `🚀 ${appName} — ${platformName || "Launch Post"}` },
            },
            {
              type: "section",
              text: { type: "mrkdwn", text: content },
            },
            {
              type: "context",
              elements: [
                { type: "mrkdwn", text: `_Dispatched via Pitchforge · ${new Date().toLocaleDateString()}_` },
              ],
            },
          ],
        }),
        signal: AbortSignal.timeout(15_000),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        return { success: false, errorMessage: `Slack rejected post (${res.status}): ${text.slice(0, 150)}`, destinationKind: kind };
      }
      return { success: true, destinationKind: kind };
    }

    if (kind === "telegram") {
      // Telegram sendMessage URL can have chat_id in query or body
      const urlObj = new URL(trimmedUrl);
      const chatId = urlObj.searchParams.get("chat_id");
      const postBody: Record<string, unknown> = {
        text: `🚀 *${appName}* (${platformName || "Launch"})\n\n${content}\n\n_— Dispatched via Pitchforge_`,
        parse_mode: "Markdown",
      };
      if (chatId) postBody.chat_id = chatId;

      const res = await fetch(trimmedUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postBody),
        signal: AbortSignal.timeout(15_000),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        return { success: false, errorMessage: `Telegram rejected message (${res.status}): ${text.slice(0, 150)}`, destinationKind: kind };
      }
      return { success: true, destinationKind: kind };
    }

    // Generic webhook / Zapier / Make / Webhook.site
    const res = await fetch(trimmedUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Pitchforge-AutoPublish/1.0",
      },
      body: JSON.stringify({
        event: "pitchforge.publish",
        appName,
        platform: platformName,
        content,
        timestamp: new Date().toISOString(),
        source: "Pitchforge Campaign Auto-Publish",
      }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { success: false, errorMessage: `Webhook destination returned ${res.status}: ${text.slice(0, 150)}`, destinationKind: kind };
    }
    return { success: true, destinationKind: kind };
  } catch (err) {
    return {
      success: false,
      errorMessage: err instanceof Error ? err.message : "Network error during webhook dispatch.",
      destinationKind: kind,
    };
  }
}
