/**
 * Empty State defaults — COMPONENT-020.
 */

export const EMPTY_STATE_VARIANTS = [
  "no_audits",
  "no_reports",
  "no_notifications",
  "no_history",
  "no_credits",
  "custom",
] as const;

export type EmptyStateVariant = (typeof EMPTY_STATE_VARIANTS)[number];

export type EmptyStateSize = "section" | "page";

export type EmptyStateTier = "guest" | "free" | "pro" | "business";

export type EmptyStateDefaults = {
  headline: string;
  description: string;
  primaryLabel: string;
  secondaryLabel: string | null;
};

export const EMPTY_STATE_DEFAULTS: Record<
  Exclude<EmptyStateVariant, "custom">,
  EmptyStateDefaults
> = {
  no_audits: {
    headline: "No audits yet.",
    description:
      "Run your first AI UX audit to see scores, findings, and recommendations here.",
    primaryLabel: "Start Your First Audit",
    secondaryLabel: "View plans",
  },
  no_reports: {
    headline: "No reports yet.",
    description:
      "Completed audits appear here as reports you can reopen anytime.",
    primaryLabel: "Run an audit",
    secondaryLabel: null,
  },
  no_notifications: {
    headline: "No notifications",
    description: "You’re all caught up. New alerts will show up here.",
    primaryLabel: "Back to Dashboard",
    secondaryLabel: null,
  },
  no_history: {
    headline: "No history yet.",
    description:
      "Past audits and reports will appear in History after you run your first audit.",
    primaryLabel: "Start an audit",
    secondaryLabel: null,
  },
  no_credits: {
    headline: "You’re out of credits",
    description:
      "Upgrade or buy credits to keep running audits. Balances stay server-authoritative.",
    primaryLabel: "Upgrade",
    secondaryLabel: "Compare plans",
  },
};
