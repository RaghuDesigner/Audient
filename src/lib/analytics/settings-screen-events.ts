/**
 * Settings screen analytics — SCREEN-019.
 * Dev stub — no PII (no email / names in payloads).
 */

import {
  SETTINGS_ANALYTICS_SOURCE,
  type SettingsSectionId,
} from "@/config/settings-screen";

type Props = Record<string, string | number | boolean | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

function base(extra?: Props): Props {
  return {
    source: SETTINGS_ANALYTICS_SOURCE,
    mock: true,
    ...extra,
  };
}

export const settingsScreenAnalytics = {
  viewed: () => {
    track("settings_viewed", base());
  },

  profileUpdated: () => {
    track("profile_updated", base());
  },

  preferencesUpdated: () => {
    track("preferences_updated", base());
  },

  notificationPreferencesUpdated: () => {
    track("notification_preferences_updated", base());
  },

  securitySettingsViewed: () => {
    track("security_settings_viewed", base());
  },

  connectedAccountViewed: () => {
    track("connected_account_viewed", base());
  },

  signOutClicked: () => {
    track("sign_out_clicked", base());
  },

  deleteAccountInitiated: () => {
    track("delete_account_initiated", base());
  },

  deleteAccountCancelled: () => {
    track("delete_account_cancelled", base());
  },

  /** Optional: section nav focus for Security / Connected. */
  sectionViewed: (section: SettingsSectionId) => {
    if (section === "security") {
      settingsScreenAnalytics.securitySettingsViewed();
      return;
    }
    if (section === "connected") {
      settingsScreenAnalytics.connectedAccountViewed();
    }
  },
};
