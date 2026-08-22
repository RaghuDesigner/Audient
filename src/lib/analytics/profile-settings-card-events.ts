/**
 * Profile Settings Card analytics — COMPONENT-044.
 * Dev stub — no PII (no email / names).
 */

import { PROFILE_SETTINGS_CARD_ANALYTICS_SOURCE } from "@/config/profile-settings-card";

type Props = Record<string, string | number | boolean | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

function base(extra?: Props): Props {
  return {
    source: PROFILE_SETTINGS_CARD_ANALYTICS_SOURCE,
    mock: true,
    ...extra,
  };
}

export const profileSettingsCardAnalytics = {
  viewed: () => {
    track("profile_settings_viewed", base());
  },

  editStarted: () => {
    track("profile_edit_started", base());
  },

  updated: (props?: { hasCompany?: boolean; hasRole?: boolean }) => {
    track(
      "profile_updated",
      base({
        hasCompany: props?.hasCompany,
        hasRole: props?.hasRole,
      }),
    );
  },
};
