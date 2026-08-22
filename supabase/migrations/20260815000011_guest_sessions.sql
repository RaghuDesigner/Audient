-- =============================================================================
-- BACKEND-002 APPLY — Guest sessions foundation
-- Migration: 20260815000011_guest_sessions.sql
--
-- Purpose: Temporary guest audit sessions (TTL + claim hooks).
-- Access is server/service_role only — RLS deny policies added in 019.
-- Does not invent a jobs table; guest ownership uses this session row.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.guest_sessions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- SHA-256 (or similar) of the secret claim / capability token. Never store raw tokens.
  guest_key_hash      TEXT NOT NULL,
  claim_token_hash    TEXT,
  expires_at          TIMESTAMPTZ NOT NULL,
  claimed_at          TIMESTAMPTZ,
  claimed_by_user_id  UUID,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),

  CONSTRAINT guest_sessions_guest_key_hash_unique UNIQUE (guest_key_hash),
  CONSTRAINT guest_sessions_claimed_by_user_id_fkey
    FOREIGN KEY (claimed_by_user_id)
    REFERENCES public.users (id)
    ON DELETE SET NULL,
  CONSTRAINT guest_sessions_expires_after_create
    CHECK (expires_at > created_at),
  CONSTRAINT guest_sessions_claim_consistency
    CHECK (
      (claimed_at IS NULL AND claimed_by_user_id IS NULL)
      OR (claimed_at IS NOT NULL AND claimed_by_user_id IS NOT NULL)
    )
);

COMMENT ON TABLE public.guest_sessions IS
  'Temporary guest audit sessions (TTL). Claimed into public.users after login. No client JWT access.';

CREATE INDEX IF NOT EXISTS guest_sessions_expires_at_idx
  ON public.guest_sessions (expires_at)
  WHERE claimed_at IS NULL;

CREATE INDEX IF NOT EXISTS guest_sessions_claimed_by_user_id_idx
  ON public.guest_sessions (claimed_by_user_id)
  WHERE claimed_by_user_id IS NOT NULL;

DROP TRIGGER IF EXISTS guest_sessions_set_updated_at ON public.guest_sessions;

CREATE TRIGGER guest_sessions_set_updated_at
  BEFORE UPDATE ON public.guest_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
