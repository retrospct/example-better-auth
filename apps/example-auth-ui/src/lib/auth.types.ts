/**
 * Error response structure from server actions
 */
export type AuthActionResult =
  | { success: true }
  | { success: false; error: string; fieldErrors?: Record<string, string> };

