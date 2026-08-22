"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  type NotificationBadgeState,
  type NotificationBadgeSurface,
  type NotificationBadgeVariant,
} from "@/config/notification-badge";
import { notificationBadgeAnalytics } from "@/lib/analytics/notification-badge-events";
import {
  formatUnreadBadgeCount,
  formatUnreadInlineLabel,
  notificationBadgeAccessibleLabel,
} from "@/utils/notification-badge";
import { cn } from "@/utils/cn";

export type NotificationBadgeProps = {
  unreadCount: number;
  state?: NotificationBadgeState;
  variant?: NotificationBadgeVariant;
  href?: string;
  onClick?: () => void;
  surface?: NotificationBadgeSurface;
  disabled?: boolean;
  className?: string;
  id?: string;
};

/**
 * COMPONENT-042 — Bell + unread count (header) or inline count chip.
 * Parent owns mock unread total — no API.
 */
export function NotificationBadge({
  unreadCount,
  state = "default",
  variant = "bell",
  href,
  onClick,
  surface = "header",
  disabled = false,
  className,
  id,
}: NotificationBadgeProps) {
  const router = useRouter();
  const loading = state === "loading";
  const countLabel = loading ? null : formatUnreadBadgeCount(unreadCount);
  const inlineLabel = formatUnreadInlineLabel(unreadCount);
  const accessibleName = notificationBadgeAccessibleLabel(unreadCount, {
    loading,
  });
  const viewed = React.useRef(false);

  React.useEffect(() => {
    if (variant !== "bell" || viewed.current || loading) return;
    viewed.current = true;
    notificationBadgeAnalytics.viewed({ unreadCount, surface });
  }, [loading, surface, unreadCount, variant]);

  const handleActivate = () => {
    if (disabled || loading) return;
    notificationBadgeAnalytics.clicked({ unreadCount, surface });
    onClick?.();
    if (href) {
      router.push(href);
    }
  };

  if (variant === "inline" || variant === "badge_only") {
    if (!inlineLabel) return null;
    return (
      <span
        id={id}
        className={cn("text-body-sm font-semibold text-foreground", className)}
      >
        {inlineLabel}
      </span>
    );
  }

  return (
    <Button
      id={id}
      type="button"
      variant="ghost"
      size="sm"
      className={cn("relative min-h-11 min-w-11 shrink-0 px-sm", className)}
      disabled={disabled}
      isLoading={loading}
      aria-label={accessibleName}
      onClick={handleActivate}
    >
      <Bell className="size-5" aria-hidden="true" />
      {countLabel ? (
        <span
          className={cn(
            "absolute -right-0.5 -top-0.5 flex min-h-4 min-w-4 items-center justify-center",
            "rounded-full bg-error px-1 text-info font-bold leading-none",
            "text-error-foreground",
          )}
          aria-hidden="true"
        >
          {countLabel}
        </span>
      ) : null}
    </Button>
  );
}
