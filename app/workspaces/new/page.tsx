import { Suspense } from "react";
import { CreateWorkspaceForm } from "@/components/forms/CreateWorkspaceForm";
import { Toaster } from "@/components/ui/sonner";

export default function NewWorkspacePage() {
  return (
    <div className="container max-w-md py-8">
      <Toaster />

      <h1 className="text-3xl font-bold mb-8">Create New Workspace</h1>

      <div className="bg-white shadow-sm rounded-lg p-6">
        <Suspense fallback={<div>Loading...</div>}>
          <CreateWorkspaceForm />
        </Suspense>
      </div>

      <div className="mt-6 text-sm text-gray-500">
        <p>
          Workspaces help you organize your agents, leads, and tools. You can
          create multiple workspaces for different projects or teams.
        </p>
      </div>
    </div>
  );
}
