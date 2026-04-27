-- Assign unassigned collection clients to the collector with repeated,
-- positive contact history. This keeps queue ownership aligned with the
-- collector already working the account.

create table if not exists public.collector_assignment_audit (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  previous_collector text,
  assigned_collector text not null,
  assignment_reason text not null,
  contact_count integer not null,
  positive_count integer not null,
  collected_total numeric not null default 0,
  last_contact date,
  assignment_score numeric not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_collector_assignment_audit_client_id
  on public.collector_assignment_audit (client_id);

create index if not exists idx_collector_assignment_audit_created_at
  on public.collector_assignment_audit (created_at desc);

create or replace function public.normalize_collector_client_name(value text)
returns text
language sql
immutable
as $$
  select trim(regexp_replace(upper(coalesce(value, '')), '[^A-Z0-9]+', ' ', 'g'));
$$;

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

create or replace function public.refresh_collector_assignment_for_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_client_id uuid;
begin
  if new.collector not in ('Alejandro A', 'Patricio D', 'Maritza V') then
    return new;
  end if;

  target_client_id := new.client_id;

  if target_client_id is null then
    select c.id
    into target_client_id
    from public.clients c
    where c.is_active = true
      and public.normalize_collector_client_name(c.name) = public.normalize_collector_client_name(new.client_name)
    group by c.id
    having count(*) = 1
    limit 1;
  end if;

  if target_client_id is not null then
    perform *
    from public.refresh_collector_assignments(false, target_client_id);
  end if;

  return new;
end;
$$;

drop trigger if exists trg_refresh_collector_assignment_for_activity on public.collection_activities;

create trigger trg_refresh_collector_assignment_for_activity
after insert or update of collector, client_id, client_name, outcome, notes, activity_type, collected_amount, is_junk
on public.collection_activities
for each row
execute function public.refresh_collector_assignment_for_activity();
