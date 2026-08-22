import type { User } from "@supabase/supabase-js";

import type { AuthPlanTier, AuthUser } from "@/types/auth";

function resolvePlanTier(metadata: Record<string, unknown>): AuthPlanTier {
  const raw = metadata.plan ?? metadata.tier;
  if (raw === "PRO" || raw === "ENTERPRISE" || raw === "FREE") {
    return raw;
  }
  if (raw === "BUSINESS") return "ENTERPRISE";
  return "FREE";
}

/**
 * Map a verified Supabase Auth user to the app `AuthUser` shape.
 * Shared by server session helpers and the client AuthProvider.
 */
export function mapSupabaseUser(user: User): AuthUser {
  const metadata = user.user_metadata ?? {};
  const fullName =
    (typeof metadata.full_name === "string" && metadata.full_name) ||
    (typeof metadata.name === "string" && metadata.name) ||
    null;
  const avatarUrl =
    (typeof metadata.avatar_url === "string" && metadata.avatar_url) ||
    (typeof metadata.picture === "string" && metadata.picture) ||
    null;

  return {
    id: user.id,
    email: user.email ?? null,
    emailVerified: Boolean(user.email_confirmed_at),
    fullName,
    avatarUrl,
    planTier: resolvePlanTier(metadata),
  };
}
