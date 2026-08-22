/**
 * COMPONENT-048 — Connected Accounts Card constants.
 * Mock connection status only — no OAuth / Supabase Auth linking.
 */

import type { SettingsAuthProvider } from "@/config/settings-screen";
import {
  SETTINGS_AUTH_PROVIDERS,
  SETTINGS_AUTH_PROVIDER_LABELS,
} from "@/config/settings-screen";

export const CONNECTED_ACCOUNTS_CARD_PROVIDERS = SETTINGS_AUTH_PROVIDERS;

export type ConnectedAccountsCardProvider = SettingsAuthProvider;

export const CONNECTED_ACCOUNTS_CARD_PROVIDER_LABELS =
  SETTINGS_AUTH_PROVIDER_LABELS;

export const CONNECTED_ACCOUNTS_CARD_STATUSES = [
  "connected",
  "not_connected",
] as const;

export type ConnectedAccountsCardStatus =
  (typeof CONNECTED_ACCOUNTS_CARD_STATUSES)[number];

export const CONNECTED_ACCOUNTS_CARD_COPY = {
  title: "Connected Accounts",
  intro: "See which sign-in providers are linked to your account.",
  connected: "Connected",
  notConnected: "Not Connected",
  connect: "Connect",
  disconnect: "Disconnect",
  comingSoon: "Account linking is coming soon.",
  loading: "Loading connected accounts…",
} as const;

export const CONNECTED_ACCOUNTS_CARD_ANALYTICS_SOURCE =
  "connected_accounts_card" as const;
