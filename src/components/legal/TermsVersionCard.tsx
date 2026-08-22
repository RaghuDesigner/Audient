"use client";

import * as React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BodySmall, Caption, H2 } from "@/components/ui/typography";
import {
  TERMS_VERSION_CARD_COPY,
  termsVersionCardViewLabel,
} from "@/config/terms-version-card";
import type { LegalDocumentSlug } from "@/config/legal-privacy-screen";
import { termsVersionCardAnalytics } from "@/lib/analytics/terms-version-card-events";
import {
  buildTermsVersionCardModel,
  isValidTermsVersionDate,
} from "@/utils/terms-version-card";
import {
  formatLegalLastUpdated,
  formatLegalVersionLabel,
} from "@/utils/legal-privacy-screen";

export type TermsVersionCardProps = {
  slug?: LegalDocumentSlug;
  documentTitle?: string;
  version?: string;
  effectiveDateIso?: string;
  lastUpdatedIso?: string;
  href?: string;
  loading?: boolean;
  disabled?: boolean;
  onViewDocument?: (slug: LegalDocumentSlug) => void;
  className?: string;
};

type MetaRowProps = {
  termId: string;
  detailId: string;
  label: string;
  children: React.ReactNode;
};

function MetaRow({ termId, detailId, label, children }: MetaRowProps) {
  return (
    <div className="border-b border-border py-md last:border-0">
      <dt id={termId}>
        <Caption className="font-semibold text-foreground">{label}</Caption>
      </dt>
      <dd id={detailId} aria-labelledby={termId} className="mt-xs m-0">
        {children}
      </dd>
    </div>
  );
}

function formatDateOrUnavailable(isoDate: string | undefined): React.ReactNode {
  if (!isValidTermsVersionDate(isoDate)) {
    return (
      <BodySmall className="text-muted-foreground">
        {TERMS_VERSION_CARD_COPY.notAvailable}
      </BodySmall>
    );
  }
  return (
    <BodySmall className="text-muted-foreground">
      <time dateTime={isoDate}>{formatLegalLastUpdated(isoDate!)}</time>
    </BodySmall>
  );
}

/**
 * COMPONENT-071 — Terms Version Card.
 * Read-only legal document version metadata — mock config only.
 */
export function TermsVersionCard({
  slug = "terms",
  documentTitle,
  version,
  effectiveDateIso,
  lastUpdatedIso,
  href,
  loading = false,
  disabled = false,
  onViewDocument,
  className,
}: TermsVersionCardProps) {
  const defaults = React.useMemo(() => buildTermsVersionCardModel(slug), [slug]);

  const model = {
    slug: defaults.slug,
    documentTitle: documentTitle ?? defaults.documentTitle,
    version: version ?? defaults.version,
    effectiveDateIso: effectiveDateIso ?? defaults.effectiveDateIso,
    lastUpdatedIso: lastUpdatedIso ?? defaults.lastUpdatedIso,
    href: href ?? defaults.href,
  };

  const viewLabel = termsVersionCardViewLabel(model.documentTitle);
  const cardTitleId = `terms-version-card-title-${model.slug}`;

  const handleView = () => {
    termsVersionCardAnalytics.documentOpened({
      documentSlug: model.slug,
      version: model.version,
    });
    onViewDocument?.(model.slug);
  };

  if (loading) {
    return (
      <Card variant="default" padding="lg" className={className} aria-busy="true">
        <CardContent className="gap-md">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-11 w-36" />
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card
      variant="default"
      padding="lg"
      className={className}
      aria-labelledby={cardTitleId}
    >
      <CardContent className="gap-md">
        <H2 id={cardTitleId} className="text-body font-semibold">
          {TERMS_VERSION_CARD_COPY.cardTitle}
        </H2>

        <dl className="m-0">
          <MetaRow
            termId={`${cardTitleId}-document-label`}
            detailId={`${cardTitleId}-document-value`}
            label={TERMS_VERSION_CARD_COPY.documentLabel}
          >
            <BodySmall className="font-medium text-foreground">
              {model.documentTitle}
            </BodySmall>
          </MetaRow>

          <MetaRow
            termId={`${cardTitleId}-version-label`}
            detailId={`${cardTitleId}-version-value`}
            label={TERMS_VERSION_CARD_COPY.versionLabel}
          >
            <BodySmall className="text-muted-foreground">
              {formatLegalVersionLabel(model.version)}
            </BodySmall>
          </MetaRow>

          <MetaRow
            termId={`${cardTitleId}-effective-label`}
            detailId={`${cardTitleId}-effective-value`}
            label={TERMS_VERSION_CARD_COPY.effectiveDateLabel}
          >
            {formatDateOrUnavailable(model.effectiveDateIso)}
          </MetaRow>

          <MetaRow
            termId={`${cardTitleId}-updated-label`}
            detailId={`${cardTitleId}-updated-value`}
            label={TERMS_VERSION_CARD_COPY.lastUpdatedLabel}
          >
            {formatDateOrUnavailable(model.lastUpdatedIso)}
          </MetaRow>
        </dl>
      </CardContent>

      <CardFooter className="pt-0">
        {onViewDocument ? (
          <Button
            type="button"
            variant="outline"
            className="min-h-11 w-full sm:w-auto"
            disabled={disabled}
            aria-label={viewLabel}
            onClick={handleView}
          >
            {TERMS_VERSION_CARD_COPY.viewDocument}
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="min-h-11 w-full sm:w-auto"
            disabled={disabled}
            asChild
          >
            <Link href={model.href} aria-label={viewLabel} onClick={handleView}>
              {TERMS_VERSION_CARD_COPY.viewDocument}
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
