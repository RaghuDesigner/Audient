"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Caption } from "@/components/ui/typography";
import {
  AUDIT_SUMMARY_ACTION_LABELS,
  AUDIT_SUMMARY_ERROR,
  AUDIT_SUMMARY_REGION_LABEL,
} from "@/config/audit-summary";
import { auditSummaryAnalytics } from "@/lib/analytics/audit-summary-events";
import { cn } from "@/utils/cn";

const chrome =
  "flex w-full flex-col gap-md rounded-md border border-border bg-surface p-md sm:flex-row sm:items-start sm:p-lg";

export { chrome as auditSummaryChrome };

export function AuditSummaryLoading({ className }: { className?: string }) {
  return (
    <section
      className={cn(chrome, className)}
      aria-busy="true"
      aria-label={`Loading ${AUDIT_SUMMARY_REGION_LABEL}`}
    >
      <Skeleton className="h-24 w-32 shrink-0 rounded-md sm:h-28 sm:w-40" />
      <div className="flex min-w-0 flex-1 flex-col gap-sm">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="mt-sm h-9 w-48" />
      </div>
    </section>
  );
}

export function AuditSummaryError({
  auditId,
  onRetry,
  className,
}: {
  auditId?: string | null;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <section
      className={cn(chrome, className)}
      aria-label={AUDIT_SUMMARY_REGION_LABEL}
    >
      <div className="flex w-full flex-col gap-md">
        <Caption className="text-error">{AUDIT_SUMMARY_ERROR.message}</Caption>
        {onRetry ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              auditSummaryAnalytics.retryClicked({
                auditId: auditId ?? undefined,
              });
              onRetry();
            }}
          >
            {AUDIT_SUMMARY_ACTION_LABELS.retry}
          </Button>
        ) : null}
      </div>
    </section>
  );
}
