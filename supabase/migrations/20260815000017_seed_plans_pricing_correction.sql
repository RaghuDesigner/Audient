-- =============================================================================
-- BACKEND-002 APPLY — Correct plan seed to PRICING.md / plans.ts
-- Migration: 20260815000017_seed_plans_pricing_correction.sql
--
-- Purpose: FREE 300 · PRO 1000 · ENTERPRISE(Business) 10000 · all metered.
-- Updates catalog rows only — does not rewrite user wallets or memberships.
-- =============================================================================

UPDATE public.plans
SET
  display_name = 'Free',
  description = 'Screenshot audits with a limited monthly credit grant.',
  price_cents = 0,
  monthly_credits = 300,
  is_unlimited = FALSE,
  screenshot_cost = 150,
  url_cost = 0,
  features = '{"urlAudits": false, "pdfReports": false, "creditTopups": false}'::jsonb,
  is_active = TRUE,
  updated_at = timezone('utc', now())
WHERE key = 'FREE'
  AND billing_interval = 'MONTHLY'
  AND deleted_at IS NULL;

UPDATE public.plans
SET
  display_name = 'Pro',
  description = 'URL + screenshot audits with detailed PDF reports.',
  price_cents = 2900,
  monthly_credits = 1000,
  is_unlimited = FALSE,
  screenshot_cost = 100,
  url_cost = 400,
  features = '{"urlAudits": true, "pdfReports": true, "creditTopups": true}'::jsonb,
  is_active = TRUE,
  updated_at = timezone('utc', now())
WHERE key = 'PRO'
  AND billing_interval = 'MONTHLY'
  AND deleted_at IS NULL;

UPDATE public.plans
SET
  display_name = 'Business',
  description = 'High-volume metered credits for multi-site audits.',
  price_cents = 9900,
  monthly_credits = 10000,
  is_unlimited = FALSE,
  screenshot_cost = 50,
  url_cost = 100,
  features = '{"urlAudits": true, "pdfReports": true, "creditTopups": true}'::jsonb,
  is_active = TRUE,
  updated_at = timezone('utc', now())
WHERE key = 'ENTERPRISE'
  AND billing_interval = 'MONTHLY'
  AND deleted_at IS NULL;

-- Ensure rows exist if seed never ran (idempotent insert)
INSERT INTO public.plans (
  key,
  display_name,
  description,
  price_cents,
  currency,
  billing_interval,
  monthly_credits,
  is_unlimited,
  screenshot_cost,
  url_cost,
  features,
  is_active
)
SELECT
  v.key::public.tier,
  v.display_name,
  v.description,
  v.price_cents,
  'usd',
  'MONTHLY'::public.billing_interval,
  v.monthly_credits,
  FALSE,
  v.screenshot_cost,
  v.url_cost,
  v.features::jsonb,
  TRUE
FROM (
  VALUES
    ('FREE', 'Free', 'Screenshot audits with a limited monthly credit grant.', 0, 300, 150, 0,
      '{"urlAudits": false, "pdfReports": false, "creditTopups": false}'),
    ('PRO', 'Pro', 'URL + screenshot audits with detailed PDF reports.', 2900, 1000, 100, 400,
      '{"urlAudits": true, "pdfReports": true, "creditTopups": true}'),
    ('ENTERPRISE', 'Business', 'High-volume metered credits for multi-site audits.', 9900, 10000, 50, 100,
      '{"urlAudits": true, "pdfReports": true, "creditTopups": true}')
) AS v(key, display_name, description, price_cents, monthly_credits, screenshot_cost, url_cost, features)
WHERE NOT EXISTS (
  SELECT 1
  FROM public.plans AS p
  WHERE p.key = v.key::public.tier
    AND p.billing_interval = 'MONTHLY'
    AND p.deleted_at IS NULL
);
