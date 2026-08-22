"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { ConsentStatusCard } from "@/components/legal/ConsentStatusCard";
import { LegalDocumentGrid } from "@/components/legal/LegalDocumentGrid";
import { LegalNavigation } from "@/components/legal/LegalNavigation";
import { LegalDocumentViewer } from "@/components/legal/LegalDocumentViewer";
import { PrivacyPreferenceCard } from "@/components/legal/PrivacyPreferenceCard";
import { TermsVersionCard } from "@/components/legal/TermsVersionCard";
import { Header } from "@/components/home/header";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Footer } from "@/components/layout/footer";
import { SkipLink } from "@/components/layout/skip-link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BodySmall, Caption, H1 } from "@/components/ui/typography";
import {
  LEGAL_DOCUMENT_VERSIONS,
  LEGAL_PRIVACY_COPY,
  LEGAL_PRIVACY_DASHBOARD_ROUTE,
  LEGAL_PRIVACY_DEFAULT_DOCUMENT,
  LEGAL_PRIVACY_ROUTE,
  type LegalDocumentSlug,
  type LegalPrivacyScreenState,
} from "@/config/legal-privacy-screen";
import type { MockLegalConsentRecord } from "@/data/mock-legal-consent";
import type { LegalDocumentContent } from "@/data/mock-legal-documents";
import { useAuth } from "@/hooks/use-auth";
import { legalPrivacyAnalytics } from "@/lib/analytics/legal-privacy-events";
import {
  useHeaderCredits,
  useHeaderPlanTier,
} from "@/hooks/use-app-state";
import {
  buildLegalDocumentRoute,
  legalDocumentLabel,
  legalPrivacySectionId,
  type LegalPrivacyPreferences as LegalPrivacyPreferencesValues,
} from "@/utils/legal-privacy-screen";

export type LegalPrivacyScreenProps = {
  activeSlug: LegalDocumentSlug;
  documents: LegalDocumentContent[];
  consent: MockLegalConsentRecord;
  screenState?: LegalPrivacyScreenState;
  unknownDocument?: boolean;
  onRetry?: () => void;
};

/**
 * SCREEN-024 — Legal & Privacy hub and document viewer.
 */
export function LegalPrivacyScreen({
  activeSlug,
  documents,
  consent,
  screenState = "success",
  unknownDocument = false,
  onRetry,
}: LegalPrivacyScreenProps) {
  const router = useRouter();
  const { isGuest, user } = useAuth();
  const headerTier = useHeaderPlanTier();
  const headerCredits = useHeaderCredits();
  const viewed = React.useRef(false);
  const docOpened = React.useRef<string | null>(null);

  const [preferences, setPreferences] =
    React.useState<LegalPrivacyPreferencesValues>(consent.preferences);

  const loading = screenState === "loading";
  const isError = screenState === "error";
  const isAuthenticated = !isGuest && Boolean(user);

  const activeDocument =
    documents.find((doc) => doc.slug === activeSlug) ?? null;

  React.useEffect(() => {
    if (viewed.current || loading || isError) return;
    viewed.current = true;
    legalPrivacyAnalytics.pageViewed({
      isGuest,
      tier: user?.planTier ?? "GUEST",
    });
  }, [isError, isGuest, loading, user?.planTier]);

  React.useEffect(() => {
    if (loading || isError || unknownDocument) return;
    if (docOpened.current === activeSlug) return;
    docOpened.current = activeSlug;
    legalPrivacyAnalytics.documentOpened({
      documentSlug: activeSlug,
      version: LEGAL_DOCUMENT_VERSIONS[activeSlug].version,
    });
  }, [activeSlug, isError, loading, unknownDocument]);


  const breadcrumbItems = isAuthenticated
    ? [
        {
          label: LEGAL_PRIVACY_COPY.breadcrumbDashboard,
          href: LEGAL_PRIVACY_DASHBOARD_ROUTE,
        },
        {
          label: LEGAL_PRIVACY_COPY.breadcrumbCurrent,
          href: LEGAL_PRIVACY_ROUTE,
          current: unknownDocument,
        },
        ...(unknownDocument
          ? []
          : [
              {
                label: legalDocumentLabel(activeSlug),
                current: true as const,
              },
            ]),
      ]
    : [
        {
          label: LEGAL_PRIVACY_COPY.breadcrumbCurrent,
          href: LEGAL_PRIVACY_ROUTE,
          current: unknownDocument,
        },
        ...(unknownDocument
          ? []
          : [
              {
                label: legalDocumentLabel(activeSlug),
                current: true as const,
              },
            ]),
      ];

  const scrollToPreferences = () => {
    const node = document.getElementById(
      legalPrivacySectionId("preferences"),
    );
    node?.scrollIntoView({ behavior: "smooth", block: "start" });
    node?.focus({ preventScroll: true });
    legalPrivacyAnalytics.preferencesViewed({ isGuest });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SkipLink href={`#${legalPrivacySectionId("content")}`} />
      {isAuthenticated ? (
        <DashboardHeader
          credits={headerCredits}
          displayName={user?.fullName ?? null}
          tier={headerTier}
        />
      ) : (
        <Header />
      )}

      <main
        id={legalPrivacySectionId("content")}
        className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-xl px-md py-xl lg:px-lg"
        tabIndex={-1}
      >
        <Breadcrumb items={breadcrumbItems} />

        <header className="flex flex-col gap-sm">
          <H1>{LEGAL_PRIVACY_COPY.pageTitle}</H1>
          <BodySmall className="max-w-2xl text-muted-foreground">
            {LEGAL_PRIVACY_COPY.pageDescription}
          </BodySmall>
        </header>

        {isError ? (
          <Card variant="default" padding="lg">
            <CardContent className="items-start gap-md">
              <BodySmall className="text-error">
                {LEGAL_PRIVACY_COPY.loadError}
              </BodySmall>
              {onRetry ? (
                <Button type="button" variant="outline" onClick={onRetry}>
                  {LEGAL_PRIVACY_COPY.retry}
                </Button>
              ) : null}
            </CardContent>
          </Card>
        ) : null}

        {!isError ? (
          <>
            <section
              id={legalPrivacySectionId("actions")}
              aria-labelledby="legal-quick-actions-label"
              className="flex flex-wrap gap-sm"
            >
              <Caption id="legal-quick-actions-label" className="sr-only">
                {LEGAL_PRIVACY_COPY.actionsLabel}
              </Caption>
              <Button type="button" variant="outline" asChild>
                <Link href={buildLegalDocumentRoute("terms")}>
                  {LEGAL_PRIVACY_COPY.viewTerms}
                </Link>
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href={buildLegalDocumentRoute("privacy")}>
                  {LEGAL_PRIVACY_COPY.viewPrivacyPolicy}
                </Link>
              </Button>
              <Button type="button" variant="outline" onClick={scrollToPreferences}>
                {LEGAL_PRIVACY_COPY.managePrivacyPreferences}
              </Button>
            </section>

            <LegalDocumentGrid
              activeSlug={unknownDocument ? null : activeSlug}
              disabled={loading}
              loading={loading}
              onView={(slug) => {
                router.push(buildLegalDocumentRoute(slug));
              }}
            />

            <div className="grid grid-cols-1 gap-xl lg:grid-cols-[minmax(12rem,16rem)_minmax(0,1fr)]">
              <LegalNavigation
                activeSlug={
                  unknownDocument ? LEGAL_PRIVACY_DEFAULT_DOCUMENT : activeSlug
                }
                disabled={loading}
              />

              <div className="flex min-w-0 flex-col gap-xl">
                {activeSlug === "terms" && !unknownDocument ? (
                  <TermsVersionCard disabled={loading} loading={loading} />
                ) : null}

                <LegalDocumentViewer
                  slug={activeSlug}
                  document={activeDocument}
                  loading={loading}
                  unknownDocument={unknownDocument}
                />

                <PrivacyPreferenceCard
                  preferences={consent.preferences}
                  isGuest={isGuest}
                  disabled={loading}
                  onPreferencesChange={setPreferences}
                />

                {isAuthenticated ? (
                  <ConsentStatusCard
                    consent={consent}
                    preferences={preferences}
                  />
                ) : null}
              </div>
            </div>
          </>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}
