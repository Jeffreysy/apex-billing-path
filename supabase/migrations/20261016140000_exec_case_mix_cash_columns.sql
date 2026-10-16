-- VP (supabase-auditor) 2026-10-16 -- Jeff's authorization (2026-10-16): add the cash that hit the bank to the
-- Executive Insights "Case Mix" chain alongside contract value. APPEND-ONLY: the 8 existing live columns
-- (9 in the cache/door) are unchanged in name, order, type and expression; new columns are appended at the end.
--
-- New columns (live, cache and door):
--   paid_at_signing      settled operating cash on the case's own invoices, txn_date in [open_date-3, open_date+7]
--   collected_to_date    settled operating cash on the case's own invoices, txn_date >= open_date-3
--   cases_with_cash      revenue cases with collected_to_date > 0
--   pending_at_signing   Authorized (not yet settled) in the signing window -- not cash
--   failed_at_signing    Failed attempts (total > 0) in the signing window -- never cash
--   rejected_at_signing  eCheck payments MyCase still shows as Completed/Offline/Authorized but whose method is
--                        marked "(Rejected)" (each has a negative "... Rejection" twin) -- bounced, never cash;
--                        kept separate so paid_at_signing + rejected_at_signing re-derives the prototype figure
--   cases_invoiced_at_signing  revenue cases with an own invoice issued by open_date+7 -- the coverage
--                        denominator: when low (Jan-Feb 2026: invoices re-issued Apr 2026) paid_at_signing is
--                        NOT measurable for that month and must not be read as a collapse
--   payments_through     max(mycase_transactions_rich.txn_date) -- freshness of the cash source
-- Definitions: case -> invoices = the same rows that make contract_value (mycase_invoices.amount > 0, real
-- mycase_case_id), collapsed to one row per digits-only invoice key; a key mapping to >1 case (19-digit
-- invoice-number collision across distinct MyCase invoices) is ambiguous and credited to no case.
-- invoice key -> mycase_transactions_rich by digits-only reference (bank rule, never by name).
-- settled = status Completed/Offline, total > 0, not a refund row, not "(Rejected)", trust bank accounts excluded.
-- Grants unchanged: authenticated SELECT, service_role ALL, no anon. Refresh cadence unchanged (pg_cron
-- exec-insights-cache-hourly -> refresh_exec_insights_cache()).

create or replace view public.v_exec_case_mix_monthly_live with (security_invoker = true) as
 WITH inv AS (
         SELECT i.mycase_case_id,
            sum(i.amount) AS invoiced
           FROM mycase_invoices i
          WHERE i.amount > 0::numeric AND i.mycase_case_id IS NOT NULL
          GROUP BY i.mycase_case_id
        ), rev_cases AS (
         SELECT date_trunc('month'::text, d.open_date::timestamp with time zone)::date AS month,
            COALESCE(d.reporting_family, '(unspecified)'::text) AS reporting_family,
            COALESCE(d.family_sort, 9999) AS family_sort,
            v.invoiced,
            d.mycase_case_id,
            d.open_date
           FROM v_case_dim d
             JOIN inv v ON v.mycase_case_id = d.mycase_case_id
          WHERE d.open_date >= (date_trunc('month'::text, CURRENT_DATE::timestamp with time zone) - '1 year'::interval)::date AND d.open_date <= CURRENT_DATE
        ), fresh AS (
         SELECT ( SELECT max(mycase_cases.open_date) AS max
                   FROM mycase_cases
                  WHERE mycase_cases.open_date <= CURRENT_DATE) AS cases_loaded_through,
            ( SELECT max(mycase_invoices.synced_at) AS max
                   FROM mycase_invoices
                  WHERE mycase_invoices.mycase_case_id IS NOT NULL) AS invoices_synced_at,
            ( SELECT max(t.txn_date) AS max
                   FROM mycase_transactions_rich t
                  WHERE t.txn_date <= CURRENT_DATE) AS payments_through
        ), inv_key AS (
         SELECT k.ik,
            min(k.mycase_case_id) AS mycase_case_id
           FROM ( SELECT DISTINCT regexp_replace(i.invoice_number, '\D'::text, ''::text, 'g'::text) AS ik,
                    i.mycase_case_id
                   FROM mycase_invoices i
                  WHERE i.amount > 0::numeric AND i.mycase_case_id IS NOT NULL AND i.invoice_number ~ '\d'::text) k
          GROUP BY k.ik
         HAVING count(*) = 1
        ), txn AS (
         SELECT regexp_replace(t.reference, '\D'::text, ''::text, 'g'::text) AS ik,
            t.txn_date,
            t.status,
            t.total,
            COALESCE(t.method, ''::text) ~* '\(rejected\)'::text AS is_rejected
           FROM mycase_transactions_rich t
          WHERE t.reference ~ '\d'::text AND t.total > 0::numeric
            AND (t.status = ANY (ARRAY['Completed'::text, 'Offline'::text, 'Authorized'::text, 'Failed'::text]))
            AND COALESCE(t.bank_account, ''::text) !~* '^trust'::text
            AND COALESCE(t.method, ''::text) !~* '^refund'::text
        ), case_cash AS (
         SELECT r.mycase_case_id,
            sum(x.total) FILTER (WHERE (x.status = ANY (ARRAY['Completed'::text, 'Offline'::text])) AND NOT x.is_rejected AND x.txn_date <= (r.open_date + 7)) AS paid_at_signing,
            sum(x.total) FILTER (WHERE (x.status = ANY (ARRAY['Completed'::text, 'Offline'::text])) AND NOT x.is_rejected) AS collected_to_date,
            sum(x.total) FILTER (WHERE x.status = 'Authorized'::text AND NOT x.is_rejected AND x.txn_date <= (r.open_date + 7)) AS pending_at_signing,
            sum(x.total) FILTER (WHERE x.status = 'Failed'::text AND x.txn_date <= (r.open_date + 7)) AS failed_at_signing,
            sum(x.total) FILTER (WHERE (x.status = ANY (ARRAY['Completed'::text, 'Offline'::text, 'Authorized'::text])) AND x.is_rejected AND x.txn_date <= (r.open_date + 7)) AS rejected_at_signing
           FROM rev_cases r
             JOIN inv_key k ON k.mycase_case_id = r.mycase_case_id
             JOIN txn x ON x.ik = k.ik AND x.txn_date >= (r.open_date - 3)
          GROUP BY r.mycase_case_id
        ), case_inv_cov AS (
         SELECT DISTINCT r.mycase_case_id
           FROM rev_cases r
             JOIN mycase_invoices i ON i.mycase_case_id = r.mycase_case_id
          WHERE i.amount > 0::numeric AND i.issue_date <= (r.open_date + 7)
        )
 SELECT r.month,
    r.reporting_family,
    min(r.family_sort) AS family_sort,
    count(*) AS revenue_cases,
    round(sum(r.invoiced), 2) AS contract_value,
    round(sum(r.invoiced) / count(*)::numeric, 2) AS avg_per_case,
    f.cases_loaded_through,
    f.invoices_synced_at,
    round(COALESCE(sum(c.paid_at_signing), 0::numeric), 2) AS paid_at_signing,
    round(COALESCE(sum(c.collected_to_date), 0::numeric), 2) AS collected_to_date,
    (count(*) FILTER (WHERE c.collected_to_date > 0::numeric))::integer AS cases_with_cash,
    round(COALESCE(sum(c.pending_at_signing), 0::numeric), 2) AS pending_at_signing,
    round(COALESCE(sum(c.failed_at_signing), 0::numeric), 2) AS failed_at_signing,
    round(COALESCE(sum(c.rejected_at_signing), 0::numeric), 2) AS rejected_at_signing,
    (count(*) FILTER (WHERE ci.mycase_case_id IS NOT NULL))::integer AS cases_invoiced_at_signing,
    f.payments_through
   FROM rev_cases r
     CROSS JOIN fresh f
     LEFT JOIN case_cash c ON c.mycase_case_id = r.mycase_case_id
     LEFT JOIN case_inv_cov ci ON ci.mycase_case_id = r.mycase_case_id
  GROUP BY r.month, r.reporting_family, f.cases_loaded_through, f.invoices_synced_at, f.payments_through;

-- the cache and its two readers must be rebuilt to carry the appended columns
drop view public.v_exec_insights_cache_health;
drop view public.v_exec_case_mix_monthly;
drop materialized view public.mv_exec_case_mix_monthly;

create materialized view public.mv_exec_case_mix_monthly as
 SELECT month,
    reporting_family,
    family_sort,
    revenue_cases,
    contract_value,
    avg_per_case,
    cases_loaded_through,
    invoices_synced_at,
    now() AS refreshed_at,
    paid_at_signing,
    collected_to_date,
    cases_with_cash,
    pending_at_signing,
    failed_at_signing,
    rejected_at_signing,
    cases_invoiced_at_signing,
    payments_through
   FROM v_exec_case_mix_monthly_live l;
create unique index mv_exec_case_mix_monthly_key on public.mv_exec_case_mix_monthly using btree (month, reporting_family);

create view public.v_exec_case_mix_monthly with (security_invoker = true) as
 SELECT month,
    reporting_family,
    family_sort,
    revenue_cases,
    contract_value,
    avg_per_case,
    cases_loaded_through,
    invoices_synced_at,
    refreshed_at,
    paid_at_signing,
    collected_to_date,
    cases_with_cash,
    pending_at_signing,
    failed_at_signing,
    rejected_at_signing,
    cases_invoiced_at_signing,
    payments_through
   FROM mv_exec_case_mix_monthly;

-- recreated verbatim (pg_get_viewdef as of 2026-10-16, no change)
create view public.v_exec_insights_cache_health as
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
                   FROM mv_exec_ar_at_risk) AS cache_ar_snapshot_date
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
            src.live_latest_end_snapshot_this_month,
            src.live_cases_loaded_through,
            src.live_ar_snapshot_date,
            LEAST(c.drift_refreshed_at, c.mix_refreshed_at, c.risk_refreshed_at, c.search_refreshed_at, c.master_refreshed_at) AS oldest_refresh
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
            WHEN hb.last_run_at IS NULL OR x.drift_refreshed_at IS NULL OR x.mix_refreshed_at IS NULL OR x.risk_refreshed_at IS NULL OR x.search_refreshed_at IS NULL OR x.master_refreshed_at IS NULL THEN 'ALERT'::text
            WHEN hb.status IS DISTINCT FROM 'GREEN'::text AND hb.status IS DISTINCT FROM 'WARN'::text THEN 'ALERT'::text
            WHEN (now() - x.oldest_refresh) > '26:00:00'::interval THEN 'ALERT'::text
            WHEN (now() - x.oldest_refresh) > '02:00:00'::interval AND (x.live_latest_end_snapshot_this_month IS NOT NULL AND x.live_latest_end_snapshot_this_month > COALESCE(x.cache_latest_end_snapshot, '1900-01-01'::date) OR x.live_cases_loaded_through IS DISTINCT FROM x.cache_cases_loaded_through OR x.live_ar_snapshot_date IS DISTINCT FROM x.cache_ar_snapshot_date) THEN 'ALERT'::text
            WHEN (now() - x.oldest_refresh) > '02:00:00'::interval THEN 'WARN'::text
            WHEN hb.status = 'WARN'::text THEN 'WARN'::text
            ELSE 'GREEN'::text
        END AS status,
    x.master_refreshed_at
   FROM x
     LEFT JOIN hb ON true;

-- grants: identical to before (authenticated read, service_role all, no anon / public)
revoke all on public.v_exec_case_mix_monthly_live, public.mv_exec_case_mix_monthly, public.v_exec_case_mix_monthly, public.v_exec_insights_cache_health from public, anon, authenticated;
grant select on public.v_exec_case_mix_monthly_live, public.mv_exec_case_mix_monthly, public.v_exec_case_mix_monthly, public.v_exec_insights_cache_health to authenticated;
grant all on public.v_exec_case_mix_monthly_live, public.mv_exec_case_mix_monthly, public.v_exec_case_mix_monthly, public.v_exec_insights_cache_health to service_role;

comment on view public.v_exec_case_mix_monthly_live is $c$GRAIN: one row per (month, reporting_family). KEY: (month, reporting_family). revenue_cases = CASE-grain count (v_case_dim is one row per mycase_case_id).
Executive Insights "Case Mix" card (replaces the Net AR Change card). Services sold in a month = cases with v_case_dim.open_date in that month AND invoiced > 0, where invoiced = SUM(mycase_invoices.amount > 0) by mycase_case_id (revenue-model rule; synthetic invoice rows have mycase_case_id NULL and cannot enter). contract_value = SUM(invoiced) of those cases; avg_per_case = contract_value / revenue_cases. Rolling 13 months by open_date. cases_loaded_through = MAX(mycase_cases.open_date) and invoices_synced_at = MAX(mycase_invoices.synced_at): freshness of the MyCase case/invoice feeds - a month past cases_loaded_through is partial, not a collapse. Read-only, security_invoker. lexcollect-app-agent 2026-10-13, VP-certified.
CASH COLUMNS (VP 2026-10-16, Jeff's authorization; appended, existing columns unchanged): case -> its own contract_value invoices collapsed to one row per digits-only invoice key (a key on >1 case = 19-digit invoice-number collision, credited to no case) -> mycase_transactions_rich by digits-only reference (bank rule, never by name). Operating only (Trust bank accounts excluded), refund rows excluded, total > 0. paid_at_signing = settled (Completed/Offline, not "(Rejected)") with txn_date in [open_date-3, open_date+7]; collected_to_date = settled with txn_date >= open_date-3 (gross of later refunds); cases_with_cash = revenue cases with collected_to_date > 0; pending_at_signing = Authorized in window (not cash); failed_at_signing = Failed attempts in window (never cash); rejected_at_signing = eChecks MyCase still shows Completed/Offline/Authorized but marked "(Rejected)" in window (bounced, never cash; paid_at_signing + rejected_at_signing = the pre-VP prototype); cases_invoiced_at_signing = revenue cases with an own invoice issued by open_date+7 - when far below revenue_cases (Jan-Feb 2026: invoices re-issued Apr 2026) paid_at_signing is NOT measurable for that month, not a collapse; payments_through = MAX(mycase_transactions_rich.txn_date) - cash after this date has not landed yet.$c$;
comment on materialized view public.mv_exec_case_mix_monthly is $c$GRAIN: one row per (month, reporting_family). KEY: (month, reporting_family) [unique index]. Hourly cache of v_exec_case_mix_monthly_live (certified logic, see its comment, incl. the 2026-10-16 cash columns); refreshed_at = cache build time. Refreshed by public.refresh_exec_insights_cache() (pg_cron exec-insights-cache-hourly; heartbeat pipeline_heartbeat.job = exec_insights_cache).$c$;
comment on view public.v_exec_case_mix_monthly is $c$GRAIN: one row per (month, reporting_family). KEY: (month, reporting_family). App door for the Executive Insights "Case Mix" card: reads the hourly cache mv_exec_case_mix_monthly (logic: v_exec_case_mix_monthly_live). refreshed_at = cache build time, shown on the card. Cash columns (2026-10-16): paid_at_signing, collected_to_date, cases_with_cash, pending_at_signing, failed_at_signing, rejected_at_signing, cases_invoiced_at_signing, payments_through - see v_exec_case_mix_monthly_live comment. security_invoker; authenticated SELECT only.$c$;
comment on view public.v_exec_insights_cache_health is $c$GRAIN: one row (singleton). Health of the Executive Insights + search caches (mv_exec_client_bucket_drift + mv_exec_case_mix_monthly + mv_exec_ar_at_risk + mv_client_search + mv_client_master_search; job exec_insights_cache; pg_cron exec-insights-cache-hourly). ALERT: never ran / RED heartbeat / older than 26 h / older than 2 h while a source moved (newer in-month MyCase CSV AR snapshot, case-feed date, or active AR snapshot not yet in the cache). WARN: older than 2 h, or heartbeat WARN (an empty cache, or mv_client_master_search open AR not tied to ar_dashboard within $1). VP 2026-10-13.$c$;
