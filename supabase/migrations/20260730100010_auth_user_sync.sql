-- =============================================================================
-- Audient — Sync auth.users → public.users (+ membership, credits, settings)
-- Migration: 20260730100010_auth_user_sync.sql
--
-- Supabase best practices:
--   • SECURITY DEFINER trigger functions with locked search_path
--   • AFTER INSERT on auth.users to provision app rows
--   • AFTER UPDATE to keep email / verification / profile fields in sync
--   • BEFORE DELETE to record intent + soft-delete markers before FK CASCADE
--   • ON CONFLICT to prevent duplicate 1:1 rows on retries / re-delivery
--   • service_role / definer bypasses RLS so provisioning works with RLS enabled
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Provision application records for a new Auth user
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id       UUID;
  v_plan_id       UUID;
  v_monthly_grant INTEGER := 200;
  v_is_unlimited  BOOLEAN := FALSE;
  v_email         TEXT;
  v_name          TEXT;
  v_avatar_url    TEXT;
  v_credits_id     UUID;
  v_wallet_rows    INTEGER := 0;
BEGIN
  -- Resolve email (Auth may omit email for some providers in edge cases).
  v_email := NULLIF(lower(trim(COALESCE(NEW.email, ''))), '');
  IF v_email IS NULL THEN
    v_email := lower(NEW.id::text || '@users.noreply.audient.app');
  END IF;

  v_name := NULLIF(
    trim(
      COALESCE(
        NEW.raw_user_meta_data ->> 'full_name',
        NEW.raw_user_meta_data ->> 'name',
        NEW.raw_user_meta_data ->> 'user_name',
        ''
      )
    ),
    ''
  );

  v_avatar_url := NULLIF(
    trim(
      COALESCE(
        NEW.raw_user_meta_data ->> 'avatar_url',
        NEW.raw_user_meta_data ->> 'picture',
        ''
      )
    ),
    ''
  );

  -- Free plan defaults from catalog when available.
  SELECT p.id, p.monthly_credits, p.is_unlimited
  INTO v_plan_id, v_monthly_grant, v_is_unlimited
  FROM public.plans AS p
  WHERE p.key = 'FREE'
    AND p.billing_interval = 'MONTHLY'
    AND p.is_active = TRUE
    AND p.deleted_at IS NULL
  ORDER BY p.created_at ASC
  LIMIT 1;

  IF v_monthly_grant IS NULL THEN
    v_monthly_grant := 200;
  END IF;

  IF v_is_unlimited IS NULL THEN
    v_is_unlimited := FALSE;
  END IF;

  -- 1) Profile (public.users)
  INSERT INTO public.users (
    auth_provider_id,
    email,
    name,
    avatar_url,
    role,
    email_verified,
    status,
    last_login_at
  )
  VALUES (
    NEW.id,
    v_email,
    v_name,
    v_avatar_url,
    'USER',
    (NEW.email_confirmed_at IS NOT NULL),
    'ACTIVE',
    now()
  )
  ON CONFLICT (auth_provider_id) DO UPDATE
    SET
      email = EXCLUDED.email,
      name = COALESCE(EXCLUDED.name, public.users.name),
      avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url),
      email_verified = EXCLUDED.email_verified,
      last_login_at = COALESCE(public.users.last_login_at, EXCLUDED.last_login_at),
      updated_at = now()
  RETURNING id INTO v_user_id;

  IF v_user_id IS NULL THEN
    SELECT u.id INTO v_user_id
    FROM public.users AS u
    WHERE u.auth_provider_id = NEW.id;
  END IF;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'handle_new_user: failed to resolve public.users row for auth user %', NEW.id;
  END IF;

  -- 2) Membership (Free)
  INSERT INTO public.memberships (
    user_id,
    tier,
    status,
    billing_interval,
    plan_id
  )
  VALUES (
    v_user_id,
    'FREE',
    'ACTIVE',
    'MONTHLY',
    v_plan_id
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- 3) Credit wallet
  INSERT INTO public.credits (
    user_id,
    plan_credits,
    purchased_credits,
    monthly_grant,
    is_unlimited,
    lifetime_used,
    last_reset_at,
    next_reset_at
  )
  VALUES (
    v_user_id,
    CASE WHEN v_is_unlimited THEN 0 ELSE v_monthly_grant END,
    0,
    CASE WHEN v_is_unlimited THEN 0 ELSE v_monthly_grant END,
    v_is_unlimited,
    0,
    now(),
    CASE WHEN v_is_unlimited THEN NULL ELSE (now() + INTERVAL '1 month') END
  )
  ON CONFLICT (user_id) DO NOTHING;

  GET DIAGNOSTICS v_wallet_rows = ROW_COUNT;

  SELECT c.id INTO v_credits_id
  FROM public.credits AS c
  WHERE c.user_id = v_user_id;

  -- Initial ledger entry only when this call created the wallet.
  IF v_wallet_rows > 0
     AND v_credits_id IS NOT NULL
     AND v_is_unlimited = FALSE
     AND v_monthly_grant > 0
     AND NOT EXISTS (
       SELECT 1
       FROM public.credit_transactions AS ct
       WHERE ct.credits_id = v_credits_id
         AND ct.type = 'MONTHLY_GRANT'
         AND ct.note = 'Initial Free grant on signup'
     )
  THEN
    INSERT INTO public.credit_transactions (
      credits_id,
      type,
      amount,
      balance_after,
      plan_after,
      purchased_after,
      note
    )
    VALUES (
      v_credits_id,
      'MONTHLY_GRANT',
      v_monthly_grant,
      v_monthly_grant,
      v_monthly_grant,
      0,
      'Initial Free grant on signup'
    );
  END IF;

  -- 4) Settings
  INSERT INTO public.settings (user_id)
  VALUES (v_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Never leave Auth in a half-provisioned silent state; surface the error.
    RAISE EXCEPTION 'handle_new_user failed for %: %', NEW.id, SQLERRM;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user() IS
  'Provision public.users, memberships, credits, and settings after auth.users INSERT.';

-- -----------------------------------------------------------------------------
-- Keep profile fields synchronized when Auth user changes
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_user_updated()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email TEXT;
  v_name TEXT;
  v_avatar_url TEXT;
BEGIN
  -- No-op when nothing relevant changed.
  IF OLD.email IS NOT DISTINCT FROM NEW.email
     AND OLD.email_confirmed_at IS NOT DISTINCT FROM NEW.email_confirmed_at
     AND OLD.raw_user_meta_data IS NOT DISTINCT FROM NEW.raw_user_meta_data
     AND OLD.last_sign_in_at IS NOT DISTINCT FROM NEW.last_sign_in_at
  THEN
    RETURN NEW;
  END IF;

  v_email := NULLIF(lower(trim(COALESCE(NEW.email, ''))), '');
  IF v_email IS NULL THEN
    v_email := lower(NEW.id::text || '@users.noreply.audient.app');
  END IF;

  v_name := NULLIF(
    trim(
      COALESCE(
        NEW.raw_user_meta_data ->> 'full_name',
        NEW.raw_user_meta_data ->> 'name',
        NEW.raw_user_meta_data ->> 'user_name',
        ''
      )
    ),
    ''
  );

  v_avatar_url := NULLIF(
    trim(
      COALESCE(
        NEW.raw_user_meta_data ->> 'avatar_url',
        NEW.raw_user_meta_data ->> 'picture',
        ''
      )
    ),
    ''
  );

  UPDATE public.users AS u
  SET
    email = v_email,
    name = COALESCE(v_name, u.name),
    avatar_url = COALESCE(v_avatar_url, u.avatar_url),
    email_verified = (NEW.email_confirmed_at IS NOT NULL),
    last_login_at = COALESCE(NEW.last_sign_in_at, u.last_login_at),
    updated_at = now()
  WHERE u.auth_provider_id = NEW.id
    AND u.deleted_at IS NULL;

  -- If profile is missing (manual Auth row / failed prior insert), provision now.
  IF NOT FOUND THEN
    PERFORM 1
    FROM public.users AS u
    WHERE u.auth_provider_id = NEW.id;

    IF NOT FOUND THEN
      -- Re-use insert path by synthesizing a call pattern: insert skeleton then update.
      INSERT INTO public.users (
        auth_provider_id,
        email,
        name,
        avatar_url,
        email_verified,
        status
      )
      VALUES (
        NEW.id,
        v_email,
        v_name,
        v_avatar_url,
        (NEW.email_confirmed_at IS NOT NULL),
        'ACTIVE'
      )
      ON CONFLICT (auth_provider_id) DO NOTHING;

      -- Ensure dependent 1:1 rows exist.
      INSERT INTO public.memberships (user_id, tier, status, billing_interval)
      SELECT u.id, 'FREE', 'ACTIVE', 'MONTHLY'
      FROM public.users AS u
      WHERE u.auth_provider_id = NEW.id
      ON CONFLICT (user_id) DO NOTHING;

      INSERT INTO public.credits (user_id, plan_credits, monthly_grant, next_reset_at)
      SELECT u.id, 200, 200, now() + INTERVAL '1 month'
      FROM public.users AS u
      WHERE u.auth_provider_id = NEW.id
      ON CONFLICT (user_id) DO NOTHING;

      INSERT INTO public.settings (user_id)
      SELECT u.id
      FROM public.users AS u
      WHERE u.auth_provider_id = NEW.id
      ON CONFLICT (user_id) DO NOTHING;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_user_updated() IS
  'Sync email, verification, and profile metadata from auth.users → public.users.';

-- -----------------------------------------------------------------------------
-- Safe deletion: mark app user deleted + audit, then allow FK CASCADE
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_user_deleted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT u.id INTO v_user_id
  FROM public.users AS u
  WHERE u.auth_provider_id = OLD.id;

  IF v_user_id IS NULL THEN
    RETURN OLD;
  END IF;

  -- Soft-delete markers (best-effort) before CASCADE hard-deletes the row tree.
  UPDATE public.users
  SET
    status = 'DELETED',
    deleted_at = COALESCE(deleted_at, now()),
    updated_at = now()
  WHERE id = v_user_id;

  UPDATE public.memberships
  SET
    status = 'CANCELED',
    canceled_at = COALESCE(canceled_at, now()),
    deleted_at = COALESCE(deleted_at, now()),
    updated_at = now()
  WHERE user_id = v_user_id
    AND deleted_at IS NULL;

  UPDATE public.credits
  SET
    deleted_at = COALESCE(deleted_at, now()),
    updated_at = now()
  WHERE user_id = v_user_id
    AND deleted_at IS NULL;

  UPDATE public.settings
  SET
    deleted_at = COALESCE(deleted_at, now()),
    updated_at = now()
  WHERE user_id = v_user_id
    AND deleted_at IS NULL;

  -- Activity trail (survives only until CASCADE removes users; still useful if
  -- actor_user_id is SET NULL on delete — activity_log FK is ON DELETE SET NULL).
  INSERT INTO public.activity_log (
    actor_user_id,
    action,
    entity_type,
    entity_id,
    metadata
  )
  VALUES (
    v_user_id,
    'AUTH_USER_DELETED',
    'users',
    v_user_id,
    jsonb_build_object(
      'auth_user_id', OLD.id,
      'email', OLD.email
    )
  );

  RETURN OLD;
EXCEPTION
  WHEN OTHERS THEN
    -- Do not block Auth deletion if logging/soft-delete fails.
    RAISE WARNING 'handle_user_deleted soft-cleanup failed for %: %', OLD.id, SQLERRM;
    RETURN OLD;
END;
$$;

COMMENT ON FUNCTION public.handle_user_deleted() IS
  'Before auth.users DELETE: soft-delete markers + activity log; FK CASCADE removes rows.';

-- -----------------------------------------------------------------------------
-- Triggers on auth.users
-- -----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE OF email, email_confirmed_at, raw_user_meta_data, last_sign_in_at
  ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_updated();

DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  BEFORE DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_deleted();

-- -----------------------------------------------------------------------------
-- Privileges
-- -----------------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_user_updated() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_user_deleted() FROM PUBLIC;

-- Auth hooks execute as the function owner (SECURITY DEFINER); no EXECUTE grant
-- to authenticated/anon is required or desirable.
