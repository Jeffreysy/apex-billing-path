
DROP POLICY IF EXISTS sync_anon_insert_collection_activities ON public.collection_activities;
DROP POLICY IF EXISTS sync_anon_select_collection_activities ON public.collection_activities;

DROP POLICY IF EXISTS sync_anon_insert_immigration_cases ON public.immigration_cases;
DROP POLICY IF EXISTS sync_anon_select_immigration_cases ON public.immigration_cases;
DROP POLICY IF EXISTS sync_anon_update_immigration_cases ON public.immigration_cases;

DROP POLICY IF EXISTS "Authenticated users can read hardship_requests" ON public.hardship_requests;
DROP POLICY IF EXISTS "Authenticated users can insert hardship_requests" ON public.hardship_requests;
DROP POLICY IF EXISTS "Authenticated users can update hardship_requests" ON public.hardship_requests;

CREATE POLICY hardship_requests_select ON public.hardship_requests
  FOR SELECT TO authenticated
  USING (public.is_active_user());

CREATE POLICY hardship_requests_insert ON public.hardship_requests
  FOR INSERT TO authenticated
  WITH CHECK (public.current_user_role() = ANY (ARRAY['admin'::user_role, 'partner'::user_role, 'attorney'::user_role, 'paralegal'::user_role, 'billing_clerk'::user_role]));

CREATE POLICY hardship_requests_update ON public.hardship_requests
  FOR UPDATE TO authenticated
  USING (public.current_user_role() = ANY (ARRAY['admin'::user_role, 'partner'::user_role, 'attorney'::user_role, 'paralegal'::user_role, 'billing_clerk'::user_role]))
  WITH CHECK (public.current_user_role() = ANY (ARRAY['admin'::user_role, 'partner'::user_role, 'attorney'::user_role, 'paralegal'::user_role, 'billing_clerk'::user_role]));

CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  caller_role public.user_role;
BEGIN
  caller_role := public.current_user_role();

  IF caller_role IN ('admin'::public.user_role, 'partner'::public.user_role) THEN
    RETURN NEW;
  END IF;

  IF NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'Only admins can change a user role';
  END IF;

  IF NEW.is_active IS DISTINCT FROM OLD.is_active THEN
    RAISE EXCEPTION 'Only admins can change account active status';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_profile_privilege_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_profile_privilege_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_privilege_escalation();

ALTER FUNCTION public.extract_case_number_from_text(text) SET search_path = public, pg_temp;
ALTER FUNCTION public.get_classified_monthly_collections(integer) SET search_path = public, pg_temp;
ALTER FUNCTION public.get_transaction_type_breakdown(date, date) SET search_path = public, pg_temp;
ALTER FUNCTION public.get_transactions_page(integer, integer, text, text, text, date, date) SET search_path = public, pg_temp;
