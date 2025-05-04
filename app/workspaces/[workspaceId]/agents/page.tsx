import Link from "next/link";
import { getWorkspaceAgents } from "@/actions/Agent/action";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

interface AgentsPageProps {
  params: {
    workspaceId: string;
  };
}

export default async function AgentsPage({ params }: AgentsPageProps) {
  const { workspaceId } = params;

  // Fetch agents for this workspace
  const agents = await getWorkspaceAgents(workspaceId);

  return (
    <div className="container py-6 lg:py-8 max-w-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-6">AI Agents</h1>
        <Button asChild>
          <Link href={`/workspaces/${workspaceId}/agents/new`}>
            <PlusIcon className="mr-2 h-4 w-4" />
            New Agent
          </Link>
        </Button>
      </div>

      {agents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 lg:py-24 text-center">
          <h3 className="text-xl font-medium mb-2">No agents yet</h3>
          <p className="text-muted-foreground mb-8 max-w-md">
            Create your first AI agent to start making outbound calls
          </p>
          <Button asChild>
            <Link href={`/workspaces/${workspaceId}/agents/new`}>
              Create Your First Agent
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="bg-card rounded-lg border p-6 transition-shadow hover:shadow-sm"
            >
              <h3 className="text-xl font-medium mb-2">{agent.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                ID: {agent.elevenLabsId.slice(0, 8)}...
              </p>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/workspaces/${workspaceId}/agents/${agent.id}`}>
                    Manage
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link
                    href={`/workspaces/${workspaceId}/agents/${agent.id}/calls`}
                  >
                    Call History
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
