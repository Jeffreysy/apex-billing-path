-- Executive Insights hero band - cache the two slow views (2026-10-13, lexcollect-app-agent; VP applies + certifies).
-- Why: under a real Admin page load (dozens of parallel PostgREST requests) v_exec_client_bucket_drift (~2.1 s alone)
-- and v_exec_case_mix_monthly (~3.9 s alone; per-case case_type_classify) hit the 8 s authenticated statement_timeout
-- and returned HTTP 500, so the tiles never rendered. Fix: the certified logic is kept VERBATIM under *_live names,
-- materialized hourly by a SECURITY DEFINER refresh (house pattern: refresh_queue_coverage_monthly + pipeline_heartbeat),
-- and the app-facing names become thin security_invoker views over the cache with a refreshed_at column the tile shows.
-- App contract (view names + existing columns) is unchanged; refreshed_at is additive.

-- 1. Keep the certified logic under *_live names (used by the refresh, and for live-vs-cache reconciliation).
alter view public.v_exec_client_bucket_drift rename to v_exec_client_bucket_drift_live;
alter view public.v_exec_case_mix_monthly    rename to v_exec_case_mix_monthly_live;

-- 2. Caches. Aggregates only (no client-level rows). Refreshed as the owner, so RLS on the inputs is not a factor.
create materialized view public.mv_exec_client_bucket_drift as
  select l.*, now() as refreshed_at from public.v_exec_client_bucket_drift_live l
with data;
create unique index mv_exec_client_bucket_drift_key on public.mv_exec_client_bucket_drift (month, from_ord, to_ord);

create materialized view public.mv_exec_case_mix_monthly as
  select l.*, now() as refreshed_at from public.v_exec_case_mix_monthly_live l
with data;
create unique index mv_exec_case_mix_monthly_key on public.mv_exec_case_mix_monthly (month, reporting_family);

-- 3. App-facing names: thin security_invoker views over the caches (same columns + refreshed_at).
create view public.v_exec_client_bucket_drift with (security_invoker = true) as
  select * from public.mv_exec_client_bucket_drift;
create view public.v_exec_case_mix_monthly with (security_invoker = true) as
  select * from public.mv_exec_case_mix_monthly;

comment on materialized view public.mv_exec_client_bucket_drift is
'GRAIN: one row per (month, from_ord, to_ord). KEY: (month, from_ord, to_ord) [unique index]. Hourly cache of v_exec_client_bucket_drift_live (certified logic, see its comment); refreshed_at = cache build time. Refreshed by public.refresh_exec_insights_cache() (pg_cron exec-insights-cache-hourly; heartbeat pipeline_heartbeat.job = exec_insights_cache).';
comment on materialized view public.mv_exec_case_mix_monthly is
'GRAIN: one row per (month, reporting_family). KEY: (month, reporting_family) [unique index]. Hourly cache of v_exec_case_mix_monthly_live (certified logic, see its comment); refreshed_at = cache build time. Refreshed by public.refresh_exec_insights_cache() (pg_cron exec-insights-cache-hourly; heartbeat pipeline_heartbeat.job = exec_insights_cache).';
comment on view public.v_exec_client_bucket_drift is
'GRAIN: one row per (month, from_ord, to_ord). KEY: (month, from_ord, to_ord). App door for the Executive Insights "Drift" tile: reads the hourly cache mv_exec_client_bucket_drift (logic: v_exec_client_bucket_drift_live). refreshed_at = cache build time, shown on the tile. security_invoker; authenticated SELECT only.';
comment on view public.v_exec_case_mix_monthly is
'GRAIN: one row per (month, reporting_family). KEY: (month, reporting_family). App door for the Executive Insights "Case Mix" card: reads the hourly cache mv_exec_case_mix_monthly (logic: v_exec_case_mix_monthly_live). refreshed_at = cache build time, shown on the card. security_invoker; authenticated SELECT only.';

-- 3b. AR at Risk (hero tile) - one-row aggregate of ar_dashboard, cached for the same reason (the legacy tile pulled
--     every ar_dashboard row into the browser). Definition UNCHANGED from the legacy tile: SUM(remaining_balance) where
--     days_past_due > 60 (CONTRACT grain). ar_total here = SUM(remaining_balance) = v_firm_financial_summary.ar_total
--     (both $17,502,885.52 on the 2026-10-12 snapshot), so the tile can show the share of certified AR.
create materialized view public.mv_exec_ar_at_risk as
  select round(coalesce(sum(d.remaining_balance) filter (where coalesce(d.days_past_due, 0) > 60), 0), 2) as ar_at_risk_60,
         round(coalesce(sum(d.remaining_balance), 0), 2)                                                 as ar_total,
         count(*) filter (where coalesce(d.days_past_due, 0) > 60)                                       as contracts_at_risk_60,
         count(*)                                                                                        as contracts,
         (select a.snapshot_date from public.v_ar_active_snapshot a limit 1)                             as snapshot_date,
         now()                                                                                           as refreshed_at,
         1                                                                                               as singleton
  from public.ar_dashboard d
with data;
create unique index mv_exec_ar_at_risk_key on public.mv_exec_ar_at_risk (singleton);
create view public.v_exec_ar_at_risk with (security_invoker = true) as
  select ar_at_risk_60, ar_total, contracts_at_risk_60, contracts, snapshot_date, refreshed_at from public.mv_exec_ar_at_risk;
comment on materialized view public.mv_exec_ar_at_risk is
'GRAIN: one row (singleton). KEY: singleton. Hourly cache: ar_at_risk_60 = SUM(ar_dashboard.remaining_balance) where days_past_due > 60 (contract grain; the legacy Executive Insights "AR at Risk" definition, unchanged); ar_total = SUM(remaining_balance) (ties to v_firm_financial_summary.ar_total). Refreshed by public.refresh_exec_insights_cache().';
comment on view public.v_exec_ar_at_risk is
'GRAIN: one row. App door for the Executive Insights "AR at Risk" hero tile; reads the hourly cache mv_exec_ar_at_risk. security_invoker; authenticated SELECT only.';

-- 4. Refresh + heartbeat (house pattern).
create or replace function public.refresh_exec_insights_cache()
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
declare v_drift int; v_mix int; v_drift_months int; v_mix_months int; v_risk int; v_status text; v_err text;
begin
  perform set_config('statement_timeout', '120s', true);
  begin   -- VP edit: a failed refresh writes a RED heartbeat instead of aborting silently (caches keep their last good build)
    refresh materialized view concurrently public.mv_exec_client_bucket_drift;
    refresh materialized view concurrently public.mv_exec_case_mix_monthly;
    refresh materialized view concurrently public.mv_exec_ar_at_risk;
  exception when others then
    get stacked diagnostics v_err = message_text;
    insert into public.pipeline_heartbeat(job, last_run_at, status, rows_inserted, detail)
    values ('exec_insights_cache', now(), 'RED', 0, 'REFRESH FAILED: ' || left(v_err, 400))
    on conflict (job) do update set last_run_at = excluded.last_run_at, status = excluded.status,
            rows_inserted = excluded.rows_inserted, detail = excluded.detail;
    return;
  end;
  select count(*), count(distinct month) into v_drift, v_drift_months from public.mv_exec_client_bucket_drift;
  select count(*), count(distinct month) into v_mix, v_mix_months from public.mv_exec_case_mix_monthly;
  select count(*) into v_risk from public.mv_exec_ar_at_risk where ar_total > 0;   -- VP edit: AR-at-risk cache must be populated too
  v_status := case when v_drift > 0 and v_mix > 0 and v_risk = 1 then 'GREEN' else 'WARN' end;
  insert into public.pipeline_heartbeat(job, last_run_at, status, rows_inserted, detail)
  values ('exec_insights_cache', now(), v_status, v_drift + v_mix,
          format('refreshed mv_exec_client_bucket_drift (%s cells / %s months) + mv_exec_case_mix_monthly (%s rows / %s months) + mv_exec_ar_at_risk; feeds Admin > Executive Insights Drift, Case Mix, AR at Risk',
                 v_drift, v_drift_months, v_mix, v_mix_months))
  on conflict (job) do update set last_run_at = excluded.last_run_at, status = excluded.status,
          rows_inserted = excluded.rows_inserted, detail = excluded.detail;
end $function$;

-- 4b. VP edit: health view (system-of-record rule: heartbeat + health + alert). pipeline_heartbeat jobs that are not in
-- v_pipeline_health_all's cadence cfg are never scored stale, so this view carries the staleness + source-currency checks.
-- Owner-rights view (house pattern for *_health views, e.g. v_queue_coverage_monthly_health): pipeline_heartbeat has RLS ON
-- with no policies, so a security_invoker health view would read 0 heartbeat rows for app users and always say ALERT.
-- Output is operational metadata only (timestamps, dates, statuses) - no client data.
create or replace view public.v_exec_insights_cache_health as
with hb as (
  select h.last_run_at, h.status, h.detail from public.pipeline_heartbeat h where h.job = 'exec_insights_cache'
), c as (
  select (select max(refreshed_at) from public.mv_exec_client_bucket_drift) as drift_refreshed_at,
         (select max(refreshed_at) from public.mv_exec_case_mix_monthly)    as mix_refreshed_at,
         (select max(refreshed_at) from public.mv_exec_ar_at_risk)          as risk_refreshed_at,
         (select max(end_snapshot_date) from public.mv_exec_client_bucket_drift) as cache_latest_end_snapshot,
         (select max(cases_loaded_through) from public.mv_exec_case_mix_monthly) as cache_cases_loaded_through,
         (select max(snapshot_date) from public.mv_exec_ar_at_risk)         as cache_ar_snapshot_date
), src as (
  select (select max(s.snapshot_date) from public.v_ar_snapshot_series s
           where s.source_system = 'mycase_csv'
             and s.snapshot_date > date_trunc('month', current_date)::date
             and not exists (select 1 from public.ar_snapshot_denylist d where d.snapshot_id = s.snapshot_id)) as live_latest_end_snapshot_this_month,
         (select max(open_date) from public.mycase_cases where open_date <= current_date) as live_cases_loaded_through,
         (select a.snapshot_date from public.v_ar_active_snapshot a limit 1) as live_ar_snapshot_date
), x as (
  select c.*, src.*, least(c.drift_refreshed_at, c.mix_refreshed_at, c.risk_refreshed_at) as oldest_refresh from c cross join src
)
select hb.last_run_at as heartbeat_at,
       hb.status      as heartbeat_status,
       hb.detail      as heartbeat_detail,
       x.drift_refreshed_at,
       x.mix_refreshed_at,
       x.risk_refreshed_at,
       round(extract(epoch from now() - x.oldest_refresh) / 60.0, 1) as age_minutes,
       x.cache_latest_end_snapshot,
       x.live_latest_end_snapshot_this_month,
       x.cache_cases_loaded_through,
       x.live_cases_loaded_through,
       x.cache_ar_snapshot_date,
       x.live_ar_snapshot_date,
       case
         when hb.last_run_at is null or x.drift_refreshed_at is null or x.mix_refreshed_at is null or x.risk_refreshed_at is null then 'ALERT'
         when hb.status is distinct from 'GREEN' and hb.status is distinct from 'WARN' then 'ALERT'
         when now() - x.oldest_refresh > interval '26 hours' then 'ALERT'
         when now() - x.oldest_refresh > interval '2 hours'
              and (   (x.live_latest_end_snapshot_this_month is not null
                       and x.live_latest_end_snapshot_this_month > coalesce(x.cache_latest_end_snapshot, date '1900-01-01'))
                   or x.live_cases_loaded_through is distinct from x.cache_cases_loaded_through
                   or x.live_ar_snapshot_date     is distinct from x.cache_ar_snapshot_date) then 'ALERT'   -- a source moved and the cache missed it
         when now() - x.oldest_refresh > interval '2 hours' then 'WARN'
         when hb.status = 'WARN' then 'WARN'
         else 'GREEN'
       end as status
from x left join hb on true;

comment on view public.v_exec_insights_cache_health is
'GRAIN: one row (singleton). Health of the Executive Insights cache (mv_exec_client_bucket_drift + mv_exec_case_mix_monthly + mv_exec_ar_at_risk; job exec_insights_cache; pg_cron exec-insights-cache-hourly). ALERT: never ran / RED heartbeat / older than 26 h / older than 2 h while a source moved (newer in-month MyCase CSV AR snapshot, case-feed date, or active AR snapshot not yet in the cache). WARN: older than 2 h, or heartbeat WARN (an empty cache). VP 2026-10-13.';

-- 5. Grants: authenticated reads the app doors (security_invoker => also needs the caches); nobody else.
revoke all on public.mv_exec_client_bucket_drift, public.mv_exec_case_mix_monthly, public.mv_exec_ar_at_risk from public, anon, authenticated;
revoke all on public.v_exec_ar_at_risk from public, anon, authenticated;
revoke all on public.v_exec_client_bucket_drift, public.v_exec_case_mix_monthly from public, anon, authenticated;
revoke all on public.v_exec_client_bucket_drift_live, public.v_exec_case_mix_monthly_live from public, anon, authenticated;
grant select on public.mv_exec_client_bucket_drift, public.mv_exec_case_mix_monthly, public.mv_exec_ar_at_risk to authenticated;
grant select on public.v_exec_ar_at_risk to authenticated;
grant select on public.v_exec_client_bucket_drift, public.v_exec_case_mix_monthly to authenticated;
grant select on public.v_exec_client_bucket_drift_live, public.v_exec_case_mix_monthly_live to authenticated;  -- reconciliation only
revoke all on public.v_exec_insights_cache_health from public, anon, authenticated;
grant select on public.v_exec_insights_cache_health to authenticated;
revoke all on function public.refresh_exec_insights_cache() from public, anon, authenticated;

-- 6. Schedule: hourly at :07 (AR snapshot / MyCase case-feed landings show up within the hour).
select cron.schedule('exec-insights-cache-hourly', '7 * * * *', $$select public.refresh_exec_insights_cache();$$);
select public.refresh_exec_insights_cache();
