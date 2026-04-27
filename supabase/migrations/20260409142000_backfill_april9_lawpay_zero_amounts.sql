with corrected_lawpay as (
  update public.lawpay_transactions lt
  set amount = ((lt.raw_payload #>> '{data,amount}')::numeric / 100)
  where lt.payment_date >= date '2026-04-09'
    and coalesce(lt.amount, 0) = 0
    and nullif(lt.raw_payload #>> '{data,amount}', '') is not null
    and ((lt.raw_payload #>> '{data,amount}')::numeric / 100) > 0
  returning
    lt.lawpay_transaction_id,
    lt.client_id,
    lt.contract_id,
    lt.amount,
    lt.payment_date,
    lt.description,
    lt.card_brand,
    lt.card_last_four
),
matched_for_payment as (
  select
    cl.lawpay_transaction_id,
    cl.client_id,
    cl.contract_id,
    cl.amount,
    cl.payment_date,
    cl.description,
    cl.card_brand,
    cl.card_last_four,
    c.client,
    c.value,
    c.collected
  from corrected_lawpay cl
  join public.contracts c on c.id = cl.contract_id
  where cl.client_id is not null
    and cl.contract_id is not null
    and not exists (
      select 1
      from public.payments p
      where p.reference_number = cl.lawpay_transaction_id
    )
),
inserted_payments as (
  insert into public.payments (
    payment_number,
    client_id,
    amount,
    payment_date,
    payment_method,
    reference_number,
    notes,
    payment_type,
    collector_name
  )
  select
    'LP-' || m.lawpay_transaction_id,
    m.client_id,
    m.amount,
    m.payment_date,
    'credit_card',
    m.lawpay_transaction_id,
    'LawPay backfill: ' || coalesce(m.description, ''),
    'lawpay_auto',
    'System-Auto'
  from matched_for_payment m
  returning reference_number
),
updated_contracts as (
  update public.contracts c
  set
    collected = coalesce(c.collected, 0) + m.amount,
    status = case when coalesce(c.value, 0) - (coalesce(c.collected, 0) + m.amount) <= 0 then 'Paid' else c.status end,
    delinquency_status = case when coalesce(c.value, 0) - (coalesce(c.collected, 0) + m.amount) <= 0 then 'Paid' else c.delinquency_status end,
    excel_status = case when coalesce(c.value, 0) - (coalesce(c.collected, 0) + m.amount) <= 0 then 'Paid' else c.excel_status end
  from matched_for_payment m
  where c.id = m.contract_id
  returning c.id
),
inserted_activities as (
  insert into public.collection_activities (
    client_id,
    contract_id,
    client_name,
    collector,
    activity_date,
    activity_type,
    outcome,
    collected_amount,
    transaction_id,
    origin,
    notes
  )
  select
    m.client_id,
    m.contract_id,
    m.client,
    'System-Auto',
    m.payment_date,
    'payment_received',
    'payment_taken',
    m.amount,
    m.lawpay_transaction_id,
    'LawPay Backfill',
    'LawPay $' || m.amount::text || ' - ' || coalesce(m.card_brand, 'card') || ' *' || coalesce(m.card_last_four, '') || ' - ' || coalesce(m.description, '')
  from matched_for_payment m
  where not exists (
    select 1
    from public.collection_activities ca
    where ca.transaction_id = m.lawpay_transaction_id
  )
  returning id
)
update public.unmatched_payments up
set amount = cl.amount
from corrected_lawpay cl
where up.reference_number = cl.lawpay_transaction_id
  and coalesce(up.amount, 0) = 0;
