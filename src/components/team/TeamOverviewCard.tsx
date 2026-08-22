"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BodySmall, Caption } from "@/components/ui/typography";
import {
  TEAM_OVERVIEW_CARD_COPY,
  type TeamOverviewCardState,
} from "@/config/team-overview-card";
import { teamOverviewCardAnalytics } from "@/lib/analytics/team-overview-card-events";
import {
  formatTeamOverviewCount,
  formatTeamOverviewCredits,
  type TeamOverviewCreditsRemaining,
} from "@/utils/team-overview-card";
import { cn } from "@/utils/cn";

export type TeamOverviewCardProps = {
  teamName: string;
  plan: string;
  totalMembers: number;
  activeMembers: number;
  pendingInvitations: number;
  totalAudits: number;
  creditsRemaining: TeamOverviewCreditsRemaining;
  state?: TeamOverviewCardState;
  onRetry?: () => void;
  className?: string;
};

/**
 * COMPONENT-051 — Team Overview Card.
 * Business high-level metrics — mock data only; no backend.
 */
export function TeamOverviewCard({
  teamName,
  plan,
  totalMembers,
  activeMembers,
  pendingInvitations,
  totalAudits,
  creditsRemaining,
  state = "default",
  onRetry,
  className,
}: TeamOverviewCardProps) {
  const viewed = React.useRef(false);
  const loading = state === "loading";
  const isError = state === "error";

  React.useEffect(() => {
    if (viewed.current || loading || isError) return;
    viewed.current = true;
    teamOverviewCardAnalytics.viewed();
  }, [isError, loading]);

  return (
    <section
      className={cn(
        "flex w-full flex-col gap-lg rounded-md border border-border bg-surface p-md shadow-sm sm:p-lg",
        className,
      )}
      aria-busy={loading || undefined}
      aria-labelledby="team-overview-card-title"
    >
      <h3
        id="team-overview-card-title"
        className="text-h4 font-semibold text-foreground"
      >
        {TEAM_OVERVIEW_CARD_COPY.title}
      </h3>

      {loading ? (
        <>
          <Caption className="sr-only" role="status">
            {TEAM_OVERVIEW_CARD_COPY.loading}
          </Caption>
          <div className="flex flex-col gap-md">
            <Skeleton className="h-6 w-2/3 max-w-xs" />
            <Skeleton className="h-4 w-24" />
            <div className="grid gap-md sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-md" />
              ))}
            </div>
          </div>
        </>
      ) : null}

      {isError ? (
        <div
          className="flex flex-col gap-md rounded-md border border-border p-md"
          role="alert"
        >
          <BodySmall className="text-foreground">
            {TEAM_OVERVIEW_CARD_COPY.loadError}
          </BodySmall>
          {onRetry ? (
            <Button
              type="button"
              variant="outline"
              className="min-h-11 w-full sm:w-auto"
              onClick={onRetry}
            >
              {TEAM_OVERVIEW_CARD_COPY.retry}
            </Button>
          ) : null}
        </div>
      ) : null}

      {!loading && !isError ? (
        <>
          <div className="flex flex-col gap-sm">
            <Metric
              label={TEAM_OVERVIEW_CARD_COPY.teamName}
              value={teamName}
              emphasize
            />
            <Metric label={TEAM_OVERVIEW_CARD_COPY.plan} value={plan} />
          </div>

          <ul className="m-0 grid list-none grid-cols-1 gap-md p-0 sm:grid-cols-2 lg:grid-cols-3">
            <li>
              <Metric
                label={TEAM_OVERVIEW_CARD_COPY.totalMembers}
                value={formatTeamOverviewCount(totalMembers)}
              />
            </li>
            <li>
              <Metric
                label={TEAM_OVERVIEW_CARD_COPY.activeMembers}
                value={formatTeamOverviewCount(activeMembers)}
              />
            </li>
            <li>
              <Metric
                label={TEAM_OVERVIEW_CARD_COPY.pendingInvitations}
                value={formatTeamOverviewCount(pendingInvitations)}
              />
            </li>
            <li>
              <Metric
                label={TEAM_OVERVIEW_CARD_COPY.totalAudits}
                value={formatTeamOverviewCount(totalAudits)}
              />
            </li>
            <li className="sm:col-span-2 lg:col-span-1">
              <Metric
                label={TEAM_OVERVIEW_CARD_COPY.creditsRemaining}
                value={formatTeamOverviewCredits(creditsRemaining)}
              />
            </li>
          </ul>
        </>
      ) : null}
    </section>
  );
}

function Metric({
  label,
  value,
  emphasize = false,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div className="flex flex-col gap-sm rounded-md border border-border p-md">
      <Caption className="font-semibold text-muted-foreground">{label}</Caption>
      <BodySmall
        className={cn(
          "text-foreground",
          emphasize && "text-body font-semibold sm:text-h4",
        )}
      >
        {value}
      </BodySmall>
    </div>
  );
}
