import * as dotenv from "dotenv";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@repo/db";
import * as schema from "@repo/db";

dotenv.config({ path: "../../.env" });

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days in seconds
  },
  secret: process.env.AUTH_SECRET || "dev-secret-key-change-in-production",
  baseURL: process.env.AUTH_BASE_URL || "http://localhost:3001",
  basePath: "/api/auth",
  trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"],
});
