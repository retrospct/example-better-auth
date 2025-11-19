"use server";

import { getCookieHeader, apiRequest, parseApiError } from "./auth.utils";
import type { AuthActionResult } from "./auth.types";

const PRODUCT_API_URL = process.env.PRODUCT_API_URL || "http://localhost:3002";

/**
 * Server action to call the protected Product API
 * Returns user information if authenticated, or error if not
 */
export async function callProductApi(): Promise<
  AuthActionResult & { data?: { id: string; email: string; name?: string } }
> {
  try {
    const cookieHeader = await getCookieHeader();

    if (!cookieHeader) {
      return {
        success: false,
        error: "No authentication session found. Please sign in.",
      };
    }

    console.log(
      "[callProductApi] Calling Product API:",
      `${PRODUCT_API_URL}/api/helloworld`
    );

    const response = await apiRequest(`${PRODUCT_API_URL}/api/helloworld`, {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
      },
    });

    console.log("[callProductApi] Response status:", response.status);

    // Parse response
    const contentType = response.headers.get("content-type");
    let data: any = {};

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    }

    if (!response.ok) {
      console.log("[callProductApi] Response not ok:", data);

      // Handle specific error cases
      if (response.status === 401) {
        const errorMsg =
          data?.error || "Authentication failed. Please sign in again.";
        return {
          success: false,
          error: errorMsg,
        };
      }

      if (response.status === 403) {
        return {
          success: false,
          error: data?.error || "Access forbidden.",
        };
      }

      if (response.status === 500) {
        return {
          success: false,
          error:
            data?.error || "Product API server error. Please try again later.",
        };
      }

      const { error } = parseApiError(data);
      return {
        success: false,
        error,
      };
    }

    console.log("[callProductApi] Success:", data);

    // Return success with user data
    return {
      success: true,
      data: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
      },
    };
  } catch (error) {
    console.error("[callProductApi] Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: `Failed to connect to Product API: ${errorMessage}`,
    };
  }
}
