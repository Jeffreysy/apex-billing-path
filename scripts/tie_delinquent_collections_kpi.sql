-- Tie check: Delinquent Collections key metric (v_delinquent_collections_kpi) vs the delinquent-cash spine.
-- Read-only. Every row must return ties = true. Re-derives the panel's numbers WITHOUT calling
-- delinquent_collections_metrics(), straight from mv_delinquent_cash_txn and the spine rollup views.

-- 1. Closed months vs v_delinquent_cash_monthly (to the cent)
select 'month' as chk, k.period_start,
       (k.settled_cash = m.settled_cash and k.delinquent_cash = m.delinquent_cash
        and k.delinquent_manual_cash = m.delinquent_manual_cash and k.delinquent_autopay_cash = m.delinquent_autopay_cash
        and k.delinquent_manual_31plus_cash = m.delinquent_manual_31plus and k.n_delinquent_txns = m.n_delinquent_txns
        and k.willing_payers = m.n_delinquent_payers and k.willing_payers_manual = m.n_delinquent_manual_payers
        and k.unresolved_cash = m.unresolved_cash and k.new_client_cash = m.new_client_cash) as ties
from v_delinquent_collections_kpi k
join v_delinquent_cash_monthly m on m.month = k.period_start
where k.period_kind = 'month' and not k.is_partial and m.month_status = 'closed'
union all
-- 2. Closed weeks vs v_delinquent_cash_weekly
select 'week', k.period_start,
       (k.settled_cash = w.settled_cash and k.delinquent_cash = w.delinquent_cash
        and k.delinquent_manual_cash = w.delinquent_manual_cash and k.delinquent_manual_31plus_cash = w.delinquent_manual_31plus
        and k.n_delinquent_txns = w.n_delinquent_txns and k.willing_payers = w.n_delinquent_payers
        and k.unresolved_cash = w.unresolved_cash)
from v_delinquent_collections_kpi k
join v_delinquent_cash_weekly w on w.week_start = k.period_start
where k.period_kind = 'week' and not k.is_partial and w.week_status = 'closed'
union all
-- 3. MTD and comparison windows vs raw spine rows in [period_start, period_end]
select k.period_kind, k.period_start,
       (k.delinquent_manual_cash = s.dm and k.delinquent_autopay_cash = s.da and k.delinquent_manual_31plus_cash = s.dm31
        and k.n_delinquent_manual_txns = s.n_dm and k.willing_payers = s.wp and k.willing_payers_manual = s.wpm
        and k.unresolved_cash = s.unres)
from v_delinquent_collections_kpi k
cross join lateral (
  select round(coalesce(sum(amount) filter (where cash_class = 'delinquent' and not is_autopay), 0), 2) as dm,
         round(coalesce(sum(amount) filter (where cash_class = 'delinquent' and is_autopay), 0), 2) as da,
         round(coalesce(sum(amount) filter (where cash_class = 'delinquent' and not is_autopay and dpd_bucket <> '1-30'), 0), 2) as dm31,
         count(*) filter (where cash_class = 'delinquent' and not is_autopay) as n_dm,
         count(distinct resolved_client_key) filter (where cash_class = 'delinquent') as wp,
         count(distinct resolved_client_key) filter (where cash_class = 'delinquent' and not is_autopay) as wpm,
         round(coalesce(sum(amount) filter (where cash_class like 'unresolved%'), 0), 2) as unres
  from mv_delinquent_cash_txn
  where txn_date between k.period_start and k.period_end
) s
where k.period_kind in ('mtd', 'mtd_prior')
order by 1, 2;
