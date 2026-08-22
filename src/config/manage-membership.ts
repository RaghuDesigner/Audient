/**
 * SCREEN-011 / SCREEN-005 — Manage Membership constants.
 * Copy, states, sources — no UI / no Stripe.
 */

export const MANAGE_MEMBERSHIP_ROUTE = "/billing";

export const MANAGE_MEMBERSHIP_STATES = [
  "loading",
  "success",
  "error",
  "cancelled",
  "expired",
] as const;

export type ManageMembershipState =
  (typeof MANAGE_MEMBERSHIP_STATES)[number];

/** Occupant plans — Guest never lands here without Login. */
export const MANAGE_MEMBERSHIP_PLANS = ["free", "pro", "business"] as const;

export type ManageMembershipPlan =
  (typeof MANAGE_MEMBERSHIP_PLANS)[number];

export const MANAGE_MEMBERSHIP_PLAN_LABELS: Record<
  ManageMembershipPlan,
  string
> = {
  free: "Free",
  pro: "Pro",
  business: "Business",
};

export const MANAGE_MEMBERSHIP_BILLING_CYCLES = ["monthly", "yearly"] as const;

export type ManageMembershipBillingCycle =
  (typeof MANAGE_MEMBERSHIP_BILLING_CYCLES)[number];

export const MANAGE_MEMBERSHIP_BILLING_CYCLE_LABELS: Record<
  ManageMembershipBillingCycle,
  string
> = {
  monthly: "Monthly",
  yearly: "Yearly",
};

export const MANAGE_MEMBERSHIP_STATUS = [
  "active",
  "cancelled",
  "expired",
  "past_due",
] as const;

export type ManageMembershipStatus =
  (typeof MANAGE_MEMBERSHIP_STATUS)[number];

export const MANAGE_MEMBERSHIP_STATUS_LABELS: Record<
  ManageMembershipStatus,
  string
> = {
  active: "Active",
  cancelled: "Cancelled",
  expired: "Expired",
  past_due: "Past due",
};

export const MANAGE_MEMBERSHIP_COPY = {
  title: "Manage membership",
  subtitle:
    "Review your plan, credits, and billing. Upgrade anytime — checkout is mocked this phase.",
  currentPlan: "Current plan",
  usageCredits: "Usage & credits",
  planComparison: "Compare plans",
  billingSummary: "Billing summary",
  upgradeCtaBand: "Ready to level up?",
  faq: "Membership FAQ",
  creditsRemaining: "Credits remaining",
  creditsUsed: "Credits used this period",
  reportsGenerated: "Reports generated",
  storageUsed: "Storage used",
  renewalDate: "Renews",
  periodEnd: "Access until",
  billingCycle: "Billing cycle",
  status: "Status",
  paymentMethod: "Payment method",
  nextBillingDate: "Next billing date",
  subscriptionCost: "Subscription",
  invoiceHistory: "Invoice history",
  manageBilling: "Manage billing",
  buyCredits: "Buy credits",
  upgrade: "Upgrade",
  upgradeToPro: "Upgrade to Pro",
  upgradeToBusiness: "Upgrade to Business",
  contactSales: "Contact sales",
  downgrade: "Switch to Free",
  reactivate: "Reactivate plan",
  resubscribe: "Resubscribe",
  currentPlanCta: "Current plan",
  addPaymentMethod: "Add payment method",
  billingPortalSoon: "Billing portal coming soon.",
  invoicesSoon: "Invoice history coming soon.",
  creditsTopUpSoon: "Credit top-ups coming soon.",
  checkoutSoon: "Checkout is mocked — no charge this phase.",
  errorHeadline: "We couldn’t load membership",
  errorDescription: "Please try again. Your plan was not changed.",
  retry: "Retry",
  cancelledDetail:
    "Your plan is cancelled. You keep access until the period end date below.",
  expiredDetail:
    "Your plan has lapsed. Upgrade or resubscribe to restore Pro or Business features.",
  guestRedirect: "Sign in to manage your membership.",
} as const;

export const MANAGE_MEMBERSHIP_UPGRADE_SOURCES = {
  page: "manage_membership",
  currentPlan: "manage_membership_current_plan",
  comparison: "manage_membership_comparison",
  ctaBand: "manage_membership_cta_band",
  credits: "manage_membership_buy_credits",
  billing: "manage_membership_billing",
  invoices: "manage_membership_invoices",
  reactivate: "manage_membership_reactivate",
} as const;

/** Short FAQ — only if layout needs a block; keep minimal. */
export const MANAGE_MEMBERSHIP_FAQ = [
  {
    id: "credits-reset",
    question: "When do my credits reset?",
    answer:
      "Included monthly credits refresh each billing period. Unused credits do not roll over on Free or Pro in this phase.",
  },
  {
    id: "cancel",
    question: "Can I cancel anytime?",
    answer:
      "Yes. After cancel, you keep access until the end of the current period. Real portal cancel ships with Stripe later.",
  },
  {
    id: "business",
    question: "What is Business?",
    answer:
      "Business includes 10,000 credits / month at $99. Team and org sharing features are roadmap placeholders.",
  },
] as const;
