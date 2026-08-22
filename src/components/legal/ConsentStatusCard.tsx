"use client";

import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BodySmall, Caption, H2 } from "@/components/ui/typography";
import {
  CONSENT_STATUS_BADGE_VARIANTS,
  CONSENT_STATUS_LABELS,
  type ConsentStatusValue,
} from "@/config/consent-status-card";
import { LEGAL_PRIVACY_COPY } from "@/config/legal-privacy-screen";
import type { MockLegalConsentRecord } from "@/data/mock-legal-consent";
import {
  resolveBooleanConsentStatus,
  resolveConsentCookiePreference,
  resolveConsentDateStatus,
} from "@/utils/consent-status-card";
import {
  legalPrivacySectionId,
  type LegalPrivacyPreferences,
} from "@/utils/legal-privacy-screen";
import { cn } from "@/utils/cn";

export type ConsentStatusCardProps = {
  consent?: MockLegalConsentRecord | null;
  preferences?: LegalPrivacyPreferences;
  loading?: boolean;
  className?: string;
};

type ConsentStatusIndicatorProps = {
  status: ConsentStatusValue;
  label: string;
  id: string;
};

function ConsentStatusIndicator({
  status,
  label,
  id,
}: ConsentStatusIndicatorProps) {
  return (
    <Badge
      id={id}
      variant={CONSENT_STATUS_BADGE_VARIANTS[status]}
      size="md"
      shape="pill"
      aria-label={label}
    >
      {label}
    </Badge>
  );
}

type ConsentStatusRowProps = {
  termId: string;
  detailId: string;
  label: string;
  children: React.ReactNode;
};

function ConsentStatusRow({
  termId,
  detailId,
  label,
  children,
}: ConsentStatusRowProps) {
  return (
    <div className="border-b border-border py-md last:border-0">
      <dt id={termId} className="mb-sm">
        <Caption className="font-semibold text-foreground">{label}</Caption>
      </dt>
      <dd
        id={detailId}
        aria-labelledby={termId}
        className="m-0 flex flex-col gap-sm sm:flex-row sm:items-center sm:justify-end"
      >
        {children}
      </dd>
    </div>
  );
}

/**
 * COMPONENT-070 — Consent Status Card.
 * Read-only consent summary — mock data only; no backend.
 */
export function ConsentStatusCard({
  consent = null,
  preferences,
  loading = false,
  className,
}: ConsentStatusCardProps) {
  const sectionId = legalPrivacySectionId("consentStatus");
  const recordAvailable = consent != null;

  const termsStatus = resolveBooleanConsentStatus(
    consent?.termsAccepted,
    recordAvailable,
  );
  const privacyStatus = resolveBooleanConsentStatus(
    consent?.privacyAcknowledged,
    recordAvailable,
  );
  const cookieStatus = resolveConsentCookiePreference({
    preferences,
    consent,
  });
  const dateStatus = resolveConsentDateStatus(consent?.consentDateIso);

  if (loading) {
    return (
      <Card variant="default" padding="lg" className={className} aria-busy="true">
        <CardContent className="gap-md">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      id={sectionId}
      variant="default"
      padding="lg"
      className={className}
      aria-labelledby={`${sectionId}-title`}
    >
      <CardContent className="gap-md">
        <header className="flex flex-col gap-sm">
          <H2 id={`${sectionId}-title`}>
            {LEGAL_PRIVACY_COPY.consentStatusTitle}
          </H2>
          <BodySmall className="text-muted-foreground">
            {LEGAL_PRIVACY_COPY.consentStatusDescription}
          </BodySmall>
        </header>

        <dl className="m-0">
          <ConsentStatusRow
            termId={`${sectionId}-terms-label`}
            detailId={`${sectionId}-terms-value`}
            label={LEGAL_PRIVACY_COPY.termsAccepted}
          >
            <ConsentStatusIndicator
              id={`${sectionId}-terms-badge`}
              status={termsStatus.value}
              label={termsStatus.label}
            />
          </ConsentStatusRow>

          <ConsentStatusRow
            termId={`${sectionId}-privacy-label`}
            detailId={`${sectionId}-privacy-value`}
            label={LEGAL_PRIVACY_COPY.privacyAcknowledged}
          >
            <ConsentStatusIndicator
              id={`${sectionId}-privacy-badge`}
              status={privacyStatus.value}
              label={privacyStatus.label}
            />
          </ConsentStatusRow>

          <ConsentStatusRow
            termId={`${sectionId}-cookie-label`}
            detailId={`${sectionId}-cookie-value`}
            label={LEGAL_PRIVACY_COPY.cookiePreference}
          >
            {cookieStatus.kind === "not_available" ? (
              <ConsentStatusIndicator
                id={`${sectionId}-cookie-badge`}
                status="not_available"
                label={cookieStatus.label}
              />
            ) : (
              <BodySmall className="text-muted-foreground">
                {cookieStatus.label}
              </BodySmall>
            )}
          </ConsentStatusRow>

          <ConsentStatusRow
            termId={`${sectionId}-date-label`}
            detailId={`${sectionId}-date-value`}
            label={LEGAL_PRIVACY_COPY.consentDate}
          >
            {dateStatus.kind === "not_available" ? (
              <ConsentStatusIndicator
                id={`${sectionId}-date-badge`}
                status="not_available"
                label={dateStatus.label}
              />
            ) : (
              <BodySmall className={cn("text-muted-foreground")}>
                <time dateTime={consent?.consentDateIso ?? undefined}>
                  {dateStatus.label}
                </time>
              </BodySmall>
            )}
          </ConsentStatusRow>
        </dl>
      </CardContent>
    </Card>
  );
}

export { CONSENT_STATUS_LABELS };
