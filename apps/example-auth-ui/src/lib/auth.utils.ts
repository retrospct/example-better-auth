/**
 * Get the API URL for server-side requests
 */
export function getApiUrl(): string {
  return process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
}

/**
 * Retry a fetch request with exponential backoff
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3,
  delay = 1000
): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      // If we get a response (even if not ok), return it
      return response;
    } catch (error) {
      lastError = error as Error;
      // Only retry on connection errors, not on HTTP errors
      if (attempt < maxRetries - 1) {
        const backoffDelay = delay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, backoffDelay));
        continue;
      }
      throw lastError;
    }
  }
  
  throw lastError || new Error("Failed to fetch after retries");
}

/**
 * Get the origin URL for server-side requests (required by better-auth)
 */
export function getOriginUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

/**
 * Get cookie header string from Next.js cookie store
 */
export async function getCookieHeader(): Promise<string> {
  // Lazy import to avoid making this module server-only
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  return cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
}

/**
 * Parse and set cookies from API response headers
 */
export async function setCookiesFromResponse(response: Response): Promise<void> {
  const setCookieHeaders = response.headers.getSetCookie();
  console.log("[setCookiesFromResponse] Set-Cookie headers:", setCookieHeaders);
  
  if (!setCookieHeaders || setCookieHeaders.length === 0) {
    console.log("[setCookiesFromResponse] No Set-Cookie headers found");
    return;
  }

  // Lazy import to avoid making this module server-only
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();

  for (const cookieString of setCookieHeaders) {
    console.log("[setCookiesFromResponse] Parsing cookie:", cookieString);
    
    // Parse cookie string (format: name=value; attr1=val1; attr2=val2)
    const [nameValue, ...attributes] = cookieString.split("; ");
    const [name, value] = nameValue.split("=");

    if (!name || !value) {
      console.log("[setCookiesFromResponse] Skipping invalid cookie:", cookieString);
      continue;
    }

    console.log("[setCookiesFromResponse] Setting cookie:", name, "=", value.substring(0, 20) + "...");

    // Parse attributes
    const cookieOptions: {
      httpOnly?: boolean;
      secure?: boolean;
      sameSite?: "strict" | "lax" | "none";
      maxAge?: number;
      path?: string;
      domain?: string;
    } = {};

    for (const attr of attributes) {
      const [key, val] = attr.split("=");
      const keyLower = key.toLowerCase().trim();

      if (keyLower === "httponly") {
        cookieOptions.httpOnly = true;
      } else if (keyLower === "secure") {
        cookieOptions.secure = true;
      } else if (keyLower === "samesite") {
        cookieOptions.sameSite = val?.toLowerCase() as "strict" | "lax" | "none";
      } else if (keyLower === "max-age") {
        cookieOptions.maxAge = parseInt(val, 10);
      } else if (keyLower === "path") {
        cookieOptions.path = val;
      } else if (keyLower === "domain") {
        // Note: In Next.js, we typically don't set domain for localhost
        // Only set domain if it's not localhost
        if (val && !val.includes("localhost")) {
          cookieOptions.domain = val;
        }
      }
    }

    // Better-auth typically sets cookies with path="/api/auth", but we need them accessible site-wide
    // So we override to "/" to ensure cookies work for all routes
    cookieOptions.path = "/";

    console.log("[setCookiesFromResponse] Cookie options:", cookieOptions);
    cookieStore.set(name, value, cookieOptions);
  }
  
  console.log("[setCookiesFromResponse] Cookies set successfully");
}

/**
 * Parse API error response and return structured error
 */
export function parseApiError(data: any): {
  error: string;
  fieldErrors?: Record<string, string>;
} {
  const errorMessage = data?.error?.message || data?.message || "An error occurred";

  // Check for field-specific errors in the response
  const apiFieldErrors: Record<string, string> = {};
  if (data?.error?.field) {
    apiFieldErrors[data.error.field] = errorMessage;
  }

  return {
    error: errorMessage,
    fieldErrors: Object.keys(apiFieldErrors).length > 0 ? apiFieldErrors : undefined,
  };
}

/**
 * Make an API request with retry logic
 */
export async function apiRequest(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  return fetchWithRetry(url, options);
}

