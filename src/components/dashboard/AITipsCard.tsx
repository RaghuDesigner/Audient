"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import {
  Accessibility,
  ChevronRight,
  Gauge,
  Lightbulb,
  Search,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BodySmall, Caption } from "@/components/ui/typography";
import {
  AI_TIP_CATEGORY_LABELS,
  AI_TIP_ROTATE_MS,
  type AiTip,
  type AiTipCategory,
} from "@/config/ai-tips";
import { aiTipsAnalytics } from "@/lib/analytics/ai-tips-events";
import { cn } from "@/utils/cn";

export type AITipsCardState = "loading" | "success" | "error";

export type AITipsCardProps = {
  state: AITipsCardState;
  /** Catalog for client-side rotation. Prefer over single-tip props. */
  tips?: AiTip[];
  tipId?: string;
  category?: AiTipCategory;
  title?: string;
  description?: string;
  illustrationUrl?: string | null;
  readMoreHref?: string | null;
  readMoreMode?: "link" | "expand";
  expanded?: boolean;
  errorMessage?: string;
  autoRotate?: boolean;
  showNextControl?: boolean;
  onReadMore?: (tip: AiTip) => void;
  onRetry?: () => void;
  onNext?: (tip: AiTip) => void;
  onExpandedChange?: (expanded: boolean) => void;
  className?: string;
};

const CATEGORY_ICONS: Record<AiTipCategory, LucideIcon> = {
  ux: Lightbulb,
  accessibility: Accessibility,
  seo: Search,
  performance: Gauge,
};

/**
 * COMPONENT-019 — AI Tips Card.
 * One tip at a time; rotates across categories; reduced-motion safe.
 */
export function AITipsCard({
  state,
  tips,
  tipId,
  category,
  title,
  description,
  illustrationUrl = null,
  readMoreHref = null,
  readMoreMode = "expand",
  expanded: expandedProp,
  errorMessage = "Tips unavailable right now. Please try again.",
  autoRotate = true,
  showNextControl = true,
  onReadMore,
  onRetry,
  onNext,
  onExpandedChange,
  className,
}: AITipsCardProps) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const [uncontrolledExpanded, setUncontrolledExpanded] = React.useState(false);
  const impressedTips = React.useRef(new Set<string>());

  const catalog = tips ?? [];
  const hasCatalog = catalog.length > 0;
  const safeIndex = hasCatalog ? index % catalog.length : 0;
  const activeFromCatalog = hasCatalog ? catalog[safeIndex] : null;

  const activeTip: AiTip | null =
    activeFromCatalog ??
    (tipId && category && title && description
      ? {
          tipId,
          category,
          title,
          description,
          illustrationUrl,
          readMoreHref,
        }
      : null);

  const isExpanded =
    expandedProp !== undefined ? expandedProp : uncontrolledExpanded;
  const canAutoRotate =
    Boolean(autoRotate) &&
    !reduceMotion &&
    !paused &&
    state === "success" &&
    hasCatalog &&
    catalog.length > 1;

  React.useEffect(() => {
    if (!canAutoRotate) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % catalog.length);
      setUncontrolledExpanded(false);
      onExpandedChange?.(false);
    }, AI_TIP_ROTATE_MS);
    return () => window.clearInterval(id);
  }, [canAutoRotate, catalog.length, onExpandedChange]);

  const activeTipId = activeTip?.tipId;
  const activeTipCategory = activeTip?.category;

  React.useEffect(() => {
    if (state !== "success" || !activeTipId || !activeTipCategory) return;
    if (impressedTips.current.has(activeTipId)) return;
    impressedTips.current.add(activeTipId);
    aiTipsAnalytics.impressed({
      tipId: activeTipId,
      category: activeTipCategory,
    });
  }, [state, activeTipId, activeTipCategory]);

  React.useEffect(() => {
    if (state === "error") {
      aiTipsAnalytics.error({ reason: "tips_unavailable" });
    }
  }, [state]);

  if (state === "loading") {
    return (
      <section
        className={cn(cardChrome, className)}
        aria-busy="true"
        aria-label="Loading AI tip"
      >
        <Skeleton className="size-11 rounded-md" />
        <Skeleton className="mt-md h-5 w-24" />
        <Skeleton className="mt-sm h-6 w-3/4" />
        <Skeleton className="mt-sm h-4 w-full" />
        <Skeleton className="mt-sm h-4 w-5/6" />
        <Skeleton className="mt-md h-9 w-28" />
      </section>
    );
  }

  if (state === "error" || !activeTip) {
    return (
      <section
        className={cn(cardChrome, className)}
        aria-label="AI tips unavailable"
      >
        <Caption className="font-semibold uppercase tracking-wide text-muted-foreground">
          AI tip
        </Caption>
        <p
          role="alert"
          className="mt-md text-info text-error sm:text-body-sm"
        >
          {errorMessage}
        </p>
        {onRetry ? (
          <Button
            type="button"
            variant="outline"
            className="mt-md"
            onClick={onRetry}
          >
            Retry
          </Button>
        ) : null}
      </section>
    );
  }

  const tip = activeTip;
  const Icon = CATEGORY_ICONS[tip.category];
  const categoryLabel = AI_TIP_CATEGORY_LABELS[tip.category];
  const illustration = tip.illustrationUrl ?? illustrationUrl;
  const moreHref = tip.readMoreHref ?? readMoreHref;

  const goNext = () => {
    if (!hasCatalog) return;
    const nextIndex = (safeIndex + 1) % catalog.length;
    setIndex(nextIndex);
    setUncontrolledExpanded(false);
    onExpandedChange?.(false);
    const nextTip = catalog[nextIndex];
    if (nextTip) {
      aiTipsAnalytics.nextClicked({ tipId: nextTip.tipId });
      onNext?.(nextTip);
    }
  };

  const handleReadMore = () => {
    aiTipsAnalytics.readMoreClicked({
      tipId: tip.tipId,
      category: tip.category,
    });
    onReadMore?.(tip);
    if (readMoreMode === "expand") {
      const next = !isExpanded;
      if (expandedProp === undefined) setUncontrolledExpanded(next);
      onExpandedChange?.(next);
    }
  };

  return (
    <section
      className={cn(
        cardChrome,
        "flex flex-col gap-md sm:flex-row sm:items-start",
        className,
      )}
      aria-label={`AI tip: ${tip.title}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      <div className="flex shrink-0 flex-col items-start gap-sm">
        {illustration ? (
          // eslint-disable-next-line @next/next/no-img-element -- curated tip assets
          <img
            src={illustration}
            alt=""
            className="size-14 rounded-md object-cover sm:size-16"
            aria-hidden
          />
        ) : (
          <span
            className="inline-flex size-11 items-center justify-center rounded-md bg-secondary/15 text-secondary sm:size-14"
            aria-hidden
          >
            <Icon className="size-5 sm:size-6" />
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-sm">
        <div className="flex flex-wrap items-center gap-sm">
          <Caption className="font-semibold uppercase tracking-wide text-muted-foreground">
            AI tip
          </Caption>
          <span
            className={cn(
              "inline-flex min-h-7 items-center gap-sm rounded-md px-sm",
              "bg-muted text-info font-semibold text-foreground",
            )}
          >
            <Sparkles className="size-3.5" aria-hidden />
            {categoryLabel}
          </span>
        </div>

        <h3 className="text-body-sm font-bold text-foreground sm:text-body">
          {tip.title}
        </h3>

        <BodySmall
          className={cn(
            "text-muted-foreground",
            readMoreMode === "expand" && !isExpanded && "line-clamp-3",
          )}
        >
          {tip.description}
        </BodySmall>

        {readMoreMode === "expand" && isExpanded ? (
          <BodySmall className="text-muted-foreground" id="ai-tip-details">
            Apply this on your next audit, then re-check the related category
            score to confirm the improvement.
          </BodySmall>
        ) : null}

        <div className="mt-sm flex flex-col gap-sm sm:flex-row sm:flex-wrap sm:items-center">
          {readMoreMode === "link" && moreHref ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="justify-start sm:w-auto"
              onClick={() => {
                handleReadMore();
                window.open(moreHref, "_blank", "noopener,noreferrer");
              }}
              aria-label={`Read more about ${tip.title}`}
            >
              Read more
              <ChevronRight className="size-4" aria-hidden />
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="justify-start sm:w-auto"
              aria-expanded={
                readMoreMode === "expand" ? isExpanded : undefined
              }
              aria-controls={
                readMoreMode === "expand" ? "ai-tip-details" : undefined
              }
              onClick={handleReadMore}
              aria-label={`Read more about ${tip.title}`}
            >
              {readMoreMode === "expand" && isExpanded
                ? "Show less"
                : "Read more"}
              <ChevronRight
                className={cn(
                  "size-4 transition-transform duration-fast",
                  readMoreMode === "expand" && isExpanded && "rotate-90",
                )}
                aria-hidden
              />
            </Button>
          )}

          {showNextControl && hasCatalog && catalog.length > 1 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="sm:w-auto"
              onClick={goNext}
            >
              Next tip
            </Button>
          ) : null}
        </div>

        {hasCatalog && catalog.length > 1 ? (
          <p className="sr-only" aria-live="polite">
            Tip {safeIndex + 1} of {catalog.length}: {tip.title}
          </p>
        ) : null}
      </div>
    </section>
  );
}

const cardChrome =
  "w-full rounded-md border border-border bg-surface p-md shadow-sm sm:p-lg";
