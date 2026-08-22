"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { FailureCard } from "@/components/audit/failure/FailureCard";
import { auditFailureAnalytics } from "@/lib/analytics/audit-failure-events";
import type { AuditFailureViewModel } from "@/config/audit-failure";
import { cn } from "@/utils/cn";

export type AuditFailedPanelProps = {
  failure: AuditFailureViewModel;
  /** Called when Retry starts a new mock attempt (parent may remount processing). */
  onRetry?: () => void;
  className?: string;
};

/**
 * SCREEN-003 panel — drops into the Processing content band.
 * Progress / tips are omitted; failure content takes priority.
 */
export function AuditFailedPanel({
  failure,
  onRetry,
  className,
}: AuditFailedPanelProps) {
  const router = useRouter();
  const [retrying, setRetrying] = React.useState(false);

  const handleUploadAnother = () => {
    auditFailureAnalytics.uploadNew(failure.auditId);
    router.push("/");
  };

  const handleBackHome = () => {
    router.push("/");
  };

  const handleRetry = () => {
    if (!failure.retryAllowed) return;
    setRetrying(true);
    auditFailureAnalytics.retryClicked(failure.auditId, failure.code);
    if (onRetry) {
      onRetry();
      return;
    }
    // Default mock retry: new processing visit
    router.push(`/audit/mock-${Date.now().toString(36)}`);
  };

  return (
    <div className={cn("w-full", className)}>
      <FailureCard
        failure={failure}
        retrying={retrying}
        onRetry={handleRetry}
        onUploadAnother={handleUploadAnother}
        onBackHome={handleBackHome}
      />
    </div>
  );
}
