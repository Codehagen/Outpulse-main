"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import type { PhoneNumber } from "@/lib/generated/prisma";

// Helper to get user ID or throw error
async function getUserIdOrThrow(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }
  return userId;
}

type AddWorkspacePhoneParams = {
  workspaceId: string;
  number: string;
  label?: string;
  elevenLabsPhoneNumberId: string;
};

/**
 * Adds or replaces the single phone number associated with a workspace.
 */
export async function setWorkspacePhoneNumber({
  workspaceId,
  number,
  label,
  elevenLabsPhoneNumberId,
}: AddWorkspacePhoneParams): Promise<PhoneNumber> {
  const userId = await getUserIdOrThrow();

  // 1. Validate workspace access
  const workspace = await prisma.workspace.findFirst({
    where: {
      id: workspaceId,
      users: {
        some: { clerkId: userId },
      },
    },
    select: { id: true, phoneNumberId: true }, // Select existing number ID
  });

  if (!workspace) {
    throw new Error("Workspace not found or access denied.");
  }

  // Basic phone number validation
  if (!/^\+[1-9]\d{1,14}$/.test(number)) {
    throw new Error(
      "Invalid phone number format. Please use E.164 format (e.g., +18889156502)."
    );
  }

  // 2. Create the new PhoneNumber record
  // Using prisma.$transaction to ensure atomicity
  const transactionResult = await prisma.$transaction(async (tx) => {
    // Check if a number with this elevenLabs ID already exists (should be unique)
    const existingByElevenLabsId = await tx.phoneNumber.findUnique({
      where: { elevenLabsPhoneNumberId: elevenLabsPhoneNumberId },
    });
    if (
      existingByElevenLabsId &&
      existingByElevenLabsId.id !== workspace.phoneNumberId
    ) {
      throw new Error(
        "This ElevenLabs Phone Number ID is already associated with another number."
      );
    }

    const newPhoneNumber = await tx.phoneNumber.upsert({
      where: {
        // Try to find by elevenLabsPhoneNumberId first to potentially reuse/update
        elevenLabsPhoneNumberId: elevenLabsPhoneNumberId,
      },
      update: {
        // If found, update its details and link to this workspace
        number: number,
        label: label,
        assignedAt: new Date(),
        workspace: {
          connect: { id: workspaceId },
        },
      },
      create: {
        // If not found, create a new one linked to this workspace
        number: number,
        label: label,
        elevenLabsPhoneNumberId: elevenLabsPhoneNumberId,
        assignedAt: new Date(),
        workspace: {
          connect: { id: workspaceId },
        },
      },
    });

    // 3. Update the Workspace to point to the new/updated PhoneNumber
    // This automatically disconnects the old one due to the relation field
    await tx.workspace.update({
      where: { id: workspaceId },
      data: {
        phoneNumberId: newPhoneNumber.id,
      },
    });

    // 4. (Optional but recommended) Delete the old phone number if it existed and is now orphaned
    if (
      workspace.phoneNumberId &&
      workspace.phoneNumberId !== newPhoneNumber.id
    ) {
      // Double-check it's truly orphaned before deleting
      const oldPhoneNumber = await tx.phoneNumber.findUnique({
        where: { id: workspace.phoneNumberId },
        select: { workspace: true }, // Check if it's linked to any workspace
      });
      if (oldPhoneNumber && !oldPhoneNumber.workspace) {
        await tx.phoneNumber.delete({ where: { id: workspace.phoneNumberId } });
        console.log(
          `Deleted orphaned phone number: ${workspace.phoneNumberId}`
        );
      }
    }

    return newPhoneNumber;
  });

  console.log(
    `Set phone number ${transactionResult.id} for workspace ${workspaceId}`
  );
  return transactionResult;
}

// Action to get the current workspace phone number
export async function getWorkspacePhoneNumber(
  workspaceId: string
): Promise<PhoneNumber | null> {
  const userId = await getUserIdOrThrow();

  const workspace = await prisma.workspace.findFirst({
    where: {
      id: workspaceId,
      users: { some: { clerkId: userId } },
    },
    include: {
      phoneNumber: true, // Include the related phone number
    },
  });

  if (!workspace) {
    throw new Error("Workspace not found or access denied.");
  }

  return workspace.phoneNumber;
}
