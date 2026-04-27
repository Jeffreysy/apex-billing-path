-- Tighten forward assignment trigger: if an activity has no client_id, only
-- resolve by client name when that normalized name maps to exactly one active
-- client. This avoids assigning common/duplicate names arbitrarily.

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
    with matching_clients as (
      select c.id
      from public.clients c
      where c.is_active = true
        and public.normalize_collector_client_name(c.name) = public.normalize_collector_client_name(new.client_name)
    )
    select (array_agg(id))[1]
    into target_client_id
    from matching_clients
    having count(*) = 1;
  end if;

  if target_client_id is not null then
    perform *
    from public.refresh_collector_assignments(false, target_client_id);
  end if;

  return new;
end;
$$;
