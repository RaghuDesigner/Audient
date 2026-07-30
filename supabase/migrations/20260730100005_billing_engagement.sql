-- =============================================================================
-- Audient — Billing, notifications, webhooks, activity, feedback
-- Source: docs/SCHEMA.md + docs/DATABASE.md §8.1, §8.2, §8.5
-- =============================================================================

CREATE TABLE public.payments (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   UUID NOT NULL,
  membership_id             UUID,
  amount                    INTEGER NOT NULL,
  currency                  TEXT NOT NULL DEFAULT 'usd'
                            CHECK (char_length(currency) = 3),
  status                    public.payment_status NOT NULL DEFAULT 'PENDING',
  type                      public.payment_type NOT NULL,
  stripe_invoice_id         TEXT,
  stripe_subscription_id    TEXT,
  stripe_payment_intent_id  TEXT,
  credits_granted           INTEGER
                            CHECK (credits_granted IS NULL OR credits_granted >= 0),
  created_at                TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  deleted_at                TIMESTAMPTZ,

  CONSTRAINT payments_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES public.users (id)
    ON DELETE CASCADE,
  CONSTRAINT payments_membership_id_fkey
    FOREIGN KEY (membership_id)
    REFERENCES public.memberships (id)
    ON DELETE SET NULL,
  -- Refunds may be negative amounts; charges must be > 0
  CONSTRAINT payments_amount_by_type
    CHECK (
      (type = 'REFUND' AND amount <= 0)
      OR (type <> 'REFUND' AND amount > 0)
    )
);

COMMENT ON TABLE public.payments IS
  'Financial audit trail. Stores Stripe references only — never card data.';

CREATE UNIQUE INDEX payments_stripe_invoice_id_uidx
  ON public.payments (stripe_invoice_id)
  WHERE stripe_invoice_id IS NOT NULL AND deleted_at IS NULL;

CREATE UNIQUE INDEX payments_stripe_payment_intent_id_uidx
  ON public.payments (stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL AND deleted_at IS NULL;

CREATE TABLE public.notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL,
  type        public.notification_type NOT NULL,
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  read        BOOLEAN NOT NULL DEFAULT FALSE,
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  deleted_at  TIMESTAMPTZ,

  CONSTRAINT notifications_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES public.users (id)
    ON DELETE CASCADE,
  CONSTRAINT notifications_title_not_blank
    CHECK (length(trim(title)) > 0)
);

COMMENT ON TABLE public.notifications IS
  'In-app notifications (audit complete, low credits, payments, etc.).';

-- Stripe webhook idempotency (DATABASE.md §8.1) — append-oriented
CREATE TABLE public.processed_webhook_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT NOT NULL,
  event_type      TEXT NOT NULL,
  status          public.webhook_processing_status NOT NULL DEFAULT 'PENDING',
  payload         JSONB,
  error_message   TEXT,
  processed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),

  CONSTRAINT processed_webhook_events_stripe_event_id_unique
    UNIQUE (stripe_event_id)
);

COMMENT ON TABLE public.processed_webhook_events IS
  'Idempotency store for Stripe webhooks (at-least-once delivery).';

-- Security / activity trail (DATABASE.md §8.2) — append-only
CREATE TABLE public.activity_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID,
  action        TEXT NOT NULL,
  entity_type   TEXT,
  entity_id     UUID,
  ip_address    INET,
  user_agent    TEXT,
  metadata      JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),

  CONSTRAINT activity_log_actor_user_id_fkey
    FOREIGN KEY (actor_user_id)
    REFERENCES public.users (id)
    ON DELETE SET NULL,
  CONSTRAINT activity_log_action_not_blank
    CHECK (length(trim(action)) > 0)
);

COMMENT ON TABLE public.activity_log IS
  'Append-only security/activity trail. Soft entity refs by type + id.';

-- Report satisfaction KPIs (DATABASE.md §8.5)
CREATE TABLE public.report_feedback (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL,
  report_id       UUID NOT NULL,
  recommendation_id UUID,
  rating          SMALLINT
                  CHECK (rating IS NULL OR rating BETWEEN 1 AND 5),
  thumbs_up       BOOLEAN,
  comment         TEXT,
  acted_on        BOOLEAN,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  deleted_at      TIMESTAMPTZ,

  CONSTRAINT report_feedback_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES public.users (id)
    ON DELETE CASCADE,
  CONSTRAINT report_feedback_report_id_fkey
    FOREIGN KEY (report_id)
    REFERENCES public.reports (id)
    ON DELETE CASCADE,
  CONSTRAINT report_feedback_recommendation_id_fkey
    FOREIGN KEY (recommendation_id)
    REFERENCES public.recommendations (id)
    ON DELETE SET NULL,
  CONSTRAINT report_feedback_has_signal
    CHECK (
      rating IS NOT NULL
      OR thumbs_up IS NOT NULL
      OR acted_on IS NOT NULL
      OR (comment IS NOT NULL AND length(trim(comment)) > 0)
    )
);

COMMENT ON TABLE public.report_feedback IS
  'User feedback on reports/recommendations for product quality KPIs.';
