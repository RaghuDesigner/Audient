"use client";

import * as React from "react";

import { FaqAccordion } from "@/components/common/FaqAccordion";
import { ContactSupportCard } from "@/components/help/ContactSupportCard";
import { ContactSupportModal } from "@/components/help/ContactSupportModal";
import { HelpSearch } from "@/components/help/HelpSearch";
import { HelpSupportCategories } from "@/components/help/HelpSupportCategories";
import { HelpSupportRequestsSection } from "@/components/help/HelpSupportRequestsSection";
import { SupportTicketDetailModal } from "@/components/help/SupportTicketDetailModal";
import { Header } from "@/components/home/header";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Footer } from "@/components/layout/footer";
import { SkipLink } from "@/components/layout/skip-link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BodySmall, H1 } from "@/components/ui/typography";
import {
  HELP_SUPPORT_COPY,
  HELP_SUPPORT_DASHBOARD_ROUTE,
  HELP_SUPPORT_ROUTE,
  type HelpSupportCategory,
  type HelpSupportScreenState,
} from "@/config/help-support-screen";
import type {
  HelpSupportTicket,
  MockHelpSupportBundle,
} from "@/data/mock-help-support";
import { useAuth } from "@/hooks/use-auth";
import { helpSupportAnalytics } from "@/lib/analytics/help-support-events";
import {
  useHeaderCredits,
  useHeaderPlanTier,
} from "@/hooks/use-app-state";
import { useLoginModalControls } from "@/providers/login-modal-provider";
import {
  helpSupportSectionId,
  sortHelpTicketsNewestFirst,
  type HelpSearchResult,
} from "@/utils/help-support-screen";

export type HelpSupportScreenProps = {
  data: MockHelpSupportBundle;
  screenState?: HelpSupportScreenState;
  onRetry?: () => void;
};

/**
 * SCREEN-023 — Help & Support.
 * Mock help center — search, categories, FAQ, contact, tickets.
 */
export function HelpSupportScreen({
  data,
  screenState = data.state,
  onRetry,
}: HelpSupportScreenProps) {
  const { isGuest, user } = useAuth();
  const headerTier = useHeaderPlanTier();
  const headerCredits = useHeaderCredits();
  const { openLogin } = useLoginModalControls();
  const viewed = React.useRef(false);
  const prevFaqExpanded = React.useRef<string[]>([]);

  const [searchResults, setSearchResults] = React.useState<HelpSearchResult>(() => ({
    articles: data.articles,
    faqs: data.faqs,
    totalCount: data.articles.length + data.faqs.length,
  }));
  const [selectedCategory, setSelectedCategory] =
    React.useState<HelpSupportCategory | null>(null);
  const [contactOpen, setContactOpen] = React.useState(false);
  const [selectedTicket, setSelectedTicket] =
    React.useState<HelpSupportTicket | null>(null);
  const [localTickets, setLocalTickets] = React.useState(data.tickets);

  const loading = screenState === "loading";
  const isError = screenState === "error";
  const isAuthenticated = !isGuest && Boolean(user);

  React.useEffect(() => {
    setLocalTickets(data.tickets);
  }, [data.tickets]);

  const sortedTickets = React.useMemo(
    () => sortHelpTicketsNewestFirst(localTickets),
    [localTickets],
  );

  React.useEffect(() => {
    if (viewed.current || loading || isError) return;
    viewed.current = true;
    helpSupportAnalytics.viewed({
      tier: user?.planTier ?? "GUEST",
      isGuest,
    });
  }, [isError, isGuest, loading, user?.planTier]);


  const handleContactSupport = () => {
    helpSupportAnalytics.contactClicked({ isGuest });
    if (isGuest) {
      openLogin({ source: "marketing_cta", nextPath: HELP_SUPPORT_ROUTE });
      return;
    }
    setContactOpen(true);
  };

  const handleTicketView = (ticket: HelpSupportTicket) => {
    helpSupportAnalytics.ticketViewed({
      ticketId: ticket.ticketId,
      status: ticket.status,
    });
    setSelectedTicket(ticket);
  };

  const handleContactSubmitted = (payload: {
    subject: string;
    message: string;
  }) => {
    const nextTicket: HelpSupportTicket = {
      id: `ticket-local-${Date.now()}`,
      ticketId: `AUD-${1000 + localTickets.length + 1}`,
      subject: payload.subject,
      message: payload.message,
      submittedAt: new Date().toISOString(),
      status: "open",
    };
    setLocalTickets((prev) => [nextTicket, ...prev]);
  };

  const breadcrumbItems = isAuthenticated
    ? [
        {
          label: HELP_SUPPORT_COPY.breadcrumbDashboard,
          href: HELP_SUPPORT_DASHBOARD_ROUTE,
        },
        {
          label: HELP_SUPPORT_COPY.breadcrumbCurrent,
          current: true,
        },
      ]
    : [{ label: HELP_SUPPORT_COPY.breadcrumbCurrent, current: true }];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SkipLink href={`#${helpSupportSectionId("main")}`} />
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
        id={helpSupportSectionId("main")}
        className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-xl px-md py-xl lg:px-lg"
      >
        <Breadcrumb items={breadcrumbItems} />

        <header className="flex flex-col gap-sm">
          <H1>{HELP_SUPPORT_COPY.pageTitle}</H1>
          <BodySmall className="max-w-2xl text-muted-foreground">
            {HELP_SUPPORT_COPY.pageDescription}
          </BodySmall>
        </header>

        {isError ? (
          <Card variant="default" padding="lg">
            <CardContent className="items-start gap-md">
              <BodySmall className="text-error">{HELP_SUPPORT_COPY.loadError}</BodySmall>
              {onRetry ? (
                <Button type="button" variant="outline" onClick={onRetry}>
                  {HELP_SUPPORT_COPY.retry}
                </Button>
              ) : null}
            </CardContent>
          </Card>
        ) : null}

        {!isError ? (
          <>
            <HelpSearch
              articles={data.articles}
              faqs={data.faqs}
              faqCategories={data.faqCategories}
              category={selectedCategory}
              guest={isGuest}
              loading={loading}
              onContactSupport={handleContactSupport}
              onResultsChange={setSearchResults}
            />

            {loading ? (
              <div className="grid grid-cols-1 gap-sm sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-20 rounded-lg" />
                ))}
              </div>
            ) : (
              <HelpSupportCategories
                articles={data.articles}
                faqs={data.faqs}
                faqCategories={data.faqCategories}
                guest={isGuest}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                disabled={loading}
              />
            )}

            {loading ? (
              <div className="flex flex-col gap-sm">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            ) : (
              <FaqAccordion
                module="help"
                items={searchResults.faqs}
                heading={HELP_SUPPORT_COPY.faqHeading}
                onExpandedChange={(ids) => {
                  const opened = ids.find(
                    (id) => !prevFaqExpanded.current.includes(id),
                  );
                  if (opened) {
                    helpSupportAnalytics.faqOpened({ faqId: opened });
                  }
                  prevFaqExpanded.current = ids;
                }}
              />
            )}

            <ContactSupportCard
              onContactSupport={handleContactSupport}
              disabled={loading}
            />

            {isAuthenticated ? (
              loading ? (
                <div className="flex flex-col gap-sm">
                  <Skeleton className="h-6 w-56" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : (
                <HelpSupportRequestsSection
                  tickets={sortedTickets}
                  onContactSupport={handleContactSupport}
                  onViewTicket={handleTicketView}
                />
              )
            ) : null}
          </>
        ) : null}
      </main>

      <Footer />

      <ContactSupportModal
        open={contactOpen}
        onOpenChange={setContactOpen}
        onSubmitted={handleContactSubmitted}
      />

      <SupportTicketDetailModal
        ticket={selectedTicket}
        open={selectedTicket != null}
        onOpenChange={(open) => {
          if (!open) setSelectedTicket(null);
        }}
      />
    </div>
  );
}
