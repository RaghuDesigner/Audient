import { type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

/**
 * Edge middleware — guest cookie + route guards.
 * When `USE_MOCK_AUTH` is true, skips Supabase session refresh so mock
 * frontend remains usable without a live Auth connection.
 * When mock auth is off, refreshes Supabase session cookies.
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static assets and image files.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
