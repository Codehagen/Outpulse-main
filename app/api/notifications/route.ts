import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/db";
import { z } from 'zod';
import type { Tool } from "@/lib/generated/prisma";


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


// Schema for webhook validation
const webhookSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  workspaceId: z.string().min(1, "Workspace ID is required"),
  url: z.string().url("Valid URL is required"),
  events: z.array(z.string()).optional(),
  headers: z.record(z.string()).optional(),
  secret: z.string().optional(),
  active: z.boolean().default(true),
});


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
  
    // Validate request body
    const validationResult = webhookSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid webhook data", details: validationResult.error.errors },
        { status: 400 }
      );
    }
    
    const { name, description, workspaceId, url, events, headers, secret, active } = validationResult.data;
    
    // Check if workspace exists
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId }
    });
    
    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }
    
    // Store all webhook-specific data in config
    const config: WebhookConfig = {
        type: "webhook",
        url,
        events,
        headers: headers || {},
        secret,
        active,
        lastTriggered: null,
        failureCount: 0,
        createdAt: new Date().toISOString(),
      };
    
    // Create the webhook as a Tool
    const webhook = await prisma.tool.create({
      data: {
        name,
        description,
        workspaceId,
        config: JSON.parse(JSON.stringify(config))
      }
    });

    return NextResponse.json({ 
        id: webhook.id,
        name: webhook.name,
        description: webhook.description,
        workspaceId: webhook.workspaceId,
        url: config.url,
        events: config.events,
        active: config.active,
        createdAt: config.createdAt
      }, { status: 201 });
    
  } catch (error) {
    console.error("Failed to create webhook:", error);
    return NextResponse.json(
      { error: "Failed to create webhook" },
      { status: 500 }
    );
  }
}

// Get all webhooks for a workspace
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId');
    
    if (!workspaceId) {
      return NextResponse.json(
        { error: "Workspace ID is required" },
        { status: 400 }
      );
    }
    
    const webhooks = await prisma.tool.findMany({
      where: {
        workspaceId,
        config: {
          path: 'type',
          equals: 'webhook'
        }
      }
    });
    
    // Transform the response to include relevant webhook details
    const formattedWebhooks = webhooks.map((webhook: Tool) => {
        const config = webhook.config as unknown as WebhookConfig;
        return {
          id: webhook.id,
          name: webhook.name,
          description: webhook.description,
          workspaceId: webhook.workspaceId,
          url: config.url,
          events: config.events,
          active: config.active,
          createdAt: config.createdAt
        };
      });
      
      return NextResponse.json(formattedWebhooks);
    
  } catch (error) {
    console.error("Failed to fetch webhooks:", error);
    return NextResponse.json(
      { error: "Failed to fetch webhooks" },
      { status: 500 }
    );
  }
}