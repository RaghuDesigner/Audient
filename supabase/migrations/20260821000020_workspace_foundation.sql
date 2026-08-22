-- =============================================================================
-- BACKEND-009A — Workspace foundation
-- Migration: 20260821000020_workspace_foundation.sql
--
-- Adds workspaces + workspace_members, personal backfill, audits.workspace_id,
-- and extends audit RLS for member read / role-gated mutate.
-- Does NOT change payments, credits, or notifications RLS/schema.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) Enums
-- -----------------------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE public.workspace_member_role AS ENUM (
    'OWNER',
    'ADMIN',
    'DESIGNER',
    'ANALYST',
    'VIEWER'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.workspace_member_status AS ENUM (
    'ACTIVE',
    'INVITED',
    'SUSPENDED'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

COMMENT ON TYPE public.workspace_member_role IS
  'Workspace seat role. Distinct from platform users.role (USER|ADMIN).';

COMMENT ON TYPE public.workspace_member_status IS
  'Workspace membership lifecycle status.';

-- -----------------------------------------------------------------------------
-- 2) workspaces
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.workspaces (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  owner_id    UUID NOT NULL,
  is_personal BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  deleted_at  TIMESTAMPTZ,

  CONSTRAINT workspaces_name_not_blank
    CHECK (length(trim(name)) > 0),
  CONSTRAINT workspaces_owner_id_fkey
    FOREIGN KEY (owner_id)
    REFERENCES public.users (id)
    ON DELETE CASCADE
);

COMMENT ON TABLE public.workspaces IS
  'Business/personal workspaces. owner_id is authoritative billing/workspace owner.';

CREATE UNIQUE INDEX IF NOT EXISTS workspaces_one_personal_per_owner_uidx
  ON public.workspaces (owner_id)
  WHERE is_personal = TRUE AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS workspaces_owner_id_idx
  ON public.workspaces (owner_id)
  WHERE deleted_at IS NULL;

-- -----------------------------------------------------------------------------
-- 3) workspace_members
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.workspace_members (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID NOT NULL,
  user_id       UUID NOT NULL,
  role          public.workspace_member_role NOT NULL,
  status        public.workspace_member_status NOT NULL DEFAULT 'ACTIVE',
  joined_at     TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  deleted_at    TIMESTAMPTZ,

  CONSTRAINT workspace_members_workspace_id_fkey
    FOREIGN KEY (workspace_id)
    REFERENCES public.workspaces (id)
    ON DELETE CASCADE,
  CONSTRAINT workspace_members_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES public.users (id)
    ON DELETE CASCADE
);

COMMENT ON TABLE public.workspace_members IS
  'Workspace seats. UNIQUE active membership per (workspace, user).';

CREATE UNIQUE INDEX IF NOT EXISTS workspace_members_workspace_user_active_uidx
  ON public.workspace_members (workspace_id, user_id)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS workspace_members_user_id_idx
  ON public.workspace_members (user_id)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS workspace_members_workspace_id_idx
  ON public.workspace_members (workspace_id)
  WHERE deleted_at IS NULL;

-- -----------------------------------------------------------------------------
-- 4) Idempotent personal workspace provisioner
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.ensure_personal_workspace(p_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_workspace_id UUID;
  v_name TEXT;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'ensure_personal_workspace: p_user_id required';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = p_user_id AND u.deleted_at IS NULL
  ) THEN
    RAISE EXCEPTION 'ensure_personal_workspace: user % not found', p_user_id;
  END IF;

  SELECT w.id INTO v_workspace_id
  FROM public.workspaces w
  WHERE w.owner_id = p_user_id
    AND w.is_personal = TRUE
    AND w.deleted_at IS NULL
  LIMIT 1;

  IF v_workspace_id IS NULL THEN
    SELECT COALESCE(NULLIF(trim(u.name), ''), split_part(u.email, '@', 1), 'Personal')
    INTO v_name
    FROM public.users u
    WHERE u.id = p_user_id;

    INSERT INTO public.workspaces (name, owner_id, is_personal)
    VALUES (v_name || '''s workspace', p_user_id, TRUE)
    RETURNING id INTO v_workspace_id;
  END IF;

  INSERT INTO public.workspace_members (workspace_id, user_id, role, status)
  SELECT v_workspace_id, p_user_id, 'OWNER', 'ACTIVE'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.workspace_members m
    WHERE m.workspace_id = v_workspace_id
      AND m.user_id = p_user_id
      AND m.deleted_at IS NULL
  );

  UPDATE public.workspace_members m
  SET
    role = 'OWNER',
    status = 'ACTIVE',
    updated_at = timezone('utc', now())
  WHERE m.workspace_id = v_workspace_id
    AND m.user_id = p_user_id
    AND m.deleted_at IS NULL
    AND (m.role IS DISTINCT FROM 'OWNER' OR m.status IS DISTINCT FROM 'ACTIVE');

  RETURN v_workspace_id;
END;
$$;

COMMENT ON FUNCTION public.ensure_personal_workspace(UUID) IS
  'Idempotent personal workspace + OWNER membership for a user.';

REVOKE ALL ON FUNCTION public.ensure_personal_workspace(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ensure_personal_workspace(UUID) TO service_role;
-- Trigger runs as SECURITY DEFINER owner; clients must not provision arbitrary users.

-- Trigger: new public.users rows get a personal workspace
CREATE OR REPLACE FUNCTION public.trg_users_ensure_personal_workspace()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.ensure_personal_workspace(NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS users_ensure_personal_workspace ON public.users;
CREATE TRIGGER users_ensure_personal_workspace
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_users_ensure_personal_workspace();

-- -----------------------------------------------------------------------------
-- 5) Backfill personal workspaces for existing users
-- -----------------------------------------------------------------------------

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT u.id
    FROM public.users u
    WHERE u.deleted_at IS NULL
  LOOP
    PERFORM public.ensure_personal_workspace(r.id);
  END LOOP;
END $$;

-- -----------------------------------------------------------------------------
-- 6) audits.workspace_id — nullable → backfill → NOT NULL
-- -----------------------------------------------------------------------------

ALTER TABLE public.audits
  ADD COLUMN IF NOT EXISTS workspace_id UUID;

-- Map user-owned audits to that user's personal workspace
UPDATE public.audits a
SET workspace_id = w.id,
    updated_at = timezone('utc', now())
FROM public.workspaces w
WHERE a.workspace_id IS NULL
  AND a.user_id IS NOT NULL
  AND w.owner_id = a.user_id
  AND w.is_personal = TRUE
  AND w.deleted_at IS NULL;

-- Fail loudly if any user-owned audit remains unmapped
DO $$
DECLARE
  v_unmapped INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_unmapped
  FROM public.audits a
  WHERE a.workspace_id IS NULL
    AND a.user_id IS NOT NULL
    AND a.deleted_at IS NULL;

  IF v_unmapped > 0 THEN
    RAISE EXCEPTION
      'BACKEND-009A: % user-owned audit(s) could not be mapped to a personal workspace — aborting',
      v_unmapped;
  END IF;
END $$;

-- Guest audits (no user_id) must not get an arbitrary workspace.
-- Enforce: user-owned audits require workspace_id; guest rows may remain null.
DO $$
DECLARE
  v_guest_unmapped INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_guest_unmapped
  FROM public.audits a
  WHERE a.workspace_id IS NULL
    AND a.user_id IS NULL
    AND a.deleted_at IS NULL;

  -- Guest audits are allowed to lack workspace_id (server/service_role only).
  -- User-owned audits are already verified above.
  RAISE NOTICE 'BACKEND-009A: % guest audit(s) without workspace_id (allowed)', v_guest_unmapped;
END $$;

ALTER TABLE public.audits
  DROP CONSTRAINT IF EXISTS audits_workspace_required_for_user_owned;

ALTER TABLE public.audits
  ADD CONSTRAINT audits_workspace_required_for_user_owned
  CHECK (
    user_id IS NULL
    OR workspace_id IS NOT NULL
  );

DO $$ BEGIN
  ALTER TABLE public.audits
    ADD CONSTRAINT audits_workspace_id_fkey
    FOREIGN KEY (workspace_id)
    REFERENCES public.workspaces (id)
    ON DELETE RESTRICT;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS audits_workspace_id_idx
  ON public.audits (workspace_id)
  WHERE deleted_at IS NULL;

COMMENT ON COLUMN public.audits.workspace_id IS
  'Workspace scope for member access. Required when user_id is set.';

-- -----------------------------------------------------------------------------
-- 7) RLS helpers
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_active_workspace_member(p_workspace_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspace_members m
    WHERE m.workspace_id = p_workspace_id
      AND m.user_id = public.current_user_id()
      AND m.status = 'ACTIVE'
      AND m.deleted_at IS NULL
  );
$$;

CREATE OR REPLACE FUNCTION public.workspace_member_role(p_workspace_id UUID)
RETURNS public.workspace_member_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT m.role
  FROM public.workspace_members m
  WHERE m.workspace_id = p_workspace_id
    AND m.user_id = public.current_user_id()
    AND m.status = 'ACTIVE'
    AND m.deleted_at IS NULL
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.has_workspace_role(
  p_workspace_id UUID,
  VARIADIC p_roles public.workspace_member_role[]
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspace_members m
    WHERE m.workspace_id = p_workspace_id
      AND m.user_id = public.current_user_id()
      AND m.status = 'ACTIVE'
      AND m.deleted_at IS NULL
      AND m.role = ANY (p_roles)
  );
$$;

-- Extend owns_audit: creator OR active workspace member (for report access)
CREATE OR REPLACE FUNCTION public.owns_audit(p_audit_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.audits AS a
    WHERE a.id = p_audit_id
      AND a.deleted_at IS NULL
      AND (
        a.user_id = public.current_user_id()
        OR (
          a.workspace_id IS NOT NULL
          AND public.is_active_workspace_member(a.workspace_id)
        )
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.can_mutate_workspace_audit(p_audit_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.audits AS a
    WHERE a.id = p_audit_id
      AND a.deleted_at IS NULL
      AND a.guest_session_id IS NULL
      AND (
        a.user_id = public.current_user_id()
        OR (
          a.workspace_id IS NOT NULL
          AND public.has_workspace_role(
            a.workspace_id,
            VARIADIC ARRAY['OWNER', 'ADMIN']::public.workspace_member_role[]
          )
        )
      )
  );
$$;

REVOKE ALL ON FUNCTION public.is_active_workspace_member(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.workspace_member_role(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_workspace_role(UUID, VARIADIC public.workspace_member_role[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.can_mutate_workspace_audit(UUID) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.is_active_workspace_member(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.workspace_member_role(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_workspace_role(UUID, VARIADIC public.workspace_member_role[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_mutate_workspace_audit(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.owns_audit(UUID) TO authenticated;

-- -----------------------------------------------------------------------------
-- 8) RLS — workspaces / workspace_members
-- -----------------------------------------------------------------------------

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces FORCE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS workspaces_select_member ON public.workspaces;
DROP POLICY IF EXISTS workspaces_insert_none ON public.workspaces;
DROP POLICY IF EXISTS workspaces_update_owner ON public.workspaces;
DROP POLICY IF EXISTS workspaces_delete_owner ON public.workspaces;

CREATE POLICY workspaces_select_member
  ON public.workspaces
  FOR SELECT
  TO authenticated
  USING (
    deleted_at IS NULL
    AND public.is_active_workspace_member(id)
  );

-- Clients cannot create workspaces (provision via ensure_personal_workspace / service_role)
CREATE POLICY workspaces_insert_none
  ON public.workspaces
  FOR INSERT
  TO authenticated
  WITH CHECK (FALSE);

-- Owner may rename; cannot transfer ownership via client
CREATE POLICY workspaces_update_owner
  ON public.workspaces
  FOR UPDATE
  TO authenticated
  USING (
    deleted_at IS NULL
    AND owner_id = public.current_user_id()
  )
  WITH CHECK (
    deleted_at IS NULL
    AND owner_id = public.current_user_id()
  );

CREATE POLICY workspaces_delete_owner
  ON public.workspaces
  FOR DELETE
  TO authenticated
  USING (
    owner_id = public.current_user_id()
    AND is_personal = FALSE
  );

DROP POLICY IF EXISTS workspace_members_select_member ON public.workspace_members;
DROP POLICY IF EXISTS workspace_members_insert_admin ON public.workspace_members;
DROP POLICY IF EXISTS workspace_members_update_admin ON public.workspace_members;
DROP POLICY IF EXISTS workspace_members_delete_admin ON public.workspace_members;

CREATE POLICY workspace_members_select_member
  ON public.workspace_members
  FOR SELECT
  TO authenticated
  USING (
    deleted_at IS NULL
    AND public.is_active_workspace_member(workspace_id)
  );

-- OWNER/ADMIN may add members; never insert OWNER role (prevents self/other owner grant)
CREATE POLICY workspace_members_insert_admin
  ON public.workspace_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_workspace_role(
      workspace_id,
      VARIADIC ARRAY['OWNER', 'ADMIN']::public.workspace_member_role[]
    )
    AND role <> 'OWNER'
    AND user_id <> public.current_user_id()
  );

-- OWNER/ADMIN may update members; cannot set role=OWNER; cannot escalate self
CREATE POLICY workspace_members_update_admin
  ON public.workspace_members
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
    AND user_id <> public.current_user_id()
    AND public.has_workspace_role(
      workspace_id,
      VARIADIC ARRAY['OWNER', 'ADMIN']::public.workspace_member_role[]
    )
  );

-- OWNER/ADMIN may remove non-owner members; cannot delete own membership via this path
CREATE POLICY workspace_members_delete_admin
  ON public.workspace_members
  FOR DELETE
  TO authenticated
  USING (
    role <> 'OWNER'
    AND user_id <> public.current_user_id()
    AND public.has_workspace_role(
      workspace_id,
      VARIADIC ARRAY['OWNER', 'ADMIN']::public.workspace_member_role[]
    )
  );

-- -----------------------------------------------------------------------------
-- 9) Audit RLS — member read; role-gated mutate
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS audits_select_own ON public.audits;
DROP POLICY IF EXISTS audits_insert_own ON public.audits;
DROP POLICY IF EXISTS audits_update_own ON public.audits;
DROP POLICY IF EXISTS audits_delete_own ON public.audits;

CREATE POLICY audits_select_own
  ON public.audits
  FOR SELECT
  TO authenticated
  USING (
    guest_session_id IS NULL
    AND deleted_at IS NULL
    AND (
      user_id = public.current_user_id()
      OR (
        workspace_id IS NOT NULL
        AND public.is_active_workspace_member(workspace_id)
      )
    )
  );

CREATE POLICY audits_insert_own
  ON public.audits
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = public.current_user_id()
    AND guest_session_id IS NULL
    AND workspace_id IS NOT NULL
    AND public.has_workspace_role(
      workspace_id,
      VARIADIC ARRAY['OWNER', 'ADMIN', 'DESIGNER', 'ANALYST']::public.workspace_member_role[]
    )
  );

CREATE POLICY audits_update_own
  ON public.audits
  FOR UPDATE
  TO authenticated
  USING (public.can_mutate_workspace_audit(id))
  WITH CHECK (
    guest_session_id IS NULL
    AND (
      user_id = public.current_user_id()
      OR public.has_workspace_role(
        workspace_id,
        VARIADIC ARRAY['OWNER', 'ADMIN']::public.workspace_member_role[]
      )
    )
  );

CREATE POLICY audits_delete_own
  ON public.audits
  FOR DELETE
  TO authenticated
  USING (public.can_mutate_workspace_audit(id));

-- -----------------------------------------------------------------------------
-- 10) updated_at triggers
-- -----------------------------------------------------------------------------

DROP TRIGGER IF EXISTS workspaces_set_updated_at ON public.workspaces;
CREATE TRIGGER workspaces_set_updated_at
  BEFORE UPDATE ON public.workspaces
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS workspace_members_set_updated_at ON public.workspace_members;
CREATE TRIGGER workspace_members_set_updated_at
  BEFORE UPDATE ON public.workspace_members
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
