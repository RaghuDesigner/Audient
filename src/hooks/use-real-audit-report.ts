"use client";

import * as React from "react";

import {
  AuditReportFetchError,
  fetchAuditReportFoundation,
} from "@/lib/audits/client";
import type { AuditReportFoundation } from "@/types/audit";
import type { AuditReportState } from "@/config/audit-report";

export type RealAuditReportStatus =
  | "idle"
  | "loading"
  | "ready"
  | "processing"
  | "failed"
  | "not_found"
  | "placeholder"
  | "error";

/**
 * Fail-closed loader for real UUID audit reports.
 * Never invents findings — placeholder / errors stay non-ready.
 */
export function useRealAuditReport(input: {
  auditId: string;
  enabled: boolean;
  state: AuditReportState;
  isEmpty: boolean;
  retryToken: number;
}): {
  report: AuditReportFoundation | null;
  status: RealAuditReportStatus;
} {
  const { auditId, enabled, state, isEmpty, retryToken } = input;
  const [report, setReport] = React.useState<AuditReportFoundation | null>(
    null,
  );
  const [status, setStatus] = React.useState<RealAuditReportStatus>(
    enabled ? "loading" : "idle",
  );

  React.useEffect(() => {
    if (!enabled) {
      setReport(null);
      setStatus("idle");
      return;
    }

    if (state === "loading" || state === "error" || isEmpty) {
      setReport(null);
      setStatus(
        state === "error"
          ? "error"
          : state === "empty"
            ? "not_found"
            : "loading",
      );
      return;
    }

    setReport(null);
    setStatus("loading");
    let cancelled = false;

    void (async () => {
      try {
        const next = await fetchAuditReportFoundation(auditId);
        if (cancelled) return;

        if (next.placeholder) {
          setReport(null);
          setStatus("placeholder");
          return;
        }

        setReport(next);
        setStatus("ready");
      } catch (error) {
        if (cancelled) return;
        setReport(null);

        if (error instanceof AuditReportFetchError) {
          if (error.status === 404 || error.code === "AUDIT_NOT_FOUND") {
            setStatus("not_found");
            return;
          }
          if (error.code === "REPORT_NOT_READY") {
            setStatus(
              error.auditStatus === "FAILED" ? "failed" : "processing",
            );
            return;
          }
        }

        setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [auditId, enabled, isEmpty, retryToken, state]);

  return { report, status };
}
