DROP POLICY IF EXISTS "auth_read_billing_rates" ON public.billing_rates;
DROP POLICY IF EXISTS "auth_read_clients" ON public.clients;
DROP POLICY IF EXISTS "auth_read_custom_field_definitions" ON public.custom_field_definitions;
DROP POLICY IF EXISTS "auth_read_firm_settings" ON public.firm_settings;
DROP POLICY IF EXISTS "auth_read_import_jobs" ON public.import_jobs;
DROP POLICY IF EXISTS "auth_read_invoice_line_items" ON public.invoice_line_items;
DROP POLICY IF EXISTS "auth_read_invoices" ON public.invoices;
DROP POLICY IF EXISTS "auth_read_matters" ON public.matters;
DROP POLICY IF EXISTS "auth_read_payment_allocations" ON public.payment_allocations;
DROP POLICY IF EXISTS "auth_read_payments" ON public.payments;
DROP POLICY IF EXISTS "auth_read_profiles" ON public.profiles;
DROP POLICY IF EXISTS "auth_read_trust_accounts" ON public.trust_accounts;
DROP POLICY IF EXISTS "auth_read_trust_client_balances" ON public.trust_client_balances;
DROP POLICY IF EXISTS "auth_read_trust_reconciliations" ON public.trust_reconciliations;
DROP POLICY IF EXISTS "auth_read_trust_transactions" ON public.trust_transactions;
DROP POLICY IF EXISTS "auth_read_utbms_codes" ON public.utbms_codes;

DROP POLICY IF EXISTS "auth_read_immigration_cases" ON public.immigration_cases;
DROP POLICY IF EXISTS "auth_read_collection_activities" ON public.collection_activities;

DROP POLICY IF EXISTS "sync_read_immigration_cases" ON public.immigration_cases;
DROP POLICY IF EXISTS "sync_insert_immigration_cases" ON public.immigration_cases;
DROP POLICY IF EXISTS "sync_update_immigration_cases" ON public.immigration_cases;

CREATE POLICY "immigration_cases_select" ON public.immigration_cases
  FOR SELECT USING (public.is_active_user());

CREATE POLICY "immigration_cases_insert" ON public.immigration_cases
  FOR INSERT WITH CHECK (public.current_user_role() = ANY (ARRAY['admin'::public.user_role, 'partner'::public.user_role, 'attorney'::public.user_role, 'paralegal'::public.user_role, 'billing_clerk'::public.user_role]));

CREATE POLICY "immigration_cases_update" ON public.immigration_cases
  FOR UPDATE
  USING (public.current_user_role() = ANY (ARRAY['admin'::public.user_role, 'partner'::public.user_role, 'attorney'::public.user_role, 'paralegal'::public.user_role, 'billing_clerk'::public.user_role]))
  WITH CHECK (public.current_user_role() = ANY (ARRAY['admin'::public.user_role, 'partner'::public.user_role, 'attorney'::public.user_role, 'paralegal'::public.user_role, 'billing_clerk'::public.user_role]));
