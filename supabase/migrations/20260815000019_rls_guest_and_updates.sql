-- =============================================================================
-- BACKEND-002 APPLY — RLS for guest_sessions + owner checks on audits/assets
-- Migration: 20260815000019_rls_guest_and_updates.sql
--
-- Purpose: Deny client JWT access to guest_sessions; authenticated users may
-- only touch user-owned audits/assets (guest_session_id IS NULL).
-- Guest rows are server/service_role only.
-- =============================================================================

ALTER TABLE public.guest_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_sessions FORCE ROW LEVEL SECURITY;

-- Deny all direct client access to guest sessions
DROP POLICY IF EXISTS guest_sessions_select_none ON public.guest_sessions;
DROP POLICY IF EXISTS guest_sessions_insert_none ON public.guest_sessions;
DROP POLICY IF EXISTS guest_sessions_update_none ON public.guest_sessions;
DROP POLICY IF EXISTS guest_sessions_delete_none ON public.guest_sessions;

CREATE POLICY guest_sessions_select_none
  ON public.guest_sessions
  FOR SELECT
  TO anon, authenticated
  USING (FALSE);

CREATE POLICY guest_sessions_insert_none
  ON public.guest_sessions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (FALSE);

CREATE POLICY guest_sessions_update_none
  ON public.guest_sessions
  FOR UPDATE
  TO anon, authenticated
  USING (FALSE)
  WITH CHECK (FALSE);

CREATE POLICY guest_sessions_delete_none
  ON public.guest_sessions
  FOR DELETE
  TO anon, authenticated
  USING (FALSE);

-- Authenticated users may only touch audits they own (user_id); never guest rows
DROP POLICY IF EXISTS audits_select_own ON public.audits;
DROP POLICY IF EXISTS audits_insert_own ON public.audits;
DROP POLICY IF EXISTS audits_update_own ON public.audits;
DROP POLICY IF EXISTS audits_delete_own ON public.audits;

CREATE POLICY audits_select_own
  ON public.audits
  FOR SELECT
  TO authenticated
  USING (
    user_id = public.current_user_id()
    AND guest_session_id IS NULL
    AND deleted_at IS NULL
  );

CREATE POLICY audits_insert_own
  ON public.audits
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = public.current_user_id()
    AND guest_session_id IS NULL
  );

CREATE POLICY audits_update_own
  ON public.audits
  FOR UPDATE
  TO authenticated
  USING (
    user_id = public.current_user_id()
    AND guest_session_id IS NULL
    AND deleted_at IS NULL
  )
  WITH CHECK (
    user_id = public.current_user_id()
    AND guest_session_id IS NULL
  );

CREATE POLICY audits_delete_own
  ON public.audits
  FOR DELETE
  TO authenticated
  USING (
    user_id = public.current_user_id()
    AND guest_session_id IS NULL
  );

-- File assets: same pattern
DROP POLICY IF EXISTS file_assets_select_own ON public.file_assets;
DROP POLICY IF EXISTS file_assets_insert_own ON public.file_assets;
DROP POLICY IF EXISTS file_assets_update_own ON public.file_assets;
DROP POLICY IF EXISTS file_assets_delete_own ON public.file_assets;

CREATE POLICY file_assets_select_own
  ON public.file_assets
  FOR SELECT
  TO authenticated
  USING (
    user_id = public.current_user_id()
    AND guest_session_id IS NULL
    AND deleted_at IS NULL
  );

CREATE POLICY file_assets_insert_own
  ON public.file_assets
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = public.current_user_id()
    AND guest_session_id IS NULL
  );

CREATE POLICY file_assets_update_own
  ON public.file_assets
  FOR UPDATE
  TO authenticated
  USING (
    user_id = public.current_user_id()
    AND guest_session_id IS NULL
    AND deleted_at IS NULL
  )
  WITH CHECK (
    user_id = public.current_user_id()
    AND guest_session_id IS NULL
  );

CREATE POLICY file_assets_delete_own
  ON public.file_assets
  FOR DELETE
  TO authenticated
  USING (
    user_id = public.current_user_id()
    AND guest_session_id IS NULL
  );

COMMENT ON TABLE public.recommendations IS
  'UX findings for a report (product/API term: findings). Physical name retained for compatibility.';
