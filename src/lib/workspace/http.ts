import "server-only";

import { NextResponse } from "next/server";

import { AuthRequiredError } from "@/lib/auth/session";
import { RateLimitError } from "@/lib/rate-limit";
import {
  AccountMissingError,
  AuthorizationError,
} from "@/services/authorization";

export function workspaceErrorResponse(error: unknown): NextResponse {
  if (error instanceof AuthRequiredError) {
    return NextResponse.json(
      { error: error.message, code: "UNAUTHORIZED" },
      { status: 401 },
    );
  }
  if (error instanceof RateLimitError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      {
        status: 429,
        headers: { "Retry-After": String(error.retryAfterSec) },
      },
    );
  }
  if (error instanceof AccountMissingError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: 404 },
    );
  }
  if (error instanceof AuthorizationError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.status },
    );
  }
  console.error("[api/workspaces]", error);
  return NextResponse.json(
    { error: "Unable to process workspace request", code: "INTERNAL_ERROR" },
    { status: 500 },
  );
}
