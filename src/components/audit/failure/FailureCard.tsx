"use client";

import * as React from "react";

import { FailureActions } from "@/components/audit/failure/FailureActions";
import { FailureMessage } from "@/components/audit/failure/FailureMessage";
import { auditFailureAnalytics } from "@/lib/analytics/audit-failure-events";
import type { AuditFailureViewModel } from "@/config/audit-failure";
import { Caption } from "@/components/ui/typography";
import { cn } from "@/utils/cn";

export type FailureCardProps = {
  failure: AuditFailureViewModel;
  retrying?: boolean;
  onRetry?: () => void;
  onUploadAnother: () => void;
  onBackHome: () => void;
  className?: string;
};

/**
 * SCREEN-003 failure content — message + details disclosure + recovery actions.
 * Replaces the Processing progress indicator in the same layout band.
 */
export function FailureCard({
  failure,
  retrying = false,
  onRetry,
  onUploadAnother,
  onBackHome,
  className,
}: FailureCardProps) {
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const shownRef = React.useRef(false);

  React.useEffect(() => {
    if (!shownRef.current) {
      shownRef.current = true;
      auditFailureAnalytics.shown(failure.auditId, failure.code);
    }
    headingRef.current?.focus();
  }, [failure.auditId, failure.code]);

  const refundNote = failure.refundApplied
    ? "Your credits for this audit were returned."
    : null;

  return (
    <div
      className={cn(
        "flex w-full flex-col items-center gap-lg",
        className,
      )}
      role="region"
      aria-label="Audit failed"
    >
      <FailureMessage
        title={failure.title}
        description={failure.description}
        refundNote={refundNote}
        headingRef={headingRef}
      />

      <FailureActions
        retryAllowed={failure.retryAllowed}
        retrying={retrying}
        detailsOpen={detailsOpen}
        onRetry={failure.retryAllowed ? onRetry : undefined}
        onUploadAnother={onUploadAnother}
        onBackHome={onBackHome}
        onToggleDetails={() => {
          setDetailsOpen((open) => {
            const next = !open;
            if (next) {
              auditFailureAnalytics.detailsExpanded(failure.auditId);
            }
            return next;
          });
        }}
      />

      {detailsOpen ? (
        <div
          id="audit-failure-details"
          className={cn(
            "w-full max-w-2xl rounded-md border border-border bg-muted/40 p-md text-left",
          )}
        >
          <dl className="flex flex-col gap-sm">
            <div>
              <Caption as="dt" className="font-semibold text-foreground">
                Error code
              </Caption>
              <dd className="font-mono text-info text-muted-foreground">
                {failure.code}
              </dd>
            </div>
            <div>
              <Caption as="dt" className="font-semibold text-foreground">
                Correlation ID
              </Caption>
              <dd className="break-all font-mono text-info text-muted-foreground">
                {failure.correlationId}
              </dd>
            </div>
            <div>
              <Caption as="dt" className="font-semibold text-foreground">
                Audit ID
              </Caption>
              <dd className="break-all font-mono text-info text-muted-foreground">
                {failure.auditId}
              </dd>
            </div>
            {failure.technicalMessage ? (
              <div>
                <Caption as="dt" className="font-semibold text-foreground">
                  Details
                </Caption>
                <dd className="text-info text-muted-foreground sm:text-body-sm">
                  {failure.technicalMessage}
                </dd>
              </div>
            ) : null}
          </dl>
        </div>
      ) : null}
    </div>
  );
}
