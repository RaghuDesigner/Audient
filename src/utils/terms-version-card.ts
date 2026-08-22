/**
 * COMPONENT-071 — Terms Version Card helpers.
 * Build version metadata from config — no React / no API.
 */

import { TERMS_CHECKBOX_LEGAL } from "@/config/terms-checkbox";
import { TERMS_VERSION_CARD_DEFAULT_SLUG } from "@/config/terms-version-card";
import {
  LEGAL_DOCUMENT_LABELS,
  LEGAL_DOCUMENT_VERSIONS,
  type LegalDocumentSlug,
} from "@/config/legal-privacy-screen";
import { buildLegalDocumentRoute } from "@/utils/legal-privacy-screen";

export type TermsVersionCardModel = {
  slug: LegalDocumentSlug;
  documentTitle: string;
  version: string;
  effectiveDateIso: string;
  lastUpdatedIso: string;
  href: string;
};

function resolveEffectiveDateIso(slug: LegalDocumentSlug): string {
  if (slug === "terms") {
    return TERMS_CHECKBOX_LEGAL.termsVersion;
  }
  if (slug === "privacy") {
    return TERMS_CHECKBOX_LEGAL.privacyVersion;
  }
  return LEGAL_DOCUMENT_VERSIONS[slug].lastUpdatedIso;
}

export function buildTermsVersionCardModel(
  slug: LegalDocumentSlug = TERMS_VERSION_CARD_DEFAULT_SLUG,
): TermsVersionCardModel {
  const meta = LEGAL_DOCUMENT_VERSIONS[slug];
  return {
    slug,
    documentTitle: LEGAL_DOCUMENT_LABELS[slug],
    version: meta.version,
    effectiveDateIso: resolveEffectiveDateIso(slug),
    lastUpdatedIso: meta.lastUpdatedIso,
    href: buildLegalDocumentRoute(slug),
  };
}

export function isValidTermsVersionDate(isoDate: string | undefined): boolean {
  if (!isoDate?.trim()) return false;
  return !Number.isNaN(new Date(isoDate).getTime());
}
