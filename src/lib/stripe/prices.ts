import "server-only";

import type { PlanTier, TopUpPackId } from "@/config/plans";
import { PLANS, TOP_UP_PACKS } from "@/config/plans";

/**
 * Explicit Stripe Price ID mapping from env — never trust client Price IDs.
 * Create Prices in Stripe Dashboard (test mode) matching PRICING.md amounts.
 */

export type StripeSubscriptionProduct = Extract<PlanTier, "PRO" | "ENTERPRISE">;

const SUBSCRIPTION_ENV: Record<StripeSubscriptionProduct, string> = {
  PRO: "STRIPE_PRICE_PRO_MONTHLY",
  ENTERPRISE: "STRIPE_PRICE_BUSINESS_MONTHLY",
};

const PACK_ENV: Record<TopUpPackId, string> = {
  PACK_500: "STRIPE_PRICE_PACK_500",
  PACK_2000: "STRIPE_PRICE_PACK_2000",
  PACK_5000: "STRIPE_PRICE_PACK_5000",
};

/** Env vars required for production billing (values are Stripe Price IDs, not secrets). */
export const STRIPE_PRICE_ENV_NAMES = [
  SUBSCRIPTION_ENV.PRO,
  SUBSCRIPTION_ENV.ENTERPRISE,
  PACK_ENV.PACK_500,
  PACK_ENV.PACK_2000,
  PACK_ENV.PACK_5000,
] as const;

function readPriceId(envName: string): string | null {
  const value = process.env[envName]?.trim() ?? "";
  if (!value || value.includes("your-") || value.startsWith("price_xxx")) {
    return null;
  }
  return value;
}

export function resolveSubscriptionPriceId(
  tier: StripeSubscriptionProduct,
): string | null {
  return readPriceId(SUBSCRIPTION_ENV[tier]);
}

export function resolveTopUpPriceId(packId: TopUpPackId): string | null {
  return readPriceId(PACK_ENV[packId]);
}

export function missingStripePriceEnvVars(): string[] {
  return STRIPE_PRICE_ENV_NAMES.filter((envName) => !readPriceId(envName));
}

export function assertKnownSubscriptionTier(
  raw: string,
): StripeSubscriptionProduct | null {
  const key = raw.toUpperCase();
  if (key === "PRO" || key === "ENTERPRISE" || key === "BUSINESS") {
    return key === "BUSINESS" ? "ENTERPRISE" : (key as StripeSubscriptionProduct);
  }
  return null;
}

export function assertKnownTopUpPack(raw: string): TopUpPackId | null {
  const pack = TOP_UP_PACKS.find((p) => p.id === raw);
  return pack?.id ?? null;
}

export function expectedAmountCentsForSubscription(
  tier: StripeSubscriptionProduct,
): number {
  return PLANS[tier].priceMonthlyCents;
}

export function expectedCreditsForSubscription(
  tier: StripeSubscriptionProduct,
): number {
  return PLANS[tier].monthlyCredits;
}

export function expectedAmountCentsForPack(packId: TopUpPackId): number {
  const pack = TOP_UP_PACKS.find((p) => p.id === packId);
  return pack?.priceCents ?? 0;
}

export function expectedCreditsForPack(packId: TopUpPackId): number {
  const pack = TOP_UP_PACKS.find((p) => p.id === packId);
  return pack?.credits ?? 0;
}

export function uiPlanToTier(
  plan: "pro" | "business",
): StripeSubscriptionProduct {
  return plan === "business" ? "ENTERPRISE" : "PRO";
}
