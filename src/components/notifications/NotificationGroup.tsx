"use client";

import { NotificationItem } from "@/components/notifications/NotificationItem";
import { NotificationItemLoading } from "@/components/notifications/NotificationItemChrome";
import { Badge } from "@/components/ui/badge";
import { BodySmall } from "@/components/ui/typography";
import {
  NOTIFICATION_GROUP_COPY,
  NOTIFICATION_GROUP_LABELS,
  NOTIFICATION_GROUP_SKELETON_COUNT,
  type NotificationGroupKey,
  type NotificationGroupState,
  type NotificationGroupVariant,
} from "@/config/notification-group";
import type {
  NotificationItemSurface,
  NotificationItemType,
  NotificationItemVariant,
} from "@/config/notification-item";
import type { MockNotificationItem } from "@/data/mock-notification-item";
import { cn } from "@/utils/cn";

export type NotificationGroupItem = MockNotificationItem;

export type NotificationGroupProps = {
  groupKey: NotificationGroupKey;
  /** Override default Today / Yesterday / … label. */
  heading?: string;
  items: readonly NotificationGroupItem[];
  /** Defaults to items.length. */
  count?: number;
  state?: NotificationGroupState;
  variant?: NotificationGroupVariant;
  showCount?: boolean;
  surface?: NotificationItemSurface;
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
  headingLevel?: "h2" | "h3" | "h4";
};

/**
 * COMPONENT-039 — Notification Group.
 * Date bucket section composing NotificationItem — mock only.
 * Empty populated groups return null (omit section).
 */
export function NotificationGroup({
  groupKey,
  heading,
  items,
  count,
  state = "populated",
  variant = "default",
  showCount = true,
  surface = "list",
  onMarkRead,
  onActivate,
  onActionClick,
  className,
  headingLevel = "h3",
}: NotificationGroupProps) {
  const isLoading = state === "loading";
  const itemCount = count ?? items.length;

  if (!isLoading && itemCount === 0) {
    return null;
  }

  const label = heading ?? NOTIFICATION_GROUP_LABELS[groupKey];
  const itemVariant: NotificationItemVariant =
    variant === "compact" ? "compact" : "default";
  const countText = NOTIFICATION_GROUP_COPY.count(itemCount);
  const headingId = `notification-group-${groupKey}`;
  const HeadingTag = headingLevel;

  return (
    <section
      className={cn("flex w-full flex-col gap-md", className)}
      aria-labelledby={headingId}
      aria-busy={isLoading || undefined}
      aria-label={
        isLoading
          ? `${label}. ${NOTIFICATION_GROUP_COPY.loadingLabel}`
          : `${label}, ${countText}`
      }
    >
      <div className="flex flex-wrap items-center gap-sm">
        <HeadingTag
          id={headingId}
          className={cn(
            "font-semibold text-foreground",
            headingLevel === "h2" ? "text-h3" : "text-h4",
          )}
        >
          {label}
        </HeadingTag>
        {showCount && !isLoading ? (
          <Badge variant="neutral" size="sm" shape="rounded">
            <span className="sr-only">{countText}</span>
            <span aria-hidden>
              {NOTIFICATION_GROUP_COPY.countShort(itemCount)}
            </span>
          </Badge>
        ) : null}
        {isLoading ? (
          <BodySmall className="text-muted-foreground">
            {NOTIFICATION_GROUP_COPY.loadingLabel}
          </BodySmall>
        ) : null}
      </div>

      <ul className="m-0 flex list-none flex-col gap-sm p-0">
        {isLoading
          ? Array.from({ length: NOTIFICATION_GROUP_SKELETON_COUNT }, (_, i) => (
              <li key={`${groupKey}-skel-${i}`}>
                <NotificationItemLoading />
              </li>
            ))
          : items.map((item) => (
              <li key={item.id}>
                <NotificationItem
                  id={item.id}
                  type={item.type}
                  title={item.title}
                  description={item.description}
                  timestamp={item.timestamp}
                  read={item.read}
                  href={item.href}
                  actionLabel={item.actionLabel}
                  variant={itemVariant}
                  surface={surface}
                  onMarkRead={onMarkRead}
                  onActivate={onActivate}
                  onActionClick={onActionClick}
                />
              </li>
            ))}
      </ul>
    </section>
  );
}
