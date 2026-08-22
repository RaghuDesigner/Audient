-- =============================================================================
-- BACKEND-002 APPLY — Audits: guest ownership + AI worker fields
-- Migration: 20260815000012_audits_guest_and_worker.sql
--
-- Purpose: Guest XOR ownership + worker/failure/retry foundation on audits.
-- Additive columns only; preserves website_url, scores, progress, credits_cost,
-- competitor_urls, error_message, status, and input_type enums.
-- No jobs table (worker fields live on audits per BACKEND-002.1).
-- =============================================================================

-- Allow guest audits (user_id null until claim). Existing rows keep user_id.
ALTER TABLE public.audits
  ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.audits
  ADD COLUMN IF NOT EXISTS guest_session_id UUID,
  ADD COLUMN IF NOT EXISTS primary_asset_id UUID,
  ADD COLUMN IF NOT EXISTS failure_code TEXT,
  ADD COLUMN IF NOT EXISTS failed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS attempt_count INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS worker_id TEXT,
  ADD COLUMN IF NOT EXISTS correlation_id TEXT,
  ADD COLUMN IF NOT EXISTS retry_of_audit_id UUID;

-- Ownership XOR: authenticated XOR guest (existing user-owned rows satisfy this).
ALTER TABLE public.audits
  DROP CONSTRAINT IF EXISTS audits_owner_xor;

ALTER TABLE public.audits
  ADD CONSTRAINT audits_owner_xor
  CHECK (
    (user_id IS NOT NULL AND guest_session_id IS NULL)
    OR (user_id IS NULL AND guest_session_id IS NOT NULL)
  );

ALTER TABLE public.audits
  DROP CONSTRAINT IF EXISTS audits_attempt_count_positive;

ALTER TABLE public.audits
  ADD CONSTRAINT audits_attempt_count_positive
  CHECK (attempt_count >= 1);

-- Replace failed-has-error CHECK under a clearer name (same rule; preserves data).
ALTER TABLE public.audits
  DROP CONSTRAINT IF EXISTS audits_failed_has_error;

ALTER TABLE public.audits
  DROP CONSTRAINT IF EXISTS audits_failed_has_failure_info;

ALTER TABLE public.audits
  ADD CONSTRAINT audits_failed_has_failure_info
  CHECK (
    status <> 'FAILED'
    OR (
      error_message IS NOT NULL
      AND length(trim(error_message)) > 0
    )
  );

-- RESTRICT: deleting a guest_session must not NULL out ownership (would break XOR).
-- Cleanup job should delete/soft-delete dependent audits before the session.
ALTER TABLE public.audits
  DROP CONSTRAINT IF EXISTS audits_guest_session_id_fkey;

ALTER TABLE public.audits
  ADD CONSTRAINT audits_guest_session_id_fkey
  FOREIGN KEY (guest_session_id)
  REFERENCES public.guest_sessions (id)
  ON DELETE RESTRICT;

-- primary_asset_id FK deferred to 013 (file_assets must accept guest ownership first).

ALTER TABLE public.audits
  DROP CONSTRAINT IF EXISTS audits_retry_of_audit_id_fkey;

ALTER TABLE public.audits
  ADD CONSTRAINT audits_retry_of_audit_id_fkey
  FOREIGN KEY (retry_of_audit_id)
  REFERENCES public.audits (id)
  ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS audits_guest_session_id_idx
  ON public.audits (guest_session_id)
  WHERE guest_session_id IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS audits_status_claimed_at_idx
  ON public.audits (status, claimed_at)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS audits_correlation_id_idx
  ON public.audits (correlation_id)
  WHERE correlation_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS audits_failure_code_idx
  ON public.audits (failure_code)
  WHERE failure_code IS NOT NULL;

COMMENT ON COLUMN public.audits.guest_session_id IS
  'Set for unauthenticated guest audits; cleared/replaced by user_id on claim.';
COMMENT ON COLUMN public.audits.primary_asset_id IS
  'Optional FK to primary screenshot asset (FK added in 013).';
COMMENT ON COLUMN public.audits.failure_code IS
  'Typed failure taxonomy (e.g. SSRF_BLOCKED, INTERNAL_ERROR).';
COMMENT ON COLUMN public.audits.failed_at IS
  'Timestamp when audit reached FAILED.';
COMMENT ON COLUMN public.audits.attempt_count IS
  'Worker processing attempts for this audit row.';
COMMENT ON COLUMN public.audits.claimed_at IS
  'When a worker claimed this audit for PROCESSING.';
COMMENT ON COLUMN public.audits.worker_id IS
  'Worker instance identifier.';
COMMENT ON COLUMN public.audits.correlation_id IS
  'Request/trace correlation id for observability.';
COMMENT ON COLUMN public.audits.retry_of_audit_id IS
  'Optional link to a prior audit when product retry creates a new row.';
