"use server"

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import type { User, Workspace } from "@/lib/generated/prisma";


async function _getUserIdSafe(): Promise<string> {
    const { userId } = await auth();
    if (!userId) {
      // This error might be triggered if the page/component calling the action
      // isn't properly handling the signed-out state or Clerk initialization.
      throw new Error("Not authenticated");
    }
    return userId;
}


export async function getUser(): Promise<User> {
  const userId = await _getUserIdSafe();

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    //include: { workspaces: true },
  });

  if (!user) {
    throw new Error(`Couldn't find user with ID: ${userId}`)
  }

  return user;
}


export async function getUserWorkspaces(
  user: User
): Promise<Workspace[]> {
  const workspaces = await prisma.workspace.findMany({
    where: {
      users: {
        some: {
          id: user.id,
        },
      },
    },
  });

  if (!workspaces) {
    throw new Error(`Couldn't find workspaces for user with ID: ${user.id}`)
  }

  return workspaces;
}