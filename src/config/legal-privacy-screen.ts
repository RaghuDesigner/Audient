/**
 * SCREEN-024 — Legal & Privacy screen constants.
 * Mock legal hub — no backend / no Supabase / no consent persistence API.
 * @see docs/screens/SCREEN-024_LEGAL_AND_PRIVACY.md
 */

import { TERMS_CHECKBOX_LEGAL } from "@/config/terms-checkbox";

export const LEGAL_PRIVACY_ROUTE = "/legal";

/** Legacy footer / checkout paths — redirect or alias to `/legal/{slug}`. */
export const LEGAL_TERMS_LEGACY_ROUTE = "/terms";
export const LEGAL_PRIVACY_LEGACY_ROUTE = "/privacy";

export const LEGAL_PRIVACY_DASHBOARD_ROUTE = "/dashboard";

export const LEGAL_PRIVACY_STATES = ["loading", "success", "error"] as const;

export type LegalPrivacyScreenState = (typeof LEGAL_PRIVACY_STATES)[number];

/** Document slugs — deep-linkable under `/legal/{slug}`. */
export const LEGAL_DOCUMENT_SLUGS = [
  "terms",
  "privacy",
  "cookies",
  "acceptable-use",
  "data-processing",
] as const;

export type LegalDocumentSlug = (typeof LEGAL_DOCUMENT_SLUGS)[number];

export const LEGAL_DOCUMENT_LABELS: Record<LegalDocumentSlug, string> = {
  terms: "Terms of Service",
  privacy: "Privacy Policy",
  cookies: "Cookie Policy",
  "acceptable-use": "Acceptable Use Policy",
  "data-processing": "Data Processing Information",
};

export const LEGAL_DOCUMENT_DESCRIPTIONS: Record<LegalDocumentSlug, string> = {
  terms: "Rules for using Audient and our services.",
  privacy: "How we collect, use, and protect your information.",
  cookies: "How we use cookies and similar technologies.",
  "acceptable-use": "Permitted and prohibited uses of the platform.",
  "data-processing": "Overview of how Audient processes customer data.",
};

/** Default document when visiting `/legal` without a slug. */
export const LEGAL_PRIVACY_DEFAULT_DOCUMENT: LegalDocumentSlug = "terms";

/** Display version label — aligned with SCREEN-024 spec example. */
export const LEGAL_DOCUMENT_DISPLAY_VERSION = "1.0";

/** Per-document version metadata — terms/privacy align with checkout legal stamps. */
export const LEGAL_DOCUMENT_VERSIONS: Record<
  LegalDocumentSlug,
  { version: string; lastUpdatedIso: string }
> = {
  terms: {
    version: LEGAL_DOCUMENT_DISPLAY_VERSION,
    lastUpdatedIso: TERMS_CHECKBOX_LEGAL.termsVersion,
  },
  privacy: {
    version: LEGAL_DOCUMENT_DISPLAY_VERSION,
    lastUpdatedIso: TERMS_CHECKBOX_LEGAL.privacyVersion,
  },
  cookies: {
    version: LEGAL_DOCUMENT_DISPLAY_VERSION,
    lastUpdatedIso: "2026-08-14",
  },
  "acceptable-use": {
    version: LEGAL_DOCUMENT_DISPLAY_VERSION,
    lastUpdatedIso: "2026-08-14",
  },
  "data-processing": {
    version: LEGAL_DOCUMENT_DISPLAY_VERSION,
    lastUpdatedIso: "2026-08-14",
  },
};

export const LEGAL_PRIVACY_PREFERENCE_KEYS = [
  "analyticsCookies",
  "marketingCookies",
  "emailCommunications",
] as const;

export type LegalPrivacyPreferenceKey =
  (typeof LEGAL_PRIVACY_PREFERENCE_KEYS)[number];

export const LEGAL_PRIVACY_PREFERENCE_LABELS: Record<
  LegalPrivacyPreferenceKey,
  string
> = {
  analyticsCookies: "Analytics cookies",
  marketingCookies: "Marketing cookies",
  emailCommunications: "Product email updates",
};

export const LEGAL_PRIVACY_PREFERENCE_DESCRIPTIONS: Record<
  LegalPrivacyPreferenceKey,
  string
> = {
  analyticsCookies:
    "Help us understand how the product is used so we can improve it. Optional.",
  marketingCookies:
    "Allow personalized offers and campaign measurement. Optional.",
  emailCommunications:
    "Receive occasional product news and tips. You can unsubscribe anytime.",
};

/** Essential cookies are always on — not user-toggleable. */
export const LEGAL_PRIVACY_ESSENTIAL_COOKIES_LABEL = "Essential cookies";
export const LEGAL_PRIVACY_ESSENTIAL_COOKIES_DESCRIPTION =
  "Required for sign-in, security, and core site functionality. Always enabled.";

export const LEGAL_PRIVACY_COPY = {
  pageTitle: "Legal & Privacy",
  pageDescription:
    "Review Audient policies, manage privacy preferences, and see your consent summary.",
  breadcrumbCurrent: "Legal & Privacy",
  breadcrumbDashboard: "Dashboard",
  navLabel: "Legal documents",
  documentNavLabel: "Choose a legal document",
  versionPrefix: "Version",
  lastUpdatedPrefix: "Last updated",
  placeholderNotice:
    "[Placeholder content — pending legal review. Do not rely on this text for compliance decisions.]",
  privacyPreferencesTitle: "Privacy preferences",
  privacyPreferencesDescription:
    "Manage optional cookies and communications. Changes are stored locally in this demo only.",
  savePreferences: "Save preferences",
  preferencesSaved: "Preferences saved.",
  consentStatusTitle: "Consent status",
  consentStatusDescription:
    "Summary of your recorded acceptances. Mock data only — not persisted to a server.",
  termsAccepted: "Terms accepted",
  privacyAcknowledged: "Privacy policy acknowledged",
  cookiePreference: "Cookie preference",
  consentDate: "Consent date",
  yes: "Yes",
  no: "No",
  viewTerms: "View Terms",
  viewPrivacyPolicy: "View Privacy Policy",
  managePrivacyPreferences: "Manage privacy preferences",
  actionsLabel: "Quick actions",
  retry: "Try again",
  loadError: "We could not load this legal document. Please try again.",
  unknownDocumentTitle: "Document not found",
  unknownDocumentBody:
    "That legal document is not available. Choose another document from the list.",
  backToLegal: "Back to Legal & Privacy",
  skipToContent: "Skip to legal content",
} as const;

export const LEGAL_PRIVACY_SECTION_IDS = {
  content: "legal-content",
  preferences: "legal-privacy-preferences",
  consentStatus: "legal-consent-status",
  actions: "legal-quick-actions",
} as const;

export const LEGAL_PRIVACY_ANALYTICS_SOURCE = "legal_privacy_screen";

/** Mock localStorage key — demo only; no backend. */
export const LEGAL_PRIVACY_PREFS_STORAGE_KEY = "audient:legal-privacy-prefs";
