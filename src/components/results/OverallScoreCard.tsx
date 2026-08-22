"use client";

import * as React from "react";
import { Lock } from "lucide-react";

import { GradeBadge } from "@/components/results/GradeBadge";
import { ScoreRing } from "@/components/results/ScoreRing";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BodySmall, Caption } from "@/components/ui/typography";
import { scoreCardAnalytics } from "@/lib/analytics/score-card-events";
import {
  clampScore,
  gradeFromScore,
  type LetterGrade,
} from "@/utils/score-grade";
import { cn } from "@/utils/cn";

export type OverallScoreCardState =
  | "loading"
  | "success"
  | "error"
  | "locked";

export type OverallScoreAuditType = "image" | "url";

export type OverallScoreTier = "guest" | "free" | "pro" | "business";

export type OverallScoreCardProps = {
  state: OverallScoreCardState;
  score?: number | null;
  grade?: LetterGrade | null;
  summary?: string | null;
  lastUpdated?: string | null;
  auditType?: OverallScoreAuditType | null;
  tier?: OverallScoreTier;
  size?: "default" | "compact";
  errorMessage?: string;
  onRetry?: () => void;
  onUnlock?: () => void;
  lockedLabel?: string;
  auditId?: string;
  className?: string;
};

function formatAuditType(type: OverallScoreAuditType): string {
  return type === "image" ? "Image" : "URL";
}

function formatLastUpdated(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

/**
 * COMPONENT-008 — Overall Score Card.
 * Reusable for Guest / Free / Pro / Business Results and Completion preview.
 */
export function OverallScoreCard({
  state,
  score = null,
  grade = null,
  summary = null,
  lastUpdated = null,
  auditType = null,
  tier = "guest",
  size = "default",
  errorMessage = "We couldn’t load this audit score.",
  onRetry,
  onUnlock,
  lockedLabel = "Upgrade to unlock the full summary",
  auditId,
  className,
}: OverallScoreCardProps) {
  const impressed = React.useRef(false);

  const resolvedScore = score != null ? clampScore(score) : null;
  const resolvedGrade =
    grade ?? (resolvedScore != null ? gradeFromScore(resolvedScore) : null);

  React.useEffect(() => {
    if (state === "error") {
      scoreCardAnalytics.errorShown(auditId, errorMessage);
    }
  }, [state, auditId, errorMessage]);

  React.useEffect(() => {
    if (state !== "success" || resolvedScore == null || impressed.current) {
      return;
    }
    impressed.current = true;
    scoreCardAnalytics.impressed({
      auditId,
      tier,
      score: resolvedScore,
      grade: resolvedGrade ?? undefined,
      auditType: auditType ?? undefined,
    });
  }, [state, resolvedScore, resolvedGrade, auditId, tier, auditType]);

  const accessibleName =
    resolvedScore != null && resolvedGrade
      ? `Overall UX score ${resolvedScore} out of 100, grade ${resolvedGrade}`
      : "Overall UX score";

  if (state === "loading") {
    return (
      <section
        className={cn(cardChrome(size), className)}
        aria-busy="true"
        aria-label="Loading audit score"
      >
        <Caption className="sr-only">Loading audit score</Caption>
        <div className="flex flex-col items-center gap-md sm:flex-row sm:items-start">
          <Skeleton
            className={cn(
              "rounded-full",
              size === "compact" ? "size-24" : "size-32",
            )}
          />
          <div className="flex w-full flex-1 flex-col gap-sm">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </section>
    );
  }

  if (state === "error") {
    return (
      <section className={cn(cardChrome(size), className)} aria-label={accessibleName}>
        <div
          role="alert"
          className="flex flex-col items-center gap-md text-center"
        >
          <BodySmall className="text-error">{errorMessage}</BodySmall>
          {onRetry ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                scoreCardAnalytics.retryClicked(auditId);
                onRetry();
              }}
            >
              Retry
            </Button>
          ) : null}
        </div>
      </section>
    );
  }

  const showSummaryLocked = state === "locked";
  const showSummary =
    state === "success" && Boolean(summary) && !showSummaryLocked;

  return (
    <section
      className={cn(cardChrome(size), className)}
      aria-label={accessibleName}
    >
      <div
        className={cn(
          "flex flex-col items-center gap-md",
          size === "default" && "sm:flex-row sm:items-start",
        )}
      >
        {resolvedScore != null ? (
          <ScoreRing score={resolvedScore} size={size} />
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col items-center gap-sm text-center sm:items-start sm:text-left">
          <div className="flex flex-wrap items-center justify-center gap-sm sm:justify-start">
            {resolvedScore != null ? (
              <p className="text-body-sm font-bold text-foreground sm:text-body">
                Overall UX Score{" "}
                <span className="tabular-nums">{resolvedScore}</span>
              </p>
            ) : null}
            <GradeBadge grade={resolvedGrade} score={resolvedScore} size={size} />
          </div>

          {showSummary && summary ? (
            <BodySmall className="line-clamp-3 text-muted-foreground">
              {summary}
            </BodySmall>
          ) : null}

          {showSummaryLocked ? (
            <div
              className={cn(
                "relative w-full overflow-hidden rounded-md border border-border",
                "bg-muted/40 px-md py-md",
              )}
            >
              <div
                className="select-none blur-sm"
                aria-hidden
              >
                <BodySmall className="text-muted-foreground">
                  Detailed executive summary is available after upgrade.
                </BodySmall>
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-background/40">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    scoreCardAnalytics.unlockClicked(auditId, tier);
                    onUnlock?.();
                  }}
                  aria-label={lockedLabel}
                  iconLeft={<Lock className="size-4" aria-hidden />}
                >
                  Upgrade to unlock
                </Button>
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-center gap-sm sm:justify-start">
            {auditType ? (
              <Caption>
                Audit type:{" "}
                <span className="font-semibold text-foreground">
                  {formatAuditType(auditType)}
                </span>
              </Caption>
            ) : null}
            {lastUpdated ? (
              <Caption>
                Last updated:{" "}
                <span className="font-semibold text-foreground">
                  {formatLastUpdated(lastUpdated)}
                </span>
              </Caption>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function cardChrome(size: "default" | "compact"): string {
  return cn(
    "w-full rounded-md border border-border bg-background shadow-sm",
    size === "compact" ? "p-md" : "p-md sm:p-lg",
  );
}
