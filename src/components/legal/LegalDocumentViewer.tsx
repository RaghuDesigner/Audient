"use client";

import * as React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BodySmall, Caption, H2, H3 } from "@/components/ui/typography";
import {
  LEGAL_DOCUMENT_LABELS,
  LEGAL_DOCUMENT_VERSIONS,
  LEGAL_PRIVACY_COPY,
  LEGAL_PRIVACY_ROUTE,
  type LegalDocumentSlug,
} from "@/config/legal-privacy-screen";
import type { LegalDocumentContent } from "@/data/mock-legal-documents";
import {
  formatLegalLastUpdated,
  formatLegalVersionLabel,
} from "@/utils/legal-privacy-screen";
import { cn } from "@/utils/cn";

export type LegalDocumentViewerProps = {
  slug: LegalDocumentSlug;
  document: LegalDocumentContent | null;
  loading?: boolean;
  unknownDocument?: boolean;
  className?: string;
};

/**
 * Renders active legal document body with version metadata.
 */
export function LegalDocumentViewer({
  slug,
  document,
  loading = false,
  unknownDocument = false,
  className,
}: LegalDocumentViewerProps) {
  const meta = LEGAL_DOCUMENT_VERSIONS[slug];
  const title = LEGAL_DOCUMENT_LABELS[slug];

  if (loading) {
    return (
      <Card variant="default" padding="lg" className={className}>
        <CardContent className="gap-md">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </CardContent>
      </Card>
    );
  }

  if (unknownDocument || !document) {
    return (
      <Card variant="default" padding="lg" className={className}>
        <CardContent className="items-start gap-md">
          <H2>{LEGAL_PRIVACY_COPY.unknownDocumentTitle}</H2>
          <BodySmall className="text-muted-foreground">
            {LEGAL_PRIVACY_COPY.unknownDocumentBody}
          </BodySmall>
          <Button type="button" variant="outline" asChild>
            <Link href={LEGAL_PRIVACY_ROUTE}>{LEGAL_PRIVACY_COPY.backToLegal}</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <article
      className={cn(
        "rounded-lg border border-border bg-surface p-lg shadow-sm",
        className,
      )}
      aria-labelledby="legal-document-title"
    >
      <header className="mb-lg flex flex-col gap-sm border-b border-border pb-md">
        <H2 id="legal-document-title">{title}</H2>
        <div className="flex flex-wrap gap-md">
          <Caption className="font-semibold text-foreground">
            {formatLegalVersionLabel(meta.version)}
          </Caption>
          <Caption className="text-muted-foreground">
            {LEGAL_PRIVACY_COPY.lastUpdatedPrefix}:{" "}
            {formatLegalLastUpdated(meta.lastUpdatedIso)}
          </Caption>
        </div>
      </header>

      <div className="flex max-w-prose flex-col gap-lg">
        {document.sections.map((section) => (
          <section key={section.id} aria-labelledby={section.id}>
            <H3 id={section.id} className="mb-sm">
              {section.heading}
            </H3>
            <div className="flex flex-col gap-sm">
              {section.paragraphs.map((paragraph, index) => (
                <BodySmall
                  key={`${section.id}-${index}`}
                  className={cn(
                    index === 0 &&
                      paragraph === LEGAL_PRIVACY_COPY.placeholderNotice
                      ? "rounded-md border border-border bg-muted/30 p-md font-medium text-muted-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {paragraph}
                </BodySmall>
              ))}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}
