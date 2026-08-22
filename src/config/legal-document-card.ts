/**
 * COMPONENT-067 — Legal Document Card constants.
 * View action copy and accessible names — mock only; no backend.
 */

import type { LegalDocumentSlug } from "@/config/legal-privacy-screen";
import { LEGAL_DOCUMENT_LABELS } from "@/config/legal-privacy-screen";

export const LEGAL_DOCUMENT_CARD_COPY = {
  gridHeading: "Legal documents",
  viewPrefix: "View",
} as const;

export const LEGAL_DOCUMENT_CARD_ANALYTICS_SOURCE =
  "legal_document_card" as const;

export function legalDocumentCardTitle(slug: LegalDocumentSlug): string {
  return LEGAL_DOCUMENT_LABELS[slug];
}

export function legalDocumentViewLabel(title: string): string {
  return `${LEGAL_DOCUMENT_CARD_COPY.viewPrefix} ${title}`;
}

export function legalDocumentCardAccessibleName(
  title: string,
  versionLabel: string,
): string {
  return `${title}, ${versionLabel}`;
}
