/**
 * Connected Accounts Card analytics — COMPONENT-048.
 * Dev stub — provider/action keys only; no tokens / emails.
 */

import {
  CONNECTED_ACCOUNTS_CARD_ANALYTICS_SOURCE,
  type ConnectedAccountsCardProvider,
} from "@/config/connected-accounts-card";
import type { ConnectedAccountsCardAction } from "@/utils/connected-accounts-card";

type Props = Record<string, string | number | boolean | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

function base(extra?: Props): Props {
  return {
    source: CONNECTED_ACCOUNTS_CARD_ANALYTICS_SOURCE,
    mock: true,
    ...extra,
  };
}

export const connectedAccountsCardAnalytics = {
  viewed: () => {
    track("connected_accounts_viewed", base());
  },

  providerActionClicked: (props: {
    provider: ConnectedAccountsCardProvider;
    action: ConnectedAccountsCardAction;
  }) => {
    track(
      "provider_action_clicked",
      base({
        provider: props.provider,
        action: props.action,
      }),
    );
  },
};
