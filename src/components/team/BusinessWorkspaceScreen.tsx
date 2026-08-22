"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Footer } from "@/components/layout/footer";
import { SkipLink } from "@/components/layout/skip-link";
import { BusinessUsageWidget } from "@/components/team/BusinessUsageWidget";
import { InviteMemberModal } from "@/components/team/InviteMemberModal";
import type { InviteMemberPayload } from "@/components/team/InviteMemberModal";
import { RolePermissionMatrix } from "@/components/team/RolePermissionMatrix";
import { TeamActivityCard } from "@/components/team/TeamActivityCard";
import { TeamMemberCard } from "@/components/team/TeamMemberCard";
import { TeamOverviewCard } from "@/components/team/TeamOverviewCard";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { BodySmall, H1 } from "@/components/ui/typography";
import {
  BUSINESS_WORKSPACE_COPY,
  BUSINESS_WORKSPACE_DASHBOARD_ROUTE,
  BUSINESS_WORKSPACE_SECTION_LABELS,
  BUSINESS_WORKSPACE_SECTIONS,
  type BusinessWorkspaceScreenState,
  type BusinessWorkspaceSectionId,
} from "@/config/business-workspace-screen";
import { ROLES_PERMISSIONS_ROUTE } from "@/config/roles-permissions-screen";
import type { MockBusinessWorkspaceBundle } from "@/data/mock-business-workspace";
import { useMockMembershipCredits } from "@/hooks/use-mock-membership-state";
import {
  useHeaderCredits,
  useHeaderPlanTier,
} from "@/hooks/use-app-state";
import { useAuth } from "@/hooks/use-auth";
import { businessWorkspaceAnalytics } from "@/lib/analytics/business-workspace-events";
import { businessWorkspaceSectionElementId } from "@/utils/business-workspace-screen";
import type { TeamMemberCardModel } from "@/utils/team-member-card";
import { cn } from "@/utils/cn";

export type BusinessWorkspaceScreenProps = {
  data: MockBusinessWorkspaceBundle;
  screenState: BusinessWorkspaceScreenState;
  onRetry?: () => void;
  onInviteSend?: (payload: InviteMemberPayload) => void | Promise<void>;
  onRemoveMember?: (id: string) => void | Promise<void>;
};

/**
 * SCREEN-020 — Business Workspace.
 * Composes Business team components. Optional handlers wire real APIs.
 */
export function BusinessWorkspaceScreen({
  data,
  screenState,
  onRetry,
  onInviteSend,
  onRemoveMember,
}: BusinessWorkspaceScreenProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { credits: liveCredits } = useMockMembershipCredits();
  const viewed = React.useRef(false);

  const [members, setMembers] = React.useState<TeamMemberCardModel[]>(
    () => data.members,
  );
  const [overview, setOverview] = React.useState(() => data.overview);
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const inviteTriggerRef = React.useRef<HTMLButtonElement>(null);

  const loading = screenState === "loading";
  const isError = screenState === "error";
  const isEmpty = screenState === "empty";

  React.useEffect(() => {
    setMembers(data.members);
    setOverview({
      ...data.overview,
      creditsRemaining:
        liveCredits?.remaining ?? data.overview.creditsRemaining,
    });
  }, [data, liveCredits?.remaining]);

  React.useEffect(() => {
    if (viewed.current || loading || isError) return;
    viewed.current = true;
    businessWorkspaceAnalytics.viewed();
  }, [isError, loading]);

  const headerTier = useHeaderPlanTier();
  const headerCredits = useHeaderCredits();

  const scrollToSection = (section: BusinessWorkspaceSectionId) => {
    const el = document.getElementById(
      businessWorkspaceSectionElementId(section),
    );
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const openInvite = () => {
    businessWorkspaceAnalytics.inviteMemberClicked();
    setInviteOpen(true);
  };

  const handleInviteSend = async (payload: InviteMemberPayload) => {
    if (onInviteSend) {
      await onInviteSend(payload);
      return;
    }
    const id = `tm-invite-${Date.now()}`;
    const next: TeamMemberCardModel = {
      id,
      name: payload.email.split("@")[0] || payload.email,
      email: payload.email,
      avatarUrl: null,
      role: payload.role,
      status: "invited",
      lastActive: "Invite pending",
    };
    setMembers((prev) => [next, ...prev]);
    setOverview((prev) => ({
      ...prev,
      totalMembers: prev.totalMembers + 1,
      pendingInvitations: prev.pendingInvitations + 1,
    }));
  };

  const handleRemoveMember = async (id: string) => {
    if (onRemoveMember) {
      await onRemoveMember(id);
      return;
    }
    setMembers((prev) => {
      const target = prev.find((m) => m.id === id);
      const next = prev.filter((m) => m.id !== id);
      setOverview((o) => ({
        ...o,
        totalMembers: Math.max(0, o.totalMembers - 1),
        activeMembers:
          target?.status === "active"
            ? Math.max(0, o.activeMembers - 1)
            : o.activeMembers,
        pendingInvitations:
          target?.status === "invited"
            ? Math.max(0, o.pendingInvitations - 1)
            : o.pendingInvitations,
      }));
      return next;
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SkipLink />
      <DashboardHeader
        credits={headerCredits ?? 0}
        displayName={user?.fullName ?? null}
        tier={headerTier}
      />

      <main
        id="main-content"
        className={cn(
          "mx-auto flex w-full max-w-6xl flex-1 flex-col gap-lg",
          "px-md py-lg lg:px-lg",
        )}
        aria-busy={loading || undefined}
      >
        <nav aria-label="Breadcrumb" className="w-full">
          <ol className="m-0 flex list-none flex-wrap items-center gap-sm p-0 text-body-sm text-muted-foreground">
            <li className="inline-flex items-center gap-sm">
              <button
                type="button"
                className={cn(
                  "rounded-sm underline-offset-4 transition-colors duration-fast",
                  "hover:text-foreground hover:underline",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                )}
                onClick={() =>
                  router.push(BUSINESS_WORKSPACE_DASHBOARD_ROUTE)
                }
              >
                {BUSINESS_WORKSPACE_COPY.breadcrumbDashboard}
              </button>
            </li>
            <li className="inline-flex items-center gap-sm">
              <ChevronRight
                className="size-4 shrink-0 opacity-60"
                aria-hidden
              />
              <span
                className="font-semibold text-foreground"
                aria-current="page"
              >
                {BUSINESS_WORKSPACE_COPY.breadcrumbCurrent}
              </span>
            </li>
          </ol>
        </nav>

        <div className="flex flex-col gap-md sm:flex-row sm:items-center sm:justify-between">
          <H1 className="text-foreground">
            {BUSINESS_WORKSPACE_COPY.pageTitle}
          </H1>
          {!loading && !isError ? (
            <div className="flex flex-col gap-sm sm:flex-row sm:flex-wrap">
              <Button
                ref={inviteTriggerRef}
                type="button"
                variant="primary"
                className="min-h-11 text-primary-foreground"
                fullWidth
                onClick={openInvite}
              >
                {BUSINESS_WORKSPACE_COPY.inviteMember}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="min-h-11"
                fullWidth
                onClick={() => scrollToSection("members")}
              >
                {BUSINESS_WORKSPACE_COPY.manageMembers}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="min-h-11"
                fullWidth
                onClick={() => scrollToSection("usage")}
              >
                {BUSINESS_WORKSPACE_COPY.viewUsage}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="min-h-11"
                fullWidth
                onClick={() => scrollToSection("activity")}
              >
                {BUSINESS_WORKSPACE_COPY.viewActivity}
              </Button>
            </div>
          ) : null}
        </div>

        {isError ? (
          <section
            className="flex flex-col items-center gap-md rounded-md border border-border bg-surface p-lg text-center"
            role="alert"
          >
            <BodySmall className="text-foreground">
              {BUSINESS_WORKSPACE_COPY.loadError}
            </BodySmall>
            <div className="flex w-full flex-col gap-sm sm:w-auto sm:flex-row">
              {onRetry ? (
                <Button
                  type="button"
                  variant="primary"
                  className="text-primary-foreground"
                  onClick={onRetry}
                >
                  {BUSINESS_WORKSPACE_COPY.retry}
                </Button>
              ) : null}
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  router.push(BUSINESS_WORKSPACE_DASHBOARD_ROUTE)
                }
              >
                {BUSINESS_WORKSPACE_COPY.back}
              </Button>
            </div>
          </section>
        ) : null}

        {loading ? (
          <div className="flex flex-col gap-lg" aria-busy="true">
            <p className="sr-only">{BUSINESS_WORKSPACE_COPY.loading}</p>
            <div className="h-40 animate-pulse rounded-md bg-muted" />
            <div className="h-56 animate-pulse rounded-md bg-muted" />
            <div className="h-48 animate-pulse rounded-md bg-muted" />
          </div>
        ) : null}

        {!loading && !isError ? (
          <div className="flex flex-col gap-lg">
            <section
              id={businessWorkspaceSectionElementId("overview")}
              aria-label={BUSINESS_WORKSPACE_SECTION_LABELS.overview}
              className="scroll-mt-16"
            >
              <TeamOverviewCard
                teamName={overview.teamName}
                plan={overview.plan}
                totalMembers={overview.totalMembers}
                activeMembers={overview.activeMembers}
                pendingInvitations={overview.pendingInvitations}
                totalAudits={overview.totalAudits}
                creditsRemaining={overview.creditsRemaining}
              />
            </section>

            <section
              id={businessWorkspaceSectionElementId("usage")}
              aria-label={BUSINESS_WORKSPACE_SECTION_LABELS.usage}
              className="scroll-mt-16"
            >
              <BusinessUsageWidget
                totalAudits={data.usage.totalAudits}
                monthlyAudits={data.usage.monthlyAudits}
                creditsUsed={data.usage.creditsUsed}
                creditsRemaining={
                  liveCredits?.remaining ?? data.usage.creditsRemaining
                }
                creditsGrant={data.usage.creditsGrant}
                storageUsedGb={data.usage.storageUsedGb}
                storageQuotaGb={data.usage.storageQuotaGb}
                activeMembers={
                  isEmpty ? overview.activeMembers : data.usage.activeMembers
                }
                chartSeries={data.usage.chartSeries}
              />
            </section>

            <section
              id={businessWorkspaceSectionElementId("members")}
              aria-label={BUSINESS_WORKSPACE_SECTION_LABELS.members}
              className="scroll-mt-16 flex flex-col gap-md"
            >
              <h2 className="text-h4 font-semibold text-foreground">
                {BUSINESS_WORKSPACE_COPY.membersHeading}
              </h2>
              {members.length === 0 ? (
                <div
                  className="flex flex-col gap-sm rounded-md border border-border bg-surface p-md"
                  role="status"
                >
                  <BodySmall className="font-semibold text-foreground">
                    {BUSINESS_WORKSPACE_COPY.membersEmptyTitle}
                  </BodySmall>
                  <BodySmall className="text-muted-foreground">
                    {BUSINESS_WORKSPACE_COPY.membersEmptyDescription}
                  </BodySmall>
                  <Button
                    type="button"
                    variant="primary"
                    className="mt-sm min-h-11 w-full text-primary-foreground sm:w-auto"
                    onClick={openInvite}
                  >
                    {BUSINESS_WORKSPACE_COPY.inviteMember}
                  </Button>
                </div>
              ) : (
                <ul className="m-0 flex list-none flex-col gap-md p-0">
                  {members.map((member) => (
                    <li key={member.id}>
                      <TeamMemberCard
                        id={member.id}
                        name={member.name}
                        email={member.email}
                        avatarUrl={member.avatarUrl}
                        role={member.role}
                        status={member.status}
                        lastActive={member.lastActive}
                        onView={() => {
                          toast.info(`${member.name} — mock member detail`);
                        }}
                        onEdit={() => {
                          router.push(
                            `${ROLES_PERMISSIONS_ROUTE}?member=${encodeURIComponent(member.id)}`,
                          );
                        }}
                        onRemove={() => handleRemoveMember(member.id)}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section
              id={businessWorkspaceSectionElementId("permissions")}
              aria-label={BUSINESS_WORKSPACE_SECTION_LABELS.permissions}
              className="scroll-mt-16 flex flex-col gap-md"
            >
              <RolePermissionMatrix adminBillingEnabled />
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11"
                  onClick={() => router.push(ROLES_PERMISSIONS_ROUTE)}
                >
                  {BUSINESS_WORKSPACE_COPY.manageRoles}
                </Button>
              </div>
            </section>

            <section
              id={businessWorkspaceSectionElementId("activity")}
              aria-label={BUSINESS_WORKSPACE_SECTION_LABELS.activity}
              className="scroll-mt-16"
            >
              <TeamActivityCard
                items={data.activity}
                state={data.activity.length === 0 ? "empty" : "default"}
                onViewAll={() => scrollToSection("activity")}
              />
            </section>

            {/* Section jump helper for screen readers / long pages */}
            <nav
              className="sr-only"
              aria-label="Workspace sections"
            >
              <ul>
                {BUSINESS_WORKSPACE_SECTIONS.map((id) => (
                  <li key={id}>
                    <a href={`#${businessWorkspaceSectionElementId(id)}`}>
                      {BUSINESS_WORKSPACE_SECTION_LABELS[id]}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        ) : null}
      </main>
      <Footer />

      <InviteMemberModal
        open={inviteOpen}
        onOpenChange={(open) => {
          setInviteOpen(open);
          if (!open) {
            queueMicrotask(() => inviteTriggerRef.current?.focus());
          }
        }}
        onSend={handleInviteSend}
      />
    </div>
  );
}
