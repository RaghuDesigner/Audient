/**
 * COMPONENT-059 — Role Selector constants.
 * Mock role assignment control — no backend.
 */

export const ROLE_SELECTOR_STATES = ["default", "loading", "error"] as const;

export type RoleSelectorState = (typeof ROLE_SELECTOR_STATES)[number];

export const ROLE_SELECTOR_COPY = {
  labelPrefix: "Role for",
  ownerDisabled: "Organization owner",
  loading: "Loading role…",
  defaultError: "Unable to update role.",
} as const;

export const ROLE_SELECTOR_ANALYTICS_SOURCE = "role_selector" as const;
