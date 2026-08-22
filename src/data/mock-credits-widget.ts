/**
 * Phase-1 mock Credits Widget — COMPONENT-017.
 * Values align with PRICING.md / plans.ts (Free 300 · Pro 1,000).
 */

import type { CreditsWidgetProps } from "@/components/dashboard/CreditsWidget";
import { PLANS } from "@/config/plans";
import { MOCK_DEMO_CREDITS_USED } from "@/lib/auth/mock-membership";

export const MOCK_CREDITS_WIDGET_SUCCESS: CreditsWidgetProps = {
  state: "success",
  remaining: PLANS.FREE.monthlyCredits - MOCK_DEMO_CREDITS_USED.FREE,
  monthlyCredits: PLANS.FREE.monthlyCredits,
  used: MOCK_DEMO_CREDITS_USED.FREE,
  renewalDate: "2026-09-01T00:00:00.000Z",
  tier: "free",
};

export const MOCK_CREDITS_WIDGET_WARNING: CreditsWidgetProps = {
  state: "warning",
  remaining: 40,
  monthlyCredits: PLANS.FREE.monthlyCredits,
  used: 260,
  renewalDate: "2026-09-01T00:00:00.000Z",
  tier: "free",
};

export const MOCK_CREDITS_WIDGET_EXHAUSTED: CreditsWidgetProps = {
  state: "exhausted",
  remaining: 0,
  monthlyCredits: PLANS.FREE.monthlyCredits,
  used: 300,
  renewalDate: "2026-09-01T00:00:00.000Z",
  tier: "free",
};

export const MOCK_CREDITS_WIDGET_LOADING: CreditsWidgetProps = {
  state: "loading",
  tier: "free",
};

export const MOCK_CREDITS_WIDGET_PRO: CreditsWidgetProps = {
  state: "warning",
  remaining: 120,
  monthlyCredits: PLANS.PRO.monthlyCredits,
  used: 880,
  renewalDate: "2026-08-15T00:00:00.000Z",
  tier: "pro",
};
