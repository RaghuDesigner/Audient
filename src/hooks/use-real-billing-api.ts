"use client";

import { useAuth } from "@/hooks/use-auth";
import { isMockAuthUserId } from "@/lib/account/is-mock-auth-user";

/**
 * Real Stripe billing path: authenticated Supabase user (not mock-*).
 * Mock GO / mock-* sessions keep mock checkout + applyMockPurchase.
 */
export function useRealBillingApi(): boolean {
  const { user, isGuest, isLoading } = useAuth();
  if (isLoading || isGuest || !user) return false;
  return !isMockAuthUserId(user.id);
}
