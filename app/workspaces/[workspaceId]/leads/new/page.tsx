import { Suspense } from "react";
import { CreateLeadForm } from "@/components/forms/CreateLeadForm";
import { Toaster } from "@/components/ui/sonner";

interface NewLeadPageProps {
  params: {
    workspaceId: string;
  };
}

export default function NewLeadPage({ params }: NewLeadPageProps) {
  const { workspaceId } = params;

  return (
    <div className="container max-w-2xl py-8">
      <Toaster />

      <h1 className="text-3xl font-bold mb-8">Add New Lead</h1>

      <div className="bg-card shadow-sm rounded-lg p-6 border">
        <Suspense fallback={<div>Loading form...</div>}>
          <CreateLeadForm workspaceId={workspaceId} />
        </Suspense>
      </div>
    </div>
  );
}
