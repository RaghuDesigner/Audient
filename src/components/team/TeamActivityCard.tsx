"use client";

import * as React from "react";
import {
  CheckCircle2,
  FilePlus2,
  Trash2,
  UserMinus,
  UserPlus,
  UserCog,
  CreditCard,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BodySmall, Caption } from "@/components/ui/typography";
import {
  TEAM_ACTIVITY_CARD_COPY,
  TEAM_ACTIVITY_TYPE_LABELS,
  type TeamActivityCardState,
  type TeamActivityType,
} from "@/config/team-activity-card";
import { teamActivityCardAnalytics } from "@/lib/analytics/team-activity-card-events";
import {
  displayTeamActivityUserName,
  resolveTeamActivityCardState,
  type TeamActivityItem,
} from "@/utils/team-activity-card";
import { cn } from "@/utils/cn";

const ACTIVITY_ICONS: Record<TeamActivityType, LucideIcon> = {
  audit_created: FilePlus2,
  audit_completed: CheckCircle2,
  audit_deleted: Trash2,
  member_invited: UserPlus,
  member_removed: UserMinus,
  role_changed: UserCog,
  subscription_updated: CreditCard,
};

export type TeamActivityCardProps = {
  items: TeamActivityItem[];
  state?: TeamActivityCardState;
  onViewAll?: () => void;
  className?: string;
};

/**
 * COMPONENT-055 — Team Activity Card.
 * Mock recent team events — no realtime / no backend.
 */
export function TeamActivityCard({
  items,
  state: stateProp,
  onViewAll,
  className,
}: TeamActivityCardProps) {
  const tracked = React.useRef<"default" | "empty" | null>(null);
  const state = resolveTeamActivityCardState(items, stateProp);
  const loading = state === "loading";
  const empty = state === "empty";

  React.useEffect(() => {
    if (loading) return;
    if (empty) {
      if (tracked.current === "empty") return;
      tracked.current = "empty";
      teamActivityCardAnalytics.emptyViewed();
      return;
    }
    if (tracked.current === "default") return;
    tracked.current = "default";
    teamActivityCardAnalytics.viewed({ itemCount: items.length });
  }, [empty, items.length, loading]);

  return (
    <section
      className={cn(
        "flex w-full flex-col gap-lg rounded-md border border-border bg-surface p-md shadow-sm sm:p-lg",
        className,
      )}
      aria-busy={loading || undefined}
      aria-labelledby="team-activity-card-title"
    >
      <div className="flex flex-wrap items-center justify-between gap-md">
        <h3
          id="team-activity-card-title"
          className="text-h4 font-semibold text-foreground"
        >
          {TEAM_ACTIVITY_CARD_COPY.title}
        </h3>
        {onViewAll && !loading && !empty ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="min-h-11"
            onClick={onViewAll}
          >
            {TEAM_ACTIVITY_CARD_COPY.viewAll}
          </Button>
        ) : null}
      </div>

      {loading ? (
        <>
          <Caption className="sr-only" role="status">
            {TEAM_ACTIVITY_CARD_COPY.loading}
          </Caption>
          <ul className="m-0 flex list-none flex-col gap-md p-0" aria-hidden>
            {Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className="flex gap-md">
                <Skeleton className="size-10 shrink-0 rounded-md" />
                <div className="flex min-w-0 flex-1 flex-col gap-sm">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {empty && !loading ? (
        <div
          className="flex flex-col gap-sm rounded-md border border-border p-md"
          role="status"
        >
          <BodySmall className="font-semibold text-foreground">
            {TEAM_ACTIVITY_CARD_COPY.emptyTitle}
          </BodySmall>
          <BodySmall className="text-muted-foreground">
            {TEAM_ACTIVITY_CARD_COPY.emptyDescription}
          </BodySmall>
        </div>
      ) : null}

      {!loading && !empty ? (
        <ul className="m-0 flex list-none flex-col gap-md p-0">
          {items.map((item) => (
            <ActivityRow key={item.id} item={item} />
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function ActivityRow({ item }: { item: TeamActivityItem }) {
  const Icon = ACTIVITY_ICONS[item.type];
  const user = displayTeamActivityUserName(item.userName);
  const typeLabel = TEAM_ACTIVITY_TYPE_LABELS[item.type];

  return (
    <li className="flex min-h-11 flex-col gap-sm border-b border-border pb-md last:border-0 last:pb-0 sm:flex-row sm:items-start sm:gap-md">
      <span
        className="inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-foreground"
        aria-hidden
      >
        <Icon className="size-5" />
      </span>

      <div className="min-w-0 flex-1">
        <Caption className="font-semibold text-foreground">{user}</Caption>
        <BodySmall className="mt-sm text-foreground">
          <span className="sr-only">{typeLabel}. </span>
          {item.description}
        </BodySmall>
        <Caption className="mt-sm text-muted-foreground sm:hidden">
          <time>{item.timestamp}</time>
        </Caption>
      </div>

      <Caption className="hidden shrink-0 text-muted-foreground sm:block">
        <time>{item.timestamp}</time>
      </Caption>
    </li>
  );
}
