/**
 * COMPONENT-021 — Search Bar constants.
 * Shared defaults for History / Reports / Billing / Team — no UI.
 */

/** Debounce before emitting `onSearch` (COMPONENT_SEARCH_BAR §3.2). */
export const SEARCH_BAR_DEFAULT_DEBOUNCE_MS = 300;

/** History default placeholder — exact copy from COMPONENT_SEARCH_BAR §2. */
export const SEARCH_BAR_HISTORY_PLACEHOLDER =
  "Search by website name, URL or Audit ID";

/** Help & Support placeholder — SCREEN-023. */
export const SEARCH_BAR_HELP_PLACEHOLDER = "Search help articles";

/** Accessible name when no visible label is shown. */
export const SEARCH_BAR_DEFAULT_ARIA_LABEL = "Search audits";

export const SEARCH_BAR_MODULES = [
  "history",
  "reports",
  "billing",
  "team",
  "help",
] as const;

export type SearchBarModule = (typeof SEARCH_BAR_MODULES)[number];

export const SEARCH_BAR_STATES = [
  "default",
  "loading",
  "disabled",
  "error",
] as const;

export type SearchBarState = (typeof SEARCH_BAR_STATES)[number];

/** Clear control accessible name (WCAG — named button). */
export const SEARCH_BAR_CLEAR_LABEL = "Clear search";
