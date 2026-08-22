/**
 * COMPONENT-069 — Privacy Preference Card helpers.
 * Card-facing prefs — merges with full legal privacy storage shape.
 */

import type { PrivacyPreferenceCardToggleKey } from "@/config/privacy-preference-card";
import { PRIVACY_PREFERENCE_CARD_TOGGLE_KEYS } from "@/config/privacy-preference-card";
import type { LegalPrivacyPreferenceKey } from "@/config/legal-privacy-screen";
import {
  cloneLegalPrivacyPreferences,
  type LegalPrivacyPreferences,
} from "@/utils/legal-privacy-screen";

export type PrivacyPreferenceCardValues = Pick<
  LegalPrivacyPreferences,
  PrivacyPreferenceCardToggleKey
>;

export function clonePrivacyPreferenceCardValues(
  values: PrivacyPreferenceCardValues,
): PrivacyPreferenceCardValues {
  return {
    analyticsCookies: values.analyticsCookies,
    emailCommunications: values.emailCommunications,
  };
}

export function pickPrivacyPreferenceCardValues(
  values: LegalPrivacyPreferences,
): PrivacyPreferenceCardValues {
  return clonePrivacyPreferenceCardValues({
    analyticsCookies: values.analyticsCookies,
    emailCommunications: values.emailCommunications,
  });
}

export function mergePrivacyPreferenceCardValues(
  base: LegalPrivacyPreferences,
  cardValues: PrivacyPreferenceCardValues,
): LegalPrivacyPreferences {
  return cloneLegalPrivacyPreferences({
    ...base,
    ...cardValues,
  });
}

export function privacyPreferenceCardStateLabel(enabled: boolean): "On" | "Off" {
  return enabled ? "On" : "Off";
}

export function privacyPreferenceCardToggleKeys(): readonly PrivacyPreferenceCardToggleKey[] {
  return PRIVACY_PREFERENCE_CARD_TOGGLE_KEYS;
}

export function toLegalPreferenceKey(
  key: PrivacyPreferenceCardToggleKey,
): LegalPrivacyPreferenceKey {
  return key;
}
