/**
 * Mock membership grant after payment success (frontend demos only).
 * Client sessionStorage — not Stripe / not webhook / not production entitlements.
 */

import type {
  PaymentSuccessCycle,
  PaymentSuccessPlan,
} from "@/config/payment-success";
import { PLANS, type PlanTier } from "@/config/plans";
import {
  persistMockSession,
  readMockSession,
} from "@/lib/auth/mock-session";
import type { AuthPlanTier, AuthUser } from "@/types/auth";
import {
  paymentSuccessCreditsIncluded,
  paymentSuccessPlanToAuth,
  paymentSuccessRenewalDate,
} from "@/utils/payment-success";

export const MOCK_MEMBERSHIP_STORAGE_KEY = "audient_mock_membership";

export type MockMembershipSnapshot = {
  planTier: AuthPlanTier;
  /** Post-purchase mock balance (plan monthly grant). */
  creditsRemaining: number;
  monthlyGrant: number;
  cycle: PaymentSuccessCycle;
  renewalDateIso: string;
  paymentReference: string | null;
  intentId: string | null;
  updatedAtIso: string;
};

export type ApplyMockPurchaseInput = {
  plan: PaymentSuccessPlan;
  cycle?: PaymentSuccessCycle;
  intentId?: string | null;
  paymentReference?: string | null;
  /** Test / storybook clock. */
  from?: Date;
};

export type ApplyMockPurchaseResult =
  | {
      ok: true;
      applied: boolean;
      user: AuthUser;
      membership: MockMembershipSnapshot;
    }
  | {
      ok: false;
      reason: "no_session" | "unavailable";
      user: null;
      membership: MockMembershipSnapshot | null;
    };

export function authTierFromPaymentPlan(
  plan: PaymentSuccessPlan,
): AuthPlanTier {
  return paymentSuccessPlanToAuth(plan) as AuthPlanTier;
}

export function mockMonthlyGrantForTier(tier: PlanTier | AuthPlanTier): number {
  return PLANS[tier].monthlyCredits;
}

/**
 * Mock rule: after paid plan purchase, available credits = plan grant
 * (not add-on on Free leftover). Pro → Business also sets Business grant.
 */
export function mockCreditsAfterPurchase(plan: PaymentSuccessPlan): number {
  return paymentSuccessCreditsIncluded(plan);
}

export function readMockMembership(): MockMembershipSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(MOCK_MEMBERSHIP_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MockMembershipSnapshot;
    if (!parsed?.planTier || typeof parsed.creditsRemaining !== "number") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function persistMockMembership(
  snapshot: MockMembershipSnapshot,
): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(
    MOCK_MEMBERSHIP_STORAGE_KEY,
    JSON.stringify(snapshot),
  );
}

export function clearMockMembership(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(MOCK_MEMBERSHIP_STORAGE_KEY);
}

/**
 * Demo credits consumed this cycle when no purchase snapshot exists.
 * Remaining = plan monthlyCredits − these values (Free 300−60=240).
 */
export const MOCK_DEMO_CREDITS_USED: Record<PlanTier, number> = {
  FREE: 60,
  PRO: 360,
  ENTERPRISE: 1800,
};

/** Credits remaining — membership snapshot first, else plan grant minus demo usage. */
export function resolveMockCreditsRemaining(
  user: AuthUser | null | undefined,
): number | null {
  const snap = readMockMembership();
  if (snap) return snap.creditsRemaining;
  if (!user) return null;
  const monthly = mockMonthlyGrantForTier(user.planTier);
  return Math.max(0, monthly - MOCK_DEMO_CREDITS_USED[user.planTier]);
}

export type ApplyMockCreditTopUpResult =
  | { ok: true; membership: MockMembershipSnapshot }
  | { ok: false; reason: "no_session" | "unavailable" };

/** Mock credit top-up — updates membership snapshot (frontend demos only). */
export function applyMockCreditTopUp(input: {
  creditsToAdd: number;
}): ApplyMockCreditTopUpResult {
  if (typeof window === "undefined") {
    return { ok: false, reason: "unavailable" };
  }

  const user = readMockSession();
  if (!user) {
    return { ok: false, reason: "no_session" };
  }

  const snap = readMockMembership();
  const monthlyGrant = snap?.monthlyGrant ?? mockMonthlyGrantForTier(user.planTier);
  const baseRemaining =
    snap?.creditsRemaining ??
    Math.max(0, monthlyGrant - MOCK_DEMO_CREDITS_USED[user.planTier]);

  const membership: MockMembershipSnapshot = {
    planTier: user.planTier,
    creditsRemaining: baseRemaining + input.creditsToAdd,
    monthlyGrant,
    cycle: snap?.cycle ?? "monthly",
    renewalDateIso: snap?.renewalDateIso ?? new Date().toISOString(),
    paymentReference: snap?.paymentReference ?? null,
    intentId: snap?.intentId ?? null,
    updatedAtIso: new Date().toISOString(),
  };

  persistMockMembership(membership);
  return { ok: true, membership };
}

/**
 * Apply purchased plan to mock session + membership snapshot.
 * Idempotent for the same `intentId` (double mount / Strict Mode safe).
 * Callers should `refreshSession()` so React auth state re-reads sessionStorage.
 */
export function applyMockPurchase(
  input: ApplyMockPurchaseInput,
): ApplyMockPurchaseResult {
  if (typeof window === "undefined") {
    return {
      ok: false,
      reason: "unavailable",
      user: null,
      membership: null,
    };
  }

  const user = readMockSession();
  if (!user) {
    return {
      ok: false,
      reason: "no_session",
      user: null,
      membership: null,
    };
  }

  const cycle = input.cycle ?? "monthly";
  const intentId = input.intentId?.trim() || null;
  const planTier = authTierFromPaymentPlan(input.plan);
  const creditsRemaining = mockCreditsAfterPurchase(input.plan);
  const monthlyGrant = mockMonthlyGrantForTier(planTier);
  const renewal = paymentSuccessRenewalDate(cycle, input.from);

  const existing = readMockMembership();
  if (
    intentId &&
    existing?.intentId === intentId &&
    existing.planTier === planTier
  ) {
    const syncedUser =
      user.planTier === planTier
        ? user
        : { ...user, planTier };
    if (syncedUser !== user) {
      persistMockSession(syncedUser);
    }
    return {
      ok: true,
      applied: false,
      user: syncedUser,
      membership: existing,
    };
  }

  const membership: MockMembershipSnapshot = {
    planTier,
    creditsRemaining,
    monthlyGrant,
    cycle,
    renewalDateIso: renewal.toISOString(),
    paymentReference: input.paymentReference ?? null,
    intentId,
    updatedAtIso: (input.from ?? new Date()).toISOString(),
  };

  const nextUser: AuthUser = {
    ...user,
    planTier,
  };

  persistMockSession(nextUser);
  persistMockMembership(membership);

  return {
    ok: true,
    applied: true,
    user: nextUser,
    membership,
  };
}
