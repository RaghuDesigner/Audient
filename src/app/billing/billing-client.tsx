"use client";

import * as React from "react";

import { AuthSessionFallback } from "@/components/auth/AuthSessionFallback";
import { ManageMembershipScreen } from "@/components/billing/ManageMembershipScreen";
import {
  MANAGE_MEMBERSHIP_COPY,
  MANAGE_MEMBERSHIP_ROUTE,
  type ManageMembershipPlan,
  type ManageMembershipState,
} from "@/config/manage-membership";
import {
  MOCK_MANAGE_MEMBERSHIP_CANCELLED,
  MOCK_MANAGE_MEMBERSHIP_ERROR,
  MOCK_MANAGE_MEMBERSHIP_EXPIRED,
  type MockManageMembership,
} from "@/data/mock-manage-membership";
import {
  buildMockManageMembership,
  getMockAppState,
} from "@/data/mock-app-state";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useAccount } from "@/providers/account-provider";
import type { AuthUser } from "@/types/auth";
import type { AccountSnapshot } from "@/types/account";

export type BillingClientProps = {
  tierOverride?: ManageMembershipPlan | null;
  stateOverride?: ManageMembershipState | null;
};

function resolveBillingData(
  user: AuthUser,
  tierOverride: ManageMembershipPlan | null,
  stateOverride: ManageMembershipState | null,
  account: AccountSnapshot | null,
): MockManageMembership {
  const appState = getMockAppState(user, {
    tierOverride: tierOverride ?? undefined,
    account: tierOverride ? null : account,
  });
  const resolvedPlan =
    tierOverride ??
    (appState.user.planTier === "guest" ? "free" : appState.user.planTier);
  const plan = resolvedPlan as ManageMembershipPlan;

  if (stateOverride === "cancelled") {
    return {
      ...MOCK_MANAGE_MEMBERSHIP_CANCELLED,
      ...buildMockManageMembership(appState, {
        plan: plan === "free" ? "pro" : plan,
        state: "cancelled",
        status: "cancelled",
      }),
    };
  }

  if (stateOverride === "expired") {
    return {
      ...MOCK_MANAGE_MEMBERSHIP_EXPIRED,
      ...buildMockManageMembership(appState, {
        plan: plan === "free" ? "pro" : plan,
        state: "expired",
        status: "expired",
        usage: {
          ...buildMockManageMembership(appState).usage,
          creditsRemaining: 0,
          creditsUsed: appState.credits.monthlyAllocation,
        },
      }),
    };
  }

  if (stateOverride === "loading") {
    return buildMockManageMembership(appState, { state: "loading" });
  }

  if (stateOverride === "error") {
    return buildMockManageMembership(appState, {
      state: "error",
      statusDetail: MOCK_MANAGE_MEMBERSHIP_ERROR.statusDetail,
    });
  }

  return buildMockManageMembership(appState);
}

/**
 * SCREEN-011 client shell — real membership when account hydrated; QA overrides kept.
 */
export function BillingClient({
  tierOverride = null,
  stateOverride = null,
}: BillingClientProps) {
  const { user, isReady } = useRequireAuth({
    redirectTo: MANAGE_MEMBERSHIP_ROUTE,
    intentType: "subscribe",
  });
  const { account, effectiveUser, isLoading: accountLoading, refresh } =
    useAccount();
  const [data, setData] = React.useState<MockManageMembership | null>(null);

  React.useEffect(() => {
    if (!isReady || !user) return;
    if (accountLoading && !account && !tierOverride) return;
    setData(
      resolveBillingData(
        effectiveUser ?? user,
        tierOverride,
        stateOverride,
        account,
      ),
    );
  }, [
    account,
    accountLoading,
    effectiveUser,
    isReady,
    stateOverride,
    tierOverride,
    user,
  ]);

  if (!isReady || !user || !data) {
    return (
      <AuthSessionFallback message={MANAGE_MEMBERSHIP_COPY.guestRedirect} />
    );
  }

  return (
    <ManageMembershipScreen
      data={data}
      onRetry={() => {
        refresh();
        setData(
          resolveBillingData(
            effectiveUser ?? user,
            tierOverride,
            null,
            account,
          ),
        );
      }}
    />
  );
}
