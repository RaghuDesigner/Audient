/**
 * Canonical buy-credit packs — PRICING.md / plans.ts TOP_UP_PACKS.
 * Single catalog for Manage Membership and mock fixtures.
 */

import type { BuyCreditsPack } from "@/config/buy-credits-card";
import { TOP_UP_PACKS } from "@/config/plans";

/** PRICING.md top-up packs (500 / 2k / 5k). */
export function getCanonicalBuyCreditsPacks(): BuyCreditsPack[] {
  return TOP_UP_PACKS.map((pack) => ({
    id: pack.id,
    credits: pack.credits,
    priceCents: pack.priceCents,
    label: `${pack.credits.toLocaleString()} credits`,
    popular: pack.id === "PACK_2000",
  }));
}

export const CANONICAL_BUY_CREDITS_PACKS = getCanonicalBuyCreditsPacks();
