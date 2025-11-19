import Link from "next/link";
import { getServerSession, signOutAction } from "@/lib/auth";
import { ProductApiButton } from "@/components/product-api-button";

export default async function Home() {
  const { session } = await getServerSession();

  if (session) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
          <h1 className="text-4xl font-bold mb-8">Example Auth UI</h1>
          <div className="space-y-4">
            <p className="text-lg">You're signed in.</p>

            <ProductApiButton />
          </div>
          <form action={signOutAction}>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Sign Out
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8">Example Auth UI</h1>

        {session ? (
          <div className="space-y-4">
            <p className="text-lg">You're signed in.</p>
            <form action={signOutAction}>
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Sign Out
              </button>
            </form>
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
