-- =============================================================================
-- Audient — Credits & ledger
-- Source: docs/SCHEMA.md (Credits) + docs/DATABASE.md (Credit Transactions, §10.1)
-- =============================================================================

CREATE TABLE public.credits (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL,
  -- Split balances: plan credits reset monthly; purchased top-ups roll over
  -- (docs/DATABASE.md §10.1 / PRD credit policy).
  plan_credits        INTEGER NOT NULL DEFAULT 200
                      CHECK (plan_credits >= 0),
  purchased_credits   INTEGER NOT NULL DEFAULT 0
                      CHECK (purchased_credits >= 0),
  -- Denormalized total for fast header reads (plan + purchased).
  balance             INTEGER GENERATED ALWAYS AS
                        (plan_credits + purchased_credits) STORED,
  monthly_grant       INTEGER NOT NULL DEFAULT 200
                      CHECK (monthly_grant >= 0),
  is_unlimited        BOOLEAN NOT NULL DEFAULT FALSE,
  lifetime_used       INTEGER NOT NULL DEFAULT 0
                      CHECK (lifetime_used >= 0),
  last_reset_at       TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  next_reset_at       TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  deleted_at          TIMESTAMPTZ,

  CONSTRAINT credits_user_id_unique UNIQUE (user_id),
  CONSTRAINT credits_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES public.users (id)
    ON DELETE CASCADE
);

COMMENT ON TABLE public.credits IS
  'One credit account per user. balance = plan_credits + purchased_credits.';
COMMENT ON COLUMN public.credits.plan_credits IS
  'Monthly plan allotment; reset each billing cycle.';
COMMENT ON COLUMN public.credits.purchased_credits IS
  'Top-up credits that roll over across resets.';

-- Append-only ledger (no soft delete / no updated_at — immutable trail)
CREATE TABLE public.credit_transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credits_id      UUID NOT NULL,
  type            public.credit_txn_type NOT NULL,
  -- Positive = credit added; negative = spent
  amount          INTEGER NOT NULL
                  CHECK (amount <> 0 OR type = 'AUDIT_DEDUCTION'),
  balance_after   INTEGER NOT NULL
                  CHECK (balance_after >= 0),
  plan_after      INTEGER
                  CHECK (plan_after IS NULL OR plan_after >= 0),
  purchased_after INTEGER
                  CHECK (purchased_after IS NULL OR purchased_after >= 0),
  audit_id        UUID,
  note            TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),

  CONSTRAINT credit_transactions_credits_id_fkey
    FOREIGN KEY (credits_id)
    REFERENCES public.credits (id)
    ON DELETE CASCADE
);

COMMENT ON TABLE public.credit_transactions IS
  'Append-only credit ledger. Do not UPDATE/DELETE in application code.';

-- audit_id FK added after audits table exists (see product migration).
