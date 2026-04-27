create or replace view public.collections_dashboard as
with latest_case as (
  select distinct on (immigration_cases.client_id)
    immigration_cases.client_id,
    immigration_cases.case_stage,
    immigration_cases.lead_attorney
  from public.immigration_cases
  order by immigration_cases.client_id, immigration_cases.is_closed, immigration_cases.open_date desc nulls last
),
dashboard_rows as (
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
    case
      when c.delinquency_status = 'Current'::text
        and co.next_due_date is not null
        and co.next_due_date < current_date
      then
        case
          when (
            co.next_due_date
            + make_interval(months => greatest(
                0,
                ((extract(year from current_date)::integer - extract(year from co.next_due_date)::integer) * 12)
                + (extract(month from current_date)::integer - extract(month from co.next_due_date)::integer)
              ))
          )::date < current_date
          then (
            co.next_due_date
            + make_interval(months => greatest(
                0,
                ((extract(year from current_date)::integer - extract(year from co.next_due_date)::integer) * 12)
                + (extract(month from current_date)::integer - extract(month from co.next_due_date)::integer)
                + 1
              ))
          )::date
          else (
            co.next_due_date
            + make_interval(months => greatest(
                0,
                ((extract(year from current_date)::integer - extract(year from co.next_due_date)::integer) * 12)
                + (extract(month from current_date)::integer - extract(month from co.next_due_date)::integer)
              ))
          )::date
        end
      else co.next_due_date
    end as next_due_date,
    co.days_out,
    co.case_number,
    co.collector,
    ic.lead_attorney,
    ic.case_stage as immigration_stage,
    case
      when c.delinquency_status = 'Delinquent'::text and coalesce(co.days_out, 0) > 90 then 1
      when c.delinquency_status = 'Delinquent'::text then 2
      when c.delinquency_status = 'Late'::text then 3
      when co.status = 'Risk'::text then 4
      else 5
    end as priority_score,
    c.client_quality_status,
    c.client_quality_reason,
    c.excluded_from_collections
  from public.clients c
  left join public.contracts co on co.client_id = c.id
  left join latest_case ic on ic.client_id = c.id
  where c.is_active = true
    and coalesce(c.excluded_from_collections, false) = false
    and (
      co.id is null
      or co.status = any (array['Active'::text, 'Risk'::text])
    )
)
select *
from dashboard_rows
order by priority_score, days_out desc nulls last;
