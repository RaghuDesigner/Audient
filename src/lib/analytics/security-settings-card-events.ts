/**
 * Security Settings Card analytics — COMPONENT-047.
 * Dev stub — no tokens, emails, or secrets in payloads.
 */

import { SECURITY_SETTINGS_CARD_ANALYTICS_SOURCE } from "@/config/security-settings-card";

type Props = Record<string, string | number | boolean | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

function base(extra?: Props): Props {
  return {
    source: SECURITY_SETTINGS_CARD_ANALYTICS_SOURCE,
    mock: true,
    ...extra,
  };
}

export const securitySettingsCardAnalytics = {
  viewed: () => {
    track("security_settings_viewed", base());
  },

  signOutClicked: () => {
    track("sign_out_clicked", base());
  },

  signOutAllDevicesClicked: () => {
    track("sign_out_all_devices_clicked", base());
  },
};
