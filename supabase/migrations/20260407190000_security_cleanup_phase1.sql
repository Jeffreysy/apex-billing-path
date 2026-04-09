ALTER TABLE public.collection_activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_read_collection_activities" ON public.collection_activities;
DROP POLICY IF EXISTS "auth_insert_collection_activities" ON public.collection_activities;
DROP POLICY IF EXISTS "auth_update_collection_activities" ON public.collection_activities;
DROP POLICY IF EXISTS "sync_read_collection_activities" ON public.collection_activities;
DROP POLICY IF EXISTS "sync_update_collection_activities" ON public.collection_activities;

CREATE POLICY "collection_activities_select" ON public.collection_activities
  FOR SELECT USING (public.is_active_user());

CREATE POLICY "collection_activities_insert" ON public.collection_activities
  FOR INSERT WITH CHECK (public.current_user_role() = ANY (ARRAY['admin'::public.user_role, 'partner'::public.user_role, 'billing_clerk'::public.user_role]));

CREATE POLICY "collection_activities_update" ON public.collection_activities
  FOR UPDATE
  USING (public.current_user_role() = ANY (ARRAY['admin'::public.user_role, 'partner'::public.user_role, 'billing_clerk'::public.user_role]))
  WITH CHECK (public.current_user_role() = ANY (ARRAY['admin'::public.user_role, 'partner'::public.user_role, 'billing_clerk'::public.user_role]));

DROP POLICY IF EXISTS "auth_read_escalations" ON public.escalations;
DROP POLICY IF EXISTS "auth_insert_escalations" ON public.escalations;
DROP POLICY IF EXISTS "auth_update_escalations" ON public.escalations;

CREATE POLICY "escalations_select" ON public.escalations
  FOR SELECT USING (public.is_active_user());

CREATE POLICY "escalations_insert" ON public.escalations
  FOR INSERT WITH CHECK (public.current_user_role() = ANY (ARRAY['admin'::public.user_role, 'partner'::public.user_role, 'billing_clerk'::public.user_role]));

CREATE POLICY "escalations_update" ON public.escalations
  FOR UPDATE
  USING (public.current_user_role() = ANY (ARRAY['admin'::public.user_role, 'partner'::public.user_role, 'billing_clerk'::public.user_role]))
  WITH CHECK (public.current_user_role() = ANY (ARRAY['admin'::public.user_role, 'partner'::public.user_role, 'billing_clerk'::public.user_role]));

DROP POLICY IF EXISTS "auth_read_payment_commitments" ON public.payment_commitments;
DROP POLICY IF EXISTS "auth_insert_payment_commitments" ON public.payment_commitments;
DROP POLICY IF EXISTS "auth_update_payment_commitments" ON public.payment_commitments;

CREATE POLICY "payment_commitments_select" ON public.payment_commitments
  FOR SELECT USING (public.is_active_user());

CREATE POLICY "payment_commitments_insert" ON public.payment_commitments
  FOR INSERT WITH CHECK (public.current_user_role() = ANY (ARRAY['admin'::public.user_role, 'partner'::public.user_role, 'billing_clerk'::public.user_role]));

CREATE POLICY "payment_commitments_update" ON public.payment_commitments
  FOR UPDATE
  USING (public.current_user_role() = ANY (ARRAY['admin'::public.user_role, 'partner'::public.user_role, 'billing_clerk'::public.user_role]))
  WITH CHECK (public.current_user_role() = ANY (ARRAY['admin'::public.user_role, 'partner'::public.user_role, 'billing_clerk'::public.user_role]));

ALTER VIEW public.admin_kpi SET (security_invoker = true);
ALTER VIEW public.ar_dashboard SET (security_invoker = true);
ALTER VIEW public.collections_by_aging SET (security_invoker = true);
ALTER VIEW public.collections_dashboard SET (security_invoker = true);
ALTER VIEW public.collector_performance SET (security_invoker = true);
ALTER VIEW public.legal_kpi SET (security_invoker = true);
ALTER VIEW public.payments_clean SET (security_invoker = true);

ALTER FUNCTION public.current_user_role() SET search_path = public;
ALTER FUNCTION public.is_active_user() SET search_path = public;
ALTER FUNCTION public.get_aging_summary() SET search_path = public;
ALTER FUNCTION public.get_legal_kpi(integer) SET search_path = public;
ALTER FUNCTION public.lawpay_match_client(text, text) SET search_path = public;
ALTER FUNCTION public.call_lawpay_orchestrator(jsonb) SET search_path = public;
ALTER FUNCTION public.mark_overdue_invoices() SET search_path = public;
ALTER FUNCTION public.resolve_lawpay_unmatched_clients() SET search_path = public;
ALTER FUNCTION public.audit_trigger() SET search_path = public;
ALTER FUNCTION public.normalize_case_stage(text) SET search_path = public;
ALTER FUNCTION public.normalize_practice_area(text) SET search_path = public;
ALTER FUNCTION public.update_invoice_amount_paid() SET search_path = public;
ALTER FUNCTION public.update_trust_client_balance() SET search_path = public;
ALTER FUNCTION public.update_updated_at() SET search_path = public;
