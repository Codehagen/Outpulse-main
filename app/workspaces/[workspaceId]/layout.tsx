import { ReactNode } from "react";
import { notFound } from "next/navigation";
import { getWorkspaceById } from "@/actions/Workspace/action";
import { WorkspaceTabs } from "@/components/workspace-tabs";

interface WorkspaceLayoutProps {
  children: ReactNode;
  params: { workspaceId: string };
}

export default async function WorkspaceLayout({
  children,
  params,
}: WorkspaceLayoutProps) {
  const { workspaceId } = params;

  // Try to fetch the workspace
  const workspace = await getWorkspaceById(workspaceId);

  // If the workspace doesn't exist or user doesn't have access, show 404
  if (!workspace) {
    notFound();
  }

  return (
    <>
      <WorkspaceTabs workspaceId={workspaceId} />
      {children}
    </>
  );
}
