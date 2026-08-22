"use client";

import { ShareReportModalForm } from "@/components/common/ShareReportModalForm";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Caption } from "@/components/ui/typography";
import {
  SHARE_REPORT_MODAL_COPY,
  type ShareReportModalState,
  type ShareReportModalTier,
  type ShareReportPermission,
} from "@/config/share-report-modal";
import { shareReportModalAnalytics } from "@/lib/analytics/share-report-modal-events";
import { useShareReportModalController } from "@/hooks/use-share-report-modal";
import { formatShareReportScore } from "@/utils/share-report-modal";
import { formatAuditDate } from "@/utils/recent-audit";

export type ShareReportModalProps = {
  open: boolean;
  auditId: string;
  reportLabel?: string;
  auditedAt?: string | Date | null;
  score?: number | null;
  tier: ShareReportModalTier;
  state?: ShareReportModalState;
  shareUrl?: string | null;
  permission?: ShareReportPermission;
  errorMessage?: string | null;
  onPermissionChange?: (permission: ShareReportPermission) => void;
  onGenerateLink?: () => void | Promise<void>;
  onCopyLink?: (url: string) => void | Promise<void>;
  onEmailShare?: (email: string) => void | Promise<void>;
  onOrgShare?: () => void;
  onTeamShare?: () => void;
  onClose: () => void;
};

/** COMPONENT-031 — mock share modal (focus trap + Esc via Modal). */
export function ShareReportModal({
  open,
  auditId,
  reportLabel,
  auditedAt = null,
  score = null,
  tier,
  state: stateProp,
  shareUrl: shareUrlProp,
  permission: permissionProp,
  errorMessage = null,
  onPermissionChange,
  onGenerateLink,
  onCopyLink,
  onEmailShare,
  onOrgShare,
  onTeamShare,
  onClose,
}: ShareReportModalProps) {
  const ctrl = useShareReportModalController({
    open,
    auditId,
    tier,
    stateProp,
    shareUrlProp,
    permissionProp,
    onPermissionChange,
    onGenerateLink,
    onCopyLink,
    onEmailShare,
    onClose,
  });

  const scoreLabel = formatShareReportScore(score);
  const dateLabel = auditedAt ? formatAuditDate(auditedAt) : null;

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next) ctrl.dismiss();
      }}
      size="md"
      scrollable
      title={SHARE_REPORT_MODAL_COPY.title}
      showCloseButton={!ctrl.generating}
      preventDismiss={ctrl.generating}
      footer={
        <div className="flex w-full flex-col-reverse gap-sm sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={ctrl.generating}
            onClick={ctrl.dismiss}
          >
            {SHARE_REPORT_MODAL_COPY.cancel}
          </Button>
          <Button
            type="button"
            variant="primary"
            className="text-primary-foreground"
            disabled={ctrl.generating}
            onClick={ctrl.dismiss}
          >
            {SHARE_REPORT_MODAL_COPY.done}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-md">
        <section aria-label={SHARE_REPORT_MODAL_COPY.reportInfo}>
          <p className="text-body-sm font-semibold text-foreground">
            {reportLabel ?? auditId}
          </p>
          <Caption className="mt-sm text-muted-foreground">
            {dateLabel ?? "—"}
            {scoreLabel
              ? ` · ${SHARE_REPORT_MODAL_COPY.scoreLabel} ${scoreLabel}`
              : null}
          </Caption>
        </section>
        {ctrl.state === "error" ? (
          <Alert variant="error" role="alert">
            {errorMessage ?? SHARE_REPORT_MODAL_COPY.errorDefault}
          </Alert>
        ) : null}
        <ShareReportModalForm
          auditId={auditId}
          tier={tier}
          activeOption={ctrl.activeOption}
          permission={ctrl.permission}
          shareUrl={ctrl.shareUrl}
          generating={ctrl.generating}
          copied={ctrl.state === "copied"}
          email={ctrl.email}
          emailError={ctrl.emailError}
          onOptionChange={ctrl.setActiveOption}
          onPermissionChange={ctrl.handlePermissionChange}
          onEmailChange={ctrl.handleEmailChange}
          onGenerateLink={() => void ctrl.handleGenerate()}
          onCopyLink={() => void ctrl.handleCopy()}
          onSendEmail={ctrl.handleSendEmail}
          onOrgShare={() => {
            shareReportModalAnalytics.orgShareClicked({ auditId });
            onOrgShare?.();
          }}
          onTeamShare={() => {
            shareReportModalAnalytics.teamShareClicked({ auditId });
            onTeamShare?.();
          }}
        />
      </div>
    </Modal>
  );
}
