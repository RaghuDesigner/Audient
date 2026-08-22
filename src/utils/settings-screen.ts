/**
 * SCREEN-019 — Settings helpers.
 * Dirty detection + light validation — no React / no API.
 */

import {
  SETTINGS_COPY,
  SETTINGS_NAME_MAX_LENGTH,
} from "@/config/settings-screen";
import type {
  MockSettingsBundle,
  MockSettingsNotificationPrefs,
  MockSettingsPreferences,
  MockSettingsProfile,
} from "@/data/mock-settings-screen";

export type SettingsEditableSlice = {
  profile: MockSettingsProfile;
  preferences: MockSettingsPreferences;
  notificationPrefs: MockSettingsNotificationPrefs;
};

export type SettingsFieldErrors = {
  fullName?: string;
};

/** Editable fields compared for unsaved-changes detection. */
export function getSettingsEditableSlice(
  bundle: MockSettingsBundle,
): SettingsEditableSlice {
  return {
    profile: {
      fullName: bundle.profile.fullName,
      email: bundle.profile.email,
      avatarUrl: bundle.profile.avatarUrl,
      companyName: bundle.profile.companyName,
      role: bundle.profile.role,
    },
    preferences: { ...bundle.preferences },
    notificationPrefs: { ...bundle.notificationPrefs },
  };
}

export function settingsSlicesEqual(
  a: SettingsEditableSlice,
  b: SettingsEditableSlice,
): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function isSettingsDirty(
  saved: SettingsEditableSlice,
  draft: SettingsEditableSlice,
): boolean {
  return !settingsSlicesEqual(saved, draft);
}

export function validateSettingsProfile(
  profile: MockSettingsProfile,
): SettingsFieldErrors {
  const errors: SettingsFieldErrors = {};
  const name = profile.fullName.trim();
  if (!name) {
    errors.fullName = SETTINGS_COPY.nameRequired;
  } else if (name.length > SETTINGS_NAME_MAX_LENGTH) {
    errors.fullName = SETTINGS_COPY.nameTooLong;
  }
  return errors;
}

export function hasSettingsFieldErrors(errors: SettingsFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

/** Apply draft edits onto a clone of the saved bundle (email stays from saved). */
export function applySettingsDraft(
  saved: MockSettingsBundle,
  draft: SettingsEditableSlice,
): MockSettingsBundle {
  return {
    ...saved,
    profile: {
      ...draft.profile,
      email: saved.profile.email,
    },
    preferences: { ...draft.preferences },
    notificationPrefs: { ...draft.notificationPrefs },
  };
}

export function displayOptionalField(
  value: string | null | undefined,
  placeholder = SETTINGS_COPY.notProvided,
): string {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : placeholder;
}
