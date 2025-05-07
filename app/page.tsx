import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SignInButton } from "@clerk/nextjs";

export default async function HomePage() {
  const { userId } = await auth();

  // If user is signed in, redirect to workspaces
  if (userId) {
    redirect("/workspaces");
  }

  // If not signed in, show sign-in page
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg border bg-white p-6 shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold">OutPulse AI</h1>
          <p className="mt-2 text-gray-600">
            AI-powered outbound calling for your business
          </p>
        </div>

        <div className="space-y-4">
          <Button asChild className="w-full" size="lg">
            <Link href="/sign-in">Sign In</Link>
          </Button>
          <SignInButton />

          <div className="text-center text-sm">
            <p>
              Don&apos;t have an account?{" "}
              <Link href="/sign-up" className="text-primary hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Powered by ElevenLabs AI and modern web technologies.</p>
      </div>
    </div>
  );
}
