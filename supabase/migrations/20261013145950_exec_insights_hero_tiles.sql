-- Executive Insights hero band (Admin Dashboard) - three read-only aggregation views.
-- Requested by Jeff 2026-10-13. Authored by lexcollect-app-agent; DDL applied + certified by the VP (supabase-auditor).
-- All three: security_invoker = true (caller's grants + RLS apply), SELECT to authenticated only, nothing to anon/PUBLIC.

-- =============================================================================
-- 1. COLLECTED per month, split clients vs non-clients (consult fees)
-- =============================================================================
create or replace view public.v_exec_collected_split_monthly
with (security_invoker = true) as
with led as (
  select date_trunc('month', l.payment_date)::date as month,
         l.payment_date,
         l.amount,
         l.status
  from public.v_financial_ledger_canonical l
  where l.payment_date >= date '2025-01-01'
    and l.payment_date <= current_date
),
cut as (     -- MTD cutoff = day-of-month of the newest ledger payment in the current month (feed lag aware), else today
  select coalesce(max(extract(day from payment_date)) filter (where payment_date >= date_trunc('month', current_date)::date),
                  extract(day from current_date))::int as mtd_cutoff_day
  from led
),
agg as (
  select l.month,
         sum(l.amount)                                       as total_collected,
         sum(l.amount) filter (where l.status = 'Completed') as completed_amount,
         sum(l.amount) filter (where l.status = 'Offline')   as offline_amount,
         count(*)                                            as payment_count,
         max(l.payment_date)                                 as ledger_through,
         sum(l.amount) filter (where extract(day from l.payment_date) <= c.mtd_cutoff_day) as total_mtd_comparable,
         c.mtd_cutoff_day
  from led l
  cross join cut c
  group by l.month, c.mtd_cutoff_day
)
select a.month,
       round(a.total_collected, 2)                         as total_collected,
       round(coalesce(a.completed_amount, 0), 2)           as completed_amount,
       round(coalesce(a.offline_amount, 0), 2)             as offline_amount,
       a.payment_count,
       round(coalesce(a.total_mtd_comparable, 0), 2)       as total_mtd_comparable,
       a.mtd_cutoff_day,
       c.consult_cash                                      as nonclient_consult_cash,
       c.consult_payments                                  as nonclient_consult_payments,
       case when c.consult_cash is null then null
            else round(a.total_collected - c.consult_cash, 2) end as client_collected,
       c.source_status                                     as consult_source_status,
       a.ledger_through,
       c.ledger_last_payment                               as consult_through,
       (a.month = date_trunc('month', current_date)::date) as is_current_month
from agg a
left join public.v_consult_official_monthly c on c.month = a.month;

comment on view public.v_exec_collected_split_monthly is
'GRAIN: one row per calendar month. KEY: month.
Executive Insights "Collected" hero tile. total_collected = SUM(v_financial_ledger_canonical.amount) by payment_date month (MyCase Completed + Offline; the canonical cash ledger, ties to bank/QBO within ~1%; consult fees are INSIDE it). nonclient_consult_cash = v_consult_official_monthly.consult_cash (HubSpot consult ledger, LawPay-confirmed from 2026-04; NULL before 2026-02 by Jeff''s ruling - display a dash, never 0). client_collected = total_collected - nonclient_consult_cash (NULL when consult is NULL). total_mtd_comparable = this month through mtd_cutoff_day (day-of-month of the newest ledger payment in the CURRENT month, so feed lag never reads as a drop), for MTD-vs-MTD deltas. Read-only, security_invoker. lexcollect-app-agent 2026-10-13, VP-certified.';

-- =============================================================================
-- 2. DRIFT - clients whose worst MyCase aging bucket moved between two AR snapshots
-- =============================================================================
create or replace view public.v_exec_client_bucket_drift
with (security_invoker = true) as
with months as (
  select generate_series(date '2026-01-01', date_trunc('month', current_date)::date, interval '1 month')::date as month
),
snaps as (   -- one canonical snapshot per date; CSV exports only (consistent client text); denylisted excluded
  select s.snapshot_id, s.snapshot_date
  from public.v_ar_snapshot_series s
  where s.source_system = 'mycase_csv'
    and not exists (select 1 from public.ar_snapshot_denylist d where d.snapshot_id = s.snapshot_id)
),
pairs as (   -- base = last snapshot on/before the 1st; end = latest snapshot after the 1st within the month
  select m.month, b.snapshot_id as base_snapshot_id, b.snapshot_date as base_snapshot_date,
         e.snapshot_id as end_snapshot_id, e.snapshot_date as end_snapshot_date
  from months m
  cross join lateral (select s.snapshot_id, s.snapshot_date from snaps s
                      where s.snapshot_date <= m.month
                        and s.snapshot_date >= m.month - 31          -- VP fix: base must sit within 31 days of the 1st (else no row; stops a 2026-03-03 base being read as June drift)
                      order by s.snapshot_date desc limit 1) b
  cross join lateral (select s.snapshot_id, s.snapshot_date from snaps s
                      where s.snapshot_date > m.month and s.snapshot_date < (m.month + interval '1 month')::date
                      order by s.snapshot_date desc limit 1) e
),
needed as (
  select base_snapshot_id as snapshot_id from pairs
  union
  select end_snapshot_id from pairs
),
cli as (     -- CLIENT grain per snapshot: open balance + worst invoice bucket ordinal
  select r.snapshot_id,
         lower(regexp_replace(btrim(r.client_case_text), '\s+', ' ', 'g')) as client_key,
         sum(r.amount_due) as balance,
         max(case when r.status is distinct from 'Overdue' then 0
                  when s.snapshot_date - r.due_date <= 0   then 0
                  when s.snapshot_date - r.due_date <= 30  then 1
                  when s.snapshot_date - r.due_date <= 60  then 2
                  when s.snapshot_date - r.due_date <= 90  then 3
                  when s.snapshot_date - r.due_date <= 180 then 4
                  when s.snapshot_date - r.due_date <= 365 then 5
                  else 6 end) as bucket_ord
  from public.ar_source_rows r
  join snaps s on s.snapshot_id = r.snapshot_id
  where r.snapshot_id in (select snapshot_id from needed)
    and r.amount_due > 0
    and not coalesce(r.excluded_from_ar, false)
    and nullif(btrim(r.client_case_text), '') is not null
  group by r.snapshot_id, lower(regexp_replace(btrim(r.client_case_text), '\s+', ' ', 'g'))
),
moves as (
  select p.month, p.base_snapshot_date, p.end_snapshot_date, z.from_ord, z.to_ord, z.base_balance, z.end_balance
  from pairs p
  cross join lateral (
    select coalesce(b.bucket_ord, -1) as from_ord,
           coalesce(e.bucket_ord, -1) as to_ord,
           b.balance as base_balance,
           e.balance as end_balance
    from (select client_key, bucket_ord, balance from cli where snapshot_id = p.base_snapshot_id) b
    full join (select client_key, bucket_ord, balance from cli where snapshot_id = p.end_snapshot_id) e
      on e.client_key = b.client_key
  ) z
)
select month,
       base_snapshot_date,
       end_snapshot_date,
       end_snapshot_date - base_snapshot_date     as window_days,   -- VP addition: days the move spans
       from_ord,
       to_ord,
       (array['current','1-30','31-60','61-90','91-180','181-365','365+'])[from_ord + 1] as from_bucket,  -- NULL = not on the base book
       (array['current','1-30','31-60','61-90','91-180','181-365','365+'])[to_ord + 1]   as to_bucket,    -- NULL = not on the end book
       case when from_ord = -1 then 'new'
            when to_ord   = -1 then 'left'
            when to_ord > from_ord then 'worse'
            when to_ord < from_ord then 'recovered'
            else 'same' end as movement,
       count(*)                                   as clients,
       round(coalesce(sum(base_balance), 0), 2)   as base_balance,
       round(coalesce(sum(end_balance), 0), 2)    as end_balance
from moves
group by month, base_snapshot_date, end_snapshot_date, from_ord, to_ord;

comment on view public.v_exec_client_bucket_drift is
'GRAIN: one row per (month, from_ord, to_ord) - one from->to aging-bucket cell. KEY: (month, from_ord, to_ord). clients = CLIENT-grain count (client = normalized ar_source_rows.client_case_text: lower, trimmed, collapsed spaces).
Executive Insights "Drift" hero tile (replaces the balance-weighted "Weighted DSO"). Per month: base = last canonical MyCase CSV AR snapshot (v_ar_snapshot_series, denylist excluded) on/before the 1st AND no more than 31 days before it; end = latest such snapshot after the 1st within the month (no rows for a month without either). window_days = end_snapshot_date - base_snapshot_date. Client key is NAME-TEXT grain (not dedup-survivor client_id grain). Invoice bucket = snapshot_date - due_date when status = Overdue, else current (0); buckets 0 / 1-30 / 31-60 / 61-90 / 91-180 / 181-365 / 365+ (ord 0..6); client bucket = worst open invoice (amount_due > 0, not excluded_from_ar). ord -1 = not on that snapshot''s book. movement: worse (to>from) / recovered (to<from) / same / new (not on base) / left (not on end). base_balance / end_balance = client open balance on each snapshot. Read-only, security_invoker. lexcollect-app-agent 2026-10-13, VP-certified.';

-- =============================================================================
-- 3. CASE MIX - services sold per month with the contract value they bring
-- =============================================================================
create or replace view public.v_exec_case_mix_monthly
with (security_invoker = true) as
with inv as (   -- invoiced contract value per case; synthetic invoice rows carry mycase_case_id NULL so cannot enter
  select i.mycase_case_id, sum(i.amount) as invoiced
  from public.mycase_invoices i
  where i.amount > 0 and i.mycase_case_id is not null
  group by i.mycase_case_id
),
rev_cases as (  -- a revenue case = a case with invoiced > 0 (same rule as the revenue model)
  select date_trunc('month', d.open_date)::date as month,
         coalesce(d.reporting_family, '(unspecified)') as reporting_family,
         coalesce(d.family_sort, 9999) as family_sort,
         v.invoiced
  from public.v_case_dim d
  join inv v on v.mycase_case_id = d.mycase_case_id
  where d.open_date >= (date_trunc('month', current_date) - interval '12 months')::date   -- rolling 13 months (v_case_dim family lookup is ~1 ms/row)
    and d.open_date <= current_date
),
fresh as (
  select (select max(open_date) from public.mycase_cases where open_date <= current_date) as cases_loaded_through,
         (select max(synced_at)  from public.mycase_invoices where mycase_case_id is not null) as invoices_synced_at
)
select r.month,
       r.reporting_family,
       min(r.family_sort)                        as family_sort,
       count(*)                                  as revenue_cases,
       round(sum(r.invoiced), 2)                 as contract_value,
       round(sum(r.invoiced) / count(*), 2)      as avg_per_case,
       f.cases_loaded_through,
       f.invoices_synced_at
from rev_cases r
cross join fresh f
group by r.month, r.reporting_family, f.cases_loaded_through, f.invoices_synced_at;

comment on view public.v_exec_case_mix_monthly is
'GRAIN: one row per (month, reporting_family). KEY: (month, reporting_family). revenue_cases = CASE-grain count (v_case_dim is one row per mycase_case_id).
Executive Insights "Case Mix" card (replaces the Net AR Change card). Services sold in a month = cases with v_case_dim.open_date in that month AND invoiced > 0, where invoiced = SUM(mycase_invoices.amount > 0) by mycase_case_id (revenue-model rule; synthetic invoice rows have mycase_case_id NULL and cannot enter). contract_value = SUM(invoiced) of those cases; avg_per_case = contract_value / revenue_cases. Rolling 13 months by open_date. cases_loaded_through = MAX(mycase_cases.open_date) and invoices_synced_at = MAX(mycase_invoices.synced_at): freshness of the MyCase case/invoice feeds - a month past cases_loaded_through is partial, not a collapse. Read-only, security_invoker. lexcollect-app-agent 2026-10-13, VP-certified.';

-- =============================================================================
-- VP fix: ar_snapshot_denylist had RLS ON with ZERO policies, so under security_invoker an
-- authenticated caller saw 0 denylist rows and the drift view's denylist filter was a silent no-op.
-- Read policy mirrors ar_source_rows (is_active_user()), scoped to authenticated only.
-- =============================================================================
drop policy if exists ar_snapshot_denylist_active_read on public.ar_snapshot_denylist;
create policy ar_snapshot_denylist_active_read on public.ar_snapshot_denylist
  for select to authenticated using (public.is_active_user());

-- =============================================================================
-- Grants: authenticated SELECT only; nothing to anon / PUBLIC
-- =============================================================================
revoke all on public.v_exec_collected_split_monthly from public, anon, authenticated;
revoke all on public.v_exec_client_bucket_drift     from public, anon, authenticated;
revoke all on public.v_exec_case_mix_monthly        from public, anon, authenticated;
grant select on public.v_exec_collected_split_monthly to authenticated;
grant select on public.v_exec_client_bucket_drift     to authenticated;
grant select on public.v_exec_case_mix_monthly        to authenticated;
