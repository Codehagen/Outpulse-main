"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteAgent } from "@/app/actions/Agent/action";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Trash2Icon } from "lucide-react";

interface AgentDeleteButtonProps {
  agentId: string;
  agentName: string;
  onDelete?: () => void; // Optional callback after successful deletion
}

export function AgentDeleteButton({
  agentId,
  agentName,
  onDelete,
}: AgentDeleteButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deleteAgent(agentId);
      toast.success(`Agent "${agentName}" deleted successfully.`);
      setIsDialogOpen(false); // Close dialog on success
      router.refresh(); // Refresh data on the current page
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error("Failed to delete agent:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong while deleting the agent."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" disabled={isLoading}>
          <Trash2Icon className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the agent
            <strong> {agentName} </strong>
            and all associated data from our servers and ElevenLabs.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isLoading ? "Deleting..." : "Yes, delete agent"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
