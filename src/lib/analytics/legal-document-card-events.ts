/**
 * Legal Document Card analytics — COMPONENT-067.
 * Dev stub — slug and version only; no PII.
 */

import { LEGAL_DOCUMENT_CARD_ANALYTICS_SOURCE } from "@/config/legal-document-card";
import type { LegalDocumentSlug } from "@/config/legal-privacy-screen";

type Props = Record<string, string | number | boolean | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

function base(extra?: Props): Props {
  return {
    source: LEGAL_DOCUMENT_CARD_ANALYTICS_SOURCE,
    mock: true,
    ...extra,
  };
}

export const legalDocumentCardAnalytics = {
  opened: (props: { documentSlug: LegalDocumentSlug; version: string }) => {
    track("legal_document_opened", base(props));
  },
};
