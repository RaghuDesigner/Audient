import type { AuditListItem, AuditRecord, AuditReportFoundation } from "@/types/audit";
import type { AuditInputType } from "@/types/audit";

export type CreateAuditClientInput = {
  inputType: AuditInputType;
  websiteUrl?: string | null;
  primaryAssetId?: string | null;
  /** Transient screenshot for AI (data URL). Not persisted. */
  imageDataUrl?: string | null;
  /** Non-production QA only; rejected in production. */
  simulateFailure?: boolean;
};

export type CreateAuditClientResult = {
  auditId: string;
  status: string;
  creditsCost: number;
  creditsRemaining: number | null;
  correlationId: string | null;
};

async function readError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: string; code?: string };
    return body.error ?? body.code ?? response.statusText;
  } catch {
    return response.statusText || "Request failed";
  }
}

export async function createAuditRequest(
  input: CreateAuditClientInput,
): Promise<CreateAuditClientResult> {
  const response = await fetch("/api/audits", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error(await readError(response));
  }
  return (await response.json()) as CreateAuditClientResult;
}

export async function fetchAuditStatus(
  auditId: string,
): Promise<AuditRecord> {
  const response = await fetch(`/api/audits/${encodeURIComponent(auditId)}`, {
    method: "GET",
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(await readError(response));
  }
  const body = (await response.json()) as { audit: AuditRecord };
  return body.audit;
}

export async function fetchAuditHistory(options?: {
  limit?: number;
}): Promise<AuditListItem[]> {
  const limit = options?.limit ?? 50;
  const response = await fetch(`/api/audits?limit=${limit}`, {
    method: "GET",
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(await readError(response));
  }
  const body = (await response.json()) as { audits: AuditListItem[] };
  return body.audits;
}

export async function retryAuditRequest(
  auditId: string,
): Promise<CreateAuditClientResult> {
  const response = await fetch(
    `/api/audits/${encodeURIComponent(auditId)}/retry`,
    {
      method: "POST",
      credentials: "same-origin",
    },
  );
  if (!response.ok) {
    throw new Error(await readError(response));
  }
  return (await response.json()) as CreateAuditClientResult;
}

export class AuditReportFetchError extends Error {
  readonly code: string;
  readonly status: number;
  readonly auditStatus: string | null;

  constructor(
    message: string,
    options: { code: string; status: number; auditStatus?: string | null },
  ) {
    super(message);
    this.name = "AuditReportFetchError";
    this.code = options.code;
    this.status = options.status;
    this.auditStatus = options.auditStatus ?? null;
  }
}

export async function fetchAuditReportFoundation(
  auditId: string,
): Promise<AuditReportFoundation> {
  const response = await fetch(
    `/api/audits/${encodeURIComponent(auditId)}/report`,
    {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
    },
  );
  if (!response.ok) {
    let code = "REPORT_FETCH_FAILED";
    let message = response.statusText || "Request failed";
    let auditStatus: string | null = null;
    try {
      const body = (await response.json()) as {
        error?: string;
        code?: string;
        status?: string;
      };
      code = body.code ?? code;
      message = body.error ?? body.code ?? message;
      auditStatus = typeof body.status === "string" ? body.status : null;
    } catch {
      /* keep defaults */
    }
    throw new AuditReportFetchError(message, {
      code,
      status: response.status,
      auditStatus,
    });
  }
  const body = (await response.json()) as { report: AuditReportFoundation };
  return body.report;
}
