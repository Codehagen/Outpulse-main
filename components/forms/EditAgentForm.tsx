"use client";

import { useState, useEffect } from "react";
import { updateAgent } from "@/actions/Agent/action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { Agent } from "@/lib/generated/prisma";
import { useRouter } from "next/navigation";
// import { Prisma } from "@prisma/client"; // No longer needed

// Remove intermediate config interfaces

interface EditAgentFormProps {
  agent: Agent;
}

export function EditAgentForm({ agent }: EditAgentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Helper function to safely access nested properties
  const getConfigValue = <T,>(path: string[], defaultValue: T): T => {
    let current: unknown = agent.config;
    for (const key of path) {
      // Type guard to ensure current is an indexable object
      if (
        current &&
        typeof current === "object" &&
        current !== null &&
        key in current
      ) {
        // Use type assertion for indexing
        current = (current as Record<string, unknown>)[key];
      } else {
        return defaultValue;
      }
    }
    // Final type assertion, assuming the path leads to the expected type T
    return (current as T) ?? defaultValue;
  };

  // Form state initialized with agent data using the helper
  const [name, setName] = useState(agent.name || "");
  const [language, setLanguage] = useState(
    getConfigValue<string>(["conversation_config", "agent", "language"], "en")
  );
  const [firstMessage, setFirstMessage] = useState(
    getConfigValue<string>(
      ["conversation_config", "agent", "first_message"],
      ""
    )
  );
  const [systemPrompt, setSystemPrompt] = useState(
    getConfigValue<string>(
      ["conversation_config", "agent", "prompt", "prompt"],
      ""
    )
  );

  // Update state if agent prop changes (e.g., after successful save)
  useEffect(() => {
    setName(agent.name || "");
    setLanguage(
      getConfigValue<string>(["conversation_config", "agent", "language"], "en")
    );
    setFirstMessage(
      getConfigValue<string>(
        ["conversation_config", "agent", "first_message"],
        ""
      )
    );
    setSystemPrompt(
      getConfigValue<string>(
        ["conversation_config", "agent", "prompt", "prompt"],
        ""
      )
    );
  }, [agent]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name || !language || !firstMessage || !systemPrompt) {
      toast.error("Please fill out all required fields.");
      return;
    }

    setIsLoading(true);

    try {
      await updateAgent(agent.id, {
        name,
        workspaceId: agent.workspaceId,
        language,
        firstMessage,
        systemPrompt,
      });

      toast.success("Agent updated successfully.");
      router.refresh(); // Re-fetches data on the current page
    } catch (error) {
      console.error("Failed to update agent:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong while updating the agent."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Agent Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Outbound Agent"
          disabled={isLoading}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="language">Language</Label>
        <Select
          value={language}
          onValueChange={setLanguage}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="es">Spanish</SelectItem>
            <SelectItem value="fr">French</SelectItem>
            <SelectItem value="de">German</SelectItem>
            <SelectItem value="it">Italian</SelectItem>
            <SelectItem value="pt">Portuguese</SelectItem>
            <SelectItem value="ja">Japanese</SelectItem>
            <SelectItem value="zh">Chinese</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="firstMessage">First Message</Label>
        <Textarea
          id="firstMessage"
          value={firstMessage}
          onChange={(e) => setFirstMessage(e.target.value)}
          placeholder="The first message your agent will say when a call begins."
          disabled={isLoading}
          rows={3}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="systemPrompt">System Prompt</Label>
        <Textarea
          id="systemPrompt"
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          placeholder="Instructions for how your agent should behave and respond."
          disabled={isLoading}
          rows={5}
          required
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Saving Changes..." : "Save Changes"}
      </Button>
    </form>
  );
}
