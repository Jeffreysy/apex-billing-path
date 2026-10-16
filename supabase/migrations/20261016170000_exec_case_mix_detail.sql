-- VP (supabase-auditor) 2026-10-16 -- Case Mix drill-down: one row per INVOICE behind the Case Mix tile.
-- Jeff 2026-10-16: "I should be able to click into this box and het that break down and the ability to exsport that
-- tabel of data in CSV" (client, invoice number and case number in the case mix section).
-- READ-ONLY reporting. No invoice, case, client or payment row is created, changed or deleted.
-- GRAIN: invoice row (mycase_invoices.id, amount > 0) on every revenue case in the Case Mix window.
--   Cases + classification come verbatim from v_exec_case_funding_status (ddl 9213cd93), so per (month, reporting_family)
--   sum(invoice_amount) = contract_value, count(distinct mycase_case_id) = revenue_cases, and per funding_status the case
--   counts/values = sold_* / call_first_* / unfunded_* / awaiting_* in v_exec_case_mix_monthly.
-- Invoice-level money uses the SAME transaction rules as the chain (digits key of invoice_number = digits key of
--   mycase_transactions_rich.reference; refunds out; rejected eChecks are not cash; trust excluded from operating cash;
--   window starts open_date - 3; paid_at_signing ends open_date + 7; failed/bounced/pending are to-date as in
--   v_exec_case_funding_status). One invoice per (case, digits key) carries that key's money (newest mycase_invoice_id),
--   so invoice sums equal the case figures exactly (0 such twins on 2026-10-16).
-- client_name = clients.name via the case's client_id; when the case has no client_id, the MyCase contact name on the
--   invoice (mycase_contacts by mycase_contact_id); else NULL. Explicit columns only (no SELECT * from client tables).
-- ACCESS: the cache is NOT granted to anon/authenticated (no readable-matview side door). It is read only through
--   exec_case_mix_detail(p_month) -- SECURITY DEFINER, rows only for an ACTIVE admin/partner (the Admin route's
--   ADMIN_ROLES) -- and the security_invoker view v_exec_case_mix_detail over it. anon: nothing.

-- 1. cache --------------------------------------------------------------------------------------------------
create materialized view public.mv_exec_case_mix_detail as
with s as (
  select f.month, f.reporting_family, f.funding_status, f.sold_basis, f.open_date, f.mycase_case_id,
         f.case_number, f.case_name, f.client_id, f.contract_value, f.collected_to_date,
         f.payments_through, f.funding_judged_through
  from public.v_exec_case_funding_status f
), inv as (
  select s.mycase_case_id, s.open_date, i.id as invoice_row_id, i.mycase_invoice_id, i.invoice_number,
         i.mycase_contact_id, i.amount,
         case when i.invoice_number ~ '\d' then regexp_replace(i.invoice_number, '\D', '', 'g') end as ik
  from s join public.mycase_invoices i on i.mycase_case_id = s.mycase_case_id
  where i.amount > 0
), rep as (            -- one invoice per (case, digits key) carries that key's money, so per-case sums never double
  select inv.*, row_number() over (partition by inv.mycase_case_id, inv.ik
                                   order by inv.mycase_invoice_id desc nulls last, inv.invoice_row_id) as key_rank
  from inv
), case_keys as (
  select distinct regexp_replace(i.invoice_number, '\D', '', 'g') as ik, i.mycase_case_id
  from public.mycase_invoices i
  where i.amount > 0 and i.mycase_case_id is not null and i.invoice_number ~ '\d'
), inv_key as (       -- same unique-key rule as v_exec_case_funding_status / v_exec_case_mix_monthly_live
  select ik, min(mycase_case_id) as mycase_case_id from case_keys group by ik having count(*) = 1
), txn as (
  select regexp_replace(t.reference, '\D', '', 'g') as ik, t.txn_date, t.status, t.total,
         coalesce(t.method, '') ~* '\(rejected\)' as is_rejected,
         coalesce(t.bank_account, '') ~* '^trust' as is_trust
  from public.mycase_transactions_rich t
  where t.reference ~ '\d' and t.total > 0
    and t.status = any (array['Completed','Offline','Authorized','Failed'])
    and coalesce(t.method, '') !~* '^refund'
), op as (
  select r.invoice_row_id,
         sum(x.total) filter (where x.status in ('Completed','Offline') and not x.is_rejected and x.txn_date <= r.open_date + 7) as paid_at_signing,
         sum(x.total) filter (where x.status in ('Completed','Offline') and not x.is_rejected) as collected_to_date,
         sum(x.total) filter (where x.status = 'Authorized' and not x.is_rejected) as pending_usd
  from rep r
  join inv_key k on k.ik = r.ik and k.mycase_case_id = r.mycase_case_id
  join txn x on x.ik = r.ik and x.txn_date >= r.open_date - 3 and not x.is_trust
  where r.key_rank = 1
  group by r.invoice_row_id
), att as (
  select r.invoice_row_id,
         sum(x.total) filter (where x.status = 'Failed') as failed_usd,
         sum(x.total) filter (where x.status in ('Completed','Offline','Authorized') and x.is_rejected) as bounced_usd,
         max(x.txn_date) filter (where x.status = 'Failed' or x.is_rejected) as last_attempt_date
  from rep r
  join txn x on x.ik = r.ik and x.txn_date >= r.open_date - 3
  where r.key_rank = 1 and r.ik is not null
  group by r.invoice_row_id
), ct as (
  select c.mycase_contact_id,
         max(nullif(btrim(coalesce(nullif(btrim(c.full_name), ''), concat_ws(' ', c.first_name, c.last_name))), '')) as contact_name
  from public.mycase_contacts c
  where c.mycase_contact_id in (select mycase_contact_id from inv)
  group by c.mycase_contact_id
)
select r.invoice_row_id,
       s.month,
       s.reporting_family,
       s.funding_status,
       s.sold_basis,
       s.open_date,
       s.mycase_case_id::text                                  as mycase_case_id,
       s.case_number,
       s.case_name,
       s.client_id,
       coalesce(cl.name, ct.contact_name)                      as client_name,
       r.invoice_number,
       r.mycase_invoice_id::text                               as mycase_invoice_id,
       round(r.amount, 2)                                      as invoice_amount,
       round(coalesce(op.paid_at_signing, 0), 2)               as invoice_paid_at_signing,
       round(coalesce(op.collected_to_date, 0), 2)             as invoice_collected_to_date,
       round(coalesce(op.pending_usd, 0), 2)                   as invoice_pending_usd,
       round(coalesce(att.failed_usd, 0), 2)                   as invoice_failed_usd,
       round(coalesce(att.bounced_usd, 0), 2)                  as invoice_bounced_usd,
       s.contract_value                                        as case_contract_value,
       s.collected_to_date                                     as case_collected_to_date,
       att.last_attempt_date,
       s.payments_through,
       s.funding_judged_through,
       now() as refreshed_at
from rep r
join s on s.mycase_case_id = r.mycase_case_id
left join op  on op.invoice_row_id  = r.invoice_row_id
left join att on att.invoice_row_id = r.invoice_row_id
left join public.clients cl on cl.id = s.client_id
left join ct on ct.mycase_contact_id = r.mycase_contact_id
with data;

create unique index mv_exec_case_mix_detail_key on public.mv_exec_case_mix_detail (invoice_row_id);
create index mv_exec_case_mix_detail_month_cov on public.mv_exec_case_mix_detail (month)
  include (reporting_family, funding_status, sold_basis, open_date, mycase_case_id, case_number, case_name, client_id, client_name, invoice_number, mycase_invoice_id, invoice_amount, invoice_paid_at_signing, invoice_collected_to_date, invoice_pending_usd, invoice_failed_usd, invoice_bounced_usd, case_contract_value, case_collected_to_date, last_attempt_date, payments_through, funding_judged_through);

revoke all on public.mv_exec_case_mix_detail from public, anon, authenticated;
grant select on public.mv_exec_case_mix_detail to service_role;
comment on materialized view public.mv_exec_case_mix_detail is
  'GRAIN: one row per invoice row (mycase_invoices.id) on every Case Mix revenue case. Hourly cache (refresh_exec_insights_cache). Ties to mv_exec_case_mix_monthly per (month, reporting_family) and per funding_status; checked by exec_case_mix_detail_tie_breaks() and v_exec_insights_cache_health. NOT granted to authenticated: read via exec_case_mix_detail() / v_exec_case_mix_detail (active admin/partner). VP 2026-10-16.';

-- 2. tie check: count of (month, reporting_family) cells where the detail cache != the summary cache ------------
create or replace function public.exec_case_mix_detail_tie_breaks()
returns integer
language sql stable security definer
set search_path to 'public'
as $f$
  with d as (
    select month, reporting_family,
           count(distinct mycase_case_id) as cases, sum(invoice_amount) as cv,
           count(distinct mycase_case_id) filter (where funding_status = 'sold')       as sold_c,
           coalesce(sum(invoice_amount) filter (where funding_status = 'sold'), 0)       as sold_v,
           count(distinct mycase_case_id) filter (where funding_status = 'call_first') as call_c,
           coalesce(sum(invoice_amount) filter (where funding_status = 'call_first'), 0) as call_v,
           count(distinct mycase_case_id) filter (where funding_status = 'unfunded')   as unf_c,
           coalesce(sum(invoice_amount) filter (where funding_status = 'unfunded'), 0)   as unf_v,
           count(distinct mycase_case_id) filter (where funding_status = 'awaiting')   as aw_c,
           coalesce(sum(invoice_amount) filter (where funding_status = 'awaiting'), 0)   as aw_v
    from public.mv_exec_case_mix_detail group by month, reporting_family)
  select count(*)::int
  from public.mv_exec_case_mix_monthly m
  full join d on d.month = m.month and d.reporting_family = m.reporting_family
  where m.month is null or d.month is null
     or m.revenue_cases <> d.cases or m.contract_value <> d.cv
     or m.sold_cases <> d.sold_c or m.sold_contract_value <> d.sold_v
     or m.call_first_cases <> d.call_c or m.call_first_contract_value <> d.call_v
     or m.unfunded_cases <> d.unf_c or m.unfunded_contract_value <> d.unf_v
     or m.awaiting_cases <> d.aw_c or m.awaiting_contract_value <> d.aw_v;
$f$;
revoke all on function public.exec_case_mix_detail_tie_breaks() from public, anon;
grant execute on function public.exec_case_mix_detail_tie_breaks() to authenticated, service_role;
comment on function public.exec_case_mix_detail_tie_breaks() is
  'Returns only a count: (month, reporting_family) cells where mv_exec_case_mix_detail does not tie to mv_exec_case_mix_monthly (cases, value, and each funding_status). 0 = tied. VP 2026-10-16.';

-- 3. gated reader -------------------------------------------------------------------------------------------
create or replace function public.exec_case_mix_detail(p_month date default null)
returns table (
  month date, reporting_family text, funding_status text, sold_basis text, open_date date,
  mycase_case_id text, case_number text, case_name text, client_id uuid, client_name text,
  invoice_number text, mycase_invoice_id text, invoice_amount numeric, invoice_paid_at_signing numeric,
  invoice_collected_to_date numeric, invoice_pending_usd numeric, invoice_failed_usd numeric,
  invoice_bounced_usd numeric, case_contract_value numeric, case_collected_to_date numeric,
  last_attempt_date date, payments_through date, funding_judged_through date)
language sql stable security definer
set search_path to 'public'
as $f$
  select d.month, d.reporting_family, d.funding_status, d.sold_basis, d.open_date, d.mycase_case_id, d.case_number, d.case_name, d.client_id, d.client_name, d.invoice_number, d.mycase_invoice_id, d.invoice_amount, d.invoice_paid_at_signing, d.invoice_collected_to_date, d.invoice_pending_usd, d.invoice_failed_usd, d.invoice_bounced_usd, d.case_contract_value, d.case_collected_to_date, d.last_attempt_date, d.payments_through, d.funding_judged_through
  from public.mv_exec_case_mix_detail d
  where (select public.current_user_role()) = any (array['admin','partner']::public.user_role[])
    and (p_month is null or d.month = p_month)
  order by d.month, d.reporting_family, d.funding_status, d.case_number, d.invoice_number;
$f$;
revoke all on function public.exec_case_mix_detail(date) from public, anon;
grant execute on function public.exec_case_mix_detail(date) to authenticated, service_role;
comment on function public.exec_case_mix_detail(date) is
  'Case Mix drill-down rows (invoice grain) from mv_exec_case_mix_detail. Rows only for an ACTIVE admin or partner (current_user_role()); anyone else gets zero rows. p_month = first of month uses the month index. VP 2026-10-16.';

-- 4. the door the app reads ---------------------------------------------------------------------------------
create view public.v_exec_case_mix_detail with (security_invoker = true) as
select month, reporting_family, funding_status, sold_basis, open_date, mycase_case_id, case_number, case_name, client_id, client_name, invoice_number, mycase_invoice_id, invoice_amount, invoice_paid_at_signing, invoice_collected_to_date, invoice_pending_usd, invoice_failed_usd, invoice_bounced_usd, case_contract_value, case_collected_to_date, last_attempt_date, payments_through, funding_judged_through
from public.exec_case_mix_detail(null::date);
revoke all on public.v_exec_case_mix_detail from public, anon, authenticated;
grant select on public.v_exec_case_mix_detail to authenticated, service_role;
comment on view public.v_exec_case_mix_detail is
  'GRAIN: one row per INVOICE on every Case Mix revenue case (month = case open month). funding_status: sold | call_first | unfunded | awaiting (app labels Sold / Call first / Delete / Too new). Ties to v_exec_case_mix_monthly: per (month, reporting_family) sum(invoice_amount) = contract_value and count(distinct mycase_case_id) = revenue_cases; per funding_status = sold_/call_first_/unfunded_/awaiting_ columns. invoice_number is TEXT (19-digit keys; never cast). Rows only for active admin/partner (gated in exec_case_mix_detail). Hourly cache. VP 2026-10-16.';

-- 5. hourly job: same function, same cron (exec-insights-cache-hourly, '7 * * * *'); detail refreshed right after the
--    summary cache, then tie-checked; on a break (data landed between the two refreshes) both are rebuilt once more.
create or replace function public.refresh_exec_insights_cache()
 returns void
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare v_drift int; v_mix int; v_drift_months int; v_mix_months int; v_risk int; v_search int; v_master int;
        v_master_ar numeric; v_book_ar numeric; v_tie_ok boolean; v_status text; v_err text;
        v_detail int; v_detail_months int; v_detail_breaks int; v_detail_retried boolean := false;
begin
  perform set_config('statement_timeout', '120s', true);
  begin   -- VP edit: a failed refresh writes a RED heartbeat instead of aborting silently (caches keep their last good build)
    refresh materialized view concurrently public.mv_exec_client_bucket_drift;
    refresh materialized view concurrently public.mv_exec_case_mix_monthly;
    refresh materialized view concurrently public.mv_exec_case_mix_detail;   -- VP 2026-10-16: Case Mix drill-down (invoice grain)
    refresh materialized view concurrently public.mv_exec_ar_at_risk;
    refresh materialized view concurrently public.mv_client_search;
    refresh materialized view concurrently public.mv_client_master_search;
    v_detail_breaks := public.exec_case_mix_detail_tie_breaks();
    if v_detail_breaks > 0 then   -- source moved between the two case-mix refreshes: rebuild the pair once
      v_detail_retried := true;
      refresh materialized view concurrently public.mv_exec_case_mix_monthly;
      refresh materialized view concurrently public.mv_exec_case_mix_detail;
      v_detail_breaks := public.exec_case_mix_detail_tie_breaks();
    end if;
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
  select count(*), count(distinct month) into v_detail, v_detail_months from public.mv_exec_case_mix_detail;
  select count(*) into v_risk from public.mv_exec_ar_at_risk where ar_total > 0;
  select count(*) into v_search from public.mv_client_search;
  select count(*), coalesce(sum(open_ar), 0) into v_master, v_master_ar from public.mv_client_master_search;
  select coalesce(sum(remaining_balance) filter (where coalesce(remaining_balance, 0) > 0), 0) into v_book_ar from public.ar_dashboard;
  v_tie_ok := abs(v_master_ar - v_book_ar) <= 1;   -- VP invariant: every open AR dollar lands on exactly one search row
  v_status := case when v_drift > 0 and v_mix > 0 and v_risk = 1 and v_search > 0 and v_master > 0 and v_tie_ok
                        and v_detail > 0 and v_detail_breaks = 0 then 'GREEN' else 'WARN' end;
  insert into public.pipeline_heartbeat(job, last_run_at, status, rows_inserted, detail)
  values ('exec_insights_cache', now(), v_status, v_drift + v_mix,
          format('refreshed mv_exec_client_bucket_drift (%s cells / %s months) + mv_exec_case_mix_monthly (%s rows / %s months) + mv_exec_case_mix_detail (%s invoices / %s months; tie to case mix: %s%s) + mv_exec_ar_at_risk (invoice clock) + mv_client_search (%s contracts) + mv_client_master_search (%s rows; open AR %s vs book %s: %s); feeds Admin > Executive Insights + header/Clients search',
                 v_drift, v_drift_months, v_mix, v_mix_months, v_detail, v_detail_months,
                 case when v_detail_breaks = 0 then 'TIED' else v_detail_breaks || ' cells NOT TIED' end,
                 case when v_detail_retried then ' after 1 rebuild' else '' end,
                 v_search, v_master, v_master_ar, v_book_ar,
                 case when v_tie_ok then 'TIED' else 'NOT TIED' end))
  on conflict (job) do update set last_run_at = excluded.last_run_at, status = excluded.status,
          rows_inserted = excluded.rows_inserted, detail = excluded.detail;
end $function$;

-- 6. cache health check: same view, columns appended (detail_refreshed_at, detail_rows, detail_tie_breaks);
--    detail cache missing / older than the others / not tying to the summary cache -> ALERT.
create or replace view public.v_exec_insights_cache_health as
 WITH hb AS (
         SELECT h.last_run_at,
            h.status,
            h.detail
           FROM pipeline_heartbeat h
          WHERE h.job = 'exec_insights_cache'::text
        ), c AS (
         SELECT ( SELECT max(mv_exec_client_bucket_drift.refreshed_at) AS max
                   FROM mv_exec_client_bucket_drift) AS drift_refreshed_at,
            ( SELECT max(mv_exec_case_mix_monthly.refreshed_at) AS max
                   FROM mv_exec_case_mix_monthly) AS mix_refreshed_at,
            ( SELECT max(mv_exec_ar_at_risk.refreshed_at) AS max
                   FROM mv_exec_ar_at_risk) AS risk_refreshed_at,
            ( SELECT max(mv_client_search.refreshed_at) AS max
                   FROM mv_client_search) AS search_refreshed_at,
            ( SELECT max(mv_client_master_search.refreshed_at) AS max
                   FROM mv_client_master_search) AS master_refreshed_at,
            ( SELECT max(mv_exec_client_bucket_drift.end_snapshot_date) AS max
                   FROM mv_exec_client_bucket_drift) AS cache_latest_end_snapshot,
            ( SELECT max(mv_exec_case_mix_monthly.cases_loaded_through) AS max
                   FROM mv_exec_case_mix_monthly) AS cache_cases_loaded_through,
            ( SELECT max(mv_exec_ar_at_risk.snapshot_date) AS max
                   FROM mv_exec_ar_at_risk) AS cache_ar_snapshot_date,
            ( SELECT max(mv_exec_case_mix_detail.refreshed_at) AS max
                   FROM mv_exec_case_mix_detail) AS detail_refreshed_at,
            ( SELECT count(*) AS count
                   FROM mv_exec_case_mix_detail) AS detail_rows,
            public.exec_case_mix_detail_tie_breaks() AS detail_tie_breaks
        ), src AS (
         SELECT ( SELECT max(s.snapshot_date) AS max
                   FROM v_ar_snapshot_series s
                  WHERE s.source_system = 'mycase_csv'::text AND s.snapshot_date > date_trunc('month'::text, CURRENT_DATE::timestamp with time zone)::date AND NOT (EXISTS ( SELECT 1
                           FROM ar_snapshot_denylist d
                          WHERE d.snapshot_id = s.snapshot_id))) AS live_latest_end_snapshot_this_month,
            ( SELECT max(mycase_cases.open_date) AS max
                   FROM mycase_cases
                  WHERE mycase_cases.open_date <= CURRENT_DATE) AS live_cases_loaded_through,
            ( SELECT a.snapshot_date
                   FROM v_ar_active_snapshot a
                 LIMIT 1) AS live_ar_snapshot_date
        ), x AS (
         SELECT c.drift_refreshed_at,
            c.mix_refreshed_at,
            c.risk_refreshed_at,
            c.search_refreshed_at,
            c.master_refreshed_at,
            c.cache_latest_end_snapshot,
            c.cache_cases_loaded_through,
            c.cache_ar_snapshot_date,
            c.detail_refreshed_at,
            c.detail_rows,
            c.detail_tie_breaks,
            src.live_latest_end_snapshot_this_month,
            src.live_cases_loaded_through,
            src.live_ar_snapshot_date,
            LEAST(c.drift_refreshed_at, c.mix_refreshed_at, c.risk_refreshed_at, c.search_refreshed_at, c.master_refreshed_at, c.detail_refreshed_at) AS oldest_refresh
           FROM c
             CROSS JOIN src
        )
 SELECT hb.last_run_at AS heartbeat_at,
    hb.status AS heartbeat_status,
    hb.detail AS heartbeat_detail,
    x.drift_refreshed_at,
    x.mix_refreshed_at,
    x.risk_refreshed_at,
    x.search_refreshed_at,
    round(EXTRACT(epoch FROM now() - x.oldest_refresh) / 60.0, 1) AS age_minutes,
    x.cache_latest_end_snapshot,
    x.live_latest_end_snapshot_this_month,
    x.cache_cases_loaded_through,
    x.live_cases_loaded_through,
    x.cache_ar_snapshot_date,
    x.live_ar_snapshot_date,
        CASE
            WHEN hb.last_run_at IS NULL OR x.drift_refreshed_at IS NULL OR x.mix_refreshed_at IS NULL OR x.risk_refreshed_at IS NULL OR x.search_refreshed_at IS NULL OR x.master_refreshed_at IS NULL OR x.detail_refreshed_at IS NULL THEN 'ALERT'::text
            WHEN x.detail_rows = 0 OR x.detail_tie_breaks > 0 THEN 'ALERT'::text
            WHEN hb.status IS DISTINCT FROM 'GREEN'::text AND hb.status IS DISTINCT FROM 'WARN'::text THEN 'ALERT'::text
            WHEN (now() - x.oldest_refresh) > '26:00:00'::interval THEN 'ALERT'::text
            WHEN (now() - x.oldest_refresh) > '02:00:00'::interval AND (x.live_latest_end_snapshot_this_month IS NOT NULL AND x.live_latest_end_snapshot_this_month > COALESCE(x.cache_latest_end_snapshot, '1900-01-01'::date) OR x.live_cases_loaded_through IS DISTINCT FROM x.cache_cases_loaded_through OR x.live_ar_snapshot_date IS DISTINCT FROM x.cache_ar_snapshot_date) THEN 'ALERT'::text
            WHEN (now() - x.oldest_refresh) > '02:00:00'::interval THEN 'WARN'::text
            WHEN hb.status = 'WARN'::text THEN 'WARN'::text
            ELSE 'GREEN'::text
        END AS status,
    x.master_refreshed_at,
    x.detail_refreshed_at,
    x.detail_rows,
    x.detail_tie_breaks
   FROM x
     LEFT JOIN hb ON true;
