-- ============================================================================
-- 2026-10-14  Delinquent-collections KEY METRIC layer (LexCollect, tenant-ready)  -- r3 (VP-certified)
--
-- Jeff Soto-Gil, 2026-10-14: "lets circle back to this and make sure that we
-- track this metric in lex collect to for any firm that I work with and
-- especialy for ERL, we should know delquent dollars collected that should be
-- a key metrick for as along with willing payers and if we have added any new
-- payers manualy or automaticaly should be baked in there please have the
-- agents work on this and wiring it into the lexcollect app"
--
-- Builds ON the delinquent-cash spine (mv_delinquent_cash_txn, 2026-09-18,
-- ddl keys delinquent_cash_spine_20260918 / _r2). Adds NO new delinquency
-- classification: every dollar is a filter of mv_delinquent_cash_txn, so the
-- panel ties to the spine by construction.
--
-- r2 = client-ar-agent definition review 2026-10-14 applied:
--   * resumed payer v2: silence test sees ANY spine payment by the same client
--     key OR payer key, strict window (a payment exactly N days back is not silence)
--   * first-ever payer -> INTAKE payer (consult-size vs retainer-size, on-AR-now);
--     no manual/automatic split (all manual by construction)
--   * new plans reported PER FEED LOAD (days covered), single client key
--     tokenset_key(normalized_contact); never compared month over month
--   * broken auto-draft v2: failed-draft split + 7-day grace
--
--   1. dcm_ledger_cutoff(tz)                      ledger's real "complete through" day
--   2. delinquent_collections_metrics(start, end, silence_days, consult_max)
--                                                 every windowed metric (ONE definition)
--   3. dcm_broken_autodraft(tz, grace_days)       point-in-time cohort
--   4. dcm_new_plans_by_load()                    new plans per plan-feed load
--   5. mv_delinquent_collections_kpi (+ v_)       cached period rows the app reads
--   6. mv_delinquent_collections_plan_loads (+ v_) cached per-load rows
--   7. two indexes on mv_delinquent_cash_txn (resumed-payer lookups)
--   8. refresh_delinquent_cash_spine()            now also refreshes 5 + 6
--
-- Nothing here writes or changes any existing row.
--
-- r3 = VP (supabase-auditor) certification edits 2026-10-14, each marked "VP r3":
--   a. dcm_ledger_cutoff: the load-date term reads only the loads that touched the
--      newest ledger day, so a later BACKFILL load (older window) can no longer
--      promote a partial newest day to "complete". Same result today (2026-10-12).
--   b. Grants: REVOKE ALL from authenticated before GRANT SELECT on the 2 matviews
--      and 2 views. Postgres-owned relations default to authenticated=rxtm, and
--      MAINTAIN (m) lets any app session REFRESH a matview (ACCESS EXCLUSIVE lock).
--      Same pattern as vp_20261014_mv_ar_waterfall / FF-2026-0014.
--   c. refresh_delinquent_cash_spine(): EXECUTE revoked from authenticated (only the
--      07:30 job, as postgres, calls it); heartbeat status = WARN when the ledger's
--      complete_through is more than 8 days behind the firm-local date, so the
--      heartbeat can no longer read GREEN over a dark transaction feed.
--   d. broken auto-draft comment: states that 100% of the cohort's plans sit on the
--      AR book (468/468 on the 2026-10-12 snapshot) - plan_balance is a SUBSET of AR.
--   e. view-security watchman: the new KPI matview's expected matview_rls_bypass
--      finding (aggregate rows only, no client identifiers) is baselined under this
--      migration's cert key; any OTHER finding on the new objects stays NEW/ALERT.
-- ============================================================================

-- ---------------------------------------------------------------- 7. spine indexes
create index if not exists mv_dct_client_date on public.mv_delinquent_cash_txn (resolved_client_key, txn_date);
create index if not exists mv_dct_payer_date  on public.mv_delinquent_cash_txn (payer_key, txn_date);

-- ---------------------------------------------------------------- 1. cutoff
-- A day is COMPLETE only if the latest ledger load ran after that day ended (firm-local time).
create or replace function public.dcm_ledger_cutoff(p_tz text default 'America/New_York')
returns table (ledger_max_txn_date date, ledger_last_loaded_at timestamptz, complete_through date)
language sql stable security invoker set search_path = public
as $$
  -- VP r3: loaded_at is read only from rows ON the newest ledger day, so a later
  -- backfill load of an older window cannot mark a partial newest day complete.
  with m as (select max(txn_date) as mx from public.mycase_transactions_rich)
  select m.mx,
         max(r.loaded_at),
         least(m.mx, ((max(r.loaded_at) at time zone p_tz)::date - 1))
  from m
  left join public.mycase_transactions_rich r on r.txn_date = m.mx
  group by m.mx
$$;
comment on function public.dcm_ledger_cutoff(text) is
  'Delinquent-collections KPI (Jeff 2026-10-14; VP r3). complete_through = last day the MyCase transaction ledger fully covers: least(max txn_date, firm-local date of the latest load that touched the max txn_date - 1). ledger_last_loaded_at = that load time. A backfill of an older window does not move it. p_tz = the firm''s local time zone (tenant parameter).';

-- ---------------------------------------------------------------- 2. windowed metrics
create or replace function public.delinquent_collections_metrics(
    p_start date, p_end date, p_silence_days integer default 60, p_consult_max numeric default 300)
returns table (
    period_start date,
    period_end date,
    -- cash (TRANSACTION grain)
    settled_cash numeric,
    manual_cash numeric,
    autopay_cash numeric,
    delinquent_cash numeric,
    delinquent_manual_cash numeric,
    delinquent_autopay_cash numeric,
    delinquent_31plus_cash numeric,
    delinquent_manual_31plus_cash numeric,
    delinquent_autopay_31plus_cash numeric,
    n_delinquent_txns bigint,
    n_delinquent_manual_txns bigint,
    n_delinquent_autopay_txns bigint,
    -- willing payers (CLIENT grain = distinct resolved_client_key, the AR-snapshot client key)
    willing_payers bigint,
    willing_payers_manual bigint,
    willing_payers_autopay bigint,
    willing_payers_31plus bigint,
    -- new payers
    payer_metrics_valid boolean,
    silence_days integer,
    consult_max numeric,
    intake_payers bigint,                -- PAYER grain (payer_key)
    intake_payers_consult_size bigint,
    intake_payers_retainer_size bigint,
    intake_payers_on_ar_now bigint,
    intake_cash numeric,
    resumed_payers bigint,               -- CLIENT grain (resolved_client_key), subset of willing_payers
    resumed_payers_manual bigint,
    resumed_payers_automatic bigint,
    -- data quality
    unresolved_cash numeric,
    unresolved_pct numeric,
    new_client_cash numeric,
    snapshot_in_force_latest date,
    snapshot_lag_max_days integer,
    quality text
)
language sql stable security invoker set search_path = public
as $$
with t as (
    select * from public.mv_delinquent_cash_txn
    where txn_date between p_start and p_end
      and cash_class <> 'excluded_filevine_rerecord'
),
valid as (
    select (p_start >= min(txn_date) + p_silence_days) as ok from public.mv_delinquent_cash_txn
),
-- resumed (dcm.resumed_payer.v2): a delinquent payment in the window with NO spine payment of any class
-- by the same client key or the same payer key in the p_silence_days before it.
resumed as (
    select distinct on (h.resolved_client_key) h.resolved_client_key, h.is_autopay
    from public.mv_delinquent_cash_txn h
    where h.txn_date between p_start and p_end
      and h.cash_class = 'delinquent'
      -- two NOT EXISTS (same logic as one NOT EXISTS over an OR) so each uses its own index
      and not exists (
          select 1 from public.mv_delinquent_cash_txn y
          where y.resolved_client_key = h.resolved_client_key
            and y.txn_date >= h.txn_date - p_silence_days and y.txn_date < h.txn_date)
      and not exists (
          select 1 from public.mv_delinquent_cash_txn y
          where coalesce(h.payer_key, '') <> '' and y.payer_key = h.payer_key
            and y.txn_date >= h.txn_date - p_silence_days and y.txn_date < h.txn_date)
    order by h.resolved_client_key, h.txn_date, h.txn_id
),
-- intake (dcm.intake_payer.v1): the payer's earliest spine payment is a new_client_not_in_snapshot row in the window
-- (only payers with a new_client_not_in_snapshot row in the window can qualify, so look only at them)
firsts as (
    select distinct on (x.payer_key) x.payer_key, x.txn_date, x.cash_class, x.amount
    from public.mv_delinquent_cash_txn x
    where x.payer_key in (select t1.payer_key from t t1
                          where t1.cash_class = 'new_client_not_in_snapshot' and coalesce(t1.payer_key, '') <> '')
      and x.cash_class <> 'excluded_filevine_rerecord'
    order by x.payer_key, x.txn_date, x.txn_id
),
intake as (
    select f.* from firsts f
    where f.txn_date between p_start and p_end and f.cash_class = 'new_client_not_in_snapshot'
),
ar_now as materialized (
    select c.client_key from public.mv_dcs_snapshot_client c
    where c.snapshot_date = (select max(snapshot_date) from public.mv_dcs_snapshot_client)
)
select
    p_start, p_end,
    round(coalesce(sum(t.amount), 0), 2),
    round(coalesce(sum(t.amount) filter (where not t.is_autopay), 0), 2),
    round(coalesce(sum(t.amount) filter (where t.is_autopay), 0), 2),
    round(coalesce(sum(t.amount) filter (where t.cash_class = 'delinquent'), 0), 2),
    round(coalesce(sum(t.amount) filter (where t.cash_class = 'delinquent' and not t.is_autopay), 0), 2),
    round(coalesce(sum(t.amount) filter (where t.cash_class = 'delinquent' and t.is_autopay), 0), 2),
    round(coalesce(sum(t.amount) filter (where t.cash_class = 'delinquent' and t.dpd_bucket <> '1-30'), 0), 2),
    round(coalesce(sum(t.amount) filter (where t.cash_class = 'delinquent' and not t.is_autopay and t.dpd_bucket <> '1-30'), 0), 2),
    round(coalesce(sum(t.amount) filter (where t.cash_class = 'delinquent' and t.is_autopay and t.dpd_bucket <> '1-30'), 0), 2),
    count(*) filter (where t.cash_class = 'delinquent'),
    count(*) filter (where t.cash_class = 'delinquent' and not t.is_autopay),
    count(*) filter (where t.cash_class = 'delinquent' and t.is_autopay),
    count(distinct t.resolved_client_key) filter (where t.cash_class = 'delinquent'),
    count(distinct t.resolved_client_key) filter (where t.cash_class = 'delinquent' and not t.is_autopay),
    count(distinct t.resolved_client_key) filter (where t.cash_class = 'delinquent' and t.is_autopay),
    count(distinct t.resolved_client_key) filter (where t.cash_class = 'delinquent' and t.dpd_bucket <> '1-30'),
    (select ok from valid),
    p_silence_days,
    p_consult_max,
    (select count(*) from intake),
    (select count(*) from intake where amount <= p_consult_max),
    (select count(*) from intake where amount > p_consult_max),
    (select count(*) from intake i where i.payer_key in (select a.client_key from ar_now a)),
    (select round(coalesce(sum(t2.amount), 0), 2) from t t2 where t2.payer_key in (select payer_key from intake)),
    case when (select ok from valid) then (select count(*) from resumed) end,
    case when (select ok from valid) then (select count(*) from resumed where not is_autopay) end,
    case when (select ok from valid) then (select count(*) from resumed where is_autopay) end,
    round(coalesce(sum(t.amount) filter (where t.cash_class like 'unresolved%'), 0), 2),
    case when coalesce(sum(t.amount), 0) > 0
         then round(100.0 * coalesce(sum(t.amount) filter (where t.cash_class like 'unresolved%'), 0) / sum(t.amount), 1) end,
    round(coalesce(sum(t.amount) filter (where t.cash_class = 'new_client_not_in_snapshot'), 0), 2),
    max(t.snap_date),
    max(t.snapshot_lag_days),
    case when count(*) = 0 then 'NO ROWS'
         when max(t.snapshot_lag_days) > 35 then 'DEGRADED: in-force AR snapshot > 35 days old'
         when coalesce(sum(t.amount) filter (where t.cash_class like 'unresolved%'), 0) > 0.15 * sum(t.amount)
              then 'WARN: > 15% of cash unresolved to a client'
         else 'OK' end
from t
$$;
comment on function public.delinquent_collections_metrics(date, date, integer, numeric) is
  'Delinquent-collections KPI (Jeff 2026-10-14), ONE definition for any window [p_start, p_end]. dcm.delinquent_cash.v1 (TRANSACTION grain): mv_delinquent_cash_txn cash_class=delinquent; manual = NOT is_autopay; 31+ = dpd_bucket <> 1-30. dcm.willing_payer.v1 (CLIENT grain, resolved_client_key = AR-snapshot client key): distinct clients with >=1 delinquent payment. dcm.intake_payer.v1 (PAYER grain, payer_key): earliest spine payment is a new_client_not_in_snapshot row in the window; consult-size = first payment <= p_consult_max; on_ar_now = payer key on the latest AR snapshot. dcm.resumed_payer.v2 (CLIENT grain, subset of willing payers): delinquent payment in the window with no spine payment by the same client key or payer key in the prior p_silence_days days; earliest qualifying payment decides manual vs automatic. Payer counts NULL when the window starts within p_silence_days of the spine floor.';

-- ---------------------------------------------------------------- 3. broken auto-draft cohort
create or replace function public.dcm_broken_autodraft(p_tz text default 'America/New_York', p_grace_days integer default 7)
returns table (plans_as_of date, grace_days integer,
               broken_autodraft_plans bigint, broken_autodraft_clients bigint, broken_autodraft_plan_balance numeric,
               failed_draft_plans bigint, failed_draft_plan_balance numeric,
               failed_before_due_only_plans bigint, failed_before_due_only_plan_balance numeric,
               no_failed_draft_plans bigint, no_failed_draft_plan_balance numeric)
language sql stable security invoker set search_path = public
as $$
  with a as (select (max(last_synced_at) at time zone p_tz)::date as as_of
             from public.mycase_payment_plans where retired_at is null),
  fails as (select tokenset_key(k.payer_name) as ck, max(k.txn_date) as last_fail
            from public.v_mycase_txn_settlement_key k
            where k.is_autopay and k.status = 'Failed'
            group by 1),
  c as (
    select p.invoice_number, p.amount_due, p.next_due_date_norm,
           coalesce(nullif(tokenset_key(p.normalized_contact), ''), 'invoice:' || p.invoice_number) as client_key,
           f.last_fail
    from public.mycase_payment_plans p
    cross join a
    left join fails f on f.ck = tokenset_key(p.normalized_contact)
    where p.retired_at is null and p.autopay and p.amount_due > 0
      and p.next_due_date_norm < a.as_of - p_grace_days
  )
  select a.as_of, p_grace_days,
         count(c.invoice_number), count(distinct c.client_key), round(coalesce(sum(c.amount_due), 0), 2),
         count(c.invoice_number) filter (where c.last_fail >= c.next_due_date_norm),
         round(coalesce(sum(c.amount_due) filter (where c.last_fail >= c.next_due_date_norm), 0), 2),
         count(c.invoice_number) filter (where c.last_fail < c.next_due_date_norm),
         round(coalesce(sum(c.amount_due) filter (where c.last_fail < c.next_due_date_norm), 0), 2),
         count(c.invoice_number) filter (where c.last_fail is null),
         round(coalesce(sum(c.amount_due) filter (where c.last_fail is null), 0), 2)
  from a left join c on true
  group by a.as_of
$$;
comment on function public.dcm_broken_autodraft(text, integer) is
  'Cohort dcm.broken_autodraft.v2 (Jeff 2026-10-14; client-ar review): live (not retired) MyCase payment plans with autopay ON, amount_due > 0 and next_due_date_norm more than p_grace_days before the plan feed as-of date ("autopay on, plan past due"). Split by the MyCase ledger''s failed autopay drafts matched on tokenset_key(normalized_contact): failed_draft = last failure on/after the missed due date (real card failure); failed_before_due_only; no_failed_draft = clean stop (DO-NOT-DUN). PLAN grain; clients = distinct tokenset_key(normalized_contact). plan_balance is plan structure, NOT AR - never add it to AR or sum its clients with willing payers. VP r3: it is a SUBSET of the AR book (468 of 468 plans / $2,127,551 sit on the 2026-10-12 AR snapshot 734dedb0) - show it as "of AR", never "plus AR". Count KPI, not an outreach list.';

-- ---------------------------------------------------------------- 4. new plans per feed load
create or replace function public.dcm_new_plans_by_load()
returns table (load_as_of date, prev_load_as_of date, days_covered integer,
               new_plans bigint, new_plans_autopay bigint, new_plans_manual bigint, new_plans_autopay_unknown bigint,
               new_plan_clients bigint, new_plan_clients_autopay bigint, new_plan_clients_manual bigint)
language sql stable security invoker set search_path = public
as $$
  with loads as (
    select as_of, lag(as_of) over (order by as_of) as prev from (select distinct as_of from public.payment_plan_state_history) d
  ),
  pf as (
    select h.invoice_number, min(h.as_of) as as_of,
           (array_agg(h.autopay order by h.as_of, h.row_seq) filter (where h.autopay is not null))[1] as autopay,
           (array_agg(h.normalized_contact order by h.as_of, h.row_seq))[1] as normalized_contact
    from public.payment_plan_state_history h
    group by h.invoice_number
  ),
  k as (
    select pf.*, coalesce(nullif(tokenset_key(pf.normalized_contact), ''), 'invoice:' || pf.invoice_number) as client_key from pf
  )
  select l.as_of, l.prev, (l.as_of - l.prev),
         count(k.invoice_number),
         count(k.invoice_number) filter (where k.autopay),
         count(k.invoice_number) filter (where not k.autopay),
         count(k.invoice_number) filter (where k.autopay is null),
         count(distinct k.client_key),
         count(distinct k.client_key) filter (where k.autopay),
         count(distinct k.client_key) filter (where not k.autopay)
  from loads l
  left join k on k.as_of = l.as_of
  where l.prev is not null          -- the first (bootstrap) load is not "new"
  group by l.as_of, l.prev
$$;
comment on function public.dcm_new_plans_by_load() is
  'Cohort dcm.new_plan_seen.v2 (Jeff 2026-10-14; client-ar review): payment plans (invoice_number) first appearing in the append-only payment_plan_state_history, reported PER FEED LOAD with the days it covers (dated by feed load, NOT by MyCase plan creation; never compare loads month over month). autopay = first non-null observation (the 2026-09-01 load wrote NULL), else unknown. Automatic = autopay on, manual = no autopay. Client key = tokenset_key(normalized_contact). PLAN grain -> clients; never added to payer counts.';

-- ---------------------------------------------------------------- 5. cached period rows
drop view if exists public.v_delinquent_collections_kpi;
drop materialized view if exists public.mv_delinquent_collections_kpi;
create materialized view public.mv_delinquent_collections_kpi as
with b as (
    select c.*, date_trunc('month', c.complete_through)::date as m0,
           (date_trunc('month', c.complete_through) - interval '1 month')::date as pm0,
           (select min(txn_date) from public.mv_delinquent_cash_txn) as d0
    from public.dcm_ledger_cutoff() c
),
periods as (
    select 'mtd'::text as period_kind, b.m0 as ps, b.complete_through as pe,
           (b.m0 + interval '1 month' - interval '1 day')::date as natural_end
    from b
    union all
    select 'mtd_prior', b.pm0, least(b.pm0 + (b.complete_through - b.m0), b.m0 - 1), (b.m0 - 1)
    from b
    union all
    select 'month', g::date, least((g + interval '1 month' - interval '1 day')::date, b.complete_through),
           (g + interval '1 month' - interval '1 day')::date
    from b, generate_series(date_trunc('month', b.d0 + 30)::date, b.m0, interval '1 month') g
    union all
    select 'week', g::date, least(g::date + 6, b.complete_through), g::date + 6
    from b, generate_series(date_trunc('week', b.d0)::date, date_trunc('week', b.complete_through)::date, interval '7 days') g
)
select p.period_kind,
       (p.pe < p.natural_end) as is_partial,
       m.*,
       b.complete_through,
       b.ledger_max_txn_date,
       b.ledger_last_loaded_at,
       ba.plans_as_of as broken_autodraft_as_of,
       ba.grace_days as broken_autodraft_grace_days,
       ba.broken_autodraft_plans,
       ba.broken_autodraft_clients,
       ba.broken_autodraft_plan_balance,
       ba.failed_draft_plans,
       ba.failed_draft_plan_balance,
       ba.failed_before_due_only_plans,
       ba.failed_before_due_only_plan_balance,
       ba.no_failed_draft_plans,
       ba.no_failed_draft_plan_balance,
       now() as refreshed_at
from periods p
cross join b
cross join public.dcm_broken_autodraft() ba
cross join lateral public.delinquent_collections_metrics(p.ps, p.pe) m;

create unique index mv_dcm_kpi_pk on public.mv_delinquent_collections_kpi (period_kind, period_start);
comment on materialized view public.mv_delinquent_collections_kpi is
  'Delinquent-collections KEY METRIC cache (Jeff 2026-10-14). Rows: mtd (month of complete_through, day 1..complete_through), mtd_prior (same day range of the prior month, capped at month end), month and week trend (current period cut at complete_through, is_partial=true). Columns from delinquent_collections_metrics() + dcm_broken_autodraft() + dcm_ledger_cutoff(). Refreshed by refresh_delinquent_cash_spine().';
revoke all on public.mv_delinquent_collections_kpi from public, anon, authenticated;  -- VP r3: drop default rxtm (MAINTAIN = REFRESH)
grant select on public.mv_delinquent_collections_kpi to authenticated;

create view public.v_delinquent_collections_kpi with (security_invoker = true) as
select * from public.mv_delinquent_collections_kpi;
comment on view public.v_delinquent_collections_kpi is
  'App read surface for the Delinquent Collections key-metric panel (LexCollect Admin Dashboard / Executive Insights). security_invoker; authenticated SELECT only. See mv_delinquent_collections_kpi.';
revoke all on public.v_delinquent_collections_kpi from public, anon, authenticated;  -- VP r3: drop default rxtm (MAINTAIN = REFRESH)
grant select on public.v_delinquent_collections_kpi to authenticated;

-- ---------------------------------------------------------------- 6. cached per-load rows
drop view if exists public.v_delinquent_collections_plan_loads;
drop materialized view if exists public.mv_delinquent_collections_plan_loads;
create materialized view public.mv_delinquent_collections_plan_loads as
select l.*, now() as refreshed_at from public.dcm_new_plans_by_load() l;
create unique index mv_dcm_plan_loads_pk on public.mv_delinquent_collections_plan_loads (load_as_of);
comment on materialized view public.mv_delinquent_collections_plan_loads is
  'dcm.new_plan_seen.v2 per plan-feed load (Jeff 2026-10-14). Refreshed by refresh_delinquent_cash_spine().';
revoke all on public.mv_delinquent_collections_plan_loads from public, anon, authenticated;  -- VP r3: drop default rxtm (MAINTAIN = REFRESH)
grant select on public.mv_delinquent_collections_plan_loads to authenticated;

create view public.v_delinquent_collections_plan_loads with (security_invoker = true) as
select * from public.mv_delinquent_collections_plan_loads;
comment on view public.v_delinquent_collections_plan_loads is
  'App read surface: new payment plans first seen per plan-feed load (Delinquent Collections panel). security_invoker; authenticated SELECT only.';
revoke all on public.v_delinquent_collections_plan_loads from public, anon, authenticated;  -- VP r3: drop default rxtm (MAINTAIN = REFRESH)
grant select on public.v_delinquent_collections_plan_loads to authenticated;

revoke all on function public.dcm_ledger_cutoff(text) from public, anon;
revoke all on function public.delinquent_collections_metrics(date, date, integer, numeric) from public, anon;
revoke all on function public.dcm_broken_autodraft(text, integer) from public, anon;
revoke all on function public.dcm_new_plans_by_load() from public, anon;
grant execute on function public.dcm_ledger_cutoff(text) to authenticated;
grant execute on function public.delinquent_collections_metrics(date, date, integer, numeric) to authenticated;
grant execute on function public.dcm_broken_autodraft(text, integer) to authenticated;
grant execute on function public.dcm_new_plans_by_load() to authenticated;

-- ---------------------------------------------------------------- 8. refresh hook
create or replace function public.refresh_delinquent_cash_spine()
 returns text
 language plpgsql
as $function$
declare n int; d text; ct date; st text;
begin
  refresh materialized view public.mv_dcs_snapshot_invoice;
  refresh materialized view public.mv_dcs_snapshot_client;
  refresh materialized view public.mv_delinquent_cash_txn;
  refresh materialized view public.mv_delinquent_collections_kpi;
  refresh materialized view public.mv_delinquent_collections_plan_loads;
  select count(*) into n from public.mv_delinquent_cash_txn;
  select complete_through into ct from public.mv_delinquent_collections_kpi where period_kind = 'mtd';
  -- VP r3: never GREEN over a dark ledger. WARN when complete_through is > 8 days behind firm-local today.
  st := case when ct is null or ct < (now() at time zone 'America/New_York')::date - 8 then 'WARN' else 'GREEN' end;
  d := format('rows=%s ledger_through=%s complete_through=%s latest_snapshot=%s unresolved_pct_last_closed_month=%s%s',
              n, (select max(txn_date) from public.mycase_transactions_rich),
              ct,
              (select max(snapshot_date) from public.mv_dcs_snapshot_client),
              (select unresolved_pct from public.v_delinquent_cash_monthly where month_status = 'closed' order by month desc limit 1),
              case when st = 'WARN' then ' | WARN: transaction ledger complete_through more than 8 days old' else '' end);
  insert into public.pipeline_heartbeat (job, last_run_at, status, rows_inserted, rows_linked, detail)
  values ('delinquent_cash_spine', now(), st, n, 0, d)
  on conflict (job) do update set last_run_at = excluded.last_run_at, status = excluded.status,
    rows_inserted = excluded.rows_inserted, rows_linked = excluded.rows_linked, detail = excluded.detail;
  return d;
end $function$;
comment on function public.refresh_delinquent_cash_spine() is
  'Refreshes the delinquent-cash spine (mv_dcs_snapshot_invoice, mv_dcs_snapshot_client, mv_delinquent_cash_txn) and the Delinquent Collections KPI cache (mv_delinquent_collections_kpi, mv_delinquent_collections_plan_loads); writes pipeline_heartbeat job=delinquent_cash_spine (WARN when the ledger complete_through is > 8 days old). Called by the 07:30 LexCollect-AR-Daily job as postgres. VP r3 2026-10-14.';
-- VP r3: only the owner-side 07:30 job calls this; app sessions must not be able to force refreshes.
revoke all on function public.refresh_delinquent_cash_spine() from public, anon, authenticated;

-- ---------------------------------------------------------------- 9. view-security watchman baseline (VP r3)
-- The KPI matview aggregates RLS-protected sources and is readable by authenticated by design
-- (firm-level aggregate rows, no client identifiers; same exposure class as the already-baselined
-- mv_delinquent_cash_txn it reads). Baseline ONLY that expected finding on ONLY the new objects;
-- any other finding (write grant, anon grant) stays NEW and the watchman ALERTs.
do $$
begin
  if to_regclass('public.view_security_baseline') is not null
     and to_regprocedure('public.view_security_scan()') is not null then
    insert into public.view_security_baseline (object_name, finding, baselined_at, baseline_cert)
    select s.object_name, s.finding, now(), 'vp_20261014_delinquent_collections_kpi'
    from public.view_security_scan() s
    where s.baseline_state = 'NEW'
      and s.finding = 'matview_rls_bypass'
      and s.object_name in ('mv_delinquent_collections_kpi', 'mv_delinquent_collections_plan_loads');
  end if;
end $$;
