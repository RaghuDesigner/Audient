"use client";

import { useAuth } from "@/hooks/use-auth";
import { isMockAuthUserId } from "@/lib/account/is-mock-auth-user";

/**
 * True when the session is a real Supabase user (not mock-* auth).
 * Mock GO path stays available for development.
 */
export function useRealAuditApi(): boolean {
  const { user, isGuest, isLoading } = useAuth();
  if (isLoading || isGuest || !user) return false;
  return !isMockAuthUserId(user.id);
}
