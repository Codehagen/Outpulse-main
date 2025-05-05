import { Suspense } from "react";
import { CreateAgentForm } from "@/components/forms/CreateAgentForm";
import { Toaster } from "@/components/ui/sonner";

interface NewAgentPageProps {
  params: {
    workspaceId: string;
  };
}

export default function NewAgentPage({ params }: NewAgentPageProps) {
  const { workspaceId } = params;

  return (
    <div className="container max-w-3xl py-8">
      <Toaster />

      <h1 className="text-3xl font-bold mb-8">Create New Agent</h1>

      <div className="bg-white shadow-sm rounded-lg p-6">
        <Suspense fallback={<div>Loading...</div>}>
          <CreateAgentForm workspaceId={workspaceId} />
        </Suspense>
      </div>

      <div className="mt-6 text-sm text-gray-500">
        <p>
          Your agent will be created both in your workspace and in ElevenLabs.
          Once created, you can configure additional settings and connect it to
          phone numbers.
        </p>
      </div>
    </div>
  );
}
