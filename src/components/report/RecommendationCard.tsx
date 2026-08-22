"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { RecommendationCardDetails } from "@/components/report/RecommendationCardDetails";
import {
  recommendationCardChrome,
  RecommendationCardError,
  RecommendationCardLoading,
  RecommendationCardLocked,
} from "@/components/report/RecommendationCardStates";
import { SeverityBadge } from "@/components/results/SeverityBadge";
import { BodySmall, Caption } from "@/components/ui/typography";
import {
  type RecommendationCardEffort,
  type RecommendationCardImpact,
  type RecommendationCardState,
  type RecommendationCardTier,
  type RecommendationCardVariant,
} from "@/config/recommendation-card";
import { recommendationCardAnalytics } from "@/lib/analytics/recommendation-card-events";
import { CATEGORY_LABELS, type AuditCategoryId } from "@/utils/category-score";
import {
  recommendationCardAccessibleName,
  recommendationCardAllowsToggle,
  recommendationCardToggleLabel,
  recommendationEffortLabel,
  recommendationPriorityLabel,
  shouldShowRecommendationCollaboration,
  type RecommendationCardConfidenceInput,
  type RecommendationCardPriorityInput,
} from "@/utils/recommendation-card";
import type { FindingSeverityInput } from "@/utils/finding-severity";
import { cn } from "@/utils/cn";

export type RecommendationCardProps = {
  recommendationId: string;
  title: string;
  description: string;
  category: AuditCategoryId;
  severity: FindingSeverityInput;
  priority: RecommendationCardPriorityInput;
  estimatedImpact?: RecommendationCardImpact | null;
  effort?: RecommendationCardEffort | null;
  aiConfidence?: RecommendationCardConfidenceInput;
  findingId?: string | null;
  learnMoreHref?: string | null;
  showBeforeAfterPlaceholder?: boolean;
  state?: RecommendationCardState;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onToggleExpand?: (expanded: boolean) => void;
  onUpgrade?: (source: string) => void;
  onLearnMore?: () => void;
  onRetry?: () => void;
  tier?: RecommendationCardTier;
  collaborationPlaceholder?: boolean;
  variant?: RecommendationCardVariant;
  auditId?: string;
  className?: string;
};

/**
 * COMPONENT-029 — Recommendation Card.
 * Severity · priority · expand/collapse · locked teaser (no body leak).
 */
export function RecommendationCard({
  recommendationId,
  title,
  description,
  category,
  severity,
  priority,
  estimatedImpact = null,
  effort = null,
  aiConfidence = null,
  findingId = null,
  learnMoreHref = null,
  showBeforeAfterPlaceholder = true,
  state = "default",
  expanded: expandedProp,
  defaultExpanded = false,
  onToggleExpand,
  onUpgrade,
  onLearnMore,
  onRetry,
  tier = "free",
  collaborationPlaceholder,
  variant = "report",
  auditId,
  className,
}: RecommendationCardProps) {
  const detailsId = React.useId();
  const impressed = React.useRef(false);
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultExpanded);
  const locked = state === "locked";
  const allowsToggle = recommendationCardAllowsToggle(variant, locked);
  const isControlled = expandedProp !== undefined;
  const expanded = locked
    ? false
    : allowsToggle
      ? isControlled
        ? Boolean(expandedProp)
        : uncontrolledOpen
      : true;
  const priorityLabel = recommendationPriorityLabel(priority);
  const categoryLabel = CATEGORY_LABELS[category];
  const effortLabel = recommendationEffortLabel(effort);

  React.useEffect(() => {
    if (state === "loading" || state === "error" || impressed.current) return;
    impressed.current = true;
    recommendationCardAnalytics.viewed({
      recommendationId,
      severity: String(severity),
      priority: priorityLabel,
      tier,
      auditId,
    });
  }, [state, recommendationId, severity, priorityLabel, tier, auditId]);

  const setExpanded = (next: boolean) => {
    if (!allowsToggle) return;
    if (!isControlled) setUncontrolledOpen(next);
    onToggleExpand?.(next);
    if (next) {
      recommendationCardAnalytics.expanded({
        recommendationId,
        auditId,
        tier,
      });
    } else {
      recommendationCardAnalytics.collapsed({ recommendationId, auditId });
    }
  };

  if (state === "loading") {
    return <RecommendationCardLoading className={className} />;
  }

  if (state === "error") {
    return (
      <RecommendationCardError
        recommendationId={recommendationId}
        auditId={auditId}
        onRetry={onRetry}
        className={className}
      />
    );
  }

  if (locked) {
    return (
      <RecommendationCardLocked
        recommendationId={recommendationId}
        title={title}
        priorityLabel={priorityLabel}
        categoryLabel={categoryLabel}
        tier={tier}
        auditId={auditId}
        onUpgrade={onUpgrade}
        className={className}
      />
    );
  }

  return (
    <article
      className={cn(recommendationCardChrome, className)}
      aria-label={recommendationCardAccessibleName({
        title,
        severity,
        priority,
      })}
      aria-labelledby={`${detailsId}-title`}
    >
      <div className="flex flex-col gap-sm">
        <div className="flex flex-wrap items-center gap-sm">
          <SeverityBadge severity={severity} size="compact" />
          <Caption className="font-semibold text-foreground">
            {priorityLabel}
          </Caption>
          {effortLabel ? (
            <Caption className="text-muted-foreground">{effortLabel}</Caption>
          ) : null}
          <Caption>{categoryLabel}</Caption>
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
          <RecommendationCardDetails
            recommendationId={recommendationId}
            detailsId={detailsId}
            estimatedImpact={estimatedImpact}
            effort={effort}
            aiConfidence={aiConfidence}
            findingId={findingId}
            learnMoreHref={learnMoreHref}
            showBeforeAfterPlaceholder={showBeforeAfterPlaceholder}
            showCollaboration={shouldShowRecommendationCollaboration(
              tier,
              collaborationPlaceholder,
            )}
            auditId={auditId}
            onLearnMore={onLearnMore}
          />
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
            {recommendationCardToggleLabel(expanded)}
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
