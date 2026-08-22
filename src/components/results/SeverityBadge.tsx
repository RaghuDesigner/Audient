"use client";

import {
  FINDING_SEVERITY_BADGE,
  FINDING_SEVERITY_LABELS,
  normalizeFindingSeverity,
  type FindingSeverityInput,
} from "@/utils/finding-severity";
import { cn } from "@/utils/cn";

export type SeverityBadgeProps = {
  severity: FindingSeverityInput;
  className?: string;
  size?: "default" | "compact";
};

/**
 * Shared severity chip — text + token color (never color-only).
 */
export function SeverityBadge({
  severity,
  className,
  size = "default",
}: SeverityBadgeProps) {
  const normalized = normalizeFindingSeverity(severity);
  const label = FINDING_SEVERITY_LABELS[normalized];

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-md font-semibold",
        size === "compact"
          ? "min-h-6 px-sm text-info"
          : "min-h-7 px-sm text-info sm:text-body-sm",
        FINDING_SEVERITY_BADGE[normalized],
        className,
      )}
    >
      {label}
    </span>
  );
}
