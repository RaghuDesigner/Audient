-- =============================================================================
-- BACKEND-002 APPLY — File assets guest ownership
-- Migration: 20260815000013_file_assets_guest.sql
--
-- Purpose: Guest XOR ownership on file_assets + audits.primary_asset_id FK.
-- Existing user-owned assets remain valid (user_id set, guest_session_id NULL).
-- =============================================================================

ALTER TABLE public.file_assets
  ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.file_assets
  ADD COLUMN IF NOT EXISTS guest_session_id UUID;

ALTER TABLE public.file_assets
  DROP CONSTRAINT IF EXISTS file_assets_owner_xor;

ALTER TABLE public.file_assets
  ADD CONSTRAINT file_assets_owner_xor
  CHECK (
    (user_id IS NOT NULL AND guest_session_id IS NULL)
    OR (user_id IS NULL AND guest_session_id IS NOT NULL)
  );

-- RESTRICT preserves XOR if a guest_session is removed incorrectly.
ALTER TABLE public.file_assets
  DROP CONSTRAINT IF EXISTS file_assets_guest_session_id_fkey;

ALTER TABLE public.file_assets
  ADD CONSTRAINT file_assets_guest_session_id_fkey
  FOREIGN KEY (guest_session_id)
  REFERENCES public.guest_sessions (id)
  ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS file_assets_guest_session_id_idx
  ON public.file_assets (guest_session_id)
  WHERE guest_session_id IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS file_assets_expires_at_idx
  ON public.file_assets (expires_at)
  WHERE expires_at IS NOT NULL AND deleted_at IS NULL;

-- Link audits.primary_asset_id → file_assets now that both sides exist.
ALTER TABLE public.audits
  DROP CONSTRAINT IF EXISTS audits_primary_asset_id_fkey;

ALTER TABLE public.audits
  ADD CONSTRAINT audits_primary_asset_id_fkey
  FOREIGN KEY (primary_asset_id)
  REFERENCES public.file_assets (id)
  ON DELETE SET NULL;

COMMENT ON COLUMN public.file_assets.guest_session_id IS
  'Guest-owned upload; pair with expires_at for TTL cleanup.';
COMMENT ON COLUMN public.file_assets.expires_at IS
  'Guest assets should expire (~7 days); cleanup job removes Storage + row.';
