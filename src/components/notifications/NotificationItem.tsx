"use client";

import * as React from "react";

import {
  NotificationItemIcon,
  NotificationItemLoading,
} from "@/components/notifications/NotificationItemChrome";
import { Button } from "@/components/ui/button";
import { BodySmall, Caption } from "@/components/ui/typography";
import {
  NOTIFICATION_ITEM_COPY,
  type NotificationItemSurface,
  type NotificationItemType,
  type NotificationItemVariant,
} from "@/config/notification-item";
import { notificationItemAnalytics } from "@/lib/analytics/notification-item-events";
import {
  buildNotificationItemA11yLabel,
  formatNotificationAbsoluteTime,
  formatNotificationRelativeTime,
  parseNotificationItemType,
  resolveNotificationItemHref,
  shouldClampNotificationDescription,
} from "@/utils/notification-item";
import { cn } from "@/utils/cn";

export type NotificationItemProps = {
  id: string;
  type: NotificationItemType | string;
  title: string;
  description?: string | null;
  timestamp?: string | Date | null;
  read: boolean;
  href?: string | null;
  actionLabel?: string | null;
  variant?: NotificationItemVariant;
  surface?: NotificationItemSurface;
  state?: "default" | "loading";
  onMarkRead?: (id: string) => void;
  onActivate?: (payload: {
    id: string;
    type: NotificationItemType;
    href: string | null;
    wasUnread: boolean;
  }) => void;
  onActionClick?: (payload: {
    id: string;
    type: NotificationItemType;
    href: string | null;
  }) => void;
  className?: string;
};

/**
 * COMPONENT-038 — Notification Item.
 * Reusable list / dropdown / preview row. Parent owns mark-read + navigation.
 */
export function NotificationItem({
  id,
  type: typeProp,
  title,
  description = null,
  timestamp = null,
  read,
  href = null,
  actionLabel = null,
  variant = "default",
  surface = "list",
  state = "default",
  onMarkRead,
  onActivate,
  onActionClick,
  className,
}: NotificationItemProps) {
  const viewed = React.useRef(false);
  const type = parseNotificationItemType(String(typeProp));
  const resolvedHref = resolveNotificationItemHref(type, href);
  const clamp = shouldClampNotificationDescription(variant);
  const compact = variant === "compact" || variant === "preview";
  const a11yLabel = buildNotificationItemA11yLabel({
    type,
    title,
    description,
    timestamp,
    read,
  });
  const absolute =
    timestamp != null ? formatNotificationAbsoluteTime(timestamp) : null;
  const dateTime =
    timestamp != null && !Number.isNaN(new Date(timestamp).getTime())
      ? new Date(timestamp).toISOString()
      : undefined;

  React.useEffect(() => {
    if (state === "loading" || viewed.current) return;
    viewed.current = true;
    notificationItemAnalytics.viewed({
      notificationId: id,
      type,
      surface,
      wasUnread: !read,
    });
  }, [id, read, state, surface, type]);

  if (state === "loading") {
    return <NotificationItemLoading className={className} />;
  }

  const activate = () => {
    const wasUnread = !read;
    if (wasUnread) {
      onMarkRead?.(id);
      notificationItemAnalytics.markedRead({
        notificationId: id,
        type,
        surface,
      });
    }
    notificationItemAnalytics.clicked({
      notificationId: id,
      type,
      surface,
      wasUnread,
    });
    onActivate?.({ id, type, href: resolvedHref, wasUnread });
  };

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    const wasUnread = !read;
    if (wasUnread) {
      onMarkRead?.(id);
      notificationItemAnalytics.markedRead({
        notificationId: id,
        type,
        surface,
      });
    }
    notificationItemAnalytics.clicked({
      notificationId: id,
      type,
      surface,
      wasUnread,
    });
    if (onActionClick) {
      onActionClick({ id, type, href: resolvedHref });
      return;
    }
    onActivate?.({ id, type, href: resolvedHref, wasUnread });
  };

  return (
    <div
      className={cn(
        "group relative flex w-full gap-md rounded-md border border-border bg-surface",
        "transition-colors duration-fast hover:bg-muted/40",
        !read && "bg-primary/5",
        compact ? "p-md" : "p-md sm:p-lg",
        className,
      )}
    >
      <button
        type="button"
        className={cn(
          "absolute inset-0 z-0 min-h-11 rounded-md text-left",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        )}
        onClick={activate}
        aria-label={a11yLabel}
      />

      <NotificationItemIcon type={type} />

      <div className="relative z-10 flex min-w-0 flex-1 flex-col gap-sm pointer-events-none">
        <div className="flex items-start justify-between gap-sm">
          <div className="flex min-w-0 items-center gap-sm">
            {!read ? (
              <span
                className="size-2 shrink-0 rounded-full bg-primary"
                aria-hidden
              />
            ) : null}
            <BodySmall
              className={cn(
                "min-w-0 truncate text-foreground",
                !read ? "font-semibold" : "font-medium",
              )}
            >
              {title}
            </BodySmall>
            {!read ? (
              <span className="sr-only">{NOTIFICATION_ITEM_COPY.unread}</span>
            ) : null}
          </div>
          {timestamp != null ? (
            <Caption
              className="shrink-0 text-muted-foreground"
              title={absolute ?? undefined}
            >
              <time dateTime={dateTime}>
                {formatNotificationRelativeTime(timestamp)}
              </time>
            </Caption>
          ) : null}
        </div>

        {description ? (
          <BodySmall
            className={cn("text-muted-foreground", clamp && "line-clamp-2")}
          >
            {description}
          </BodySmall>
        ) : null}

        {actionLabel ? (
          <div className="pointer-events-auto pt-sm">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAction}
            >
              {actionLabel}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
