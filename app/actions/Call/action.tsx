"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import type { Call } from "@/lib/generated/prisma";

// Helper to get user ID or throw error
async function getUserIdOrThrow(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }
  return userId;
}

type StartCallParams = {
  workspaceId: string;
  agentId: string; // Your internal DB agent ID
  leadId: string; // Your internal DB lead ID
  phoneNumberId: string; // Your internal DB phone number ID (The ONE associated with the workspace)
};

type ElevenLabsCallResponse = {
  success: boolean;
  message?: string;
  callSid?: string;
};

/**
 * Initiates an outbound call via ElevenLabs/Twilio
 */
export async function startOutboundCall({
  workspaceId,
  agentId,
  leadId,
  phoneNumberId,
}: StartCallParams): Promise<Call> {
  const userId = await getUserIdOrThrow();

  // 1. Validate inputs and permissions
  const [agent, lead, phoneNumber] = await Promise.all([
    prisma.agent.findFirst({
      where: {
        id: agentId,
        workspaceId: workspaceId,
        workspace: {
          users: { some: { clerkId: userId } },
        },
      },
    }),
    prisma.lead.findFirst({
      where: {
        id: leadId,
        workspaceId: workspaceId,
        workspace: {
          users: { some: { clerkId: userId } },
        },
      },
    }),
    prisma.phoneNumber.findFirst({
      // Find the specific phone number by its ID
      where: {
        id: phoneNumberId, // Find the exact number ID passed in
        // Ensure it belongs to the correct workspace and user has access
        workspace: {
          id: workspaceId,
          users: {
            some: { clerkId: userId },
          },
        },
      },
      select: { id: true, elevenLabsPhoneNumberId: true, number: true }, // Select needed fields
    }),
  ]);

  if (!agent) throw new Error("Agent not found or access denied.");
  if (!lead) throw new Error("Lead not found or access denied.");
  if (!phoneNumber)
    throw new Error("Workspace phone number not found or access denied.");

  // Check for required IDs/data
  if (!agent.elevenLabsId) throw new Error("Agent is missing ElevenLabs ID.");
  if (!phoneNumber.elevenLabsPhoneNumberId)
    throw new Error(
      "Workspace phone number is missing its ElevenLabs Phone Number ID."
    );
  if (!lead.phoneNumber) throw new Error("Lead is missing phone number.");

  const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
  if (!elevenLabsApiKey) {
    throw new Error("ELEVENLABS_API_KEY environment variable is not set.");
  }

  // 2. Create initial Call record
  let callRecord = await prisma.call.create({
    data: {
      workspaceId,
      agentId,
      leadId,
      phoneNumberId,
      status: "initiating", // Initial status
    },
  });

  // 3. Make API call to ElevenLabs
  try {
    const payload = {
      agent_id: agent.elevenLabsId,
      agent_phone_number_id: phoneNumber.elevenLabsPhoneNumberId, // Use the fetched number's EL ID
      to_number: lead.phoneNumber,
      // conversation_initiation_client_data: {} // Optional data if needed
    };

    const response = await fetch(
      "https://api.elevenlabs.io/v1/convai/twilio/outbound_call",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": elevenLabsApiKey,
        },
        body: JSON.stringify(payload),
      }
    );

    const data = (await response.json()) as ElevenLabsCallResponse;

    if (!response.ok || !data.success) {
      throw new Error(
        `ElevenLabs API call failed: ${response.status} - ${
          data.message || "Unknown error"
        }`
      );
    }

    // 4. Update Call record on success
    callRecord = await prisma.call.update({
      where: { id: callRecord.id },
      data: {
        callSid: data.callSid,
        status: "initiated", // Or map based on Twilio status if possible
      },
    });

    console.log(`Call initiated successfully: ${data.callSid}`);
    return callRecord;
  } catch (error) {
    console.error("Failed to initiate call:", error);
    // Update Call record on failure
    await prisma.call.update({
      where: { id: callRecord.id },
      data: {
        status: "failed",
        notes:
          error instanceof Error
            ? error.message
            : "Unknown error during initiation",
        endedAt: new Date(), // Mark as ended immediately on failure
      },
    });
    throw error; // Re-throw the error to be caught by the caller
  }
}
