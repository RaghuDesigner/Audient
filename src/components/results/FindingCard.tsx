"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { SeverityBadge } from "@/components/results/SeverityBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { BodySmall, Caption } from "@/components/ui/typography";
import { findingCardAnalytics } from "@/lib/analytics/finding-card-events";
import { CATEGORY_LABELS, type AuditCategoryId } from "@/utils/category-score";
import {
  confidenceLabel,
  evidenceTypeLabel,
} from "@/utils/audit-evidence-labels";
import type { FindingSeverityInput } from "@/utils/finding-severity";
import { cn } from "@/utils/cn";

export type FindingCardState = "loading" | "success";

export type FindingCardTier = "guest" | "free" | "pro" | "business";

export type FindingCardProps = {
  findingId: string;
  severity: FindingSeverityInput;
  title: string;
  description: string;
  thumbnailUrl?: string | null;
  thumbnailAlt?: string | null;
  affectedPage?: string | null;
  category: AuditCategoryId;
  recommendationPreview?: string | null;
  priority?: string | null;
  evidenceType?: string | null;
  confidence?: string | null;
  userImpact?: string | null;
  state?: FindingCardState;
  /** Controlled expand; omit for uncontrolled default collapsed. */
  expanded?: boolean;
  defaultExpanded?: boolean;
  onToggleExpand?: (expanded: boolean) => void;
  onThumbnailClick?: () => void;
  tier?: FindingCardTier;
  auditId?: string;
  className?: string;
};

/**
 * COMPONENT-010 — Finding Card.
 * Severity · title · description · optional thumbnail · expandable details.
 * Mock-friendly; no data fetching.
 */
export function FindingCard({
  findingId,
  severity,
  title,
  description,
  thumbnailUrl = null,
  thumbnailAlt = null,
  affectedPage = null,
  category,
  recommendationPreview = null,
  priority = null,
  evidenceType = null,
  confidence = null,
  userImpact = null,
  state = "success",
  expanded: expandedProp,
  defaultExpanded = false,
  onToggleExpand,
  onThumbnailClick,
  tier = "guest",
  auditId,
  className,
}: FindingCardProps) {
  const detailsId = React.useId();
  const impressed = React.useRef(false);
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultExpanded);
  const isControlled = expandedProp !== undefined;
  const expanded = isControlled ? Boolean(expandedProp) : uncontrolledOpen;

  React.useEffect(() => {
    if (state !== "success" || impressed.current) return;
    impressed.current = true;
    findingCardAnalytics.impressed({
      auditId,
      findingId,
      severity: String(severity),
      category,
      tier,
    });
  }, [state, auditId, findingId, severity, category, tier]);

  const setExpanded = (next: boolean) => {
    if (!isControlled) setUncontrolledOpen(next);
    onToggleExpand?.(next);
    if (next) {
      findingCardAnalytics.expanded(findingId, auditId);
    } else {
      findingCardAnalytics.collapsed(findingId, auditId);
    }
  };

  if (state === "loading") {
    return (
      <article
        className={cn(cardChrome, className)}
        aria-busy="true"
        aria-label="Loading finding"
      >
        <div className="flex gap-md">
          <Skeleton className="size-16 shrink-0 rounded-md sm:size-20" />
          <div className="flex min-w-0 flex-1 flex-col gap-sm">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </article>
    );
  }

  const categoryLabel = CATEGORY_LABELS[category];
  const evidenceLabel = evidenceTypeLabel(evidenceType);
  const confLabel = confidenceLabel(confidence);

  return (
    <article
      className={cn(cardChrome, className)}
      aria-labelledby={`${detailsId}-title`}
    >
      <div className="flex flex-col gap-md sm:flex-row sm:items-start">
        {thumbnailUrl ? (
          <button
            type="button"
            className={cn(
              "relative shrink-0 overflow-hidden rounded-md border border-border",
              "size-16 sm:size-20",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            )}
            onClick={() => {
              findingCardAnalytics.thumbnailClicked(findingId, auditId);
              onThumbnailClick?.();
            }}
            aria-label={
              thumbnailAlt
                ? `View screenshot: ${thumbnailAlt}`
                : `View screenshot for ${title}`
            }
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- mock / signed preview URLs */}
            <img
              src={thumbnailUrl}
              alt={thumbnailAlt ?? ""}
              className="size-full object-cover"
            />
          </button>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col gap-sm">
          <div className="flex flex-wrap items-center gap-sm">
            <SeverityBadge severity={severity} />
            {priority ? (
              <Caption className="font-semibold text-foreground">
                Priority {priority}
              </Caption>
            ) : null}
            <Caption>{categoryLabel}</Caption>
            {evidenceLabel ? (
              <Caption className="rounded-sm bg-muted px-sm py-xs text-muted-foreground">
                {evidenceLabel}
              </Caption>
            ) : null}
            {confLabel ? (
              <Caption className="text-muted-foreground">{confLabel}</Caption>
            ) : null}
          </div>

          <h3
            id={`${detailsId}-title`}
            className="text-body-sm font-semibold text-foreground sm:text-body"
          >
            {title}
          </h3>

          <BodySmall
            className={cn(
              "text-muted-foreground",
              !expanded && "line-clamp-2",
            )}
          >
            {description}
          </BodySmall>

          {expanded ? (
            <div
              id={detailsId}
              className="flex flex-col gap-sm border-t border-border pt-md"
            >
              {affectedPage ? (
                <Caption>
                  Evidence:{" "}
                  <span className="font-semibold text-foreground">
                    {affectedPage}
                  </span>
                </Caption>
              ) : null}
              {userImpact ? (
                <div>
                  <Caption className="font-semibold text-foreground">
                    Why it matters
                  </Caption>
                  <BodySmall className="mt-sm text-muted-foreground">
                    {userImpact}
                  </BodySmall>
                </div>
              ) : null}
              {recommendationPreview ? (
                <div>
                  <Caption className="font-semibold text-foreground">
                    AI recommendation
                  </Caption>
                  <BodySmall className="mt-sm text-muted-foreground">
                    {recommendationPreview}
                  </BodySmall>
                </div>
              ) : null}
            </div>
          ) : null}

          <div>
            <button
              type="button"
              className={cn(
                "inline-flex items-center gap-sm rounded-sm text-caption font-semibold text-primary",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              )}
              aria-expanded={expanded}
              aria-controls={detailsId}
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? "Show less" : "Show details"}
              <ChevronDown
                className={cn(
                  "size-4 transition-transform duration-fast",
                  expanded && "rotate-180",
                )}
                aria-hidden
              />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

const cardChrome =
  "w-full rounded-md border border-border bg-background p-md shadow-sm";
