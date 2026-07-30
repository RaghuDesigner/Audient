-- =============================================================================
-- Audient — Extensions & Enumerated Types
-- Source: docs/DATABASE.md, docs/SCHEMA.md
-- Target: PostgreSQL (Supabase)
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- Identity & access
-- -----------------------------------------------------------------------------
CREATE TYPE public.user_role AS ENUM ('USER', 'ADMIN');

CREATE TYPE public.user_status AS ENUM ('ACTIVE', 'SUSPENDED', 'DELETED');

CREATE TYPE public.tier AS ENUM ('FREE', 'PRO', 'ENTERPRISE');

CREATE TYPE public.membership_status AS ENUM (
  'ACTIVE',
  'TRIALING',
  'PAST_DUE',
  'CANCELED'
);

CREATE TYPE public.billing_interval AS ENUM ('MONTHLY', 'YEARLY');

CREATE TYPE public.theme_preference AS ENUM ('LIGHT', 'DARK', 'SYSTEM');

CREATE TYPE public.pdf_format AS ENUM ('A4', 'LETTER');

-- -----------------------------------------------------------------------------
-- Credits
-- -----------------------------------------------------------------------------
CREATE TYPE public.credit_txn_type AS ENUM (
  'MONTHLY_GRANT',
  'TOPUP',
  'AUDIT_DEDUCTION',
  'REFUND'
);

-- -----------------------------------------------------------------------------
-- Audits / reports / findings
-- -----------------------------------------------------------------------------
CREATE TYPE public.audit_input_type AS ENUM ('SCREENSHOT', 'URL');

CREATE TYPE public.audit_status AS ENUM (
  'QUEUED',
  'PROCESSING',
  'COMPLETED',
  'FAILED'
);

CREATE TYPE public.issue_category AS ENUM (
  'NAVIGATION',
  'CTA',
  'VISUAL_HIERARCHY',
  'MOBILE_RESPONSIVENESS',
  'COPY_MESSAGING',
  'TRUST_SIGNALS',
  'PAGE_SPEED',
  'ACCESSIBILITY',
  'CONVERSION_FLOW'
);

CREATE TYPE public.severity AS ENUM ('CRITICAL', 'MAJOR', 'MINOR');

CREATE TYPE public.recommendation_priority AS ENUM ('HIGH', 'MEDIUM', 'LOW');

CREATE TYPE public.file_asset_type AS ENUM (
  'SCREENSHOT',
  'ANNOTATION',
  'PDF',
  'OTHER'
);

-- -----------------------------------------------------------------------------
-- Billing & engagement
-- -----------------------------------------------------------------------------
CREATE TYPE public.payment_type AS ENUM (
  'SUBSCRIPTION',
  'CREDIT_TOPUP',
  'REFUND'
);

CREATE TYPE public.payment_status AS ENUM (
  'PENDING',
  'SUCCEEDED',
  'FAILED',
  'REFUNDED'
);

CREATE TYPE public.notification_type AS ENUM (
  'AUDIT_COMPLETE',
  'AUDIT_FAILED',
  'LOW_CREDITS',
  'SUBSCRIPTION_EXPIRING',
  'PAYMENT_SUCCEEDED',
  'SYSTEM'
);

CREATE TYPE public.webhook_processing_status AS ENUM (
  'PENDING',
  'PROCESSED',
  'FAILED'
);
