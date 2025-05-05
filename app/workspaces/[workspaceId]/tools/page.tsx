import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

interface ToolsPageProps {
  params: {
    workspaceId: string;
  };
}

export default async function ToolsPage({ params }: ToolsPageProps) {
  const { workspaceId } = params;

  return (
    <div className="container max-w-7xl py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Tools</h1>
        <Button asChild>
          <Link href={`/workspaces/${workspaceId}/tools/new`}>
            <PlusIcon className="mr-2 h-4 w-4" />
            New Tool
          </Link>
        </Button>
      </div>

      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <h3 className="text-xl font-medium mb-2">No tools yet</h3>
        <p className="text-gray-500 mb-6">
          Create tools to extend your AI agents&apos; capabilities
        </p>
        <Button asChild>
          <Link href={`/workspaces/${workspaceId}/tools/new`}>
            Create Your First Tool
          </Link>
        </Button>
      </div>
    </div>
  );
}
