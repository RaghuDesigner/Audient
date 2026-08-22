import { createBrowserClient } from "@supabase/ssr";

import { requireSupabasePublicEnv } from "@/lib/supabase/env";

/**
 * Supabase client for Client Components (browser).
 * Uses the public anon key — never the service-role key.
 *
 * Prefer calling this only when `USE_MOCK_AUTH` is false (see AuthProvider).
 */
export function createSupabaseBrowserClient() {
  const { url, anonKey } = requireSupabasePublicEnv();
  return createBrowserClient(url, anonKey);
}
