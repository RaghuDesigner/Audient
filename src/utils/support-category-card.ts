/**
 * COMPONENT-063 — Support Category Card helpers.
 * Mock article + FAQ counts per category — no React / no API.
 */

import type { FaqAccordionItem } from "@/config/faq-accordion";
import {
  HELP_SUPPORT_CATEGORIES,
  HELP_SUPPORT_CATEGORY_LABELS,
  type HelpSupportCategory,
} from "@/config/help-support-screen";
import {
  SUPPORT_CATEGORY_DESCRIPTIONS,
  supportCategoryLabel,
} from "@/config/support-category-card";
import type { HelpSupportArticle } from "@/data/mock-help-support";
import { filterHelpArticlesForGuest } from "@/utils/help-support-screen";

export type SupportCategoryCardModel = {
  category: HelpSupportCategory;
  label: string;
  description: string;
  itemCount: number;
};

export function countHelpItemsInCategory(input: {
  category: HelpSupportCategory;
  articles: HelpSupportArticle[];
  faqs: FaqAccordionItem[];
  faqCategories: Record<string, HelpSupportCategory>;
  guest?: boolean;
}): number {
  const articles = input.guest
    ? filterHelpArticlesForGuest(input.articles)
    : input.articles;
  const articleCount = articles.filter(
    (article) => article.category === input.category,
  ).length;
  const faqCount = input.faqs.filter(
    (faq) => input.faqCategories[faq.id] === input.category,
  ).length;
  return articleCount + faqCount;
}

export function buildSupportCategoryCards(input: {
  articles: HelpSupportArticle[];
  faqs: FaqAccordionItem[];
  faqCategories: Record<string, HelpSupportCategory>;
  guest?: boolean;
}): SupportCategoryCardModel[] {
  return HELP_SUPPORT_CATEGORIES.map((category) => ({
    category,
    label: supportCategoryLabel(category),
    description: SUPPORT_CATEGORY_DESCRIPTIONS[category],
    itemCount: countHelpItemsInCategory({
      category,
      articles: input.articles,
      faqs: input.faqs,
      faqCategories: input.faqCategories,
      guest: input.guest,
    }),
  }));
}

/** @deprecated Prefer itemCount — kept for prop naming clarity. */
export function countArticlesByCategory(
  category: HelpSupportCategory,
  articles: HelpSupportArticle[],
  guest = false,
): number {
  const scoped = guest ? filterHelpArticlesForGuest(articles) : articles;
  return scoped.filter((article) => article.category === category).length;
}

export { HELP_SUPPORT_CATEGORY_LABELS };
