"use client";

import { Copy, Link2 } from "lucide-react";

import {
  ShareOptionChip,
  SharePermissionRow,
  SharePlaceholderAction,
} from "@/components/common/ShareReportModalControls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Caption } from "@/components/ui/typography";
import {
  SHARE_REPORT_MODAL_COPY,
  type ShareReportPermission,
  type ShareReportShareOption,
} from "@/config/share-report-modal";
import { shareReportModalAnalytics } from "@/lib/analytics/share-report-modal-events";
import {
  isValidShareEmail,
  resolveShareReportOptions,
  resolveShareReportPermissions,
} from "@/utils/share-report-modal";

export type ShareReportModalFormProps = {
  auditId: string;
  tier: "free" | "pro" | "business";
  activeOption: ShareReportShareOption;
  permission: ShareReportPermission;
  shareUrl: string | null;
  generating: boolean;
  copied: boolean;
  email: string;
  emailError: string | null;
  onOptionChange: (option: ShareReportShareOption) => void;
  onPermissionChange: (permission: ShareReportPermission) => void;
  onEmailChange: (value: string) => void;
  onGenerateLink: () => void;
  onCopyLink: () => void;
  onSendEmail: () => void;
  onOrgShare: () => void;
  onTeamShare: () => void;
};

/**
 * COMPONENT-031 companion — options, permissions, link/email fields.
 */
export function ShareReportModalForm({
  auditId,
  tier,
  activeOption,
  permission,
  shareUrl,
  generating,
  copied,
  email,
  emailError,
  onOptionChange,
  onPermissionChange,
  onEmailChange,
  onGenerateLink,
  onCopyLink,
  onSendEmail,
  onOrgShare,
  onTeamShare,
}: ShareReportModalFormProps) {
  const options = resolveShareReportOptions(tier).filter((o) => o.visible);
  const permissions = resolveShareReportPermissions(tier).filter(
    (p) => p.visible,
  );

  return (
    <div className="flex flex-col gap-md">
      <fieldset className="flex flex-col gap-sm">
        <legend className="text-body-sm font-semibold text-foreground">
          {SHARE_REPORT_MODAL_COPY.shareOptionsLegend}
        </legend>
        <div
          className="flex flex-wrap gap-sm"
          role="radiogroup"
          aria-label={SHARE_REPORT_MODAL_COPY.shareOptionsLegend}
        >
          {options.map((option) => (
            <ShareOptionChip
              key={option.option}
              option={option}
              selected={activeOption === option.option}
              onSelect={onOptionChange}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-sm">
        <legend className="text-body-sm font-semibold text-foreground">
          {SHARE_REPORT_MODAL_COPY.permissionLegend}
        </legend>
        <div
          className="flex flex-col gap-sm"
          role="radiogroup"
          aria-label={SHARE_REPORT_MODAL_COPY.permissionLegend}
        >
          {permissions.map((item) => (
            <SharePermissionRow
              key={item.permission}
              item={item}
              selected={permission === item.permission}
              onSelect={(next) => {
                shareReportModalAnalytics.permissionChanged({
                  auditId,
                  permission: next,
                  tier,
                });
                onPermissionChange(next);
              }}
            />
          ))}
        </div>
      </fieldset>

      {activeOption === "link" ? (
        <div className="flex flex-col gap-sm">
          <Caption className="font-semibold text-foreground">
            {SHARE_REPORT_MODAL_COPY.linkLabel}
          </Caption>
          {shareUrl ? (
            <Input
              readOnly
              value={shareUrl}
              aria-label={SHARE_REPORT_MODAL_COPY.linkLabel}
            />
          ) : (
            <Caption className="text-muted-foreground">
              Generate a mock link to copy. This does not grant real access.
            </Caption>
          )}
          <div className="flex flex-wrap gap-sm">
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="text-primary-foreground"
              isLoading={generating}
              disabled={generating}
              aria-busy={generating}
              onClick={onGenerateLink}
              iconLeft={<Link2 className="size-4" aria-hidden />}
            >
              {generating
                ? SHARE_REPORT_MODAL_COPY.generatingLink
                : SHARE_REPORT_MODAL_COPY.generateLink}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!shareUrl || generating}
              onClick={onCopyLink}
              iconLeft={<Copy className="size-4" aria-hidden />}
            >
              {copied
                ? SHARE_REPORT_MODAL_COPY.copied
                : SHARE_REPORT_MODAL_COPY.copyLink}
            </Button>
          </div>
          {copied ? (
            <Caption role="status" aria-live="polite" className="text-success">
              {SHARE_REPORT_MODAL_COPY.copiedStatus}
            </Caption>
          ) : null}
        </div>
      ) : null}

      {activeOption === "email" ? (
        <div className="flex flex-col gap-sm">
          <Input
            type="email"
            label={SHARE_REPORT_MODAL_COPY.emailLabel}
            placeholder={SHARE_REPORT_MODAL_COPY.emailPlaceholder}
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            errorMessage={emailError ?? undefined}
          />
          <Button
            type="button"
            variant="primary"
            size="sm"
            className="self-start text-primary-foreground"
            disabled={!isValidShareEmail(email)}
            onClick={onSendEmail}
          >
            {SHARE_REPORT_MODAL_COPY.sendEmail}
          </Button>
        </div>
      ) : null}

      {activeOption === "organization" ? (
        <SharePlaceholderAction
          hint={SHARE_REPORT_MODAL_COPY.orgHint}
          label={SHARE_REPORT_MODAL_COPY.shareOrg}
          onClick={onOrgShare}
        />
      ) : null}

      {activeOption === "team" ? (
        <SharePlaceholderAction
          hint={SHARE_REPORT_MODAL_COPY.teamHint}
          label={SHARE_REPORT_MODAL_COPY.shareTeam}
          onClick={onTeamShare}
        />
      ) : null}
    </div>
  );
}
