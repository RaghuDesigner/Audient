/**
 * Notification Settings Card analytics — COMPONENT-046.
 * Dev stub — preference keys only; no message bodies / PII.
 */

import {
  NOTIFICATION_SETTINGS_CARD_ANALYTICS_SOURCE,
  type NotificationSettingsCardType,
} from "@/config/notification-settings-card";

type Props = Record<string, string | number | boolean | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

function base(extra?: Props): Props {
  return {
    source: NOTIFICATION_SETTINGS_CARD_ANALYTICS_SOURCE,
    mock: true,
    ...extra,
  };
}

export const notificationSettingsCardAnalytics = {
  viewed: () => {
    track("notification_settings_viewed", base());
  },

  /** Notification Preference Changed */
  preferenceChanged: (props: {
    type: NotificationSettingsCardType;
    enabled: boolean;
  }) => {
    track(
      "notification_preference_changed",
      base({
        type: props.type,
        enabled: props.enabled,
      }),
    );
  },
};
