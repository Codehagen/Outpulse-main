import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getOrCreateUserWorkspace } from "@/app/actions/Workspace/action";
import { PlusIcon } from "lucide-react";

export default async function WorkspacesPage() {
  // Get workspaces for the current user (this will create one if none exist)
  const workspaces = await getOrCreateUserWorkspace();

  return (
    <div className="container max-w-5xl py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Workspaces</h1>
        <Button asChild>
          <Link href="/workspaces/new">
            <PlusIcon className="mr-2 h-4 w-4" />
            New Workspace
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workspaces.map((workspace) => (
          <Link
            key={workspace.id}
            href={`/workspaces/${workspace.id}/agents`}
            className="block"
          >
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow h-full">
              <h3 className="text-xl font-medium mb-2">{workspace.name}</h3>
              <p className="text-sm text-gray-500 mb-4">
                Created: {new Date(workspace.createdAt).toLocaleDateString()}
              </p>
              <Button variant="outline" size="sm" className="mt-auto">
                Open Workspace
              </Button>
            </div>
          </Link>
        ))}
      </div>

      {workspaces.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-medium mb-2">No workspaces yet</h3>
          <p className="text-gray-500 mb-6">
            Create your first workspace to get started
          </p>
          <Button asChild>
            <Link href="/workspaces/new">Create Your First Workspace</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
