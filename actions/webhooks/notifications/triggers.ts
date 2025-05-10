import { getWebhookById } from "./handlers";

import { formatForDiscordWebhook } from "./channels/discord";
// import type { DiscordWebhookPayload } from "./channels/discord";

import { formatForSlackWebhook } from "./channels/slack";
// import type { SlackWebhookPayload } from "./channels/slack";


async function _sendWebhookRequest(
    url: string,
    payload: unknown,
    headers: Record<string, string> = { "Content-Type": "application/json" }
  ): Promise<number> {
    const options: RequestInit = {
        method: "POST",
        headers,
        };

        if (payload != null) {
        options.body = JSON.stringify(payload);
        }

        const res = await fetch(url, options);
        return res.status;
  }   


/**
 * Sends a POST request to a webhook with retry logic.
 *
 * @param url - The webhook URL
 * @param payload - Optional data to send
 * @param headers - Optional headers (defaults to JSON content-type)
 * @param retries - Number of retry attempts (default: 1)
 * @param delayMs - Delay between attempts in milliseconds (default: 1000ms)
 * @param successStatusCodes - Array of HTTP status codes that count as success (default: [200, 201, 204])
 * @returns True if the webhook succeeded; false if all attempts failed
 */
async function triggerWebhookWithRetry(
    url: string,
    payload: unknown,
    headers: Record<string, string> = { "Content-Type": "application/json" },
    retries: number = 1,
    delayMs: number = 1000,
    successStatusCodes: number[] = [200, 201, 204]
  ): Promise<boolean> {
    let attempt = 0;

    while (attempt <= retries) {
      const status = await _sendWebhookRequest(url, payload, headers).catch(() => 0);

      if (successStatusCodes.includes(status)) return true;
  
      attempt++;
      if (attempt === retries) return false;

      // Delay before next execution step
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  
    return false;
  }


async function triggerWebhook(
    webhookId: string,
    message: string,
  ): Promise<boolean> {
    const webhook = await getWebhookById(webhookId)
    if (webhook == null) {
        throw new Error("No webhook")
    }
  
    let payload: unknown

    // Use correct channel handler
    switch (webhook.channel) {
      case "discord":
        payload = await formatForDiscordWebhook(message)
      case "slack":
        payload = await formatForSlackWebhook(message)
      default:
        payload = message
    }

    const result = await triggerWebhookWithRetry(
        webhook.url,
        payload,
        //webhook.headers,
    )

    return result
  }


export { triggerWebhook }