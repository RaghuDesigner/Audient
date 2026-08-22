/**
 * COMPONENT-044 — Profile Settings Card helpers.
 * Validation + normalize — no React / no API.
 */

import {
  PROFILE_SETTINGS_CARD_COPY,
  PROFILE_SETTINGS_NAME_MAX_LENGTH,
} from "@/config/profile-settings-card";

export type ProfileSettingsValues = {
  fullName: string;
  email: string;
  company: string | null;
  role: string | null;
  avatarUrl: string | null;
};

export type ProfileSettingsFieldErrors = {
  fullName?: string;
};

export function normalizeOptionalText(
  value: string | null | undefined,
): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}

export function displayOptionalProfileField(
  value: string | null | undefined,
  placeholder = PROFILE_SETTINGS_CARD_COPY.notProvided,
): string {
  return normalizeOptionalText(value) ?? placeholder;
}

export function validateProfileSettingsValues(
  values: Pick<ProfileSettingsValues, "fullName">,
): ProfileSettingsFieldErrors {
  const errors: ProfileSettingsFieldErrors = {};
  const name = values.fullName.trim();
  if (!name) {
    errors.fullName = PROFILE_SETTINGS_CARD_COPY.nameRequired;
  } else if (name.length > PROFILE_SETTINGS_NAME_MAX_LENGTH) {
    errors.fullName = PROFILE_SETTINGS_CARD_COPY.nameTooLong;
  }
  return errors;
}

export function hasProfileSettingsFieldErrors(
  errors: ProfileSettingsFieldErrors,
): boolean {
  return Object.keys(errors).length > 0;
}

/** Prepare values for mock save — trim name; null empty optionals; email unchanged. */
export function prepareProfileSettingsSave(
  values: ProfileSettingsValues,
): ProfileSettingsValues {
  return {
    fullName: values.fullName.trim(),
    email: values.email,
    company: normalizeOptionalText(values.company),
    role: normalizeOptionalText(values.role),
    avatarUrl: values.avatarUrl,
  };
}

export function profileSettingsValuesEqual(
  a: ProfileSettingsValues,
  b: ProfileSettingsValues,
): boolean {
  return (
    a.fullName === b.fullName &&
    a.email === b.email &&
    a.company === b.company &&
    a.role === b.role &&
    a.avatarUrl === b.avatarUrl
  );
}
