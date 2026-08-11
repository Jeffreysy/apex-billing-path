-- 1. Drop anonymous read policies on sensitive tables
DROP POLICY IF EXISTS anon_read_clients ON public.clients;
DROP POLICY IF EXISTS anon_read_contracts ON public.contracts;
DROP POLICY IF EXISTS anon_read_payments ON public.payments;
DROP POLICY IF EXISTS anon_read_lawpay_transactions ON public.lawpay_transactions;
DROP POLICY IF EXISTS lawpay_anon_select ON public.lawpay_transactions;
DROP POLICY IF EXISTS anon_read_client_source_links ON public.client_source_links;
DROP POLICY IF EXISTS anon_read_ar_source_snapshots ON public.ar_source_snapshots;

-- Ensure authenticated, active staff can still read these tables
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='client_source_links' AND cmd='SELECT') THEN
    EXECUTE 'CREATE POLICY client_source_links_select ON public.client_source_links FOR SELECT TO authenticated USING (public.is_active_user())';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='ar_source_snapshots' AND cmd='SELECT') THEN
    EXECUTE 'CREATE POLICY ar_source_snapshots_select ON public.ar_source_snapshots FOR SELECT TO authenticated USING (public.is_active_user())';
  END IF;
END $$;

-- 2. Revoke anon table privileges
REVOKE ALL ON public.clients FROM anon;
REVOKE ALL ON public.contracts FROM anon;
REVOKE ALL ON public.payments FROM anon;
REVOKE ALL ON public.lawpay_transactions FROM anon;
REVOKE ALL ON public.client_source_links FROM anon;
REVOKE ALL ON public.ar_source_snapshots FROM anon;

-- 3. Materialized views must not be exposed through the API
REVOKE ALL ON public.payments_clean_mv FROM anon, authenticated;
REVOKE ALL ON public.mv_queue_contact_coverage_monthly FROM anon, authenticated;

-- 4. Remove anonymous execute on all SECURITY DEFINER functions in public
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prosecdef AND p.prokind = 'f'
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon', r.sig);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', r.sig);
  END LOOP;
END $$;

-- Re-grant execute to authenticated users only for routines the app calls
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN (
        'is_active_user','current_user_role','get_aging_summary','get_legal_kpi',
        'get_classified_monthly_collections','get_transaction_type_breakdown','get_transactions_page',
        'admin_get_system_settings','admin_update_system_settings','admin_list_user_access',
        'admin_update_user_access','admin_log_user_access_event',
        'admin_filevine_case_reconciliation_candidates','admin_filevine_case_reconciliation_summary',
        'admin_filevine_project_snapshot_summary','admin_filevine_reconciliation_summary',
        'admin_lawpay_reconciliation_summary','admin_rematch_unmatched_lawpay',
        'match_hubspot_deals','promote_hubspot_case_won_deal','match_contract_by_normalized_name',
        'refresh_after_import','refresh_payments_clean_mv','rematch_invoice_payments',
        'rematch_upgrade_mycase_invoice'
      )
  LOOP
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated', r.sig);
  END LOOP;
END $$;