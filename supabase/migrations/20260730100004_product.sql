-- =============================================================================
-- Audient — Core product: audits, reports, recommendations, file assets
-- Source: docs/SCHEMA.md + docs/DATABASE.md §8.4 / §10
-- =============================================================================

CREATE TABLE public.audits (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL,
  input_type            public.audit_input_type NOT NULL,
  website_url           TEXT,
  status                public.audit_status NOT NULL DEFAULT 'QUEUED',
  overall_score         INTEGER
                        CHECK (overall_score IS NULL OR overall_score BETWEEN 0 AND 100),
  accessibility_score   INTEGER
                        CHECK (accessibility_score IS NULL OR accessibility_score BETWEEN 0 AND 100),
  conversion_score      INTEGER
                        CHECK (conversion_score IS NULL OR conversion_score BETWEEN 0 AND 100),
  mobile_score          INTEGER
                        CHECK (mobile_score IS NULL OR mobile_score BETWEEN 0 AND 100),
  credits_cost          INTEGER NOT NULL DEFAULT 0
                        CHECK (credits_cost >= 0),
  summary               TEXT,
  error_message         TEXT,
  competitor_urls       TEXT[] NOT NULL DEFAULT '{}',
  progress_percent      INTEGER NOT NULL DEFAULT 0
                        CHECK (progress_percent BETWEEN 0 AND 100),
  started_at            TIMESTAMPTZ,
  completed_at          TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  deleted_at            TIMESTAMPTZ,

  CONSTRAINT audits_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES public.users (id)
    ON DELETE CASCADE,
  CONSTRAINT audits_url_required_for_url_input
    CHECK (
      (input_type = 'URL' AND website_url IS NOT NULL AND length(trim(website_url)) > 0)
      OR (input_type = 'SCREENSHOT')
    ),
  CONSTRAINT audits_failed_has_error
    CHECK (
      status <> 'FAILED'
      OR (error_message IS NOT NULL AND length(trim(error_message)) > 0)
    )
);

COMMENT ON TABLE public.audits IS
  'Audit requests and headline scores. Screenshots live in file_assets.';

-- Deferred FK from credit_transactions → audits
ALTER TABLE public.credit_transactions
  ADD CONSTRAINT credit_transactions_audit_id_fkey
  FOREIGN KEY (audit_id)
  REFERENCES public.audits (id)
  ON DELETE SET NULL;

CREATE TABLE public.reports (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id          UUID NOT NULL,
  overall_score     INTEGER NOT NULL
                    CHECK (overall_score BETWEEN 0 AND 100),
  category_scores   JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Immutable render snapshot (single source for web + PDF). Prefer querying
  -- recommendations rows for live lists; avoid duplicating as separate columns.
  ai_summary        TEXT NOT NULL,
  pdf_url           TEXT,
  report_json       JSONB NOT NULL DEFAULT '{}'::jsonb,
  competitive_analysis JSONB,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  deleted_at        TIMESTAMPTZ,

  CONSTRAINT reports_audit_id_unique UNIQUE (audit_id),
  CONSTRAINT reports_audit_id_fkey
    FOREIGN KEY (audit_id)
    REFERENCES public.audits (id)
    ON DELETE CASCADE
);

COMMENT ON TABLE public.reports IS
  'Detailed report deliverable for a completed audit (1:1).';

CREATE TABLE public.recommendations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id         UUID NOT NULL,
  category          public.issue_category NOT NULL,
  severity          public.severity NOT NULL,
  title             TEXT NOT NULL,
  description       TEXT NOT NULL,
  business_impact   TEXT,
  recommendation    TEXT NOT NULL,
  priority          public.recommendation_priority NOT NULL,
  screenshot_ref    TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  deleted_at        TIMESTAMPTZ,

  CONSTRAINT recommendations_report_id_fkey
    FOREIGN KEY (report_id)
    REFERENCES public.reports (id)
    ON DELETE CASCADE,
  CONSTRAINT recommendations_title_not_blank
    CHECK (length(trim(title)) > 0)
);

COMMENT ON TABLE public.recommendations IS
  'Per-issue UX findings for a report (SCHEMA.md Recommendations).';

-- File inventory for object-storage keys (DATABASE.md §8.4)
CREATE TABLE public.file_assets (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL,
  storage_key       TEXT NOT NULL,
  file_type         public.file_asset_type NOT NULL,
  mime_type         TEXT,
  size_bytes        BIGINT
                    CHECK (size_bytes IS NULL OR size_bytes >= 0),
  audit_id          UUID,
  report_id         UUID,
  recommendation_id UUID,
  expires_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  deleted_at        TIMESTAMPTZ,

  CONSTRAINT file_assets_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES public.users (id)
    ON DELETE CASCADE,
  CONSTRAINT file_assets_audit_id_fkey
    FOREIGN KEY (audit_id)
    REFERENCES public.audits (id)
    ON DELETE SET NULL,
  CONSTRAINT file_assets_report_id_fkey
    FOREIGN KEY (report_id)
    REFERENCES public.reports (id)
    ON DELETE SET NULL,
  CONSTRAINT file_assets_recommendation_id_fkey
    FOREIGN KEY (recommendation_id)
    REFERENCES public.recommendations (id)
    ON DELETE SET NULL,
  CONSTRAINT file_assets_storage_key_not_blank
    CHECK (length(trim(storage_key)) > 0)
);

COMMENT ON TABLE public.file_assets IS
  'Queryable inventory of screenshots, annotations, and PDFs in object storage.';
