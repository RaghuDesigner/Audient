-- =============================================================================
-- BACKEND-002 APPLY — Payment fields for Invoice History mapping
-- Migration: 20260815000016_payments_invoice_fields.sql
--
-- Purpose: Enrich payments for Invoice History UI.
-- No separate invoices table (BACKEND-002.1 locked decision).
-- Existing payment rows get NULL for new columns.
-- =============================================================================

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS invoice_url TEXT,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS external_payment_id TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS invoice_number TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS payments_external_payment_id_uidx
  ON public.payments (external_payment_id)
  WHERE external_payment_id IS NOT NULL AND deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS payments_invoice_number_uidx
  ON public.payments (invoice_number)
  WHERE invoice_number IS NOT NULL AND deleted_at IS NULL;

COMMENT ON COLUMN public.payments.invoice_url IS
  'Hosted invoice / PDF URL for Invoice History UI.';
COMMENT ON COLUMN public.payments.paid_at IS
  'Timestamp when payment reached SUCCEEDED.';
COMMENT ON COLUMN public.payments.external_payment_id IS
  'Optional non-Stripe or alternate external payment identifier.';
COMMENT ON COLUMN public.payments.description IS
  'Human-readable payment / invoice line description.';
COMMENT ON COLUMN public.payments.invoice_number IS
  'Display invoice number for Invoice History.';
