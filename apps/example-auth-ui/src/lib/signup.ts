"use server";

import { redirect } from "next/navigation";
import { getApiUrl, getOriginUrl, getCookieHeader, setCookiesFromResponse, parseApiError, apiRequest } from "./auth.utils";
import type { AuthActionResult } from "./auth.types";

/**
 * Server action for signing up
 */
export async function signUpAction(
  _prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Client-side validation
  const fieldErrors: Record<string, string> = {};
  if (!name || name.trim() === "") {
    fieldErrors.name = "Name is required";
  }
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

  try {
    const response = await apiRequest(`${apiUrl}/api/auth/sign-up/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: originUrl,
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim(),
        password,
      }),
      credentials: "include",
    });

    // Handle empty or invalid JSON responses
    let data: any = {};
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const text = await response.text();
      if (text.trim()) {
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          console.error("Failed to parse JSON response:", parseError);
          return {
            success: false,
            error: "Invalid response from server. Please try again.",
          };
        }
      }
    }

    if (!response.ok) {
      const { error, fieldErrors: apiFieldErrors } = parseApiError(data);
      return {
        success: false,
        error,
        fieldErrors: apiFieldErrors,
      };
    }

    // Set cookies from response headers
    await setCookiesFromResponse(response);

    redirect("/dashboard");
  } catch (error) {
    // Next.js redirect() throws a special error that we should re-throw
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    console.error("Error signing up:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

