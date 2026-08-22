"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { AuthSessionFallback } from "@/components/auth/AuthSessionFallback";
import { BusinessWorkspaceScreen } from "@/components/team/BusinessWorkspaceScreen";
import { Button } from "@/components/ui/button";
import { BodySmall, H1 } from "@/components/ui/typography";
import {
  BUSINESS_WORKSPACE_BILLING_ROUTE,
  BUSINESS_WORKSPACE_COPY,
  BUSINESS_WORKSPACE_ROUTE,
  type BusinessWorkspaceScreenState,
} from "@/config/business-workspace-screen";
import { getMockBusinessWorkspace } from "@/data/mock-business-workspace";
import { useAppState } from "@/hooks/use-app-state";
import { useRealWorkspaceApi } from "@/hooks/use-real-workspace-api";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { businessWorkspaceAnalytics } from "@/lib/analytics/business-workspace-events";
import {
  createWorkspaceInvite,
  fetchWorkspaceBilling,
  fetchWorkspaceInvitations,
  fetchWorkspaceMembers,
  fetchWorkspaces,
  removeWorkspaceMemberApi,
} from "@/lib/workspace/client";
import { useUpgradePlansModalOptional } from "@/providers/upgrade-plans-modal-provider";
import { buildWorkspaceBundle, uiRoleToApi } from "@/utils/workspace-bundle";
import type { InviteMemberPayload } from "@/components/team/InviteMemberModal";
import type { MockBusinessWorkspaceBundle } from "@/data/mock-business-workspace";

export type WorkspaceClientProps = {
  state?: BusinessWorkspaceScreenState | null;
};

/**
 * SCREEN-020 client shell — guest → sign-in; Free/Pro → forbidden; Business → hub.
 * Real Supabase sessions load workspace APIs; mock-* keeps mock bundle.
 */
export function WorkspaceClient({ state = null }: WorkspaceClientProps) {
  const router = useRouter();
  const { user, isReady } = useRequireAuth({
    redirectTo: BUSINESS_WORKSPACE_ROUTE,
  });
  const { appState, effectiveUser } = useAppState();
  const upgradeModal = useUpgradePlansModalOptional();
  const useRealApi = useRealWorkspaceApi();
  const forbiddenTracked = React.useRef(false);
  const canAccessWorkspace = appState.permissions.canAccessWorkspace;
  const planTier = effectiveUser?.planTier ?? user?.planTier;

  const [bundle, setBundle] = React.useState<MockBusinessWorkspaceBundle>(() =>
    getMockBusinessWorkspace({
      state: state ?? undefined,
      empty: state === "empty",
    }),
  );
  const [workspaceId, setWorkspaceId] = React.useState<string | null>(null);
  const [loadState, setLoadState] =
    React.useState<BusinessWorkspaceScreenState>(state ?? "loading");

  const reloadReal = React.useCallback(async () => {
    setLoadState("loading");
    try {
      const workspaces = await fetchWorkspaces();
      const primary =
        workspaces.find((w) => !w.isPersonal) ?? workspaces[0] ?? null;
      if (!primary) {
        setBundle(
          getMockBusinessWorkspace({ state: "empty", empty: true }),
        );
        setWorkspaceId(null);
        setLoadState("empty");
        return;
      }
      setWorkspaceId(primary.id);
      const [members, invitations, billing] = await Promise.all([
        fetchWorkspaceMembers(primary.id),
        fetchWorkspaceInvitations(primary.id),
        fetchWorkspaceBilling(primary.id).catch(() => null),
      ]);
      const next = buildWorkspaceBundle({
        workspace: primary,
        members,
        invitations,
        billing,
      });
      setBundle(next);
      setLoadState(next.state);
    } catch {
      setLoadState("error");
    }
  }, []);

  React.useEffect(() => {
    if (!isReady || !user) return;
    if (!canAccessWorkspace) return;

    if (!useRealApi) {
      setBundle(
        getMockBusinessWorkspace({
          state: state ?? undefined,
          empty: state === "empty",
          credits: appState.credits,
        }),
      );
      setLoadState(state ?? "success");
      return;
    }

    void reloadReal();
  }, [
    appState.credits,
    canAccessWorkspace,
    isReady,
    reloadReal,
    state,
    useRealApi,
    user,
  ]);

  React.useEffect(() => {
    if (!isReady || !user) return;
    if (canAccessWorkspace) return;
    if (forbiddenTracked.current) return;
    forbiddenTracked.current = true;
    businessWorkspaceAnalytics.forbiddenViewed({
      planTier: planTier ?? "FREE",
    });
  }, [canAccessWorkspace, isReady, planTier, user]);

  const handleInviteSend = async (payload: InviteMemberPayload) => {
    if (!useRealApi || !workspaceId) {
      const id = `tm-invite-${Date.now()}`;
      setBundle((prev) => ({
        ...prev,
        members: [
          {
            id,
            name: payload.email.split("@")[0] || payload.email,
            email: payload.email,
            avatarUrl: null,
            role: payload.role,
            status: "invited",
            lastActive: "Invite pending",
          },
          ...prev.members,
        ],
        overview: {
          ...prev.overview,
          totalMembers: prev.overview.totalMembers + 1,
          pendingInvitations: prev.overview.pendingInvitations + 1,
        },
      }));
      return;
    }

    await createWorkspaceInvite({
      workspaceId,
      email: payload.email,
      role: uiRoleToApi(payload.role),
    });
    await reloadReal();
  };

  const handleRemoveMember = async (id: string) => {
    if (!useRealApi || !workspaceId) {
      setBundle((prev) => {
        const target = prev.members.find((m) => m.id === id);
        return {
          ...prev,
          members: prev.members.filter((m) => m.id !== id),
          overview: {
            ...prev.overview,
            totalMembers: Math.max(0, prev.overview.totalMembers - 1),
            activeMembers:
              target?.status === "active"
                ? Math.max(0, prev.overview.activeMembers - 1)
                : prev.overview.activeMembers,
            pendingInvitations:
              target?.status === "invited"
                ? Math.max(0, prev.overview.pendingInvitations - 1)
                : prev.overview.pendingInvitations,
          },
        };
      });
      return;
    }

    if (id.startsWith("invite:")) {
      const invitationId = id.slice("invite:".length);
      await fetch(
        `/api/workspaces/invitations/${encodeURIComponent(invitationId)}`,
        { method: "DELETE" },
      );
      await reloadReal();
      return;
    }

    await removeWorkspaceMemberApi({ workspaceId, memberId: id });
    await reloadReal();
  };

  if (!isReady || !user) {
    return (
      <AuthSessionFallback message={BUSINESS_WORKSPACE_COPY.guestRedirect} />
    );
  }

  if (!canAccessWorkspace) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-lg bg-background px-md py-lg">
        <div
          className="flex w-full max-w-md flex-col gap-md rounded-md border border-border bg-surface p-lg text-center shadow-sm"
          role="status"
        >
          <H1 className="text-foreground">
            {BUSINESS_WORKSPACE_COPY.forbiddenTitle}
          </H1>
          <BodySmall className="text-muted-foreground">
            {BUSINESS_WORKSPACE_COPY.forbiddenDescription}
          </BodySmall>
          <div className="flex flex-col gap-sm sm:flex-row sm:justify-center">
            <Button
              type="button"
              variant="primary"
              className="min-h-11 text-primary-foreground"
              onClick={() => {
                if (upgradeModal) {
                  upgradeModal.openUpgrade({
                    reason: "business_workspace",
                    source: "workspace_forbidden",
                  });
                  return;
                }
                router.push(BUSINESS_WORKSPACE_BILLING_ROUTE);
              }}
            >
              {BUSINESS_WORKSPACE_COPY.upgradeCta}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              onClick={() => router.push("/dashboard")}
            >
              {BUSINESS_WORKSPACE_COPY.back}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <BusinessWorkspaceScreen
      key={`${user.id}-${loadState}-${workspaceId ?? "mock"}`}
      data={bundle}
      screenState={loadState}
      onInviteSend={handleInviteSend}
      onRemoveMember={handleRemoveMember}
      onRetry={() => {
        if (useRealApi) {
          void reloadReal();
          return;
        }
        setBundle(
          getMockBusinessWorkspace({
            state: "success",
            credits: appState.credits,
          }),
        );
        setLoadState("success");
      }}
    />
  );
}
