/**
 * FAQ Accordion analytics — COMPONENT-037.
 * Dev stub — prefer ids / slugs; no PII.
 */

type Props = Record<string, string | number | boolean | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

export const faqAccordionAnalytics = {
  expanded: (props: {
    faqId: string;
    question?: string;
    module?: string;
  }) => track("faq_expanded", props),

  collapsed: (props: { faqId: string; module?: string }) =>
    track("faq_collapsed", props),
};
