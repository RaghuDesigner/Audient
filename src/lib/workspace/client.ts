/**
 * Browser client for workspace team APIs (BACKEND-009B).
 */

export type ApiWorkspace = {
  id: string;
  name: string;
  ownerId: string;
  isPersonal: boolean;
  role: string;
  createdAt: string;
};

export type ApiWorkspaceMember = {
  id: string;
  workspaceId: string;
  userId: string;
  role: string;
  status: string;
  joinedAt: string;
  name: string | null;
  email: string;
};

export type ApiWorkspaceInvitation = {
  id: string;
  workspaceId: string;
  inviterId: string;
  inviteeEmail: string;
  inviteeUserId: string | null;
  role: string;
  status: string;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
};

async function parseJson<T>(response: Response): Promise<T> {
  const data = (await response.json().catch(() => null)) as T & {
    error?: string;
    code?: string;
  };
  if (!response.ok) {
    const err = new Error(
      (data as { error?: string })?.error ?? "Workspace request failed",
    ) as Error & { code?: string; status?: number };
    err.code = (data as { code?: string })?.code;
    err.status = response.status;
    throw err;
  }
  return data;
}

export async function fetchWorkspaces(): Promise<ApiWorkspace[]> {
  const response = await fetch("/api/workspaces", { cache: "no-store" });
  const data = await parseJson<{ workspaces: ApiWorkspace[] }>(response);
  return data.workspaces ?? [];
}

export async function fetchWorkspaceMembers(
  workspaceId: string,
): Promise<ApiWorkspaceMember[]> {
  const response = await fetch(
    `/api/workspaces/${encodeURIComponent(workspaceId)}/members`,
    { cache: "no-store" },
  );
  const data = await parseJson<{ members: ApiWorkspaceMember[] }>(response);
  return data.members ?? [];
}

export async function fetchWorkspaceInvitations(
  workspaceId: string,
): Promise<ApiWorkspaceInvitation[]> {
  const response = await fetch(
    `/api/workspaces/${encodeURIComponent(workspaceId)}/invitations`,
    { cache: "no-store" },
  );
  const data = await parseJson<{ invitations: ApiWorkspaceInvitation[] }>(
    response,
  );
  return data.invitations ?? [];
}

export async function fetchWorkspaceBilling(workspaceId: string): Promise<{
  planTier: string | null;
  membershipStatus: string | null;
  creditsRemaining: number | "unlimited" | null;
  canManageBilling: boolean;
  canViewInvoices: boolean;
} | null> {
  const response = await fetch(
    `/api/workspaces/${encodeURIComponent(workspaceId)}/billing`,
    { cache: "no-store" },
  );
  if (response.status === 403) return null;
  const data = await parseJson<{
    billing: {
      planTier: string | null;
      membershipStatus: string | null;
      creditsRemaining: number | "unlimited" | null;
      canManageBilling: boolean;
      canViewInvoices: boolean;
    };
  }>(response);
  return data.billing;
}

export async function createWorkspaceInvite(input: {
  workspaceId: string;
  email: string;
  role: string;
}): Promise<{
  invitation: ApiWorkspaceInvitation;
}> {
  const response = await fetch(
    `/api/workspaces/${encodeURIComponent(input.workspaceId)}/invitations`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: input.email, role: input.role }),
    },
  );
  return parseJson(response);
}

export async function removeWorkspaceMemberApi(input: {
  workspaceId: string;
  memberId: string;
}): Promise<void> {
  const response = await fetch(
    `/api/workspaces/${encodeURIComponent(input.workspaceId)}/members/${encodeURIComponent(input.memberId)}`,
    { method: "DELETE" },
  );
  await parseJson(response);
}

export async function updateWorkspaceMemberRoleApi(input: {
  workspaceId: string;
  memberId: string;
  role: string;
}): Promise<ApiWorkspaceMember> {
  const response = await fetch(
    `/api/workspaces/${encodeURIComponent(input.workspaceId)}/members/${encodeURIComponent(input.memberId)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: input.role }),
    },
  );
  const data = await parseJson<{ member: ApiWorkspaceMember }>(response);
  return data.member;
}

export async function acceptWorkspaceInviteApi(input: {
  invitationId: string;
  token: string;
}): Promise<void> {
  const response = await fetch(
    `/api/workspaces/invitations/${encodeURIComponent(input.invitationId)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: input.token }),
    },
  );
  await parseJson(response);
}
