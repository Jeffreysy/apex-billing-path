-- Add a first-class case number field to clients so client lookup/search can
-- use the same case identifiers already present on contracts and cases.

alter table public.clients
  add column if not exists case_number text;

create index if not exists idx_clients_case_number
  on public.clients (case_number)
  where case_number is not null;

create or replace function public.extract_case_number_from_text(value text)
returns text
language sql
immutable
as $$
  select nullif(
    upper(
      substring(
        coalesce(value, '')
        from '(?:\mE?\d{2}[- ]?\d{3,5}\M)'
      )
    ),
    ''
  );
$$;

with contract_case_numbers as (
  select distinct on (c.client_id)
    c.client_id,
    regexp_replace(upper(trim(c.case_number)), '^E?(\d{2})[- ]?(\d{3,5})$', '\1-\2') as case_number
  from public.contracts c
  where c.client_id is not null
    and nullif(trim(c.case_number), '') is not null
    and upper(trim(c.case_number)) ~ '^E?\d{2}[- ]?\d{3,5}$'
  order by c.client_id, c.created_at desc nulls last, c.start_date desc nulls last
),
immigration_case_numbers as (
  select distinct on (ic.client_id)
    ic.client_id,
    regexp_replace(upper(trim(ic.case_number)), '^E?(\d{2})[- ]?(\d{3,5})$', '\1-\2') as case_number
  from public.immigration_cases ic
  where ic.client_id is not null
    and nullif(trim(ic.case_number), '') is not null
    and upper(trim(ic.case_number)) ~ '^E?\d{2}[- ]?\d{3,5}$'
  order by ic.client_id, ic.open_date desc nulls last, ic.created_at desc nulls last
),
extracted_client_case_numbers as (
  select
    cl.id as client_id,
    regexp_replace(
      coalesce(
        public.extract_case_number_from_text(cl.client_number),
        public.extract_case_number_from_text(cl.name),
        public.extract_case_number_from_text(cl.notes),
        public.extract_case_number_from_text(cl.custom_fields::text)
      ),
      '^E?(\d{2})[- ]?(\d{3,5})$',
      '\1-\2'
    ) as case_number
  from public.clients cl
  where cl.is_active = true
)
update public.clients cl
set
  case_number = coalesce(ccn.case_number, icn.case_number, ecn.case_number),
  updated_at = now()
from extracted_client_case_numbers ecn
left join contract_case_numbers ccn on ccn.client_id = ecn.client_id
left join immigration_case_numbers icn on icn.client_id = ecn.client_id
where cl.id = ecn.client_id
  and coalesce(ccn.case_number, icn.case_number, ecn.case_number) is not null
  and cl.case_number is distinct from coalesce(ccn.case_number, icn.case_number, ecn.case_number);
