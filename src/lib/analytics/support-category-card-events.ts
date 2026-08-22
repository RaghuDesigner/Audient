/**
 * Support Category Card analytics — COMPONENT-063.
 * Dev stub — category key and counts only; no PII.
 */

import { SUPPORT_CATEGORY_CARD_ANALYTICS_SOURCE } from "@/config/support-category-card";
import type { HelpSupportCategory } from "@/config/help-support-screen";

type Props = Record<string, string | number | boolean | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

function base(extra?: Props): Props {
  return {
    source: SUPPORT_CATEGORY_CARD_ANALYTICS_SOURCE,
    mock: true,
    ...extra,
  };
}

export const supportCategoryCardAnalytics = {
  selected: (props: {
    category: HelpSupportCategory;
    itemCount: number;
  }) => {
    track("help_category_selected", base(props));
  },

  cleared: (props: { category: HelpSupportCategory }) => {
    track("help_category_cleared", base(props));
  },
};
