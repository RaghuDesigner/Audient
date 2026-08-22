/**
 * Save Changes Button analytics — COMPONENT-050.
 * Dev stub — no PII.
 */

import { SAVE_CHANGES_BUTTON_ANALYTICS_SOURCE } from "@/config/save-changes-button";

type Props = Record<string, string | number | boolean | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

function base(extra?: Props): Props {
  return {
    source: SAVE_CHANGES_BUTTON_ANALYTICS_SOURCE,
    mock: true,
    ...extra,
  };
}

export const saveChangesButtonAnalytics = {
  clicked: () => {
    track("save_changes_clicked", base());
  },

  completed: () => {
    track("settings_save_completed", base());
  },

  failed: () => {
    track("settings_save_failed", base());
  },
};
