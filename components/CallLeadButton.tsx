"use client";

import { useState } from "react";
import React from "react";
import { startOutboundCall } from "@/actions/Call/action";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import type { Lead, Agent } from "@/lib/generated/prisma";
import { PhoneCallIcon } from "lucide-react";

// Type for the agent data passed to the component
type SimpleAgent = Pick<Agent, "id" | "name" | "elevenLabsId">;

interface CallLeadButtonProps {
  lead: Lead;
  agents: SimpleAgent[];
  workspaceId: string;
  workspacePhoneNumberId: string | null;
  canCall: boolean;
}

export function CallLeadButton({
  lead,
  agents,
  workspaceId,
  workspacePhoneNumberId,
  canCall,
}: CallLeadButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCall = async (agentId: string) => {
    if (!workspacePhoneNumberId) {
      toast.error("Workspace phone number is not configured.");
      return;
    }

    setIsLoading(true);
    toast.info(`Initiating call to ${lead.name} (${lead.phoneNumber})...`);

    try {
      const callRecord = await startOutboundCall({
        workspaceId,
        agentId,
        leadId: lead.id,
        phoneNumberId: workspacePhoneNumberId,
      });
      toast.success(`Call initiated successfully! SID: ${callRecord.callSid}`);
    } catch (error) {
      console.error("Failed to initiate call:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong while initiating the call."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!canCall) {
    return (
      <Button
        size="sm"
        disabled
        title="Cannot call: No agents or configured phone number for this workspace."
      >
        <PhoneCallIcon className="mr-2 h-4 w-4" />
        Call
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline" disabled={isLoading}>
          <PhoneCallIcon className="mr-2 h-4 w-4" />
          {isLoading ? "Calling..." : "Call"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64">
        <DropdownMenuLabel>Call {lead.name} with agent:</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {agents.map((agent) => (
            <DropdownMenuItem
              key={agent.id}
              disabled={isLoading || !agent.elevenLabsId}
              onSelect={() => handleCall(agent.id)}
              className="cursor-pointer"
              title={
                !agent.elevenLabsId
                  ? "Agent has no ElevenLabs ID configured"
                  : undefined
              }
            >
              {agent.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
