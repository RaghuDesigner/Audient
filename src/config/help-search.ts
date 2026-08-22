/**
 * COMPONENT-062 — Help Search constants.
 * Help-specific search copy — mock only; no backend.
 */

import { HELP_SUPPORT_COPY } from "@/config/help-support-screen";

export const HELP_SEARCH_COPY = {
  placeholder: HELP_SUPPORT_COPY.searchPlaceholder,
  label: HELP_SUPPORT_COPY.searchLabel,
  noResults: HELP_SUPPORT_COPY.searchNoResults,
  noResultsHint: HELP_SUPPORT_COPY.searchNoResultsHint,
  contactCta: HELP_SUPPORT_COPY.contactCta,
  matchingArticlesHeading: "Matching articles",
  resultsFound: (count: number) =>
    count === 1 ? "1 result found" : `${count} results found`,
} as const;

export const HELP_SEARCH_ANALYTICS_SOURCE = "help_search" as const;
