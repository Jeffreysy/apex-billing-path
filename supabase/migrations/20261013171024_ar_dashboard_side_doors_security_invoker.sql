-- VP (supabase-auditor) 2026-10-13 - SECURITY: close the ar_dashboard "side doors" (Jeff: "push the dashboard changes and close the side doors").
-- Follow-up to cert 640ed64c (ar_dashboard security_invoker restored) and e7a276a4 (v_firm_financial_summary writes revoked).
--
-- Finding (VP sweep, re-verified live 2026-10-13 before this migration, persona probes as role authenticated):
--   admin_kpi, v_ar_identity_split_invoices, v_ar_live_movement, v_card_recovery_lanes, v_hubspot_collections_segments
--   run with OWNER (postgres, BYPASSRLS) rights - and so do the 9 owner-rights views nested under them:
--   ar_client_detail, payments_clean, v_ar_active_snapshot, v_ar_data_excel_mirror, v_collector_contact_card,
--   v_controller_automation_clients, v_ar_active_rows_v2, v_ar_invoice_clock, v_ar_active_rows.
--   Flipping only the outer 5 would NOT close the door (an invoker view that reads an owner-rights view still bypasses RLS
--   through it), so all 14 are flipped together.
--   Proven before: a DEACTIVATED admin and a JWT with NO profile read e.g. ar_client_detail 9,054 rows, payments_clean 22,617,
--   v_card_recovery_lanes 896, v_hubspot_collections_segments 2,343, v_ar_invoice_clock 3,924; admin_kpi still returned
--   collected_this_month $103,835.00 and v_ar_live_movement baseline_ar $17,502,885.52.
--   contracts, lawpay_transactions (auth.uid() IS NOT NULL) and mycase_payment_plans (true) also admitted ANY login directly.
--
-- This migration (one transaction):
--  1. RLS: wraps 7 active-user read predicates in (select ...) (initplan, semantics identical); TIGHTENS 3 any-login read
--     policies to active-only (contracts, lawpay_transactions, mycase_payment_plans); ADDS active-only read policies to 4
--     tables that had RLS on but NO policy (payments_history, mycase_transactions_rich, client_duplicate_merge_audit,
--     mycase_plans_scraped_20260708) - without these, invoker mode would zero those legs for ACTIVE staff too.
--  2. Rebuilds payments_clean and v_collector_contact_card from their LIVE definitions WITH (security_invoker = true), adding
--     only deterministic tiebreakers to their DISTINCT ON picks (pre-existing defect: which tied row won was plan-dependent;
--     the invoker flip changed the plan and moved 27 payment rows' contract columns / 133 contact-card rows' phone/email).
--  3. ALTER VIEW ... SET (security_invoker = true) on the other 12 (definition untouched). All 14 are sha256-guarded
--     against definition drift since VP measurement.
--  4. Revokes every non-SELECT privilege from authenticated and everything from anon on these 14 + the 3 downstream
--     invoker views (v_ar_client_days_aged, v_ar_invoice_clock_net, v_ar_writeoff_summary).
--  5. Revokes EXECUTE from anon/authenticated/PUBLIC on 3 SECURITY DEFINER functions over this tree that any login could call
--     (capture_ar_live_trend writes ar_live_trend; refresh_ar_invoice_clock / refresh_payments_clean_mv run owner refreshes).
--     Callers verified: pg_cron (postgres), the DSN-based scheduled script, payment-received edge fn (service_role) - all kept.
--  6. Writes the certification row (before_sql + generated rollback_sql) to ddl_migration_audit.
-- RULE GOING FORWARD: every rebuild of any of these views MUST say CREATE OR REPLACE VIEW ... WITH (security_invoker = true).
-- The watchman (v_view_security_health, next migration) alerts if one regresses.

set local lock_timeout = '5s';

-- 1. RLS ------------------------------------------------------------------------------------------------------------------
alter policy ar_source_snapshots_select on public.ar_source_snapshots using ((select public.is_active_user()));
alter policy collection_activities_select on public.collection_activities using ((select public.is_active_user()));
alter policy mycase_cases_active_read on public.mycase_cases using ((select public.is_active_user()));
alter policy mycase_contacts_active_read on public.mycase_contacts using ((select public.is_active_user()));
alter policy mycase_invoices_active_read on public.mycase_invoices using ((select public.is_active_user()));
alter policy mycase_txn_history_active_read on public.mycase_transaction_history using ((select public.is_active_user()));
alter policy payments_select on public.payments using ((select public.is_active_user()));
alter policy auth_read_contracts on public.contracts using ((select public.is_active_user()));
alter policy "Authenticated reads on lawpay_transactions" on public.lawpay_transactions using ((select public.is_active_user()));
alter policy "Auth users can view payment plans" on public.mycase_payment_plans using ((select public.is_active_user()));
create policy payments_history_active_read on public.payments_history for select to authenticated using ((select public.is_active_user()));
create policy mycase_transactions_rich_active_read on public.mycase_transactions_rich for select to authenticated using ((select public.is_active_user()));
create policy client_duplicate_merge_audit_active_read on public.client_duplicate_merge_audit for select to authenticated using ((select public.is_active_user()));
create policy mycase_plans_scraped_20260708_active_read on public.mycase_plans_scraped_20260708 for select to authenticated using ((select public.is_active_user()));

-- 2-3, 6. views + certification -------------------------------------------------------------------------------------------
do $$
declare
  v_expected jsonb := '{
    "admin_kpi":"ce4d393b3ebf89e569d89ba148c60b84a929ae6014d1bc3fd572c49861c83f40",
    "v_ar_identity_split_invoices":"9eb0eeb7e2abf1a005756f6a6f0553ce8a4a974f5d11073b4314bfb30d503881",
    "v_ar_live_movement":"7f7764fc93f119bfc2fca62267b76bbba8027b8e0464382089ae64836b7343a0",
    "v_card_recovery_lanes":"051e1b00e9badd8ff409ef43965e851b3ec8700d6f7bf12537e5179f3b2fd9e1",
    "v_hubspot_collections_segments":"2b4dffb85b44a52b8b4d986dc1a2a0be781c39d2d0e6a7d86f21961145353953",
    "ar_client_detail":"ed11e3c3d16b545c12a6a1c7aba9ee1dbf9d2a374dd6c766ec718ce1bc561ed0",
    "payments_clean":"acb17dd1c103c44706bcb8354ddd485ac3d70874f98f2423d1e1bb7afec073e7",
    "v_ar_active_snapshot":"c5c3ce19cdab4af7a7399c3a5a6396189745cb77e9f10b302cdce254af0edb0a",
    "v_ar_data_excel_mirror":"7959d3bd438f03356f244d012ebfecf8d2c8b0a0909319e124d2d69ee890cf92",
    "v_collector_contact_card":"11fdd685571175b56a1da3eb138c9e4e95dc4a2bce2da09e9494bacb3a2ad997",
    "v_controller_automation_clients":"005e5fa1aaf6aa9249d070b371c07a178f77c26810c5750ba91a46b3acebf187",
    "v_ar_active_rows_v2":"1729c03960ff67ea8e16eb5bea92a582a64f3c4c765e2eecf09089b5a3c80744",
    "v_ar_invoice_clock":"0884d5076574c7bdf8b3ee0f2c5e5734db8d4494211ec19596f6f9cdb64747fd",
    "v_ar_active_rows":"6f891424e2d062806af53e787c2b2231f47ccc8a7af7ae05b8454ba02fc22e54"}'::jsonb;
  v_name text; v_sha text; v_def text; v_new text;
  v_before_defs jsonb := '{}'::jsonb; v_before_shas jsonb := '{}'::jsonb; v_before_acl jsonb := '{}'::jsonb;
  v_after_shas jsonb := '{}'::jsonb;
  -- tiebreak tokens
  pc_old text := 'ORDER BY contracts.client_id, contracts.created_at DESC';
  pc_new text := 'ORDER BY contracts.client_id, contracts.created_at DESC, contracts.updated_at DESC NULLS LAST, contracts.id';
  cc_id_old text := 'WHERE mycase_contacts.matched_client_id IS NOT NULL';
  cc_id_new text := 'WHERE mycase_contacts.matched_client_id IS NOT NULL'
                    || chr(10) || '          ORDER BY mycase_contacts.matched_client_id, mycase_contacts.updated_at DESC NULLS LAST, mycase_contacts.id';
  cc_nm_old text := 'WHERE mycase_contacts.full_name IS NOT NULL';
  cc_nm_new text := 'WHERE mycase_contacts.full_name IS NOT NULL'
                    || chr(10) || '          ORDER BY (lower(TRIM(BOTH FROM mycase_contacts.full_name))), mycase_contacts.updated_at DESC NULLS LAST, mycase_contacts.id';
  v_rollback text := '-- ROLLBACK (re-opens the owner-rights side doors; use only to unbreak the app):' || chr(10);
  v_acl text; v_priv text;
  v_downstream text[] := array['v_ar_client_days_aged','v_ar_invoice_clock_net','v_ar_writeoff_summary'];
  function_cnt int;
begin
  -- guard + capture
  for v_name in select jsonb_object_keys(v_expected) loop
    v_def := pg_get_viewdef(('public.'||v_name)::regclass, true);
    v_sha := encode(sha256(convert_to(v_def,'UTF8')),'hex');
    if v_sha <> v_expected->>v_name then
      raise exception '% definition drifted since VP measurement (sha %); re-verify before applying', v_name, v_sha;
    end if;
    if exists (select 1 from pg_class where oid=('public.'||v_name)::regclass and reloptions is not null) then
      raise exception '% already has reloptions %; re-verify', v_name, (select reloptions from pg_class where oid=('public.'||v_name)::regclass);
    end if;
    v_before_defs := v_before_defs || jsonb_build_object(v_name, v_def);
    v_before_shas := v_before_shas || jsonb_build_object(v_name, v_sha);
  end loop;
  for v_name in select unnest(array(select jsonb_object_keys(v_expected)) || v_downstream) loop
    select relacl::text into v_acl from pg_class where oid=('public.'||v_name)::regclass;
    v_before_acl := v_before_acl || jsonb_build_object(v_name, v_acl);
  end loop;

  -- 2. rebuild the two tiebreak views
  v_def := v_before_defs->>'payments_clean';
  if (length(v_def) - length(replace(v_def, pc_old, ''))) / length(pc_old) <> 1 then
    raise exception 'payments_clean: expected exactly one fallback_contract ORDER BY token';
  end if;
  execute 'create or replace view public.payments_clean with (security_invoker = true) as ' || replace(v_def, pc_old, pc_new);

  v_def := v_before_defs->>'v_collector_contact_card';
  if (length(v_def) - length(replace(v_def, cc_id_old, ''))) / length(cc_id_old) <> 1
     or (length(v_def) - length(replace(v_def, cc_nm_old, ''))) / length(cc_nm_old) <> 1 then
    raise exception 'v_collector_contact_card: expected exactly one by_id and one by_name WHERE token';
  end if;
  if position('ORDER BY' in v_def) > 0 then
    raise exception 'v_collector_contact_card already has an ORDER BY; re-verify';
  end if;
  v_new := replace(replace(v_def, cc_id_old, cc_id_new), cc_nm_old, cc_nm_new);
  execute 'create or replace view public.v_collector_contact_card with (security_invoker = true) as ' || v_new;

  -- 3. flip the other 12 (definition untouched)
  for v_name in select jsonb_object_keys(v_expected) loop
    if v_name not in ('payments_clean','v_collector_contact_card') then
      execute format('alter view public.%I set (security_invoker = true)', v_name);
      if encode(sha256(convert_to(pg_get_viewdef(('public.'||v_name)::regclass, true),'UTF8')),'hex') <> v_expected->>v_name then
        raise exception '% definition changed by ALTER VIEW SET (should be impossible)', v_name;
      end if;
    end if;
    if not exists (select 1 from pg_class where oid=('public.'||v_name)::regclass and 'security_invoker=true' = any(reloptions)) then
      raise exception '% security_invoker not set', v_name;
    end if;
    v_after_shas := v_after_shas || jsonb_build_object(v_name, encode(sha256(convert_to(pg_get_viewdef(('public.'||v_name)::regclass, true),'UTF8')),'hex'));
  end loop;

  -- rollback text: definitions, reloptions, grants, policies, functions
  v_rollback := v_rollback
    || 'create or replace view public.payments_clean as ' || (v_before_defs->>'payments_clean') || chr(10)
    || 'create or replace view public.v_collector_contact_card as ' || (v_before_defs->>'v_collector_contact_card') || chr(10);
  for v_name in select jsonb_object_keys(v_expected) loop
    v_rollback := v_rollback || format('alter view public.%I reset (security_invoker);', v_name) || chr(10);
  end loop;
  for v_name in select jsonb_object_keys(v_before_acl) loop
    v_acl := v_before_acl->>v_name;
    v_priv := substring(v_acl from 'authenticated=([a-zA-Z]*)/');
    if v_priv is not null then
      v_rollback := v_rollback || format('grant %s on public.%I to authenticated;',
        array_to_string(array_remove(array[
          case when v_priv like '%r%' then 'select' end, case when v_priv like '%a%' then 'insert' end,
          case when v_priv like '%w%' then 'update' end, case when v_priv like '%d%' then 'delete' end,
          case when v_priv like '%D%' then 'truncate' end, case when v_priv like '%x%' then 'references' end,
          case when v_priv like '%t%' then 'trigger' end, case when v_priv like '%m%' then 'maintain' end], null), ', '),
        v_name) || chr(10);
    end if;
  end loop;
  v_rollback := v_rollback
    || 'alter policy ar_source_snapshots_select on public.ar_source_snapshots using (is_active_user());' || chr(10)
    || 'alter policy collection_activities_select on public.collection_activities using (is_active_user());' || chr(10)
    || 'alter policy mycase_cases_active_read on public.mycase_cases using (is_active_user());' || chr(10)
    || 'alter policy mycase_contacts_active_read on public.mycase_contacts using (is_active_user());' || chr(10)
    || 'alter policy mycase_invoices_active_read on public.mycase_invoices using (is_active_user());' || chr(10)
    || 'alter policy mycase_txn_history_active_read on public.mycase_transaction_history using (is_active_user());' || chr(10)
    || 'alter policy payments_select on public.payments using (is_active_user());' || chr(10)
    || 'alter policy auth_read_contracts on public.contracts using (((select auth.uid()) is not null));' || chr(10)
    || 'alter policy "Authenticated reads on lawpay_transactions" on public.lawpay_transactions using (((select auth.uid()) is not null));' || chr(10)
    || 'alter policy "Auth users can view payment plans" on public.mycase_payment_plans using (true);' || chr(10)
    || 'drop policy payments_history_active_read on public.payments_history;' || chr(10)
    || 'drop policy mycase_transactions_rich_active_read on public.mycase_transactions_rich;' || chr(10)
    || 'drop policy client_duplicate_merge_audit_active_read on public.client_duplicate_merge_audit;' || chr(10)
    || 'drop policy mycase_plans_scraped_20260708_active_read on public.mycase_plans_scraped_20260708;' || chr(10)
    || 'grant execute on function public.capture_ar_live_trend() to authenticated;' || chr(10)
    || 'grant execute on function public.refresh_ar_invoice_clock() to authenticated;' || chr(10)
    || 'grant execute on function public.refresh_payments_clean_mv() to authenticated;';

  insert into public.ddl_migration_audit
    (migration_key, object_kind, affected_objects, issue, root_cause, implementation_summary, migration_file,
     before_fn_sha256, after_fn_sha256, before_sql, rollback_sql, before_evidence, status_gate_unchanged,
     anchor_snapshot_id, anchor_snapshot_date, applied_by, notes)
  select
    'vp_20261013_ar_dashboard_side_doors_security_invoker',
    'view security_invoker x14 (2 rebuilt w/ deterministic tiebreak) + grant revoke x17 + RLS policy wrap x7 / tighten x3 / add x4 + function EXECUTE revoke x3 (DDL)',
    array['public.admin_kpi','public.v_ar_identity_split_invoices','public.v_ar_live_movement','public.v_card_recovery_lanes',
          'public.v_hubspot_collections_segments','public.ar_client_detail','public.payments_clean','public.v_ar_active_snapshot',
          'public.v_ar_data_excel_mirror','public.v_collector_contact_card','public.v_controller_automation_clients',
          'public.v_ar_active_rows_v2','public.v_ar_invoice_clock','public.v_ar_active_rows',
          'public.v_ar_client_days_aged','public.v_ar_invoice_clock_net','public.v_ar_writeoff_summary',
          'public.ar_source_snapshots','public.collection_activities','public.mycase_cases','public.mycase_contacts',
          'public.mycase_invoices','public.mycase_transaction_history','public.payments','public.contracts',
          'public.lawpay_transactions','public.mycase_payment_plans','public.payments_history','public.mycase_transactions_rich',
          'public.client_duplicate_merge_audit','public.mycase_plans_scraped_20260708',
          'public.capture_ar_live_trend()','public.refresh_ar_invoice_clock()','public.refresh_payments_clean_mv()'],
    '5 views built on ar_dashboard (admin_kpi, v_ar_identity_split_invoices, v_ar_live_movement, v_card_recovery_lanes, v_hubspot_collections_segments) and the 9 owner-rights views nested under them read with OWNER (postgres, BYPASSRLS) rights: deactivated admins and profile-less JWTs read their full contents while the JWT lived. authenticated also held INSERT/UPDATE/DELETE/TRUNCATE/TRIGGER/MAINTAIN on 10 of them. contracts/lawpay_transactions/mycase_payment_plans admitted any login. 3 SECURITY DEFINER functions over the tree were executable by any login.',
    'Views created without WITH (security_invoker = true) default to owner rights; Supabase default privileges grant ALL on new relations to authenticated. 640ed64c closed ar_dashboard itself but its dependents were left owner-rights (flagged, not changed in that pass).',
    'All 14 views set security_invoker=true (12 via ALTER VIEW SET, definition untouched; payments_clean + v_collector_contact_card rebuilt from live def adding only deterministic DISTINCT ON tiebreakers updated_at DESC NULLS LAST, id). authenticated keeps SELECT only; anon nothing. RLS: 7 predicates initplan-wrapped, 3 any-login policies tightened to (select is_active_user()), 4 RLS-on-no-policy tables given active-only read policies. EXECUTE revoked from anon/authenticated on 3 definer functions (service_role kept).',
    'apex-billing-path/supabase/migrations/<applied version>_ar_dashboard_side_doors_security_invoker.sql (file sha in VERIFY row)',
    v_before_shas::text,
    v_after_shas::text,
    v_before_defs::text,
    v_rollback,
    jsonb_build_object('before_acl', v_before_acl, 'probe_summary', 'see VERIFY row before/after table (persona probes run off-migration, pg8000 shim, 2026-10-13)'),
    true,
    s.snapshot_id, s.snapshot_date,
    'supabase-auditor (VP)',
    'Jeff 2026-10-13: "push the dashboard changes and close the side doors". Remaining owner-rights views (the rest of the 343-view sweep) tracked by v_view_security_health baseline.'
  from public.v_ar_active_snapshot s;
end $$;

-- 4. grants ---------------------------------------------------------------------------------------------------------------
revoke insert, update, delete, truncate, references, trigger, maintain on
  public.admin_kpi, public.v_ar_identity_split_invoices, public.v_ar_live_movement, public.v_card_recovery_lanes,
  public.v_hubspot_collections_segments, public.ar_client_detail, public.payments_clean, public.v_ar_active_snapshot,
  public.v_ar_data_excel_mirror, public.v_collector_contact_card, public.v_controller_automation_clients,
  public.v_ar_active_rows_v2, public.v_ar_invoice_clock, public.v_ar_active_rows,
  public.v_ar_client_days_aged, public.v_ar_invoice_clock_net, public.v_ar_writeoff_summary
  from authenticated;
revoke all on
  public.admin_kpi, public.v_ar_identity_split_invoices, public.v_ar_live_movement, public.v_card_recovery_lanes,
  public.v_hubspot_collections_segments, public.ar_client_detail, public.payments_clean, public.v_ar_active_snapshot,
  public.v_ar_data_excel_mirror, public.v_collector_contact_card, public.v_controller_automation_clients,
  public.v_ar_active_rows_v2, public.v_ar_invoice_clock, public.v_ar_active_rows,
  public.v_ar_client_days_aged, public.v_ar_invoice_clock_net, public.v_ar_writeoff_summary
  from anon;
grant select on
  public.admin_kpi, public.v_ar_identity_split_invoices, public.v_ar_live_movement, public.v_card_recovery_lanes,
  public.v_hubspot_collections_segments, public.ar_client_detail, public.payments_clean, public.v_ar_active_snapshot,
  public.v_ar_data_excel_mirror, public.v_collector_contact_card, public.v_controller_automation_clients,
  public.v_ar_active_rows_v2, public.v_ar_invoice_clock, public.v_ar_active_rows,
  public.v_ar_client_days_aged, public.v_ar_invoice_clock_net, public.v_ar_writeoff_summary
  to authenticated;

-- 5. definer functions ----------------------------------------------------------------------------------------------------
revoke execute on function public.capture_ar_live_trend() from public, anon, authenticated;
revoke execute on function public.refresh_ar_invoice_clock() from public, anon, authenticated;
revoke execute on function public.refresh_payments_clean_mv() from public, anon, authenticated;
grant execute on function public.capture_ar_live_trend() to service_role;
grant execute on function public.refresh_ar_invoice_clock() to service_role;
grant execute on function public.refresh_payments_clean_mv() to service_role;
