import { WebhookConfig } from "@/app/api/notifications/types";
import type { Tool } from "@/lib/generated/prisma";


function flattenWebhookToJSON(webhook: Tool) {
    const config = webhook.config as unknown as WebhookConfig;
  
    return {
      id: webhook.id,
      name: webhook.name,
      description: webhook.description,
      workspaceId: webhook.workspaceId,
      url: config.url,
      headers: config.headers,
      secret: config.secret,
      events: config.events,
      active: config.active,
      createdAt: config.createdAt,
      channel: webhook.channel,
    };
  }


export { flattenWebhookToJSON }