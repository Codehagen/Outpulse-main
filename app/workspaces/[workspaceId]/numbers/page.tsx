import { getWorkspacePhoneNumber } from "@/app/actions/PhoneNumber/action";
import { SetWorkspacePhoneForm } from "@/components/forms/SetWorkspacePhoneForm";
import { Toaster } from "@/components/ui/sonner";
import { Suspense } from "react";

interface NumbersPageProps {
  params: {
    workspaceId: string;
  };
}

export default async function NumbersPage({ params }: NumbersPageProps) {
  const { workspaceId } = params;

  // Fetch the current phone number for the workspace
  const currentPhoneNumber = await getWorkspacePhoneNumber(workspaceId);

  return (
    <div className="container max-w-3xl py-8">
      <Toaster />
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Phone Number</h1>
        <p className="text-muted-foreground mt-2">
          Manage the single outbound phone number for this workspace.
        </p>
      </div>

      <div className="bg-card rounded-lg border p-6 lg:p-8">
        <Suspense fallback={<div>Loading...</div>}>
          <SetWorkspacePhoneForm
            workspaceId={workspaceId}
            currentPhoneNumber={currentPhoneNumber}
          />
        </Suspense>
      </div>

      <div className="mt-6 text-sm text-muted-foreground">
        <p>
          This number will be used for all outbound calls initiated by agents in
          this workspace. It must be a Twilio number registered and verified
          with your ElevenLabs account.
        </p>
      </div>
    </div>
  );
}
