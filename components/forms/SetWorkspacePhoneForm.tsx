"use client";

import { useState, useEffect } from "react";
import { setWorkspacePhoneNumber } from "@/actions/PhoneNumber/action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { PhoneNumber } from "@/lib/generated/prisma";
import { useRouter } from "next/navigation";

interface SetWorkspacePhoneFormProps {
  workspaceId: string;
  currentPhoneNumber: PhoneNumber | null;
}

export function SetWorkspacePhoneForm({
  workspaceId,
  currentPhoneNumber,
}: SetWorkspacePhoneFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Form state initialized with current data or defaults
  const [number, setNumber] = useState(currentPhoneNumber?.number || "");
  const [label, setLabel] = useState(currentPhoneNumber?.label || "");
  const [elevenLabsId, setElevenLabsId] = useState(
    currentPhoneNumber?.elevenLabsPhoneNumberId || ""
  );

  // Update state if the prop changes (e.g., after successful save)
  useEffect(() => {
    setNumber(currentPhoneNumber?.number || "");
    setLabel(currentPhoneNumber?.label || "");
    setElevenLabsId(currentPhoneNumber?.elevenLabsPhoneNumberId || "");
  }, [currentPhoneNumber]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!number.trim() || !elevenLabsId.trim()) {
      toast.error("Phone Number and ElevenLabs Phone ID are required.");
      return;
    }

    setIsLoading(true);

    try {
      await setWorkspacePhoneNumber({
        workspaceId,
        number: number.trim(),
        label: label.trim() || undefined, // Send undefined if empty
        elevenLabsPhoneNumberId: elevenLabsId.trim(),
      });

      toast.success("Workspace phone number saved successfully.");
      router.refresh(); // Refresh the page to show updated data
    } catch (error) {
      console.error("Failed to set workspace phone number:", error);
      toast.error(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="number">Phone Number (E.164 Format)</Label>
        <Input
          id="number"
          type="tel"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          placeholder="+18889156502"
          disabled={isLoading}
          required
        />
        <p className="text-xs text-muted-foreground">
          Must be the Twilio number registered with ElevenLabs.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="label">Label (Optional)</Label>
        <Input
          id="label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g., Main Outbound Number"
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="elevenLabsId">ElevenLabs Phone Number ID</Label>
        <Input
          id="elevenLabsId"
          value={elevenLabsId}
          onChange={(e) => setElevenLabsId(e.target.value)}
          placeholder="chhOGGyJ0zneA95WSADV"
          disabled={isLoading}
          required
        />
        <p className="text-xs text-muted-foreground">
          The ID provided by ElevenLabs for this verified number.
        </p>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Saving..." : "Save Phone Number"}
      </Button>
    </form>
  );
}
