/**
 * Get session on the server side (for use in Server Components)
 * Makes HTTP request to the API server
 */
export async function getServerSession() {
  // Import cookies only when this function is called (Server Component context)
  const { cookies } = await import("next/headers");

  // Use internal API URL for server-side requests (API_URL env var)
  // Fall back to NEXT_PUBLIC_API_URL for client-side requests
  const apiUrl =
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:3001";
  const originUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const cookieStore = await cookies();

  // Build cookie header from Next.js cookie store
  const allCookies = cookieStore.getAll();
  console.log(
    "[getServerSession] All cookies:",
    allCookies.map((c) => ({
      name: c.name,
      value: c.value.substring(0, 20) + "...",
    }))
  );

  const cookieHeader = allCookies
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  console.log(
    "[getServerSession] Cookie header:",
    cookieHeader ? cookieHeader.substring(0, 100) + "..." : "(empty)"
  );

  // Use our custom session endpoint
  const sessionEndpoint = `${apiUrl}/api/session`;
  console.log("[getServerSession] Requesting session from:", sessionEndpoint);

  try {
    const { apiRequest } = await import("./auth.utils");
    const response = await apiRequest(sessionEndpoint, {
      method: "GET",
      headers: {
        Origin: originUrl,
        Cookie: cookieHeader,
      },
      credentials: "include",
    });

    console.log("[getServerSession] Response status:", response.status);
    console.log("[getServerSession] Response ok:", response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.log("[getServerSession] Error response:", errorText);
      return null;
    }

    const data = await response.json();
    console.log("[getServerSession] Session data:", data);
    return data;
  } catch (error) {
    console.error("[getServerSession] Error fetching session:", error);
    return null;
  }
}
