


interface WebhookConfig {
    type: 'webhook';
    url: string;
    events?: string[];
    headers: Record<string, string>;
    secret?: string;
    active: boolean;
    lastTriggered: string | null;
    failureCount: number;
    createdAt: string;
  }


export type { WebhookConfig }