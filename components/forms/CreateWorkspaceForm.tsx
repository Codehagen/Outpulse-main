"use client";

import { useState } from "react";
import { createWorkspace } from "@/actions/Workspace/action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function CreateWorkspaceForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a workspace name");
      return;
    }

    setIsLoading(true);

    try {
      const workspace = await createWorkspace(name);
      toast.success("Workspace created successfully");

      // Reset form
      setName("");

      // Navigate programmatically using router instead of callback
      if (workspace) {
        router.push(`/workspaces/${workspace.id}/agents`);
      }
    } catch (error) {
      console.error("Failed to create workspace:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong while creating your workspace"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Workspace Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My New Workspace"
          disabled={isLoading}
          required
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Creating Workspace..." : "Create Workspace"}
      </Button>
    </form>
  );
}
