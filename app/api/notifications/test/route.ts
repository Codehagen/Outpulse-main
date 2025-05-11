import { NextRequest, NextResponse } from 'next/server';
import { triggerWebhook } from '@/actions/webhooks/triggers';


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { webhookId, message } = body

    const result = await triggerWebhook(webhookId, message)

    return NextResponse.json({ 
        success: result,
      }, { status: 200 });

  } catch (error) {
    console.error("Failed to send message to webhook:", error);
    return NextResponse.json(
      { error: "Failed to send message to webhook" },
      { status: 500 }
    );
  }
}