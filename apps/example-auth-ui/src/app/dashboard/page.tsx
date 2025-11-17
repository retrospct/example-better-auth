import { redirect } from "next/navigation";
import { authClient } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await authClient.getSession();

  if (!session) {
    redirect("/signin");
  }

  async function handleSignOut() {
    "use server";
    await authClient.signOut();
    redirect("/");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-2xl space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
          <p className="text-lg text-gray-600">Protected route example</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">User Information</h2>
          <div className="space-y-2">
            <p>
              <span className="font-medium">Name:</span> {session.user.name || "Not set"}
            </p>
            <p>
              <span className="font-medium">Email:</span> {session.user.email}
            </p>
            <p>
              <span className="font-medium">User ID:</span> {session.user.id}
            </p>
          </div>
        </div>

        <form action={handleSignOut}>
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

