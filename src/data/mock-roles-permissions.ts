/**
 * SCREEN-022 — Mock Roles & Permissions bundle.
 * Aggregates team mocks — no backend / no Supabase.
 */

import type { RolesPermissionsScreenState } from "@/config/roles-permissions-screen";
import type { RolesPermissionsActorRole } from "@/config/roles-permissions-screen";
import { getMockTeamMembers } from "@/data/mock-team-members";
import type { TeamMemberCardModel } from "@/utils/team-member-card";

export type MockRolesPermissionsBundle = {
  state: RolesPermissionsScreenState;
  members: TeamMemberCardModel[];
  adminBillingEnabled: boolean;
  actorRole: RolesPermissionsActorRole;
  /** When true, mock save rejects (QA via ?state=error on save — handled in screen). */
  saveShouldFail: boolean;
};

export function getMockRolesPermissions(input?: {
  state?: RolesPermissionsScreenState;
  empty?: boolean;
  actorRole?: RolesPermissionsActorRole;
  adminBillingEnabled?: boolean;
  saveShouldFail?: boolean;
}): MockRolesPermissionsBundle {
  const empty = input?.empty === true || input?.state === "empty";
  const members = empty ? [] : getMockTeamMembers();

  let state: RolesPermissionsScreenState = input?.state ?? "success";
  const actorRole = input?.actorRole ?? "owner";

  if (state === "unauthorized") {
    return {
      state: "unauthorized",
      members: [],
      adminBillingEnabled: input?.adminBillingEnabled ?? true,
      actorRole,
      saveShouldFail: false,
    };
  }

  if (state === "loading" || state === "error") {
    return {
      state,
      members: state === "error" ? [] : members,
      adminBillingEnabled: input?.adminBillingEnabled ?? true,
      actorRole,
      saveShouldFail: input?.saveShouldFail ?? false,
    };
  }

  if (empty) {
    state = "empty";
  }

  return {
    state,
    members,
    adminBillingEnabled: input?.adminBillingEnabled ?? true,
    actorRole,
    saveShouldFail: input?.saveShouldFail ?? false,
  };
}
