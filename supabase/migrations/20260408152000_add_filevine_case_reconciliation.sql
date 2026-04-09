CREATE OR REPLACE FUNCTION public.normalize_name_key(raw_name text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT trim(
    regexp_replace(
      lower(
        regexp_replace(
          replace(replace(coalesce(raw_name, ''), ',', ' '), '.', ' '),
          '\s+',
          ' ',
          'g'
        )
      ),
      '[^a-z0-9 ]',
      '',
      'g'
    )
  );
$$;

CREATE OR REPLACE FUNCTION public.admin_filevine_case_reconciliation_summary()
RETURNS TABLE (
  filevine_clients bigint,
  filevine_cases bigint,
  project_id_matches bigint,
  cases_missing_client_link bigint,
  clients_missing_case_link bigint,
  exact_name_matches bigint,
  unique_filevine_projects bigint,
  filevine_projects_without_match bigint
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
  WITH clients_fv AS (
    SELECT id, filevine_project_id, public.normalize_name_key(name) AS name_key
    FROM public.clients
    WHERE filevine_project_id IS NOT NULL
  ),
  cases_fv AS (
    SELECT id, client_id, filevine_project_id, public.normalize_name_key(case_name) AS name_key
    FROM public.immigration_cases
    WHERE filevine_project_id IS NOT NULL
  ),
  project_matches AS (
    SELECT DISTINCT c.id AS client_id, ic.id AS case_id, c.filevine_project_id
    FROM clients_fv c
    JOIN cases_fv ic
      ON c.filevine_project_id = ic.filevine_project_id
  ),
  exact_name_matches AS (
    SELECT DISTINCT ic.id AS case_id
    FROM cases_fv ic
    JOIN public.clients c
      ON ic.name_key <> ''
     AND ic.name_key = public.normalize_name_key(c.name)
  ),
  unmatched_projects AS (
    SELECT DISTINCT ic.filevine_project_id
    FROM cases_fv ic
    LEFT JOIN clients_fv c
      ON c.filevine_project_id = ic.filevine_project_id
    WHERE c.id IS NULL
  )
  SELECT
    (SELECT COUNT(*)::bigint FROM clients_fv),
    (SELECT COUNT(*)::bigint FROM cases_fv),
    (SELECT COUNT(*)::bigint FROM project_matches),
    (SELECT COUNT(*)::bigint FROM cases_fv WHERE client_id IS NULL),
    (SELECT COUNT(*)::bigint FROM clients_fv c LEFT JOIN cases_fv ic ON c.filevine_project_id = ic.filevine_project_id WHERE ic.id IS NULL),
    (SELECT COUNT(*)::bigint FROM exact_name_matches),
    (SELECT COUNT(DISTINCT filevine_project_id)::bigint FROM cases_fv),
    (SELECT COUNT(*)::bigint FROM unmatched_projects);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_filevine_case_reconciliation_candidates(p_limit integer DEFAULT 100)
RETURNS TABLE (
  match_type text,
  filevine_project_id text,
  case_id uuid,
  case_name text,
  case_client_id uuid,
  client_id uuid,
  client_name text,
  contract_id uuid,
  contract_invoice_number text
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
  WITH cases_fv AS (
    SELECT
      ic.id,
      ic.case_name,
      ic.client_id,
      ic.filevine_project_id,
      public.normalize_name_key(ic.case_name) AS name_key
    FROM public.immigration_cases ic
    WHERE ic.filevine_project_id IS NOT NULL
  ),
  clients_base AS (
    SELECT
      c.id,
      c.name,
      c.filevine_project_id,
      public.normalize_name_key(c.name) AS name_key
    FROM public.clients c
  ),
  project_id_candidates AS (
    SELECT
      'project_id'::text AS match_type,
      ic.filevine_project_id,
      ic.id AS case_id,
      ic.case_name,
      ic.client_id AS case_client_id,
      c.id AS client_id,
      c.name AS client_name
    FROM cases_fv ic
    JOIN clients_base c
      ON ic.filevine_project_id = c.filevine_project_id
  ),
  exact_name_candidates AS (
    SELECT
      'exact_name'::text AS match_type,
      ic.filevine_project_id,
      ic.id AS case_id,
      ic.case_name,
      ic.client_id AS case_client_id,
      c.id AS client_id,
      c.name AS client_name
    FROM cases_fv ic
    JOIN clients_base c
      ON ic.name_key <> ''
     AND ic.name_key = c.name_key
    WHERE NOT EXISTS (
      SELECT 1
      FROM project_id_candidates pm
      WHERE pm.case_id = ic.id
        AND pm.client_id = c.id
    )
  ),
  combined AS (
    SELECT * FROM project_id_candidates
    UNION ALL
    SELECT * FROM exact_name_candidates
  )
  SELECT
    combined.match_type,
    combined.filevine_project_id,
    combined.case_id,
    combined.case_name,
    combined.case_client_id,
    combined.client_id,
    combined.client_name,
    ct.id AS contract_id,
    ct.invoice_number AS contract_invoice_number
  FROM combined
  LEFT JOIN LATERAL (
    SELECT c.id, c.invoice_number
    FROM public.contracts c
    WHERE c.client_id = combined.client_id
    ORDER BY c.created_at DESC NULLS LAST
    LIMIT 1
  ) ct ON true
  ORDER BY
    CASE combined.match_type WHEN 'project_id' THEN 0 ELSE 1 END,
    combined.filevine_project_id NULLS LAST,
    combined.case_name
  LIMIT GREATEST(COALESCE(p_limit, 100), 1);
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_filevine_case_reconciliation_summary() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_filevine_case_reconciliation_candidates(integer) TO authenticated;
