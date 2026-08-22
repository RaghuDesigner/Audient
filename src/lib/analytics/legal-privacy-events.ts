/**
 * Legal & Privacy screen analytics — SCREEN-024.
 * Dev stub — slugs and preference keys only; no PII.
 */

import { LEGAL_PRIVACY_ANALYTICS_SOURCE } from "@/config/legal-privacy-screen";
import type { LegalDocumentSlug } from "@/config/legal-privacy-screen";
import type { LegalPrivacyPreferenceKey } from "@/config/legal-privacy-screen";

type Props = Record<string, string | number | boolean | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

function base(extra?: Props): Props {
  return {
    source: LEGAL_PRIVACY_ANALYTICS_SOURCE,
    mock: true,
    ...extra,
  };
}

export const legalPrivacyAnalytics = {
  pageViewed: (props: { isGuest: boolean; tier: string }) => {
    track("legal_page_viewed", base(props));
  },

  documentOpened: (props: { documentSlug: LegalDocumentSlug; version: string }) => {
    track("legal_document_opened", base(props));
  },

  preferencesViewed: (props: { isGuest: boolean }) => {
    track("privacy_preferences_viewed", base(props));
  },

  preferenceChanged: (props: {
    preferenceKey: LegalPrivacyPreferenceKey;
    value: boolean;
  }) => {
    track("privacy_preference_changed", base(props));
  },
};
