"use client";

import { Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BodySmall, Caption } from "@/components/ui/typography";
import {
  RECOMMENDATION_CARD_COPY,
  RECOMMENDATION_CARD_UPGRADE_SOURCE,
} from "@/config/recommendation-card";
import { recommendationCardAnalytics } from "@/lib/analytics/recommendation-card-events";
import { cn } from "@/utils/cn";

const chrome =
  "w-full rounded-md border border-border bg-surface p-md shadow-sm sm:p-lg";

export { chrome as recommendationCardChrome };

export function RecommendationCardLoading({
  className,
}: {
  className?: string;
}) {
  return (
    <article
      className={cn(chrome, className)}
      aria-busy="true"
      aria-label="Loading recommendation"
    >
      <div className="flex flex-col gap-sm">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </article>
  );
}

export function RecommendationCardError({
  recommendationId,
  auditId,
  onRetry,
  className,
}: {
  recommendationId: string;
  auditId?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <article
      className={cn(chrome, className)}
      aria-label="Recommendation unavailable"
    >
      <div className="flex flex-col gap-md">
        <Caption className="text-error">
          {RECOMMENDATION_CARD_COPY.error}
        </Caption>
        {onRetry ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="self-start"
            onClick={() => {
              recommendationCardAnalytics.retryClicked({
                recommendationId,
                auditId,
              });
              onRetry();
            }}
          >
            {RECOMMENDATION_CARD_COPY.retry}
          </Button>
        ) : null}
      </div>
    </article>
  );
}

export function RecommendationCardLocked({
  recommendationId,
  title,
  priorityLabel,
  categoryLabel,
  tier,
  auditId,
  onUpgrade,
  className,
}: {
  recommendationId: string;
  title: string;
  priorityLabel: string;
  categoryLabel: string;
  tier: string;
  auditId?: string;
  onUpgrade?: (source: string) => void;
  className?: string;
}) {
  return (
    <article
      className={cn(chrome, "opacity-90", className)}
      aria-label={`${title}. ${RECOMMENDATION_CARD_COPY.lockedAria}`}
    >
      <div className="flex flex-col gap-md sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-sm">
            <Caption>{categoryLabel}</Caption>
            <Caption className="font-semibold text-foreground">
              {priorityLabel}
            </Caption>
            <Caption className="inline-flex items-center gap-sm text-muted-foreground">
              <Lock className="size-3.5" aria-hidden />
              Locked
            </Caption>
          </div>
          <h3 className="mt-sm text-body-sm font-semibold text-foreground sm:text-body">
            {title}
          </h3>
          <BodySmall className="mt-sm text-muted-foreground">
            {RECOMMENDATION_CARD_COPY.lockedLabel}
          </BodySmall>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 self-start"
          onClick={() => {
            recommendationCardAnalytics.upgradeClicked({
              recommendationId,
              source: RECOMMENDATION_CARD_UPGRADE_SOURCE,
              tier,
              auditId,
            });
            onUpgrade?.(RECOMMENDATION_CARD_UPGRADE_SOURCE);
          }}
        >
          {RECOMMENDATION_CARD_COPY.upgrade}
        </Button>
      </div>
    </article>
  );
}
