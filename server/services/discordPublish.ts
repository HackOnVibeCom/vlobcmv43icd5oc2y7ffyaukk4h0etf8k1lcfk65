/**
 * Discord webhook auto-publish.
 *
 * This is the core "agency" feature: instead of only generating copy for the
 * user to manually post themselves, Pitchforge can publish it directly to a
 * channel the user connects. Discord webhooks need no OAuth flow — the user
 * just pastes a webhook URL from their server's channel settings — which
 * keeps onboarding to zero extra required fields.
 */

const DISCORD_WEBHOOK_PATTERN = /^https:\/\/(discord\.com|discordapp\.com)\/api\/webhooks\/\d+\/[\w-]+$/;

export function isValidDiscordWebhookUrl(url: string): boolean {
  return DISCORD_WEBHOOK_PATTERN.test(url.trim());
}

export type PublishResult = {
  success: boolean;
  errorMessage?: string;
};

export async function publishToDiscord(webhookUrl: string, content: string, appName: string): Promise<PublishResult> {
  if (!isValidDiscordWebhookUrl(webhookUrl)) {
    return { success: false, errorMessage: "That doesn't look like a valid Discord webhook URL." };
  }

  // Discord hard-caps message content at 2000 characters.
  const trimmed = content.length > 1900 ? `${content.slice(0, 1900)}…` : content;

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: trimmed,
        username: `Pitchforge — ${appName}`,
      }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      return { success: false, errorMessage: `Discord rejected the post (${response.status}): ${detail.slice(0, 200)}` };
    }

    return { success: true };
  } catch (error) {
    return { success: false, errorMessage: error instanceof Error ? error.message : "Network error while posting to Discord." };
  }
}

/**
 * Reads back reaction counts for a channel's recent messages via the bot-less
 * webhook path is not possible (webhooks can't read). Without a full bot
 * integration we can't pull real engagement automatically, so the feedback
 * loop below relies on the user (or a scheduled job, once a bot token is
 * configured) reporting reaction counts back in. This keeps the feature
 * honest about what data is real vs. estimated, per the "mock a little, not
 * more" guidance — the posting itself is 100% real, only the metrics
 * sync-back is a manual/optional step until a bot token is added.
 */
export const DISCORD_METRICS_NOTE =
  "Discord webhooks can send messages but can't read reactions back without a bot token. Publishing is fully live; engagement tracking is manual until a bot integration is added.";
