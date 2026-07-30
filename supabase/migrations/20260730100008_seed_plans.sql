-- =============================================================================
-- Audient — Seed plan catalog (SCHEMA Free default 200; Pro/Enterprise placeholders)
-- Align monthly_credits / costs with docs/PRICING.md before production go-live.
-- =============================================================================

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
) VALUES
  (
    'FREE',
    'Free',
    'Screenshot audits with a limited monthly credit grant.',
    0,
    'usd',
    'MONTHLY',
    200,
    FALSE,
    150,
    0,
    '{"urlAudits": false, "pdfReports": false, "creditTopups": false}'::jsonb,
    TRUE
  ),
  (
    'PRO',
    'Pro',
    'URL + screenshot audits with detailed PDF reports.',
    2900,
    'usd',
    'MONTHLY',
    2000,
    FALSE,
    100,
    400,
    '{"urlAudits": true, "pdfReports": true, "creditTopups": true, "competitiveAnalysis": true}'::jsonb,
    TRUE
  ),
  (
    'ENTERPRISE',
    'Enterprise',
    'Unlimited credits with highest throughput and all features.',
    9900,
    'usd',
    'MONTHLY',
    0,
    TRUE,
    50,
    100,
    '{"urlAudits": true, "pdfReports": true, "creditTopups": true, "competitiveAnalysis": true, "priorityQueue": true}'::jsonb,
    TRUE
  );
