-- =============================================================================
-- BACKEND-002 APPLY — Severity remap CRITICAL/HIGH/MEDIUM/LOW/INFO
-- Migration: 20260815000014_severity_remap.sql
--
-- Purpose: Replace MAJOR/MINOR with HIGH/MEDIUM; add LOW/INFO.
-- Data map: CRITICAL→CRITICAL, MAJOR→HIGH, MINOR→MEDIUM.
-- Note: DROP TYPE on the old enum is required after the column swap (type object
-- only — row data is rewritten via USING, not deleted).
-- Idempotent: no-op when public.severity already has the target labels.
-- =============================================================================

DO $$
DECLARE
  has_major BOOLEAN;
  has_high BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'severity'
      AND e.enumlabel = 'MAJOR'
  ) INTO has_major;

  SELECT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'severity'
      AND e.enumlabel = 'HIGH'
  ) INTO has_high;

  -- Already remapped (or fresh target): skip.
  IF has_high AND NOT has_major THEN
    RAISE NOTICE 'severity already CRITICAL/HIGH/MEDIUM/LOW/INFO — skipping remap';
    RETURN;
  END IF;

  -- 1) New enum
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'severity_v2'
  ) THEN
    CREATE TYPE public.severity_v2 AS ENUM (
      'CRITICAL',
      'HIGH',
      'MEDIUM',
      'LOW',
      'INFO'
    );
  END IF;

  -- 2) Swap recommendations.severity (preserves rows; remaps labels)
  ALTER TABLE public.recommendations
    ALTER COLUMN severity DROP DEFAULT;

  ALTER TABLE public.recommendations
    ALTER COLUMN severity TYPE public.severity_v2
    USING (
      CASE severity::text
        WHEN 'CRITICAL' THEN 'CRITICAL'::public.severity_v2
        WHEN 'MAJOR' THEN 'HIGH'::public.severity_v2
        WHEN 'MINOR' THEN 'MEDIUM'::public.severity_v2
        WHEN 'HIGH' THEN 'HIGH'::public.severity_v2
        WHEN 'MEDIUM' THEN 'MEDIUM'::public.severity_v2
        WHEN 'LOW' THEN 'LOW'::public.severity_v2
        WHEN 'INFO' THEN 'INFO'::public.severity_v2
        ELSE 'MEDIUM'::public.severity_v2
      END
    );

  -- 3) Drop obsolete enum type object and rename (no table TRUNCATE/DELETE)
  DROP TYPE public.severity;
  ALTER TYPE public.severity_v2 RENAME TO severity;
END $$;

COMMENT ON TYPE public.severity IS
  'Finding severity: CRITICAL | HIGH | MEDIUM | LOW | INFO (MAJOR→HIGH, MINOR→MEDIUM).';
