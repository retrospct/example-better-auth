import "dotenv/config";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { sessionMiddleware } from "./middleware.js";

type Variables = {
  user: {
    id: string;
    email: string;
    name?: string;
  };
  session: any;
};

const app = new Hono<{ Variables: Variables }>();

// Health check endpoint (no authentication required)
app.get("/health", (c) => {
  return c.json({ status: "healthy", service: "product-api" });
});

// Apply session middleware to protected routes
app.use("/api/*", sessionMiddleware);

/**
 * Simple hello world endpoint
 * Returns 200 if authenticated
 */
app.get("/api/helloworld", (c) => {
  const user = c.get("user");

  return c.json({
    message: "Hello World!",
    authenticated: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  });
});

/**
 * Process endpoint
 * Returns 200 if authenticated
 */
app.post("/api/process", async (c) => {
  const user = c.get("user");

  return c.json({
    message: "Processing complete",
    authenticated: true,
    user: {
      id: user.id,
      email: user.email,
    },
  });
});

const port = parseInt(process.env.PRODUCT_API_PORT || "3002");

console.log(`Product API starting on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
