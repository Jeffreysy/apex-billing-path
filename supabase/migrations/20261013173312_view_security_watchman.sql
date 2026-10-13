-- VP (supabase-auditor) 2026-10-13 - SEC watchman: view security (the "side doors" watchman Jeff asked for).
-- Same pattern as the anon-exposure watchman (anon_exposure_heartbeat / v_anon_exposure_health / anon-exposure-scan cron):
--   scan function -> SECURITY DEFINER run function -> heartbeat table + pipeline_heartbeat upsert -> health view -> pg_cron.
--
-- What it watches (public schema):
--   owner_rights_rls_bypass : a VIEW without security_invoker, SELECT-able by authenticated or anon, whose read path reaches
--                             an RLS-protected table (or an auth.* table). Such a view hands RLS-protected rows to any login,
--                             including deactivated users. (This is how ar_dashboard and its 13 dependents leaked.)
--   matview_rls_bypass      : a MATERIALIZED VIEW SELECT-able by authenticated/anon over RLS-protected data (MVs cannot apply RLS).
--   auth_write_grant        : authenticated holds INSERT/UPDATE/DELETE/TRUNCATE on a view or matview.
--   live_write_path         : an auto-updatable view where authenticated or anon holds INSERT/UPDATE/DELETE (a real write door
--                             into the base table - the v_firm_financial_summary failure mode). TRUNCATE is ignored here
--                             because Postgres refuses TRUNCATE on a view.
--   anon_any_grant          : anon holds any privilege on a view or matview.
-- Status:
--   ALERT  any live_write_path, any anon_any_grant, or ANY finding not on the open baseline - i.e. a NEW side door, or a view
--          that was fixed (or certified invoker, like the 15 closed today) and REGRESSED, e.g. a CREATE OR REPLACE VIEW that
--          forgot WITH (security_invoker = true).
--   WARN   only the baselined legacy backlog remains open (the rest of the 343-view sweep); count shown, tracked to zero.
--   OK     nothing open.
-- Baseline rows are auto-marked resolved when the finding disappears; a resolved row that re-appears is an ALERT.

create table public.view_security_baseline (
  object_name   text        not null,
  finding       text        not null check (finding in ('owner_rights_rls_bypass','matview_rls_bypass','auth_write_grant')),
  baselined_at  timestamptz not null default now(),
  baseline_cert text        not null,
  resolved_at   timestamptz,
  primary key (object_name, finding)
);
comment on table public.view_security_baseline is
'GRAIN: one row per (public view/matview, finding). Legacy side-door backlog accepted at watchman install (VP 2026-10-13). resolved_at is stamped by view_security_heartbeat_run() when the finding disappears; a resolved finding that re-appears is an ALERT. Never add rows by hand without a VP cert id in baseline_cert.';

create table public.view_security_heartbeat (
  id                       bigserial primary key,
  ran_at                   timestamptz not null default now(),
  status                   text not null check (status in ('OK','WARN','ALERT')),
  alerts                   text[] not null default '{}',
  views_total              int,
  matviews_total           int,
  owner_rights_rls_bypass  int,
  matview_rls_bypass       int,
  auth_write_grant         int,
  live_write_path          int,
  anon_any_grant           int,
  new_or_regressed         int,
  backlog_open             int,
  resolved_this_run        int,
  new_or_regressed_objects text[] not null default '{}',
  detail                   text
);
comment on table public.view_security_heartbeat is
'GRAIN: one row per watchman run (pg_cron view-security-scan, every 6h). Written only by view_security_heartbeat_run().';

alter table public.view_security_baseline  enable row level security;
alter table public.view_security_heartbeat enable row level security;
create policy view_security_baseline_active_read  on public.view_security_baseline  for select to authenticated using ((select public.is_active_user()));
create policy view_security_heartbeat_active_read on public.view_security_heartbeat for select to authenticated using ((select public.is_active_user()));
revoke all on public.view_security_baseline, public.view_security_heartbeat from anon, authenticated;
grant select on public.view_security_baseline, public.view_security_heartbeat to authenticated;
revoke all on sequence public.view_security_heartbeat_id_seq from anon, authenticated;

create or replace function public.view_security_scan()
returns table (object_name text, relkind text, finding text, n_sensitive_tables int, baseline_state text)
language sql stable
set search_path = pg_catalog, public
as $$
  with recursive
  edges as (
    select distinct r.ev_class as child, d.refobjid as parent
    from pg_rewrite r
    join pg_depend d on d.objid = r.oid and d.classid = 'pg_rewrite'::regclass and d.refclassid = 'pg_class'::regclass
    where r.ev_class <> d.refobjid),
  rel as (
    select c.oid, c.relname::text as relname, c.relkind::text as relkind, c.reloptions
    from pg_class c where c.relnamespace = 'public'::regnamespace and c.relkind in ('v','m')),
  reach (root, obj) as (
    select r.oid, e.parent from rel r join edges e on e.child = r.oid
    union
    select reach.root, e.parent from reach join edges e on e.child = reach.obj),
  sens as (
    select reach.root, count(distinct t.oid)::int as n
    from reach join pg_class t on t.oid = reach.obj join pg_namespace n on n.oid = t.relnamespace
    where t.relkind in ('r','p') and (t.relrowsecurity or n.nspname = 'auth')
    group by reach.root),
  f as (
    select r.relname, r.relkind, coalesce(s.n, 0) as n_sensitive,
      exists (select 1 from unnest(coalesce(r.reloptions, '{}')) x
              where lower(x) in ('security_invoker=true','security_invoker=on','security_invoker=1','security_invoker=yes')) as invoker,
      (has_table_privilege('authenticated', r.oid, 'SELECT') or has_table_privilege('anon', r.oid, 'SELECT')) as readable,
      (has_table_privilege('authenticated', r.oid, 'INSERT') or has_table_privilege('authenticated', r.oid, 'UPDATE')
        or has_table_privilege('authenticated', r.oid, 'DELETE') or has_table_privilege('authenticated', r.oid, 'TRUNCATE')) as auth_write,
      (has_table_privilege('authenticated', r.oid, 'INSERT') or has_table_privilege('authenticated', r.oid, 'UPDATE')
        or has_table_privilege('authenticated', r.oid, 'DELETE') or has_table_privilege('anon', r.oid, 'INSERT')
        or has_table_privilege('anon', r.oid, 'UPDATE') or has_table_privilege('anon', r.oid, 'DELETE')) as iud,
      (has_table_privilege('anon', r.oid, 'SELECT') or has_table_privilege('anon', r.oid, 'INSERT') or has_table_privilege('anon', r.oid, 'UPDATE')
        or has_table_privilege('anon', r.oid, 'DELETE') or has_table_privilege('anon', r.oid, 'TRUNCATE')
        or has_table_privilege('anon', r.oid, 'REFERENCES') or has_table_privilege('anon', r.oid, 'TRIGGER')) as anon_any,
      (r.relkind = 'v' and (pg_relation_is_updatable(r.oid, true) & 28) <> 0) as updatable
    from rel r left join sens s on s.root = r.oid),
  findings as (
    select relname, relkind, 'owner_rights_rls_bypass'::text as finding, n_sensitive from f
      where relkind = 'v' and not invoker and readable and n_sensitive > 0
    union all
    select relname, relkind, 'matview_rls_bypass', n_sensitive from f where relkind = 'm' and readable and n_sensitive > 0
    union all
    select relname, relkind, 'auth_write_grant', n_sensitive from f where auth_write
    union all
    select relname, relkind, 'live_write_path', n_sensitive from f where updatable and iud
    union all
    select relname, relkind, 'anon_any_grant', n_sensitive from f where anon_any)
  select fd.relname, fd.relkind, fd.finding, fd.n_sensitive,
    case
      when fd.finding in ('live_write_path','anon_any_grant') then 'never_baselined'
      when b.object_name is null then 'NEW'
      when b.resolved_at is not null then 'REGRESSED'
      else 'baseline_open'
    end
  from findings fd
  left join public.view_security_baseline b on b.object_name = fd.relname and b.finding = fd.finding;
$$;
comment on function public.view_security_scan() is
'VP 2026-10-13 side-door watchman scan (read-only, catalog only, no client data). One row per (public view/matview, finding). baseline_state NEW/REGRESSED/never_baselined => ALERT; baseline_open => WARN backlog.';

create or replace function public.view_security_heartbeat_run()
returns public.view_security_heartbeat
language plpgsql security definer
set search_path = public, pg_catalog
as $$
declare
  rec public.view_security_heartbeat;
  a text[] := '{}'; st text := 'OK';
  n_resolved int; s record; bad text[];
begin
  drop table if exists pg_temp._vss;
  create temp table _vss on commit drop as select * from public.view_security_scan();

  update public.view_security_baseline b set resolved_at = now()
   where b.resolved_at is null
     and not exists (select 1 from _vss f where f.object_name = b.object_name and f.finding = b.finding);
  get diagnostics n_resolved = row_count;

  select
    (select count(*) from pg_class where relnamespace = 'public'::regnamespace and relkind = 'v')::int as views_total,
    (select count(*) from pg_class where relnamespace = 'public'::regnamespace and relkind = 'm')::int as matviews_total,
    count(*) filter (where finding = 'owner_rights_rls_bypass')::int as orb,
    count(*) filter (where finding = 'matview_rls_bypass')::int as mrb,
    count(*) filter (where finding = 'auth_write_grant')::int as awg,
    count(*) filter (where finding = 'live_write_path')::int as lwp,
    count(*) filter (where finding = 'anon_any_grant')::int as aag,
    count(*) filter (where baseline_state in ('NEW','REGRESSED','never_baselined'))::int as bad_n,
    count(*) filter (where baseline_state = 'baseline_open')::int as backlog
  into s from _vss;

  select coalesce(array_agg(object_name || ':' || finding || ':' || baseline_state order by object_name), '{}') into bad
    from _vss where baseline_state in ('NEW','REGRESSED','never_baselined');

  if s.lwp > 0 then a := a || format('%s auto-updatable VIEWS writable (INSERT/UPDATE/DELETE) by authenticated/anon - live write path into base tables', s.lwp); st := 'ALERT'; end if;
  if s.aag > 0 then a := a || format('%s views/matviews with ANY anon privilege', s.aag); st := 'ALERT'; end if;
  if (select count(*) from _vss where baseline_state in ('NEW','REGRESSED')) > 0 then
    a := a || format('%s NEW or REGRESSED side doors (owner-rights view over RLS data / readable matview / authenticated write grant): %s',
                     (select count(*) from _vss where baseline_state in ('NEW','REGRESSED')),
                     array_to_string(bad[1:10], ', '));
    st := 'ALERT';
  end if;
  if st = 'OK' and s.backlog > 0 then
    a := a || format('legacy backlog open: %s owner-rights views over RLS data, %s readable matviews over RLS data, %s views with inert authenticated write grants (baselined %s)',
                     (select count(*) from _vss where baseline_state = 'baseline_open' and finding = 'owner_rights_rls_bypass'),
                     (select count(*) from _vss where baseline_state = 'baseline_open' and finding = 'matview_rls_bypass'),
                     (select count(*) from _vss where baseline_state = 'baseline_open' and finding = 'auth_write_grant'),
                     (select min(baselined_at)::date from public.view_security_baseline));
    st := 'WARN';
  end if;

  insert into public.view_security_heartbeat (status, alerts, views_total, matviews_total, owner_rights_rls_bypass, matview_rls_bypass,
      auth_write_grant, live_write_path, anon_any_grant, new_or_regressed, backlog_open, resolved_this_run, new_or_regressed_objects, detail)
  values (st, a, s.views_total, s.matviews_total, s.orb, s.mrb, s.awg, s.lwp, s.aag, s.bad_n, s.backlog, n_resolved, bad,
          'SEC-2026-0002 view security watchman (VP 2026-10-13): security_invoker + write-grant scan over public views/matviews')
  returning * into rec;

  insert into public.pipeline_heartbeat (job, last_run_at, status, rows_inserted, detail)
  values ('view_security_scan', now(), st, 0,
          case when cardinality(a) = 0 then 'no side doors' else array_to_string(a, '; ') end)
  on conflict (job) do update
    set last_run_at = excluded.last_run_at, status = excluded.status, detail = excluded.detail;

  return rec;
end $$;
comment on function public.view_security_heartbeat_run() is
'VP 2026-10-13 side-door watchman run: scans, auto-resolves baseline rows, writes view_security_heartbeat + pipeline_heartbeat(job=view_security_scan). Scheduled by pg_cron view-security-scan. Not callable by anon/authenticated.';
revoke execute on function public.view_security_heartbeat_run() from public, anon, authenticated;
grant execute on function public.view_security_heartbeat_run() to service_role;
revoke execute on function public.view_security_scan() from public, anon;
grant execute on function public.view_security_scan() to authenticated, service_role;

create view public.v_view_security_health with (security_invoker = true) as
select h.id, h.ran_at, round(extract(epoch from now() - h.ran_at) / 3600.0, 1) as hours_since_run, h.status, h.alerts,
       h.views_total, h.matviews_total, h.owner_rights_rls_bypass, h.matview_rls_bypass, h.auth_write_grant,
       h.live_write_path, h.anon_any_grant, h.new_or_regressed, h.backlog_open, h.resolved_this_run, h.new_or_regressed_objects,
       case when h.ran_at < now() - interval '13 hours' then 'STALE' else 'FRESH' end as freshness
from public.view_security_heartbeat h
order by h.ran_at desc
limit 1;
comment on view public.v_view_security_health is
'GRAIN: one row (latest view-security watchman run). STALE if no run in 13h (cron every 6h). status ALERT = new/regressed side door or live write path; WARN = legacy backlog only. Rolled up via pipeline_heartbeat job view_security_scan.';

create view public.v_view_security_findings with (security_invoker = true) as
select object_name, relkind, finding, n_sensitive_tables, baseline_state from public.view_security_scan();
comment on view public.v_view_security_findings is
'GRAIN: one row per (public view/matview, finding) right now. Review list for the side-door backlog; baseline_state NEW/REGRESSED/never_baselined are the ALERT drivers.';

revoke all on public.v_view_security_health, public.v_view_security_findings from anon, authenticated;
grant select on public.v_view_security_health, public.v_view_security_findings to authenticated;

-- seed the legacy backlog (exactly what the scan sees at install; the 14 views + ar_dashboard closed today are NOT baselined)
insert into public.view_security_baseline (object_name, finding, baseline_cert)
select object_name, finding, 'vp_20261013_view_security_watchman'
from public.view_security_scan()
where finding in ('owner_rights_rls_bypass','matview_rls_bypass','auth_write_grant');

do $$
begin
  if exists (select 1 from public.view_security_baseline
             where object_name in ('ar_dashboard','admin_kpi','v_ar_identity_split_invoices','v_ar_live_movement','v_card_recovery_lanes',
               'v_hubspot_collections_segments','ar_client_detail','payments_clean','v_ar_active_snapshot','v_ar_data_excel_mirror',
               'v_collector_contact_card','v_controller_automation_clients','v_ar_active_rows_v2','v_ar_invoice_clock','v_ar_active_rows')) then
    raise exception 'a view closed today landed in the baseline - side-door migration not in effect; refusing to install watchman';
  end if;
end $$;

select cron.schedule('view-security-scan', '10 */6 * * *', 'select public.view_security_heartbeat_run();');

insert into public.ddl_migration_audit
  (migration_key, object_kind, affected_objects, issue, root_cause, implementation_summary, migration_file,
   before_sql, rollback_sql, before_evidence, status_gate_unchanged, anchor_snapshot_id, anchor_snapshot_date, applied_by, notes)
select
  'vp_20261013_view_security_watchman',
  'watchman: tables x2 + scan fn + definer run fn + health view + findings view + pg_cron job (DDL)',
  array['public.view_security_baseline','public.view_security_heartbeat','public.view_security_scan()','public.view_security_heartbeat_run()',
        'public.v_view_security_health','public.v_view_security_findings','cron:view-security-scan','public.pipeline_heartbeat(job=view_security_scan)'],
  'No monitor existed for views losing security_invoker or for authenticated/anon gaining write grants on views: ar_dashboard silently lost security_invoker on 2026-04-11 and stayed open ~6 months; v_firm_financial_summary was a live write path for any login.',
  'CREATE OR REPLACE VIEW without WITH (security_invoker = true) silently resets it; Supabase default privileges grant ALL on new relations to authenticated. Nothing alarmed.',
  'Heartbeat + health + alert per the system-of-record rule. Scan is catalog-only. Legacy backlog baselined (WARN); anything new or regressed, any live I/U/D write path, any anon grant = ALERT. Upserts pipeline_heartbeat job view_security_scan, so v_pipeline_health_all / _summary pick it up. pg_cron every 6h at :10.',
  'apex-billing-path/supabase/migrations/<applied version>_view_security_watchman.sql (file sha in VERIFY row)',
  null,
  'select cron.unschedule(''view-security-scan'');' || chr(10)
  || 'delete from public.pipeline_heartbeat where job = ''view_security_scan'';' || chr(10)
  || 'drop view if exists public.v_view_security_findings;' || chr(10)
  || 'drop view if exists public.v_view_security_health;' || chr(10)
  || 'drop function if exists public.view_security_heartbeat_run();' || chr(10)
  || 'drop function if exists public.view_security_scan();' || chr(10)
  || 'drop table if exists public.view_security_heartbeat;' || chr(10)
  || 'drop table if exists public.view_security_baseline;',
  jsonb_build_object('baseline_rows', (select count(*) from public.view_security_baseline),
                     'baseline_by_finding', (select jsonb_object_agg(finding, n) from (select finding, count(*) n from public.view_security_baseline group by 1) x)),
  true, s.snapshot_id, s.snapshot_date, 'supabase-auditor (VP)',
  'Jeff 2026-10-13 "close the side doors" part 2. Companion to cert vp_20261013_ar_dashboard_side_doors_security_invoker.'
from public.v_ar_active_snapshot s;

select public.view_security_heartbeat_run();
