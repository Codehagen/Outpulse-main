"use client";

import * as React from "react";
import { useParams, usePathname } from "next/navigation";
import {
  IconAugmentedReality,
  IconBrandHipchat,
  IconDashboard,
  IconDeviceLandlinePhone,
  IconHelpCircle,
  IconInnerShadowTop,
  IconSearch,
  IconSettings,
  IconTools,
  IconUsers,
} from "@tabler/icons-react";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// Navigation data structure
const getNavigationData = (workspaceId: string, pathname: string) => {
  // Helper to check if a URL is active (exact match or starts with)
  const isActive = (url: string) => {
    if (url === "/workspaces" && pathname === "/workspaces") {
      return true;
    }
    return pathname.startsWith(url) && url !== "/workspaces";
  };

  return {
    user: {
      name: "User",
      email: "user@example.com",
      avatar: "/avatars/user.jpg",
    },
    navMain: [
      {
        title: "Workspaces",
        url: "/workspaces",
        icon: IconDashboard,
        isActive: pathname === "/workspaces" || !workspaceId,
      },
      {
        title: "Agents",
        url: `/workspaces/${workspaceId}/agents`,
        icon: IconBrandHipchat,
        isActive: isActive(`/workspaces/${workspaceId}/agents`),
      },
      {
        title: "Leads",
        url: `/workspaces/${workspaceId}/leads`,
        icon: IconUsers,
        isActive: isActive(`/workspaces/${workspaceId}/leads`),
      },
      {
        title: "Tools",
        url: `/workspaces/${workspaceId}/tools`,
        icon: IconTools,
        isActive: isActive(`/workspaces/${workspaceId}/tools`),
      },
      {
        title: "Phone Numbers",
        url: `/workspaces/${workspaceId}/numbers`,
        icon: IconDeviceLandlinePhone,
        isActive: isActive(`/workspaces/${workspaceId}/numbers`),
      },
    ],
    navSecondary: [
      {
        title: "Settings",
        url: `/workspaces/${workspaceId}/settings`,
        icon: IconSettings,
        isActive: isActive(`/workspaces/${workspaceId}/settings`),
      },
      {
        title: "Help",
        url: "/help",
        icon: IconHelpCircle,
        isActive: pathname === "/help",
      },
      {
        title: "Search",
        url: "#",
        icon: IconSearch,
        isActive: false,
      },
    ],
    documents: [
      {
        name: "Analytics",
        url: `/workspaces/${workspaceId}/analytics`,
        icon: IconAugmentedReality,
        isActive: isActive(`/workspaces/${workspaceId}/analytics`),
      },
    ],
  };
};

export function WorkspaceSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const params = useParams();
  const pathname = usePathname();

  // Extract workspaceId from params
  const workspaceId = (params?.workspaceId as string) || "";

  // Get navigation data with the current workspaceId and pathname
  const data = getNavigationData(workspaceId, pathname);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/workspaces">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">OutPulse AI</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
