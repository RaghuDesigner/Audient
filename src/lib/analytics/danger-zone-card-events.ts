/**
 * Danger Zone Card analytics — COMPONENT-049.
 * Dev stub — no PII / no account identifiers required.
 */

import { DANGER_ZONE_CARD_ANALYTICS_SOURCE } from "@/config/danger-zone-card";

type Props = Record<string, string | number | boolean | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

function base(extra?: Props): Props {
  return {
    source: DANGER_ZONE_CARD_ANALYTICS_SOURCE,
    mock: true,
    ...extra,
  };
}

export const dangerZoneCardAnalytics = {
  deleteAccountInitiated: () => {
    track("delete_account_initiated", base());
  },

  deleteAccountCancelled: () => {
    track("delete_account_cancelled", base());
  },

  deleteAccountConfirmed: () => {
    track("delete_account_confirmed", base());
  },
};
