CREATE TABLE IF NOT EXISTS public.filevine_project_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filevine_project_id text NOT NULL UNIQUE,
  project_name text,
  client_name text,
  project_type text,
  project_phase text,
  is_active boolean,
  matched_client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  matched_case_id uuid REFERENCES public.immigration_cases(id) ON DELETE SET NULL,
  match_type text,
  sync_source text NOT NULL DEFAULT 'api',
  processing_status text NOT NULL DEFAULT 'processed',
  error_message text,
  raw_payload jsonb,
  processed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_filevine_project_snapshots_status
  ON public.filevine_project_snapshots(processing_status);

CREATE INDEX IF NOT EXISTS idx_filevine_project_snapshots_client
  ON public.filevine_project_snapshots(matched_client_id);

CREATE INDEX IF NOT EXISTS idx_filevine_project_snapshots_case
  ON public.filevine_project_snapshots(matched_case_id);

ALTER TABLE public.filevine_project_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS filevine_project_snapshots_select ON public.filevine_project_snapshots;
CREATE POLICY filevine_project_snapshots_select
ON public.filevine_project_snapshots
FOR SELECT
TO authenticated
USING (public.current_user_role() IN ('admin', 'partner', 'billing_clerk'));

CREATE OR REPLACE FUNCTION public.admin_filevine_project_snapshot_summary()
RETURNS TABLE (
  total_projects bigint,
  linked_projects bigint,
  unmatched_projects bigint,
  linked_clients bigint,
  linked_cases bigint,
  latest_processed_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.current_user_role() NOT IN ('admin', 'partner', 'billing_clerk') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  SELECT
    COUNT(*)::bigint AS total_projects,
    COUNT(*) FILTER (WHERE matched_client_id IS NOT NULL OR matched_case_id IS NOT NULL)::bigint AS linked_projects,
    COUNT(*) FILTER (WHERE matched_client_id IS NULL AND matched_case_id IS NULL)::bigint AS unmatched_projects,
    COUNT(DISTINCT matched_client_id)::bigint AS linked_clients,
    COUNT(DISTINCT matched_case_id)::bigint AS linked_cases,
    MAX(processed_at) AS latest_processed_at
  FROM public.filevine_project_snapshots;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_filevine_project_snapshot_summary() TO authenticated;
