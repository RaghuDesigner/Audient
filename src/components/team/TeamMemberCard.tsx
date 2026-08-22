"use client";

import * as React from "react";

import { UserAvatar } from "@/components/dashboard/UserAvatar";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { BodySmall, Caption } from "@/components/ui/typography";
import {
  TEAM_MEMBER_CARD_COPY,
  type TeamMemberCardState,
  type TeamMemberRole,
  type TeamMemberStatus,
} from "@/config/team-member-card";
import { teamMemberCardAnalytics } from "@/lib/analytics/team-member-card-events";
import {
  defaultTeamMemberCardActions,
  teamMemberActionAriaLabel,
  teamMemberRoleLabel,
  teamMemberStatusLabel,
  type TeamMemberCardActions,
} from "@/utils/team-member-card";
import { cn } from "@/utils/cn";

export type TeamMemberCardProps = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  role: TeamMemberRole;
  status: TeamMemberStatus;
  lastActive: string;
  actions?: TeamMemberCardActions;
  state?: TeamMemberCardState;
  onView?: () => void;
  onEdit?: () => void;
  onRemove?: () => void | Promise<void>;
  onRetry?: () => void;
  className?: string;
};

/**
 * COMPONENT-052 — Team Member Card.
 * Single member identity + mock View / Edit / Remove — no backend.
 */
export function TeamMemberCard({
  id,
  name,
  email,
  avatarUrl = null,
  role,
  status,
  lastActive,
  actions: actionsProp,
  state = "default",
  onView,
  onEdit,
  onRemove,
  onRetry,
  className,
}: TeamMemberCardProps) {
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [removing, setRemoving] = React.useState(false);

  const loading = state === "loading";
  const isError = state === "error";
  const actions = defaultTeamMemberCardActions(role, actionsProp);
  const titleId = `team-member-card-title-${id}`;

  React.useEffect(() => {
    if (!confirmOpen) return;
    const frame = window.requestAnimationFrame(() => {
      cancelRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [confirmOpen]);

  const handleView = () => {
    teamMemberCardAnalytics.viewed({ memberId: id });
    if (onView) {
      onView();
      return;
    }
    toast.info(TEAM_MEMBER_CARD_COPY.actionSoon);
  };

  const handleEdit = () => {
    teamMemberCardAnalytics.editClicked({ memberId: id });
    if (onEdit) {
      onEdit();
      return;
    }
    toast.info(TEAM_MEMBER_CARD_COPY.actionSoon);
  };

  const openRemove = () => {
    teamMemberCardAnalytics.removeClicked({ memberId: id });
    setConfirmOpen(true);
  };

  const closeRemove = () => {
    if (removing) return;
    setConfirmOpen(false);
  };

  const confirmRemove = async () => {
    if (removing) return;
    setRemoving(true);
    try {
      if (onRemove) {
        await Promise.resolve(onRemove());
      } else {
        toast.success(TEAM_MEMBER_CARD_COPY.removeSuccess);
      }
      setConfirmOpen(false);
    } catch {
      toast.error(TEAM_MEMBER_CARD_COPY.loadError);
    } finally {
      setRemoving(false);
    }
  };

  return (
    <article
      className={cn(
        "flex w-full flex-col gap-md rounded-md border border-border bg-surface p-md shadow-sm sm:p-lg",
        className,
      )}
      aria-busy={loading || removing || undefined}
      aria-labelledby={titleId}
    >
      {loading ? (
        <>
          <Caption className="sr-only" role="status">
            {TEAM_MEMBER_CARD_COPY.loading}
          </Caption>
          <div className="flex flex-col gap-md sm:flex-row sm:items-center">
            <Skeleton className="size-11 shrink-0 rounded-full" />
            <div className="flex min-w-0 flex-1 flex-col gap-sm">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>
        </>
      ) : null}

      {isError ? (
        <div
          className="flex flex-col gap-md rounded-md border border-border p-md"
          role="alert"
        >
          <BodySmall className="text-foreground">
            {TEAM_MEMBER_CARD_COPY.loadError}
          </BodySmall>
          {onRetry ? (
            <Button
              type="button"
              variant="outline"
              className="min-h-11 w-full sm:w-auto"
              onClick={onRetry}
            >
              {TEAM_MEMBER_CARD_COPY.retry}
            </Button>
          ) : null}
        </div>
      ) : null}

      {!loading && !isError ? (
        <>
          <div className="flex flex-col gap-md sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 flex-col gap-md sm:flex-row sm:items-center">
              <UserAvatar
                displayName={name}
                avatarUrl={avatarUrl}
                size="md"
              />
              <div className="min-w-0 flex-1">
                <BodySmall
                  id={titleId}
                  className="font-semibold text-foreground"
                >
                  {name}
                </BodySmall>
                <Caption className="mt-sm break-all text-muted-foreground">
                  {email}
                </Caption>
              </div>
            </div>

            <div className="flex flex-wrap gap-sm sm:justify-end">
              {actions.view ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="min-h-11"
                  aria-label={teamMemberActionAriaLabel("view", name)}
                  onClick={handleView}
                >
                  {TEAM_MEMBER_CARD_COPY.view}
                </Button>
              ) : null}
              {actions.edit ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="min-h-11"
                  aria-label={teamMemberActionAriaLabel("edit", name)}
                  onClick={handleEdit}
                >
                  {TEAM_MEMBER_CARD_COPY.edit}
                </Button>
              ) : null}
              {actions.remove ? (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="min-h-11"
                  aria-label={teamMemberActionAriaLabel("remove", name)}
                  onClick={openRemove}
                >
                  {TEAM_MEMBER_CARD_COPY.remove}
                </Button>
              ) : null}
            </div>
          </div>

          <dl className="m-0 grid grid-cols-1 gap-md sm:grid-cols-3">
            <div className="flex flex-col gap-sm">
              <dt className="text-caption font-semibold text-muted-foreground">
                {TEAM_MEMBER_CARD_COPY.role}
              </dt>
              <dd className="m-0 text-body-sm text-foreground">
                {teamMemberRoleLabel(role)}
              </dd>
            </div>
            <div className="flex flex-col gap-sm">
              <dt className="text-caption font-semibold text-muted-foreground">
                {TEAM_MEMBER_CARD_COPY.status}
              </dt>
              <dd className="m-0 text-body-sm text-foreground">
                {teamMemberStatusLabel(status)}
              </dd>
            </div>
            <div className="flex flex-col gap-sm">
              <dt className="text-caption font-semibold text-muted-foreground">
                {TEAM_MEMBER_CARD_COPY.lastActive}
              </dt>
              <dd className="m-0 text-body-sm text-foreground">{lastActive}</dd>
            </div>
          </dl>
        </>
      ) : null}

      <Modal
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!open) closeRemove();
        }}
        variant="warning"
        size="sm"
        title={TEAM_MEMBER_CARD_COPY.removeConfirmTitle}
        description={TEAM_MEMBER_CARD_COPY.removeConfirmDescription}
        showCloseButton={!removing}
        preventDismiss={removing}
        footer={
          <div className="flex w-full flex-col-reverse gap-sm sm:flex-row sm:justify-end">
            <Button
              ref={cancelRef}
              type="button"
              variant="outline"
              disabled={removing}
              onClick={closeRemove}
            >
              {TEAM_MEMBER_CARD_COPY.cancel}
            </Button>
            <Button
              type="button"
              variant="destructive"
              isLoading={removing}
              disabled={removing}
              onClick={() => void confirmRemove()}
            >
              {TEAM_MEMBER_CARD_COPY.removeConfirmAction}
            </Button>
          </div>
        }
      />
    </article>
  );
}
