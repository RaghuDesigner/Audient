/**
 * Quick Action Card defaults — COMPONENT-015.
 */

export const QUICK_ACTION_KEYS = [
  "start_audit",
  "upload_screenshot",
  "paste_url",
  "history",
  "reports",
  "custom",
] as const;

export type QuickActionKey = (typeof QUICK_ACTION_KEYS)[number];

export type QuickActionTier = "guest" | "free" | "pro" | "business";

export type QuickActionCardState = "default" | "disabled" | "loading";

export type QuickActionDefaults = {
  title: string;
  description: string;
};

export const QUICK_ACTION_DEFAULTS: Record<
  Exclude<QuickActionKey, "custom">,
  QuickActionDefaults
> = {
  start_audit: {
    title: "Start Audit",
    description: "Begin a new UX audit from a screenshot or URL.",
  },
  upload_screenshot: {
    title: "Upload Screenshot",
    description: "Analyze a PNG or JPG screenshot with AI.",
  },
  paste_url: {
    title: "Analyze Website URL",
    description: "Run a live URL audit on Pro or Business.",
  },
  history: {
    title: "View Audit History",
    description: "Reopen recent reports and past audits.",
  },
  reports: {
    title: "Reports",
    description: "Open your latest audit reports.",
  },
};
