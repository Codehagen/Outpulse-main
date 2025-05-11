import { prisma } from "@/lib/db";
import { flattenWebhookToJSON } from "./util";


/**
 * Fetches all webhooks for a given workspace.
 *
 * @param workspaceId - The ID of the workspace to fetch webhooks for.
 * @param channel - Optional channel name to filter webhooks.
 * @returns A promise that resolves to an array of webhooks.
 */
async function getWebhooks(workspaceId: string, channel?: string | null) {
    const tools = await prisma.tool.findMany({
      where: {
        workspaceId,
        config: {
          path: "type",
          equals: "webhook",
          ...(channel && { path: "channel", equals: channel }),
        },
      },
    });

    return tools.map(flattenWebhookToJSON);
  }


/**
 * Fetches a given webhook.
 *
 * @param id - The ID of the webhook.
 * @returns A promise that resolves to a webhook.
 */
async function getWebhookById(id: string): Promise<ReturnType<typeof flattenWebhookToJSON> | null> {
    const webhook = await prisma.tool.findUnique({ where: { id } });
    if (!webhook) return null;
    return flattenWebhookToJSON(webhook);
}

export { getWebhooks, getWebhookById }