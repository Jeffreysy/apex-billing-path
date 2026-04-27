alter table public.clients
  add column if not exists last_transaction_date date,
  add column if not exists last_transaction_amount numeric(12,2),
  add column if not exists last_transaction_source text;

alter table public.contracts
  add column if not exists last_transaction_date date,
  add column if not exists last_transaction_amount numeric(12,2),
  add column if not exists last_transaction_source text;

create index if not exists idx_clients_last_transaction_date
  on public.clients(last_transaction_date desc);

create index if not exists idx_contracts_last_transaction_date
  on public.contracts(last_transaction_date desc);

with ranked_client_transactions as (
  select
    p.client_id,
    p.payment_date,
    p.amount,
    coalesce(nullif(p.payment_type, ''), nullif(p.payment_method::text, ''), 'payment') as source,
    row_number() over (
      partition by p.client_id
      order by p.payment_date desc nulls last, p.created_at desc nulls last, p.id desc
    ) as rn
  from public.payments p
  where p.client_id is not null
    and coalesce(p.amount, 0) > 0
    and p.payment_date is not null
)
update public.clients c
set
  last_transaction_date = r.payment_date,
  last_transaction_amount = r.amount,
  last_transaction_source = r.source,
  updated_at = now()
from ranked_client_transactions r
where c.id = r.client_id
  and r.rn = 1;

with contract_transactions as (
  select
    lt.contract_id,
    lt.payment_date,
    lt.amount,
    'lawpay'::text as source,
    lt.processed_at as created_at,
    lt.id::text as tie_breaker
  from public.lawpay_transactions lt
  where lt.contract_id is not null
    and coalesce(lt.amount, 0) > 0
    and lt.payment_date is not null

  union all

  select
    fpe.matched_contract_id as contract_id,
    fpe.payment_date,
    fpe.amount,
    'filevine'::text as source,
    fpe.created_at,
    fpe.id::text as tie_breaker
  from public.filevine_payment_events fpe
  where fpe.matched_contract_id is not null
    and coalesce(fpe.amount, 0) > 0
    and fpe.payment_date is not null

  union all

  select
    ca.contract_id,
    ca.activity_date as payment_date,
    ca.collected_amount as amount,
    coalesce(nullif(ca.origin, ''), 'collection_activity') as source,
    ca.created_at,
    ca.id::text as tie_breaker
  from public.collection_activities ca
  where ca.contract_id is not null
    and coalesce(ca.collected_amount, 0) > 0
    and ca.activity_date is not null
),
ranked_contract_transactions as (
  select
    ct.*,
    row_number() over (
      partition by ct.contract_id
      order by ct.payment_date desc nulls last, ct.created_at desc nulls last, ct.tie_breaker desc
    ) as rn
  from contract_transactions ct
)
update public.contracts c
set
  last_transaction_date = r.payment_date,
  last_transaction_amount = r.amount,
  last_transaction_source = r.source
from ranked_contract_transactions r
where c.id = r.contract_id
  and r.rn = 1;

create or replace function public.sync_client_last_transaction_from_payment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.client_id is not null
    and coalesce(new.amount, 0) > 0
    and new.payment_date is not null
  then
    update public.clients c
    set
      last_transaction_date = new.payment_date,
      last_transaction_amount = new.amount,
      last_transaction_source = coalesce(nullif(new.payment_type, ''), nullif(new.payment_method::text, ''), 'payment'),
      updated_at = now()
    where c.id = new.client_id
      and (
        c.last_transaction_date is null
        or new.payment_date > c.last_transaction_date
        or (
          new.payment_date = c.last_transaction_date
          and coalesce(new.created_at, now()) >= coalesce(c.updated_at, '-infinity'::timestamptz)
        )
      );
  end if;

  return new;
end;
$$;

drop trigger if exists trg_sync_client_last_transaction_from_payment on public.payments;
create trigger trg_sync_client_last_transaction_from_payment
after insert or update of client_id, amount, payment_date, payment_type, payment_method
on public.payments
for each row
execute function public.sync_client_last_transaction_from_payment();

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
    c.excluded_from_collections,
    c.last_transaction_date as client_last_transaction_date,
    c.last_transaction_amount as client_last_transaction_amount,
    c.last_transaction_source as client_last_transaction_source,
    co.last_transaction_date as contract_last_transaction_date,
    co.last_transaction_amount as contract_last_transaction_amount,
    co.last_transaction_source as contract_last_transaction_source,
    coalesce(co.last_transaction_date, c.last_transaction_date) as last_transaction_date,
    coalesce(co.last_transaction_amount, c.last_transaction_amount) as last_transaction_amount,
    coalesce(co.last_transaction_source, c.last_transaction_source) as last_transaction_source
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
