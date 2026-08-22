/**
 * Authenticated account snapshot — BACKEND-004.
 * Loaded from public.users / memberships / plans / credits.
 */

import type { AuthPlanTier } from "@/types/auth";

export type AccountMembershipStatus =
  | "active"
  | "cancelled"
  | "expired"
  | "past_due"
  | "trialing";

export type AccountPlanLimits = {
  monthlyCredits: number;
  screenshotCost: number;
  urlCost: number | null;
  urlAuditsEnabled: boolean;
  pdfEnabled: boolean;
  topUpsEnabled: boolean;
  isUnlimited: boolean;
};

export type AccountCredits = {
  remaining: number;
  planCredits: number;
  purchasedCredits: number;
  monthlyAllocation: number;
  used: number;
  topUpAvailable: boolean;
};

export type AccountSnapshot = {
  appUserId: string;
  authProviderId: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  planTier: AuthPlanTier;
  planDisplayName: string;
  membershipStatus: AccountMembershipStatus;
  billingInterval: "MONTHLY" | "YEARLY";
  currentPeriodEnd: string | null;
  planId: string | null;
  limits: AccountPlanLimits;
  credits: AccountCredits;
  features: readonly string[];
};

export type AccountMeResponse = {
  account: AccountSnapshot;
};
