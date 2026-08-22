/**
 * Phase-1 mock Welcome Card props — COMPONENT-014.
 * Credits/plan match PRICING.md / plans.ts (Free 300).
 */

import type { WelcomeCardProps } from "@/components/dashboard/WelcomeCard";
import { PLANS } from "@/config/plans";
import { MOCK_USER_DISPLAY_NAME } from "@/lib/auth/mock-session";
import { MOCK_DEMO_CREDITS_USED } from "@/lib/auth/mock-membership";

export const MOCK_WELCOME_CARD_SUCCESS: WelcomeCardProps = {
  state: "success",
  displayName: MOCK_USER_DISPLAY_NAME,
  avatarUrl: null,
  tier: "free",
  membershipStatus: "active",
  creditsRemaining: PLANS.FREE.monthlyCredits - MOCK_DEMO_CREDITS_USED.FREE,
  monthlyLimit: PLANS.FREE.monthlyCredits,
  usageAmount: MOCK_DEMO_CREDITS_USED.FREE,
};

export const MOCK_WELCOME_CARD_EMPTY: WelcomeCardProps = {
  state: "empty",
  displayName: null,
  avatarUrl: null,
  tier: "free",
  membershipStatus: "active",
  creditsRemaining: PLANS.FREE.monthlyCredits,
  monthlyLimit: PLANS.FREE.monthlyCredits,
  usageAmount: 0,
};

export const MOCK_WELCOME_CARD_LOADING: WelcomeCardProps = {
  state: "loading",
  tier: "free",
};

export const MOCK_WELCOME_CARD_ERROR: WelcomeCardProps = {
  state: "error",
  tier: "free",
  errorMessage: "We couldn’t load your account summary. Please try again.",
};
