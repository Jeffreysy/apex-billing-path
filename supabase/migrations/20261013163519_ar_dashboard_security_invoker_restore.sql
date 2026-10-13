-- VP (supabase-auditor) 2026-10-13 - SECURITY: restore security_invoker on public.ar_dashboard + strip write grants.
-- Finding (LexCollect app agent, VP-verified): ar_dashboard had reloptions = NULL, so it read its base tables with OWNER
-- (postgres, BYPASSRLS) rights. Proven before this fix as role authenticated: a DEACTIVATED admin and a JWT with NO
-- profile both read all 3,924 rows / $17,502,885.52 while the same sessions read 0 rows from ar_source_rows directly.
-- authenticated also held INSERT/UPDATE/DELETE/TRUNCATE/REFERENCES/TRIGGER (view is not updatable; TRIGGER was the latent path).
-- Root cause: 20260407190000 set security_invoker=true; 20260411120000 DROP+CREATEd the view without it, and every later
-- rebuild (incl. 20260520153047 and 20261013154138) used CREATE OR REPLACE VIEW with no WITH clause, which resets reloptions.
-- RULE GOING FORWARD: every rebuild of this view MUST say
--   CREATE OR REPLACE VIEW public.ar_dashboard WITH (security_invoker = true) AS ...
--
-- This migration:
--  1. Wraps the 6 RLS read predicates the view depends on in (select ...) so they evaluate once per query, not once
--     per row. Semantics identical (STABLE, no row reference). Without this, invoker mode measured ~5.5x slower.
--  2. Re-creates the view from its LIVE definition WITH (security_invoker = true), changing exactly one token:
--     latest_case DISTINCT ON gets a deterministic tiebreaker (updated_at DESC NULLS LAST, id). Pre-existing defect:
--     99 clients have tied "latest" cases with different case_stage/lead_attorney (106 rows); which one showed was
--     plan-dependent and the invoker flip changed the plan (48 rows flipped in dry run). Display columns only; no $ column.
--     contract_id determinism (cert 9631381d) is untouched (guarded below).
--  3. Revokes every non-SELECT privilege from anon + authenticated; anon keeps nothing; authenticated keeps SELECT.
--  4. Writes the certification row (before_sql + rollback_sql) to ddl_migration_audit in the same transaction.

alter policy ar_source_rows_active_read on public.ar_source_rows using ((select public.is_active_user()));
alter policy client_source_links_select on public.client_source_links using ((select public.is_active_user()));
alter policy clients_select on public.clients using ((select public.is_active_user()));
alter policy immigration_cases_select on public.immigration_cases using ((select public.is_active_user()));
alter policy auth_read_contracts on public.contracts using (((select auth.uid()) is not null));
alter policy "Authenticated reads on lawpay_transactions" on public.lawpay_transactions using (((select auth.uid()) is not null));

do $$
declare
  v_def  text;
  v_new  text;
  v_old_tok text := 'ORDER BY immigration_cases.client_id, immigration_cases.is_closed, immigration_cases.open_date DESC NULLS LAST';
  v_new_tok text := 'ORDER BY immigration_cases.client_id, immigration_cases.is_closed, immigration_cases.open_date DESC NULLS LAST, immigration_cases.updated_at DESC NULLS LAST, immigration_cases.id';
  v_before_sha text;
  v_rows bigint; v_cids bigint; v_rem numeric; v_col numeric;
  v_rollback text;
begin
  v_def := pg_get_viewdef('public.ar_dashboard'::regclass, true);
  v_before_sha := encode(sha256(convert_to(v_def,'UTF8')),'hex');
  if v_before_sha <> 'fb7667ce5ac8eb301e79c51a40ab88a680b66019fa0fab1ef3299462bb1a6acb' then
    raise exception 'ar_dashboard definition drifted since VP measurement (sha %); re-verify before applying', v_before_sha;
  end if;
  if (length(v_def) - length(replace(v_def, v_old_tok, ''))) / length(v_old_tok) <> 1 then
    raise exception 'expected exactly one latest_case ORDER BY token in ar_dashboard';
  end if;
  if position('md5(''ar_dashboard:''::text' in v_def) = 0 then
    raise exception 'deterministic contract_id (cert 9631381d) not present; refusing to rebuild';
  end if;

  select count(*), count(distinct contract_id), round(sum(remaining_balance),2), round(sum(amount_collected),2)
    into v_rows, v_cids, v_rem, v_col from public.ar_dashboard;

  v_new := replace(v_def, v_old_tok, v_new_tok);
  execute 'create or replace view public.ar_dashboard with (security_invoker = true) as ' || v_new;

  if not exists (select 1 from pg_class where oid = 'public.ar_dashboard'::regclass
                 and 'security_invoker=true' = any(reloptions)) then
    raise exception 'security_invoker not set after rebuild';
  end if;

  v_rollback :=
    '-- ROLLBACK (re-opens the owner-rights exposure; use only to unbreak the app):' || chr(10) ||
    'create or replace view public.ar_dashboard as ' || v_def || chr(10) ||
    'grant insert, update, delete, truncate, references, trigger on public.ar_dashboard to authenticated;' || chr(10) ||
    'alter policy ar_source_rows_active_read on public.ar_source_rows using (is_active_user());' || chr(10) ||
    'alter policy client_source_links_select on public.client_source_links using (is_active_user());' || chr(10) ||
    'alter policy clients_select on public.clients using (is_active_user());' || chr(10) ||
    'alter policy immigration_cases_select on public.immigration_cases using (is_active_user());' || chr(10) ||
    'alter policy auth_read_contracts on public.contracts using ((auth.uid() is not null));' || chr(10) ||
    'alter policy "Authenticated reads on lawpay_transactions" on public.lawpay_transactions using ((auth.uid() is not null));';

  insert into public.ddl_migration_audit
    (migration_key, object_kind, affected_objects, issue, root_cause, implementation_summary, migration_file,
     before_fn_sha256, after_fn_sha256, before_sql, rollback_sql, before_evidence, status_gate_unchanged,
     anchor_snapshot_id, anchor_snapshot_date, applied_by, notes)
  select
    'vp_20261013_ar_dashboard_security_invoker_restore',
    'view rebuild (security_invoker) + grant revoke + RLS policy initplan wrap x6 (DDL)',
    array['public.ar_dashboard','public.ar_source_rows','public.client_source_links','public.clients',
          'public.immigration_cases','public.contracts','public.lawpay_transactions'],
    'ar_dashboard ran with owner (postgres, BYPASSRLS) rights: any authenticated session incl. deactivated profiles and profile-less JWTs read all 3,924 AR rows; authenticated held INSERT/UPDATE/DELETE/TRUNCATE/REFERENCES/TRIGGER on it.',
    '20260407190000 set security_invoker=true; 20260411120000 DROP+CREATE dropped it; every later CREATE OR REPLACE (20260520153047 ... 20261013154138) omitted WITH (security_invoker=true), which resets reloptions.',
    'Rebuilt from live def WITH (security_invoker=true), one token changed (latest_case tiebreaker updated_at DESC NULLS LAST, id). Revoked all non-SELECT privs from anon+authenticated. Wrapped 6 RLS predicates in (select ...) for initplan evaluation (semantics identical) to keep invoker reads at parity.',
    'apex-billing-path/supabase/migrations/<applied version>_ar_dashboard_security_invoker_restore.sql (file sha in VERIFY row)',
    v_before_sha,
    encode(sha256(convert_to(pg_get_viewdef('public.ar_dashboard'::regclass, true),'UTF8')),'hex'),
    v_def,
    v_rollback,
    jsonb_build_object(
      'reloptions', 'NULL (owner rights)',
      'authenticated_privs', 'DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE',
      'anon_privs', 'none',
      'owner_rows', v_rows, 'owner_distinct_contract_id', v_cids,
      'owner_remaining_balance', v_rem, 'owner_amount_collected', v_col,
      'probe_active_admin', jsonb_build_object('rows',3924,'remaining',17502885.52),
      'probe_deactivated_admin', jsonb_build_object('rows',3924,'remaining',17502885.52,'base_ar_source_rows_visible',0),
      'probe_no_profile_jwt', jsonb_build_object('rows',3924,'remaining',17502885.52,'base_ar_source_rows_visible',0),
      'timing_ms_owner_rights', jsonb_build_object('full',218,'search',181,'count',83),
      'timing_ms_invoker_unwrapped_dryrun', jsonb_build_object('full',1227,'search',1036,'count',420),
      'timing_ms_invoker_wrapped_dryrun', jsonb_build_object('full',217,'search',180,'count',83),
      'tied_latest_case_clients', 99, 'tied_latest_case_ard_rows', 106, 'dryrun_rows_flipped', 48),
    true,
    s.snapshot_id, s.snapshot_date,
    'supabase-auditor (VP)',
    'Requested via LexCollect app agent finding 2026-10-13. Dependents (admin_kpi, mv_client_search, mv_exec_ar_at_risk, v_ar_identity_split_invoices, v_ar_live_movement, v_card_recovery_lanes, v_hubspot_collections_segments) are owner-rights and still bypass RLS; flagged, not changed in this pass.'
  from public.v_ar_active_snapshot s;
end $$;

revoke insert, update, delete, truncate, references, trigger on public.ar_dashboard from authenticated;
revoke all on public.ar_dashboard from anon;
grant select on public.ar_dashboard to authenticated;

comment on view public.ar_dashboard is
'GRAIN: one row per contract. KEY: contract_id. [VERIFIED 2026-08-24: 3,961 rows = 3,961 distinct contract_id] Also unique here (so 1:1 with the key today): invoice_number. SECURITY: security_invoker = true (restored VP 2026-10-13); every rebuild MUST use CREATE OR REPLACE VIEW ... WITH (security_invoker = true) or RLS is bypassed again.';
