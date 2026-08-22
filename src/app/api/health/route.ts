import { NextResponse } from "next/server";

import { getHealthCheckResult } from "@/lib/supabase/health";

/**
 * API-SYS-001 — Public health / readiness check.
 * Reports app status + safe dependency flags. Never exposes secrets.
 */
export async function GET() {
  const result = await getHealthCheckResult();
  const httpStatus =
    result.status === "ok" ? 200 : result.status === "degraded" ? 200 : 503;

  return NextResponse.json(result, {
    status: httpStatus,
    headers: {
      "cache-control": "no-store",
    },
  });
}
