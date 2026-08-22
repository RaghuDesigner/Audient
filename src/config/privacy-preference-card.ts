/**
 * COMPONENT-069 — Privacy Preference Card constants.
 * Three preference rows — mock only; no consent backend.
 */

import type { LegalPrivacyPreferenceKey } from "@/config/legal-privacy-screen";

/** Toggleable keys shown on the card — marketing excluded per spec. */
export const PRIVACY_PREFERENCE_CARD_TOGGLE_KEYS = [
  "analyticsCookies",
  "emailCommunications",
] as const;

export type PrivacyPreferenceCardToggleKey =
  (typeof PRIVACY_PREFERENCE_CARD_TOGGLE_KEYS)[number];

export const PRIVACY_PREFERENCE_CARD_LABELS: Record<
  "essential" | PrivacyPreferenceCardToggleKey,
  string
> = {
  essential: "Essential",
  analyticsCookies: "Analytics",
  emailCommunications: "Product Communications",
};

export const PRIVACY_PREFERENCE_CARD_DESCRIPTIONS: Record<
  "essential" | PrivacyPreferenceCardToggleKey,
  string
> = {
  essential:
    "Required for sign-in, security, and core site functionality. Always enabled.",
  analyticsCookies:
    "Help us understand how the product is used so we can improve it. Optional.",
  emailCommunications:
    "Receive occasional product news and tips. You can unsubscribe anytime.",
};

export const PRIVACY_PREFERENCE_CARD_COPY = {
  enabled: "On",
  disabled: "Off",
  essentialState: "Enabled — always on",
  saveDelayMs: 300,
} as const;

export function isPrivacyPreferenceCardToggleKey(
  value: string,
): value is PrivacyPreferenceCardToggleKey {
  return (PRIVACY_PREFERENCE_CARD_TOGGLE_KEYS as readonly string[]).includes(
    value,
  );
}

export function privacyPreferenceCardToggleKey(
  key: PrivacyPreferenceCardToggleKey,
): LegalPrivacyPreferenceKey {
  return key;
}
