"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Footer } from "@/components/layout/footer";
import { SkipLink } from "@/components/layout/skip-link";
import { SaveRoleButton } from "@/components/team/SaveRoleButton";
import { RolePermissionMatrix } from "@/components/team/RolePermissionMatrix";
import { TeamMemberRoleRow } from "@/components/team/TeamMemberRoleRow";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { BodySmall, Caption, H1 } from "@/components/ui/typography";
import {
  ROLES_PERMISSIONS_COPY,
  ROLES_PERMISSIONS_DASHBOARD_ROUTE,
  ROLES_PERMISSIONS_MOCK_SAVE_DELAY_MS,
  ROLES_PERMISSIONS_WORKSPACE_ROUTE,
  type RolesPermissionsScreenState,
} from "@/config/roles-permissions-screen";
import type { AssignableTeamMemberRole } from "@/config/team-member-card";
import type { TeamMemberRole } from "@/config/team-member-card";
import type { MockRolesPermissionsBundle } from "@/data/mock-roles-permissions";
import { useAuth } from "@/hooks/use-auth";
import {
  useAppState,
  useHeaderCredits,
  useHeaderPlanTier,
} from "@/hooks/use-app-state";
import { rolesPermissionsAnalytics } from "@/lib/analytics/roles-permissions-events";
import {
  buildMemberRoleMap,
  countStagedRoleChanges,
  rolesPermissionsDirty,
  rolesPermissionsSectionElementId,
} from "@/utils/roles-permissions-screen";
import type { TeamMemberCardModel } from "@/utils/team-member-card";
import { cn } from "@/utils/cn";

export type RolesPermissionsScreenProps = {
  data: MockRolesPermissionsBundle;
  screenState: RolesPermissionsScreenState;
  onRetry?: () => void;
};

/**
 * SCREEN-022 — Roles & Permissions.
 * Reference matrix + staged member role assignment — mock only.
 */
export function RolesPermissionsScreen({
  data,
  screenState,
  onRetry,
}: RolesPermissionsScreenProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { effectiveUser } = useAppState();
  const headerTier = useHeaderPlanTier();
  const headerCredits = useHeaderCredits();
  const viewed = React.useRef(false);

  const [members, setMembers] = React.useState<TeamMemberCardModel[]>(
    () => data.members,
  );
  const [savedRoles, setSavedRoles] = React.useState(() =>
    buildMemberRoleMap(data.members),
  );
  const [stagedRoles, setStagedRoles] = React.useState(() =>
    buildMemberRoleMap(data.members),
  );
  const [highlightedRole, setHighlightedRole] =
    React.useState<TeamMemberRole | null>(null);
  const [unsavedOpen, setUnsavedOpen] = React.useState(false);
  const [pendingHref, setPendingHref] = React.useState<string | null>(null);
  const [saveBusy, setSaveBusy] = React.useState(false);

  const loading = screenState === "loading";
  const isError = screenState === "error";
  const isEmpty = screenState === "empty";
  const dirty = rolesPermissionsDirty(savedRoles, stagedRoles);

  React.useEffect(() => {
    setMembers(data.members);
    const map = buildMemberRoleMap(data.members);
    setSavedRoles(map);
    setStagedRoles(map);
  }, [data]);

  React.useEffect(() => {
    if (viewed.current || loading || isError) return;
    viewed.current = true;
    rolesPermissionsAnalytics.viewed({
      tier: effectiveUser?.planTier ?? user?.planTier ?? "unknown",
      actorRole: data.actorRole,
    });
  }, [data.actorRole, effectiveUser?.planTier, isError, loading, user?.planTier]);

  React.useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const requestNavigate = (href: string) => {
    if (!dirty) {
      router.push(href);
      return;
    }
    setPendingHref(href);
    setUnsavedOpen(true);
  };

  const discardAndContinue = () => {
    setStagedRoles({ ...savedRoles });
    setUnsavedOpen(false);
    if (pendingHref) {
      router.push(pendingHref);
      setPendingHref(null);
    }
  };

  const handleStageRoleChange = (
    memberId: string,
    _fromRole: TeamMemberRole,
    toRole: AssignableTeamMemberRole,
  ) => {
    setStagedRoles((prev) => ({
      ...prev,
      [memberId]: toRole,
    }));
  };

  const handleSave = async () => {
    await new Promise<void>((resolve, reject) => {
      window.setTimeout(() => {
        if (data.saveShouldFail) {
          reject(new Error("mock_save_failed"));
          return;
        }
        resolve();
      }, ROLES_PERMISSIONS_MOCK_SAVE_DELAY_MS);
    });
    setSavedRoles({ ...stagedRoles });
    setMembers((prev) =>
      prev.map((member) => ({
        ...member,
        role: stagedRoles[member.id] ?? member.role,
      })),
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SkipLink />
      <DashboardHeader
        credits={headerCredits}
        displayName={user?.fullName ?? null}
        tier={headerTier}
      />

      <main
        id="main-content"
        className={cn(
          "mx-auto flex w-full max-w-6xl flex-1 flex-col gap-lg",
          "px-md py-lg lg:px-lg",
          dirty && "pb-28",
        )}
        aria-busy={loading || saveBusy || undefined}
      >
        <nav aria-label="Breadcrumb" className="w-full">
          <ol className="m-0 flex list-none flex-wrap items-center gap-sm p-0 text-body-sm text-muted-foreground">
            <li>
              <button
                type="button"
                className="rounded-sm underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                onClick={() => requestNavigate(ROLES_PERMISSIONS_DASHBOARD_ROUTE)}
              >
                {ROLES_PERMISSIONS_COPY.breadcrumbDashboard}
              </button>
            </li>
            <li className="inline-flex items-center gap-sm">
              <ChevronRight className="size-4 opacity-60" aria-hidden />
              <button
                type="button"
                className="rounded-sm underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                onClick={() =>
                  requestNavigate(ROLES_PERMISSIONS_WORKSPACE_ROUTE)
                }
              >
                {ROLES_PERMISSIONS_COPY.breadcrumbWorkspace}
              </button>
            </li>
            <li className="inline-flex items-center gap-sm">
              <ChevronRight className="size-4 opacity-60" aria-hidden />
              <span className="font-semibold text-foreground" aria-current="page">
                {ROLES_PERMISSIONS_COPY.breadcrumbCurrent}
              </span>
            </li>
          </ol>
        </nav>

        <div className="flex flex-col gap-sm">
          <H1 className="text-foreground">{ROLES_PERMISSIONS_COPY.pageTitle}</H1>
          <BodySmall className="text-muted-foreground">
            {ROLES_PERMISSIONS_COPY.pageDescription}
          </BodySmall>
          {dirty ? (
            <Caption className="font-semibold text-warning" role="status">
              {ROLES_PERMISSIONS_COPY.unsavedIndicator}
            </Caption>
          ) : null}
        </div>

        {isError ? (
          <section className="flex flex-col items-center gap-md rounded-md border border-border bg-surface p-lg text-center" role="alert">
            <BodySmall>{ROLES_PERMISSIONS_COPY.loadError}</BodySmall>
            {onRetry ? (
              <Button type="button" variant="primary" onClick={onRetry}>
                {ROLES_PERMISSIONS_COPY.retry}
              </Button>
            ) : null}
          </section>
        ) : null}

        {loading ? (
          <div className="flex flex-col gap-lg" aria-busy="true">
            <p className="sr-only">{ROLES_PERMISSIONS_COPY.loading}</p>
            <div className="h-48 animate-pulse rounded-md bg-muted" />
            <div className="h-40 animate-pulse rounded-md bg-muted" />
          </div>
        ) : null}

        {!loading && !isError ? (
          <div className="flex flex-col gap-lg">
            <section
              id={rolesPermissionsSectionElementId("matrix")}
              aria-label={ROLES_PERMISSIONS_COPY.pageTitle}
              className="scroll-mt-16"
            >
              <RolePermissionMatrix
                adminBillingEnabled={data.adminBillingEnabled}
                highlightedRole={highlightedRole}
              />
            </section>

            <section
              id={rolesPermissionsSectionElementId("members")}
              aria-label={ROLES_PERMISSIONS_COPY.membersHeading}
              className="scroll-mt-16 flex flex-col gap-md"
            >
              <h2 className="text-h4 font-semibold text-foreground">
                {ROLES_PERMISSIONS_COPY.membersHeading}
              </h2>
              {isEmpty || members.length === 0 ? (
                <div className="rounded-md border border-border bg-surface p-md" role="status">
                  <BodySmall className="font-semibold text-foreground">
                    {ROLES_PERMISSIONS_COPY.membersEmptyTitle}
                  </BodySmall>
                  <BodySmall className="mt-sm text-muted-foreground">
                    {ROLES_PERMISSIONS_COPY.membersEmptyDescription}
                  </BodySmall>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-md min-h-11"
                    onClick={() =>
                      requestNavigate(ROLES_PERMISSIONS_WORKSPACE_ROUTE)
                    }
                  >
                    {ROLES_PERMISSIONS_COPY.backToWorkspace}
                  </Button>
                </div>
              ) : (
                <ul className="m-0 flex list-none flex-col gap-md p-0">
                  {members.map((member) => (
                    <li key={member.id}>
                      <TeamMemberRoleRow
                        id={member.id}
                        name={member.name}
                        email={member.email}
                        avatarUrl={member.avatarUrl}
                        role={stagedRoles[member.id] ?? member.role}
                        status={member.status}
                        lastActive={member.lastActive}
                        onStageChange={handleStageRoleChange}
                        onFocusRole={setHighlightedRole}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        ) : null}
      </main>

      <Footer />

      {!loading && !isError ? (
        <div
          className={cn(
            "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur-sm",
            !dirty && "pointer-events-none opacity-0",
          )}
          aria-hidden={!dirty}
        >
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-sm px-md py-md sm:flex-row sm:justify-end lg:px-lg">
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              disabled={!dirty || saveBusy}
              onClick={() => setStagedRoles({ ...savedRoles })}
            >
              {ROLES_PERMISSIONS_COPY.cancel}
            </Button>
            <SaveRoleButton
              dirty={dirty}
              disabled={saveBusy}
              stagedChangeCount={countStagedRoleChanges(savedRoles, stagedRoles)}
              onBusyChange={setSaveBusy}
              onSave={handleSave}
            />
          </div>
        </div>
      ) : null}

      <Modal
        open={unsavedOpen}
        onOpenChange={setUnsavedOpen}
        variant="confirmation"
        size="sm"
        title={ROLES_PERMISSIONS_COPY.unsavedTitle}
        description={ROLES_PERMISSIONS_COPY.unsavedDescription}
        footer={
          <div className="flex w-full flex-col-reverse gap-sm sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setUnsavedOpen(false)}
            >
              {ROLES_PERMISSIONS_COPY.unsavedStay}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={discardAndContinue}
            >
              {ROLES_PERMISSIONS_COPY.unsavedDiscard}
            </Button>
          </div>
        }
      />
    </div>
  );
}
