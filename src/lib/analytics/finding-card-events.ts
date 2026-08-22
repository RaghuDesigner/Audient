/**
 * Finding Card analytics (COMPONENT-010).
 * Dev stub — no PII / binaries.
 */

type Props = Record<string, string | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

export const findingCardAnalytics = {
  impressed: (props: {
    auditId?: string;
    findingId: string;
    severity: string;
    category: string;
    tier?: string;
  }) => track("finding_card_impressed", props),
  expanded: (findingId: string, auditId?: string) =>
    track("finding_card_expanded", { findingId, auditId }),
  collapsed: (findingId: string, auditId?: string) =>
    track("finding_card_collapsed", { findingId, auditId }),
  thumbnailClicked: (findingId: string, auditId?: string) =>
    track("finding_thumbnail_clicked", { findingId, auditId }),
};
