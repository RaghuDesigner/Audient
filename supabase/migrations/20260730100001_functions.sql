-- =============================================================================
-- Audient — Shared helper functions
-- =============================================================================

-- Auto-maintain updated_at on row updates.
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.set_updated_at() IS
  'Sets updated_at to UTC now() before UPDATE.';
