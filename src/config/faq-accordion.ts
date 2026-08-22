/**
 * COMPONENT-037 — FAQ Accordion constants.
 * Copy, modules, states — no UI.
 */

export const FAQ_ACCORDION_STATES = ["loading", "ready"] as const;

export type FaqAccordionState = (typeof FAQ_ACCORDION_STATES)[number];

export const FAQ_ACCORDION_MODULES = [
  "membership",
  "pricing",
  "help",
] as const;

export type FaqAccordionModule = (typeof FAQ_ACCORDION_MODULES)[number];

export type FaqAccordionItem = {
  id: string;
  question: string;
  answer: string;
};

export const FAQ_ACCORDION_COPY = {
  headingMembership: "Membership FAQ",
  headingPricing: "Pricing FAQ",
  headingHelp: "Frequently asked questions",
  loadingLabel: "Loading FAQ",
} as const;

export const FAQ_ACCORDION_DEFAULT_HEADINGS: Record<
  FaqAccordionModule,
  string
> = {
  membership: FAQ_ACCORDION_COPY.headingMembership,
  pricing: FAQ_ACCORDION_COPY.headingPricing,
  help: FAQ_ACCORDION_COPY.headingHelp,
};

/** Default: multi-expand unless Figma requires exclusive. */
export const FAQ_ACCORDION_ALLOW_MULTIPLE_DEFAULT = true;

export const FAQ_ACCORDION_ANALYTICS_SOURCES = {
  membership: "faq_accordion_membership",
  pricing: "faq_accordion_pricing",
  help: "faq_accordion_help",
} as const;
