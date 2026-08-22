/**
 * COMPONENT-053 — Invite Member Modal constants.
 * Mock invite only — no email sending / no backend.
 */

import type { AssignableTeamMemberRole } from "@/config/team-member-card";
import { ASSIGNABLE_TEAM_MEMBER_ROLES } from "@/config/team-member-card";

export const INVITE_MEMBER_MODAL_STATES = [
  "default",
  "loading",
  "success",
  "error",
] as const;

export type InviteMemberModalState =
  (typeof INVITE_MEMBER_MODAL_STATES)[number];

/** Inviteable roles — Owner is not assignable via invite. */
export const INVITE_MEMBER_ROLES = ASSIGNABLE_TEAM_MEMBER_ROLES;

export type InviteMemberRole = AssignableTeamMemberRole;

export const INVITE_MEMBER_ROLE_LABELS: Record<InviteMemberRole, string> = {
  admin: "Admin",
  designer: "Designer",
  analyst: "Analyst",
  viewer: "Viewer",
};

export const INVITE_MEMBER_MODAL_COPY = {
  title: "Invite member",
  description:
    "Send a mock invitation to join this Business workspace. No email is sent.",
  email: "Email",
  role: "Role",
  message: "Message",
  messageOptional: "Optional",
  messagePlaceholder: "Add a short note (optional)",
  rolePlaceholder: "Select a role",
  send: "Send Invite",
  sending: "Sending…",
  cancel: "Cancel",
  success: "Invitation sent (mock).",
  error: "Unable to send invitation. Try again.",
  emailRequired: "Email is required.",
  emailInvalid: "Enter a valid email address.",
  roleRequired: "Role is required.",
} as const;

export const INVITE_MEMBER_MESSAGE_MAX_LENGTH = 500 as const;

export const INVITE_MEMBER_MODAL_ANALYTICS_SOURCE =
  "invite_member_modal" as const;

export const INVITE_MEMBER_MOCK_DELAY_MS = 500 as const;
