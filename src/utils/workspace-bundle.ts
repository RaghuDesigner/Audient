/**
 * Map API workspace DTOs → SCREEN-020 card models.
 */

import type {
  ApiWorkspace,
  ApiWorkspaceInvitation,
  ApiWorkspaceMember,
} from "@/lib/workspace/client";
import type { MockBusinessWorkspaceBundle } from "@/data/mock-business-workspace";
import type { TeamMemberRole, TeamMemberStatus } from "@/config/team-member-card";
import type { TeamMemberCardModel } from "@/utils/team-member-card";
import type { TeamOverviewCardData } from "@/utils/team-overview-card";
import type { BusinessUsageMetrics } from "@/utils/business-usage-widget";
import type { TeamActivityItem } from "@/utils/team-activity-card";

const ROLE_MAP: Record<string, TeamMemberRole> = {
  OWNER: "owner",
  ADMIN: "admin",
  DESIGNER: "designer",
  ANALYST: "analyst",
  VIEWER: "viewer",
};

const STATUS_MAP: Record<string, TeamMemberStatus> = {
  ACTIVE: "active",
  INVITED: "invited",
  SUSPENDED: "suspended",
};

export function apiRoleToUi(role: string): TeamMemberRole {
  return ROLE_MAP[role.toUpperCase()] ?? "viewer";
}

export function uiRoleToApi(role: TeamMemberRole): string {
  return role.toUpperCase();
}

export function mapApiMemberToCard(
  member: ApiWorkspaceMember,
): TeamMemberCardModel {
  return {
    id: member.id,
    name: member.name?.trim() || member.email.split("@")[0] || member.email,
    email: member.email,
    avatarUrl: null,
    role: apiRoleToUi(member.role),
    status: STATUS_MAP[member.status.toUpperCase()] ?? "active",
    lastActive: member.joinedAt
      ? new Date(member.joinedAt).toLocaleDateString()
      : "—",
  };
}

export function mapPendingInviteToCard(
  invite: ApiWorkspaceInvitation,
): TeamMemberCardModel {
  return {
    id: `invite:${invite.id}`,
    name: invite.inviteeEmail.split("@")[0] || invite.inviteeEmail,
    email: invite.inviteeEmail,
    avatarUrl: null,
    role: apiRoleToUi(invite.role),
    status: "invited",
    lastActive: "Invite pending",
  };
}

export function buildWorkspaceBundle(input: {
  workspace: ApiWorkspace;
  members: ApiWorkspaceMember[];
  invitations: ApiWorkspaceInvitation[];
  billing: {
    planTier: string | null;
    creditsRemaining: number | "unlimited" | null;
  } | null;
  auditCount?: number;
}): MockBusinessWorkspaceBundle {
  const pending = input.invitations.filter((i) => i.status === "PENDING");
  const memberCards = input.members.map(mapApiMemberToCard);
  const inviteCards = pending.map(mapPendingInviteToCard);
  const members = [...inviteCards, ...memberCards];

  const activeMembers = input.members.filter((m) => m.status === "ACTIVE")
    .length;

  const planLabel =
    input.billing?.planTier === "ENTERPRISE"
      ? "Business"
      : input.billing?.planTier === "PRO"
        ? "Pro"
        : input.billing?.planTier === "FREE"
          ? "Free"
          : input.billing?.planTier ?? "Business";

  const overview: TeamOverviewCardData = {
    teamName: input.workspace.name,
    plan: planLabel,
    totalMembers: input.members.length + pending.length,
    activeMembers,
    pendingInvitations: pending.length,
    totalAudits: input.auditCount ?? 0,
    creditsRemaining:
      input.billing?.creditsRemaining === "unlimited"
        ? "unlimited"
        : (input.billing?.creditsRemaining ?? 0),
  };

  const usage: BusinessUsageMetrics = {
    totalAudits: overview.totalAudits,
    monthlyAudits: overview.totalAudits,
    creditsUsed: 0,
    creditsRemaining:
      overview.creditsRemaining === "unlimited"
        ? 0
        : Number(overview.creditsRemaining) || 0,
    creditsGrant: 0,
    storageUsedGb: 0,
    storageQuotaGb: 0,
    activeMembers,
    chartSeries: [],
  };

  const activity: TeamActivityItem[] = [];

  return {
    state: members.length === 0 ? "empty" : "success",
    overview,
    usage,
    members,
    activity,
  };
}
