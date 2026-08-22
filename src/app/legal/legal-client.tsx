"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { LegalPrivacyScreen } from "@/components/legal/LegalPrivacyScreen";
import {
  LEGAL_PRIVACY_DEFAULT_DOCUMENT,
  type LegalDocumentSlug,
  type LegalPrivacyScreenState,
} from "@/config/legal-privacy-screen";
import { getMockLegalConsent } from "@/data/mock-legal-consent";
import { getMockLegalDocumentsBundle } from "@/data/mock-legal-documents";
import { useAuth } from "@/hooks/use-auth";
import { resolveLegalDocumentSlug } from "@/utils/legal-privacy-screen";

export type LegalClientProps = {
  documentSlug?: string | null;
  state?: LegalPrivacyScreenState | null;
};

/**
 * SCREEN-024 client shell — guest + authenticated; mock bundle only.
 */
export function LegalClient({
  documentSlug = null,
  state = null,
}: LegalClientProps) {
  const router = useRouter();
  const { user } = useAuth();
  const resolvedSlug = resolveLegalDocumentSlug(documentSlug);
  const unknownDocument =
    documentSlug != null && documentSlug !== "" && resolvedSlug == null;

  const activeSlug: LegalDocumentSlug =
    resolvedSlug ?? LEGAL_PRIVACY_DEFAULT_DOCUMENT;

  const [bundle, setBundle] = React.useState(() =>
    getMockLegalDocumentsBundle({ state: state ?? undefined }),
  );
  const [consent, setConsent] = React.useState(() =>
    getMockLegalConsent(user?.id),
  );

  React.useEffect(() => {
    setBundle(getMockLegalDocumentsBundle({ state: state ?? undefined }));
  }, [state]);

  React.useEffect(() => {
    setConsent(getMockLegalConsent(user?.id));
  }, [user?.id]);

  React.useEffect(() => {
    if (!documentSlug && resolvedSlug == null) {
      router.replace(`/legal/${LEGAL_PRIVACY_DEFAULT_DOCUMENT}`);
    }
  }, [documentSlug, resolvedSlug, router]);

  return (
    <LegalPrivacyScreen
      activeSlug={activeSlug}
      documents={bundle.documents}
      consent={consent}
      screenState={bundle.state}
      unknownDocument={unknownDocument}
      onRetry={() => {
        setBundle(getMockLegalDocumentsBundle({ state: "success" }));
      }}
    />
  );
}
