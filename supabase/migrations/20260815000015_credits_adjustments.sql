-- =============================================================================
-- BACKEND-002 APPLY — Credits defaults, ADMIN_ADJUSTMENT, payment_id, immutability
-- Migration: 20260815000015_credits_adjustments.sql
--
-- Purpose: Align new-wallet defaults to Free 300; extend ledger; append-only.
-- Does NOT rewrite existing credits balances (no mass UPDATE of wallets).
-- =============================================================================

ALTER TABLE public.credits
  ALTER COLUMN plan_credits SET DEFAULT 300;

ALTER TABLE public.credits
  ALTER COLUMN monthly_grant SET DEFAULT 300;

-- Extend ledger types (additive; safe if already present)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'credit_txn_type'
      AND e.enumlabel = 'ADMIN_ADJUSTMENT'
  ) THEN
    ALTER TYPE public.credit_txn_type ADD VALUE 'ADMIN_ADJUSTMENT';
  END IF;
END $$;

ALTER TABLE public.credit_transactions
  ADD COLUMN IF NOT EXISTS payment_id UUID;

ALTER TABLE public.credit_transactions
  DROP CONSTRAINT IF EXISTS credit_transactions_payment_id_fkey;

ALTER TABLE public.credit_transactions
  ADD CONSTRAINT credit_transactions_payment_id_fkey
  FOREIGN KEY (payment_id)
  REFERENCES public.payments (id)
  ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS credit_transactions_payment_id_idx
  ON public.credit_transactions (payment_id)
  WHERE payment_id IS NOT NULL;

-- Append-only enforcement (ledger rows are never updated/deleted)
CREATE OR REPLACE FUNCTION public.prevent_credit_txn_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'credit_transactions is append-only';
END;
$$;

DROP TRIGGER IF EXISTS credit_transactions_no_update ON public.credit_transactions;
DROP TRIGGER IF EXISTS credit_transactions_no_delete ON public.credit_transactions;

CREATE TRIGGER credit_transactions_no_update
  BEFORE UPDATE ON public.credit_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_credit_txn_mutation();

CREATE TRIGGER credit_transactions_no_delete
  BEFORE DELETE ON public.credit_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_credit_txn_mutation();

COMMENT ON COLUMN public.credit_transactions.payment_id IS
  'Optional link to payments for TOPUP / REFUND rows.';
COMMENT ON FUNCTION public.prevent_credit_txn_mutation() IS
  'Blocks UPDATE/DELETE on credit_transactions (immutable ledger).';
