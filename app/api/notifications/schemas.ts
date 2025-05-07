import { z } from 'zod';

const webhookSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    workspaceId: z.string().min(1, "Workspace ID is required"),
    url: z.string().url("Valid URL is required"),
    events: z.array(z.string()).optional(),
    headers: z.record(z.string()).optional(),
    secret: z.string().optional(),
    active: z.boolean().default(true),
    channel: z.string().optional(),
  });


export { webhookSchema }
// export type Webhook = z.infer<typeof webhookSchema>;