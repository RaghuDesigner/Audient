/**
 * Save Role Button analytics — COMPONENT-061.
 * Dev stub — staged change count only; no PII.
 */

import { SAVE_ROLE_BUTTON_ANALYTICS_SOURCE } from "@/config/save-role-button";

type Props = Record<string, string | number | boolean | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

function base(extra?: Props): Props {
  return {
    source: SAVE_ROLE_BUTTON_ANALYTICS_SOURCE,
    mock: true,
    ...extra,
  };
}

export const saveRoleButtonAnalytics = {
  clicked: (props: { stagedChangeCount: number }) => {
    track("role_save_started", base(props));
  },

  completed: (props: { stagedChangeCount: number }) => {
    track("role_save_completed", base(props));
  },

  failed: (props: { errorCode?: string; stagedChangeCount?: number }) => {
    track("role_save_failed", base(props));
  },
};
