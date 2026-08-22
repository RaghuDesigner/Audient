/**
 * Locked Card analytics (COMPONENT-011).
 * Dev stub — no PII / premium payloads.
 */

type Props = Record<string, string | number | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

export const lockedCardAnalytics = {
  impressed: (props: {
    variant: string;
    reason: string;
    tier?: string;
    auditId?: string;
    lockedCount?: number;
  }) => track("locked_card_impressed", props),
  clicked: (props: {
    variant: string;
    reason: string;
    tier?: string;
    auditId?: string;
  }) => track("locked_card_clicked", props),
};
