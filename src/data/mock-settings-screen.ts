/**
 * Phase-1 mock Settings screen — SCREEN-019.
 * Client mock only — no Supabase / no API / no real deletion.
 */

import type {
  SettingsAppearance,
  SettingsAuthProvider,
  SettingsDateFormat,
  SettingsLanguage,
  SettingsNotificationCategory,
  SettingsScreenState,
  SettingsTimezone,
} from "@/config/settings-screen";
import { SETTINGS_NOTIFICATION_CATEGORIES } from "@/config/settings-screen";
import { MOCK_USER_DISPLAY_NAME, MOCK_USER_EMAIL } from "@/lib/auth/mock-session";
import type { AuthPlanTier } from "@/types/auth";

export type MockSettingsProfile = {
  fullName: string;
  email: string;
  avatarUrl: string | null;
  companyName: string | null;
  role: string | null;
};

export type MockSettingsPreferences = {
  language: SettingsLanguage;
  timezone: SettingsTimezone;
  appearance: SettingsAppearance;
  dateFormat: SettingsDateFormat;
};

export type MockSettingsNotificationPrefs = Record<
  SettingsNotificationCategory,
  boolean
>;

export type MockSettingsSession = {
  deviceLabel: string;
  lastActiveLabel: string;
  locationLabel: string;
};

export type MockSettingsConnected = Record<
  SettingsAuthProvider,
  "connected" | "not_connected"
>;

export type MockSettingsBundle = {
  state: SettingsScreenState;
  userId: string;
  profile: MockSettingsProfile;
  preferences: MockSettingsPreferences;
  notificationPrefs: MockSettingsNotificationPrefs;
  authProvider: SettingsAuthProvider;
  session: MockSettingsSession;
  connected: MockSettingsConnected;
};

const DEFAULT_NOTIFICATION_PREFS: MockSettingsNotificationPrefs = {
  audit_completed: true,
  audit_failed: true,
  low_credits: true,
  billing: true,
  membership: true,
  team_activity: false,
  product_updates: false,
};

function defaultConnected(
  primary: SettingsAuthProvider,
): MockSettingsConnected {
  return {
    google: primary === "google" ? "connected" : "not_connected",
    apple: primary === "apple" ? "connected" : "not_connected",
    microsoft: primary === "microsoft" ? "connected" : "not_connected",
  };
}

function emptyProfile(email = ""): MockSettingsProfile {
  return {
    fullName: "",
    email,
    avatarUrl: null,
    companyName: null,
    role: null,
  };
}

function defaultPreferences(): MockSettingsPreferences {
  return {
    language: "en",
    timezone: "America/New_York",
    appearance: "system",
    dateFormat: "mdy",
  };
}

function defaultSession(): MockSettingsSession {
  return {
    deviceLabel: "Chrome on macOS",
    lastActiveLabel: "Active now",
    locationLabel: "New York, US (approx.)",
  };
}

function emptyBundle(
  state: SettingsScreenState,
  userId: string,
): MockSettingsBundle {
  return {
    state,
    userId,
    profile: emptyProfile(),
    preferences: defaultPreferences(),
    notificationPrefs: { ...DEFAULT_NOTIFICATION_PREFS },
    authProvider: "google",
    session: defaultSession(),
    connected: defaultConnected("google"),
  };
}

export function getMockSettingsScreen(input?: {
  userId?: string;
  email?: string | null;
  fullName?: string | null;
  avatarUrl?: string | null;
  planTier?: AuthPlanTier;
  /** Mock IdP — not on AuthUser; default google. */
  authProvider?: SettingsAuthProvider;
  state?: SettingsScreenState;
}): MockSettingsBundle {
  const userId = input?.userId ?? "mock-settings-user";
  const state = input?.state ?? "success";
  const authProvider = input?.authProvider ?? "google";

  if (state === "loading") {
    return emptyBundle("loading", userId);
  }

  if (state === "error") {
    return emptyBundle("error", userId);
  }

  const email = input?.email?.trim() || MOCK_USER_EMAIL;
  const fullName = input?.fullName?.trim() || MOCK_USER_DISPLAY_NAME;

  return {
    state: "success",
    userId,
    profile: {
      fullName,
      email,
      avatarUrl: input?.avatarUrl ?? null,
      companyName: "Audient Labs",
      role: "Product Designer",
    },
    preferences: defaultPreferences(),
    notificationPrefs: {
      ...DEFAULT_NOTIFICATION_PREFS,
      team_activity: input?.planTier === "ENTERPRISE",
    },
    authProvider,
    session: defaultSession(),
    connected: defaultConnected(authProvider),
  };
}

/** Deep clone for dirty/cancel snapshots. */
export function cloneMockSettingsBundle(
  bundle: MockSettingsBundle,
): MockSettingsBundle {
  return {
    ...bundle,
    profile: { ...bundle.profile },
    preferences: { ...bundle.preferences },
    notificationPrefs: { ...bundle.notificationPrefs },
    session: { ...bundle.session },
    connected: { ...bundle.connected },
  };
}

export function assertNotificationPrefsComplete(
  prefs: MockSettingsNotificationPrefs,
): boolean {
  return SETTINGS_NOTIFICATION_CATEGORIES.every((key) => key in prefs);
}

export const MOCK_SETTINGS_SCREEN_SUCCESS = getMockSettingsScreen({
  userId: "mock-google-user",
  authProvider: "google",
});

export const MOCK_SETTINGS_SCREEN_LOADING = getMockSettingsScreen({
  state: "loading",
});

export const MOCK_SETTINGS_SCREEN_ERROR = getMockSettingsScreen({
  state: "error",
});
