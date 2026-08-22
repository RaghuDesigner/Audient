import "server-only";

import { createClient } from "@supabase/supabase-js";

import {
  requireSupabasePublicEnv,
  requireSupabaseServiceRoleKey,
} from "@/lib/supabase/env";

/**
 * Service-role Supabase client — bypasses Row-Level Security.
 * SERVER-ONLY and trusted paths only (workers, webhooks, provisioning).
 * Never import this into client code or expose the service-role key.
 *
 * Not used by BACKEND-001 connection checks — reserved for later phases.
 */
export function createSupabaseAdminClient() {
  const { url } = requireSupabasePublicEnv();
  const serviceRoleKey = requireSupabaseServiceRoleKey();

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
