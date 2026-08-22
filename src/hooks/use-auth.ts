"use client";

import { useAuthContext } from "@/providers/auth-provider";

/**
 * Client auth hook — session state, Google/Microsoft OAuth, email login,
 * logout, and manual token refresh. Must be used under `AuthProvider`.
 */
export function useAuth() {
  return useAuthContext();
}
