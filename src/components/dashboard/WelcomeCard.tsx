"use client";

import * as React from "react";

import { MembershipBadge } from "@/components/dashboard/MembershipBadge";
import { UserAvatar } from "@/components/dashboard/UserAvatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { BodySmall, Caption } from "@/components/ui/typography";
import { welcomeCardAnalytics } from "@/lib/analytics/welcome-card-events";
import { buildWelcomeGreeting } from "@/utils/greeting";
import { cn } from "@/utils/cn";

export type WelcomeCardState = "loading" | "success" | "empty" | "error";

export type WelcomeCardTier = "guest" | "free" | "pro" | "business";

export type WelcomeCardMembershipStatus = "active" | "past_due";

export type WelcomeCardProps = {
  state: WelcomeCardState;
  displayName?: string | null;
  avatarUrl?: string | null;
  tier: WelcomeCardTier;
  membershipStatus?: WelcomeCardMembershipStatus | null;
  creditsRemaining?: number | null;
  monthlyLimit?: number | null;
  usageAmount?: number | null;
  errorMessage?: string;
  onRetry?: () => void;
  onCreditsClick?: () => void;
  onBadgeClick?: () => void;
  className?: string;
};

/**
 * COMPONENT-014 — Welcome Card.
 * Greeting · avatar · name · membership badge · credits summary.
 */
export function WelcomeCard({
  state,
  displayName = null,
  avatarUrl = null,
  tier,
  membershipStatus = "active",
  creditsRemaining = null,
  monthlyLimit = null,
  usageAmount = null,
  errorMessage = "We couldn’t load your account summary. Please try again.",
  onRetry,
  onCreditsClick,
  onBadgeClick,
  className,
}: WelcomeCardProps) {
  const impressed = React.useRef(false);
  const [now, setNow] = React.useState(() => new Date());

  React.useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  React.useEffect(() => {
    if (state === "loading" || impressed.current) return;
    impressed.current = true;
    welcomeCardAnalytics.impressed({
      tier,
      creditsRemaining: creditsRemaining ?? undefined,
      state,
    });
  }, [state, tier, creditsRemaining]);

  if (state === "loading") {
    return (
      <section
        className={cn(cardChrome, className)}
        aria-busy="true"
        aria-label="Loading account summary"
      >
        <div className="flex flex-col gap-md sm:flex-row sm:items-start">
          <Skeleton className="size-14 shrink-0 rounded-full sm:size-16" />
          <div className="flex min-w-0 flex-1 flex-col gap-sm">
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="mt-sm h-2 w-full rounded-full" />
          </div>
        </div>
      </section>
    );
  }

  if (state === "error") {
    return (
      <section className={cn(cardChrome, className)} aria-label="Account summary">
        <h2 className="text-body-sm font-bold text-foreground sm:text-body">
          Account summary unavailable
        </h2>
        <p role="alert" className="mt-sm text-info text-error sm:text-body-sm">
          {errorMessage}
        </p>
        {onRetry ? (
          <Button
            type="button"
            variant="outline"
            className="mt-md"
            onClick={() => {
              welcomeCardAnalytics.retryClicked({ tier });
              onRetry();
            }}
          >
            Retry
          </Button>
        ) : null}
      </section>
    );
  }

  const isEmpty = state === "empty";
  const name = displayName?.trim() || null;
  const greeting = buildWelcomeGreeting(name, now);
  const remaining = creditsRemaining ?? 0;
  const limit = monthlyLimit ?? 0;
  const used =
    usageAmount != null
      ? usageAmount
      : limit > 0
        ? Math.max(0, limit - remaining)
        : 0;
  const creditsLabel =
    limit > 0
      ? `${remaining.toLocaleString()} of ${limit.toLocaleString()} credits remaining`
      : `${remaining.toLocaleString()} credits remaining`;

  return (
    <section
      className={cn(cardChrome, className)}
      aria-label={`${greeting}. ${creditsLabel}`}
    >
      <div className="flex flex-col gap-md sm:flex-row sm:items-start">
        <UserAvatar
          displayName={name}
          avatarUrl={isEmpty ? null : avatarUrl}
        />

        <div className="flex min-w-0 flex-1 flex-col gap-sm">
          <h2 className="text-body font-bold text-foreground sm:text-body-lg">
            {greeting}
          </h2>
          {name ? (
            <BodySmall className="font-semibold text-foreground">
              {name}
            </BodySmall>
          ) : (
            <Caption className="text-muted-foreground">
              Complete your profile anytime in Account Settings
            </Caption>
          )}

          <MembershipBadge
            tier={tier}
            status={membershipStatus}
            onClick={
              onBadgeClick
                ? () => {
                    welcomeCardAnalytics.badgeClicked({ tier });
                    onBadgeClick();
                  }
                : undefined
            }
          />

          <div className="mt-sm flex flex-col gap-sm">
            {onCreditsClick ? (
              <button
                type="button"
                className={cn(
                  "text-left focus-visible:outline-none focus-visible:ring-2",
                  "focus-visible:ring-ring focus-visible:ring-offset-2",
                  "focus-visible:ring-offset-background rounded-sm",
                )}
                onClick={() => {
                  welcomeCardAnalytics.creditsClicked({ tier });
                  onCreditsClick();
                }}
                aria-label={creditsLabel}
              >
                <CreditsSummary
                  remaining={remaining}
                  limit={limit}
                  used={used}
                  creditsLabel={creditsLabel}
                />
              </button>
            ) : (
              <CreditsSummary
                remaining={remaining}
                limit={limit}
                used={used}
                creditsLabel={creditsLabel}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function CreditsSummary({
  remaining,
  limit,
  used,
  creditsLabel,
}: {
  remaining: number;
  limit: number;
  used: number;
  creditsLabel: string;
}) {
  return (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-sm">
        <Caption className="font-semibold uppercase tracking-wide text-muted-foreground">
          Credits
        </Caption>
        <p
          className="text-body-sm font-bold tabular-nums text-primary sm:text-body"
          aria-hidden
        >
          {remaining.toLocaleString()}
          {limit > 0 ? (
            <span className="text-info font-regular text-muted-foreground">
              {" "}
              / {limit.toLocaleString()}
            </span>
          ) : null}
        </p>
      </div>
      <span className="sr-only">{creditsLabel}</span>
      {limit > 0 ? (
        <Progress
          value={used}
          max={limit}
          size="sm"
          label={`Monthly usage ${used.toLocaleString()} of ${limit.toLocaleString()}`}
        />
      ) : null}
      {limit > 0 ? (
        <Caption>
          {used.toLocaleString()} used this month
        </Caption>
      ) : null}
    </>
  );
}

const cardChrome =
  "w-full rounded-md border border-border bg-surface p-md shadow-sm sm:p-lg";
