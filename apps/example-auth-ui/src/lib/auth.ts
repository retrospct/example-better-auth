import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  fetchOptions: {
    credentials: "include",
  },
});

export const { signIn, signUp, signOut, useSession } = authClient;

// Re-export server-side utilities
export { getServerSession } from "./auth.server";

// Re-export server actions
export { signInAction } from "./signin";
export { signUpAction } from "./signup";
export { signOutAction } from "./signout";

// Re-export types
export type { AuthActionResult } from "./auth.types";
