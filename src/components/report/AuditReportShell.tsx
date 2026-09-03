"use client";

import { EmptyState } from "@/components/common/EmptyState";
import { Footer } from "@/components/layout/footer";
import { SkipLink } from "@/components/layout/skip-link";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AUDIT_REPORT_EMPTY,
  AUDIT_REPORT_ERROR,
  type AuditReportTier,
} from "@/config/audit-report";
import { cn } from "@/utils/cn";

export function AuditReportShell({
  header,
  children,
  center = false,
}: {
  header: React.ReactNode;
  children: React.ReactNode;
  center?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SkipLink />
      {header}
      <main
        id="main-content"
        className={cn(
          "mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-lg px-md py-lg lg:px-lg",
          center && "justify-center",
        )}
      >
        {children}
      </main>
      <Footer variant="minimal" />
    </div>
  );
}

export function AuditReportLoadingSkeleton() {
  return (
    <>
      <Skeleton className="h-40 w-full rounded-md" />
      <Skeleton className="h-48 w-full rounded-md" />
      <div className="grid gap-md sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-28 rounded-md" />
        <Skeleton className="h-28 rounded-md" />
        <Skeleton className="h-28 rounded-md" />
      </div>
    </>
  );
}

export function AuditReportStatusEmpty({
  tier,
  kind,
  onPrimary,
  onSecondary,
}: {
  tier: Exclude<AuditReportTier, never>;
  kind:
    | "error"
    | "placeholder"
    | "processing"
    | "failed"
    | "not_found"
    | "empty";
  onPrimary?: () => void;
  onSecondary?: () => void;
}) {
  if (kind === "processing") {
    return (
      <EmptyState
        variant="custom"
        tier={tier}
        headline="Audit still processing"
        description="This report isn’t ready yet. Open the processing page to watch live status."
        primaryLabel="View status"
        secondaryLabel="Back to History"
        onPrimary={onPrimary}
        onSecondary={onSecondary}
        size="page"
      />
    );
  }

  if (kind === "failed") {
    return (
      <EmptyState
        variant="custom"
        tier={tier}
        headline="Audit failed"
        description="This audit didn’t complete successfully. Open the audit for details and retry options."
        primaryLabel="View failure details"
        secondaryLabel="Back to History"
        onPrimary={onPrimary}
        onSecondary={onSecondary}
        size="page"
      />
    );
  }

  if (kind === "error" || kind === "placeholder") {
    return (
      <EmptyState
        variant="custom"
        tier={tier}
        headline={
          kind === "placeholder"
            ? "Report not ready"
            : AUDIT_REPORT_ERROR.headline
        }
        description={
          kind === "placeholder"
            ? "This audit completed, but real findings aren’t available yet. Please retry in a moment."
            : AUDIT_REPORT_ERROR.description
        }
        primaryLabel={AUDIT_REPORT_ERROR.primaryLabel}
        secondaryLabel="Back to History"
        onPrimary={onPrimary}
        onSecondary={onSecondary}
        size="page"
      />
    );
  }

  return (
    <EmptyState
      variant="no_reports"
      tier={tier}
      headline={AUDIT_REPORT_EMPTY.headline}
      description={AUDIT_REPORT_EMPTY.description}
      primaryLabel={AUDIT_REPORT_EMPTY.primaryLabel}
      secondaryLabel={AUDIT_REPORT_EMPTY.secondaryLabel}
      onPrimary={onPrimary}
      onSecondary={onSecondary}
      size="page"
    />
  );
}
