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
  toolIds?: string[]; // Add optional tool IDs
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
  toolIds = [], // Default to empty array
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
        asr: {
          // Add ASR config
          provider: "elevenlabs", // Default provider
          user_input_audio_format: "ulaw_8000", // Set user input format
        },
        tts: {
          // Add TTS config
          // You might need to specify a default model_id and voice_id here
          // model_id: "eleven_turbo_v2", // Example, choose appropriate model
          // voice_id: "YOUR_DEFAULT_VOICE_ID", // Example, set a default voice
          agent_output_audio_format: "ulaw_8000", // Set agent output format
        },
        agent: {
          first_message: firstMessage,
          language: language,
          prompt: {
            prompt: systemPrompt,
            llm: "gemini-2.0-flash-001",
            temperature: 0.7,
            tool_ids: toolIds,
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
      console.error("ElevenLabs API Error:", errorData); // Log the error details
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
        // Connect the selected tools
        tools: {
          connect: toolIds.map((id) => ({ id })),
        },
      },
    });

    return agent;
  } catch (error) {
    console.error("Failed to create agent:", error);
    // Re-throw the original error for better debugging
    if (error instanceof Error) {
      throw new Error(`Failed to create agent: ${error.message}`);
    }
    throw new Error("An unknown error occurred while creating the agent.");
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
  data: Partial<CreateAgentParams> & { workspaceId: string } // Ensure workspaceId is passed
): Promise<Agent> {
  const userId = await getUserIdOrThrow();

  // 1. Check if agent exists and user has access via workspace
  const existingAgent = await prisma.agent.findFirst({
    where: {
      id: agentId,
      workspace: {
        id: data.workspaceId,
        users: {
          some: {
            clerkId: userId,
          },
        },
      },
    },
  });

  if (!existingAgent) {
    throw new Error("Agent not found or you don't have access to it");
  }

  // 2. Prepare the payload for ElevenLabs PATCH request
  const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
  if (!elevenLabsApiKey) {
    throw new Error("ELEVENLABS_API_KEY environment variable is not set");
  }

  // Construct the config to patch, only including changed fields
  const agentConfigPatch = {
    conversation_config: {
      agent: {
        ...(data.language && { language: data.language }),
        ...(data.firstMessage && { first_message: data.firstMessage }),
        ...(data.systemPrompt && {
          prompt: {
            prompt: data.systemPrompt,
            // Consider keeping other prompt settings or making them editable too
            llm: "claude-3-7-sonnet",
            temperature: 0.7,
          },
        }),
      },
    },
    ...(data.name && { name: data.name }),
  };

  try {
    // 3. Call ElevenLabs API to update the agent
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/agents/${existingAgent.elevenLabsId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": elevenLabsApiKey,
        },
        body: JSON.stringify(agentConfigPatch),
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

    // 4. Update the agent in our database
    const updatedAgent = await prisma.agent.update({
      where: { id: agentId },
      data: {
        name: data.name || existingAgent.name,
        // Store the updated config (consider merging smartly if needed)
        config: {
          // Merge existing config with the patch
          ...(existingAgent.config as object),
          ...agentConfigPatch,
        },
      },
    });

    return updatedAgent;
  } catch (error) {
    console.error("Failed to update agent:", error);
    throw error;
  }
}

/**
 * Deletes an agent by its ID
 */
export async function deleteAgent(agentId: string): Promise<void> {
  const userId = await getUserIdOrThrow();

  // 1. Check if agent exists and user has access
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
    select: { id: true, elevenLabsId: true }, // Select elevenLabsId for deletion
  });

  if (!agent) {
    throw new Error("Agent not found or you don't have access to it");
  }

  // 2. Delete from ElevenLabs (optional, depends on desired behavior)
  const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
  if (elevenLabsApiKey) {
    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/convai/agents/${agent.elevenLabsId}`,
        {
          method: "DELETE",
          headers: {
            "xi-api-key": elevenLabsApiKey,
          },
        }
      );
      if (!response.ok && response.status !== 404) {
        // Allow 404 if agent was already deleted on ElevenLabs
        const errorData = await response.json();
        console.warn(
          `Could not delete agent ${agent.elevenLabsId} from ElevenLabs: ${
            response.status
          } - ${JSON.stringify(errorData)}`
        );
        // Decide if you want to throw an error here or just log it
      }
    } catch (error) {
      console.error("Error deleting agent from ElevenLabs:", error);
      // Decide if you want to throw an error here or just log it
    }
  }

  // 3. Delete from database
  await prisma.agent.delete({
    where: { id: agentId },
  });
}
