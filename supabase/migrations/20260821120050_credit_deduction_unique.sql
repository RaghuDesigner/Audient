-- =============================================================================
-- BACKEND-010 — Credit deduction uniqueness (one AUDIT_DEDUCTION per audit)
-- Migration: 20260821120050_credit_deduction_unique.sql
-- =============================================================================

CREATE UNIQUE INDEX IF NOT EXISTS credit_transactions_audit_deduction_uidx
  ON public.credit_transactions (audit_id)
  WHERE type = 'AUDIT_DEDUCTION'
    AND audit_id IS NOT NULL;

COMMENT ON INDEX public.credit_transactions_audit_deduction_uidx IS
  'BACKEND-010: at most one AUDIT_DEDUCTION ledger row per audit.';
