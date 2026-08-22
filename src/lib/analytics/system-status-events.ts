/**
 * System Status Banner analytics — COMPONENT-075.
 * Dev stub only — mock status, no PII.
 */

import type { SystemStatusBannerStatus } from "@/config/system-status-banner";

type Props = Record<string, string | number | boolean | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

export const systemStatusAnalytics = {
  viewed: (props: { status: SystemStatusBannerStatus }) => {
    track("system_status_banner_viewed", {
      ...props,
      surface: "banner",
      mock: true,
    });
  },

  actionClicked: (props: {
    status: SystemStatusBannerStatus;
    actionLabel: string;
  }) => {
    track("system_status_action_clicked", { ...props, mock: true });
  },

  dismissed: (props: { status: SystemStatusBannerStatus }) => {
    track("system_status_dismissed", { ...props, mock: true });
  },
};
