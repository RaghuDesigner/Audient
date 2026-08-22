"use client";

import * as React from "react";
import {
  Accessibility,
  Eye,
  Gauge,
  Lock,
  Minus,
  Palette,
  Search,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { BodySmall, Caption } from "@/components/ui/typography";
import { categoryScoreAnalytics } from "@/lib/analytics/category-score-events";
import {
  CATEGORY_BAR_FILL,
  CATEGORY_LABELS,
  CATEGORY_STATUS_TEXT,
  categoryBandFromScore,
  statusFromCategoryScore,
  type AuditCategoryId,
} from "@/utils/category-score";
import { clampScore } from "@/utils/score-grade";
import { cn } from "@/utils/cn";

export type CategoryScoreCardState = "loading" | "success" | "locked";

export type CategoryScoreTrend = "up" | "down" | "flat";

export type CategoryScoreTier = "guest" | "free" | "pro" | "business";

export type CategoryScoreCardProps = {
  category: AuditCategoryId;
  score?: number | null;
  status?: string | null;
  /** Decorative category icon; defaults to a built-in map. */
  icon?: React.ReactNode;
  /** Convenience alias for `state="locked"`. */
  locked?: boolean;
  state?: CategoryScoreCardState;
  trend?: CategoryScoreTrend | null;
  trendDelta?: number | null;
  tier?: CategoryScoreTier;
  auditId?: string;
  size?: "default" | "compact";
  onUnlock?: () => void;
  className?: string;
};

const DEFAULT_ICONS: Record<AuditCategoryId, LucideIcon> = {
  accessibility: Accessibility,
  usability: Eye,
  performance: Gauge,
  seo: Search,
  visual_design: Palette,
  trust: ShieldCheck,
};

/**
 * COMPONENT-009 — Category Score Card.
 * Compact tile: icon, name, score, status, progress bar; loading / success / locked.
 */
export function CategoryScoreCard({
  category,
  score = null,
  status = null,
  icon,
  locked = false,
  state: stateProp,
  trend = null,
  trendDelta = null,
  tier = "guest",
  auditId,
  size = "default",
  onUnlock,
  className,
}: CategoryScoreCardProps) {
  const state: CategoryScoreCardState =
    stateProp ?? (locked ? "locked" : "success");
  const label = CATEGORY_LABELS[category];
  const impressed = React.useRef(false);

  const resolvedScore = score != null ? clampScore(score) : null;
  const resolvedStatus =
    status ??
    (resolvedScore != null ? statusFromCategoryScore(resolvedScore) : null);
  const band =
    resolvedScore != null ? categoryBandFromScore(resolvedScore) : null;

  React.useEffect(() => {
    if (state !== "success" || resolvedScore == null || impressed.current) {
      return;
    }
    impressed.current = true;
    categoryScoreAnalytics.impressed({
      auditId,
      category,
      score: resolvedScore,
      tier,
    });
  }, [state, resolvedScore, auditId, category, tier]);

  if (state === "loading") {
    return (
      <article
        className={cn(cardChrome(size), className)}
        aria-busy="true"
        aria-label={`${label} score loading`}
      >
        <div className="flex items-center gap-sm">
          <Skeleton className="size-9 shrink-0 rounded-md" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="mt-md h-6 w-12" />
        <Skeleton className="mt-sm h-3 w-20" />
        <Skeleton className="mt-md h-2 w-full rounded-full" />
      </article>
    );
  }

  if (state === "locked") {
    const lockedName = `${label} score locked. Upgrade to unlock.`;
    return (
      <article className={cn(cardChrome(size), "relative", className)}>
        <button
          type="button"
          className={cn(
            "absolute inset-0 z-raised flex flex-col items-center justify-center gap-sm",
            "rounded-md bg-background/60",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          )}
          aria-label={lockedName}
          onClick={() => {
            categoryScoreAnalytics.lockedClicked({
              auditId,
              category,
              tier,
            });
            onUnlock?.();
          }}
        >
          <Lock className="size-5 text-muted-foreground" aria-hidden />
          <Caption className="font-semibold text-foreground">Locked</Caption>
        </button>
        <div className="select-none blur-sm" aria-hidden>
          <CategoryChrome
            category={category}
            icon={icon}
            label={label}
            size={size}
          />
          <p className="mt-md text-body-sm font-bold tabular-nums text-foreground">
            —
          </p>
          <Caption className="mt-sm">Hidden</Caption>
          <div className="mt-md h-2 w-full rounded-full bg-muted" />
        </div>
      </article>
    );
  }

  const accessibleName = `${label} score ${resolvedScore} out of 100, ${resolvedStatus}`;

  return (
    <article
      className={cn(cardChrome(size), className)}
      aria-label={accessibleName}
    >
      <CategoryChrome
        category={category}
        icon={icon}
        label={label}
        size={size}
      />

      <div className="mt-md flex items-baseline justify-between gap-sm">
        <p className="text-body-sm font-bold tabular-nums text-foreground sm:text-body">
          {resolvedScore}
        </p>
        {trend ? (
          <TrendBadge
            trend={trend}
            trendDelta={trendDelta}
            category={category}
            auditId={auditId}
          />
        ) : null}
      </div>

      {resolvedStatus ? (
        <Caption
          className={cn(
            "mt-sm font-semibold",
            band ? CATEGORY_STATUS_TEXT[band] : "text-muted-foreground",
          )}
        >
          {resolvedStatus}
        </Caption>
      ) : null}

      <div
        className="mt-md"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={resolvedScore ?? 0}
        aria-label={`${label} progress`}
      >
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-[width] duration-slow ease-out",
              "motion-reduce:transition-none",
              band ? CATEGORY_BAR_FILL[band] : "bg-primary",
            )}
            style={{ width: `${resolvedScore ?? 0}%` }}
          />
        </div>
      </div>
    </article>
  );
}

function CategoryChrome({
  category,
  icon,
  label,
  size,
}: {
  category: AuditCategoryId;
  icon?: React.ReactNode;
  label: string;
  size: "default" | "compact";
}) {
  const Icon = DEFAULT_ICONS[category];
  return (
    <div className="flex items-center gap-sm">
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-md bg-muted text-primary",
          size === "compact" ? "size-8" : "size-9",
        )}
        aria-hidden
      >
        {icon ?? <Icon className="size-4" />}
      </span>
      <BodySmall className="font-semibold text-foreground">{label}</BodySmall>
    </div>
  );
}

function TrendBadge({
  trend,
  trendDelta,
  category,
  auditId,
}: {
  trend: CategoryScoreTrend;
  trendDelta: number | null | undefined;
  category: AuditCategoryId;
  auditId?: string;
}) {
  const Icon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const deltaText =
    trendDelta != null
      ? `${trendDelta > 0 ? "+" : ""}${trendDelta} points`
      : trend === "up"
        ? "improved"
        : trend === "down"
          ? "declined"
          : "unchanged";

  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center gap-1 rounded-sm text-info text-muted-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
      aria-label={`Trend ${deltaText} since last audit`}
      onFocus={() => {
        categoryScoreAnalytics.trendViewed({
          auditId,
          category,
          trend,
        });
      }}
    >
      <Icon className="size-4" aria-hidden />
      {trendDelta != null ? (
        <span className="tabular-nums">{trendDelta > 0 ? "+" : ""}{trendDelta}</span>
      ) : null}
    </button>
  );
}

function cardChrome(size: "default" | "compact"): string {
  return cn(
    "flex w-full flex-col rounded-md border border-border bg-background",
    size === "compact" ? "p-sm" : "p-md",
  );
}
