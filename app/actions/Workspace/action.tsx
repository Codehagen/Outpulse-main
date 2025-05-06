"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import type { Workspace, Tool } from "@/lib/generated/prisma"; // Adjust path based on schema output

async function getUserIdOrThrow(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    // This error might be triggered if the page/component calling the action
    // isn't properly handling the signed-out state or Clerk initialization.
    throw new Error("Not authenticated");
  }
  return userId;
}

/**
 * Gets the workspaces for the current user.
 * If the user doesn't exist in the DB, creates them.
 * If the user exists but has no workspaces, creates a default one.
 * @returns A promise resolving to an array of the user's workspaces.
 */
export async function getOrCreateUserWorkspace(): Promise<Workspace[]> {
  const userId = await getUserIdOrThrow(); // Use the helper

  let user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { workspaces: true },
  });

  // If user doesn't exist in DB, create them
  if (!user) {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      // This should technically not happen if auth() passed
      throw new Error("Clerk user not found despite authentication");
    }

    const primaryEmail = clerkUser.emailAddresses.find(
      (e) => e.id === clerkUser.primaryEmailAddressId
    )?.emailAddress;
    if (!primaryEmail) {
      throw new Error("User has no primary email address in Clerk");
    }

    console.log(`Creating new user in DB for Clerk ID: ${userId}`);
    user = await prisma.user.create({
      data: {
        clerkId: userId,
        email: primaryEmail,
        name: clerkUser.firstName || clerkUser.username || "New User",
        // Automatically create and connect a default workspace
        workspaces: {
          create: {
            name: "My First Workspace",
          },
        },
      },
      include: { workspaces: true }, // Include the newly created workspace
    });
    console.log(
      `Created user ${user.id} and default workspace ${user.workspaces[0]?.id}`
    );
  }

  // If user exists but has no workspaces, create a default one
  if (user.workspaces.length === 0) {
    console.log(`User ${user.id} has no workspaces, creating default one.`);
    const defaultWorkspace = await prisma.workspace.create({
      data: {
        name: "My Default Workspace",
        users: {
          connect: { id: user.id }, // Connect to the existing user
        },
      },
    });
    console.log(
      `Created default workspace ${defaultWorkspace.id} for user ${user.id}`
    );
    // Re-fetch user with the new workspace
    user = await prisma.user.findUnique({
      where: { id: user.id },
      include: { workspaces: true },
    });
    if (!user) {
      // Should not happen
      throw new Error(
        "Failed to refetch user after creating default workspace"
      );
    }
  }

  return user.workspaces as Workspace[];
}

// --- Other CRUD Stubs ---

export async function createWorkspace(name: string): Promise<Workspace> {
  const userId = await getUserIdOrThrow(); // Use the helper

  // Ensure user exists in DB first (getOrCreateUserWorkspace handles this implicitly if called on page load)
  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) {
    throw new Error("User not found in database. Cannot create workspace.");
  }

  console.log(`Creating workspace '${name}' for user ${user.id}`);
  const newWorkspace = await prisma.workspace.create({
    data: {
      name,
      users: {
        connect: { id: user.id },
      },
    },
  });
  console.log(`Created workspace ${newWorkspace.id}`);
  return newWorkspace;
}

export async function getWorkspaceById(
  workspaceId: string
): Promise<Workspace | null> {
  const userId = await getUserIdOrThrow(); // Use the helper

  // Optional: Add check to ensure the user belongs to this workspace
  console.log(`Getting workspace ${workspaceId} for user ${userId}`);
  const workspace = await prisma.workspace.findUnique({
    where: {
      id: workspaceId,
      // Optional: Ensure user is part of this workspace
      // users: {
      //     some: { clerkId: userId }
      // }
    },
    // include: { users: true } // Optionally include users
  });
  return workspace;
}

export async function updateWorkspace(
  workspaceId: string,
  data: Partial<Pick<Workspace, "name">>
): Promise<Workspace> {
  const userId = await getUserIdOrThrow(); // Use the helper

  // TODO: Add check to ensure the user has permission to update this workspace (e.g., is a member)

  console.log(`Updating workspace ${workspaceId} by user ${userId}`);
  const updatedWorkspace = await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      name: data.name,
      // Ensure updatedAt is updated
    },
  });
  console.log(`Updated workspace ${updatedWorkspace.id}`);
  return updatedWorkspace;
}

export async function deleteWorkspace(workspaceId: string): Promise<void> {
  const userId = await getUserIdOrThrow(); // Keep await here

  // TODO: Add check to ensure the user has permission to delete this workspace
  // TODO: Consider what happens to data within the workspace (cascade delete? disassociate?)

  console.log(`Deleting workspace ${workspaceId} by user ${userId}`);
  // IMPORTANT: This simple delete might fail if there are relations.
  // You might need disconnect users first or handle relations appropriately.
  await prisma.workspace.delete({
    where: { id: workspaceId },
  });
  console.log(`Deleted workspace ${workspaceId}`); // <-- Fixed the template literal
}

/**
 * Gets all tools for a specific workspace, checking user access.
 * @param workspaceId The ID of the workspace.
 * @returns A promise resolving to an array of tools for the workspace.
 */
export async function getWorkspaceTools(workspaceId: string): Promise<Tool[]> {
  const userId = await getUserIdOrThrow();

  // Verify user has access to the workspace
  const workspace = await prisma.workspace.findFirst({
    where: {
      id: workspaceId,
      users: {
        some: {
          clerkId: userId,
        },
      },
    },
    select: { id: true }, // Only need to select 'id' to confirm existence and access
  });

  if (!workspace) {
    throw new Error("Workspace not found or you don't have access to it");
  }

  // Fetch tools for the validated workspace
  const tools = await prisma.tool.findMany({
    where: {
      workspaceId: workspaceId,
    },
  });

  return tools;
}
