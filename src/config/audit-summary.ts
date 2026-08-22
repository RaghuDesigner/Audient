/**
 * COMPONENT-027 — Audit Summary constants.
 * Labels, states, and variants — no UI.
 */

export const AUDIT_SUMMARY_STATES = [
  "loading",
  "completed",
  "processing",
  "failed",
  "error",
] as const;

export type AuditSummaryState = (typeof AUDIT_SUMMARY_STATES)[number];

/** Lifecycle badge (subset of report states). */
export const AUDIT_SUMMARY_STATUSES = [
  "completed",
  "processing",
  "failed",
] as const;

export type AuditSummaryStatus = (typeof AUDIT_SUMMARY_STATUSES)[number];

export const AUDIT_SUMMARY_STATUS_LABELS: Record<AuditSummaryStatus, string> = {
  completed: "Completed",
  processing: "Processing",
  failed: "Failed",
};

export const AUDIT_SUMMARY_VARIANTS = [
  "report",
  "compare",
  "shared",
  "pdf",
] as const;

export type AuditSummaryVariant = (typeof AUDIT_SUMMARY_VARIANTS)[number];

export const AUDIT_SUMMARY_TIERS = [
  "guest",
  "free",
  "pro",
  "business",
] as const;

export type AuditSummaryTier = (typeof AUDIT_SUMMARY_TIERS)[number];

export const AUDIT_SUMMARY_TYPES = ["url", "screenshot"] as const;

export type AuditSummaryType = (typeof AUDIT_SUMMARY_TYPES)[number];

export const AUDIT_SUMMARY_TYPE_LABELS: Record<AuditSummaryType, string> = {
  url: "URL",
  screenshot: "Screenshot",
};

export const AUDIT_SUMMARY_MEMBERSHIP = ["free", "pro", "business"] as const;

export type AuditSummaryMembership =
  (typeof AUDIT_SUMMARY_MEMBERSHIP)[number];

export const AUDIT_SUMMARY_MEMBERSHIP_LABELS: Record<
  AuditSummaryMembership,
  string
> = {
  free: "Free",
  pro: "Pro",
  business: "Business",
};

/** Quick-action labels (placeholders until share/PDF/compare ship). */
export const AUDIT_SUMMARY_ACTION_LABELS = {
  share: "Share report",
  exportPdf: "Export PDF",
  compare: "Compare report",
  upgradePdf: "Upgrade to unlock PDF",
  upgradeShare: "Upgrade to share",
  upgradeCompare: "Upgrade to compare",
  retry: "Retry",
  copyAuditId: "Copy audit ID",
} as const;

export const AUDIT_SUMMARY_ERROR = {
  message: "We couldn’t load this audit summary. Please try again.",
} as const;

export const AUDIT_SUMMARY_REGION_LABEL = "Audit summary";
