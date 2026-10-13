-- Executive Insights AR at Risk -> invoice clock; server-side header client search (2026-10-13, lexcollect-app-agent;
-- VP applies + certifies). Jeff 2026-10-13: "use the invoice clock and fix the search bar".

-- =============================================================================
-- 1. AR AT RISK on the invoice clock (behavioral clock, v_ar_invoice_clock on the active snapshot)
-- =============================================================================
-- mv_exec_ar_at_risk changes shape, so it is dropped and rebuilt; v_exec_ar_at_risk and v_exec_insights_cache_health
-- depend on it and are re-created (the health view VERBATIM from 20261013152229_exec_insights_cache.sql).
drop view if exists public.v_exec_insights_cache_health;
drop view if exists public.v_exec_ar_at_risk;
drop materialized view if exists public.mv_exec_ar_at_risk;

create materialized view public.mv_exec_ar_at_risk as
with clk as (   -- VP edit: read the CERTIFIED materialized clock (same source as v_admin_contract_status and the
                --          firm-summary cache on the same page) so the tiles cannot disagree between clock refreshes
  select c.amount_due, c.effective_aging_days, c.client_id, c.snapshot_date, c.refreshed_at
  from public.mv_ar_invoice_clock c
), legacy as (   -- previous tile basis, kept ONLY so the change is visible in the tile tooltip
  select round(coalesce(sum(d.remaining_balance) filter (where coalesce(d.days_past_due, 0) > 60), 0), 2) as v
  from public.ar_dashboard d
)
select round(coalesce(sum(amount_due) filter (where effective_aging_days > 60), 0), 2)       as ar_at_risk_60,
       round(coalesce(sum(amount_due), 0), 2)                                                as ar_total,
       count(*) filter (where effective_aging_days > 60)                                     as invoices_at_risk_60,
       count(distinct client_id) filter (where effective_aging_days > 60)                    as clients_at_risk_60,
       count(*) filter (where effective_aging_days > 60 and client_id is null)               as unlinked_invoices_at_risk_60,
       count(*)                                                                              as invoices,
       max(snapshot_date)                                                                    as snapshot_date,
       max(clk.refreshed_at)                                                                 as clock_refreshed_at,   -- VP edit: age of the underlying clock
       'invoice_clock'::text                                                                 as basis,
       (select v from legacy)                                                                as legacy_contract_dpd_at_risk_60,
       now()                                                                                 as refreshed_at,
       1                                                                                     as singleton
from clk
with data;
create unique index mv_exec_ar_at_risk_key on public.mv_exec_ar_at_risk (singleton);

create view public.v_exec_ar_at_risk with (security_invoker = true) as
  select ar_at_risk_60, ar_total, invoices_at_risk_60, clients_at_risk_60, unlinked_invoices_at_risk_60, invoices,
         snapshot_date, basis, legacy_contract_dpd_at_risk_60, clock_refreshed_at, refreshed_at
  from public.mv_exec_ar_at_risk;

comment on materialized view public.mv_exec_ar_at_risk is
'GRAIN: one row (singleton). KEY: singleton. Hourly cache. BASIS (Jeff 2026-10-13): invoice clock - ar_at_risk_60 = SUM(mv_ar_invoice_clock.amount_due) where effective_aging_days > 60 (certified materialized behavioral clock = v_ar_invoice_clock as of clock_refreshed_at; days since last payment / effective due date) on the active AR snapshot. invoices_at_risk_60 = INVOICE grain; clients_at_risk_60 = CLIENT grain (DISTINCT non-null client_id; unlinked_invoices_at_risk_60 carry no client_id); ar_total = SUM(amount_due) (ties to v_firm_financial_summary.ar_total). legacy_contract_dpd_at_risk_60 = the previous tile basis (ar_dashboard days_past_due > 60, CONTRACT grain) for the tooltip only. Refreshed by public.refresh_exec_insights_cache().';
comment on view public.v_exec_ar_at_risk is
'GRAIN: one row. App door for the Executive Insights "AR at Risk" hero tile (invoice-clock basis); reads the hourly cache mv_exec_ar_at_risk. security_invoker; authenticated SELECT only.';

-- =============================================================================
-- 2. HEADER CLIENT SEARCH - server-side, typed-term, LIMIT 20 (replaces pulling every ar_dashboard row
--    into every page). Universe = the AR book (ar_dashboard contracts), the same set ClientLookup can open.
-- =============================================================================
create materialized view public.mv_client_search as
select d.contract_id,
       d.client_id,
       d.client_name,
       d.case_number,
       d.invoice_number,
       d.practice_area,
       d.contract_status,
       d.delinquency_status,
       lower(concat_ws(' ', d.client_name, d.case_number, d.invoice_number,
                       regexp_replace(coalesce(d.invoice_number, ''), '^#', ''), d.email)) as search_text,
       now() as refreshed_at
from public.ar_dashboard d
with data;
create unique index mv_client_search_key on public.mv_client_search (contract_id);
create index mv_client_search_trgm on public.mv_client_search using gin (search_text gin_trgm_ops);

comment on materialized view public.mv_client_search is
'GRAIN: one row per contract. KEY: contract_id. Hourly search index over ar_dashboard for the header client search (name, case number, invoice number, email -> contract/client). Contains client PII: NO direct grants; read only through public.search_ar_clients() (active users, max 20 rows). Refreshed by public.refresh_exec_insights_cache().';

create or replace function public.search_ar_clients(p_term text, p_limit int default 20)
returns table (
  contract_id uuid, client_id uuid, client_name text, case_number text, invoice_number text,
  practice_area text, contract_status text, delinquency_status text, match_field text
)
language sql
stable
security definer
set search_path to 'public'
as $function$
  with q as (
    select lower(btrim(coalesce(p_term, ''))) as t
  ), pat as (
    select t, '%' || replace(replace(replace(t, '\', '\\'), '%', '\%'), '_', '\_') || '%' as p from q
  )
  select s.contract_id, s.client_id, s.client_name, s.case_number, s.invoice_number,
         s.practice_area, s.contract_status, s.delinquency_status,
         case when lower(s.client_name) like pat.p then 'name'
              when lower(coalesce(s.case_number, '')) like pat.p then 'case_number'
              when lower(coalesce(s.invoice_number, '')) like pat.p
                or regexp_replace(lower(coalesce(s.invoice_number, '')), '^#', '') like pat.p then 'invoice_number'
              else 'email' end as match_field
  from public.mv_client_search s, pat
  where (select public.is_active_user())
    and length(pat.t) >= 2
    and s.search_text like pat.p
  order by (lower(s.client_name) like pat.t || '%') desc,
           (lower(coalesce(s.case_number, '')) = pat.t) desc,
           s.client_name, s.case_number
  limit least(greatest(coalesce(p_limit, 20), 1), 20);
$function$;

comment on function public.search_ar_clients(text, int) is
'Header client search (LexCollect app). Active users only (is_active_user()), term >= 2 chars (LIKE wildcards escaped), max 20 rows, over mv_client_search (AR book, contract grain). Returns contract_id (ClientLookup deep-link key) + client_id + display fields + which field matched.';

-- =============================================================================
-- 3. Refresh: same certified function, now also refreshing the search index (RED heartbeat on any failure)
-- =============================================================================
create or replace function public.refresh_exec_insights_cache()
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
declare v_drift int; v_mix int; v_drift_months int; v_mix_months int; v_risk int; v_search int; v_status text; v_err text;
begin
  perform set_config('statement_timeout', '120s', true);
  begin   -- VP edit: a failed refresh writes a RED heartbeat instead of aborting silently (caches keep their last good build)
    refresh materialized view concurrently public.mv_exec_client_bucket_drift;
    refresh materialized view concurrently public.mv_exec_case_mix_monthly;
    refresh materialized view concurrently public.mv_exec_ar_at_risk;
    refresh materialized view concurrently public.mv_client_search;
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
  select count(*) into v_search from public.mv_client_search;                      -- VP edit: search index must be populated too
  v_status := case when v_drift > 0 and v_mix > 0 and v_risk = 1 and v_search > 0 then 'GREEN' else 'WARN' end;
  insert into public.pipeline_heartbeat(job, last_run_at, status, rows_inserted, detail)
  values ('exec_insights_cache', now(), v_status, v_drift + v_mix,
          format('refreshed mv_exec_client_bucket_drift (%s cells / %s months) + mv_exec_case_mix_monthly (%s rows / %s months) + mv_exec_ar_at_risk (invoice clock) + mv_client_search (%s contracts); feeds Admin > Executive Insights Drift, Case Mix, AR at Risk + header client search',
                 v_drift, v_drift_months, v_mix, v_mix_months, v_search))
  on conflict (job) do update set last_run_at = excluded.last_run_at, status = excluded.status,
          rows_inserted = excluded.rows_inserted, detail = excluded.detail;
end $function$;

-- =============================================================================
-- 4. Health view - re-created (dropped above because it reads mv_exec_ar_at_risk). VP edit: now also covers mv_client_search.
-- =============================================================================
create or replace view public.v_exec_insights_cache_health as
with hb as (
  select h.last_run_at, h.status, h.detail from public.pipeline_heartbeat h where h.job = 'exec_insights_cache'
), c as (
  select (select max(refreshed_at) from public.mv_exec_client_bucket_drift) as drift_refreshed_at,
         (select max(refreshed_at) from public.mv_exec_case_mix_monthly)    as mix_refreshed_at,
         (select max(refreshed_at) from public.mv_exec_ar_at_risk)          as risk_refreshed_at,
         (select max(refreshed_at) from public.mv_client_search)            as search_refreshed_at,
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
  select c.*, src.*, least(c.drift_refreshed_at, c.mix_refreshed_at, c.risk_refreshed_at, c.search_refreshed_at) as oldest_refresh from c cross join src
)
select hb.last_run_at as heartbeat_at,
       hb.status      as heartbeat_status,
       hb.detail      as heartbeat_detail,
       x.drift_refreshed_at,
       x.mix_refreshed_at,
       x.risk_refreshed_at,
       x.search_refreshed_at,
       round(extract(epoch from now() - x.oldest_refresh) / 60.0, 1) as age_minutes,
       x.cache_latest_end_snapshot,
       x.live_latest_end_snapshot_this_month,
       x.cache_cases_loaded_through,
       x.live_cases_loaded_through,
       x.cache_ar_snapshot_date,
       x.live_ar_snapshot_date,
       case
         when hb.last_run_at is null or x.drift_refreshed_at is null or x.mix_refreshed_at is null or x.risk_refreshed_at is null or x.search_refreshed_at is null then 'ALERT'
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
'GRAIN: one row (singleton). Health of the Executive Insights cache (mv_exec_client_bucket_drift + mv_exec_case_mix_monthly + mv_exec_ar_at_risk + mv_client_search; job exec_insights_cache; pg_cron exec-insights-cache-hourly). ALERT: never ran / RED heartbeat / older than 26 h / older than 2 h while a source moved (newer in-month MyCase CSV AR snapshot, case-feed date, or active AR snapshot not yet in the cache). WARN: older than 2 h, or heartbeat WARN (an empty cache). VP 2026-10-13.';

-- =============================================================================
-- 5. Grants
-- =============================================================================
revoke all on public.mv_exec_ar_at_risk, public.v_exec_ar_at_risk from public, anon, authenticated;
grant select on public.mv_exec_ar_at_risk, public.v_exec_ar_at_risk to authenticated;
revoke all on public.v_exec_insights_cache_health from public, anon, authenticated;
grant select on public.v_exec_insights_cache_health to authenticated;
revoke all on public.mv_client_search from public, anon, authenticated;          -- PII: no direct reads
revoke all on function public.search_ar_clients(text, int) from public, anon;
grant execute on function public.search_ar_clients(text, int) to authenticated;
revoke all on function public.refresh_exec_insights_cache() from public, anon, authenticated;

select public.refresh_exec_insights_cache();
