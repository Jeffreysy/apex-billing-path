-- VP (supabase-auditor) 2026-10-16 -- AMENDS 20261016150000_exec_case_mix_funding_split (ddl 4dd6996a).
-- Jeff (2026-10-16): "put failed and bounced on a separate call list first".
-- No-money cases now split in two before the 7-day rule:
--   call_first : not sold, but >= 1 Failed attempt or "(Rejected)" eCheck on the case's own invoice keys since
--                open_date-3 (the client tried to pay). NO 7-day wait - an attempt is a call signal immediately. Not sold.
--   unfunded   : not sold, NO failed and NO bounced attempt, open_date <= payments_through - 7 -> delete review list.
--   awaiting   : not sold, no failed/bounced attempt, opened after payments_through - 7.
-- sold is unchanged. Invariant: sold + call_first + unfunded + awaiting = revenue_cases, and = contract_value to the cent.
-- APPEND-ONLY: v_exec_case_funding_status gains last_attempt_date; the chain gains call_first_cases,
-- call_first_contract_value (all prior columns keep name/order/type; unfunded_* now EXCLUDES call_first by design).
-- New call list: public.v_exec_call_first_case_invoices (read-only). v_exec_unfunded_case_invoices unchanged in text;
-- it now lists unfunded only (failed/bounced columns are 0 by construction). Nothing deletes or modifies an invoice.
-- Grants: authenticated SELECT, service_role ALL, no anon/public. Cadence unchanged (pg_cron exec-insights-cache-hourly).

create or replace view public.v_exec_case_funding_status with (security_invoker = true) as
 WITH inv AS (
         SELECT i.mycase_case_id,
            sum(i.amount) AS invoiced,
            sum(COALESCE(i.amount_paid, 0::numeric)) AS mycase_invoice_paid
           FROM mycase_invoices i
          WHERE i.amount > 0::numeric AND i.mycase_case_id IS NOT NULL
          GROUP BY i.mycase_case_id
        ), rev_cases AS (
         SELECT date_trunc('month'::text, d.open_date::timestamp with time zone)::date AS month,
            COALESCE(d.reporting_family, '(unspecified)'::text) AS reporting_family,
            d.mycase_case_id,
            d.case_number,
            d.case_name,
            d.client_id,
            d.open_date,
            v.invoiced,
            v.mycase_invoice_paid
           FROM v_case_dim d
             JOIN inv v ON v.mycase_case_id = d.mycase_case_id
          WHERE d.open_date >= (date_trunc('month'::text, CURRENT_DATE::timestamp with time zone) - '1 year'::interval)::date AND d.open_date <= CURRENT_DATE
        ), fresh AS (
         SELECT ( SELECT max(t.txn_date) AS max
                   FROM mycase_transactions_rich t
                  WHERE t.txn_date <= CURRENT_DATE) AS payments_through
        ), case_keys AS (
         SELECT DISTINCT regexp_replace(i.invoice_number, '\D'::text, ''::text, 'g'::text) AS ik,
            i.mycase_case_id
           FROM mycase_invoices i
          WHERE i.amount > 0::numeric AND i.mycase_case_id IS NOT NULL AND i.invoice_number ~ '\d'::text
        ), inv_key AS (
         SELECT k.ik,
            min(k.mycase_case_id) AS mycase_case_id
           FROM case_keys k
          GROUP BY k.ik
         HAVING count(*) = 1
        ), txn AS (
         SELECT regexp_replace(t.reference, '\D'::text, ''::text, 'g'::text) AS ik,
            t.txn_date,
            t.status,
            t.total,
            COALESCE(t.method, ''::text) ~* '\(rejected\)'::text AS is_rejected,
            COALESCE(t.bank_account, ''::text) ~* '^trust'::text AS is_trust
           FROM mycase_transactions_rich t
          WHERE t.reference ~ '\d'::text AND t.total > 0::numeric
            AND (t.status = ANY (ARRAY['Completed'::text, 'Offline'::text, 'Authorized'::text, 'Failed'::text]))
            AND COALESCE(t.method, ''::text) !~* '^refund'::text
        ), op_cash AS (
         SELECT r.mycase_case_id,
            sum(x.total) FILTER (WHERE (x.status = ANY (ARRAY['Completed'::text, 'Offline'::text])) AND NOT x.is_rejected) AS collected_to_date,
            sum(x.total) FILTER (WHERE x.status = 'Authorized'::text AND NOT x.is_rejected) AS pending_usd
           FROM rev_cases r
             JOIN inv_key k ON k.mycase_case_id = r.mycase_case_id
             JOIN txn x ON x.ik = k.ik AND x.txn_date >= (r.open_date - 3) AND NOT x.is_trust
          GROUP BY r.mycase_case_id
        ), any_money AS (
         SELECT r.mycase_case_id,
            sum(x.total) FILTER (WHERE (x.status = ANY (ARRAY['Completed'::text, 'Offline'::text, 'Authorized'::text])) AND NOT x.is_rejected) AS any_money_txn_usd,
            sum(x.total) FILTER (WHERE x.status = 'Failed'::text) AS failed_attempts_usd,
            sum(x.total) FILTER (WHERE (x.status = ANY (ARRAY['Completed'::text, 'Offline'::text, 'Authorized'::text])) AND x.is_rejected) AS bounced_usd,
            max(x.txn_date) FILTER (WHERE x.status = 'Failed'::text OR x.is_rejected) AS last_attempt_date
           FROM rev_cases r
             JOIN case_keys k ON k.mycase_case_id = r.mycase_case_id
             JOIN txn x ON x.ik = k.ik AND x.txn_date >= (r.open_date - 3)
          GROUP BY r.mycase_case_id
        ), c AS (
         SELECT r.month,
            r.reporting_family,
            r.mycase_case_id,
            r.case_number,
            r.case_name,
            r.client_id,
            r.open_date,
            round(r.invoiced, 2) AS contract_value,
            round(COALESCE(o.collected_to_date, 0::numeric), 2) AS collected_to_date,
            round(COALESCE(o.pending_usd, 0::numeric), 2) AS pending_usd,
            round(COALESCE(a.any_money_txn_usd, 0::numeric), 2) AS any_money_txn_usd,
            round(r.mycase_invoice_paid, 2) AS mycase_invoice_paid_usd,
            round(COALESCE(a.failed_attempts_usd, 0::numeric), 2) AS failed_attempts_usd,
            round(COALESCE(a.bounced_usd, 0::numeric), 2) AS bounced_usd,
            f.payments_through,
            f.payments_through - 7 AS funding_judged_through,
                CASE
                    WHEN COALESCE(o.collected_to_date, 0::numeric) > 0::numeric THEN 'operating_cash'::text
                    WHEN COALESCE(o.pending_usd, 0::numeric) > 0::numeric THEN 'pending_authorized'::text
                    WHEN COALESCE(a.any_money_txn_usd, 0::numeric) > 0::numeric THEN 'trust_or_shared_invoice_txn'::text
                    WHEN r.mycase_invoice_paid > 0::numeric THEN 'mycase_invoice_paid'::text
                    ELSE NULL::text
                END AS sold_basis,
            a.last_attempt_date
           FROM rev_cases r
             CROSS JOIN fresh f
             LEFT JOIN op_cash o ON o.mycase_case_id = r.mycase_case_id
             LEFT JOIN any_money a ON a.mycase_case_id = r.mycase_case_id
        )
 SELECT month,
    reporting_family,
    mycase_case_id,
    case_number,
    case_name,
    client_id,
    open_date,
    contract_value,
    collected_to_date,
    pending_usd,
    any_money_txn_usd,
    mycase_invoice_paid_usd,
    failed_attempts_usd,
    bounced_usd,
    payments_through,
    funding_judged_through,
    sold_basis,
        CASE
            WHEN sold_basis IS NOT NULL THEN 'sold'::text
            WHEN failed_attempts_usd > 0::numeric OR bounced_usd > 0::numeric THEN 'call_first'::text
            WHEN open_date <= funding_judged_through THEN 'unfunded'::text
            ELSE 'awaiting'::text
        END AS funding_status,
    last_attempt_date
   FROM c;

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
    f.payments_through,
    (count(*) FILTER (WHERE s.funding_status = 'sold'::text))::integer AS sold_cases,
    round(COALESCE(sum(r.invoiced) FILTER (WHERE s.funding_status = 'sold'::text), 0::numeric), 2) AS sold_contract_value,
    (count(*) FILTER (WHERE s.funding_status = 'unfunded'::text))::integer AS unfunded_cases,
    round(COALESCE(sum(r.invoiced) FILTER (WHERE s.funding_status = 'unfunded'::text), 0::numeric), 2) AS unfunded_contract_value,
    (count(*) FILTER (WHERE s.funding_status = 'awaiting'::text))::integer AS awaiting_cases,
    round(COALESCE(sum(r.invoiced) FILTER (WHERE s.funding_status = 'awaiting'::text), 0::numeric), 2) AS awaiting_contract_value,
    (count(*) FILTER (WHERE s.sold_basis = ANY (ARRAY['trust_or_shared_invoice_txn'::text, 'mycase_invoice_paid'::text])))::integer AS sold_other_money_cases,
    round(COALESCE(sum(r.invoiced) FILTER (WHERE s.sold_basis = ANY (ARRAY['trust_or_shared_invoice_txn'::text, 'mycase_invoice_paid'::text])), 0::numeric), 2) AS sold_other_money_value,
    f.payments_through - 7 AS funding_judged_through,
    (count(*) FILTER (WHERE s.funding_status = 'call_first'::text))::integer AS call_first_cases,
    round(COALESCE(sum(r.invoiced) FILTER (WHERE s.funding_status = 'call_first'::text), 0::numeric), 2) AS call_first_contract_value
   FROM rev_cases r
     CROSS JOIN fresh f
     LEFT JOIN case_cash c ON c.mycase_case_id = r.mycase_case_id
     LEFT JOIN case_inv_cov ci ON ci.mycase_case_id = r.mycase_case_id
     LEFT JOIN v_exec_case_funding_status s ON s.mycase_case_id = r.mycase_case_id
  GROUP BY r.month, r.reporting_family, f.cases_loaded_through, f.invoices_synced_at, f.payments_through;

-- the cache and its readers must be rebuilt to carry the appended columns
drop view public.v_exec_case_mix_funding_health;
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
    payments_through,
    sold_cases,
    sold_contract_value,
    unfunded_cases,
    unfunded_contract_value,
    awaiting_cases,
    awaiting_contract_value,
    sold_other_money_cases,
    sold_other_money_value,
    funding_judged_through,
    call_first_cases,
    call_first_contract_value
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
    payments_through,
    sold_cases,
    sold_contract_value,
    unfunded_cases,
    unfunded_contract_value,
    awaiting_cases,
    awaiting_contract_value,
    sold_other_money_cases,
    sold_other_money_value,
    funding_judged_through,
    call_first_cases,
    call_first_contract_value
   FROM mv_exec_case_mix_monthly;

-- recreated verbatim (pg_get_viewdef md5 3df9eb23a8bc519e2df39394147b4e1f before)
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

-- Call list (READ-ONLY): one row per contract_value invoice row on a CALL_FIRST case (client tried to pay).
create view public.v_exec_call_first_case_invoices with (security_invoker = true) as
 WITH u AS (
         SELECT s.month,
            s.reporting_family,
            s.mycase_case_id,
            s.case_number,
            s.case_name,
            s.client_id,
            s.open_date,
            s.payments_through,
            s.funding_judged_through,
            s.failed_attempts_usd AS case_failed_attempts_usd,
            s.bounced_usd AS case_bounced_usd,
            s.last_attempt_date AS case_last_attempt_date
           FROM v_exec_case_funding_status s
          WHERE s.funding_status = 'call_first'::text
        ), ui AS (
         SELECT u.month,
            u.reporting_family,
            u.mycase_case_id,
            u.case_number,
            u.case_name,
            u.client_id,
            u.open_date,
            u.payments_through,
            u.funding_judged_through,
            u.case_failed_attempts_usd,
            u.case_bounced_usd,
            u.case_last_attempt_date,
            i.id AS invoice_row_id,
            i.mycase_invoice_id,
            i.invoice_number,
            i.amount,
            i.issue_date,
            i.due_date,
            i.status,
            i.source_type,
            regexp_replace(i.invoice_number, '\D'::text, ''::text, 'g'::text) AS ik
           FROM u
             JOIN mycase_invoices i ON i.mycase_case_id = u.mycase_case_id
          WHERE i.amount > 0::numeric
        ), tx AS (
         SELECT ui.invoice_row_id,
            sum(t.total) FILTER (WHERE t.status = 'Failed'::text) AS failed_usd,
            sum(t.total) FILTER (WHERE (t.status = ANY (ARRAY['Completed'::text, 'Offline'::text, 'Authorized'::text])) AND COALESCE(t.method, ''::text) ~* '\(rejected\)'::text) AS bounced_usd,
            max(t.txn_date) FILTER (WHERE t.status = 'Failed'::text OR ((t.status = ANY (ARRAY['Completed'::text, 'Offline'::text, 'Authorized'::text])) AND COALESCE(t.method, ''::text) ~* '\(rejected\)'::text)) AS last_attempt_date
           FROM ui
             JOIN mycase_transactions_rich t ON regexp_replace(t.reference, '\D'::text, ''::text, 'g'::text) = ui.ik
          WHERE ui.invoice_number ~ '\d'::text AND t.reference ~ '\d'::text AND t.total > 0::numeric AND t.txn_date >= (ui.open_date - 3)
            AND COALESCE(t.method, ''::text) !~* '^refund'::text
          GROUP BY ui.invoice_row_id
        )
 SELECT ui.month,
    ui.reporting_family,
    ui.mycase_case_id,
    ui.case_number,
    ui.case_name,
    ui.client_id,
    ui.invoice_row_id,
    ui.mycase_invoice_id,
    ui.invoice_number,
    round(ui.amount, 2) AS invoice_amount,
    ui.issue_date,
    ui.due_date,
    ui.status AS invoice_status,
    ui.source_type,
    ui.open_date,
    round(COALESCE(tx.failed_usd, 0::numeric), 2) AS failed_attempts_usd,
    round(COALESCE(tx.bounced_usd, 0::numeric), 2) AS bounced_usd,
    tx.last_attempt_date,
    CURRENT_DATE - ui.open_date AS days_since_open,
    ui.payments_through,
    ui.funding_judged_through,
    ui.case_failed_attempts_usd,
    ui.case_bounced_usd,
    ui.case_last_attempt_date
   FROM ui
     LEFT JOIN tx ON tx.invoice_row_id = ui.invoice_row_id;

-- Invariant health (singleton), four groups + both lists tied to the live case authority.
create view public.v_exec_case_mix_funding_health with (security_invoker = true) as
 WITH m AS (
         SELECT count(*) AS cache_rows,
            count(*) FILTER (WHERE (m_1.sold_cases + m_1.call_first_cases + m_1.unfunded_cases + m_1.awaiting_cases) <> m_1.revenue_cases) AS case_breaks,
            count(*) FILTER (WHERE (m_1.sold_contract_value + m_1.call_first_contract_value + m_1.unfunded_contract_value + m_1.awaiting_contract_value) <> m_1.contract_value) AS value_breaks,
            count(*) FILTER (WHERE m_1.sold_cases IS NULL OR m_1.call_first_cases IS NULL OR m_1.unfunded_cases IS NULL OR m_1.awaiting_cases IS NULL) AS null_rows,
            max(m_1.refreshed_at) AS cache_refreshed_at
           FROM mv_exec_case_mix_monthly m_1
        ), s AS (
         SELECT count(*) FILTER (WHERE s_1.funding_status = 'unfunded'::text) AS live_unfunded_cases,
            COALESCE(sum(s_1.contract_value) FILTER (WHERE s_1.funding_status = 'unfunded'::text), 0::numeric) AS live_unfunded_value,
            count(*) FILTER (WHERE s_1.funding_status = 'call_first'::text) AS live_call_first_cases,
            COALESCE(sum(s_1.contract_value) FILTER (WHERE s_1.funding_status = 'call_first'::text), 0::numeric) AS live_call_first_value,
            count(*) - count(DISTINCT s_1.mycase_case_id) AS dup_case_rows
           FROM v_exec_case_funding_status s_1
        ), l AS (
         SELECT count(DISTINCT l_1.mycase_case_id) AS list_cases,
            count(*) AS list_invoices,
            COALESCE(sum(l_1.invoice_amount), 0::numeric) AS list_value,
            count(*) FILTER (WHERE l_1.failed_attempts_usd > 0::numeric OR l_1.bounced_usd > 0::numeric) AS list_rows_with_attempts
           FROM v_exec_unfunded_case_invoices l_1
        ), k AS (
         SELECT count(DISTINCT k_1.mycase_case_id) AS call_list_cases,
            count(*) AS call_list_invoices,
            COALESCE(sum(k_1.invoice_amount), 0::numeric) AS call_list_value
           FROM v_exec_call_first_case_invoices k_1
        )
 SELECT m.cache_rows,
    m.case_breaks,
    m.value_breaks,
    m.null_rows,
    s.dup_case_rows,
    s.live_unfunded_cases,
    s.live_unfunded_value,
    l.list_cases,
    l.list_invoices,
    l.list_value,
    m.cache_refreshed_at,
        CASE
            WHEN m.cache_rows = 0 OR m.case_breaks > 0 OR m.value_breaks > 0 OR m.null_rows > 0 OR s.dup_case_rows > 0 THEN 'ALERT'::text
            WHEN l.list_cases <> s.live_unfunded_cases OR l.list_value <> s.live_unfunded_value OR l.list_rows_with_attempts > 0 THEN 'ALERT'::text
            WHEN k.call_list_cases <> s.live_call_first_cases OR k.call_list_value <> s.live_call_first_value THEN 'ALERT'::text
            ELSE 'GREEN'::text
        END AS status,
    s.live_call_first_cases,
    s.live_call_first_value,
    k.call_list_cases,
    k.call_list_invoices,
    k.call_list_value,
    l.list_rows_with_attempts
   FROM m
     CROSS JOIN s
     CROSS JOIN l
     CROSS JOIN k;

-- grants: authenticated read, service_role all, no anon / public
revoke all on public.v_exec_case_funding_status, public.v_exec_case_mix_monthly_live, public.mv_exec_case_mix_monthly, public.v_exec_case_mix_monthly, public.v_exec_insights_cache_health, public.v_exec_unfunded_case_invoices, public.v_exec_call_first_case_invoices, public.v_exec_case_mix_funding_health from public, anon, authenticated;
grant select on public.v_exec_case_funding_status, public.v_exec_case_mix_monthly_live, public.mv_exec_case_mix_monthly, public.v_exec_case_mix_monthly, public.v_exec_insights_cache_health, public.v_exec_unfunded_case_invoices, public.v_exec_call_first_case_invoices, public.v_exec_case_mix_funding_health to authenticated;
grant all on public.v_exec_case_funding_status, public.v_exec_case_mix_monthly_live, public.mv_exec_case_mix_monthly, public.v_exec_case_mix_monthly, public.v_exec_insights_cache_health, public.v_exec_unfunded_case_invoices, public.v_exec_call_first_case_invoices, public.v_exec_case_mix_funding_health to service_role;

comment on view public.v_exec_case_funding_status is $c$GRAIN: one row per revenue case (mycase_case_id) in the Case Mix window (same population as v_exec_case_mix_monthly_live). KEY: mycase_case_id. Single authority for Jeff's 2026-10-16 rules ("no cash to account for = not a service sold, an invoice to delete"; "put failed and bounced on a separate call list first"). funding_status, in order: 'sold' (sold_basis, first match: operating_cash = collected_to_date > 0, settled operating non-rejected since open_date-3; pending_authorized = Authorized non-rejected operating since open_date-3; trust_or_shared_invoice_txn = non-rejected settled/Authorized money on an own invoice key not credited by the cash columns (Trust-account payment or a digits-key shared by >1 case); mycase_invoice_paid = MyCase invoice amount_paid > 0 with no ledger row, e.g. Jan-Mar 2026 invoices re-issued Apr 2026); 'call_first' (not sold, failed_attempts_usd > 0 or bounced_usd > 0 on own invoice keys since open_date-3 - no 7-day wait); 'unfunded' (no money, no attempt, open_date <= funding_judged_through = payments_through - 7); 'awaiting' (no money, no attempt, opened later; not sold). last_attempt_date = latest Failed / "(Rejected)" attempt. Read-only. VP 2026-10-16.$c$;
comment on view public.v_exec_unfunded_case_invoices is $c$GRAIN: one row per invoice row (mycase_invoices row with amount > 0 = a contract_value row) on a case whose v_exec_case_funding_status.funding_status = 'unfunded' (no money AND no failed/bounced attempt; cases with attempts are on v_exec_call_first_case_invoices). KEY: invoice_row_id (mycase_invoices.id). Delete review list - READ-ONLY REPORTING; nothing in the database deletes or modifies an invoice; deleting in MyCase is a human decision. invoice_number is text (never numeric). failed_attempts_usd / bounced_usd are 0 by construction (alarmed in v_exec_case_mix_funding_health). Ties to SUM(unfunded_cases / unfunded_contract_value). Live (not cached). authenticated SELECT only. VP 2026-10-16.$c$;
comment on view public.v_exec_call_first_case_invoices is $c$GRAIN: one row per invoice row (mycase_invoices row with amount > 0) on a case whose v_exec_case_funding_status.funding_status = 'call_first' (no settled/pending money, but >= 1 Failed attempt or "(Rejected)" eCheck - the client tried to pay; no 7-day wait). KEY: invoice_row_id (mycase_invoices.id). Call list - READ-ONLY REPORTING; modifies nothing. failed_attempts_usd / bounced_usd / last_attempt_date = this invoice's attempts since open_date-3 (any bank, refunds excluded; never cash); case_* columns = the same for the whole case (an invoice row can be 0 while its case has attempts on a sibling invoice). invoice_number is text. Ties to SUM(call_first_cases / call_first_contract_value). Live. authenticated SELECT only. VP 2026-10-16.$c$;
comment on view public.v_exec_case_mix_funding_health is $c$GRAIN: one row (singleton). Invariant health of the Case Mix funding split: ALERT when any cached (month, reporting_family) row breaks sold+call_first+unfunded+awaiting = revenue_cases or the four values summing to contract_value to the cent, a NULL split, a duplicate case in v_exec_case_funding_status, an empty cache, the delete list not tying to live unfunded (or carrying an attempt), or the call list not tying to live call_first. VP 2026-10-16.$c$;
comment on view public.v_exec_case_mix_monthly_live is $c$GRAIN: one row per (month, reporting_family). KEY: (month, reporting_family). revenue_cases = CASE-grain count (v_case_dim is one row per mycase_case_id).
Executive Insights "Case Mix" card (replaces the Net AR Change card). Services sold in a month = cases with v_case_dim.open_date in that month AND invoiced > 0, where invoiced = SUM(mycase_invoices.amount > 0) by mycase_case_id (revenue-model rule; synthetic invoice rows have mycase_case_id NULL and cannot enter). contract_value = SUM(invoiced) of those cases; avg_per_case = contract_value / revenue_cases. Rolling 13 months by open_date. cases_loaded_through = MAX(mycase_cases.open_date) and invoices_synced_at = MAX(mycase_invoices.synced_at): freshness of the MyCase case/invoice feeds - a month past cases_loaded_through is partial, not a collapse. Read-only, security_invoker. lexcollect-app-agent 2026-10-13, VP-certified.
CASH COLUMNS (VP 2026-10-16, Jeff's authorization; appended, existing columns unchanged): case -> its own contract_value invoices collapsed to one row per digits-only invoice key (a key on >1 case = 19-digit invoice-number collision, credited to no case) -> mycase_transactions_rich by digits-only reference (bank rule, never by name). Operating only (Trust bank accounts excluded), refund rows excluded, total > 0. paid_at_signing = settled (Completed/Offline, not "(Rejected)") with txn_date in [open_date-3, open_date+7]; collected_to_date = settled with txn_date >= open_date-3 (gross of later refunds); cases_with_cash = revenue cases with collected_to_date > 0; pending_at_signing = Authorized in window (not cash); failed_at_signing = Failed attempts in window (never cash); rejected_at_signing = eChecks MyCase still shows Completed/Offline/Authorized but marked "(Rejected)" in window (bounced, never cash; paid_at_signing + rejected_at_signing = the pre-VP prototype); cases_invoiced_at_signing = revenue cases with an own invoice issued by open_date+7 - when far below revenue_cases (Jan-Feb 2026: invoices re-issued Apr 2026) paid_at_signing is NOT measurable for that month, not a collapse; payments_through = MAX(mycase_transactions_rich.txn_date) - cash after this date has not landed yet.
FUNDING SPLIT (VP 2026-10-16, Jeff: "if there is no cash to account for lets not count that as a service sold" + "put failed and bounced on a separate call list first"; appended): from v_exec_case_funding_status (case-grain authority, see its comment). sold_cases/sold_contract_value = money accounted for (operating cash, Authorized pending, trust/shared-key payment, or MyCase invoice paid); call_first_cases/call_first_contract_value = no money but a failed or bounced attempt (call list v_exec_call_first_case_invoices; no 7-day wait); unfunded_cases/unfunded_contract_value = no money, no attempt, opened on/before funding_judged_through (= payments_through - 7) -> delete review list v_exec_unfunded_case_invoices; awaiting_cases/awaiting_contract_value = no money, no attempt, opened after funding_judged_through (too new; not sold). sold_other_money_cases/_value = the subset of sold whose only evidence is trust/shared-key or MyCase-paid. Invariants: sold+call_first+unfunded+awaiting = revenue_cases; the four values = contract_value to the cent (v_exec_case_mix_funding_health).$c$;
comment on materialized view public.mv_exec_case_mix_monthly is $c$GRAIN: one row per (month, reporting_family). KEY: (month, reporting_family) [unique index]. Hourly cache of v_exec_case_mix_monthly_live (certified logic, see its comment, incl. the 2026-10-16 cash columns and four-way funding split); refreshed_at = cache build time. Refreshed by public.refresh_exec_insights_cache() (pg_cron exec-insights-cache-hourly; heartbeat pipeline_heartbeat.job = exec_insights_cache). Funding invariants: v_exec_case_mix_funding_health.$c$;
comment on view public.v_exec_case_mix_monthly is $c$GRAIN: one row per (month, reporting_family). KEY: (month, reporting_family). App door for the Executive Insights "Case Mix" card: reads the hourly cache mv_exec_case_mix_monthly (logic: v_exec_case_mix_monthly_live). refreshed_at = cache build time, shown on the card. Cash columns (2026-10-16): paid_at_signing, collected_to_date, cases_with_cash, pending_at_signing, failed_at_signing, rejected_at_signing, cases_invoiced_at_signing, payments_through. Funding split (2026-10-16): sold_cases, sold_contract_value, call_first_cases, call_first_contract_value, unfunded_cases, unfunded_contract_value, awaiting_cases, awaiting_contract_value, sold_other_money_cases, sold_other_money_value, funding_judged_through - see v_exec_case_mix_monthly_live comment. security_invoker; authenticated SELECT only.$c$;
comment on view public.v_exec_insights_cache_health is $c$GRAIN: one row (singleton). Health of the Executive Insights + search caches (mv_exec_client_bucket_drift + mv_exec_case_mix_monthly + mv_exec_ar_at_risk + mv_client_search + mv_client_master_search; job exec_insights_cache; pg_cron exec-insights-cache-hourly). ALERT: never ran / RED heartbeat / older than 26 h / older than 2 h while a source moved (newer in-month MyCase CSV AR snapshot, case-feed date, or active AR snapshot not yet in the cache). WARN: older than 2 h, or heartbeat WARN (an empty cache, or mv_client_master_search open AR not tied to ar_dashboard within $1). VP 2026-10-13.$c$;
