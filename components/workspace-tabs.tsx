"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface WorkspaceTabsProps {
  workspaceId: string;
}

export function WorkspaceTabs({ workspaceId }: WorkspaceTabsProps) {
  const pathname = usePathname();

  // Determine which tab should be active based on the current path
  let activeTab = "agents"; // Default tab

  if (pathname.includes("/leads")) {
    activeTab = "leads";
  } else if (pathname.includes("/tools")) {
    activeTab = "tools";
  } else if (pathname.includes("/numbers")) {
    activeTab = "numbers";
  } else if (pathname.includes("/settings")) {
    activeTab = "settings";
  }

  return (
    <div className="container px-4 pt-4">
      <Tabs value={activeTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="agents" asChild>
            <Link href={`/workspaces/${workspaceId}/agents`}>Agents</Link>
          </TabsTrigger>
          <TabsTrigger value="leads" asChild>
            <Link href={`/workspaces/${workspaceId}/leads`}>Leads</Link>
          </TabsTrigger>
          <TabsTrigger value="tools" asChild>
            <Link href={`/workspaces/${workspaceId}/tools`}>Tools</Link>
          </TabsTrigger>
          <TabsTrigger value="numbers" asChild>
            <Link href={`/workspaces/${workspaceId}/numbers`}>
              Phone Numbers
            </Link>
          </TabsTrigger>
          <TabsTrigger value="settings" asChild>
            <Link href={`/workspaces/${workspaceId}/settings`}>Settings</Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
