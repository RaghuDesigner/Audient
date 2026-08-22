/**
 * COMPONENT-038 — Buy Credits Card helpers.
 * Entitlement, pack selection, labels — no React / no Stripe.
 */

import {
  BUY_CREDITS_CARD_COPY,
  BUY_CREDITS_CARD_TIERS,
  type BuyCreditsCardTier,
  type BuyCreditsPack,
} from "@/config/buy-credits-card";
import { formatPrice } from "@/config/plans";

export function canBuyCreditsCard(
  tier: string | null | undefined,
): tier is BuyCreditsCardTier {
  return (
    tier === "pro" ||
    tier === "business" ||
    (BUY_CREDITS_CARD_TIERS as readonly string[]).includes(String(tier))
  );
}

export function buyCreditsPackPriceLabel(priceCents: number): string {
  return formatPrice(priceCents);
}

export function buyCreditsCtaLabel(
  pack: BuyCreditsPack | null | undefined,
): string {
  if (!pack) return BUY_CREDITS_CARD_COPY.buy;
  return BUY_CREDITS_CARD_COPY.buyNamed.replace(
    "{credits}",
    pack.credits.toLocaleString(),
  );
}

/** Prefer popular pack; else first purchasable (not comingSoon). */
export function defaultBuyCreditsPackId(
  packs: readonly BuyCreditsPack[],
): string | null {
  const purchasable = packs.filter((p) => !p.comingSoon);
  if (purchasable.length === 0) return null;
  const popular = purchasable.find((p) => p.popular);
  return popular?.id ?? purchasable[0]?.id ?? null;
}

export function findBuyCreditsPack(
  packs: readonly BuyCreditsPack[],
  packId: string | null | undefined,
): BuyCreditsPack | null {
  if (!packId) return null;
  return packs.find((p) => p.id === packId) ?? null;
}

export function isBuyCreditsPackSelectable(pack: BuyCreditsPack): boolean {
  return !pack.comingSoon;
}

export function shouldEnableBuyCreditsCta(input: {
  selectedPack: BuyCreditsPack | null;
  purchasing?: boolean;
  state: "loading" | "available" | "out_of_stock" | "error";
}): boolean {
  if (input.state !== "available") return false;
  if (input.purchasing) return false;
  if (!input.selectedPack) return false;
  return isBuyCreditsPackSelectable(input.selectedPack);
}
