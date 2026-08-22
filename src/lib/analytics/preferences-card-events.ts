/**
 * Preferences Card analytics — COMPONENT-045.
 * Dev stub — preference keys/values only; no PII.
 */

import {
  PREFERENCES_CARD_ANALYTICS_SOURCE,
  type PreferencesCardField,
} from "@/config/preferences-card";

type Props = Record<string, string | number | boolean | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

function base(extra?: Props): Props {
  return {
    source: PREFERENCES_CARD_ANALYTICS_SOURCE,
    mock: true,
    ...extra,
  };
}

export const preferencesCardAnalytics = {
  viewed: () => {
    track("preferences_viewed", base());
  },

  preferenceChanged: (props: {
    preference: PreferencesCardField;
    value: string;
  }) => {
    track(
      "preference_changed",
      base({
        preference: props.preference,
        value: props.value,
      }),
    );
  },
};
