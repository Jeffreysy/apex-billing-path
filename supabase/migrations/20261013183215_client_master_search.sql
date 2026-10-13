-- Client-master search (2026-10-13, lexcollect-app-agent; VP applies + certifies). Jeff: "can I use the search bar to
-- look up clients now? please be sure that the front end is feeding from the supabase tables that carries all client info".
-- The header / Clients search (search_ar_clients over mv_client_search) only covered the OPEN AR book (ar_dashboard:
-- 3,924 contracts), so paid-off, closed, consult-only and Filevine-only clients could not be found. This index covers the
-- CLIENT MASTER (public.clients, merged duplicates folded into their survivor) and every identity we hold for a client.
--
-- One row per CANONICAL client (clients.client_quality_status <> 'merged_duplicate'). Identifiers folded in:
--   the client row (name, contact name, emails, client #, case #, A-number), its merged-duplicate rows (via
--   client_duplicate_merge_audit), MyCase contacts (name, email), MyCase cases (case #), MyCase invoices (invoice #),
--   ar_dashboard (invoice #, case #), client_source_links (active source ids). Phones are kept digits-only separately.
-- Status (one primary badge): excluded (test record) / open_ar (open AR $ from ar_dashboard) / consult_only /
--   paid_off (has certified-ledger payments, no open AR) / closed (inactive, or every MyCase case closed) / no_open_ar.
-- off_dial flag: client_decline_memory.dnc (client_id-keyed) OR a queue_exclusion_keys name key that matches exactly ONE
--   canonical client (name-keyed: ambiguous keys are NOT applied, so no client is mislabelled).
-- Contains client PII: NO table grants. Read only through search_clients() / client_master_card() (active users only).

create materialized view public.mv_client_master_search as
with canon as (
  select c.* from public.clients c where c.client_quality_status is distinct from 'merged_duplicate'
),
canon_map as (   -- any client id (canonical or merged duplicate) -> canonical client id
  select id as any_id, id as client_id from canon
  union
  select dm.duplicate_client_id, dm.survivor_client_id
  from (   -- VP edit: ONE survivor per duplicate (latest merge) so a duplicate merged twice can never double-count AR/payments
    select distinct on (a.duplicate_client_id) a.duplicate_client_id, a.survivor_client_id
    from public.client_duplicate_merge_audit a
    join canon s on s.id = a.survivor_client_id
    where a.duplicate_client_id not in (select id from canon)
    order by a.duplicate_client_id, a.created_at desc nulls last, a.id
  ) dm
),
idents as (
  select c.id as client_id, v as t
  from canon c, lateral (values (c.name), (c.contact_name), (c.email), (c.billing_contact_email), (c.client_number), (c.case_number), (c.a_number)) x(v)
  union all
  select m.client_id, v
  from canon_map m join public.clients d on d.id = m.any_id and d.id <> m.client_id,
       lateral (values (d.name), (d.email), (d.client_number), (d.case_number)) x(v)
  union all
  select m.client_id, v
  from public.mycase_contacts mc join canon_map m on m.any_id = mc.matched_client_id,
       lateral (values (mc.full_name), (mc.email)) x(v)
  union all
  select m.client_id, cs.case_number from public.mycase_cases cs join canon_map m on m.any_id = cs.matched_client_id
  union all
  select m.client_id, regexp_replace(mi.invoice_number, '^#', '') from public.mycase_invoices mi join canon_map m on m.any_id = mi.matched_client_id
  union all
  select m.client_id, v
  from public.ar_dashboard ad join canon_map m on m.any_id = ad.client_id,
       lateral (values (regexp_replace(ad.invoice_number, '^#', '')), (ad.case_number)) x(v)
  union all
  select m.client_id, l.source_id from public.client_source_links l join canon_map m on m.any_id = l.client_id
  where l.superseded_at is null
),
phones as (
  select c.id as client_id, regexp_replace(c.phone, '\D', '', 'g') as p from canon c where c.phone is not null
  union all
  select m.client_id, regexp_replace(v, '\D', '', 'g')
  from public.mycase_contacts mc join canon_map m on m.any_id = mc.matched_client_id,
       lateral (values (mc.phone), (mc.cell_phone_number), (mc.work_phone_number), (mc.home_phone_number)) x(v)
  where v is not null
),
ar as (
  select m.client_id, round(sum(ad.remaining_balance), 2) as open_ar, count(*) as open_contracts,
         (array_agg(ad.contract_id order by ad.remaining_balance desc, ad.contract_id))[1] as best_contract_id
  from public.ar_dashboard ad join canon_map m on m.any_id = ad.client_id
  where coalesce(ad.remaining_balance, 0) > 0
  group by m.client_id
),
pay as (
  select m.client_id, count(*) as ledger_payments, max(l.payment_date) as last_payment_date
  from public.v_financial_ledger_canonical l join canon_map m on m.any_id = l.client_id
  group by m.client_id
),
cases as (
  select m.client_id, count(*) as mycase_cases, count(*) filter (where cs.is_closed is not true) as open_cases,
         (array_agg(cs.case_stage order by cs.open_date desc nulls last))[1] as latest_case_stage,
         (array_agg(cs.case_number order by cs.open_date desc nulls last))[1] as latest_case_number
  from public.mycase_cases cs join canon_map m on m.any_id = cs.matched_client_id
  group by m.client_id
),
dnc_decline as (
  select m.client_id from public.client_decline_memory d join canon_map m on m.any_id = d.client_id where d.dnc
),
name_keys as (
  select c.id as client_id,
         (select string_agg(t, ' ' order by t)
            from unnest(regexp_split_to_array(lower(btrim(regexp_replace(regexp_replace(c.name, '[^A-Za-z ]', ' ', 'g'), '\s+', ' ', 'g'))), ' ')) t
           where t <> '') as k
  from canon c
),
off_dial_names as (   -- queue exclusion keys that map to exactly ONE canonical client
  select min(nk.client_id::text)::uuid as client_id
  from public.queue_exclusion_keys q join name_keys nk on nk.k = q.k
  group by q.k having count(*) = 1
),
off_dial as (   -- VP edit: keep provenance (dnc_decline is client_id-keyed; queue_exclusion_name_key is name-keyed)
  select client_id,
         case when bool_or(src = 'dnc_decline') then 'dnc_decline' else 'queue_exclusion_name_key' end as off_dial_source
  from (select client_id, 'dnc_decline'::text as src from dnc_decline
        union all
        select client_id, 'queue_exclusion_name_key'::text from off_dial_names) z
  group by client_id
),
idents_agg as (
  select client_id, lower(string_agg(distinct btrim(t), ' ')) as search_text
  from idents where nullif(btrim(t), '') is not null group by client_id
),
phones_agg as (
  select client_id, string_agg(distinct p, ' ') as phone_digits from phones where length(p) >= 7 group by client_id
),
client_rows as (
select 'client:' || c.id::text                                 as row_key,
       c.id                                                    as client_id,
       c.name                                                  as display_name,
       coalesce(c.email, c.billing_contact_email)              as email,
       c.phone                                                 as phone,
       coalesce(nullif(c.case_number, ''), cs.latest_case_number) as case_number,
       c.client_quality_status                                 as quality_status,
       c.assigned_collector                                    as collector,
       c.is_active,
       coalesce(ar.open_ar, 0)                                 as open_ar,
       coalesce(ar.open_contracts, 0)                          as open_contracts,
       ar.best_contract_id,
       coalesce(pay.ledger_payments, 0)                        as ledger_payments,
       pay.last_payment_date,
       coalesce(cs.mycase_cases, 0)                            as mycase_cases,
       cs.latest_case_stage,
       case
         when c.client_quality_status = 'test_record'                           then 'excluded'
         when coalesce(ar.open_ar, 0) > 0                                        then 'open_ar'
         when c.client_quality_status = 'consult_only'                           then 'consult_only'
         when coalesce(pay.ledger_payments, 0) > 0
              and (c.is_active is not false and coalesce(cs.open_cases, 1) > 0)  then 'paid_off'
         when c.is_active is false or (coalesce(cs.mycase_cases, 0) > 0 and coalesce(cs.open_cases, 0) = 0) then 'closed'
         else 'no_open_ar'
       end                                                     as status_key,
       (od.client_id is not null)                              as off_dial,
       od.off_dial_source                                      as off_dial_source,
       coalesce(ia.search_text, '')                            as search_text,
       coalesce(pa.phone_digits, '')                           as phone_digits,
       now()                                                   as refreshed_at
from canon c
left join ar    on ar.client_id = c.id
left join pay   on pay.client_id = c.id
left join cases cs on cs.client_id = c.id
left join off_dial od on od.client_id = c.id
left join idents_agg ia on ia.client_id = c.id
left join phones_agg pa on pa.client_id = c.id
),
unlinked_ar_rows as (   -- open AR contracts with NO client_id (247 / $1.70M on 2026-10-12): still findable, labelled as such
select 'contract:' || ad.contract_id::text                     as row_key,
       null::uuid                                              as client_id,
       ad.client_name                                          as display_name,
       ad.email                                                as email,
       ad.phone                                                as phone,
       ad.case_number                                          as case_number,
       null::text                                              as quality_status,
       ad.collector                                            as collector,
       null::boolean                                           as is_active,
       round(coalesce(ad.remaining_balance, 0), 2)             as open_ar,
       1::bigint                                               as open_contracts,
       ad.contract_id                                          as best_contract_id,
       0::bigint                                               as ledger_payments,
       null::date                                              as last_payment_date,
       0::bigint                                               as mycase_cases,
       null::text                                              as latest_case_stage,
       'open_ar_unlinked'::text                                as status_key,
       false                                                   as off_dial,
       null::text                                              as off_dial_source,
       lower(concat_ws(' ', ad.client_name, ad.case_number, ad.invoice_number, regexp_replace(coalesce(ad.invoice_number, ''), '^#', ''), ad.email)) as search_text,
       coalesce(regexp_replace(ad.phone, '\D', '', 'g'), '')  as phone_digits,
       now()                                                   as refreshed_at
from public.ar_dashboard ad
where ad.client_id is null and coalesce(ad.remaining_balance, 0) > 0
)
select * from client_rows
union all
select * from unlinked_ar_rows
with data;

create unique index mv_client_master_search_key on public.mv_client_master_search (row_key);
create index mv_client_master_search_client on public.mv_client_master_search (client_id);
create index mv_client_master_search_trgm on public.mv_client_master_search using gin (search_text gin_trgm_ops);
create index mv_client_master_search_phone_trgm on public.mv_client_master_search using gin (phone_digits gin_trgm_ops);

comment on materialized view public.mv_client_master_search is
'GRAIN: one row per CANONICAL client (clients minus merged duplicates; key client:<id>) PLUS one row per open AR contract that has NO client_id (key contract:<contract_id>, status open_ar_unlinked, so the whole AR book stays findable). KEY: row_key. Client-master search index for the LexCollect header / Clients search: every identifier we hold for a client (client row, merged duplicates, MyCase contacts/cases/invoices, ar_dashboard, active client_source_links; phones digits-only) + status (excluded / open_ar / open_ar_unlinked / consult_only / paid_off / closed / no_open_ar) + off_dial (decline DNC or an unambiguous queue-exclusion name key; off_dial_source says which - the name-keyed source is display-only, never a routing key). Merged duplicates map to ONE survivor (latest merge). Invariant checked hourly by refresh_exec_insights_cache(): SUM(open_ar) = ar_dashboard open AR within $1. Contains PII: NO grants; read only via search_clients() / client_master_card(). Refreshed hourly by refresh_exec_insights_cache().';

-- Search: active users only, >= 2 chars, LIKE-escaped, max 20 rows; phone digits matched when the term has >= 7 digits.
create or replace function public.search_clients(p_term text, p_limit int default 20)
returns table (
  row_key text, client_id uuid, display_name text, email text, phone text, case_number text, quality_status text, collector text,
  open_ar numeric, open_contracts bigint, best_contract_id uuid, ledger_payments bigint, last_payment_date date,
  mycase_cases bigint, latest_case_stage text, status_key text, off_dial boolean, off_dial_source text, match_field text
)
language sql
stable
security definer
set search_path to 'public'
as $function$
  with q as (
    select lower(btrim(coalesce(p_term, ''))) as t, regexp_replace(coalesce(p_term, ''), '\D', '', 'g') as d
  ), pat as (
    select t, d, '%' || replace(replace(replace(t, '\', '\\'), '%', '\%'), '_', '\_') || '%' as p from q
  )
  select s.row_key, s.client_id, s.display_name, s.email, s.phone, s.case_number, s.quality_status, s.collector,
         s.open_ar, s.open_contracts, s.best_contract_id, s.ledger_payments, s.last_payment_date,
         s.mycase_cases, s.latest_case_stage, s.status_key, s.off_dial, s.off_dial_source,
         case when lower(coalesce(s.display_name, '')) like pat.p then 'name'
              when lower(coalesce(s.case_number, '')) like pat.p then 'case_number'
              when lower(coalesce(s.email, '')) like pat.p then 'email'
              when length(pat.d) >= 7 and s.phone_digits like '%' || pat.d || '%' then 'phone'
              else 'other_identifier' end as match_field
  from public.mv_client_master_search s, pat
  where (select public.is_active_user())
    and length(pat.t) >= 2
    and (s.search_text like pat.p or (length(pat.d) >= 7 and s.phone_digits like '%' || pat.d || '%'))
  order by (lower(coalesce(s.display_name, '')) like pat.t || '%') desc,
           (s.status_key = 'excluded') asc,
           s.open_ar desc,
           s.display_name
  limit least(greatest(coalesce(p_limit, 20), 1), 20);
$function$;

-- One client's card (profile header / badge) by canonical OR merged-duplicate client id. Active users only.
create or replace function public.client_master_card(p_client_id uuid)
returns setof public.mv_client_master_search
language sql
stable
security definer
set search_path to 'public'
as $function$
  select s.*
  from public.mv_client_master_search s
  where (select public.is_active_user())
    and s.client_id = coalesce(
      (select a.survivor_client_id from public.client_duplicate_merge_audit a
        where a.duplicate_client_id = p_client_id
          and not exists (select 1 from public.mv_client_master_search x where x.client_id = p_client_id)
        order by a.created_at desc nulls last, a.id   -- VP edit: same single-survivor rule as the index
        limit 1),
      p_client_id)
  limit 1;
$function$;

comment on function public.search_clients(text, int) is
'Client-master search (LexCollect header + Clients page). Active users only, >= 2 chars, LIKE-escaped, max 20 rows, one row per canonical client over mv_client_master_search; returns status_key / off_dial / best_contract_id (open AR contract to deep-link) and which field matched.';
comment on function public.client_master_card(uuid) is
'One canonical client card (accepts a merged-duplicate id and returns its survivor). Active users only.';

revoke all on public.mv_client_master_search from public, anon, authenticated;
revoke all on function public.search_clients(text, int) from public, anon;
revoke all on function public.client_master_card(uuid) from public, anon;
grant execute on function public.search_clients(text, int) to authenticated;
grant execute on function public.client_master_card(uuid) to authenticated;

-- Hourly refresh: VP wired it into the existing guarded cache refresh (+ heartbeat count + AR tie invariant + health view).
create or replace function public.refresh_exec_insights_cache()
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
declare v_drift int; v_mix int; v_drift_months int; v_mix_months int; v_risk int; v_search int; v_master int;
        v_master_ar numeric; v_book_ar numeric; v_tie_ok boolean; v_status text; v_err text;
begin
  perform set_config('statement_timeout', '120s', true);
  begin   -- VP edit: a failed refresh writes a RED heartbeat instead of aborting silently (caches keep their last good build)
    refresh materialized view concurrently public.mv_exec_client_bucket_drift;
    refresh materialized view concurrently public.mv_exec_case_mix_monthly;
    refresh materialized view concurrently public.mv_exec_ar_at_risk;
    refresh materialized view concurrently public.mv_client_search;
    refresh materialized view concurrently public.mv_client_master_search;
  exception when others then
    get stacked diagnostics v_err = message_text;
    insert into public.pipeline_heartbeat(job, last_run_at, status, rows_inserted, detail)
    values ('exec_insights_cache', now(), 'RED', 0, 'REFRESH FAILED: ' || left(v_err, 400))
    on conflict (job) do update set last_run_at = excluded.last_run_at, status = excluded.status,
            rows_inserted = excluded.rows_inserted, detail = excluded.detail;
    return;
  end;
  select count(*), count(distinct month) into v_drift, v_drift_months from public.mv_exec_client_bucket_drift;
  select count(*), count(distinct month) into v_mix, v_mix_months from public.mv_exec_case_mix_monthly;
  select count(*) into v_risk from public.mv_exec_ar_at_risk where ar_total > 0;
  select count(*) into v_search from public.mv_client_search;
  select count(*), coalesce(sum(open_ar), 0) into v_master, v_master_ar from public.mv_client_master_search;
  select coalesce(sum(remaining_balance) filter (where coalesce(remaining_balance, 0) > 0), 0) into v_book_ar from public.ar_dashboard;
  v_tie_ok := abs(v_master_ar - v_book_ar) <= 1;   -- VP invariant: every open AR dollar lands on exactly one search row
  v_status := case when v_drift > 0 and v_mix > 0 and v_risk = 1 and v_search > 0 and v_master > 0 and v_tie_ok then 'GREEN' else 'WARN' end;
  insert into public.pipeline_heartbeat(job, last_run_at, status, rows_inserted, detail)
  values ('exec_insights_cache', now(), v_status, v_drift + v_mix,
          format('refreshed mv_exec_client_bucket_drift (%s cells / %s months) + mv_exec_case_mix_monthly (%s rows / %s months) + mv_exec_ar_at_risk (invoice clock) + mv_client_search (%s contracts) + mv_client_master_search (%s rows; open AR %s vs book %s: %s); feeds Admin > Executive Insights + header/Clients search',
                 v_drift, v_drift_months, v_mix, v_mix_months, v_search, v_master, v_master_ar, v_book_ar,
                 case when v_tie_ok then 'TIED' else 'NOT TIED' end))
  on conflict (job) do update set last_run_at = excluded.last_run_at, status = excluded.status,
          rows_inserted = excluded.rows_inserted, detail = excluded.detail;
end $function$;

create or replace view public.v_exec_insights_cache_health as
with hb as (
  select h.last_run_at, h.status, h.detail from public.pipeline_heartbeat h where h.job = 'exec_insights_cache'
), c as (
  select (select max(refreshed_at) from public.mv_exec_client_bucket_drift) as drift_refreshed_at,
         (select max(refreshed_at) from public.mv_exec_case_mix_monthly)    as mix_refreshed_at,
         (select max(refreshed_at) from public.mv_exec_ar_at_risk)          as risk_refreshed_at,
         (select max(refreshed_at) from public.mv_client_search)            as search_refreshed_at,
         (select max(refreshed_at) from public.mv_client_master_search)     as master_refreshed_at,
         (select max(end_snapshot_date) from public.mv_exec_client_bucket_drift) as cache_latest_end_snapshot,
         (select max(cases_loaded_through) from public.mv_exec_case_mix_monthly) as cache_cases_loaded_through,
         (select max(snapshot_date) from public.mv_exec_ar_at_risk)         as cache_ar_snapshot_date
), src as (
  select (select max(s.snapshot_date) from public.v_ar_snapshot_series s
           where s.source_system = 'mycase_csv'
             and s.snapshot_date > date_trunc('month', current_date)::date
             and not exists (select 1 from public.ar_snapshot_denylist d where d.snapshot_id = s.snapshot_id)) as live_latest_end_snapshot_this_month,
         (select max(open_date) from public.mycase_cases where open_date <= current_date) as live_cases_loaded_through,
         (select a.snapshot_date from public.v_ar_active_snapshot a limit 1) as live_ar_snapshot_date
), x as (
  select c.*, src.*, least(c.drift_refreshed_at, c.mix_refreshed_at, c.risk_refreshed_at, c.search_refreshed_at, c.master_refreshed_at) as oldest_refresh from c cross join src
)
select hb.last_run_at as heartbeat_at,
       hb.status      as heartbeat_status,
       hb.detail      as heartbeat_detail,
       x.drift_refreshed_at,
       x.mix_refreshed_at,
       x.risk_refreshed_at,
       x.search_refreshed_at,
       round(extract(epoch from now() - x.oldest_refresh) / 60.0, 1) as age_minutes,
       x.cache_latest_end_snapshot,
       x.live_latest_end_snapshot_this_month,
       x.cache_cases_loaded_through,
       x.live_cases_loaded_through,
       x.cache_ar_snapshot_date,
       x.live_ar_snapshot_date,
       case
         when hb.last_run_at is null or x.drift_refreshed_at is null or x.mix_refreshed_at is null or x.risk_refreshed_at is null
              or x.search_refreshed_at is null or x.master_refreshed_at is null then 'ALERT'
         when hb.status is distinct from 'GREEN' and hb.status is distinct from 'WARN' then 'ALERT'
         when now() - x.oldest_refresh > interval '26 hours' then 'ALERT'
         when now() - x.oldest_refresh > interval '2 hours'
              and (   (x.live_latest_end_snapshot_this_month is not null
                       and x.live_latest_end_snapshot_this_month > coalesce(x.cache_latest_end_snapshot, date '1900-01-01'))
                   or x.live_cases_loaded_through is distinct from x.cache_cases_loaded_through
                   or x.live_ar_snapshot_date     is distinct from x.cache_ar_snapshot_date) then 'ALERT'   -- a source moved and the cache missed it
         when now() - x.oldest_refresh > interval '2 hours' then 'WARN'
         when hb.status = 'WARN' then 'WARN'
         else 'GREEN'
       end as status,
       x.master_refreshed_at   -- appended (create or replace view can only add columns at the end)
from x left join hb on true;

comment on view public.v_exec_insights_cache_health is
'GRAIN: one row (singleton). Health of the Executive Insights + search caches (mv_exec_client_bucket_drift + mv_exec_case_mix_monthly + mv_exec_ar_at_risk + mv_client_search + mv_client_master_search; job exec_insights_cache; pg_cron exec-insights-cache-hourly). ALERT: never ran / RED heartbeat / older than 26 h / older than 2 h while a source moved (newer in-month MyCase CSV AR snapshot, case-feed date, or active AR snapshot not yet in the cache). WARN: older than 2 h, or heartbeat WARN (an empty cache, or mv_client_master_search open AR not tied to ar_dashboard within $1). VP 2026-10-13.';

select public.refresh_exec_insights_cache();
