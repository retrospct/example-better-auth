"use server";

import { redirect } from "next/navigation";
import {
  getApiUrl,
  getOriginUrl,
  getCookieHeader,
  apiRequest,
} from "./auth.utils";
import { cookies } from "next/headers";

/**
 * Server action for signing out
 */
export async function signOutAction(): Promise<void> {
  const apiUrl = getApiUrl();
  const originUrl = getOriginUrl();
  const cookieHeader = await getCookieHeader();

  console.log("[signOutAction] API URL:", apiUrl);
  console.log("[signOutAction] Origin URL:", originUrl);

  try {
    // Call the sign-out endpoint
    const response = await apiRequest(`${apiUrl}/api/auth/sign-out`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: originUrl,
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      credentials: "include",
    });

    console.log("[signOutAction] Response status:", response.status);

    // Delete auth cookies from Next.js cookie store
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();

    // Delete better-auth related cookies
    for (const cookie of allCookies) {
      if (
        cookie.name.startsWith("better-auth") ||
        cookie.name.includes("session") ||
        cookie.name.includes("token")
      ) {
        console.log("[signOutAction] Deleting cookie:", cookie.name);
        cookieStore.delete(cookie.name);
      }
    }

    console.log("[signOutAction] Sign out successful, redirecting");
  } catch (error) {
    console.error("[signOutAction] Error signing out:", error);
    // Even if the API call fails, delete cookies locally
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();

    for (const cookie of allCookies) {
      if (
        cookie.name.startsWith("better-auth") ||
        cookie.name.includes("session") ||
        cookie.name.includes("token")
      ) {
        cookieStore.delete(cookie.name);
      }
    }
  }

  // Always redirect to home page after sign out
  redirect("/");
}
