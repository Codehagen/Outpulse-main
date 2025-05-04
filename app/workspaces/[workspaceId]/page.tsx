import { redirect } from "next/navigation";

interface WorkspacePageProps {
  params: {
    workspaceId: string;
  };
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { workspaceId } = params;

  // Redirect to the agents page by default
  redirect(`/workspaces/${workspaceId}/agents`);

  // This code won't be reached due to the redirect
  return null;
}
