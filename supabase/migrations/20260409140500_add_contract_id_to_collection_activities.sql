alter table public.collection_activities
  add column if not exists contract_id uuid references public.contracts(id) on delete set null;

create index if not exists idx_collection_activities_contract_id
  on public.collection_activities(contract_id);
