"use client";

import * as React from "react";
import { CheckCircle2, ChevronDown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BodySmall, Caption } from "@/components/ui/typography";
import {
  STRENGTH_CARD_COPY,
  type StrengthCardCategory,
  type StrengthCardImpactLevel,
  type StrengthCardState,
  type StrengthCardVariant,
} from "@/config/strength-card";
import { strengthCardAnalytics } from "@/lib/analytics/strength-card-events";
import {
  formatStrengthCardConfidence,
  strengthCardAccessibleName,
  strengthCardAllowsToggle,
  strengthCardCategoryLabel,
  STRENGTH_CARD_IMPACT_BADGE,
  strengthCardImpactLabel,
  strengthCardScreenshotAlt,
  strengthCardToggleLabel,
  type StrengthCardConfidenceInput,
} from "@/utils/strength-card";
import { cn } from "@/utils/cn";

export type StrengthCardProps = {
  strengthId: string;
  title: string;
  description: string;
  category: StrengthCardCategory;
  aiConfidence?: StrengthCardConfidenceInput;
  impactLevel?: StrengthCardImpactLevel | null;
  screenshotUrl?: string | null;
  screenshotAlt?: string | null;
  state?: StrengthCardState;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onToggleExpand?: (expanded: boolean) => void;
  onRetry?: () => void;
  variant?: StrengthCardVariant;
  auditId?: string;
  className?: string;
};

/**
 * COMPONENT-028 — Strength Card.
 * Positive finding: title · category · impact · expandable details · optional screenshot.
 */
export function StrengthCard({
  strengthId,
  title,
  description,
  category,
  aiConfidence = null,
  impactLevel = null,
  screenshotUrl = null,
  screenshotAlt = null,
  state = "default",
  expanded: expandedProp,
  defaultExpanded = false,
  onToggleExpand,
  onRetry,
  variant = "report",
  auditId,
  className,
}: StrengthCardProps) {
  const detailsId = React.useId();
  const impressed = React.useRef(false);
  const [uncontrolledOpen, setUncontrolledOpen] =
    React.useState(defaultExpanded);
  const allowsToggle = strengthCardAllowsToggle(variant);
  const isControlled = expandedProp !== undefined;
  const expanded = allowsToggle
    ? isControlled
      ? Boolean(expandedProp)
      : uncontrolledOpen
    : true;

  React.useEffect(() => {
    if (state !== "default" || impressed.current) return;
    impressed.current = true;
    strengthCardAnalytics.impressed({
      strengthId,
      category,
      impactLevel: impactLevel ?? undefined,
      auditId,
    });
  }, [state, strengthId, category, impactLevel, auditId]);

  const setExpanded = (next: boolean) => {
    if (!allowsToggle) return;
    if (!isControlled) setUncontrolledOpen(next);
    onToggleExpand?.(next);
    if (next) {
      strengthCardAnalytics.expanded({
        strengthId,
        category,
        impactLevel: impactLevel ?? undefined,
        auditId,
      });
    } else {
      strengthCardAnalytics.collapsed({ strengthId, category, auditId });
    }
  };

  if (state === "loading") {
    return (
      <article
        className={cn(chrome, className)}
        aria-busy="true"
        aria-label="Loading strength"
      >
        <Skeleton className="size-11 shrink-0 rounded-md" />
        <div className="flex min-w-0 flex-1 flex-col gap-sm">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </article>
    );
  }

  if (state === "error") {
    return (
      <article className={cn(chrome, className)} aria-label="Strength unavailable">
        <div className="flex min-w-0 flex-1 flex-col gap-md">
          <Caption className="text-error">{STRENGTH_CARD_COPY.error}</Caption>
          {onRetry ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="self-start"
              onClick={() => {
                strengthCardAnalytics.retryClicked({ strengthId, auditId });
                onRetry();
              }}
            >
              {STRENGTH_CARD_COPY.retry}
            </Button>
          ) : null}
        </div>
      </article>
    );
  }

  const impactLabel = strengthCardImpactLabel(impactLevel);
  const confidenceLabel = formatStrengthCardConfidence(aiConfidence);

  return (
    <article
      className={cn(chrome, className)}
      aria-label={strengthCardAccessibleName({ title, category, impactLevel })}
      aria-labelledby={`${detailsId}-title`}
    >
      <span
        className="mt-0.5 inline-flex size-11 shrink-0 items-center justify-center rounded-md bg-success/15 text-success"
        aria-hidden
      >
        <CheckCircle2 className="size-5" />
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-sm">
        <div className="flex flex-wrap items-center gap-sm">
          <Caption>{strengthCardCategoryLabel(category)}</Caption>
          {impactLevel && impactLabel ? (
            <span
              className={cn(
                "inline-flex min-h-6 items-center rounded-md px-sm text-info font-semibold",
                STRENGTH_CARD_IMPACT_BADGE[impactLevel],
              )}
            >
              {impactLabel}
            </span>
          ) : null}
        </div>

        <h3
          id={`${detailsId}-title`}
          className="text-body-sm font-semibold text-foreground sm:text-body"
        >
          {title}
        </h3>

        <BodySmall
          className={cn("text-muted-foreground", !expanded && "line-clamp-2")}
        >
          {description}
        </BodySmall>

        {expanded ? (
          <div
            id={detailsId}
            className="flex flex-col gap-md border-t border-border pt-md"
          >
            {confidenceLabel ? (
              <Badge variant="success" size="sm" shape="rounded">
                {confidenceLabel}
              </Badge>
            ) : null}
            {screenshotUrl ? (
              <div className="relative w-full max-w-md overflow-hidden rounded-md border border-border bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element -- mock / signed preview URLs */}
                <img
                  src={screenshotUrl}
                  alt={strengthCardScreenshotAlt(title, screenshotAlt)}
                  className="h-auto w-full object-cover"
                />
              </div>
            ) : null}
          </div>
        ) : null}

        {allowsToggle ? (
          <button
            type="button"
            className={cn(
              "inline-flex items-center gap-sm self-start rounded-sm text-caption font-semibold text-primary",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            )}
            aria-expanded={expanded}
            aria-controls={detailsId}
            onClick={() => setExpanded(!expanded)}
          >
            {strengthCardToggleLabel(expanded)}
            <ChevronDown
              className={cn(
                "size-4 transition-transform duration-fast",
                expanded && "rotate-180",
              )}
              aria-hidden
            />
          </button>
        ) : null}
      </div>
    </article>
  );
}

const chrome =
  "flex w-full gap-md rounded-md border border-border bg-surface p-md shadow-sm sm:p-lg";
