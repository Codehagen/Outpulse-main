import {
  SignInButton,
  SignOutButton,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";
import { getOrCreateUserWorkspace } from "../actions/Workspace/action";
import { Workspace } from "../lib/generated/prisma";
import { currentUser } from "@clerk/nextjs/server";

async function UserWorkspaces() {
  const workspaces: Workspace[] = await getOrCreateUserWorkspace();

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Your Workspaces:</h2>
      {workspaces.length > 0 ? (
        <ul className="list-disc list-inside">
          {workspaces.map((ws: Workspace) => (
            <li key={ws.id}>{ws.name}</li>
          ))}
        </ul>
      ) : (
        <p>You don&apos;t have any workspaces yet.</p>
        // TODO: Add a button/form to create a new workspace
      )}
    </div>
  );
}

export default async function Home() {
  const user = await currentUser();

  return (
    <div className="container mx-auto p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">My App</h1>
        <div>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <div className="flex items-center gap-4">
              {user && (
                <span className="text-sm">
                  Welcome,{" "}
                  {user.firstName || user.emailAddresses[0]?.emailAddress}!
                </span>
              )}
              <SignOutButton>
                <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                  Sign Out
                </button>
              </SignOutButton>
            </div>
          </SignedIn>
        </div>
      </header>

      <main>
        <SignedOut>
          <p>Please sign in to manage your workspaces.</p>
        </SignedOut>
        <SignedIn>
          <UserWorkspaces />
        </SignedIn>
      </main>
    </div>
  );
}
