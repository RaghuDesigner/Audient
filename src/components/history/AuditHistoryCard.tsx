"use client";

import * as React from "react";
import { ImageIcon } from "lucide-react";

import { AuditStatusBadge } from "@/components/dashboard/AuditStatusBadge";
import { AuditHistoryCardActions } from "@/components/history/AuditHistoryCardActions";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Caption } from "@/components/ui/typography";
import type { AuditHistoryType } from "@/config/audit-history";
import {
  AUDIT_HISTORY_CARD_TYPE_LABELS,
  type AuditHistoryCardStatus,
  type AuditHistoryCardTier,
} from "@/config/audit-history-card";
import { auditHistoryCardAnalytics } from "@/lib/analytics/audit-history-card-events";
import {
  auditHistoryCardAccessibleName,
  auditHistoryCardOpenLabel,
  auditHistoryCardScoreDisplay,
  formatAuditHistoryUrl,
  resolveAuditHistoryCardActions,
  truncateAuditHistoryUrl,
} from "@/utils/audit-history-card";
import {
  formatAuditDate,
  RECENT_AUDIT_PLAN_LABELS,
  type RecentAuditPlanUsed,
} from "@/utils/recent-audit";
import { cn } from "@/utils/cn";

export type AuditHistoryCardProps = {
  auditId: string;
  websiteName: string;
  websiteUrl?: string | null;
  thumbnailUrl?: string | null;
  thumbnailAlt?: string | null;
  auditDate: string | Date;
  score?: number | null;
  status: AuditHistoryCardStatus;
  planUsed?: RecentAuditPlanUsed | null;
  auditType: AuditHistoryType;
  tier: AuditHistoryCardTier;
  pdfAvailable?: boolean;
  onOpenReport: (
    auditId: string,
    status: Exclude<AuditHistoryCardStatus, "loading">,
  ) => void;
  onDuplicate: (auditId: string) => void;
  onDelete: (auditId: string) => void;
  onDownloadPdf?: (auditId: string) => void;
  onCompare?: (auditId: string) => void;
  onUpgrade?: (source: string) => void;
  className?: string;
};

/**
 * COMPONENT-024 — Audit History Card.
 * History row: identity · status/score · Open · secondary (tier-gated).
 */
export function AuditHistoryCard({
  auditId,
  websiteName,
  websiteUrl = null,
  thumbnailUrl = null,
  thumbnailAlt = null,
  auditDate,
  score = null,
  status,
  planUsed = null,
  auditType,
  tier,
  pdfAvailable = false,
  onOpenReport,
  onDuplicate,
  onDelete,
  onDownloadPdf,
  onCompare,
  onUpgrade,
  className,
}: AuditHistoryCardProps) {
  const impressed = React.useRef(false);

  React.useEffect(() => {
    if (status === "loading" || impressed.current) return;
    impressed.current = true;
    auditHistoryCardAnalytics.impressed({ auditId, status, tier });
  }, [auditId, status, tier]);

  if (status === "loading") {
    return (
      <article
        className={cn(chrome, className)}
        aria-busy="true"
        aria-label="Loading audit"
      >
        <Skeleton className="h-20 w-28 shrink-0 rounded-md sm:h-24 sm:w-32" />
        <div className="flex min-w-0 flex-1 flex-col gap-sm">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="mt-sm h-11 w-36" />
        </div>
      </article>
    );
  }

  const dateLabel = formatAuditDate(auditDate);
  const urlDisplay = formatAuditHistoryUrl(websiteUrl);
  const scoreDisplay = auditHistoryCardScoreDisplay(status, score);
  const showScore = status === "completed" && score != null;
  const openLabel = auditHistoryCardOpenLabel(status);
  const accessibleName = auditHistoryCardAccessibleName({
    websiteName,
    websiteUrl,
    status,
    score,
    auditType,
    auditDate,
  });
  const actions = resolveAuditHistoryCardActions({
    status,
    tier,
    pdfAvailable,
  });
  const destination =
    status === "completed"
      ? "report"
      : status === "processing"
        ? "processing"
        : "failure";

  return (
    <article className={cn(chrome, className)} aria-label={accessibleName}>
      <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-md border border-border bg-muted sm:h-24 sm:w-32">
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
            <h3 className="truncate text-body-sm font-semibold text-foreground sm:text-body">
              {websiteName}
            </h3>
            {urlDisplay ? (
              <Caption
                className="mt-sm truncate text-muted-foreground"
                title={websiteUrl ?? urlDisplay}
              >
                {truncateAuditHistoryUrl(urlDisplay)}
              </Caption>
            ) : null}
            <Caption className="mt-sm text-muted-foreground">
              {dateLabel}
              {" · "}
              {AUDIT_HISTORY_CARD_TYPE_LABELS[auditType]}
              {planUsed ? ` · ${RECENT_AUDIT_PLAN_LABELS[planUsed]}` : null}
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

        <div className="mt-sm flex flex-wrap items-center gap-sm">
          <Button
            type="button"
            variant={status === "completed" ? "primary" : "outline"}
            size="sm"
            className={
              status === "completed" ? "text-primary-foreground" : undefined
            }
            onClick={() => {
              auditHistoryCardAnalytics.openReport({
                auditId,
                status,
                destination,
              });
              onOpenReport(auditId, status);
            }}
          >
            {openLabel}
          </Button>

          <AuditHistoryCardActions
            auditId={auditId}
            auditType={auditType}
            tier={tier}
            actions={actions}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
            onDownloadPdf={onDownloadPdf}
            onCompare={onCompare}
            onUpgrade={onUpgrade}
          />
        </div>
      </div>
    </article>
  );
}

const chrome =
  "flex w-full flex-col gap-md rounded-md border border-border bg-surface p-md shadow-sm transition-colors hover:border-border/80 sm:flex-row sm:items-center sm:p-lg";
