import { getWebhookById } from "./handlers";

import { formatForDiscordWebhook } from "./notifications/channels/discord";
// import type { DiscordWebhookPayload } from "./channels/discord";

import { formatForSlackWebhook } from "./notifications/channels/slack";
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


/**
 * Generic simplicity-wrapper for webhooks.
 *
 * @param webhookdId - The internal ID of the webhook
 * @param payload - Payload to send to the webhook, must be a regular string or a JSON-serializable object
 * @returns True if the webhook succeeded; false if all attempts failed
 */
async function triggerWebhook(
  webhookId: string,
  payload: string | Record<string, unknown>,
): Promise<boolean> {
  const webhook = await getWebhookById(webhookId)
  if (webhook == null) {
      throw new Error(`No webhook found with ID: ${webhookId}`)
  }

  const result = await triggerWebhookWithRetry(
      webhook.url,
      payload,
      //webhook.headers,
  )

  return result
}


/**
 * Triggers a webhook for notifications.
 *
 * @param webhookdId - The internal ID of the webhook
 * @param message - Data to send to the webhook
 * @returns True if the webhook succeeded; false if all attempts failed
 */
async function triggerNotificationWebhook(
    webhookId: string,
    message: string | Record<string, unknown>,
  ): Promise<boolean> {
    const webhook = await getWebhookById(webhookId)
    if (webhook == null) {
        throw new Error(`No webhook found with ID: ${webhookId}`)
    }

    let payload: unknown = null

    // Use correct channel handler
    switch (webhook.channel) {
      case "discord":
        if (typeof message != 'string') {
          throw new Error("`message` has wrong type for this channel")
        }
        payload = await formatForDiscordWebhook(message)
      case "slack":
        if (typeof message != 'string') {
          throw new Error("`message` has wrong type for this channel")
        }
        payload = await formatForSlackWebhook(message)
    }

    if (!payload) {
      throw new Error("That webhook has an invalid channel")
    }

    const result = await triggerWebhookWithRetry(
        webhook.url,
        payload,
        //webhook.headers,
    )

    return result
  }



export { triggerWebhook, triggerNotificationWebhook }