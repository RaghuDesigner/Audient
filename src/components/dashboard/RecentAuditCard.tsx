"use client";

import * as React from "react";
import { ImageIcon } from "lucide-react";

import { AuditStatusBadge } from "@/components/dashboard/AuditStatusBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Caption } from "@/components/ui/typography";
import { recentAuditAnalytics } from "@/lib/analytics/recent-audit-events";
import {
  defaultRecentAuditCta,
  formatAuditDate,
  recentAuditAccessibleName,
  RECENT_AUDIT_PLAN_LABELS,
  type RecentAuditPlanUsed,
  type RecentAuditStatus,
} from "@/utils/recent-audit";
import { cn } from "@/utils/cn";

export type RecentAuditCardProps = {
  auditId: string;
  websiteName: string;
  thumbnailUrl?: string | null;
  thumbnailAlt?: string | null;
  score?: number | null;
  auditDate: string | Date;
  status: RecentAuditStatus;
  planUsed?: RecentAuditPlanUsed | null;
  ctaLabel?: string;
  onOpen?: (auditId: string, status: Exclude<RecentAuditStatus, "loading">) => void;
  compact?: boolean;
  className?: string;
};

/**
 * COMPONENT-016 — Recent Audit Card.
 * Website · thumbnail · score · date · status · plan · CTA.
 */
export function RecentAuditCard({
  auditId,
  websiteName,
  thumbnailUrl = null,
  thumbnailAlt = null,
  score = null,
  auditDate,
  status,
  planUsed = null,
  ctaLabel,
  onOpen,
  compact = false,
  className,
}: RecentAuditCardProps) {
  const impressed = React.useRef(false);

  React.useEffect(() => {
    if (status === "loading" || impressed.current) return;
    impressed.current = true;
    recentAuditAnalytics.impressed({
      auditId,
      status,
      score: score ?? undefined,
    });
  }, [auditId, status, score]);

  if (status === "loading") {
    return (
      <article
        className={cn(cardChrome(compact), className)}
        aria-busy="true"
        aria-label="Loading recent audit"
      >
        <Skeleton
          className={cn(
            "shrink-0 rounded-md",
            compact ? "size-14" : "h-20 w-28 sm:h-24 sm:w-32",
          )}
        />
        <div className="flex min-w-0 flex-1 flex-col gap-sm">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="mt-sm h-11 w-32" />
        </div>
      </article>
    );
  }

  const dateLabel = formatAuditDate(auditDate);
  const label = recentAuditAccessibleName({ websiteName, status, score });
  const buttonLabel = ctaLabel ?? defaultRecentAuditCta(status);
  const destination =
    status === "completed"
      ? "report"
      : status === "processing"
        ? "processing"
        : "failure";
  const showScore = status === "completed" && score != null;
  const scoreDisplay =
    status === "processing" ? "—" : showScore ? String(score) : null;

  const handleOpen = () => {
    recentAuditAnalytics.opened({ auditId, status, destination });
    onOpen?.(auditId, status);
  };

  return (
    <article
      className={cn(cardChrome(compact), className)}
      aria-label={label}
    >
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-md border border-border bg-muted",
          compact ? "size-14" : "h-20 w-28 sm:h-24 sm:w-32",
        )}
      >
        {thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- mock / signed preview URLs
          <img
            src={thumbnailUrl}
            alt={thumbnailAlt ?? ""}
            className="size-full object-cover"
          />
        ) : (
          <span
            className="flex size-full items-center justify-center text-muted-foreground"
            aria-hidden
          >
            <ImageIcon className="size-6" />
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-sm">
        <div className="flex flex-wrap items-start justify-between gap-sm">
          <div className="min-w-0 flex-1">
            <h3
              className={cn(
                "truncate font-semibold text-foreground",
                compact
                  ? "text-info sm:text-body-sm"
                  : "text-body-sm sm:text-body",
              )}
            >
              {websiteName}
            </h3>
            <Caption className="mt-sm text-muted-foreground">
              {dateLabel}
            </Caption>
          </div>
          <div className="flex flex-col items-end gap-sm">
            <AuditStatusBadge status={status} />
            {scoreDisplay != null ? (
              <p
                className="text-body-sm font-bold tabular-nums text-foreground"
                aria-label={
                  showScore
                    ? `Overall score ${score} out of 100`
                    : "Score pending"
                }
              >
                {scoreDisplay}
                {showScore ? (
                  <span className="text-info font-regular text-muted-foreground">
                    {" "}
                    / 100
                  </span>
                ) : null}
              </p>
            ) : null}
          </div>
        </div>

        {planUsed ? (
          <Caption>
            Plan used:{" "}
            <span className="font-semibold text-foreground">
              {RECENT_AUDIT_PLAN_LABELS[planUsed]}
            </span>
          </Caption>
        ) : null}

        <div className="mt-sm">
          <Button
            type="button"
            variant={status === "completed" ? "primary" : "outline"}
            size={compact ? "sm" : "md"}
            className={
              status === "completed" ? "text-primary-foreground" : undefined
            }
            onClick={handleOpen}
          >
            {buttonLabel}
          </Button>
        </div>
      </div>
    </article>
  );
}

function cardChrome(compact: boolean): string {
  return cn(
    "flex w-full flex-col gap-md rounded-md border border-border bg-surface p-md shadow-sm sm:flex-row sm:items-center",
    compact ? "sm:p-md" : "sm:p-lg",
  );
}
