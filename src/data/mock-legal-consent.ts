/**
 * SCREEN-024 — Mock consent status for authenticated users.
 * No Supabase / no backend persistence.
 */

import type { LegalPrivacyPreferenceKey } from "@/config/legal-privacy-screen";
import { TERMS_CHECKBOX_LEGAL } from "@/config/terms-checkbox";

export type MockLegalConsentRecord = {
  termsAccepted: boolean;
  privacyAcknowledged: boolean;
  preferences: Record<LegalPrivacyPreferenceKey, boolean>;
  consentDateIso: string;
  termsVersion: string;
  privacyVersion: string;
};

const DEFAULT_MOCK_CONSENT: MockLegalConsentRecord = {
  termsAccepted: true,
  privacyAcknowledged: true,
  preferences: {
    analyticsCookies: false,
    marketingCookies: false,
    emailCommunications: true,
  },
  consentDateIso: "2026-08-01T10:30:00.000Z",
  termsVersion: TERMS_CHECKBOX_LEGAL.termsVersion,
  privacyVersion: TERMS_CHECKBOX_LEGAL.privacyVersion,
};

const PARTIAL_MOCK_CONSENT: MockLegalConsentRecord = {
  termsAccepted: true,
  privacyAcknowledged: false,
  preferences: {
    analyticsCookies: true,
    marketingCookies: false,
    emailCommunications: false,
  },
  consentDateIso: "2026-07-15T14:00:00.000Z",
  termsVersion: TERMS_CHECKBOX_LEGAL.termsVersion,
  privacyVersion: TERMS_CHECKBOX_LEGAL.privacyVersion,
};

/** Deterministic mock — alternates bundle by user id suffix for QA variety. */
export function getMockLegalConsent(userId?: string | null): MockLegalConsentRecord {
  if (!userId) {
    return DEFAULT_MOCK_CONSENT;
  }
  const lastChar = userId.slice(-1);
  const usePartial = /[02468]/u.test(lastChar);
  return usePartial ? PARTIAL_MOCK_CONSENT : DEFAULT_MOCK_CONSENT;
}
