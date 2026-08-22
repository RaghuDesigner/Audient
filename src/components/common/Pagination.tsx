"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Caption } from "@/components/ui/typography";
import {
  PAGINATION_ARIA,
  PAGINATION_DEFAULT_PAGE_SIZE,
  PAGINATION_LABELS,
  PAGINATION_PAGE_SIZE_OPTIONS,
  type PaginationModule,
  type PaginationState,
} from "@/config/pagination";
import { useMediaQuery } from "@/hooks/use-media-query";
import { paginationAnalytics } from "@/lib/analytics/pagination-events";
import {
  clampPage,
  pageItemRange,
  pageWindow,
  pageWindowCompact,
  shouldHidePagination,
  totalPages as computeTotalPages,
} from "@/utils/pagination";
import { cn } from "@/utils/cn";

export type PaginationProps = {
  currentPage: number;
  totalPages: number;
  totalItems?: number | null;
  pageSize: number;
  pageSizeOptions?: readonly number[];
  state?: PaginationState | "default";
  module?: PaginationModule;
  ariaLabel?: string;
  showSummary?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  className?: string;
};

/**
 * COMPONENT-025 — Pagination.
 * Controlled Previous / pages / Next + items-per-page. Mock lists only.
 */
export function Pagination({
  currentPage,
  totalPages: totalPagesProp,
  totalItems = null,
  pageSize = PAGINATION_DEFAULT_PAGE_SIZE,
  pageSizeOptions = PAGINATION_PAGE_SIZE_OPTIONS,
  state = "default",
  module = "history",
  ariaLabel,
  showSummary = true,
  onPageChange,
  onPageSizeChange,
  className,
}: PaginationProps) {
  const isMdUp = useMediaQuery("(min-width: 768px)");
  const selectId = React.useId();

  if (shouldHidePagination(totalItems)) {
    return null;
  }

  const pages =
    totalItems != null
      ? computeTotalPages(totalItems, pageSize)
      : Math.max(1, totalPagesProp);
  const page = clampPage(currentPage, pages);
  const singlePage = pages <= 1 || state === "single_page";
  const inert = state === "disabled" || state === "loading";
  const busy = state === "loading";
  const range =
    totalItems != null ? pageItemRange(page, pageSize, totalItems) : null;
  const windowItems = isMdUp
    ? pageWindow(page, pages)
    : pageWindowCompact(page, pages);

  const goTo = (next: number) => {
    if (inert) return;
    const clamped = clampPage(next, pages);
    if (clamped === page) return;
    paginationAnalytics.pageChanged({
      module,
      page: clamped,
      pageSize,
      totalPages: pages,
    });
    onPageChange(clamped);
  };

  const changeSize = (nextSize: number) => {
    if (inert || nextSize === pageSize) return;
    paginationAnalytics.itemsPerPageChanged({
      module,
      pageSize: nextSize,
      previousPageSize: pageSize,
    });
    onPageSizeChange(nextSize);
  };

  const navLabel =
    ariaLabel ??
    (module === "history" ? PAGINATION_ARIA.navHistory : PAGINATION_ARIA.nav);

  return (
    <nav
      aria-label={navLabel}
      aria-busy={busy || undefined}
      className={cn(
        "flex w-full flex-col gap-md border-t border-border pt-md",
        "sm:flex-row sm:flex-wrap sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex min-w-0 flex-col gap-sm">
        <Caption className="text-muted-foreground" aria-live="polite">
          {PAGINATION_LABELS.pageOf(page, pages)}
          {showSummary && range && totalItems != null
            ? ` · ${PAGINATION_LABELS.showing(range.start, range.end, totalItems)}`
            : null}
        </Caption>

        <div className="flex flex-wrap items-center gap-sm">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={inert || singlePage || page <= 1}
            aria-label={PAGINATION_ARIA.previous}
            onClick={() => goTo(page - 1)}
            iconLeft={<ChevronLeft className="size-4" aria-hidden />}
          >
            <span className="hidden sm:inline">{PAGINATION_LABELS.previous}</span>
          </Button>

          <ul className="flex flex-wrap items-center gap-sm">
            {windowItems.map((item) =>
              item.type === "ellipsis" ? (
                <li key={item.id} aria-hidden>
                  <span className="inline-flex min-h-11 min-w-11 items-center justify-center text-body-sm text-muted-foreground">
                    {PAGINATION_LABELS.ellipsis}
                  </span>
                </li>
              ) : (
                <li key={item.page}>
                  <Button
                    type="button"
                    variant={item.page === page ? "primary" : "outline"}
                    size="sm"
                    disabled={inert || (singlePage && item.page === page)}
                    aria-label={PAGINATION_ARIA.page(item.page)}
                    aria-current={item.page === page ? "page" : undefined}
                    className={
                      item.page === page
                        ? "min-w-11 text-primary-foreground"
                        : "min-w-11"
                    }
                    onClick={() => goTo(item.page)}
                  >
                    {item.page}
                  </Button>
                </li>
              ),
            )}
          </ul>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={inert || singlePage || page >= pages}
            aria-label={PAGINATION_ARIA.next}
            onClick={() => goTo(page + 1)}
            iconRight={<ChevronRight className="size-4" aria-hidden />}
          >
            <span className="hidden sm:inline">{PAGINATION_LABELS.next}</span>
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-sm">
        <label
          htmlFor={selectId}
          className="text-info font-semibold text-foreground sm:text-body-sm"
        >
          {PAGINATION_ARIA.itemsPerPage}
        </label>
        <select
          id={selectId}
          value={pageSize}
          disabled={inert}
          onChange={(event) => changeSize(Number(event.target.value))}
          className={cn(
            "min-h-11 rounded-md border border-border bg-background px-md",
            "text-body-sm text-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>
    </nav>
  );
}
