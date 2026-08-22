/**
 * COMPONENT-071 — Terms Version Card constants.
 * Field labels and analytics — mock metadata only; no backend.
 */

import type { LegalDocumentSlug } from "@/config/legal-privacy-screen";

export const TERMS_VERSION_CARD_DEFAULT_SLUG: LegalDocumentSlug = "terms";

export const TERMS_VERSION_CARD_COPY = {
  cardTitle: "Document version",
  documentLabel: "Document",
  versionLabel: "Version",
  effectiveDateLabel: "Effective date",
  lastUpdatedLabel: "Last updated",
  viewDocument: "View document",
  notAvailable: "Not available",
} as const;

export const TERMS_VERSION_CARD_ANALYTICS_SOURCE = "terms_version_card" as const;

export function termsVersionCardViewLabel(documentTitle: string): string {
  return `View ${documentTitle}`;
}
