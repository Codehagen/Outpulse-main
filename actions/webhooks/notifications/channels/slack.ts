type SlackBlock = {
    type: string;
    text?: {
      type: "mrkdwn" | "plain_text";
      text: string;
      emoji?: boolean;
    };
    fields?: {
      type: "mrkdwn" | "plain_text";
      text: string;
    }[];
  };
  
  type SlackWebhookPayload = {
    text?: string;
    blocks?: SlackBlock[];
    username?: string;
    icon_url?: string;
  };
  
  async function formatForSlackWebhook(message: string): Promise<SlackWebhookPayload> {
    try {
      const wrappedPayload: SlackWebhookPayload = {
        text: message,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Notification:*\n${message}`,
            },
          },
        ],
      };
  
      return wrappedPayload;
    } catch (error) {
      throw error;
    }
  }
  
  export { formatForSlackWebhook };
  export type { SlackWebhookPayload };
  