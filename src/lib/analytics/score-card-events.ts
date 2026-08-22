/**
 * Overall Score Card analytics (COMPONENT-008).
 * Dev stub — wire to a real sink later. No PII / binaries.
 */

type ScoreCardProps = Record<string, string | number | undefined>;

function track(event: string, props?: ScoreCardProps): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

export const scoreCardAnalytics = {
  impressed: (props: {
    auditId?: string;
    tier?: string;
    score?: number;
    grade?: string;
    auditType?: string;
  }) => track("score_card_impressed", props),
  unlockClicked: (auditId?: string, tier?: string) =>
    track("score_card_unlock_clicked", { auditId, tier }),
  retryClicked: (auditId?: string) =>
    track("score_card_retry_clicked", { auditId }),
  errorShown: (auditId?: string, reason?: string) =>
    track("score_card_error", { auditId, reason }),
};
