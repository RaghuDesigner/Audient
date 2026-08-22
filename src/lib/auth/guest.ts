import "server-only";

import { cookies } from "next/headers";

import { GUEST_COOKIE } from "@/config/auth";

/**
 * Server helpers for anonymous Guest Mode (SCREEN-001 / BR-GUEST-*).
 * Guests have no Supabase JWT — only a durable cookie id used to scope
 * teaser audits and claim them after login. Never treat guestId as auth.
 */

function createGuestId(): string {
  return crypto.randomUUID();
}

/**
 * Read the guest cookie, or create one if missing.
 * Call from Server Components / Route Handlers that need guest context.
 */
export async function getOrCreateGuestId(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(GUEST_COOKIE.name)?.value;

  if (existing && isValidGuestId(existing)) {
    return existing;
  }

  const guestId = createGuestId();
  cookieStore.set(GUEST_COOKIE.name, guestId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: GUEST_COOKIE.maxAgeSeconds,
  });

  return guestId;
}

/** Read guest id without creating one (e.g. middleware / optional paths). */
export async function getGuestId(): Promise<string | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(GUEST_COOKIE.name)?.value;
  return value && isValidGuestId(value) ? value : null;
}

/** Clear guest cookie after claim-on-login (or explicit discard). */
export async function clearGuestId(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(GUEST_COOKIE.name);
}

function isValidGuestId(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}
