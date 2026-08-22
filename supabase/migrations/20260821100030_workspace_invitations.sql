-- =============================================================================
-- BACKEND-009B — Workspace invitations (minimal safe flow)
-- Migration: 20260821100030_workspace_invitations.sql
--
-- Adds invitation table + accept RPC. Does not weaken 009A RLS.
-- Does not touch payments / credits / notifications.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

DO $$ BEGIN
  CREATE TYPE public.workspace_invitation_status AS ENUM (
    'PENDING',
    'ACCEPTED',
    'REVOKED',
    'EXPIRED'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

COMMENT ON TYPE public.workspace_invitation_status IS
  'Lifecycle for workspace seat invitations.';

CREATE TABLE IF NOT EXISTS public.workspace_invitations (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id     UUID NOT NULL,
  inviter_id       UUID NOT NULL,
  invitee_email    TEXT NOT NULL,
  invitee_user_id  UUID,
  role             public.workspace_member_role NOT NULL,
  status           public.workspace_invitation_status NOT NULL DEFAULT 'PENDING',
  token_hash       TEXT NOT NULL,
  expires_at       TIMESTAMPTZ NOT NULL,
  accepted_at      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  deleted_at       TIMESTAMPTZ,

  CONSTRAINT workspace_invitations_workspace_id_fkey
    FOREIGN KEY (workspace_id)
    REFERENCES public.workspaces (id)
    ON DELETE CASCADE,
  CONSTRAINT workspace_invitations_inviter_id_fkey
    FOREIGN KEY (inviter_id)
    REFERENCES public.users (id)
    ON DELETE CASCADE,
  CONSTRAINT workspace_invitations_invitee_user_id_fkey
    FOREIGN KEY (invitee_user_id)
    REFERENCES public.users (id)
    ON DELETE SET NULL,
  CONSTRAINT workspace_invitations_role_not_owner
    CHECK (role <> 'OWNER'),
  CONSTRAINT workspace_invitations_email_not_blank
    CHECK (length(trim(invitee_email)) > 0),
  CONSTRAINT workspace_invitations_token_hash_not_blank
    CHECK (length(trim(token_hash)) > 0)
);

COMMENT ON TABLE public.workspace_invitations IS
  'Workspace seat invitations. token_hash only — raw tokens never stored.';

CREATE UNIQUE INDEX IF NOT EXISTS workspace_invitations_pending_email_uidx
  ON public.workspace_invitations (workspace_id, lower(invitee_email))
  WHERE status = 'PENDING' AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS workspace_invitations_workspace_id_idx
  ON public.workspace_invitations (workspace_id)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS workspace_invitations_invitee_email_idx
  ON public.workspace_invitations (lower(invitee_email))
  WHERE deleted_at IS NULL AND status = 'PENDING';

-- -----------------------------------------------------------------------------
-- Accept invitation (transactional). JWT user email + token hash required.
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.accept_workspace_invitation(
  p_invitation_id UUID,
  p_token TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_user_id UUID;
  v_email TEXT;
  v_inv public.workspace_invitations%ROWTYPE;
  v_member_id UUID;
  v_hash TEXT;
BEGIN
  v_user_id := public.current_user_id();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'accept_workspace_invitation: not authenticated'
      USING ERRCODE = '42501';
  END IF;

  SELECT lower(trim(u.email)) INTO v_email
  FROM public.users u
  WHERE u.id = v_user_id AND u.deleted_at IS NULL;

  IF v_email IS NULL OR length(v_email) = 0 THEN
    RAISE EXCEPTION 'accept_workspace_invitation: user email missing'
      USING ERRCODE = '42501';
  END IF;

  IF p_token IS NULL OR length(trim(p_token)) = 0 THEN
    RAISE EXCEPTION 'accept_workspace_invitation: token required'
      USING ERRCODE = '22023';
  END IF;

  v_hash := encode(digest(trim(p_token), 'sha256'), 'hex');

  SELECT * INTO v_inv
  FROM public.workspace_invitations i
  WHERE i.id = p_invitation_id
    AND i.deleted_at IS NULL
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'accept_workspace_invitation: not found'
      USING ERRCODE = 'P0002';
  END IF;

  -- Idempotent duplicate acceptance
  IF v_inv.status = 'ACCEPTED'
     AND v_inv.invitee_user_id = v_user_id THEN
    SELECT m.id INTO v_member_id
    FROM public.workspace_members m
    WHERE m.workspace_id = v_inv.workspace_id
      AND m.user_id = v_user_id
      AND m.deleted_at IS NULL
    LIMIT 1;
    IF v_member_id IS NOT NULL THEN
      RETURN v_member_id;
    END IF;
  END IF;

  IF v_inv.status <> 'PENDING' THEN
    RAISE EXCEPTION 'accept_workspace_invitation: not pending'
      USING ERRCODE = '22023';
  END IF;

  IF v_inv.expires_at <= timezone('utc', now()) THEN
    UPDATE public.workspace_invitations
    SET status = 'EXPIRED', updated_at = timezone('utc', now())
    WHERE id = v_inv.id;
    RAISE EXCEPTION 'accept_workspace_invitation: expired'
      USING ERRCODE = '22023';
  END IF;

  IF v_inv.token_hash <> v_hash THEN
    RAISE EXCEPTION 'accept_workspace_invitation: invalid token'
      USING ERRCODE = '42501';
  END IF;

  IF lower(trim(v_inv.invitee_email)) <> v_email THEN
    RAISE EXCEPTION 'accept_workspace_invitation: email mismatch'
      USING ERRCODE = '42501';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.workspaces w
    WHERE w.id = v_inv.workspace_id AND w.deleted_at IS NULL
  ) THEN
    RAISE EXCEPTION 'accept_workspace_invitation: workspace missing'
      USING ERRCODE = 'P0002';
  END IF;

  IF v_inv.role = 'OWNER' THEN
    RAISE EXCEPTION 'accept_workspace_invitation: owner role forbidden'
      USING ERRCODE = '22023';
  END IF;

  SELECT m.id INTO v_member_id
  FROM public.workspace_members m
  WHERE m.workspace_id = v_inv.workspace_id
    AND m.user_id = v_user_id
    AND m.deleted_at IS NULL
  LIMIT 1;

  IF v_member_id IS NOT NULL THEN
    UPDATE public.workspace_invitations
    SET
      status = 'ACCEPTED',
      invitee_user_id = v_user_id,
      accepted_at = COALESCE(accepted_at, timezone('utc', now())),
      updated_at = timezone('utc', now())
    WHERE id = v_inv.id;
    RETURN v_member_id;
  END IF;

  INSERT INTO public.workspace_members (
    workspace_id, user_id, role, status
  ) VALUES (
    v_inv.workspace_id, v_user_id, v_inv.role, 'ACTIVE'
  )
  RETURNING id INTO v_member_id;

  UPDATE public.workspace_invitations
  SET
    status = 'ACCEPTED',
    invitee_user_id = v_user_id,
    accepted_at = timezone('utc', now()),
    updated_at = timezone('utc', now())
  WHERE id = v_inv.id;

  RETURN v_member_id;
END;
$$;

COMMENT ON FUNCTION public.accept_workspace_invitation(UUID, TEXT) IS
  'Transactional invite acceptance. Verifies JWT user email + token hash.';

REVOKE ALL ON FUNCTION public.accept_workspace_invitation(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.accept_workspace_invitation(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_workspace_invitation(UUID, TEXT) TO service_role;

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------

ALTER TABLE public.workspace_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_invitations FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS workspace_invitations_select_member ON public.workspace_invitations;
DROP POLICY IF EXISTS workspace_invitations_insert_admin ON public.workspace_invitations;
DROP POLICY IF EXISTS workspace_invitations_update_admin ON public.workspace_invitations;
DROP POLICY IF EXISTS workspace_invitations_delete_none ON public.workspace_invitations;

CREATE POLICY workspace_invitations_select_member
  ON public.workspace_invitations
  FOR SELECT
  TO authenticated
  USING (
    deleted_at IS NULL
    AND (
      public.is_active_workspace_member(workspace_id)
      OR lower(invitee_email) = (
        SELECT lower(u.email) FROM public.users u
        WHERE u.id = public.current_user_id() AND u.deleted_at IS NULL
      )
    )
  );

CREATE POLICY workspace_invitations_insert_admin
  ON public.workspace_invitations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_workspace_role(
      workspace_id,
      VARIADIC ARRAY['OWNER', 'ADMIN']::public.workspace_member_role[]
    )
    AND role <> 'OWNER'
    AND inviter_id = public.current_user_id()
  );

CREATE POLICY workspace_invitations_update_admin
  ON public.workspace_invitations
  FOR UPDATE
  TO authenticated
  USING (
    deleted_at IS NULL
    AND public.has_workspace_role(
      workspace_id,
      VARIADIC ARRAY['OWNER', 'ADMIN']::public.workspace_member_role[]
    )
  )
  WITH CHECK (
    deleted_at IS NULL
    AND role <> 'OWNER'
  );

CREATE POLICY workspace_invitations_delete_none
  ON public.workspace_invitations
  FOR DELETE
  TO authenticated
  USING (FALSE);

DROP TRIGGER IF EXISTS workspace_invitations_set_updated_at ON public.workspace_invitations;
CREATE TRIGGER workspace_invitations_set_updated_at
  BEFORE UPDATE ON public.workspace_invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
