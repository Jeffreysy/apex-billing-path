create table public.hardship_requests (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  contract_id uuid references public.contracts(id) on delete cascade,
  requested_by text not null,
  reason text not null,
  hardship_type text not null check (hardship_type in (
    'extended_term', 'reduced_payment', 'temporary_pause', 'settlement_offer', 'other'
  )),
  current_monthly_payment numeric(12,2),
  proposed_monthly_payment numeric(12,2),
  current_term_remaining integer,
  proposed_term_months integer,
  notes text,
  status text not null default 'pending' check (status in (
    'pending', 'approved', 'denied', 'counter_offered'
  )),
  reviewed_by text,
  reviewed_at timestamptz,
  review_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on public.hardship_requests (client_id);
create index on public.hardship_requests (contract_id);
create index on public.hardship_requests (status);
create index on public.hardship_requests (created_at desc);

alter table public.hardship_requests enable row level security;

create policy "Authenticated users can read hardship_requests"
  on public.hardship_requests for select to authenticated using (true);

create policy "Authenticated users can insert hardship_requests"
  on public.hardship_requests for insert to authenticated with check (true);

create policy "Authenticated users can update hardship_requests"
  on public.hardship_requests for update to authenticated using (true);
