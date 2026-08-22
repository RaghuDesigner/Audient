/**
 * COMPONENT-067 — Legal Document Card helpers.
 * Build card models from config — no React / no API.
 */

import {
  LEGAL_DOCUMENT_DESCRIPTIONS,
  LEGAL_DOCUMENT_SLUGS,
  LEGAL_DOCUMENT_VERSIONS,
  type LegalDocumentSlug,
} from "@/config/legal-privacy-screen";
import { legalDocumentCardTitle } from "@/config/legal-document-card";
import { buildLegalDocumentRoute } from "@/utils/legal-privacy-screen";

export type LegalDocumentCardModel = {
  slug: LegalDocumentSlug;
  title: string;
  description: string;
  version: string;
  lastUpdatedIso: string;
  href: string;
};

export function buildLegalDocumentCards(): LegalDocumentCardModel[] {
  return LEGAL_DOCUMENT_SLUGS.map((slug) => {
    const meta = LEGAL_DOCUMENT_VERSIONS[slug];
    return {
      slug,
      title: legalDocumentCardTitle(slug),
      description: LEGAL_DOCUMENT_DESCRIPTIONS[slug],
      version: meta.version,
      lastUpdatedIso: meta.lastUpdatedIso,
      href: buildLegalDocumentRoute(slug),
    };
  });
}
