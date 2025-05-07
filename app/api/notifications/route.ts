import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/db";
import { WebhookConfig } from "@/app/api/notifications/types";
import { webhookSchema } from './schemas';
import { getWebhooks } from '@/actions/webhooks/notifications/handlers';


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
    
    const { name, description, workspaceId, url, events, headers, secret, active, channel } = validationResult.data;
    
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
        config: JSON.parse(JSON.stringify(config)),
        channel
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
        createdAt: config.createdAt,
        channel: webhook.channel
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
    const channel = searchParams.get('channel')

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Workspace ID is required" },
        { status: 400 }
      );
    }

    const webhooks = await getWebhooks(workspaceId, channel);
    return NextResponse.json(webhooks);

  } catch (error) {
    console.error("Failed to fetch webhooks:", error);
    return NextResponse.json(
      { error: "Failed to fetch webhooks" },
      { status: 500 }
    );
  }
}