-- VP (supabase-auditor) 2026-10-13 - SECURITY: close a LIVE write path found in the ar_dashboard sweep.
-- public.v_firm_financial_summary is auto-updatable (pg_relation_is_updatable = 28), runs with owner rights
-- (reloptions NULL; owner postgres has BYPASSRLS), and authenticated held INSERT/UPDATE/DELETE/TRUNCATE/REFERENCES/TRIGGER.
-- Its base table firm_financial_summary_cache has RLS ON, ZERO policies and no authenticated grants, so the view's owner
-- rights were the only thing letting writes through. Proven in a rolled-back transaction (no-op self-assignment
-- ar_total = ar_total): a DEACTIVATED admin and a profile-less JWT each got UPDATE rowcount=1.
-- Nothing writes through the view: refresh_firm_financial_summary_cache() and refresh_ar_invoice_clock() write the cache
-- table directly; no app/pipeline code issues INSERT/UPDATE/DELETE against the view.
-- Fix: revoke every non-SELECT privilege from authenticated + anon. SELECT for authenticated is kept, so the read path
-- (ExecutiveInsights / AdminDashboard / FinanceOverviewTab) is unchanged. security_invoker is deliberately NOT flipped:
-- the cache has no SELECT policy, so invoker mode would blank the tile for every user.

do $$
begin
  if not has_table_privilege('authenticated','public.v_firm_financial_summary','UPDATE') then
    raise exception 'precondition changed: authenticated no longer holds UPDATE on v_firm_financial_summary; re-verify';
  end if;
end $$;

revoke insert, update, delete, truncate, references, trigger on public.v_firm_financial_summary from authenticated;
revoke all on public.v_firm_financial_summary from anon;
grant select on public.v_firm_financial_summary to authenticated;

insert into public.ddl_migration_audit
  (migration_key, object_kind, affected_objects, issue, root_cause, implementation_summary, migration_file,
   before_sql, rollback_sql, before_evidence, after_evidence, status_gate_unchanged,
   anchor_snapshot_id, anchor_snapshot_date, applied_by, notes)
select
  'vp_20261013_v_firm_financial_summary_revoke_writes',
  'grant revoke (DDL)',
  array['public.v_firm_financial_summary','public.firm_financial_summary_cache'],
  'LIVE write path: v_firm_financial_summary is auto-updatable + owner-rights + authenticated INSERT/UPDATE/DELETE; deactivated and profile-less sessions could UPDATE firm_financial_summary_cache (rolled-back proof, rowcount=1 each).',
  'View carries default full-privilege grants to authenticated; owner (postgres) BYPASSRLS lets writes past the cache table''s policy-less RLS.',
  'Revoked INSERT/UPDATE/DELETE/TRUNCATE/REFERENCES/TRIGGER from authenticated and ALL from anon; authenticated SELECT kept. security_invoker not flipped (would blank the tile; cache has no SELECT policy).',
  'apex-billing-path/supabase/migrations/<applied version>_v_firm_financial_summary_revoke_writes.sql',
  'authenticated: DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on public.v_firm_financial_summary',
  'grant insert, update, delete, truncate, references, trigger on public.v_firm_financial_summary to authenticated; -- re-opens the live write path',
  jsonb_build_object('updatable_mask',28,'reloptions','NULL','cache_rls',true,'cache_policies',0,
                     'write_probe_deactivated_admin','UPDATE rowcount=1 (rolled back)','write_probe_no_profile_jwt','UPDATE rowcount=1 (rolled back)'),
  jsonb_build_object(
    'authenticated_privs', (select string_agg(privilege_type, ',' order by privilege_type) from information_schema.role_table_grants
                            where table_schema='public' and table_name='v_firm_financial_summary' and grantee='authenticated'),
    'anon_select', has_table_privilege('anon','public.v_firm_financial_summary','SELECT')),
  true,
  s.snapshot_id, s.snapshot_date,
  'supabase-auditor (VP)',
  'Found while sweeping for the ar_dashboard security_invoker fix (companion row vp_20261013_ar_dashboard_security_invoker_restore). Owner-rights read exposure on this view remains (flagged).'
from public.v_ar_active_snapshot s;
