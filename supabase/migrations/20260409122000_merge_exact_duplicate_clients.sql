-- Merge exact duplicate clients: same normalized name + same case number.
-- This does not hard-delete client rows. It moves references to the best
-- survivor record, enriches missing survivor fields, and archives duplicates.

create table if not exists public.client_duplicate_merge_audit (
  id uuid primary key default gen_random_uuid(),
  survivor_client_id uuid not null references public.clients(id),
  duplicate_client_id uuid not null references public.clients(id),
  duplicate_client_number text,
  survivor_client_number text,
  normalized_name text not null,
  case_number text not null,
  merge_reason text not null,
  moved_contracts integer not null default 0,
  moved_payments integer not null default 0,
  moved_activities integer not null default 0,
  moved_immigration_cases integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_client_duplicate_merge_audit_survivor
  on public.client_duplicate_merge_audit (survivor_client_id);

create index if not exists idx_client_duplicate_merge_audit_duplicate
  on public.client_duplicate_merge_audit (duplicate_client_id);

create or replace function public.merge_exact_duplicate_clients(p_dry_run boolean default true)
returns table (
  survivor_client_id uuid,
  duplicate_client_id uuid,
  survivor_client_number text,
  duplicate_client_number text,
  normalized_name text,
  case_number text,
  duplicate_link_count integer,
  action text
)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
begin
  if p_dry_run then
    return query
    with client_links as (
      select
        c.id,
        c.name,
        c.client_number,
        c.case_number,
        c.created_at,
        public.normalize_collector_client_name(c.name) as normalized_name,
        count(distinct co.id)::integer as contract_count,
        count(distinct p.id)::integer as payment_count,
        count(distinct ca.id)::integer as activity_count,
        count(distinct ic.id)::integer as immigration_case_count,
        count(distinct e.id)::integer as escalation_count,
        count(distinct pc.id)::integer as commitment_count
      from public.clients c
      left join public.contracts co on co.client_id = c.id
      left join public.payments p on p.client_id = c.id
      left join public.collection_activities ca on ca.client_id = c.id
      left join public.immigration_cases ic on ic.client_id = c.id
      left join public.escalations e on e.client_id = c.id
      left join public.payment_commitments pc on pc.client_id = c.id
      where c.is_active = true
        and nullif(trim(c.case_number), '') is not null
      group by c.id
    ),
    duplicate_groups as (
      select normalized_name, case_number
      from client_links
      group by normalized_name, case_number
      having count(*) > 1
    ),
    ranked as (
      select
        cl.*,
        (
          cl.contract_count * 100
          + cl.payment_count * 20
          + cl.activity_count * 15
          + cl.immigration_case_count * 50
          + cl.escalation_count * 10
          + cl.commitment_count * 10
          + case when cl.client_number like 'AR-%' then 5 else 0 end
          + case when cl.client_number like 'MC-%' then 3 else 0 end
        )::integer as link_count,
        first_value(cl.id) over (
          partition by cl.normalized_name, cl.case_number
          order by
            (
              cl.contract_count * 100
              + cl.payment_count * 20
              + cl.activity_count * 15
              + cl.immigration_case_count * 50
              + cl.escalation_count * 10
              + cl.commitment_count * 10
              + case when cl.client_number like 'AR-%' then 5 else 0 end
              + case when cl.client_number like 'MC-%' then 3 else 0 end
            ) desc,
            cl.created_at asc nulls last,
            cl.client_number asc
        ) as survivor_id
      from client_links cl
      join duplicate_groups dg
        on dg.normalized_name = cl.normalized_name
       and dg.case_number = cl.case_number
    )
    select
      survivor.id,
      duplicate.id,
      survivor.client_number,
      duplicate.client_number,
      duplicate.normalized_name,
      duplicate.case_number,
      duplicate.link_count,
      'dry_run'::text
    from ranked duplicate
    join ranked survivor on survivor.id = duplicate.survivor_id
    where duplicate.id <> duplicate.survivor_id
    order by duplicate.normalized_name, duplicate.case_number, duplicate.link_count desc;

    return;
  end if;

  create temporary table tmp_exact_duplicate_client_merge on commit drop as
  with client_links as (
    select
      c.id,
      c.name,
      c.client_number,
      c.case_number,
      c.created_at,
      public.normalize_collector_client_name(c.name) as normalized_name,
      count(distinct co.id)::integer as contract_count,
      count(distinct p.id)::integer as payment_count,
      count(distinct ca.id)::integer as activity_count,
      count(distinct ic.id)::integer as immigration_case_count,
      count(distinct e.id)::integer as escalation_count,
      count(distinct pc.id)::integer as commitment_count
    from public.clients c
    left join public.contracts co on co.client_id = c.id
    left join public.payments p on p.client_id = c.id
    left join public.collection_activities ca on ca.client_id = c.id
    left join public.immigration_cases ic on ic.client_id = c.id
    left join public.escalations e on e.client_id = c.id
    left join public.payment_commitments pc on pc.client_id = c.id
    where c.is_active = true
      and nullif(trim(c.case_number), '') is not null
    group by c.id
  ),
  duplicate_groups as (
    select normalized_name, case_number
    from client_links
    group by normalized_name, case_number
    having count(*) > 1
  ),
  ranked as (
    select
      cl.*,
      (
        cl.contract_count * 100
        + cl.payment_count * 20
        + cl.activity_count * 15
        + cl.immigration_case_count * 50
        + cl.escalation_count * 10
        + cl.commitment_count * 10
        + case when cl.client_number like 'AR-%' then 5 else 0 end
        + case when cl.client_number like 'MC-%' then 3 else 0 end
      )::integer as link_count,
      first_value(cl.id) over (
        partition by cl.normalized_name, cl.case_number
        order by
          (
            cl.contract_count * 100
            + cl.payment_count * 20
            + cl.activity_count * 15
            + cl.immigration_case_count * 50
            + cl.escalation_count * 10
            + cl.commitment_count * 10
            + case when cl.client_number like 'AR-%' then 5 else 0 end
            + case when cl.client_number like 'MC-%' then 3 else 0 end
          ) desc,
          cl.created_at asc nulls last,
          cl.client_number asc
      ) as survivor_id
    from client_links cl
    join duplicate_groups dg
      on dg.normalized_name = cl.normalized_name
     and dg.case_number = cl.case_number
  )
  select
    duplicate.id as duplicate_client_id,
    survivor.id as survivor_client_id,
    duplicate.client_number as duplicate_client_number,
    survivor.client_number as survivor_client_number,
    duplicate.normalized_name,
    duplicate.case_number,
    duplicate.link_count as duplicate_link_count,
    duplicate.contract_count as duplicate_contract_count,
    duplicate.payment_count as duplicate_payment_count,
    duplicate.activity_count as duplicate_activity_count,
    duplicate.immigration_case_count as duplicate_immigration_case_count
  from ranked duplicate
  join ranked survivor on survivor.id = duplicate.survivor_id
  where duplicate.id <> duplicate.survivor_id;

  update public.clients survivor
  set
    email = coalesce(nullif(survivor.email, ''), duplicate.email),
    phone = coalesce(nullif(survivor.phone, ''), duplicate.phone),
    mycase_id = coalesce(survivor.mycase_id, duplicate.mycase_id),
    filevine_project_id = coalesce(nullif(survivor.filevine_project_id, ''), duplicate.filevine_project_id),
    assigned_collector = coalesce(nullif(survivor.assigned_collector, ''), duplicate.assigned_collector),
    practice_area = coalesce(nullif(survivor.practice_area, ''), duplicate.practice_area),
    case_stage = coalesce(nullif(survivor.case_stage, ''), duplicate.case_stage),
    updated_at = now()
  from tmp_exact_duplicate_client_merge m
  join public.clients duplicate on duplicate.id = m.duplicate_client_id
  where survivor.id = m.survivor_client_id;

  update public.case_events t set client_id = m.survivor_client_id from tmp_exact_duplicate_client_merge m where t.client_id = m.duplicate_client_id;
  update public.case_milestones t set client_id = m.survivor_client_id from tmp_exact_duplicate_client_merge m where t.client_id = m.duplicate_client_id;
  update public.collection_activities t set client_id = m.survivor_client_id from tmp_exact_duplicate_client_merge m where t.client_id = m.duplicate_client_id;
  update public.consultations t set client_id = m.survivor_client_id from tmp_exact_duplicate_client_merge m where t.client_id = m.duplicate_client_id;
  update public.contracts t set client_id = m.survivor_client_id from tmp_exact_duplicate_client_merge m where t.client_id = m.duplicate_client_id;
  update public.escalations t set client_id = m.survivor_client_id from tmp_exact_duplicate_client_merge m where t.client_id = m.duplicate_client_id;
  update public.filevine_payment_events t set matched_client_id = m.survivor_client_id from tmp_exact_duplicate_client_merge m where t.matched_client_id = m.duplicate_client_id;
  update public.filevine_project_snapshots t set matched_client_id = m.survivor_client_id from tmp_exact_duplicate_client_merge m where t.matched_client_id = m.duplicate_client_id;
  update public.immigration_cases t set client_id = m.survivor_client_id from tmp_exact_duplicate_client_merge m where t.client_id = m.duplicate_client_id;
  update public.invoices t set client_id = m.survivor_client_id from tmp_exact_duplicate_client_merge m where t.client_id = m.duplicate_client_id;
  update public.lawpay_transactions t set client_id = m.survivor_client_id from tmp_exact_duplicate_client_merge m where t.client_id = m.duplicate_client_id;
  update public.lawpay_validation_log t set client_id = m.survivor_client_id from tmp_exact_duplicate_client_merge m where t.client_id = m.duplicate_client_id;
  update public.matters t set client_id = m.survivor_client_id from tmp_exact_duplicate_client_merge m where t.client_id = m.duplicate_client_id;
  update public.payment_commitments t set client_id = m.survivor_client_id from tmp_exact_duplicate_client_merge m where t.client_id = m.duplicate_client_id;
  update public.payments t set client_id = m.survivor_client_id from tmp_exact_duplicate_client_merge m where t.client_id = m.duplicate_client_id;
  update public.trust_client_balances t set client_id = m.survivor_client_id from tmp_exact_duplicate_client_merge m where t.client_id = m.duplicate_client_id;
  update public.trust_transactions t set client_id = m.survivor_client_id from tmp_exact_duplicate_client_merge m where t.client_id = m.duplicate_client_id;
  update public.unmatched_payments t set matched_client_id = m.survivor_client_id from tmp_exact_duplicate_client_merge m where t.matched_client_id = m.duplicate_client_id;

  insert into public.client_duplicate_merge_audit (
    survivor_client_id,
    duplicate_client_id,
    duplicate_client_number,
    survivor_client_number,
    normalized_name,
    case_number,
    merge_reason,
    moved_contracts,
    moved_payments,
    moved_activities,
    moved_immigration_cases
  )
  select
    m.survivor_client_id,
    m.duplicate_client_id,
    m.duplicate_client_number,
    m.survivor_client_number,
    m.normalized_name,
    m.case_number,
    'Exact same normalized client name and case number',
    m.duplicate_contract_count,
    m.duplicate_payment_count,
    m.duplicate_activity_count,
    m.duplicate_immigration_case_count
  from tmp_exact_duplicate_client_merge m;

  update public.clients duplicate
  set
    is_active = false,
    notes = concat_ws(E'\n', nullif(duplicate.notes, ''), 'Archived duplicate after merge on 2026-04-09. Links moved to survivor client.'),
    updated_at = now()
  from tmp_exact_duplicate_client_merge m
  where duplicate.id = m.duplicate_client_id;

  return query
  select
    m.survivor_client_id,
    m.duplicate_client_id,
    m.survivor_client_number,
    m.duplicate_client_number,
    m.normalized_name,
    m.case_number,
    m.duplicate_link_count,
    'merged'::text
  from tmp_exact_duplicate_client_merge m
  order by m.normalized_name, m.case_number;
end;
$$;
