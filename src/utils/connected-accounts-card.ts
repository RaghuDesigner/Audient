/**
 * COMPONENT-048 — Connected Accounts Card helpers.
 * Status / action labels — no React / no OAuth / no API.
 */

import {
  CONNECTED_ACCOUNTS_CARD_COPY,
  CONNECTED_ACCOUNTS_CARD_PROVIDERS,
  type ConnectedAccountsCardProvider,
  type ConnectedAccountsCardStatus,
} from "@/config/connected-accounts-card";

export type ConnectedAccountsCardMap = Record<
  ConnectedAccountsCardProvider,
  ConnectedAccountsCardStatus
>;

export type ConnectedAccountsCardAction = "connect" | "disconnect";

export function connectedAccountsCardStatusLabel(
  status: ConnectedAccountsCardStatus,
): string {
  return status === "connected"
    ? CONNECTED_ACCOUNTS_CARD_COPY.connected
    : CONNECTED_ACCOUNTS_CARD_COPY.notConnected;
}

export function connectedAccountsCardActionForStatus(
  status: ConnectedAccountsCardStatus,
): ConnectedAccountsCardAction {
  return status === "connected" ? "disconnect" : "connect";
}

export function connectedAccountsCardActionLabel(
  action: ConnectedAccountsCardAction,
): string {
  return action === "connect"
    ? CONNECTED_ACCOUNTS_CARD_COPY.connect
    : CONNECTED_ACCOUNTS_CARD_COPY.disconnect;
}

export function isValidConnectedAccountsCardMap(
  accounts: Partial<ConnectedAccountsCardMap> | null | undefined,
): accounts is ConnectedAccountsCardMap {
  if (accounts == null) return false;
  return CONNECTED_ACCOUNTS_CARD_PROVIDERS.every(
    (key) =>
      accounts[key] === "connected" || accounts[key] === "not_connected",
  );
}
