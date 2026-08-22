/**
 * COMPONENT-038 — Buy Credits Card constants.
 * Copy, states, Figma pack ids — no UI / no Stripe.
 * Catalog: PRICING.md TOP_UP_PACKS via getCanonicalBuyCreditsPacks().
 */

export const BUY_CREDITS_CARD_STATES = [
  "loading",
  "available",
  "out_of_stock",
  "error",
] as const;

export type BuyCreditsCardState = (typeof BUY_CREDITS_CARD_STATES)[number];

/** Entitled tiers only — Free/Guest never purchase. */
export const BUY_CREDITS_CARD_TIERS = ["pro", "business"] as const;

export type BuyCreditsCardTier = (typeof BUY_CREDITS_CARD_TIERS)[number];

export const BUY_CREDITS_CARD_VARIANTS = ["default", "compact"] as const;

export type BuyCreditsCardVariant =
  (typeof BUY_CREDITS_CARD_VARIANTS)[number];

export type BuyCreditsPack = {
  id: string;
  credits: number;
  /** Price in cents for display — mock until Stripe catalog matches Figma. */
  priceCents: number;
  label: string;
  popular?: boolean;
  comingSoon?: boolean;
};

export const BUY_CREDITS_CARD_COPY = {
  title: "Buy credits",
  creditsRemaining: "Credits remaining",
  selectPack: "Choose a credit pack",
  price: "Price",
  benefits: "What’s included",
  buy: "Buy credits",
  buyNamed: "Buy {credits} credits",
  mostPopular: "Most popular",
  comingSoon: "Coming soon",
  outOfStock: "These packs aren’t available right now.",
  retry: "Retry",
  errorHeadline: "We couldn’t load credit packs",
  errorDescription: "Please try again. You were not charged.",
  purchaseSuccess: "Mock purchase complete — no charge this phase.",
  purchaseError: "Mock purchase failed. Try again.",
  purchasing: "Purchasing…",
  upgradeInstead: "Upgrade to Pro to buy credit top-ups.",
  freeBlocked: "Free plans can’t buy credits.",
} as const;

export const BUY_CREDITS_CARD_DEFAULT_BENEFITS = [
  "Purchased credits roll over across billing periods",
  "Use for screenshot and URL audits (per plan costs)",
  "Checkout is mocked — no Stripe charge this phase",
] as const;

export const BUY_CREDITS_CARD_ANALYTICS_SOURCES = {
  card: "buy_credits_card",
  manageMembership: "buy_credits_manage_membership",
  usageWidget: "buy_credits_usage_widget",
} as const;
