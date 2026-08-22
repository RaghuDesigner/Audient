"use client";

import * as React from "react";

import { LegalDocumentCard } from "@/components/legal/LegalDocumentCard";
import { LEGAL_DOCUMENT_CARD_COPY } from "@/config/legal-document-card";
import type { LegalDocumentSlug } from "@/config/legal-privacy-screen";
import { buildLegalDocumentCards } from "@/utils/legal-document-card";
import { cn } from "@/utils/cn";

export type LegalDocumentGridProps = {
  activeSlug?: LegalDocumentSlug | null;
  disabled?: boolean;
  loading?: boolean;
  onView?: (slug: LegalDocumentSlug) => void;
  className?: string;
};

/**
 * SCREEN-024 — legal document hub grid.
 * Composes LegalDocumentCard (COMPONENT-067) per document.
 */
export function LegalDocumentGrid({
  activeSlug = null,
  disabled = false,
  loading = false,
  onView,
  className,
}: LegalDocumentGridProps) {
  const cards = React.useMemo(() => buildLegalDocumentCards(), []);

  return (
    <section
      className={cn("flex flex-col gap-md", className)}
      aria-labelledby="legal-documents-grid-heading"
    >
      <h2
        id="legal-documents-grid-heading"
        className="text-body font-semibold text-foreground"
      >
        {LEGAL_DOCUMENT_CARD_COPY.gridHeading}
      </h2>
      <div className="grid grid-cols-1 gap-sm sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? cards.map((card) => (
              <LegalDocumentCard
                key={card.slug}
                slug={card.slug}
                title={card.title}
                description={card.description}
                version={card.version}
                lastUpdatedIso={card.lastUpdatedIso}
                loading
              />
            ))
          : cards.map((card) => (
              <LegalDocumentCard
                key={card.slug}
                slug={card.slug}
                title={card.title}
                description={card.description}
                version={card.version}
                lastUpdatedIso={card.lastUpdatedIso}
                href={card.href}
                active={activeSlug === card.slug}
                disabled={disabled}
                onView={onView}
              />
            ))}
      </div>
    </section>
  );
}
