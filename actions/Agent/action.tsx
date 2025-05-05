"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import type { Agent } from "@/lib/generated/prisma";

// Helper to get user ID or throw error
async function getUserIdOrThrow(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }
  return userId;
}

// Type for create agent request
type CreateAgentParams = {
  name: string;
  workspaceId: string;
  language: string;
  firstMessage: string;
  systemPrompt: string;
};

// Type for ElevenLabs API response
type ElevenLabsCreateAgentResponse = {
  agent_id: string;
};

/**
 * Creates an agent in both the database and ElevenLabs
 */
export async function createAgent({
  name,
  workspaceId,
  language,
  firstMessage,
  systemPrompt,
}: CreateAgentParams): Promise<Agent> {
  const userId = await getUserIdOrThrow();

  // 1. Check if workspace exists and user has access to it
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
    throw new Error("Workspace not found or you don't have access to it");
  }

  // 2. Create the agent in ElevenLabs
  // Make sure ELEVENLABS_API_KEY is in your .env
  const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
  if (!elevenLabsApiKey) {
    throw new Error("ELEVENLABS_API_KEY environment variable is not set");
  }

  try {
    // Create the configuration for the ElevenLabs agent
    const agentConfig = {
      conversation_config: {
        agent: {
          first_message: firstMessage,
          language: language,
          prompt: {
            prompt: systemPrompt,
            // Default to a good LLM that works well with tools
            llm: "claude-3-7-sonnet",
            temperature: 0.7,
          },
        },
      },
      name: name,
    };

    // Call ElevenLabs API to create agent
    const response = await fetch(
      "https://api.elevenlabs.io/v1/convai/agents/create",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": elevenLabsApiKey,
        },
        body: JSON.stringify(agentConfig),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `ElevenLabs API error: ${response.status} - ${JSON.stringify(
          errorData
        )}`
      );
    }

    const data = (await response.json()) as ElevenLabsCreateAgentResponse;
    const elevenLabsAgentId = data.agent_id;

    // 3. Store the agent in our database
    const agent = await prisma.agent.create({
      data: {
        name,
        elevenLabsId: elevenLabsAgentId,
        workspaceId,
        config: agentConfig, // Store the configuration for reference
      },
    });

    return agent;
  } catch (error) {
    console.error("Failed to create agent:", error);
    throw error;
  }
}

/**
 * Gets an agent by ID and checks if the user has access to it
 */
export async function getAgentById(agentId: string): Promise<Agent | null> {
  const userId = await getUserIdOrThrow();

  const agent = await prisma.agent.findFirst({
    where: {
      id: agentId,
      workspace: {
        users: {
          some: {
            clerkId: userId,
          },
        },
      },
    },
  });

  return agent;
}

/**
 * Gets all agents for a workspace
 */
export async function getWorkspaceAgents(
  workspaceId: string
): Promise<Agent[]> {
  const userId = await getUserIdOrThrow();

  // Check if user has access to this workspace
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
    throw new Error("Workspace not found or you don't have access to it");
  }

  // Get all agents for this workspace
  const agents = await prisma.agent.findMany({
    where: {
      workspaceId,
    },
  });

  return agents;
}

/**
 * Updates an agent both in the database and in ElevenLabs
 */
export async function updateAgent(
  agentId: string,
  data: Partial<CreateAgentParams>
): Promise<Agent> {
  // Implementation would be similar to createAgent but with update logic
  // This would include:
  // 1. Check if agent exists and user has access to it
  // 2. Update the agent in ElevenLabs
  // 3. Update the agent in our database

  // This is a skeleton for the update function
  throw new Error("Not implemented yet");
}

/**
 * Deletes an agent both from the database and from ElevenLabs
 */
export async function deleteAgent(agentId: string): Promise<void> {
  // Implementation would include:
  // 1. Check if agent exists and user has access to it
  // 2. Delete the agent from ElevenLabs
  // 3. Delete the agent from our database

  // This is a skeleton for the delete function
  throw new Error("Not implemented yet");
}
