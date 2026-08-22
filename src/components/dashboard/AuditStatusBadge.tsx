"use client";

import {
  RECENT_AUDIT_STATUS_BADGE,
  RECENT_AUDIT_STATUS_LABELS,
  type RecentAuditStatus,
} from "@/utils/recent-audit";
import { cn } from "@/utils/cn";

export type AuditStatusBadgeProps = {
  status: Exclude<RecentAuditStatus, "loading">;
  className?: string;
};

/**
 * Audit status chip — text + token color (never color-only).
 */
export function AuditStatusBadge({
  status,
  className,
}: AuditStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center rounded-md px-sm",
        "text-info font-semibold",
        RECENT_AUDIT_STATUS_BADGE[status],
        className,
      )}
    >
      {RECENT_AUDIT_STATUS_LABELS[status]}
    </span>
  );
}
