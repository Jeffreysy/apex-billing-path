-- PL/pgSQL output column names can conflict with CTE column names. Prefer SQL
-- column references inside this function.

create or replace function public.refresh_collector_assignments(
  p_dry_run boolean default true,
  p_client_id uuid default null
)
returns table (
  client_id uuid,
  client_name text,
  assigned_collector text,
  previous_collector text,
  contact_count integer,
  positive_count integer,
  collected_total numeric,
  last_contact date,
  assignment_score numeric,
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
    with normalized_clients as (
      select
        c.id,
        c.name,
        c.assigned_collector,
        public.normalize_collector_client_name(c.name) as name_key
      from public.clients c
      where c.is_active = true
        and (p_client_id is null or c.id = p_client_id)
    ),
    unique_client_names as (
      select
        name_key,
        (array_agg(id))[1] as unique_client_id
      from normalized_clients
      where length(name_key) > 4
      group by name_key
      having count(*) = 1
    ),
    activity_links as (
      select
        a.*,
        coalesce(a.client_id, u.unique_client_id) as resolved_client_id
      from public.collection_activities a
      left join unique_client_names u
        on u.name_key = public.normalize_collector_client_name(a.client_name)
      where a.collector in ('Alejandro A', 'Patricio D', 'Maritza V')
        and coalesce(a.is_junk, false) = false
    ),
    scores as (
      select
        al.resolved_client_id as client_id,
        al.collector,
        count(*)::integer as contact_count,
        count(*) filter (
          where coalesce(al.collected_amount, 0) > 0
             or coalesce(al.outcome, '') ~* '(paid|payment|collected|commit|promise|completed|success)'
             or coalesce(al.notes, '') ~* '(paid|payment|collected|commit|promise)'
             or coalesce(al.activity_type, '') ~* '(paid|payment|collected|commit|promise)'
        )::integer as positive_count,
        sum(coalesce(al.collected_amount, 0))::numeric as collected_total,
        max(al.activity_date)::date as last_contact
      from activity_links al
      where al.resolved_client_id is not null
        and (p_client_id is null or al.resolved_client_id = p_client_id)
      group by al.resolved_client_id, al.collector
    ),
    ranked as (
      select
        s.*,
        (
          s.contact_count
          + (s.positive_count * 2)
          + least(s.collected_total / 100.0, 10)
        )::numeric as assignment_score,
        row_number() over (
          partition by s.client_id
          order by
            (
              s.contact_count
              + (s.positive_count * 2)
              + least(s.collected_total / 100.0, 10)
            ) desc,
            s.last_contact desc
        ) as rank
      from scores s
      where s.contact_count >= 2
        and (s.positive_count > 0 or s.collected_total > 0)
    )
    select
      c.id,
      c.name,
      r.collector,
      c.assigned_collector,
      r.contact_count,
      r.positive_count,
      r.collected_total,
      r.last_contact,
      r.assignment_score,
      'dry_run'::text
    from ranked r
    join public.clients c on c.id = r.client_id
    where r.rank = 1
      and lower(coalesce(nullif(trim(c.assigned_collector), ''), 'unassigned')) in ('unassigned', 'unknown')
    order by r.collector, r.assignment_score desc;

    return;
  end if;

  return query
  with normalized_clients as (
    select
      c.id,
      c.name,
      c.assigned_collector,
      public.normalize_collector_client_name(c.name) as name_key
    from public.clients c
    where c.is_active = true
      and (p_client_id is null or c.id = p_client_id)
  ),
  unique_client_names as (
    select
      name_key,
      (array_agg(id))[1] as unique_client_id
    from normalized_clients
    where length(name_key) > 4
    group by name_key
    having count(*) = 1
  ),
  activity_links as (
    select
      a.*,
      coalesce(a.client_id, u.unique_client_id) as resolved_client_id
    from public.collection_activities a
    left join unique_client_names u
      on u.name_key = public.normalize_collector_client_name(a.client_name)
    where a.collector in ('Alejandro A', 'Patricio D', 'Maritza V')
      and coalesce(a.is_junk, false) = false
  ),
  scores as (
    select
      al.resolved_client_id as client_id,
      al.collector,
      count(*)::integer as contact_count,
      count(*) filter (
        where coalesce(al.collected_amount, 0) > 0
           or coalesce(al.outcome, '') ~* '(paid|payment|collected|commit|promise|completed|success)'
           or coalesce(al.notes, '') ~* '(paid|payment|collected|commit|promise)'
           or coalesce(al.activity_type, '') ~* '(paid|payment|collected|commit|promise)'
      )::integer as positive_count,
      sum(coalesce(al.collected_amount, 0))::numeric as collected_total,
      max(al.activity_date)::date as last_contact
    from activity_links al
    where al.resolved_client_id is not null
      and (p_client_id is null or al.resolved_client_id = p_client_id)
    group by al.resolved_client_id, al.collector
  ),
  ranked as (
    select
      s.*,
      (
        s.contact_count
        + (s.positive_count * 2)
        + least(s.collected_total / 100.0, 10)
      )::numeric as assignment_score,
      row_number() over (
        partition by s.client_id
        order by
          (
            s.contact_count
            + (s.positive_count * 2)
            + least(s.collected_total / 100.0, 10)
          ) desc,
          s.last_contact desc
      ) as rank
    from scores s
    where s.contact_count >= 2
      and (s.positive_count > 0 or s.collected_total > 0)
  ),
  eligible as (
    select
      c.id as client_id,
      c.name as client_name,
      c.assigned_collector as previous_collector,
      r.collector as assigned_collector,
      r.contact_count,
      r.positive_count,
      r.collected_total,
      r.last_contact,
      r.assignment_score
    from ranked r
    join public.clients c on c.id = r.client_id
    where r.rank = 1
      and lower(coalesce(nullif(trim(c.assigned_collector), ''), 'unassigned')) in ('unassigned', 'unknown')
  ),
  updated_clients as (
    update public.clients c
    set
      assigned_collector = e.assigned_collector,
      updated_at = now()
    from eligible e
    where c.id = e.client_id
    returning
      e.client_id,
      e.client_name,
      e.assigned_collector,
      e.previous_collector,
      e.contact_count,
      e.positive_count,
      e.collected_total,
      e.last_contact,
      e.assignment_score
  ),
  updated_contracts as (
    update public.contracts c
    set collector = uc.assigned_collector
    from updated_clients uc
    where c.client_id = uc.client_id
      and coalesce(c.status, '') in ('Active', 'Risk')
      and lower(coalesce(nullif(trim(c.collector), ''), 'unassigned')) in ('unassigned', 'unknown')
    returning c.id
  ),
  audit_rows as (
    insert into public.collector_assignment_audit (
      client_id,
      previous_collector,
      assigned_collector,
      assignment_reason,
      contact_count,
      positive_count,
      collected_total,
      last_contact,
      assignment_score
    )
    select
      uc.client_id,
      uc.previous_collector,
      uc.assigned_collector,
      'Repeated positive collector contact history',
      uc.contact_count,
      uc.positive_count,
      uc.collected_total,
      uc.last_contact,
      uc.assignment_score
    from updated_clients uc
    returning client_id
  )
  select
    uc.client_id,
    uc.client_name,
    uc.assigned_collector,
    uc.previous_collector,
    uc.contact_count,
    uc.positive_count,
    uc.collected_total,
    uc.last_contact,
    uc.assignment_score,
    'assigned'::text
  from updated_clients uc
  order by uc.assigned_collector, uc.assignment_score desc;
end;
$$;
