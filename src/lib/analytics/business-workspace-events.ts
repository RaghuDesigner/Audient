/**
 * Business Workspace screen analytics — SCREEN-020.
 * Dev stub — no PII.
 */

import { BUSINESS_WORKSPACE_ANALYTICS_SOURCE } from "@/config/business-workspace-screen";

type Props = Record<string, string | number | boolean | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

function base(extra?: Props): Props {
  return {
    source: BUSINESS_WORKSPACE_ANALYTICS_SOURCE,
    mock: true,
    ...extra,
  };
}

export const businessWorkspaceAnalytics = {
  viewed: () => {
    track("workspace_viewed", base());
  },

  inviteMemberClicked: () => {
    track("invite_member_clicked", base());
  },

  forbiddenViewed: (props: { planTier: string }) => {
    track("workspace_forbidden_viewed", base({ planTier: props.planTier }));
  },
};
