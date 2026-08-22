/**
 * COMPONENT-070 — Consent Status Card constants.
 * Status vocabulary and badge mapping — mock only; no backend.
 */

export const CONSENT_STATUS_VALUES = [
  "accepted",
  "not_accepted",
  "not_available",
] as const;

export type ConsentStatusValue = (typeof CONSENT_STATUS_VALUES)[number];

export const CONSENT_STATUS_LABELS: Record<ConsentStatusValue, string> = {
  accepted: "Accepted",
  not_accepted: "Not accepted",
  not_available: "Not available",
};

/** Badge variants — always paired with visible status text (not color-only). */
export const CONSENT_STATUS_BADGE_VARIANTS = {
  accepted: "success",
  not_accepted: "warning",
  not_available: "neutral",
} as const satisfies Record<
  ConsentStatusValue,
  "success" | "warning" | "neutral"
>;

export const CONSENT_STATUS_CARD_COPY = {
  cookieAnalyticsLabel: "Analytics",
  cookieMarketingLabel: "Marketing",
  cookieOn: "On",
  cookieOff: "Off",
} as const;
