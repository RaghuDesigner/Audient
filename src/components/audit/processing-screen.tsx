"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { AuditFailedPanel } from "@/components/audit/failure/AuditFailedPanel";
import { Header } from "@/components/home/header";
import { BodyMedium, H2 } from "@/components/ui/typography";
import {
  createMockAuditFailure,
  type AuditFailureViewModel,
} from "@/config/audit-failure";
import {
  AUDIT_PROCESSING_MOCK_DELAY_MS,
  type AuditProcessingMockFail,
} from "@/config/audit-processing";
import {
  fetchAuditStatus,
  retryAuditRequest,
} from "@/lib/audits/client";
import { useAccountOptional } from "@/providers/account-provider";
import { isRealAuditId } from "@/utils/audit-id";
import {
  auditProcessingRoute,
  auditReportRoute,
} from "@/utils/audit-processing-route";
import { cn } from "@/utils/cn";

export type ProcessingScreenProps = {
  auditId: string;
  /**
   * Phase-1 mock: force failure UI after a short delay.
   * Pass a taxonomy code (e.g. `AI_UNAVAILABLE`) or `true` for INTERNAL_ERROR.
   */
  mockFail?: AuditProcessingMockFail;
  className?: string;
};

type ViewStatus = "processing" | "failed";

/**
 * SCREEN-M01 / SCREEN-M03 shell — Home chrome + processing band.
 * Real UUID audits poll `/api/audits/:id`; mock-* ids keep the timer path.
 */
export function ProcessingScreen({
  auditId,
  mockFail = false,
  className,
}: ProcessingScreenProps) {
  const router = useRouter();
  const accountCtx = useAccountOptional();
  const [status, setStatus] = React.useState<ViewStatus>("processing");
  const [failure, setFailure] = React.useState<AuditFailureViewModel | null>(
    null,
  );
  const [attempt, setAttempt] = React.useState(0);
  const real = isRealAuditId(auditId);

  React.useEffect(() => {
    setStatus("processing");
    setFailure(null);

    if (!real) {
      const timer = window.setTimeout(() => {
        if (mockFail) {
          const code =
            typeof mockFail === "string" && mockFail.length > 0
              ? mockFail
              : "INTERNAL_ERROR";
          setFailure(
            createMockAuditFailure({
              auditId,
              code,
            }),
          );
          setStatus("failed");
          return;
        }

        router.replace(auditReportRoute(auditId));
      }, AUDIT_PROCESSING_MOCK_DELAY_MS);

      return () => window.clearTimeout(timer);
    }

    let cancelled = false;
    let timer: number | undefined;

    const poll = async () => {
      try {
        const audit = await fetchAuditStatus(auditId);
        if (cancelled) return;

        if (audit.status === "COMPLETED") {
          accountCtx?.refresh();
          router.replace(auditReportRoute(auditId));
          return;
        }

        if (audit.status === "FAILED") {
          accountCtx?.refresh();
          setFailure(
            createMockAuditFailure({
              auditId,
              code: audit.failureCode,
            }),
          );
          setStatus("failed");
          return;
        }

        timer = window.setTimeout(() => {
          void poll();
        }, 1000);
      } catch {
        if (cancelled) return;
        timer = window.setTimeout(() => {
          void poll();
        }, 1500);
      }
    };

    void poll();

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [accountCtx, auditId, mockFail, attempt, real, router]);

  const handleRetry = () => {
    if (!real) {
      const nextId = `mock-${Date.now().toString(36)}`;
      router.replace(auditProcessingRoute(nextId));
      setAttempt((n) => n + 1);
      return;
    }

    void (async () => {
      try {
        const created = await retryAuditRequest(auditId);
        accountCtx?.refresh();
        router.replace(auditProcessingRoute(created.auditId));
        setAttempt((n) => n + 1);
      } catch {
        setFailure(
          createMockAuditFailure({
            auditId,
            code: "INTERNAL_ERROR",
          }),
        );
        setStatus("failed");
      }
    })();
  };

  return (
    <div
      className={cn("flex min-h-screen flex-col bg-background", className)}
    >
      <Header />
      <main
        id="main"
        className={cn(
          "mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center",
          "gap-lg px-md py-xl",
        )}
      >
        {status === "failed" && failure ? (
          <AuditFailedPanel failure={failure} onRetry={handleRetry} />
        ) : (
          <ProcessingPlaceholder auditId={auditId} real={real} />
        )}
      </main>
    </div>
  );
}

function ProcessingPlaceholder({
  auditId,
  real,
}: {
  auditId: string;
  real: boolean;
}) {
  return (
    <div className="flex w-full flex-col items-center gap-lg">
      <Loader2 className="size-12 animate-spin text-primary" aria-hidden />
      <div className="flex flex-col items-center gap-sm text-center">
        <H2 className="text-primary">Analyzing your website…</H2>
        <BodyMedium className="text-muted-foreground">
          {real
            ? "We’re preparing your UX audit. Status updates live from the server."
            : "We’re preparing your UX audit. This is a mock processing state — no backend yet."}
        </BodyMedium>
        <p className="text-info text-muted-foreground">
          Audit ID:{" "}
          <span className="font-semibold text-foreground">{auditId}</span>
        </p>
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext="Processing"
        className="h-2 w-full max-w-sm overflow-hidden rounded-full bg-muted"
      >
        <div className="h-full w-2/3 animate-pulse rounded-full bg-primary" />
      </div>
    </div>
  );
}
