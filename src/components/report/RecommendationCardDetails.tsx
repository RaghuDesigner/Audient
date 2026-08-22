"use client";

import { MessageSquarePlus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BodySmall, Caption } from "@/components/ui/typography";
import { RECOMMENDATION_CARD_COPY } from "@/config/recommendation-card";
import { recommendationCardAnalytics } from "@/lib/analytics/recommendation-card-events";
import {
  formatRecommendationConfidence,
  RECOMMENDATION_CARD_EFFORT_BADGE,
  RECOMMENDATION_CARD_IMPACT_BADGE,
  recommendationEffortLabel,
  recommendationImpactLabel,
  recommendationLearnMoreLabel,
  type RecommendationCardConfidenceInput,
} from "@/utils/recommendation-card";
import type {
  RecommendationCardEffort,
  RecommendationCardImpact,
} from "@/config/recommendation-card";
import { cn } from "@/utils/cn";

export type RecommendationCardDetailsProps = {
  recommendationId: string;
  detailsId: string;
  estimatedImpact?: RecommendationCardImpact | null;
  effort?: RecommendationCardEffort | null;
  aiConfidence?: RecommendationCardConfidenceInput;
  findingId?: string | null;
  learnMoreHref?: string | null;
  showBeforeAfterPlaceholder?: boolean;
  showCollaboration?: boolean;
  auditId?: string;
  onLearnMore?: () => void;
};

/**
 * COMPONENT-029 companion — expanded meta, placeholders, Learn More.
 */
export function RecommendationCardDetails({
  recommendationId,
  detailsId,
  estimatedImpact = null,
  effort = null,
  aiConfidence = null,
  findingId = null,
  learnMoreHref = null,
  showBeforeAfterPlaceholder = true,
  showCollaboration = false,
  auditId,
  onLearnMore,
}: RecommendationCardDetailsProps) {
  const impactLabel = recommendationImpactLabel(estimatedImpact);
  const effortLabel = recommendationEffortLabel(effort);
  const confidenceLabel = formatRecommendationConfidence(aiConfidence);
  const learnMoreLabel = recommendationLearnMoreLabel(learnMoreHref);

  return (
    <div id={detailsId} className="flex flex-col gap-md border-t border-border pt-md">
      <div className="flex flex-wrap items-center gap-sm">
        {estimatedImpact && impactLabel ? (
          <span
            className={cn(
              "inline-flex min-h-6 items-center rounded-md px-sm text-info font-semibold",
              RECOMMENDATION_CARD_IMPACT_BADGE[estimatedImpact],
            )}
          >
            {impactLabel}
          </span>
        ) : null}
        {effort && effortLabel ? (
          <span
            className={cn(
              "inline-flex min-h-6 items-center rounded-md px-sm text-info font-semibold",
              RECOMMENDATION_CARD_EFFORT_BADGE[effort],
            )}
          >
            {effortLabel}
          </span>
        ) : null}
        {confidenceLabel ? (
          <Badge variant="info" size="sm" shape="rounded">
            {confidenceLabel}
          </Badge>
        ) : null}
      </div>

      {findingId ? (
        <Caption className="text-muted-foreground">
          {RECOMMENDATION_CARD_COPY.linkedFinding}:{" "}
          <span className="font-semibold text-foreground">{findingId}</span>
        </Caption>
      ) : null}

      {showBeforeAfterPlaceholder ? (
        <div className="flex flex-col gap-sm" aria-label={RECOMMENDATION_CARD_COPY.beforeAfterUnavailable}>
          <Caption className="font-semibold text-foreground">
            {RECOMMENDATION_CARD_COPY.beforeAfter}
          </Caption>
          <div className="grid gap-sm sm:grid-cols-2">
            <PlaceholderSlot label={RECOMMENDATION_CARD_COPY.beforePlaceholder} />
            <PlaceholderSlot label={RECOMMENDATION_CARD_COPY.afterPlaceholder} />
          </div>
          <Caption className="text-muted-foreground">
            {RECOMMENDATION_CARD_COPY.beforeAfterUnavailable}
          </Caption>
        </div>
      ) : null}

      <div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={!learnMoreHref}
          aria-label={learnMoreLabel}
          onClick={() => {
            recommendationCardAnalytics.learnMoreClicked({
              recommendationId,
              available: Boolean(learnMoreHref),
              auditId,
            });
            onLearnMore?.();
          }}
        >
          {learnMoreLabel}
        </Button>
      </div>

      {showCollaboration ? (
        <div
          className="flex items-start gap-sm rounded-md border border-dashed border-border bg-muted/40 p-md"
          aria-label={RECOMMENDATION_CARD_COPY.collaborationHint}
        >
          <MessageSquarePlus
            className="mt-0.5 size-4 shrink-0 text-muted-foreground"
            aria-hidden
          />
          <div>
            <Caption className="font-semibold text-foreground">
              {RECOMMENDATION_CARD_COPY.collaboration}
            </Caption>
            <BodySmall className="mt-sm text-muted-foreground">
              {RECOMMENDATION_CARD_COPY.collaborationHint}
            </BodySmall>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function PlaceholderSlot({ label }: { label: string }) {
  return (
    <div
      className="flex min-h-24 items-center justify-center rounded-md border border-dashed border-border bg-muted/50"
      aria-hidden
    >
      <Caption className="text-muted-foreground">{label}</Caption>
    </div>
  );
}
