/**
 * Phase-1 mock FAQ Accordion — COMPONENT-037.
 * Membership sample Q&A aligned with PRICING.md; no CMS.
 */

import type { FaqAccordionItem } from "@/config/faq-accordion";

/** Manage Membership sample FAQs (doc §3). */
export const MOCK_FAQ_MEMBERSHIP_ITEMS: FaqAccordionItem[] = [
  {
    id: "upgrade",
    question: "How do I upgrade?",
    answer:
      "Use Upgrade on this page or Compare plans. Choose Pro ($29 / 1,000 credits) or Business ($99 / 10,000 credits). Checkout is mocked this phase — Stripe ships later.",
  },
  {
    id: "cancel",
    question: "Can I cancel anytime?",
    answer:
      "Yes. After you cancel, you keep access until the end of the current billing period, then Free entitlements apply. Real cancel via billing portal ships with Stripe.",
  },
  {
    id: "credits",
    question: "How do credits work?",
    answer:
      "Each screenshot or URL audit spends credits by plan (see Pricing). Your remaining balance is server-authoritative when live; figures here are mock.",
  },
  {
    id: "rollover",
    question: "Do unused credits roll over?",
    answer:
      "Purchased top-up credits roll over. Included monthly plan grants reset on renewal and do not roll over. Free cannot buy top-ups.",
  },
  {
    id: "yearly",
    question: "Can I change to yearly billing?",
    answer:
      "Yearly billing is coming soon. This phase shows monthly prices only ($0 / $29 / $99) — we won’t invent yearly rates until product confirms them.",
  },
];

export const MOCK_FAQ_PRICING_ITEMS: FaqAccordionItem[] =
  MOCK_FAQ_MEMBERSHIP_ITEMS.filter((item) =>
    ["upgrade", "credits", "rollover"].includes(item.id),
  );

export const MOCK_FAQ_LOADING_ITEMS: FaqAccordionItem[] = [];

export function getMockFaqMembershipItems(
  overrides?: FaqAccordionItem[],
): FaqAccordionItem[] {
  return overrides ?? MOCK_FAQ_MEMBERSHIP_ITEMS;
}
