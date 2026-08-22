/**
 * COMPONENT-053 — Invite Member Modal helpers.
 * Validation only — no React / no email API.
 */

import {
  INVITE_MEMBER_MODAL_COPY,
  INVITE_MEMBER_ROLES,
  type InviteMemberRole,
} from "@/config/invite-member-modal";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type InviteMemberFormValues = {
  email: string;
  role: InviteMemberRole | "";
  message: string;
};

export type InviteMemberFieldErrors = {
  email?: string;
  role?: string;
};

export function isInviteMemberRole(
  value: string,
): value is InviteMemberRole {
  return (INVITE_MEMBER_ROLES as readonly string[]).includes(value);
}

export function isValidInviteMemberEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

export function validateInviteMemberForm(
  values: InviteMemberFormValues,
): InviteMemberFieldErrors {
  const errors: InviteMemberFieldErrors = {};
  const email = values.email.trim();

  if (!email) {
    errors.email = INVITE_MEMBER_MODAL_COPY.emailRequired;
  } else if (!isValidInviteMemberEmail(email)) {
    errors.email = INVITE_MEMBER_MODAL_COPY.emailInvalid;
  }

  if (!values.role || !isInviteMemberRole(values.role)) {
    errors.role = INVITE_MEMBER_MODAL_COPY.roleRequired;
  }

  return errors;
}

export function hasInviteMemberFieldErrors(
  errors: InviteMemberFieldErrors,
): boolean {
  return Object.keys(errors).length > 0;
}

export function normalizeInviteMemberMessage(
  message: string,
): string | undefined {
  const trimmed = message.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function emptyInviteMemberForm(
  defaultRole: InviteMemberRole | "" = "",
): InviteMemberFormValues {
  return {
    email: "",
    role: defaultRole,
    message: "",
  };
}
