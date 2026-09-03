-- =============================================================================
-- Private Storage bucket for screenshot audit evidence.
-- Migration: 20260904000060_audit_uploads_storage.sql
--
-- Objects are not public. Access is service-role upload + short-lived signed URLs.
-- No client SELECT/INSERT policies on this bucket (default deny for anon/authenticated).
-- =============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'audit-uploads',
  'audit-uploads',
  false,
  6291456,
  ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET
  public = false,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

COMMENT ON COLUMN public.file_assets.storage_key IS
  'Object key in private bucket audit-uploads. Not a public URL.';
