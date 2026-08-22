/**
 * COMPONENT-023 — Sort Dropdown constants.
 * Option sets and labels — parent applies sort to the list. No UI.
 */

export const SORT_DROPDOWN_MODULES = ["history", "reports"] as const;

export type SortDropdownModule = (typeof SORT_DROPDOWN_MODULES)[number];

/**
 * Canonical sort values (COMPONENT_SORT_DROPDOWN §6).
 * History maps score_desc/asc ↔ highest/lowest score semantics.
 */
export const SORT_DROPDOWN_VALUES = [
  "newest",
  "oldest",
  "score_desc",
  "score_asc",
  "recently_viewed",
] as const;

export type SortDropdownValue = (typeof SORT_DROPDOWN_VALUES)[number];

export const SORT_DROPDOWN_DEFAULT_VALUE: SortDropdownValue = "newest";

/** Display labels — match product wording; override if Figma differs. */
export const SORT_DROPDOWN_LABELS: Record<SortDropdownValue, string> = {
  newest: "Newest",
  oldest: "Oldest",
  score_desc: "Highest Score",
  score_asc: "Lowest Score",
  recently_viewed: "Recently Viewed",
};

/**
 * History Phase-1 options — omit Recently Viewed until `lastViewedAt` exists.
 * Null scores sort last for score_* (enforced in sort util later).
 */
export const SORT_DROPDOWN_HISTORY_OPTIONS: readonly SortDropdownValue[] = [
  "newest",
  "oldest",
  "score_desc",
  "score_asc",
] as const;

export const SORT_DROPDOWN_STATES = [
  "closed",
  "expanded",
  "disabled",
  "loading",
] as const;

export type SortDropdownState = (typeof SORT_DROPDOWN_STATES)[number];

/** Default accessible name for the control. */
export const SORT_DROPDOWN_DEFAULT_ARIA_LABEL = "Sort audits";

/** Optional visible prefix — only render if Figma shows it. */
export const SORT_DROPDOWN_VISIBLE_PREFIX = "Sort by:";

/** Build trigger accessible name: “Sort by, Newest”. */
export function sortDropdownTriggerLabel(
  value: SortDropdownValue,
  prefix: string = SORT_DROPDOWN_VISIBLE_PREFIX,
): string {
  const option = SORT_DROPDOWN_LABELS[value];
  const trimmed = prefix.replace(/:\s*$/, "");
  return `${trimmed}, ${option}`;
}
