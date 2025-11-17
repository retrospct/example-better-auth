"use server";

import { redirect } from "next/navigation";
import { getApiUrl, getOriginUrl, getCookieHeader, setCookiesFromResponse, parseApiError, apiRequest } from "./auth.utils";
import type { AuthActionResult } from "./auth.types";

/**
 * Server action for signing in
 */
export async function signInAction(
  _prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Client-side validation
  const fieldErrors: Record<string, string> = {};
  if (!email || email.trim() === "") {
    fieldErrors.email = "Email is required";
  }
  if (!password || password.trim() === "") {
    fieldErrors.password = "Password is required";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      success: false,
      error: "Please fill in all required fields",
      fieldErrors,
    };
  }

  const apiUrl = getApiUrl();
  const originUrl = getOriginUrl();
  const cookieHeader = await getCookieHeader();

  console.log("[signInAction] API URL:", apiUrl);
  console.log("[signInAction] Origin URL:", originUrl);
  console.log("[signInAction] Making request to:", `${apiUrl}/api/auth/sign-in/email`);

  try {
    const response = await apiRequest(`${apiUrl}/api/auth/sign-in/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: originUrl,
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      body: JSON.stringify({
        email: email.trim(),
        password,
      }),
      credentials: "include",
    });

    console.log("[signInAction] Response status:", response.status);
    console.log("[signInAction] Response ok:", response.ok);
    console.log("[signInAction] Response headers:", Object.fromEntries(response.headers.entries()));

    // Clone the response so we can read both body and headers
    const responseClone = response.clone();

    // Handle empty or invalid JSON responses
    let data: any = {};
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const text = await response.text();
      console.log("[signInAction] Response body:", text);
      if (text.trim()) {
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          console.error("[signInAction] Failed to parse JSON response:", parseError);
          return {
            success: false,
            error: "Invalid response from server. Please try again.",
          };
        }
      }
    }

    if (!response.ok) {
      console.log("[signInAction] Response not ok, parsing error");
      const { error, fieldErrors: apiFieldErrors } = parseApiError(data);
      return {
        success: false,
        error,
        fieldErrors: apiFieldErrors,
      };
    }

    console.log("[signInAction] Response ok, setting cookies and redirecting");
    // Set cookies from response headers (use clone to ensure headers are still readable)
    await setCookiesFromResponse(responseClone);

    redirect("/");
  } catch (error) {
    // Next.js redirect() throws a special error that we should re-throw
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    console.error("[signInAction] Error signing in:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: `An unexpected error occurred: ${errorMessage}. Please check if the API server is running.`,
    };
  }
}

