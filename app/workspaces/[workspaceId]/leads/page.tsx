import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { CallLeadButton } from "@/components/CallLeadButton";

interface LeadsPageProps {
  params: {
    workspaceId: string;
  };
}

// Helper to get user ID (avoids repeating logic)
async function getUserIdOrThrow(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    // This should ideally be caught by middleware/layout, but belt-and-suspenders
    throw new Error("Not authenticated");
  }
  return userId;
}

export default async function LeadsPage({ params }: LeadsPageProps) {
  const { workspaceId } = params;
  const userId = await getUserIdOrThrow();

  // Fetch leads and the workspace (including its phone number ID)
  // Simplified query to avoid potential stale type issues
  const workspaceData = await prisma.workspace.findFirst({
    where: { id: workspaceId, users: { some: { clerkId: userId } } },
    select: {
      id: true,
      phoneNumberId: true, // Get the ID of the linked number
      leads: {
        select: {
          id: true,
          name: true,
          phoneNumber: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
      agents: {
        select: { id: true, name: true, elevenLabsId: true },
      },
    },
  });

  if (!workspaceData) {
    throw new Error("Workspace not found or access denied.");
  }

  const leads = workspaceData.leads;
  const agents = workspaceData.agents;
  const workspacePhoneNumberId = workspaceData.phoneNumberId;

  // Check if there's a usable phone number ID for the workspace and agents exist
  const canCall = !!(workspacePhoneNumberId && agents.length > 0);

  return (
    <div className="container max-w-full py-6 lg:py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
        <Button asChild>
          <Link href={`/workspaces/${workspaceId}/leads/new`}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Leads
          </Link>
        </Button>
      </div>

      {leads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 lg:py-24 text-center">
          <h3 className="text-xl font-medium mb-2">No leads yet</h3>
          <p className="text-muted-foreground mb-8 max-w-md">
            Add leads to start making outbound calls with your AI agents
          </p>
          <Button asChild>
            <Link href={`/workspaces/${workspaceId}/leads/new`}>
              Import Your First Leads
            </Link>
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Phone Number
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Created At
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {lead.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lead.phoneNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lead.status || "New"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <CallLeadButton
                      lead={lead}
                      agents={agents}
                      workspaceId={workspaceId}
                      workspacePhoneNumberId={workspacePhoneNumberId}
                      canCall={canCall}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
