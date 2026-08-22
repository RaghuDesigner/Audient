/**
 * COMPONENT-033 — Current Plan Card constants.
 * Copy, UI states, subscription status — no UI / no Stripe.
 */

export const CURRENT_PLAN_CARD_UI_STATES = [
  "loading",
  "active",
  "expired",
  "cancelled",
  "error",
] as const;

export type CurrentPlanCardUiState =
  (typeof CURRENT_PLAN_CARD_UI_STATES)[number];

/** Subscription status badge — text labels required (not color-only). */
export const CURRENT_PLAN_CARD_STATUSES = [
  "active",
  "trial",
  "expired",
  "cancelled",
  "paused",
] as const;

export type CurrentPlanCardStatus =
  (typeof CURRENT_PLAN_CARD_STATUSES)[number];

export const CURRENT_PLAN_CARD_STATUS_LABELS: Record<
  CurrentPlanCardStatus,
  string
> = {
  active: "Active",
  trial: "Trial",
  expired: "Expired",
  cancelled: "Cancelled",
  paused: "Paused",
};

export const CURRENT_PLAN_CARD_PLANS = ["free", "pro", "business"] as const;

export type CurrentPlanCardPlan = (typeof CURRENT_PLAN_CARD_PLANS)[number];

export const CURRENT_PLAN_CARD_PLAN_LABELS: Record<
  CurrentPlanCardPlan,
  string
> = {
  free: "Free",
  pro: "Pro",
  business: "Business",
};

export const CURRENT_PLAN_CARD_BILLING_CYCLES = ["monthly", "yearly"] as const;

export type CurrentPlanCardBillingCycle =
  (typeof CURRENT_PLAN_CARD_BILLING_CYCLES)[number];

export const CURRENT_PLAN_CARD_BILLING_CYCLE_LABELS: Record<
  CurrentPlanCardBillingCycle,
  string
> = {
  monthly: "Monthly",
  yearly: "Yearly",
};

export const CURRENT_PLAN_CARD_VARIANTS = ["default", "compact"] as const;

export type CurrentPlanCardVariant =
  (typeof CURRENT_PLAN_CARD_VARIANTS)[number];

export const CURRENT_PLAN_CARD_COPY = {
  title: "Current plan",
  billingCycle: "Billing cycle",
  renewalDate: "Renews",
  periodEnd: "Access until",
  creditsRemaining: "Credits remaining",
  reportsUsed: "Reports this period",
  storageUsed: "Storage used",
  price: "Price",
  freeRenewalHint: "Credits refresh monthly · no billing date",
  upgrade: "Upgrade plan",
  upgradeToPro: "Upgrade to Pro",
  upgradeToBusiness: "Upgrade to Business",
  downgrade: "Downgrade plan",
  manageBilling: "Manage billing",
  buyCredits: "Buy credits",
  reactivate: "Reactivate plan",
  resubscribe: "Resubscribe",
  retry: "Retry",
  errorHeadline: "We couldn’t load your plan",
  errorDescription: "Please try again. Your membership was not changed.",
  cancelledDetail:
    "Your plan is cancelled. You keep access until the period end date below.",
  expiredDetail:
    "Your plan has lapsed. Resubscribe to restore Pro or Business features.",
  trialDetail: "You’re on a trial. Upgrade before it ends to keep full access.",
  billingSoon: "Billing portal coming soon.",
  creditsSoon: "Credit top-ups coming soon.",
  checkoutSoon: "Checkout is mocked — no charge this phase.",
} as const;

export const CURRENT_PLAN_CARD_ANALYTICS_SOURCES = {
  card: "current_plan_card",
  upgrade: "current_plan_upgrade",
  downgrade: "current_plan_downgrade",
  billing: "current_plan_billing",
  buyCredits: "current_plan_buy_credits",
  retry: "current_plan_retry",
} as const;
