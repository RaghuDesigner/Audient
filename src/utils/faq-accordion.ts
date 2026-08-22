/**
 * COMPONENT-037 — FAQ Accordion helpers.
 * Expand/collapse id sets — no React.
 */

import {
  FAQ_ACCORDION_ALLOW_MULTIPLE_DEFAULT,
  FAQ_ACCORDION_DEFAULT_HEADINGS,
  type FaqAccordionItem,
  type FaqAccordionModule,
} from "@/config/faq-accordion";

export function faqAccordionDefaultHeading(
  module: FaqAccordionModule = "membership",
  heading?: string | null,
): string {
  if (heading) return heading;
  return FAQ_ACCORDION_DEFAULT_HEADINGS[module];
}

export function shouldRenderFaqAccordion(
  items: readonly FaqAccordionItem[] | null | undefined,
  state?: "loading" | "ready",
): boolean {
  if (state === "loading") return true;
  return Boolean(items && items.length > 0);
}

/**
 * Toggle one FAQ id in the expanded set.
 * Exclusive mode keeps at most one open.
 */
export function toggleFaqExpandedIds(input: {
  expandedIds: readonly string[];
  faqId: string;
  allowMultiple?: boolean;
}): string[] {
  const allowMultiple =
    input.allowMultiple ?? FAQ_ACCORDION_ALLOW_MULTIPLE_DEFAULT;
  const isOpen = input.expandedIds.includes(input.faqId);

  if (isOpen) {
    return input.expandedIds.filter((id) => id !== input.faqId);
  }

  if (!allowMultiple) {
    return [input.faqId];
  }

  return [...input.expandedIds, input.faqId];
}

export function isFaqExpanded(
  expandedIds: readonly string[],
  faqId: string,
): boolean {
  return expandedIds.includes(faqId);
}

export function resolveFaqExpandedIds(input: {
  controlledIds?: readonly string[] | null;
  uncontrolledIds: readonly string[];
}): string[] {
  if (input.controlledIds != null) return [...input.controlledIds];
  return [...input.uncontrolledIds];
}
