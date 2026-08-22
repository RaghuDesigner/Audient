/**
 * Recent Audit Card helpers — COMPONENT-016.
 */

export const RECENT_AUDIT_STATUSES = [
  "loading",
  "processing",
  "completed",
  "failed",
] as const;

export type RecentAuditStatus = (typeof RECENT_AUDIT_STATUSES)[number];

export type RecentAuditPlanUsed = "free" | "pro" | "business";

export const RECENT_AUDIT_STATUS_LABELS: Record<
  Exclude<RecentAuditStatus, "loading">,
  string
> = {
  processing: "Processing",
  completed: "Completed",
  failed: "Failed",
};

/** Token classes — always pair with visible label text. */
export const RECENT_AUDIT_STATUS_BADGE: Record<
  Exclude<RecentAuditStatus, "loading">,
  string
> = {
  processing: "bg-secondary/15 text-secondary",
  completed: "bg-success/15 text-success",
  failed: "bg-error/15 text-error",
};

export const RECENT_AUDIT_PLAN_LABELS: Record<RecentAuditPlanUsed, string> = {
  free: "Free",
  pro: "Pro",
  business: "Business",
};

export function defaultRecentAuditCta(
  status: Exclude<RecentAuditStatus, "loading">,
): string {
  switch (status) {
    case "completed":
      return "Open Report";
    case "processing":
      return "View Progress";
    case "failed":
      return "View Details";
  }
}

export function formatAuditDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function recentAuditAccessibleName(input: {
  websiteName: string;
  status: Exclude<RecentAuditStatus, "loading">;
  score?: number | null;
}): string {
  const statusLabel = RECENT_AUDIT_STATUS_LABELS[input.status];
  if (input.score != null && input.status === "completed") {
    return `${input.websiteName}, ${statusLabel}, score ${input.score}`;
  }
  return `${input.websiteName}, ${statusLabel}`;
}
