import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getAgentById } from "@/actions/Agent/action";
import { EditAgentForm } from "@/components/forms/EditAgentForm";
import { Toaster } from "@/components/ui/sonner";

interface AgentDetailPageProps {
  params: {
    workspaceId: string; // Keep for potential future use (e.g., breadcrumbs)
    agentId: string;
  };
}

export default async function AgentDetailPage({
  params,
}: AgentDetailPageProps) {
  const { agentId } = params;

  // Fetch the agent data
  const agent = await getAgentById(agentId);

  // If agent not found (or user doesn't have access), show 404
  if (!agent) {
    notFound();
  }

  return (
    <div className="container max-w-3xl py-8">
      <Toaster />

      <h1 className="text-3xl font-bold mb-8">Edit Agent: {agent.name}</h1>

      <div className="bg-card shadow-sm rounded-lg p-6 border">
        <Suspense fallback={<div>Loading form...</div>}>
          <EditAgentForm agent={agent} />
        </Suspense>
      </div>

      <div className="mt-6 text-sm text-muted-foreground">
        <p>
          Update the agent&apos;s configuration. Changes will be synced with
          ElevenLabs.
        </p>
      </div>
    </div>
  );
}
