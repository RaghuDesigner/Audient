-- =============================================================================
-- BACKEND-009B — Harden workspace_members (+ invitations) RLS
-- Migration: 20260821100040_workspace_member_rls_harden.sql
--
-- Align JWT RLS with server permissions:
--   OWNER may manage ADMIN/DESIGNER/ANALYST/VIEWER
--   ADMIN may manage DESIGNER/ANALYST/VIEWER only (not ADMIN/OWNER)
-- Prevent demoting/removing OWNER seats via client UPDATE/DELETE.
-- Does not touch payments / credits / notifications / audits.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- workspace_members
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS workspace_members_insert_admin ON public.workspace_members;
DROP POLICY IF EXISTS workspace_members_update_admin ON public.workspace_members;
DROP POLICY IF EXISTS workspace_members_delete_admin ON public.workspace_members;

CREATE POLICY workspace_members_insert_admin
  ON public.workspace_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id <> public.current_user_id()
    AND role <> 'OWNER'
    AND (
      (
        public.has_workspace_role(
          workspace_id,
          VARIADIC ARRAY['OWNER']::public.workspace_member_role[]
        )
        AND role = ANY (
          ARRAY['ADMIN', 'DESIGNER', 'ANALYST', 'VIEWER']::public.workspace_member_role[]
        )
      )
      OR (
        public.has_workspace_role(
          workspace_id,
          VARIADIC ARRAY['ADMIN']::public.workspace_member_role[]
        )
        AND role = ANY (
          ARRAY['DESIGNER', 'ANALYST', 'VIEWER']::public.workspace_member_role[]
        )
      )
    )
  );

CREATE POLICY workspace_members_update_admin
  ON public.workspace_members
  FOR UPDATE
  TO authenticated
  USING (
    deleted_at IS NULL
    AND role <> 'OWNER'
    AND user_id <> public.current_user_id()
    AND (
      public.has_workspace_role(
        workspace_id,
        VARIADIC ARRAY['OWNER']::public.workspace_member_role[]
      )
      OR (
        public.has_workspace_role(
          workspace_id,
          VARIADIC ARRAY['ADMIN']::public.workspace_member_role[]
        )
        AND role = ANY (
          ARRAY['DESIGNER', 'ANALYST', 'VIEWER']::public.workspace_member_role[]
        )
      )
    )
  )
  WITH CHECK (
    deleted_at IS NULL
    AND role <> 'OWNER'
    AND user_id <> public.current_user_id()
    AND (
      (
        public.has_workspace_role(
          workspace_id,
          VARIADIC ARRAY['OWNER']::public.workspace_member_role[]
        )
        AND role = ANY (
          ARRAY['ADMIN', 'DESIGNER', 'ANALYST', 'VIEWER']::public.workspace_member_role[]
        )
      )
      OR (
        public.has_workspace_role(
          workspace_id,
          VARIADIC ARRAY['ADMIN']::public.workspace_member_role[]
        )
        AND role = ANY (
          ARRAY['DESIGNER', 'ANALYST', 'VIEWER']::public.workspace_member_role[]
        )
      )
    )
  );

CREATE POLICY workspace_members_delete_admin
  ON public.workspace_members
  FOR DELETE
  TO authenticated
  USING (
    role <> 'OWNER'
    AND user_id <> public.current_user_id()
    AND (
      public.has_workspace_role(
        workspace_id,
        VARIADIC ARRAY['OWNER']::public.workspace_member_role[]
      )
      OR (
        public.has_workspace_role(
          workspace_id,
          VARIADIC ARRAY['ADMIN']::public.workspace_member_role[]
        )
        AND role = ANY (
          ARRAY['DESIGNER', 'ANALYST', 'VIEWER']::public.workspace_member_role[]
        )
      )
    )
  );

-- -----------------------------------------------------------------------------
-- workspace_invitations (no-op if table not yet created — guarded)
-- -----------------------------------------------------------------------------

DO $$
BEGIN
  IF to_regclass('public.workspace_invitations') IS NULL THEN
    RAISE NOTICE 'BACKEND-009B: workspace_invitations missing — skip invite RLS harden';
    RETURN;
  END IF;

  DROP POLICY IF EXISTS workspace_invitations_insert_admin ON public.workspace_invitations;
  DROP POLICY IF EXISTS workspace_invitations_update_admin ON public.workspace_invitations;

  EXECUTE $policy$
    CREATE POLICY workspace_invitations_insert_admin
      ON public.workspace_invitations
      FOR INSERT
      TO authenticated
      WITH CHECK (
        inviter_id = public.current_user_id()
        AND role <> 'OWNER'
        AND (
          (
            public.has_workspace_role(
              workspace_id,
              VARIADIC ARRAY['OWNER']::public.workspace_member_role[]
            )
            AND role = ANY (
              ARRAY['ADMIN', 'DESIGNER', 'ANALYST', 'VIEWER']::public.workspace_member_role[]
            )
          )
          OR (
            public.has_workspace_role(
              workspace_id,
              VARIADIC ARRAY['ADMIN']::public.workspace_member_role[]
            )
            AND role = ANY (
              ARRAY['DESIGNER', 'ANALYST', 'VIEWER']::public.workspace_member_role[]
            )
          )
        )
      )
  $policy$;

  EXECUTE $policy$
    CREATE POLICY workspace_invitations_update_admin
      ON public.workspace_invitations
      FOR UPDATE
      TO authenticated
      USING (
        deleted_at IS NULL
        AND (
          public.has_workspace_role(
            workspace_id,
            VARIADIC ARRAY['OWNER']::public.workspace_member_role[]
          )
          OR public.has_workspace_role(
            workspace_id,
            VARIADIC ARRAY['ADMIN']::public.workspace_member_role[]
          )
        )
      )
      WITH CHECK (
        deleted_at IS NULL
        AND role <> 'OWNER'
        AND (
          (
            public.has_workspace_role(
              workspace_id,
              VARIADIC ARRAY['OWNER']::public.workspace_member_role[]
            )
            AND role = ANY (
              ARRAY['ADMIN', 'DESIGNER', 'ANALYST', 'VIEWER']::public.workspace_member_role[]
            )
          )
          OR (
            public.has_workspace_role(
              workspace_id,
              VARIADIC ARRAY['ADMIN']::public.workspace_member_role[]
            )
            AND role = ANY (
              ARRAY['DESIGNER', 'ANALYST', 'VIEWER']::public.workspace_member_role[]
            )
          )
        )
      )
  $policy$;
END $$;
