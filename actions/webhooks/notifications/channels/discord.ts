type DiscordEmbed = {
    title?: string;
    description?: string;
    url?: string;
    color?: number;
    fields?: { name: string; value: string; inline?: boolean }[];
    footer?: { text: string; icon_url?: string };
    timestamp?: string;
  };
  
  type DiscordWebhookPayload = {
    content?: string;
    username?: string;
    avatar_url?: string;
    embeds?: DiscordEmbed[];
  };


async function formatForDiscordWebhook(message: string) {
  try {
    const wrappedPayload: DiscordWebhookPayload = {
        content: message,
        // TODO: embeds
    }

    return wrappedPayload

  } catch (error) {
    throw error
  }
}

export { formatForDiscordWebhook }
export type { DiscordWebhookPayload }