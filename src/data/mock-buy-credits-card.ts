/**
 * Phase-1 mock Buy Credits Card — COMPONENT-038.
 * Packs from PRICING.md / plans.ts TOP_UP_PACKS — no Stripe / no API.
 */

import type {
  BuyCreditsCardState,
  BuyCreditsCardTier,
  BuyCreditsPack,
} from "@/config/buy-credits-card";
import { MOCK_DEMO_CREDITS_USED, mockMonthlyGrantForTier } from "@/lib/auth/mock-membership";
import {
  CANONICAL_BUY_CREDITS_PACKS,
  getCanonicalBuyCreditsPacks,
} from "@/utils/buy-credits-packs";
import { defaultBuyCreditsPackId } from "@/utils/buy-credits-card";

export { CANONICAL_BUY_CREDITS_PACKS as MOCK_BUY_CREDITS_PACKS };

export type MockBuyCreditsCard = {
  state: BuyCreditsCardState;
  tier: BuyCreditsCardTier;
  creditsRemaining: number;
  packs: BuyCreditsPack[];
  selectedPackId: string | null;
};

export const MOCK_BUY_CREDITS_PRO: MockBuyCreditsCard = {
  state: "available",
  tier: "pro",
  creditsRemaining:
    mockMonthlyGrantForTier("PRO") - MOCK_DEMO_CREDITS_USED.PRO,
  packs: CANONICAL_BUY_CREDITS_PACKS,
  selectedPackId: defaultBuyCreditsPackId(CANONICAL_BUY_CREDITS_PACKS),
};

export const MOCK_BUY_CREDITS_BUSINESS: MockBuyCreditsCard = {
  state: "available",
  tier: "business",
  creditsRemaining:
    mockMonthlyGrantForTier("ENTERPRISE") - MOCK_DEMO_CREDITS_USED.ENTERPRISE,
  packs: CANONICAL_BUY_CREDITS_PACKS,
  selectedPackId: defaultBuyCreditsPackId(CANONICAL_BUY_CREDITS_PACKS),
};

export const MOCK_BUY_CREDITS_LOADING: MockBuyCreditsCard = {
  ...MOCK_BUY_CREDITS_PRO,
  state: "loading",
};

export const MOCK_BUY_CREDITS_ERROR: MockBuyCreditsCard = {
  ...MOCK_BUY_CREDITS_PRO,
  state: "error",
};

export const MOCK_BUY_CREDITS_OUT_OF_STOCK: MockBuyCreditsCard = {
  ...MOCK_BUY_CREDITS_PRO,
  state: "out_of_stock",
};

export const MOCK_BUY_CREDITS_BY_TIER: Record<
  BuyCreditsCardTier,
  MockBuyCreditsCard
> = {
  pro: MOCK_BUY_CREDITS_PRO,
  business: MOCK_BUY_CREDITS_BUSINESS,
};

export function getMockBuyCreditsCard(
  tier: BuyCreditsCardTier = "pro",
  overrides?: Partial<MockBuyCreditsCard>,
): MockBuyCreditsCard {
  const base = MOCK_BUY_CREDITS_BY_TIER[tier];
  const packs = overrides?.packs ?? getCanonicalBuyCreditsPacks();
  return {
    ...base,
    ...overrides,
    tier: overrides?.tier ?? tier,
    packs,
    selectedPackId:
      overrides?.selectedPackId !== undefined
        ? overrides.selectedPackId
        : defaultBuyCreditsPackId(packs),
  };
}
