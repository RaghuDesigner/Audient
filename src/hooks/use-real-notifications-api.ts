"use client";

import { useAuth } from "@/hooks/use-auth";
import { isMockAuthUserId } from "@/lib/account/is-mock-auth-user";

/**
 * Real notification API path: authenticated Supabase user (not mock-*).
 */
export function useRealNotificationsApi(): boolean {
  const { user, isGuest, isLoading } = useAuth();
  if (isLoading || isGuest || !user) return false;
  return !isMockAuthUserId(user.id);
}
