import { Button } from "@/components/ui/button";
import { getWorkspaceById } from "@/actions/Workspace/action";

interface SettingsPageProps {
  params: {
    workspaceId: string;
  };
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { workspaceId } = params;

  // Fetch workspace data to display the actual name
  const workspace = await getWorkspaceById(workspaceId);
  const workspaceName = workspace?.name || "My Workspace";

  return (
    <div className="container max-w-7xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Workspace Settings</h1>
        <p className="text-gray-500 mt-2">
          Manage settings for workspace ID: {workspaceId}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-xl font-medium mb-4">General Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Workspace Name</label>
              <div className="flex mt-1 gap-2">
                <input
                  type="text"
                  value={workspaceName}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  disabled
                />
                <Button disabled>Update</Button>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-xl font-medium mb-4">ElevenLabs Integration</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">API Key</label>
              <div className="flex mt-1 gap-2">
                <input
                  type="password"
                  value="••••••••••••••••"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  disabled
                />
                <Button disabled>Update</Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 border-t pt-6">
        <h3 className="text-xl font-medium mb-4 text-red-600">Danger Zone</h3>
        <p className="text-gray-500 mb-4">
          Permanently delete this workspace and all of its data
        </p>
        <Button variant="destructive" disabled>
          Delete Workspace
        </Button>
      </div>
    </div>
  );
}
