/**
 * Post-login verification that the Auth trigger provisioned app rows.
 * Does not create membership/credits from the browser — trigger + RLS only.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export type AppUserProvisionStatus = {
  ok: boolean;
  appUserId: string | null;
  membershipTier: string | null;
  hasCreditsRow: boolean;
};

const RETRIES = 5;
const RETRY_MS = 200;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Confirm `public.users` (+ membership/credits) exist for the JWT subject.
 * Retries briefly to absorb trigger latency after `auth.users` INSERT.
 */
export async function verifyAppUserProvisioned(
  supabase: SupabaseClient,
  authUserId: string,
): Promise<AppUserProvisionStatus> {
  for (let attempt = 0; attempt < RETRIES; attempt += 1) {
    const { data: userRow, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("auth_provider_id", authUserId)
      .is("deleted_at", null)
      .maybeSingle();

    if (userError) {
      return {
        ok: false,
        appUserId: null,
        membershipTier: null,
        hasCreditsRow: false,
      };
    }

    if (userRow?.id) {
      const [{ data: membership }, { data: credits }] = await Promise.all([
        supabase
          .from("memberships")
          .select("tier")
          .eq("user_id", userRow.id)
          .maybeSingle(),
        supabase
          .from("credits")
          .select("id")
          .eq("user_id", userRow.id)
          .maybeSingle(),
      ]);

      const hasMembership = Boolean(membership?.tier);
      const hasCreditsRow = Boolean(credits?.id);

      return {
        ok: hasMembership && hasCreditsRow,
        appUserId: userRow.id,
        membershipTier:
          typeof membership?.tier === "string" ? membership.tier : null,
        hasCreditsRow,
      };
    }

    if (attempt < RETRIES - 1) {
      await sleep(RETRY_MS);
    }
  }

  return {
    ok: false,
    appUserId: null,
    membershipTier: null,
    hasCreditsRow: false,
  };
}
