"use client";

import * as React from "react";
import { ArrowLeft, Copy, ImageIcon } from "lucide-react";

import { AuditStatusBadge } from "@/components/dashboard/AuditStatusBadge";
import { AuditSummaryActions } from "@/components/report/AuditSummaryActions";
import {
  auditSummaryChrome,
  AuditSummaryError,
  AuditSummaryLoading,
} from "@/components/report/AuditSummaryStates";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Caption, H2 } from "@/components/ui/typography";
import {
  AUDIT_SUMMARY_ACTION_LABELS,
  AUDIT_SUMMARY_MEMBERSHIP_LABELS,
  AUDIT_SUMMARY_TYPE_LABELS,
  type AuditSummaryMembership,
  type AuditSummaryState,
  type AuditSummaryStatus,
  type AuditSummaryTier,
  type AuditSummaryType,
  type AuditSummaryVariant,
} from "@/config/audit-summary";
import { auditSummaryAnalytics } from "@/lib/analytics/audit-summary-events";
import {
  auditSummaryAccessibleName,
  formatAuditDuration,
  formatAuditSummaryDateTime,
  formatAuditSummaryUrl,
  resolveAuditSummaryActions,
} from "@/utils/audit-summary";
import { cn } from "@/utils/cn";

export type AuditSummaryProps = {
  state: AuditSummaryState;
  auditId?: string | null;
  websiteName: string;
  websiteUrl?: string | null;
  thumbnailUrl?: string | null;
  thumbnailAlt?: string | null;
  auditedAt: string | Date;
  durationSeconds?: number | null;
  auditType: AuditSummaryType;
  membershipUsed?: AuditSummaryMembership | null;
  aiEngineVersion?: string | null;
  status: AuditSummaryStatus;
  tier: AuditSummaryTier;
  pdfAvailable?: boolean;
  variant?: AuditSummaryVariant;
  onShare?: () => void;
  onExportPdf?: () => void;
  onCompare?: () => void;
  onContinueCompare?: (peerAuditId: string) => void;
  onUpgrade?: (source: string) => void;
  onRetry?: () => void;
  onBack?: () => void;
  backLabel?: string;
  className?: string;
};

/**
 * COMPONENT-027 — Audit Summary.
 * Report header: thumb · meta · status · Share / PDF / Compare (tier-gated).
 */
export function AuditSummary({
  state,
  auditId = null,
  websiteName,
  websiteUrl = null,
  thumbnailUrl = null,
  thumbnailAlt = null,
  auditedAt,
  durationSeconds = null,
  auditType,
  membershipUsed = null,
  aiEngineVersion = null,
  status,
  tier,
  pdfAvailable = false,
  variant = "report",
  onShare,
  onExportPdf,
  onCompare,
  onContinueCompare,
  onUpgrade,
  onRetry,
  onBack,
  backLabel = "Back",
  className,
}: AuditSummaryProps) {
  const impressed = React.useRef(false);

  React.useEffect(() => {
    if (state === "loading" || state === "error" || !auditId) return;
    if (impressed.current) return;
    impressed.current = true;
    auditSummaryAnalytics.viewed({ auditId, status, tier, variant });
  }, [auditId, state, status, tier, variant]);

  if (state === "loading") {
    return <AuditSummaryLoading className={className} />;
  }

  if (state === "error") {
    return (
      <AuditSummaryError
        auditId={auditId}
        onRetry={onRetry}
        className={className}
      />
    );
  }

  const urlLabel = formatAuditSummaryUrl(websiteUrl);
  const durationLabel = formatAuditDuration(durationSeconds);
  const accessibleName = auditSummaryAccessibleName({
    websiteName,
    auditType,
    status,
    auditedAt,
    auditId,
    membershipUsed,
    aiEngineVersion,
  });
  const actions = resolveAuditSummaryActions({
    state,
    status,
    tier,
    variant,
    pdfAvailable,
  });

  return (
    <section
      className={cn(auditSummaryChrome, className)}
      aria-label={accessibleName}
    >
      <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-md border border-border bg-muted sm:h-28 sm:w-40">
        {thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- mock / signed preview URLs
          <img
            src={thumbnailUrl}
            alt={thumbnailAlt ?? `Preview of ${websiteName}`}
            className="size-full object-cover"
          />
        ) : (
          <span
            className="flex size-full items-center justify-center text-muted-foreground"
            aria-hidden
          >
            <ImageIcon className="size-6" />
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-md">
        <div className="flex flex-col gap-sm sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-sm">
              <H2 className="truncate text-h3 sm:text-h2">{websiteName}</H2>
              <AuditStatusBadge status={status} />
            </div>
            {urlLabel ? (
              <Caption
                className="mt-sm truncate text-muted-foreground"
                title={websiteUrl ?? urlLabel}
              >
                {urlLabel}
              </Caption>
            ) : null}
            <Caption className="mt-sm text-muted-foreground">
              {formatAuditSummaryDateTime(auditedAt)}
              {durationLabel ? ` · ${durationLabel}` : null}
              {" · "}
              {AUDIT_SUMMARY_TYPE_LABELS[auditType]}
              {aiEngineVersion ? ` · ${aiEngineVersion}` : null}
            </Caption>
            <div className="mt-sm flex flex-wrap items-center gap-sm">
              {membershipUsed ? (
                <Badge variant="info" size="sm" shape="rounded">
                  {AUDIT_SUMMARY_MEMBERSHIP_LABELS[membershipUsed]}
                </Badge>
              ) : null}
              {auditId ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto px-sm py-0.5 text-info font-regular text-muted-foreground"
                  aria-label={AUDIT_SUMMARY_ACTION_LABELS.copyAuditId}
                  onClick={() => {
                    void navigator.clipboard?.writeText(auditId);
                    auditSummaryAnalytics.auditIdCopied({ auditId });
                  }}
                  iconLeft={<Copy className="size-3.5" aria-hidden />}
                >
                  {auditId}
                </Button>
              ) : null}
            </div>
          </div>
          {onBack ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onBack}
              iconLeft={<ArrowLeft className="size-4" aria-hidden />}
              className="shrink-0 self-start"
            >
              {backLabel}
            </Button>
          ) : null}
        </div>

        <AuditSummaryActions
          auditId={auditId}
          tier={tier}
          actions={actions}
          pdfAvailable={pdfAvailable}
          compareReady={status === "completed"}
          onShare={onShare}
          onExportPdf={onExportPdf}
          onCompare={onCompare}
          onContinueCompare={onContinueCompare}
          onUpgrade={onUpgrade}
        />
      </div>
    </section>
  );
}
