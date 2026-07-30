-- =============================================================================
-- Audient — Identity, plans, memberships, settings
-- Source: docs/SCHEMA.md (Users, Memberships, Settings) + docs/DATABASE.md §8.3
-- =============================================================================

-- -----------------------------------------------------------------------------
-- plans (catalog — production readiness, DATABASE.md §8.3)
-- -----------------------------------------------------------------------------
CREATE TABLE public.plans (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key               public.tier NOT NULL,
  display_name      TEXT NOT NULL,
  description       TEXT,
  price_cents       INTEGER NOT NULL DEFAULT 0
                    CHECK (price_cents >= 0),
  currency          TEXT NOT NULL DEFAULT 'usd'
                    CHECK (char_length(currency) = 3),
  billing_interval  public.billing_interval NOT NULL DEFAULT 'MONTHLY',
  monthly_credits   INTEGER NOT NULL DEFAULT 0
                    CHECK (monthly_credits >= 0),
  is_unlimited      BOOLEAN NOT NULL DEFAULT FALSE,
  screenshot_cost   INTEGER NOT NULL DEFAULT 0
                    CHECK (screenshot_cost >= 0),
  url_cost          INTEGER NOT NULL DEFAULT 0
                    CHECK (url_cost >= 0),
  features          JSONB NOT NULL DEFAULT '{}'::jsonb,
  stripe_price_id   TEXT,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  deleted_at        TIMESTAMPTZ,

  CONSTRAINT plans_key_interval_unique UNIQUE (key, billing_interval)
);

COMMENT ON TABLE public.plans IS
  'Plan catalog: pricing, credit grants, feature flags, Stripe price IDs.';

-- -----------------------------------------------------------------------------
-- users
-- -----------------------------------------------------------------------------
CREATE TABLE public.users (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_provider_id    UUID NOT NULL,
  email               TEXT NOT NULL,
  name                TEXT,
  avatar_url          TEXT,
  role                public.user_role NOT NULL DEFAULT 'USER',
  email_verified      BOOLEAN NOT NULL DEFAULT FALSE,
  status              public.user_status NOT NULL DEFAULT 'ACTIVE',
  last_login_at       TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  deleted_at          TIMESTAMPTZ,

  CONSTRAINT users_auth_provider_id_unique UNIQUE (auth_provider_id),
  CONSTRAINT users_email_format_check
    CHECK (email ~* '^[^@]+@[^@]+\.[^@]+$'),
  CONSTRAINT users_auth_provider_id_fkey
    FOREIGN KEY (auth_provider_id)
    REFERENCES auth.users (id)
    ON DELETE CASCADE
);

COMMENT ON TABLE public.users IS
  'Application identity linked to Supabase Auth (auth.users). No credentials stored.';

COMMENT ON COLUMN public.users.deleted_at IS
  'Soft-delete timestamp. Prefer setting status = DELETED and deleted_at together.';

-- Active (non-soft-deleted) email uniqueness
CREATE UNIQUE INDEX users_email_active_uidx
  ON public.users (lower(email))
  WHERE deleted_at IS NULL;

-- -----------------------------------------------------------------------------
-- memberships (1:1 with users)
-- -----------------------------------------------------------------------------
CREATE TABLE public.memberships (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL,
  tier                    public.tier NOT NULL DEFAULT 'FREE',
  status                  public.membership_status NOT NULL DEFAULT 'ACTIVE',
  billing_interval        public.billing_interval NOT NULL DEFAULT 'MONTHLY',
  plan_id                 UUID,
  stripe_customer_id      TEXT,
  stripe_subscription_id  TEXT,
  current_period_end      TIMESTAMPTZ,
  canceled_at             TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  deleted_at              TIMESTAMPTZ,

  CONSTRAINT memberships_user_id_unique UNIQUE (user_id),
  CONSTRAINT memberships_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES public.users (id)
    ON DELETE CASCADE,
  CONSTRAINT memberships_plan_id_fkey
    FOREIGN KEY (plan_id)
    REFERENCES public.plans (id)
    ON DELETE SET NULL
);

COMMENT ON TABLE public.memberships IS
  'One active membership per user: tier, subscription status, Stripe references.';

CREATE UNIQUE INDEX memberships_stripe_customer_id_uidx
  ON public.memberships (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL AND deleted_at IS NULL;

CREATE UNIQUE INDEX memberships_stripe_subscription_id_uidx
  ON public.memberships (stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL AND deleted_at IS NULL;

-- -----------------------------------------------------------------------------
-- settings (1:1 with users)
-- -----------------------------------------------------------------------------
CREATE TABLE public.settings (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL,
  theme                 public.theme_preference NOT NULL DEFAULT 'SYSTEM',
  email_notifications   BOOLEAN NOT NULL DEFAULT TRUE,
  default_pdf_format    public.pdf_format NOT NULL DEFAULT 'A4',
  timezone              TEXT NOT NULL DEFAULT 'UTC',
  language              TEXT NOT NULL DEFAULT 'en',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  deleted_at            TIMESTAMPTZ,

  CONSTRAINT settings_user_id_unique UNIQUE (user_id),
  CONSTRAINT settings_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES public.users (id)
    ON DELETE CASCADE
);

COMMENT ON TABLE public.settings IS
  'Per-user preferences: theme, notifications, PDF format, locale.';
