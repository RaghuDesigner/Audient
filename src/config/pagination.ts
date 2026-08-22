/**
 * COMPONENT-025 — Pagination constants.
 * Defaults and copy — parent owns page state and list slicing. No UI.
 */

import { AUDIT_HISTORY_PAGE_SIZE } from "@/config/audit-history";

export const PAGINATION_MODULES = [
  "history",
  "reports",
  "billing",
  "notifications",
] as const;

export type PaginationModule = (typeof PAGINATION_MODULES)[number];

export const PAGINATION_STATES = [
  "default",
  "loading",
  "disabled",
  "single_page",
] as const;

export type PaginationState = (typeof PAGINATION_STATES)[number];

/** Default items-per-page choices (COMPONENT_PAGINATION §2). */
export const PAGINATION_PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

export type PaginationPageSize = (typeof PAGINATION_PAGE_SIZE_OPTIONS)[number];

/** History default — keep in sync with audit-history page size. */
export const PAGINATION_DEFAULT_PAGE_SIZE: PaginationPageSize =
  AUDIT_HISTORY_PAGE_SIZE as PaginationPageSize;

/**
 * How many page numbers to show on each side of the current page
 * when building an ellipsis window (desktop).
 */
export const PAGINATION_SIBLING_COUNT = 1;

export const PAGINATION_ARIA = {
  nav: "Pagination",
  navHistory: "Audit history pagination",
  previous: "Previous page",
  next: "Next page",
  page: (page: number) => `Page ${page}`,
  itemsPerPage: "Items per page",
} as const;

export const PAGINATION_LABELS = {
  previous: "Previous",
  next: "Next",
  ellipsis: "…",
  pageOf: (page: number, totalPages: number) =>
    `Page ${page} of ${totalPages}`,
  showing: (start: number, end: number, totalItems: number) =>
    `Showing ${start}–${end} of ${totalItems}`,
} as const;
