/**
 * Business Usage Widget analytics — COMPONENT-056.
 * Dev stub — no PII.
 */

import { BUSINESS_USAGE_WIDGET_ANALYTICS_SOURCE } from "@/config/business-usage-widget";

type Props = Record<string, string | number | boolean | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

function base(extra?: Props): Props {
  return {
    source: BUSINESS_USAGE_WIDGET_ANALYTICS_SOURCE,
    mock: true,
    ...extra,
  };
}

export const businessUsageWidgetAnalytics = {
  viewed: () => {
    track("business_usage_viewed", base());
  },

  retryClicked: () => {
    track("business_usage_retry_clicked", base());
  },
};
