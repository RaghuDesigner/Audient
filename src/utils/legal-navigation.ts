/**
 * COMPONENT-068 — Legal Navigation helpers.
 * Build nav items from config — no React / no API.
 */

import {
  LEGAL_DOCUMENT_SLUGS,
  type LegalDocumentSlug,
} from "@/config/legal-privacy-screen";
import { legalNavigationLabel } from "@/config/legal-navigation";
import { buildLegalDocumentRoute } from "@/utils/legal-privacy-screen";

export type LegalNavigationItem = {
  slug: LegalDocumentSlug;
  id: string;
  label: string;
  href: string;
};

export function buildLegalNavigationItems(): LegalNavigationItem[] {
  return LEGAL_DOCUMENT_SLUGS.map((slug) => ({
    slug,
    id: slug,
    label: legalNavigationLabel(slug),
    href: buildLegalDocumentRoute(slug),
  }));
}

export function isLegalNavigationSlug(value: string): value is LegalDocumentSlug {
  return (LEGAL_DOCUMENT_SLUGS as readonly string[]).includes(value);
}
