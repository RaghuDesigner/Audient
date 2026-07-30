-- =============================================================================
-- Audient — Indexes (hot query paths)
-- Source: docs/DATABASE.md §6, §9.1
-- =============================================================================

-- users
CREATE INDEX users_status_idx
  ON public.users (status)
  WHERE deleted_at IS NULL;

CREATE INDEX users_created_at_idx
  ON public.users (created_at DESC);

-- memberships
CREATE INDEX memberships_tier_status_idx
  ON public.memberships (tier, status)
  WHERE deleted_at IS NULL;

CREATE INDEX memberships_plan_id_idx
  ON public.memberships (plan_id)
  WHERE plan_id IS NOT NULL;

-- credits / ledger
CREATE INDEX credit_transactions_credits_id_created_at_idx
  ON public.credit_transactions (credits_id, created_at DESC);

CREATE INDEX credit_transactions_audit_id_idx
  ON public.credit_transactions (audit_id)
  WHERE audit_id IS NOT NULL;

CREATE INDEX credit_transactions_type_created_at_idx
  ON public.credit_transactions (type, created_at DESC);

-- audits (history + workers)
CREATE INDEX audits_user_id_created_at_idx
  ON public.audits (user_id, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX audits_user_id_status_idx
  ON public.audits (user_id, status)
  WHERE deleted_at IS NULL;

-- Partial index: only in-flight work for workers
CREATE INDEX audits_status_queued_processing_idx
  ON public.audits (status, created_at ASC)
  WHERE status IN ('QUEUED', 'PROCESSING') AND deleted_at IS NULL;

-- reports
CREATE INDEX reports_created_at_idx
  ON public.reports (created_at DESC)
  WHERE deleted_at IS NULL;

-- recommendations
CREATE INDEX recommendations_report_id_idx
  ON public.recommendations (report_id)
  WHERE deleted_at IS NULL;

CREATE INDEX recommendations_report_id_severity_idx
  ON public.recommendations (report_id, severity)
  WHERE deleted_at IS NULL;

CREATE INDEX recommendations_report_id_priority_idx
  ON public.recommendations (report_id, priority)
  WHERE deleted_at IS NULL;

CREATE INDEX recommendations_category_idx
  ON public.recommendations (category)
  WHERE deleted_at IS NULL;

-- file assets
CREATE INDEX file_assets_user_id_idx
  ON public.file_assets (user_id)
  WHERE deleted_at IS NULL;

CREATE INDEX file_assets_audit_id_idx
  ON public.file_assets (audit_id)
  WHERE audit_id IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX file_assets_report_id_idx
  ON public.file_assets (report_id)
  WHERE report_id IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX file_assets_expires_at_idx
  ON public.file_assets (expires_at)
  WHERE expires_at IS NOT NULL AND deleted_at IS NULL;

CREATE UNIQUE INDEX file_assets_storage_key_active_uidx
  ON public.file_assets (storage_key)
  WHERE deleted_at IS NULL;

-- payments
CREATE INDEX payments_user_id_created_at_idx
  ON public.payments (user_id, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX payments_membership_id_idx
  ON public.payments (membership_id)
  WHERE membership_id IS NOT NULL;

CREATE INDEX payments_status_type_idx
  ON public.payments (status, type)
  WHERE deleted_at IS NULL;

CREATE INDEX payments_stripe_subscription_id_idx
  ON public.payments (stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

-- notifications (unread feed)
CREATE INDEX notifications_user_id_read_created_at_idx
  ON public.notifications (user_id, read, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX notifications_user_id_unread_idx
  ON public.notifications (user_id, created_at DESC)
  WHERE read = FALSE AND deleted_at IS NULL;

-- webhooks
CREATE INDEX processed_webhook_events_type_created_at_idx
  ON public.processed_webhook_events (event_type, created_at DESC);

CREATE INDEX processed_webhook_events_status_idx
  ON public.processed_webhook_events (status)
  WHERE status <> 'PROCESSED';

-- activity log
CREATE INDEX activity_log_actor_user_id_created_at_idx
  ON public.activity_log (actor_user_id, created_at DESC)
  WHERE actor_user_id IS NOT NULL;

CREATE INDEX activity_log_entity_idx
  ON public.activity_log (entity_type, entity_id)
  WHERE entity_type IS NOT NULL AND entity_id IS NOT NULL;

CREATE INDEX activity_log_created_at_idx
  ON public.activity_log (created_at DESC);

-- report feedback
CREATE INDEX report_feedback_report_id_idx
  ON public.report_feedback (report_id)
  WHERE deleted_at IS NULL;

CREATE INDEX report_feedback_user_id_idx
  ON public.report_feedback (user_id)
  WHERE deleted_at IS NULL;

-- plans
CREATE INDEX plans_active_key_idx
  ON public.plans (key)
  WHERE is_active = TRUE AND deleted_at IS NULL;
