-- VP edit applied as 20261013173146 (cert 6b600cd2): appends is_system_actor (System-* actors = autopay/system postings,
-- not human collector work). Full final definition below (CREATE OR REPLACE appends the column; key unchanged).
-- Executive Insights "Collector Time & Activity" + "Failed / Issues" counts - server-side aggregate
-- (2026-10-13, lexcollect-app-agent; VP applies + certifies). Jeff: "send the fixes for the slow pages too".
-- Replaces the browser pulling every collection_activities row for 6 months (36-48 paged requests per Admin load)
-- and grouping it in JavaScript. Same rules as the old browser code (is_junk excluded; null collector = 'Unassigned';
-- hours = SUM(GREATEST(duration_minutes, 0)); payments = rows with collected_amount > 0; failed = outcome contains
-- failed / refund / disputed / disconnected / no collection), EXCEPT the month: the browser parsed the DATE column with
-- new Date('yyyy-mm-dd') (UTC midnight = the previous evening in Eastern time), so every activity dated the 1st was
-- counted in the PREVIOUS month. This view uses the calendar month of activity_date.
-- The $ "Collected" column is NOT here: the app already reads it from v_activity_collected_by_collector_weekly.

create or replace view public.v_exec_collector_activity_monthly
with (security_invoker = true) as
select date_trunc('month', a.activity_date)::date                                   as month,
       coalesce(a.collector, 'Unassigned')                                          as collector,
       count(*)                                                                     as activities,
       round(sum(greatest(coalesce(a.duration_minutes, 0), 0)), 2)                  as minutes,
       count(*) filter (where coalesce(a.collected_amount, 0) > 0)                  as payments,
       round(coalesce(sum(a.commission), 0), 2)                                     as commission,
       count(*) filter (where lower(btrim(coalesce(a.outcome, '')))
                              ~ '(failed|refund|disputed|disconnected|no collection)') as failed,
       coalesce(a.collector, '') ilike 'system%'                                     as is_system_actor   -- VP edit: System-Auto rows are autopay/system postings, not human collector work
from public.collection_activities a
where a.is_junk is not true
  and a.activity_date is not null
group by 1, 2, coalesce(a.collector, '') ilike 'system%';

comment on view public.v_exec_collector_activity_monthly is
'GRAIN: one row per (calendar month, collector). KEY: (month, collector). ACTIVITY grain counts. Executive Insights "Collector Time & Activity" table + "Failed / Issues" total: activities (non-junk rows), minutes = SUM(GREATEST(duration_minutes,0)), payments = rows with collected_amount > 0, commission = SUM(commission), failed = outcome contains failed/refund/disputed/disconnected/no collection. Null collector = Unassigned. is_system_actor = true for System-* actors (autopay/system postings, NOT human collector work - Sep 2026: 1,524 of 1,882 payments); exclude them from human-collector totals. Month = calendar month of activity_date (the previous browser code shifted the 1st of each month into the prior month). $ collected is NOT here (v_activity_collected_by_collector_weekly). security_invoker; authenticated SELECT only. lexcollect-app-agent 2026-10-13, VP-certified.';

revoke all on public.v_exec_collector_activity_monthly from public, anon, authenticated;
grant select on public.v_exec_collector_activity_monthly to authenticated;
