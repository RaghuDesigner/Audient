"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { AuthSessionFallback } from "@/components/auth/AuthSessionFallback";
import { RolesPermissionsScreen } from "@/components/team/RolesPermissionsScreen";
import { Button } from "@/components/ui/button";
import { BodySmall, H1 } from "@/components/ui/typography";
import {
  BUSINESS_WORKSPACE_BILLING_ROUTE,
  BUSINESS_WORKSPACE_COPY,
} from "@/config/business-workspace-screen";
import {
  ROLES_PERMISSIONS_COPY,
  ROLES_PERMISSIONS_ROUTE,
  ROLES_PERMISSIONS_WORKSPACE_ROUTE,
  type RolesPermissionsActorRole,
  type RolesPermissionsScreenState,
} from "@/config/roles-permissions-screen";
import { getMockRolesPermissions } from "@/data/mock-roles-permissions";
import { useAppState } from "@/hooks/use-app-state";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { rolesPermissionsAnalytics } from "@/lib/analytics/roles-permissions-events";
import { actorCanManageRoles } from "@/utils/roles-permissions-screen";
import { useUpgradePlansModalOptional } from "@/providers/upgrade-plans-modal-provider";

export type RolesClientProps = {
  state?: RolesPermissionsScreenState | null;
  actor?: RolesPermissionsActorRole | null;
  saveShouldFail?: boolean;
};

/**
 * SCREEN-022 client shell — guest → sign-in; Free/Pro → forbidden;
 * Business unauthorized → §13; Business Owner/Admin → full screen.
 */
export function RolesClient({
  state = null,
  actor = null,
  saveShouldFail = false,
}: RolesClientProps) {
  const router = useRouter();
  const { user, isReady } = useRequireAuth({
    redirectTo: ROLES_PERMISSIONS_ROUTE,
  });
  const { appState, effectiveUser } = useAppState();
  const upgradeModal = useUpgradePlansModalOptional();
  const forbiddenTracked = React.useRef(false);
  const unauthorizedTracked = React.useRef(false);
  const canAccessWorkspace = appState.permissions.canAccessWorkspace;
  const planTier = effectiveUser?.planTier ?? user?.planTier;

  const resolvedActor: RolesPermissionsActorRole =
    actor ?? (state === "unauthorized" ? "viewer" : "owner");

  const [bundle, setBundle] = React.useState(() =>
    getMockRolesPermissions({
      state: state ?? undefined,
      actorRole: resolvedActor,
      saveShouldFail,
    }),
  );

  React.useEffect(() => {
    if (!isReady || !user) return;
    if (!canAccessWorkspace) return;
    setBundle(
      getMockRolesPermissions({
        state: state ?? undefined,
        actorRole: resolvedActor,
        saveShouldFail,
      }),
    );
  }, [canAccessWorkspace, isReady, resolvedActor, saveShouldFail, state, user]);

  React.useEffect(() => {
    if (!isReady || !user) return;
    if (canAccessWorkspace) return;
    if (forbiddenTracked.current) return;
    forbiddenTracked.current = true;
    rolesPermissionsAnalytics.forbiddenViewed({
      planTier: planTier ?? "FREE",
    });
  }, [canAccessWorkspace, isReady, planTier, user]);

  React.useEffect(() => {
    if (!isReady || !user) return;
    if (!canAccessWorkspace) return;
    if (actorCanManageRoles(resolvedActor)) return;
    if (unauthorizedTracked.current) return;
    unauthorizedTracked.current = true;
    rolesPermissionsAnalytics.unauthorizedViewed({
      actorRole: resolvedActor,
    });
  }, [canAccessWorkspace, isReady, resolvedActor, user]);

  if (!isReady || !user) {
    return (
      <AuthSessionFallback message={ROLES_PERMISSIONS_COPY.guestRedirect} />
    );
  }

  if (!canAccessWorkspace) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-lg bg-background px-md py-lg">
        <div
          className="flex w-full max-w-md flex-col gap-md rounded-md border border-border bg-surface p-lg text-center shadow-sm"
          role="status"
        >
          <H1 className="text-h3 text-foreground">
            {ROLES_PERMISSIONS_COPY.forbiddenTitle}
          </H1>
          <BodySmall className="text-muted-foreground">
            {ROLES_PERMISSIONS_COPY.forbiddenDescription}
          </BodySmall>
          <div className="flex flex-col gap-sm sm:flex-row sm:justify-center">
            <Button
              type="button"
              variant="primary"
              className="min-h-11 text-primary-foreground"
              onClick={() => {
                if (upgradeModal) {
                  upgradeModal.openUpgrade({
                    reason: "roles_permissions",
                    source: "roles_forbidden",
                    focusTier: "ENTERPRISE",
                    currentPlan: planTier === "PRO" ? "pro" : "free",
                  });
                  return;
                }
                router.push(BUSINESS_WORKSPACE_BILLING_ROUTE);
              }}
            >
              {ROLES_PERMISSIONS_COPY.upgradeCta}
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

  if (!actorCanManageRoles(resolvedActor)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-lg bg-background px-md py-lg">
        <div
          className="flex w-full max-w-md flex-col gap-md rounded-md border border-border bg-surface p-lg text-center shadow-sm"
          role="status"
        >
          <H1 className="text-h3 text-foreground">
            {ROLES_PERMISSIONS_COPY.unauthorizedTitle}
          </H1>
          <BodySmall className="text-foreground">
            {ROLES_PERMISSIONS_COPY.unauthorizedMessage}
          </BodySmall>
          <Button
            type="button"
            variant="primary"
            className="min-h-11 text-primary-foreground"
            onClick={() => router.push(ROLES_PERMISSIONS_WORKSPACE_ROUTE)}
          >
            {ROLES_PERMISSIONS_COPY.backToWorkspace}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <RolesPermissionsScreen
      key={`${user.id}-${bundle.state}-${resolvedActor}`}
      data={bundle}
      screenState={bundle.state === "unauthorized" ? "success" : bundle.state}
      onRetry={() => {
        setBundle(
          getMockRolesPermissions({
            state: "success",
            actorRole: resolvedActor,
            saveShouldFail,
          }),
        );
      }}
    />
  );
}
