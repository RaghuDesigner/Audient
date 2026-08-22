/**
 * COMPONENT-034 — Usage Widget constants.
 * Copy, UI states, tiers — no UI / no Stripe.
 * Near-limit threshold aligns with Credits Widget (`CREDITS_WARNING_RATIO`).
 */

export const USAGE_WIDGET_STATES = [
  "normal",
  "near_limit",
  "limit_reached",
  "loading",
  "error",
] as const;

export type UsageWidgetState = (typeof USAGE_WIDGET_STATES)[number];

export const USAGE_WIDGET_STATE_LABELS: Record<
  Exclude<UsageWidgetState, "loading" | "error">,
  string
> = {
  normal: "On track",
  near_limit: "Credits running low",
  limit_reached: "Credits exhausted",
};

export const USAGE_WIDGET_TIERS = ["free", "pro", "business"] as const;

export type UsageWidgetTier = (typeof USAGE_WIDGET_TIERS)[number];

export const USAGE_WIDGET_TIER_LABELS: Record<UsageWidgetTier, string> = {
  free: "Free",
  pro: "Pro",
  business: "Business",
};

export const USAGE_WIDGET_VARIANTS = ["default", "compact"] as const;

export type UsageWidgetVariant = (typeof USAGE_WIDGET_VARIANTS)[number];

export const USAGE_WIDGET_COPY = {
  title: "Usage & credits",
  creditsUsed: "Credits used",
  creditsRemaining: "Credits remaining",
  reportsGenerated: "Reports generated",
  storageUsed: "Storage used",
  billingCycle: "Billing cycle",
  apiCalls: "API calls",
  apiCallsComingSoon: "Coming soon",
  progressCredits: "Credit usage",
  progressStorage: "Storage usage",
  buyCredits: "Buy credits",
  upgrade: "Upgrade",
  retry: "Retry",
  errorHeadline: "We couldn’t load usage",
  errorDescription: "Please try again. Your credits were not changed.",
  ofGrant: "of monthly grant",
  renews: "Renews",
} as const;

export const USAGE_WIDGET_ANALYTICS_SOURCES = {
  widget: "usage_widget",
  buyCredits: "usage_widget_buy_credits",
  upgrade: "usage_widget_upgrade",
  retry: "usage_widget_retry",
} as const;
