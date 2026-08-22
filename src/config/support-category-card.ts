/**
 * COMPONENT-063 — Support Category Card constants.
 * Category descriptions and count copy — mock only; no backend.
 */

import {
  HELP_SUPPORT_CATEGORY_LABELS,
  type HelpSupportCategory,
} from "@/config/help-support-screen";

export const SUPPORT_CATEGORY_DESCRIPTIONS: Record<
  HelpSupportCategory,
  string
> = {
  getting_started: "First audit, account setup, credits overview",
  audits: "Screenshot vs URL audits, processing, failures",
  reports: "Scores, findings, strengths, export",
  membership: "Free, Pro, and Business plans",
  billing_payments: "Invoices, payment methods, refunds",
  team_business: "Workspace, invites, roles",
  account_security: "Profile, SSO, privacy",
};

export const SUPPORT_CATEGORY_CARD_COPY = {
  articleCountOne: "1 article",
  articleCountMany: (count: number) => `${count} articles`,
  itemsCountOne: "1 item",
  itemsCountMany: (count: number) => `${count} items`,
} as const;

export const SUPPORT_CATEGORY_CARD_ANALYTICS_SOURCE =
  "support_category_card" as const;

export function supportCategoryLabel(
  category: HelpSupportCategory,
): string {
  return HELP_SUPPORT_CATEGORY_LABELS[category];
}

export function formatSupportCategoryItemCount(count: number): string {
  if (count === 1) {
    return SUPPORT_CATEGORY_CARD_COPY.itemsCountOne;
  }
  return SUPPORT_CATEGORY_CARD_COPY.itemsCountMany(count);
}

export function supportCategoryAccessibleName(
  label: string,
  itemCount: number,
): string {
  return `${label}, ${formatSupportCategoryItemCount(itemCount)}`;
}
