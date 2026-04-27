create or replace function public.refresh_client_quality_classification()
returns table (
  client_quality_status text,
  excluded_from_collections boolean,
  clients_updated integer
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  with client_signals as (
    select
      c.id,
      c.client_number,
      c.name,
      c.case_number,
      c.email,
      c.phone,
      c.practice_area,
      c.case_stage,
      c.mycase_id,
      c.filevine_project_id,
      count(distinct co.id)::integer as contract_count,
      sum(coalesce(co.value, 0))::numeric as contract_value,
      sum(coalesce(co.collected, 0))::numeric as contract_collected,
      count(distinct ic.id)::integer as immigration_case_count,
      count(distinct p.id)::integer as payment_count,
      sum(coalesce(p.amount, 0))::numeric as payment_total,
      count(distinct p.id) filter (where coalesce(p.amount, 0) > 0 and coalesce(p.amount, 0) <= 250)::integer as low_dollar_payment_count,
      count(distinct ca.id)::integer as activity_count
    from public.clients c
    left join public.contracts co on co.client_id = c.id
    left join public.immigration_cases ic on ic.client_id = c.id
    left join public.payments p on p.client_id = c.id
    left join public.collection_activities ca on ca.client_id = c.id
    where c.is_active = true
    group by c.id
  ),
  classified as (
    select
      cs.id,
      case
        when cs.contract_count > 0 then 'active_ar_client'
        when cs.immigration_case_count > 0 then 'active_legal_client'
        when cs.payment_count > 0
          and cs.contract_count = 0
          and cs.immigration_case_count = 0
          and cs.payment_total <= 250 then 'consult_only'
        when split_part(cs.client_number, '-', 1) = 'MC'
          and cs.mycase_id is not null
          and cs.contract_count = 0
          and cs.immigration_case_count = 0
          and cs.payment_count = 0 then 'raw_mycase_contact'
        when split_part(cs.client_number, '-', 1) = 'IMP'
          and cs.contract_count = 0
          and cs.immigration_case_count = 0
          and cs.payment_count = 0 then 'unverified_import'
        when cs.payment_count > 0
          and cs.contract_count = 0
          and cs.immigration_case_count = 0 then 'needs_financial_review'
        else 'needs_review'
      end as quality_status,
      case
        when cs.contract_count > 0 then 'Linked to one or more contracts.'
        when cs.immigration_case_count > 0 then 'Linked to one or more immigration cases.'
        when cs.payment_count > 0
          and cs.contract_count = 0
          and cs.immigration_case_count = 0
          and cs.payment_total <= 250 then 'Only low-dollar payment activity found; likely consultation payment, not retained collections account.'
        when split_part(cs.client_number, '-', 1) = 'MC'
          and cs.mycase_id is not null
          and cs.contract_count = 0
          and cs.immigration_case_count = 0
          and cs.payment_count = 0 then 'Raw MyCase contact import with no linked contract, case, or payment.'
        when split_part(cs.client_number, '-', 1) = 'IMP'
          and cs.contract_count = 0
          and cs.immigration_case_count = 0
          and cs.payment_count = 0 then 'Imported/orphan contact with no CRM, contract, case, or payment proof.'
        when cs.payment_count > 0
          and cs.contract_count = 0
          and cs.immigration_case_count = 0 then 'Payment exists without linked contract or immigration case; needs review before collections.'
        else 'Insufficient linkage to classify confidently.'
      end as quality_reason,
      case
        when cs.contract_count > 0 then false
        when cs.immigration_case_count > 0 then false
        when cs.payment_count > 0
          and cs.contract_count = 0
          and cs.immigration_case_count = 0
          and cs.payment_total > 250 then false
        else true
      end as exclude_from_collections
    from client_signals cs
  ),
  updated as (
    update public.clients c
    set
      client_quality_status = classified.quality_status,
      client_quality_reason = classified.quality_reason,
      excluded_from_collections = classified.exclude_from_collections,
      quality_reviewed_at = now(),
      updated_at = now()
    from classified
    where c.id = classified.id
      and (
        c.client_quality_status is distinct from classified.quality_status
        or c.client_quality_reason is distinct from classified.quality_reason
        or c.excluded_from_collections is distinct from classified.exclude_from_collections
      )
    returning c.client_quality_status, c.excluded_from_collections
  )
  select
    updated.client_quality_status,
    updated.excluded_from_collections,
    count(*)::integer
  from updated
  group by updated.client_quality_status, updated.excluded_from_collections
  order by updated.client_quality_status, updated.excluded_from_collections;
end;
$$;
