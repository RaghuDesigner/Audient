"use client";

import { CreditsBadge } from "@/components/home/credits-badge";
import { Logo } from "@/components/home/logo";
import { NotificationBadge } from "@/components/notifications/NotificationBadge";
import { AuthenticatedProfileDropdown } from "@/components/profile/AuthenticatedProfileDropdown";
import { NOTIFICATIONS_ROUTE } from "@/config/notifications-screen";
import { useMockNotificationUnreadCount } from "@/hooks/use-mock-notification-unread";
import type { UseProfileNavigationOptions } from "@/hooks/use-profile-navigation";
import { cn } from "@/utils/cn";

export type DashboardHeaderProps = {
  credits: number;
  displayName?: string | null;
  tier?: "free" | "pro" | "business";
  onCreditsClick?: () => void;
  profileNavigation?: UseProfileNavigationOptions;
  className?: string;
};

/**
 * SCREEN-008 header — logo · credits · notifications · authenticated profile.
 */
export function DashboardHeader({
  credits,
  displayName = null,
  tier = "free",
  onCreditsClick,
  profileNavigation,
  className,
}: DashboardHeaderProps) {
  const { unreadCount, ready } = useMockNotificationUnreadCount();

  return (
    <header
      className={cn(
        "sticky top-0 z-sticky border-b border-border bg-background shadow-sm",
        "pt-safe",
        className,
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full max-w-[1400px] items-center justify-between",
          "min-h-14 gap-md px-md py-sm lg:px-lg",
        )}
      >
        <Logo href="/dashboard" />
        <div className="flex min-w-0 shrink items-center gap-sm sm:gap-md">
          {onCreditsClick ? (
            <button
              type="button"
              className={cn(
                "rounded-sm",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              )}
              onClick={onCreditsClick}
              aria-label={`Credits: ${credits}. Open billing.`}
            >
              <CreditsBadge value={credits} />
            </button>
          ) : (
            <CreditsBadge value={credits} />
          )}
          <NotificationBadge
            unreadCount={unreadCount}
            state={ready ? "default" : "loading"}
            href={NOTIFICATIONS_ROUTE}
            surface="header"
          />
          <AuthenticatedProfileDropdown
            displayName={displayName}
            tier={tier}
            profileNavigation={profileNavigation}
          />
        </div>
      </div>
    </header>
  );
}
