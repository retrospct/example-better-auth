import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { Hono } from "hono";
import { auth } from "./auth";
import * as dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

const app = new Hono();

// CORS configuration for Next.js app
app.use(
  "*",
  cors({
    origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

// Health check endpoint
app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

// Custom session endpoint that uses better-auth's server-side API
app.get("/api/session", async (c) => {
  try {
    const sessionData = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!sessionData) {
      return c.json({ session: null, user: null }, 200);
    }

    return c.json(
      {
        session: sessionData.session,
        user: sessionData.user,
      },
      200
    );
  } catch (error) {
    console.error("Error getting session:", error);
    return c.json({ error: "Failed to get session" }, 500);
  }
});

// Mount better-auth routes
app.all("/api/auth/*", async (c) => {
  return auth.handler(c.req.raw);
});

const port = Number(process.env.PORT) || 3001;

console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
  hostname: "0.0.0.0",
});
