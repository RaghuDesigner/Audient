import { NextResponse } from "next/server";

import { AuthRequiredError } from "@/lib/auth/session";
import { auditErrorResponse } from "@/lib/audits/http";
import { checkRateLimit, RateLimitError } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createAuditForUser, failAudit } from "@/services/audit/create";
import { listAuditsForUser } from "@/services/audit/queries";
import { scheduleAiAuditProcessor } from "@/services/audit/ai-processor";
import { persistScreenshotEvidence } from "@/services/audit/persist-screenshot";
import {
  AccountMissingError,
  AuthorizationError,
  assertNoClientIdentityForge,
  requireAuthenticatedUser,
  requireAuthorizationContext,
} from "@/services/authorization";
import type { AuditInputType } from "@/types/audit";

export const dynamic = "force-dynamic";

const MAX_IMAGE_DATA_URL_CHARS = 5_500_000; // ~4MB binary

function sanitizeImageDataUrl(value: unknown): string | null {
  if (typeof value !== "string" || !value.startsWith("data:image/")) {
    return null;
  }
  if (value.length > MAX_IMAGE_DATA_URL_CHARS) {
    return null;
  }
  if (!/^data:image\/(png|jpeg|jpg|webp);base64,/i.test(value)) {
    return null;
  }
  return value;
}

/**
 * GET /api/audits — authenticated audit history from public.audits.
 */
export async function GET(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const user = await requireAuthenticatedUser(supabase);
    const { account } = await requireAuthorizationContext(supabase, user);

    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") ?? "50");
    const offset = Number(url.searchParams.get("offset") ?? "0");
    const workspaceIdParam = url.searchParams.get("workspaceId");
    const workspaceId =
      workspaceIdParam && workspaceIdParam.length > 0 && workspaceIdParam.length <= 80
        ? workspaceIdParam
        : undefined;

    if (workspaceId) {
      const { assertWorkspaceMembership } = await import(
        "@/services/workspace"
      );
      await assertWorkspaceMembership(account.appUserId, workspaceId);
    }

    const audits = await listAuditsForUser(supabase, account.appUserId, {
      limit: Number.isFinite(limit) ? limit : 50,
      offset: Number.isFinite(offset) ? offset : 0,
      workspaceId,
    });

    return NextResponse.json(
      { audits },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof AccountMissingError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 404 },
      );
    }
    return auditErrorResponse(error);
  }
}

/**
 * POST /api/audits — create audit + authorize credits (server-owned).
 */
export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const user = await requireAuthenticatedUser(supabase);
    const { account } = await requireAuthorizationContext(supabase, user);

    const limit = checkRateLimit({
      key: `audit:create:${account.appUserId}`,
      limit: 10,
      windowMs: 60_000,
    });
    if (!limit.allowed) {
      throw new RateLimitError(limit.retryAfterSec);
    }

    const body = (await request.json().catch(() => null)) as {
      inputType?: string;
      websiteUrl?: string;
      website?: string;
      primaryAssetId?: string;
      correlationId?: string;
      workspaceId?: string;
      simulateFailure?: boolean;
      imageDataUrl?: string;
    } | null;

    if (!body) {
      return NextResponse.json(
        { error: "Invalid JSON body", code: "INVALID_BODY" },
        { status: 400 },
      );
    }

    assertNoClientIdentityForge(body);

    const rawType = (body.inputType ?? "").toUpperCase();
    let inputType: AuditInputType | null = null;
    if (rawType === "URL" || rawType === "SCREENSHOT") {
      inputType = rawType;
    } else if (body.website || body.websiteUrl) {
      inputType = "URL";
    } else if (body.primaryAssetId || body.imageDataUrl) {
      inputType = "SCREENSHOT";
    }

    if (!inputType) {
      return NextResponse.json(
        {
          error: "Provide inputType URL or SCREENSHOT",
          code: "INVALID_INPUT",
        },
        { status: 400 },
      );
    }

    const imageDataUrl = sanitizeImageDataUrl(body.imageDataUrl);
    if (body.imageDataUrl && !imageDataUrl) {
      return NextResponse.json(
        {
          error: "Invalid or oversized image. Use PNG/JPEG/WEBP under 4MB.",
          code: "SCREENSHOT_INVALID",
        },
        { status: 400 },
      );
    }

    if (
      process.env.NODE_ENV === "production" &&
      body.simulateFailure === true
    ) {
      return NextResponse.json(
        {
          error:
            "Simulated audit failures are unavailable in production.",
          code: "SIMULATE_FAILURE_FORBIDDEN",
        },
        { status: 400 },
      );
    }

    const result = await createAuditForUser(supabase, user, {
      inputType,
      websiteUrl: body.websiteUrl ?? body.website ?? null,
      primaryAssetId: body.primaryAssetId ?? null,
      correlationId: body.correlationId ?? null,
      workspaceId: body.workspaceId ?? null,
      simulateFailure: body.simulateFailure === true,
    });

    if (inputType === "SCREENSHOT") {
      const canReuseAsset = Boolean(result.audit.primaryAssetId);
      if (!canReuseAsset && !imageDataUrl) {
        await failAudit(supabase, {
          auditId: result.audit.id,
          appUserId: account.appUserId,
          code: "INTERNAL_ERROR",
          message: "Unable to store screenshot for analysis.",
        });
        return NextResponse.json(
          {
            error: "Unable to store screenshot for analysis.",
            code: "INTERNAL_ERROR",
          },
          { status: 500, headers: { "Cache-Control": "no-store" } },
        );
      }

      if (!canReuseAsset && imageDataUrl) {
        try {
          await persistScreenshotEvidence({
            supabase,
            appUserId: account.appUserId,
            auditId: result.audit.id,
            imageDataUrl,
          });
        } catch {
          await failAudit(supabase, {
            auditId: result.audit.id,
            appUserId: account.appUserId,
            code: "INTERNAL_ERROR",
            message: "Unable to store screenshot for analysis.",
          });
          return NextResponse.json(
            {
              error: "Unable to store screenshot for analysis.",
              code: "INTERNAL_ERROR",
            },
            { status: 500, headers: { "Cache-Control": "no-store" } },
          );
        }
      }
    }

    scheduleAiAuditProcessor(supabase, result.audit.id, { imageDataUrl });

    return NextResponse.json(
      {
        auditId: result.audit.id,
        status: result.audit.status,
        creditsCost: result.audit.creditsCost,
        creditsRemaining: result.creditsRemaining,
        correlationId: result.audit.correlationId,
      },
      {
        status: 202,
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      );
    }
    if (error instanceof AccountMissingError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 404 },
      );
    }
    if (error instanceof AuthRequiredError) {
      return auditErrorResponse(error);
    }
    return auditErrorResponse(error);
  }
}
