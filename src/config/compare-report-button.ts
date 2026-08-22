/**
 * COMPONENT-032 — Compare Report Button constants.
 * Labels, states, tiers — no UI / no compare backend.
 */

export const COMPARE_REPORT_BUTTON_STATES = [
  "default",
  "loading",
  "disabled",
  "locked",
] as const;

export type CompareReportButtonState =
  (typeof COMPARE_REPORT_BUTTON_STATES)[number];

export const COMPARE_REPORT_BUTTON_TIERS = [
  "guest",
  "free",
  "pro",
  "business",
] as const;

export type CompareReportButtonTier =
  (typeof COMPARE_REPORT_BUTTON_TIERS)[number];

export const COMPARE_REPORT_BUTTON_SURFACES = [
  "report",
  "history",
  "summary",
] as const;

export type CompareReportButtonSurface =
  (typeof COMPARE_REPORT_BUTTON_SURFACES)[number];

export const COMPARE_REPORT_BUTTON_VARIANTS = [
  "button",
  "menuItem",
] as const;

export type CompareReportButtonVariant =
  (typeof COMPARE_REPORT_BUTTON_VARIANTS)[number];

export const COMPARE_REPORT_BUTTON_COPY = {
  label: "Compare Reports",
  tooltip: "Compare this audit with another report.",
  lockedTooltip: "Upgrade to Business to compare reports",
  lockedAria: "Upgrade to Business to compare reports",
  loadingLabel: "Opening compare…",
  disabledTooltip: "Compare is unavailable for this audit.",
  disabledAria: "Compare reports unavailable",
  selectorTitle: "Compare reports",
  selectorDescription:
    "Choose another completed audit to compare. Full side-by-side compare is coming soon.",
  selectorEmpty: "No other completed audits available to compare yet.",
  selectorComingSoon: "Compare workspace coming soon.",
  selectorCancel: "Cancel",
  selectorContinue: "Continue",
} as const;

export const COMPARE_REPORT_BUTTON_UPGRADE_SOURCE = "compare_report";

/** Brief loading while the selector placeholder mounts (ms). */
export const COMPARE_REPORT_BUTTON_OPEN_DELAY_MS = 200;
