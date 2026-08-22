"use client";

import * as React from "react";

import { SupportCategoryCard } from "@/components/help/SupportCategoryCard";
import { HELP_SUPPORT_COPY, type HelpSupportCategory } from "@/config/help-support-screen";
import type { FaqAccordionItem } from "@/config/faq-accordion";
import type { HelpSupportArticle } from "@/data/mock-help-support";
import { supportCategoryCardAnalytics } from "@/lib/analytics/support-category-card-events";
import { buildSupportCategoryCards } from "@/utils/support-category-card";
import { cn } from "@/utils/cn";

export type HelpSupportCategoriesProps = {
  articles: HelpSupportArticle[];
  faqs: FaqAccordionItem[];
  faqCategories: Record<string, HelpSupportCategory>;
  guest?: boolean;
  selectedCategory: HelpSupportCategory | null;
  onSelectCategory: (category: HelpSupportCategory | null) => void;
  disabled?: boolean;
  className?: string;
};

/**
 * SCREEN-023 — support category grid.
 * Composes SupportCategoryCard (COMPONENT-063) per category.
 */
export function HelpSupportCategories({
  articles,
  faqs,
  faqCategories,
  guest = false,
  selectedCategory,
  onSelectCategory,
  disabled = false,
  className,
}: HelpSupportCategoriesProps) {
  const cards = React.useMemo(
    () =>
      buildSupportCategoryCards({
        articles,
        faqs,
        faqCategories,
        guest,
      }),
    [articles, faqCategories, faqs, guest],
  );

  const handleSelect = (category: HelpSupportCategory) => {
    const selected = selectedCategory === category;
    const model = cards.find((card) => card.category === category);
    if (selected) {
      supportCategoryCardAnalytics.cleared({ category });
      onSelectCategory(null);
      return;
    }
    if (model) {
      supportCategoryCardAnalytics.selected({
        category,
        itemCount: model.itemCount,
      });
    }
    onSelectCategory(category);
  };

  return (
    <section
      className={cn("flex flex-col gap-md", className)}
      aria-labelledby="help-categories-heading"
    >
      <h2
        id="help-categories-heading"
        className="text-body font-semibold text-foreground"
      >
        {HELP_SUPPORT_COPY.categoriesHeading}
      </h2>
      <div className="grid grid-cols-1 gap-sm sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cards.map((card) => (
          <SupportCategoryCard
            key={card.category}
            category={card.category}
            label={card.label}
            description={card.description}
            articleCount={card.itemCount}
            selected={selectedCategory === card.category}
            disabled={disabled}
            onSelect={handleSelect}
          />
        ))}
      </div>
    </section>
  );
}
