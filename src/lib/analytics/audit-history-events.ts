/**
 * Audit History screen analytics — SCREEN-009.
 * Dev stub — ids + enums only; no URLs or PII.
 */

import { AUDIT_HISTORY_ANALYTICS_SOURCE } from "@/config/audit-history";

type Props = Record<string, string | number | boolean | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, {
      source: AUDIT_HISTORY_ANALYTICS_SOURCE,
      mock: true,
      ...props,
    });
  }
}

export const auditHistoryAnalytics = {
  viewed: (props: { catalogCount: number }) =>
    track("history_viewed", props),

  searchUsed: (props: { hasQuery: boolean }) =>
    track("history_search_used", props),

  opened: (props: { auditId: string; status: string }) =>
    track("history_row_opened", props),

  deleted: (props: { auditId: string }) =>
    track("audit_deleted", props),
};
