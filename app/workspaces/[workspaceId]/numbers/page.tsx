import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

interface NumbersPageProps {
  params: {
    workspaceId: string;
  };
}

export default async function NumbersPage({ params }: NumbersPageProps) {
  const { workspaceId } = params;

  return (
    <div className="container max-w-7xl py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Phone Numbers</h1>
        <Button asChild>
          <Link href={`/workspaces/${workspaceId}/numbers/new`}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Phone Number
          </Link>
        </Button>
      </div>

      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <h3 className="text-xl font-medium mb-2">No phone numbers yet</h3>
        <p className="text-gray-500 mb-6">
          Add phone numbers to assign to your AI agents for outbound calling
        </p>
        <Button asChild>
          <Link href={`/workspaces/${workspaceId}/numbers/new`}>
            Add Your First Phone Number
          </Link>
        </Button>
      </div>
    </div>
  );
}
