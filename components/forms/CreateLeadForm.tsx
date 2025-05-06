"use client";

import { useState } from "react";
import { createLead } from "@/actions/Lead/action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CreateLeadFormProps {
  workspaceId: string;
}

export function CreateLeadForm({ workspaceId }: CreateLeadFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Form state
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim() || !phoneNumber.trim()) {
      toast.error("Name and Phone Number are required.");
      return;
    }

    setIsLoading(true);

    try {
      await createLead({
        workspaceId,
        name: name.trim(),
        phoneNumber: phoneNumber.trim(),
        notes: notes.trim(),
      });

      toast.success("Lead created successfully.");

      // Navigate back to the leads list
      router.push(`/workspaces/${workspaceId}/leads`);
      router.refresh(); // Optional: Refresh the leads list page data
    } catch (error) {
      console.error("Failed to create lead:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong while creating the lead."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Lead Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Doe"
          disabled={isLoading}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phoneNumber">Phone Number</Label>
        <Input
          id="phoneNumber"
          type="tel" // Use type="tel" for phone numbers
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="+1 555 123 4567"
          disabled={isLoading}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any relevant information about this lead..."
          disabled={isLoading}
          rows={4}
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Adding Lead..." : "Add Lead"}
      </Button>
    </form>
  );
}
