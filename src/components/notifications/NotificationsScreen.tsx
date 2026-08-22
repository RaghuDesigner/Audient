"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Pagination } from "@/components/common/Pagination";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Footer } from "@/components/layout/footer";
import { SkipLink } from "@/components/layout/skip-link";
import { MarkAllReadButton } from "@/components/notifications/MarkAllReadButton";
import { NotificationEmptyState } from "@/components/notifications/NotificationEmptyState";
import { NotificationFilter } from "@/components/notifications/NotificationFilter";
import { NotificationGroup } from "@/components/notifications/NotificationGroup";
import { NotificationItemLoading } from "@/components/notifications/NotificationItemChrome";
import { Button } from "@/components/ui/button";
import { BodySmall, H1 } from "@/components/ui/typography";
import {
  NOTIFICATION_FILTER_DEFAULT,
  type NotificationFilterValue,
} from "@/config/notification-filter";
import {
  NOTIFICATIONS_COPY,
  NOTIFICATIONS_DASHBOARD_ROUTE,
  NOTIFICATIONS_PAGE_SIZE,
  type NotificationsScreenState,
} from "@/config/notifications-screen";
import { useAuth } from "@/hooks/use-auth";
import {
  useHeaderCredits,
  useHeaderPlanTier,
} from "@/hooks/use-app-state";
import { useMediaQuery } from "@/hooks/use-media-query";
import { notificationsScreenAnalytics } from "@/lib/analytics/notifications-screen-events";
import { useNotificationInbox } from "@/providers/notification-inbox-provider";
import { formatUnreadInlineLabel } from "@/utils/notification-badge";
import { isTrustedHostedInvoiceUrl } from "@/utils/hosted-invoice-url";
import { filterNotificationsByFilter } from "@/utils/notification-filter";
import {
  groupNotificationsByDate,
  sortNotificationsNewestFirst,
} from "@/utils/notification-group";
import { clampPage, totalPages as computeTotalPages } from "@/utils/pagination";
import { cn } from "@/utils/cn";

export type NotificationsScreenProps = {
  screenState: NotificationsScreenState;
  onRetry?: () => void;
};

/**
 * SCREEN-018 — Notifications.
 * Mock inbox: filters, date groups, mark-read, mark-all — no API.
 */
export function NotificationsScreen({
  screenState,
  onRetry,
}: NotificationsScreenProps) {
  const router = useRouter();
  const { user } = useAuth();
  const headerTier = useHeaderPlanTier();
  const headerCredits = useHeaderCredits();
  const { items, unreadCount, markRead, markAllRead } = useNotificationInbox();
  const isMdUp = useMediaQuery("(min-width: 768px)");
  const viewed = React.useRef(false);

  const [filter, setFilter] = React.useState<NotificationFilterValue>(
    NOTIFICATION_FILTER_DEFAULT,
  );
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(NOTIFICATIONS_PAGE_SIZE);

  const loading = screenState === "loading";
  const isError = screenState === "error";

  const filtered = React.useMemo(
    () => filterNotificationsByFilter(items, filter),
    [filter, items],
  );

  const sorted = React.useMemo(
    () => sortNotificationsNewestFirst(filtered),
    [filtered],
  );

  const pages = computeTotalPages(sorted.length, pageSize);
  const safePage = clampPage(page, pages);

  const pageItems = React.useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [pageSize, safePage, sorted]);

  const groups = React.useMemo(
    () => groupNotificationsByDate(pageItems),
    [pageItems],
  );

  React.useEffect(() => {
    setPage(1);
  }, [filter]);

  React.useEffect(() => {
    if (viewed.current || loading || isError) return;
    viewed.current = true;
    notificationsScreenAnalytics.viewed({
      catalogCount: items.length,
      unreadCount,
    });
  }, [isError, items.length, loading, unreadCount]);


  const unreadLabel = formatUnreadInlineLabel(unreadCount);
  const groupVariant = isMdUp ? "default" : "compact";

  const showDefaultEmpty =
    !loading && !isError && items.length === 0;
  const showFilteredEmpty =
    !loading &&
    !isError &&
    items.length > 0 &&
    filtered.length === 0 &&
    filter !== "all";

  const handleActivate = (payload: { href: string | null }) => {
    if (!payload.href) return;
    if (isTrustedHostedInvoiceUrl(payload.href)) {
      window.open(payload.href, "_blank", "noopener,noreferrer");
      return;
    }
    router.push(payload.href);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SkipLink />
      <DashboardHeader
        credits={headerCredits}
        displayName={user?.fullName ?? null}
        tier={headerTier}
      />
      <main
        id="main-content"
        className={cn(
          "mx-auto flex w-full max-w-6xl flex-1 flex-col gap-lg",
          "px-md py-lg lg:px-lg",
        )}
        aria-busy={loading || undefined}
      >
        <Breadcrumb
          items={[
            {
              label: NOTIFICATIONS_COPY.breadcrumbDashboard,
              href: NOTIFICATIONS_DASHBOARD_ROUTE,
            },
            {
              label: NOTIFICATIONS_COPY.breadcrumbCurrent,
              current: true,
            },
          ]}
        />

        <div className="flex flex-col gap-md sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-sm">
            <H1 className="text-foreground">{NOTIFICATIONS_COPY.pageTitle}</H1>
            {unreadLabel ? (
              <BodySmall
                className="font-semibold text-foreground"
                aria-live="polite"
              >
                {unreadLabel}
              </BodySmall>
            ) : null}
          </div>
          {!loading && !isError ? (
            <MarkAllReadButton
              unreadCount={unreadCount}
              onMarkAllRead={markAllRead}
              fullWidth
              className="sm:self-start"
            />
          ) : null}
        </div>

        {isError ? (
          <section
            className="flex flex-col items-center gap-md rounded-md border border-border bg-surface p-lg text-center"
            role="alert"
          >
            <BodySmall className="text-foreground">
              {NOTIFICATIONS_COPY.loadError}
            </BodySmall>
            <div className="flex w-full flex-col gap-sm sm:w-auto sm:flex-row">
              {onRetry ? (
                <Button
                  type="button"
                  variant="primary"
                  fullWidth
                  className="text-primary-foreground sm:w-auto"
                  onClick={onRetry}
                >
                  {NOTIFICATIONS_COPY.retry}
                </Button>
              ) : null}
              <Button
                type="button"
                variant="outline"
                fullWidth
                className="sm:w-auto"
                onClick={() => router.push(NOTIFICATIONS_DASHBOARD_ROUTE)}
              >
                {NOTIFICATIONS_COPY.backToDashboard}
              </Button>
            </div>
          </section>
        ) : null}

        {loading ? (
          <div className="flex flex-col gap-lg" aria-busy="true">
            <div className="h-11 w-full max-w-xl animate-pulse rounded-md bg-muted" />
            <ul className="m-0 flex list-none flex-col gap-sm p-0">
              {Array.from({ length: 4 }, (_, i) => (
                <li key={`notif-skel-${i}`}>
                  <NotificationItemLoading />
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {!loading && !isError ? (
          <>
            <NotificationFilter
              value={filter}
              onChange={setFilter}
              items={items}
              showCounts
            />

            {showDefaultEmpty ? (
              <NotificationEmptyState
                variant="default"
                primaryLabel={NOTIFICATIONS_COPY.backToDashboard}
                onPrimaryAction={() =>
                  router.push(NOTIFICATIONS_DASHBOARD_ROUTE)
                }
              />
            ) : null}

            {showFilteredEmpty ? (
              <NotificationEmptyState
                variant="filtered"
                onClearFilter={() => setFilter(NOTIFICATION_FILTER_DEFAULT)}
              />
            ) : null}

            {!showDefaultEmpty && !showFilteredEmpty ? (
              <div className="flex flex-col gap-lg">
                {groups.map((group) => (
                  <NotificationGroup
                    key={group.groupKey}
                    groupKey={group.groupKey}
                    heading={group.heading}
                    items={group.items}
                    count={group.count}
                    variant={groupVariant}
                    surface="list"
                    onMarkRead={markRead}
                    onActivate={(payload) =>
                      handleActivate({ href: payload.href })
                    }
                    onActionClick={(payload) =>
                      handleActivate({ href: payload.href })
                    }
                  />
                ))}

                <Pagination
                  currentPage={safePage}
                  totalPages={pages}
                  totalItems={sorted.length}
                  pageSize={pageSize}
                  module="notifications"
                  ariaLabel={NOTIFICATIONS_COPY.paginationNav}
                  onPageChange={setPage}
                  onPageSizeChange={(size) => {
                    setPageSize(size);
                    setPage(1);
                  }}
                />
              </div>
            ) : null}
          </>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}
