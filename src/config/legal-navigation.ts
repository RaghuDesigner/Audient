/**
 * COMPONENT-068 — Legal Navigation constants.
 * Nav item labels and analytics — mock only; no backend.
 */

import type { LegalDocumentSlug } from "@/config/legal-privacy-screen";
import { LEGAL_DOCUMENT_LABELS } from "@/config/legal-privacy-screen";

export const LEGAL_NAVIGATION_ANALYTICS_SOURCE = "legal_document_nav" as const;

/** Optional short labels — mobile select may use full titles instead. */
export const LEGAL_NAVIGATION_BRIEF_LABELS: Record<LegalDocumentSlug, string> =
  {
    terms: "Terms",
    privacy: "Privacy",
    cookies: "Cookies",
    "acceptable-use": "Acceptable Use",
    "data-processing": "Data Processing",
  };

export function legalNavigationLabel(slug: LegalDocumentSlug): string {
  return LEGAL_DOCUMENT_LABELS[slug];
}

export function legalNavigationBriefLabel(slug: LegalDocumentSlug): string {
  return LEGAL_NAVIGATION_BRIEF_LABELS[slug];
}
