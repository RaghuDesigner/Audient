"use client";

import * as React from "react";

import { SearchBar } from "@/components/common/SearchBar";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BodySmall, Caption } from "@/components/ui/typography";
import { HELP_SEARCH_COPY } from "@/config/help-search";
import type { HelpSupportCategory } from "@/config/help-support-screen";
import type { FaqAccordionItem } from "@/config/faq-accordion";
import type { HelpSupportArticle } from "@/data/mock-help-support";
import { helpSupportAnalytics } from "@/lib/analytics/help-support-events";
import {
  searchHelpContent,
  type HelpSearchResult,
} from "@/utils/help-support-screen";
import { cn } from "@/utils/cn";

export type HelpSearchProps = {
  articles: HelpSupportArticle[];
  faqs: FaqAccordionItem[];
  faqCategories: Record<string, HelpSupportCategory>;
  category?: HelpSupportCategory | null;
  guest?: boolean;
  loading?: boolean;
  disabled?: boolean;
  onContactSupport?: () => void;
  /** Notifies parent when debounced results change (e.g. FAQ accordion). */
  onResultsChange?: (results: HelpSearchResult) => void;
  className?: string;
  id?: string;
};

/**
 * COMPONENT-062 — Help Search.
 * Mock help corpus search — SearchBar + articles + no-results.
 */
export function HelpSearch({
  articles,
  faqs,
  faqCategories,
  category = null,
  guest = false,
  loading = false,
  disabled = false,
  onContactSupport,
  onResultsChange,
  className,
  id,
}: HelpSearchProps) {
  const headingId = React.useId();
  const lastAnalyticsKey = React.useRef("");
  const [query, setQuery] = React.useState("");

  const results = React.useMemo(
    () =>
      searchHelpContent({
        query,
        articles,
        faqs,
        faqCategories,
        category,
        guest,
      }),
    [articles, category, faqCategories, faqs, guest, query],
  );

  React.useEffect(() => {
    onResultsChange?.(results);
  }, [onResultsChange, results]);

  React.useEffect(() => {
    if (loading) return;
    const key = `${query.length}:${results.totalCount}:${category ?? "all"}`;
    if (lastAnalyticsKey.current === key) return;
    lastAnalyticsKey.current = key;
    helpSupportAnalytics.search({
      queryLength: query.length,
      resultCount: results.totalCount,
    });
  }, [category, loading, query.length, results.totalCount]);

  const showNoResults = !loading && query.length > 0 && results.totalCount === 0;
  const showResultsAnnouncer =
    !loading && query.length > 0 && results.totalCount > 0;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn("flex w-full flex-col gap-sm", className)}
    >
      <h2 id={headingId} className="sr-only">
        {HELP_SEARCH_COPY.label}
      </h2>

      {loading ? (
        <Skeleton className="h-11 w-full rounded-md" aria-hidden />
      ) : (
        <SearchBar
          module="help"
          ariaLabel={HELP_SEARCH_COPY.label}
          placeholder={HELP_SEARCH_COPY.placeholder}
          state={disabled ? "disabled" : "default"}
          onSearch={setQuery}
          onClear={() => setQuery("")}
        />
      )}

      {showResultsAnnouncer ? (
        <p className="sr-only" role="status" aria-live="polite">
          {HELP_SEARCH_COPY.resultsFound(results.totalCount)}
        </p>
      ) : null}

      {showNoResults ? (
        <div className="rounded-md border border-border bg-muted/40 px-md py-sm">
          <BodySmall className="text-foreground">{HELP_SEARCH_COPY.noResults}</BodySmall>
          <Caption className="text-muted-foreground">
            {HELP_SEARCH_COPY.noResultsHint}{" "}
            {onContactSupport ? (
              <button
                type="button"
                className={cn(
                  "font-semibold text-primary underline-offset-4 hover:underline",
                  "rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                )}
                onClick={onContactSupport}
              >
                {HELP_SEARCH_COPY.contactCta}
              </button>
            ) : null}
          </Caption>
        </div>
      ) : null}

      {!loading && results.articles.length > 0 ? (
        <div className="flex flex-col gap-sm" aria-labelledby={`${headingId}-articles`}>
          <h3
            id={`${headingId}-articles`}
            className="text-body-sm font-semibold text-foreground sm:text-body"
          >
            {HELP_SEARCH_COPY.matchingArticlesHeading}
          </h3>
          <ul className="flex flex-col gap-sm">
            {results.articles.map((article) => (
              <li key={article.id}>
                <Card padding="md">
                  <CardContent className="gap-xs">
                    <p className="text-body-sm font-semibold text-foreground">
                      {article.title}
                    </p>
                    <BodySmall className="text-muted-foreground">
                      {article.summary}
                    </BodySmall>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

export type { HelpSearchResult };
