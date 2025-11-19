import type { Context, Next } from "hono";

interface SessionData {
  user: {
    id: string;
    email: string;
    name?: string;
  };
  session: {
    token: string;
    expiresAt: Date;
  } | null;
}

/**
 * Middleware to validate session with authentication server
 * Blocks all browser-based requests and requires valid session
 */
export async function sessionMiddleware(c: Context, next: Next) {
  // Block browser requests - only allow server-to-server
  const userAgent = c.req.header("user-agent");
  const secFetchSite = c.req.header("sec-fetch-site");

  // If sec-fetch-site header exists and is not 'none', it's likely a browser request
  if (secFetchSite && secFetchSite !== "none") {
    return c.json({ error: "Browser access not allowed" }, 403);
  }

  // Additional check: if user-agent looks like a browser (contains Mozilla)
  if (
    userAgent &&
    userAgent.includes("Mozilla") &&
    !userAgent.includes("curl")
  ) {
    return c.json({ error: "Browser access not allowed" }, 403);
  }

  // Get cookies from request
  const cookieHeader = c.req.header("cookie");

  if (!cookieHeader) {
    return c.json({ error: "No session cookie provided" }, 401);
  }

  // Validate session with authentication server
  const authUrl = process.env.AUTH_BASE_URL || "http://localhost:3001";
  const sessionEndpoint = `${authUrl}/api/session`;

  try {
    const response = await fetch(sessionEndpoint, {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
      },
    });

    if (!response.ok) {
      return c.json({ error: "Invalid or expired session" }, 401);
    }

    const sessionData = (await response.json()) as SessionData;

    // Check if session is null or invalid
    if (!sessionData.session || !sessionData.user) {
      return c.json({ error: "Invalid or expired session" }, 401);
    }

    // Attach session data to context for use in route handlers
    c.set("session", sessionData.session);
    c.set("user", sessionData.user);

    await next();
  } catch (error) {
    console.error("Session validation error:", error);
    return c.json({ error: "Session validation failed" }, 500);
  }
}
