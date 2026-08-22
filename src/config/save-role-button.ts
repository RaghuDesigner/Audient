/**
 * COMPONENT-061 — Save Role Button constants.
 * Roles & Permissions save control — mock only; no backend / no Supabase.
 */

import { ROLES_PERMISSIONS_COPY } from "@/config/roles-permissions-screen";
import {
  SAVE_CHANGES_BUTTON_STATES,
  SAVE_CHANGES_BUTTON_SUCCESS_FLASH_MS,
  type SaveChangesButtonState,
} from "@/config/save-changes-button";

export const SAVE_ROLE_BUTTON_STATES = SAVE_CHANGES_BUTTON_STATES;

export type SaveRoleButtonState = SaveChangesButtonState;

export const SAVE_ROLE_BUTTON_COPY = {
  label: "Save changes",
  labelLoading: "Saving…",
  labelDisabled: "Save changes, no unsaved changes",
  labelBusy: "Saving permissions",
  success: ROLES_PERMISSIONS_COPY.saveSuccess,
  error: ROLES_PERMISSIONS_COPY.saveError,
  retry: "Retry",
} as const;

export const SAVE_ROLE_BUTTON_ANALYTICS_SOURCE = "save_role_button" as const;

export const SAVE_ROLE_BUTTON_SUCCESS_FLASH_MS =
  SAVE_CHANGES_BUTTON_SUCCESS_FLASH_MS;
