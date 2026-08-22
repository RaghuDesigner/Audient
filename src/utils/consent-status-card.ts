/**
 * COMPONENT-070 — Consent Status Card helpers.
 * Resolve display values — no React / no API.
 */

import {
  CONSENT_STATUS_CARD_COPY,
  CONSENT_STATUS_LABELS,
  type ConsentStatusValue,
} from "@/config/consent-status-card";
import type { MockLegalConsentRecord } from "@/data/mock-legal-consent";
import { formatConsentDate } from "@/utils/legal-privacy-screen";
import type { LegalPrivacyPreferences } from "@/utils/legal-privacy-screen";

export type ConsentStatusResolved = {
  value: ConsentStatusValue;
  label: string;
};

export type ConsentDateResolved =
  | { kind: "date"; label: string }
  | { kind: "not_available"; label: string };

export type ConsentCookieResolved =
  | { kind: "summary"; label: string }
  | { kind: "not_available"; label: string };

export function resolveBooleanConsentStatus(
  value: boolean | null | undefined,
  recordAvailable = true,
): ConsentStatusResolved {
  if (!recordAvailable || value == null) {
    return {
      value: "not_available",
      label: CONSENT_STATUS_LABELS.not_available,
    };
  }
  if (value) {
    return {
      value: "accepted",
      label: CONSENT_STATUS_LABELS.accepted,
    };
  }
  return {
    value: "not_accepted",
    label: CONSENT_STATUS_LABELS.not_accepted,
  };
}

export function resolveConsentDateStatus(
  isoDate: string | null | undefined,
): ConsentDateResolved {
  if (!isoDate?.trim()) {
    return {
      kind: "not_available",
      label: CONSENT_STATUS_LABELS.not_available,
    };
  }
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return {
      kind: "not_available",
      label: CONSENT_STATUS_LABELS.not_available,
    };
  }
  return {
    kind: "date",
    label: formatConsentDate(isoDate),
  };
}

export function resolveConsentCookiePreference(
  input: {
    preferences?: LegalPrivacyPreferences | null;
    consent?: MockLegalConsentRecord | null;
  },
): ConsentCookieResolved {
  const prefs =
    input.preferences ??
    (input.consent
      ? {
          analyticsCookies: input.consent.preferences.analyticsCookies,
          marketingCookies: input.consent.preferences.marketingCookies,
          emailCommunications: input.consent.preferences.emailCommunications,
        }
      : null);

  if (!prefs) {
    return {
      kind: "not_available",
      label: CONSENT_STATUS_LABELS.not_available,
    };
  }

  const analytics = prefs.analyticsCookies
    ? CONSENT_STATUS_CARD_COPY.cookieOn
    : CONSENT_STATUS_CARD_COPY.cookieOff;
  const marketing = prefs.marketingCookies
    ? CONSENT_STATUS_CARD_COPY.cookieOn
    : CONSENT_STATUS_CARD_COPY.cookieOff;

  return {
    kind: "summary",
    label: `${CONSENT_STATUS_CARD_COPY.cookieAnalyticsLabel}: ${analytics} · ${CONSENT_STATUS_CARD_COPY.cookieMarketingLabel}: ${marketing}`,
  };
}
