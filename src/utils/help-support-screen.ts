/**
 * SCREEN-023 — Help & Support helpers.
 * Search, filter, sort — no React / no API.
 */

import type { FaqAccordionItem } from "@/config/faq-accordion";
import type { HelpSupportCategory } from "@/config/help-support-screen";
import { HELP_SUPPORT_CATEGORY_LABELS } from "@/config/help-support-screen";
import type {
  HelpSupportArticle,
  HelpSupportTicket,
} from "@/data/mock-help-support";

export type HelpSearchResult = {
  articles: HelpSupportArticle[];
  faqs: FaqAccordionItem[];
  totalCount: number;
};

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

function articleMatchesQuery(article: HelpSupportArticle, query: string): boolean {
  const haystack = [
    article.title,
    article.summary,
    HELP_SUPPORT_CATEGORY_LABELS[article.category],
    ...article.tags,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

function faqMatchesQuery(item: FaqAccordionItem, query: string): boolean {
  const haystack = [item.question, item.answer].join(" ").toLowerCase();
  return haystack.includes(query);
}

export function filterHelpArticlesForGuest(
  articles: HelpSupportArticle[],
): HelpSupportArticle[] {
  return articles.filter((article) => article.guestVisible);
}

export function searchHelpContent(input: {
  query: string;
  articles: HelpSupportArticle[];
  faqs: FaqAccordionItem[];
  faqCategories: Record<string, HelpSupportCategory>;
  category?: HelpSupportCategory | null;
  guest?: boolean;
}): HelpSearchResult {
  const normalized = normalizeQuery(input.query);
  const baseArticles = input.guest
    ? filterHelpArticlesForGuest(input.articles)
    : input.articles;

  let articles = baseArticles;
  let faqs = input.faqs;

  if (input.category) {
    articles = articles.filter((item) => item.category === input.category);
    faqs = faqs.filter(
      (item) => input.faqCategories[item.id] === input.category,
    );
  }

  if (!normalized) {
    return {
      articles,
      faqs,
      totalCount: articles.length + faqs.length,
    };
  }

  const matchedArticles = articles.filter((item) =>
    articleMatchesQuery(item, normalized),
  );
  const matchedFaqs = faqs.filter((item) => faqMatchesQuery(item, normalized));

  return {
    articles: matchedArticles,
    faqs: matchedFaqs,
    totalCount: matchedArticles.length + matchedFaqs.length,
  };
}

export function sortHelpTicketsNewestFirst(
  tickets: HelpSupportTicket[],
): HelpSupportTicket[] {
  return [...tickets].sort(
    (a, b) =>
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
  );
}

export function formatHelpTicketDate(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(new Date(iso));
}

export function helpSupportSectionId(section: string): string {
  return `help-support-${section}`;
}
