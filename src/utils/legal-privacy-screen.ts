/**
 * SCREEN-024 — Legal & Privacy helpers.
 * Slug resolution, routes, formatting — no React / no API.
 */

import {
  LEGAL_DOCUMENT_LABELS,
  LEGAL_DOCUMENT_SLUGS,
  LEGAL_PRIVACY_COPY,
  LEGAL_PRIVACY_PREFS_STORAGE_KEY,
  LEGAL_PRIVACY_ROUTE,
  LEGAL_PRIVACY_SECTION_IDS,
  type LegalDocumentSlug,
  type LegalPrivacyPreferenceKey,
} from "@/config/legal-privacy-screen";
import type { MockLegalConsentRecord } from "@/data/mock-legal-consent";

export function isLegalDocumentSlug(value: string): value is LegalDocumentSlug {
  return (LEGAL_DOCUMENT_SLUGS as readonly string[]).includes(value);
}

export function resolveLegalDocumentSlug(
  value: string | null | undefined,
): LegalDocumentSlug | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  return isLegalDocumentSlug(normalized) ? normalized : null;
}

export function buildLegalDocumentRoute(slug: LegalDocumentSlug): string {
  return `${LEGAL_PRIVACY_ROUTE}/${slug}`;
}

export function formatLegalLastUpdated(isoDate: string, locale?: string): string {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return isoDate;
  }
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "long",
  }).format(parsed);
}

export function formatLegalVersionLabel(version: string): string {
  return `${LEGAL_PRIVACY_COPY.versionPrefix} ${version}`;
}

export function formatConsentDate(isoDate: string, locale?: string): string {
  return formatLegalLastUpdated(isoDate, locale);
}

export function formatCookiePreferenceSummary(
  preferences: Pick<
    MockLegalConsentRecord["preferences"],
    "analyticsCookies" | "marketingCookies"
  >,
): string {
  const analytics = preferences.analyticsCookies
    ? LEGAL_PRIVACY_COPY.yes
    : LEGAL_PRIVACY_COPY.no;
  const marketing = preferences.marketingCookies
    ? LEGAL_PRIVACY_COPY.yes
    : LEGAL_PRIVACY_COPY.no;
  return `Analytics: ${analytics} · Marketing: ${marketing}`;
}

export function legalPrivacySectionId(
  key: keyof typeof LEGAL_PRIVACY_SECTION_IDS,
): string {
  return LEGAL_PRIVACY_SECTION_IDS[key];
}

export function legalDocumentLabel(slug: LegalDocumentSlug): string {
  return LEGAL_DOCUMENT_LABELS[slug];
}

export type LegalPrivacyPreferences = Record<
  LegalPrivacyPreferenceKey,
  boolean
>;

export function cloneLegalPrivacyPreferences(
  values: LegalPrivacyPreferences,
): LegalPrivacyPreferences {
  return { ...values };
}

export function readLegalPrivacyPreferencesFromStorage(): LegalPrivacyPreferences | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LEGAL_PRIVACY_PREFS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<LegalPrivacyPreferences>;
    return {
      analyticsCookies: Boolean(parsed.analyticsCookies),
      marketingCookies: Boolean(parsed.marketingCookies),
      emailCommunications: Boolean(parsed.emailCommunications),
    };
  } catch {
    return null;
  }
}

export function writeLegalPrivacyPreferencesToStorage(
  values: LegalPrivacyPreferences,
): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    LEGAL_PRIVACY_PREFS_STORAGE_KEY,
    JSON.stringify(values),
  );
}
