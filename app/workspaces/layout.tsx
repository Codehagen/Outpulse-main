import { ReactNode } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { WorkspaceSidebar } from "@/components/workspace-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { WorkspaceHeader } from "@/components/workspace-header";
import { getWorkspaceById } from "@/actions/Workspace/action";

interface WorkspaceLayoutProps {
  children: ReactNode;
  params?: { workspaceId?: string };
}

export default async function WorkspaceLayout({
  children,
  params = {},
}: WorkspaceLayoutProps) {
  const { userId } = await auth();
  const { workspaceId } = params;

  // If not signed in, redirect to home page
  if (!userId) {
    redirect("/");
  }

  // If in a specific workspace, fetch the workspace name
  let workspaceName = "Workspaces";
  if (workspaceId) {
    const workspace = await getWorkspaceById(workspaceId);
    if (workspace) {
      workspaceName = workspace.name;
    }
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <WorkspaceSidebar variant="inset" />
      <SidebarInset>
        <WorkspaceHeader title={workspaceName} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
