alter table public.firm_settings
  add column if not exists collections_low_balance_threshold numeric not null default 100,
  add column if not exists collections_high_balance_threshold numeric not null default 5000,
  add column if not exists collections_stale_contact_days integer not null default 7,
  add column if not exists collections_promise_grace_days integer not null default 0;

update public.firm_settings
set
  collections_low_balance_threshold = coalesce(collections_low_balance_threshold, 100),
  collections_high_balance_threshold = coalesce(collections_high_balance_threshold, 5000),
  collections_stale_contact_days = coalesce(collections_stale_contact_days, 7),
  collections_promise_grace_days = coalesce(collections_promise_grace_days, 0);

drop view if exists public.collections_dashboard;

create view public.collections_dashboard as
with settings as (
  select
    coalesce(collections_low_balance_threshold, 100) as low_balance_threshold,
    coalesce(collections_high_balance_threshold, 5000) as high_balance_threshold,
    coalesce(collections_stale_contact_days, 7) as stale_contact_days,
    coalesce(collections_promise_grace_days, 0) as promise_grace_days
  from public.firm_settings
  order by created_at nulls last, id
  limit 1
),
latest_case as (
  select distinct on (immigration_cases.client_id)
    immigration_cases.client_id,
    immigration_cases.case_stage,
    immigration_cases.lead_attorney
  from public.immigration_cases
  order by immigration_cases.client_id, immigration_cases.is_closed, immigration_cases.open_date desc nulls last
),
activity_summary as (
  select
    ca.client_id,
    max(ca.activity_date) as last_contact_date,
    count(*) filter (where ca.activity_date >= current_date - interval '30 days') as contact_count_30d,
    count(*) filter (
      where ca.activity_date >= current_date - interval '90 days'
        and coalesce(ca.outcome, '') in ('payment_taken', 'promise_to_pay', 'callback_scheduled', 'client_satisfied')
    ) as positive_contact_count_90d
  from public.collection_activities ca
  where ca.client_id is not null
  group by ca.client_id
),
repeat_delinquency as (
  select
    co.client_id,
    count(*) filter (
      where lower(coalesce(co.status, '')) = any (array['risk', 'default', 'collections'])
         or lower(coalesce(c.delinquency_status, '')) = any (array['late', 'delinquent'])
    ) as repeat_delinquency_count
  from public.contracts co
  join public.clients c on c.id = co.client_id
  group by co.client_id
)
select
  c.id as client_id,
  c.name as client_name,
  c.phone,
  c.email,
  c.assigned_collector,
  c.delinquency_status,
  c.days_past_due,
  c.next_payment_date,
  coalesce(ic.case_stage, c.case_stage) as case_stage,
  coalesce(co.practice_area, c.practice_area) as practice_area,
  c.preferred_language,
  co.id as contract_id,
  co.status as contract_status,
  co.value as contract_value,
  co.collected,
  coalesce(co.value, 0::numeric) - coalesce(co.collected, 0::numeric) as balance_remaining,
  co.monthly_installment,
  co.next_due_date,
  co.days_out,
  co.case_number,
  co.collector,
  ic.lead_attorney,
  ic.case_stage as immigration_stage,
  coalesce(co.last_transaction_date, c.last_transaction_date) as last_transaction_date,
  coalesce(co.last_transaction_amount, c.last_transaction_amount) as last_transaction_amount,
  coalesce(co.last_transaction_source, c.last_transaction_source) as last_transaction_source,
  c.last_transaction_date as client_last_transaction_date,
  c.last_transaction_amount as client_last_transaction_amount,
  c.last_transaction_source as client_last_transaction_source,
  co.last_transaction_date as contract_last_transaction_date,
  co.last_transaction_amount as contract_last_transaction_amount,
  co.last_transaction_source as contract_last_transaction_source,
  c.client_quality_status,
  c.client_quality_reason,
  c.excluded_from_collections,
  activity.last_contact_date,
  coalesce(activity.contact_count_30d, 0) as contact_count_30d,
  coalesce(activity.positive_contact_count_90d, 0) as positive_contact_count_90d,
  coalesce(rd.repeat_delinquency_count, 0) as repeat_delinquency_count,
  commitment.promised_amount as latest_promised_amount,
  commitment.promised_date as latest_promised_date,
  commitment.follow_up_date as latest_commitment_follow_up_date,
  commitment.status as latest_commitment_status,
  (
    commitment.id is not null
    and commitment.status = 'pending'
    and commitment.promised_date < current_date - make_interval(days => settings.promise_grace_days)
  ) as missed_promise,
  (
    coalesce(co.value, 0::numeric) - coalesce(co.collected, 0::numeric) > 0
    and coalesce(co.value, 0::numeric) - coalesce(co.collected, 0::numeric) < settings.low_balance_threshold
  ) as low_balance_hold,
  case
    when commitment.id is not null
      and commitment.status = 'pending'
      and commitment.promised_date < current_date - make_interval(days => settings.promise_grace_days)
      then 'broken_promise'
    when coalesce(co.value, 0::numeric) - coalesce(co.collected, 0::numeric) >= settings.high_balance_threshold
      and greatest(coalesce(c.days_past_due, 0), coalesce(co.days_out, 0)) > 0
      then 'high_balance'
    when coalesce(rd.repeat_delinquency_count, 0) >= 2
      and coalesce(co.value, 0::numeric) - coalesce(co.collected, 0::numeric) > 0
      then 'repeat_risk'
    when coalesce(activity.last_contact_date, date '1900-01-01')
      <= current_date - make_interval(days => settings.stale_contact_days)
      and coalesce(co.value, 0::numeric) - coalesce(co.collected, 0::numeric) > 0
      then 'stale_follow_up'
    when coalesce(co.value, 0::numeric) - coalesce(co.collected, 0::numeric) > 0
      and greatest(coalesce(c.days_past_due, 0), coalesce(co.days_out, 0)) > 0
      then 'past_due'
    else 'standard'
  end as queue_tier,
  case
    when commitment.id is not null
      and commitment.status = 'pending'
      and commitment.promised_date < current_date - make_interval(days => settings.promise_grace_days)
      then 'Promise missed - call now'
    when coalesce(co.value, 0::numeric) - coalesce(co.collected, 0::numeric) >= settings.high_balance_threshold
      and greatest(coalesce(c.days_past_due, 0), coalesce(co.days_out, 0)) > 0
      then 'High balance overdue - priority outreach'
    when coalesce(rd.repeat_delinquency_count, 0) >= 2
      and coalesce(co.value, 0::numeric) - coalesce(co.collected, 0::numeric) > 0
      then 'Repeat delinquency - tighten follow up'
    when coalesce(activity.last_contact_date, date '1900-01-01')
      <= current_date - make_interval(days => settings.stale_contact_days)
      and coalesce(co.value, 0::numeric) - coalesce(co.collected, 0::numeric) > 0
      then 'No recent contact - work next'
    when coalesce(co.value, 0::numeric) - coalesce(co.collected, 0::numeric) > 0
      and greatest(coalesce(c.days_past_due, 0), coalesce(co.days_out, 0)) > 0
      then 'Past due balance'
    when coalesce(co.value, 0::numeric) - coalesce(co.collected, 0::numeric) > 0
      and coalesce(co.value, 0::numeric) - coalesce(co.collected, 0::numeric) < settings.low_balance_threshold
      then 'Low balance - low touch'
    else 'Review account'
  end as queue_reason,
  (
    case
      when commitment.id is not null
        and commitment.status = 'pending'
        and commitment.promised_date < current_date - make_interval(days => settings.promise_grace_days)
        then 95
      when coalesce(co.value, 0::numeric) - coalesce(co.collected, 0::numeric) >= settings.high_balance_threshold
        and greatest(coalesce(c.days_past_due, 0), coalesce(co.days_out, 0)) > 0
        then 82
      when coalesce(rd.repeat_delinquency_count, 0) >= 2
        and coalesce(co.value, 0::numeric) - coalesce(co.collected, 0::numeric) > 0
        then 72
      when greatest(coalesce(c.days_past_due, 0), coalesce(co.days_out, 0)) > 90 then 68
      when greatest(coalesce(c.days_past_due, 0), coalesce(co.days_out, 0)) > 30 then 56
      when greatest(coalesce(c.days_past_due, 0), coalesce(co.days_out, 0)) > 0 then 44
      else 28
    end
    + least(12, floor((coalesce(co.value, 0::numeric) - coalesce(co.collected, 0::numeric)) / 1000)::int)
    + least(8, coalesce(rd.repeat_delinquency_count, 0) * 2)
    + case
        when coalesce(activity.last_contact_date, date '1900-01-01')
          <= current_date - make_interval(days => settings.stale_contact_days) then 6
        else 0
      end
  ) as priority_score
from public.clients c
cross join settings
left join public.contracts co on co.client_id = c.id
left join latest_case ic on ic.client_id = c.id
left join activity_summary activity on activity.client_id = c.id
left join repeat_delinquency rd on rd.client_id = c.id
left join lateral (
  select
    pc.id,
    pc.promised_amount,
    pc.promised_date,
    pc.follow_up_date,
    pc.status
  from public.payment_commitments pc
  where pc.client_id = c.id
    and (co.id is null or pc.contract_id is null or pc.contract_id = co.id)
  order by pc.promised_date desc nulls last, pc.created_at desc
  limit 1
) commitment on true
where c.is_active = true
  and coalesce(c.excluded_from_collections, false) = false
  and (
    co.id is null
    or co.status = any (array['Active'::text, 'Risk'::text])
  )
  and (
    coalesce(co.value, 0::numeric) - coalesce(co.collected, 0::numeric) > 0
    or commitment.id is not null
  )
  and not (
    coalesce(co.value, 0::numeric) - coalesce(co.collected, 0::numeric) > 0
    and coalesce(co.value, 0::numeric) - coalesce(co.collected, 0::numeric) < settings.low_balance_threshold
    and not (
      commitment.id is not null
      and commitment.status = 'pending'
      and commitment.promised_date < current_date - make_interval(days => settings.promise_grace_days)
    )
    and coalesce(rd.repeat_delinquency_count, 0) < 2
  )
order by
  priority_score desc,
  greatest(coalesce(c.days_past_due, 0), coalesce(co.days_out, 0)) desc nulls last,
  (coalesce(co.value, 0::numeric) - coalesce(co.collected, 0::numeric)) desc nulls last;
