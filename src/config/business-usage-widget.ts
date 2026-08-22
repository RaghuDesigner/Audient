/**
 * COMPONENT-056 — Business Usage Widget constants.
 * Mock Business usage — no backend metering.
 */

import { PLANS } from "@/config/plans";

export const BUSINESS_USAGE_WIDGET_STATES = [
  "default",
  "loading",
  "error",
] as const;

export type BusinessUsageWidgetState =
  (typeof BUSINESS_USAGE_WIDGET_STATES)[number];

export const BUSINESS_USAGE_WIDGET_COPY = {
  title: "Business usage",
  caption: "Workspace usage for the current billing cycle (mock).",
  totalAudits: "Total audits",
  monthlyAudits: "Monthly audits",
  creditsUsed: "Credits used",
  creditsRemaining: "Credits remaining",
  storageUsed: "Storage used",
  activeMembers: "Active members",
  creditsProgress: "Credits",
  storageProgress: "Storage",
  monthlyAuditsProgress: "Monthly audits",
  chartTitle: "Audits this week",
  chartSummary: "Daily audit counts for the past week",
  of: "of",
  gb: "GB",
  loading: "Loading business usage…",
  loadError: "Unable to load business usage.",
  retry: "Retry",
} as const;

/** Default Business monthly credit grant — PRICING.md / PLANS.ENTERPRISE. */
export const BUSINESS_USAGE_DEFAULT_CREDIT_GRANT =
  PLANS.ENTERPRISE.monthlyCredits;

export const BUSINESS_USAGE_DEFAULT_STORAGE_QUOTA_GB = 50 as const;

export const BUSINESS_USAGE_DEFAULT_MONTHLY_AUDIT_SOFT_CAP = 200 as const;

export const BUSINESS_USAGE_WIDGET_ANALYTICS_SOURCE =
  "business_usage_widget" as const;
