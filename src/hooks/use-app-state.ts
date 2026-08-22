"use client";

import * as React from "react";

import {
  getMockAppState,
  type GetMockAppStateOptions,
  type MockAppPlanTier,
  type MockAppState,
} from "@/data/mock-app-state";
import { useAuth } from "@/hooks/use-auth";
import { useAccountOptional } from "@/providers/account-provider";
import type { AccountSnapshot } from "@/types/account";
import type { AuthUser } from "@/types/auth";

export type UseAppStateResult = {
  appState: MockAppState;
  /** Auth user with membership tier overlay when account loaded. */
  effectiveUser: AuthUser | null;
  account: AccountSnapshot | null;
  isGuest: boolean;
  /** True while auth or real-account fetch is in flight. */
  isLoading: boolean;
};

/**
 * Central app state for BACKEND-004.
 * Real Supabase users: overlays `/api/me` account onto getMockAppState.
 * Mock users: unchanged mock facade.
 */
export function useAppState(
  options?: Omit<GetMockAppStateOptions, "account">,
): UseAppStateResult {
  const { user, isGuest, isLoading: authLoading } = useAuth();
  const accountCtx = useAccountOptional();
  const account = accountCtx?.account ?? null;
  const effectiveUser = accountCtx?.effectiveUser ?? user;
  const accountLoading = accountCtx?.isLoading ?? false;

  const tierOverride = options?.tierOverride;
  const auditState = options?.auditState;
  const auditEmpty = options?.auditEmpty;
  const notificationState = options?.notificationState;
  const notificationEmpty = options?.notificationEmpty;

  const appState = React.useMemo(() => {
    const opts: GetMockAppStateOptions = {
      tierOverride,
      auditState,
      auditEmpty,
      notificationState,
      notificationEmpty,
      // QA tierOverride wins over DB account when intentionally set
      account: tierOverride != null ? null : account,
    };
    if (isGuest || !effectiveUser) {
      return getMockAppState(null, opts);
    }
    return getMockAppState(effectiveUser, opts);
  }, [
    account,
    auditEmpty,
    auditState,
    effectiveUser,
    isGuest,
    notificationEmpty,
    notificationState,
    tierOverride,
  ]);

  return {
    appState,
    effectiveUser: isGuest ? null : effectiveUser,
    account,
    isGuest,
    isLoading: authLoading || (!isGuest && accountLoading && !account),
  };
}

/** Header tier from centralized account/app state. */
export function useHeaderPlanTier(): "free" | "pro" | "business" {
  const { appState, isGuest } = useAppState();
  if (isGuest) return "free";
  const tier: MockAppPlanTier = appState.user.planTier;
  if (tier === "business") return "business";
  if (tier === "pro") return "pro";
  return "free";
}

/** Header credits from centralized account/app state. */
export function useHeaderCredits(): number {
  const { appState, isGuest } = useAppState();
  if (isGuest) return 0;
  return appState.credits.remaining;
}
