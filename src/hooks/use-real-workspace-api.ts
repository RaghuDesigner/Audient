"use client";

import { useAuth } from "@/hooks/use-auth";
import { isMockAuthUserId } from "@/lib/account/is-mock-auth-user";

/**
 * Real workspace API path: authenticated Supabase user (not mock-*).
 * Mock GO / mock-* sessions keep mock Business workspace data.
 */
export function useRealWorkspaceApi(): boolean {
  const { user, isGuest, isLoading } = useAuth();
  if (isLoading || isGuest || !user) return false;
  return !isMockAuthUserId(user.id);
}
