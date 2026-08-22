-- =============================================================================
-- BACKEND-002 APPLY — Auth trigger Free grant = 300 (PRICING)
-- Migration: 20260815000018_auth_trigger_grant_300.sql
--
-- Purpose: Signup / backfill Free grant fallback 300 (was 200).
-- Recreates provisioning functions only; trigger bindings on auth.users unchanged.
-- Does not enable Auth cutover or change mock auth.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id       UUID;
  v_plan_id       UUID;
  v_monthly_grant INTEGER := 300;
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
    v_monthly_grant := 300;
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

      INSERT INTO public.memberships (user_id, tier, status, billing_interval)
      SELECT u.id, 'FREE', 'ACTIVE', 'MONTHLY'
      FROM public.users AS u
      WHERE u.auth_provider_id = NEW.id
      ON CONFLICT (user_id) DO NOTHING;

      -- Fallback grant 300 when catalog missing (was 200).
      INSERT INTO public.credits (user_id, plan_credits, monthly_grant, next_reset_at)
      SELECT u.id, 300, 300, now() + INTERVAL '1 month'
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

COMMENT ON FUNCTION public.handle_new_user() IS
  'Provision app rows after auth.users INSERT. Free grant from plans catalog (fallback 300).';

COMMENT ON FUNCTION public.handle_user_updated() IS
  'Sync profile from auth.users; backfill wallet uses Free grant 300 when catalog missing.';
