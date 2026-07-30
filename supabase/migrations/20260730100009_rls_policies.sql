-- =============================================================================
-- Audient — Row Level Security policies
-- Migration: 20260730100009_rls_policies.sql
--
-- Identity link: public.users.auth_provider_id = auth.uid()
--
-- Service role: Supabase service_role bypasses RLS by default. Do not put the
-- service role key in client bundles. Trusted servers/workers/webhooks use it.
--
-- Write model (secure):
--   • Users may mutate their own profile, settings, audits, assets, feedback,
--     and notification read-state.
--   • Credits, memberships, payments, and the credit ledger are SELECT-only for
--     authenticated users (mutations via service_role only) to prevent
--     balance/tier/payment tampering.
--   • processed_webhook_events is service_role-only (no end-user policies).
--   • plans is a public catalog: SELECT of active rows for anon + authenticated.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Helpers
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u.id
  FROM public.users AS u
  WHERE u.auth_provider_id = auth.uid()
    AND u.deleted_at IS NULL
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.current_user_id() IS
  'Returns the application users.id for the JWT subject (auth.uid()).';

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
      AND a.user_id = public.current_user_id()
      AND a.deleted_at IS NULL
  );
$$;

CREATE OR REPLACE FUNCTION public.owns_report(p_report_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.reports AS r
    INNER JOIN public.audits AS a ON a.id = r.audit_id
    WHERE r.id = p_report_id
      AND a.user_id = public.current_user_id()
      AND r.deleted_at IS NULL
      AND a.deleted_at IS NULL
  );
$$;

REVOKE ALL ON FUNCTION public.current_user_id() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.owns_audit(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.owns_report(UUID) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.current_user_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.owns_audit(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.owns_report(UUID) TO authenticated;

-- Also allow anon to call current_user_id (returns NULL) if needed by shared clients.
GRANT EXECUTE ON FUNCTION public.current_user_id() TO anon;

-- -----------------------------------------------------------------------------
-- Enable RLS on every table
-- -----------------------------------------------------------------------------

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processed_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_feedback ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owners too (defense-in-depth on Supabase).
ALTER TABLE public.plans FORCE ROW LEVEL SECURITY;
ALTER TABLE public.users FORCE ROW LEVEL SECURITY;
ALTER TABLE public.memberships FORCE ROW LEVEL SECURITY;
ALTER TABLE public.settings FORCE ROW LEVEL SECURITY;
ALTER TABLE public.credits FORCE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions FORCE ROW LEVEL SECURITY;
ALTER TABLE public.audits FORCE ROW LEVEL SECURITY;
ALTER TABLE public.reports FORCE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations FORCE ROW LEVEL SECURITY;
ALTER TABLE public.file_assets FORCE ROW LEVEL SECURITY;
ALTER TABLE public.payments FORCE ROW LEVEL SECURITY;
ALTER TABLE public.notifications FORCE ROW LEVEL SECURITY;
ALTER TABLE public.processed_webhook_events FORCE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log FORCE ROW LEVEL SECURITY;
ALTER TABLE public.report_feedback FORCE ROW LEVEL SECURITY;

-- =============================================================================
-- plans — public catalog (documented readable)
-- =============================================================================

CREATE POLICY plans_select_active
  ON public.plans
  FOR SELECT
  TO anon, authenticated
  USING (is_active = TRUE AND deleted_at IS NULL);

-- Authenticated writes denied (catalog maintained by service_role).
CREATE POLICY plans_insert_none
  ON public.plans
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (FALSE);

CREATE POLICY plans_update_none
  ON public.plans
  FOR UPDATE
  TO authenticated, anon
  USING (FALSE)
  WITH CHECK (FALSE);

CREATE POLICY plans_delete_none
  ON public.plans
  FOR DELETE
  TO authenticated, anon
  USING (FALSE);

-- =============================================================================
-- users — own profile only
-- =============================================================================

CREATE POLICY users_select_own
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth_provider_id = auth.uid() AND deleted_at IS NULL);

CREATE POLICY users_insert_own
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth_provider_id = auth.uid()
    AND role = 'USER'
    AND status = 'ACTIVE'
  );

CREATE POLICY users_update_own
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth_provider_id = auth.uid() AND deleted_at IS NULL)
  WITH CHECK (
    auth_provider_id = auth.uid()
    AND role = 'USER'
  );

CREATE POLICY users_delete_own
  ON public.users
  FOR DELETE
  TO authenticated
  USING (auth_provider_id = auth.uid());

-- =============================================================================
-- memberships — SELECT own; writes via service_role only
-- =============================================================================

CREATE POLICY memberships_select_own
  ON public.memberships
  FOR SELECT
  TO authenticated
  USING (user_id = public.current_user_id() AND deleted_at IS NULL);

CREATE POLICY memberships_insert_none
  ON public.memberships
  FOR INSERT
  TO authenticated
  WITH CHECK (FALSE);

CREATE POLICY memberships_update_none
  ON public.memberships
  FOR UPDATE
  TO authenticated
  USING (FALSE)
  WITH CHECK (FALSE);

CREATE POLICY memberships_delete_none
  ON public.memberships
  FOR DELETE
  TO authenticated
  USING (FALSE);

-- =============================================================================
-- settings — full CRUD on own row
-- =============================================================================

CREATE POLICY settings_select_own
  ON public.settings
  FOR SELECT
  TO authenticated
  USING (user_id = public.current_user_id() AND deleted_at IS NULL);

CREATE POLICY settings_insert_own
  ON public.settings
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = public.current_user_id());

CREATE POLICY settings_update_own
  ON public.settings
  FOR UPDATE
  TO authenticated
  USING (user_id = public.current_user_id() AND deleted_at IS NULL)
  WITH CHECK (user_id = public.current_user_id());

CREATE POLICY settings_delete_own
  ON public.settings
  FOR DELETE
  TO authenticated
  USING (user_id = public.current_user_id());

-- =============================================================================
-- credits — SELECT own; writes via service_role only
-- =============================================================================

CREATE POLICY credits_select_own
  ON public.credits
  FOR SELECT
  TO authenticated
  USING (user_id = public.current_user_id() AND deleted_at IS NULL);

CREATE POLICY credits_insert_none
  ON public.credits
  FOR INSERT
  TO authenticated
  WITH CHECK (FALSE);

CREATE POLICY credits_update_none
  ON public.credits
  FOR UPDATE
  TO authenticated
  USING (FALSE)
  WITH CHECK (FALSE);

CREATE POLICY credits_delete_none
  ON public.credits
  FOR DELETE
  TO authenticated
  USING (FALSE);

-- =============================================================================
-- credit_transactions — SELECT own ledger; append-only via service_role
-- =============================================================================

CREATE POLICY credit_transactions_select_own
  ON public.credit_transactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.credits AS c
      WHERE c.id = credit_transactions.credits_id
        AND c.user_id = public.current_user_id()
        AND c.deleted_at IS NULL
    )
  );

CREATE POLICY credit_transactions_insert_none
  ON public.credit_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (FALSE);

CREATE POLICY credit_transactions_update_none
  ON public.credit_transactions
  FOR UPDATE
  TO authenticated
  USING (FALSE)
  WITH CHECK (FALSE);

CREATE POLICY credit_transactions_delete_none
  ON public.credit_transactions
  FOR DELETE
  TO authenticated
  USING (FALSE);

-- =============================================================================
-- audits — full CRUD on own audits
-- =============================================================================

CREATE POLICY audits_select_own
  ON public.audits
  FOR SELECT
  TO authenticated
  USING (user_id = public.current_user_id() AND deleted_at IS NULL);

CREATE POLICY audits_insert_own
  ON public.audits
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = public.current_user_id());

CREATE POLICY audits_update_own
  ON public.audits
  FOR UPDATE
  TO authenticated
  USING (user_id = public.current_user_id() AND deleted_at IS NULL)
  WITH CHECK (user_id = public.current_user_id());

CREATE POLICY audits_delete_own
  ON public.audits
  FOR DELETE
  TO authenticated
  USING (user_id = public.current_user_id());

-- =============================================================================
-- reports — access via owning audit
-- =============================================================================

CREATE POLICY reports_select_own
  ON public.reports
  FOR SELECT
  TO authenticated
  USING (public.owns_audit(audit_id) AND deleted_at IS NULL);

CREATE POLICY reports_insert_own
  ON public.reports
  FOR INSERT
  TO authenticated
  WITH CHECK (public.owns_audit(audit_id));

CREATE POLICY reports_update_own
  ON public.reports
  FOR UPDATE
  TO authenticated
  USING (public.owns_audit(audit_id) AND deleted_at IS NULL)
  WITH CHECK (public.owns_audit(audit_id));

CREATE POLICY reports_delete_own
  ON public.reports
  FOR DELETE
  TO authenticated
  USING (public.owns_audit(audit_id));

-- =============================================================================
-- recommendations — access via owning report/audit
-- =============================================================================

CREATE POLICY recommendations_select_own
  ON public.recommendations
  FOR SELECT
  TO authenticated
  USING (public.owns_report(report_id) AND deleted_at IS NULL);

CREATE POLICY recommendations_insert_own
  ON public.recommendations
  FOR INSERT
  TO authenticated
  WITH CHECK (public.owns_report(report_id));

CREATE POLICY recommendations_update_own
  ON public.recommendations
  FOR UPDATE
  TO authenticated
  USING (public.owns_report(report_id) AND deleted_at IS NULL)
  WITH CHECK (public.owns_report(report_id));

CREATE POLICY recommendations_delete_own
  ON public.recommendations
  FOR DELETE
  TO authenticated
  USING (public.owns_report(report_id));

-- =============================================================================
-- file_assets — full CRUD on own assets
-- =============================================================================

CREATE POLICY file_assets_select_own
  ON public.file_assets
  FOR SELECT
  TO authenticated
  USING (user_id = public.current_user_id() AND deleted_at IS NULL);

CREATE POLICY file_assets_insert_own
  ON public.file_assets
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = public.current_user_id()
    AND (audit_id IS NULL OR public.owns_audit(audit_id))
    AND (report_id IS NULL OR public.owns_report(report_id))
  );

CREATE POLICY file_assets_update_own
  ON public.file_assets
  FOR UPDATE
  TO authenticated
  USING (user_id = public.current_user_id() AND deleted_at IS NULL)
  WITH CHECK (
    user_id = public.current_user_id()
    AND (audit_id IS NULL OR public.owns_audit(audit_id))
    AND (report_id IS NULL OR public.owns_report(report_id))
  );

CREATE POLICY file_assets_delete_own
  ON public.file_assets
  FOR DELETE
  TO authenticated
  USING (user_id = public.current_user_id());

-- =============================================================================
-- payments — SELECT own; writes via service_role only
-- =============================================================================

CREATE POLICY payments_select_own
  ON public.payments
  FOR SELECT
  TO authenticated
  USING (user_id = public.current_user_id() AND deleted_at IS NULL);

CREATE POLICY payments_insert_none
  ON public.payments
  FOR INSERT
  TO authenticated
  WITH CHECK (FALSE);

CREATE POLICY payments_update_none
  ON public.payments
  FOR UPDATE
  TO authenticated
  USING (FALSE)
  WITH CHECK (FALSE);

CREATE POLICY payments_delete_none
  ON public.payments
  FOR DELETE
  TO authenticated
  USING (FALSE);

-- =============================================================================
-- notifications — SELECT/UPDATE/DELETE own; INSERT via service_role
-- =============================================================================

CREATE POLICY notifications_select_own
  ON public.notifications
  FOR SELECT
  TO authenticated
  USING (user_id = public.current_user_id() AND deleted_at IS NULL);

CREATE POLICY notifications_insert_none
  ON public.notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (FALSE);

CREATE POLICY notifications_update_own
  ON public.notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = public.current_user_id() AND deleted_at IS NULL)
  WITH CHECK (user_id = public.current_user_id());

CREATE POLICY notifications_delete_own
  ON public.notifications
  FOR DELETE
  TO authenticated
  USING (user_id = public.current_user_id());

-- =============================================================================
-- processed_webhook_events — service_role only (no end-user access)
-- =============================================================================

CREATE POLICY processed_webhook_events_select_none
  ON public.processed_webhook_events
  FOR SELECT
  TO authenticated, anon
  USING (FALSE);

CREATE POLICY processed_webhook_events_insert_none
  ON public.processed_webhook_events
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (FALSE);

CREATE POLICY processed_webhook_events_update_none
  ON public.processed_webhook_events
  FOR UPDATE
  TO authenticated, anon
  USING (FALSE)
  WITH CHECK (FALSE);

CREATE POLICY processed_webhook_events_delete_none
  ON public.processed_webhook_events
  FOR DELETE
  TO authenticated, anon
  USING (FALSE);

-- =============================================================================
-- activity_log — SELECT own actor rows; writes via service_role only
-- =============================================================================

CREATE POLICY activity_log_select_own
  ON public.activity_log
  FOR SELECT
  TO authenticated
  USING (actor_user_id = public.current_user_id());

CREATE POLICY activity_log_insert_none
  ON public.activity_log
  FOR INSERT
  TO authenticated
  WITH CHECK (FALSE);

CREATE POLICY activity_log_update_none
  ON public.activity_log
  FOR UPDATE
  TO authenticated
  USING (FALSE)
  WITH CHECK (FALSE);

CREATE POLICY activity_log_delete_none
  ON public.activity_log
  FOR DELETE
  TO authenticated
  USING (FALSE);

-- =============================================================================
-- report_feedback — full CRUD on own feedback
-- =============================================================================

CREATE POLICY report_feedback_select_own
  ON public.report_feedback
  FOR SELECT
  TO authenticated
  USING (user_id = public.current_user_id() AND deleted_at IS NULL);

CREATE POLICY report_feedback_insert_own
  ON public.report_feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = public.current_user_id()
    AND public.owns_report(report_id)
  );

CREATE POLICY report_feedback_update_own
  ON public.report_feedback
  FOR UPDATE
  TO authenticated
  USING (user_id = public.current_user_id() AND deleted_at IS NULL)
  WITH CHECK (
    user_id = public.current_user_id()
    AND public.owns_report(report_id)
  );

CREATE POLICY report_feedback_delete_own
  ON public.report_feedback
  FOR DELETE
  TO authenticated
  USING (user_id = public.current_user_id());
