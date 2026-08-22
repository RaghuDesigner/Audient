"use client";

import * as React from "react";

import type { PlanComparisonCurrentPlan } from "@/config/plan-comparison";
import {
  authPlanTierToAppTier,
  resolveMockCredits,
  type MockAppCredits,
} from "@/data/mock-app-state";
import { useAuth } from "@/hooks/use-auth";
import { useAccountOptional } from "@/providers/account-provider";

/** Authenticated user's plan for upgrade modal / tier badges — guest stays guest. */
export function useUpgradeModalCurrentPlan(
  qaTierOverride?: PlanComparisonCurrentPlan | null,
): PlanComparisonCurrentPlan {
  const { user, isGuest } = useAuth();
  const accountCtx = useAccountOptional();
  const effectiveUser = accountCtx?.effectiveUser ?? user;

  return React.useMemo(() => {
    if (qaTierOverride) return qaTierOverride;
    if (isGuest || !effectiveUser) return "guest";
    return authPlanTierToAppTier(effectiveUser.planTier);
  }, [effectiveUser, isGuest, qaTierOverride]);
}

/**
 * Credits for UI — real DB via AccountProvider when available,
 * otherwise centralized mock facade.
 */
export function useMockMembershipCredits(): {
  credits: MockAppCredits | null;
  refresh: () => void;
} {
  const { user, isGuest } = useAuth();
  const accountCtx = useAccountOptional();
  const [revision, bumpRevision] = React.useReducer((n: number) => n + 1, 0);

  const credits = React.useMemo(() => {
    if (isGuest || !user) return null;
    void revision;
    if (accountCtx?.account) {
      return resolveMockCredits(user, undefined, accountCtx.account);
    }
    return resolveMockCredits(accountCtx?.effectiveUser ?? user);
  }, [accountCtx?.account, accountCtx?.effectiveUser, isGuest, revision, user]);

  const refresh = React.useCallback(() => {
    bumpRevision();
    accountCtx?.refresh();
  }, [accountCtx]);

  return { credits, refresh };
}

/** Remaining credits for authenticated headers; undefined for guests. */
export function useAuthenticatedHeaderCredits(): number | undefined {
  const { credits } = useMockMembershipCredits();
  return credits?.remaining;
}

/** Header / profile badge tier from the authenticated user — never Guest. */
export function useAuthenticatedHeaderTier():
  | "free"
  | "pro"
  | "business"
  | undefined {
  const { user, isGuest } = useAuth();
  const accountCtx = useAccountOptional();
  const effectiveUser = accountCtx?.effectiveUser ?? user;
  if (isGuest || !effectiveUser) return undefined;
  const tier = authPlanTierToAppTier(effectiveUser.planTier);
  return tier === "guest" ? undefined : tier;
}
