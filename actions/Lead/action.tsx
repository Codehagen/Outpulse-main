"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import type { Lead } from "@/lib/generated/prisma";

// Helper to get user ID or throw error
async function getUserIdOrThrow(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }
  return userId;
}

type CreateLeadParams = {
  workspaceId: string;
  name: string;
  phoneNumber: string;
  status?: string;
  notes?: string;
};

/**
 * Creates a new lead within a specific workspace
 */
export async function createLead({
  workspaceId,
  name,
  phoneNumber,
  status,
  notes,
}: CreateLeadParams): Promise<Lead> {
  const userId = await getUserIdOrThrow();

  // 1. Validate workspace access
  const workspace = await prisma.workspace.findFirst({
    where: {
      id: workspaceId,
      users: {
        some: {
          clerkId: userId,
        },
      },
    },
  });

  if (!workspace) {
    throw new Error("Workspace not found or access denied.");
  }

  // Basic phone number validation (you might want a more robust library)
  if (
    !/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im.test(
      phoneNumber
    )
  ) {
    throw new Error("Invalid phone number format.");
  }

  // 2. Create the lead
  try {
    const newLead = await prisma.lead.create({
      data: {
        workspaceId,
        name,
        phoneNumber,
        status: status || "New", // Default status
        notes,
      },
    });
    console.log(`Lead created: ${newLead.id} in workspace ${workspaceId}`);
    return newLead;
  } catch (error) {
    console.error("Failed to create lead:", error);
    // Handle potential unique constraint errors if needed
    throw error;
  }
}

// Add other lead actions (get, update, delete) here as needed
