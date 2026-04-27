-- Tighten client case-number backfill.
-- The first pass was intentionally broad, but internal client numbers like
-- AR-01001 can look like "01-001". Do not derive case numbers from
-- clients.client_number; prefer linked contracts/cases and only use text
-- fields that may naturally contain an actual case reference.

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
        public.extract_case_number_from_text(cl.name),
        public.extract_case_number_from_text(cl.notes),
        public.extract_case_number_from_text(cl.custom_fields::text)
      ),
      '^E?(\d{2})[- ]?(\d{3,5})$',
      '\1-\2'
    ) as case_number
  from public.clients cl
  where cl.is_active = true
),
preferred_case_numbers as (
  select
    cl.id as client_id,
    coalesce(ccn.case_number, icn.case_number, ecn.case_number) as case_number
  from public.clients cl
  left join contract_case_numbers ccn on ccn.client_id = cl.id
  left join immigration_case_numbers icn on icn.client_id = cl.id
  left join extracted_client_case_numbers ecn on ecn.client_id = cl.id
  where cl.is_active = true
)
update public.clients cl
set
  case_number = pcn.case_number,
  updated_at = now()
from preferred_case_numbers pcn
where cl.id = pcn.client_id
  and cl.case_number is distinct from pcn.case_number;
