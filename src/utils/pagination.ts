/**
 * Pagination helpers — COMPONENT-025.
 * Pure page math and windowing — no React.
 */

import { PAGINATION_SIBLING_COUNT } from "@/config/pagination";

export type PaginationWindowItem =
  | { type: "page"; page: number }
  | { type: "ellipsis"; id: string };

export function totalPages(
  totalItems: number,
  pageSize: number,
): number {
  if (totalItems <= 0 || pageSize <= 0) return 1;
  return Math.max(1, Math.ceil(totalItems / pageSize));
}

export function clampPage(page: number, totalPagesCount: number): number {
  if (!Number.isFinite(page) || page < 1) return 1;
  if (totalPagesCount < 1) return 1;
  return Math.min(Math.floor(page), totalPagesCount);
}

/**
 * Hide the control when the list is empty (empty state owns the region).
 * `null` / `undefined` totalItems means “unknown” — do not hide.
 */
export function shouldHidePagination(
  totalItems: number | null | undefined,
): boolean {
  return typeof totalItems === "number" && totalItems <= 0;
}

/**
 * Inclusive 1-based item range for the current page.
 * Returns null when there are no items.
 */
export function pageItemRange(
  currentPage: number,
  pageSize: number,
  totalItems: number,
): { start: number; end: number } | null {
  if (totalItems <= 0 || pageSize <= 0) return null;
  const pages = totalPages(totalItems, pageSize);
  const page = clampPage(currentPage, pages);
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);
  return { start, end };
}

/**
 * Build a windowed page list with ellipsis tokens.
 * Always includes first and last page when totalPages > 1.
 */
export function pageWindow(
  currentPage: number,
  totalPagesCount: number,
  siblingCount: number = PAGINATION_SIBLING_COUNT,
): PaginationWindowItem[] {
  const pages = Math.max(1, totalPagesCount);
  const current = clampPage(currentPage, pages);

  if (pages <= 1) {
    return [{ type: "page", page: 1 }];
  }

  // Small lists: show every page.
  const maxWithoutEllipsis = siblingCount * 2 + 5;
  if (pages <= maxWithoutEllipsis) {
    return Array.from({ length: pages }, (_, index) => ({
      type: "page" as const,
      page: index + 1,
    }));
  }

  const leftSibling = Math.max(current - siblingCount, 1);
  const rightSibling = Math.min(current + siblingCount, pages);

  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < pages - 1;

  const items: PaginationWindowItem[] = [{ type: "page", page: 1 }];

  if (showLeftEllipsis) {
    items.push({ type: "ellipsis", id: "left" });
  } else {
    for (let page = 2; page < leftSibling; page += 1) {
      items.push({ type: "page", page });
    }
  }

  for (let page = leftSibling; page <= rightSibling; page += 1) {
    if (page !== 1 && page !== pages) {
      items.push({ type: "page", page });
    }
  }

  if (showRightEllipsis) {
    items.push({ type: "ellipsis", id: "right" });
  } else {
    for (let page = rightSibling + 1; page < pages; page += 1) {
      items.push({ type: "page", page });
    }
  }

  if (pages > 1) {
    items.push({ type: "page", page: pages });
  }

  return items;
}

/** Compact mobile window: current page only (Prev/Next + summary carry context). */
export function pageWindowCompact(
  currentPage: number,
  totalPagesCount: number,
): PaginationWindowItem[] {
  const pages = Math.max(1, totalPagesCount);
  const current = clampPage(currentPage, pages);
  return [{ type: "page", page: current }];
}
