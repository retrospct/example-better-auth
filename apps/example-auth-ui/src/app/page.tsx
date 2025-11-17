import Link from "next/link";
import { authClient } from "@/lib/auth";

export default async function Home() {
  const session = await authClient.getSession();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8">Example Auth UI</h1>
        
        {session ? (
          <div className="space-y-4">
            <p className="text-lg">Welcome, {session.user.name || session.user.email}!</p>
            <Link
              href="/dashboard"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-lg">You are not signed in.</p>
            <div className="flex gap-4">
              <Link
                href="/signin"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="inline-block px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Sign Up
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

