"use client";

import { useState } from "react";
import { createAgent } from "@/actions/Agent/action";
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
import { useRouter } from "next/navigation";

interface CreateAgentFormProps {
  workspaceId: string;
}

export function CreateAgentForm({ workspaceId }: CreateAgentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Form state
  const [name, setName] = useState("");
  const [language, setLanguage] = useState("en");
  const [firstMessage, setFirstMessage] = useState(
    "Hey, this is your AI agent. How can I help you today?"
  );
  const [systemPrompt, setSystemPrompt] = useState(
    "You are a helpful, friendly AI assistant."
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name || !language || !firstMessage || !systemPrompt) {
      toast.error("Please fill out all required fields.");
      return;
    }

    setIsLoading(true);

    try {
      await createAgent({
        name,
        workspaceId,
        language,
        firstMessage,
        systemPrompt,
      });

      toast.success("Your agent has been created successfully.");

      // Navigate to the agents list
      router.push(`/workspaces/${workspaceId}/agents`);
    } catch (error) {
      console.error("Failed to create agent:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong while creating your agent."
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
        {isLoading ? "Creating Agent..." : "Create Agent"}
      </Button>
    </form>
  );
}
