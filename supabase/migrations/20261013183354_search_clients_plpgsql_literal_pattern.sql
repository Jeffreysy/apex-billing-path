-- VP perf fix (2026-10-13, certification of client_master_search): the SQL-language search_clients() built its LIKE
-- pattern inside the function, so the planner never saw a constant and seq-scanned all 12,061 rows (85-150 ms per name
-- term vs ~1 ms for the same predicate with a literal). Rewritten in plpgsql with RETURN QUERY EXECUTE: the escaped
-- pattern is bound as a quoted LITERAL (format %L - no injection surface), so every call is planned with the real value
-- and uses the trigram GIN indexes. The phone arm is only added when the term has >= 7 digits.
-- Same signature, same gate ((select is_active_user())), same 2-char minimum, same escaping, same 20-row cap, same order.
create or replace function public.search_clients(p_term text, p_limit int default 20)
returns table (
  row_key text, client_id uuid, display_name text, email text, phone text, case_number text, quality_status text, collector text,
  open_ar numeric, open_contracts bigint, best_contract_id uuid, ledger_payments bigint, last_payment_date date,
  mycase_cases bigint, latest_case_stage text, status_key text, off_dial boolean, off_dial_source text, match_field text
)
language plpgsql
stable
security definer
set search_path to 'public'
as $function$
declare
  v_t   text := lower(btrim(coalesce(p_term, '')));
  v_d   text := regexp_replace(coalesce(p_term, ''), '\D', '', 'g');
  v_p   text;
  v_pre text;
  v_lim int  := least(greatest(coalesce(p_limit, 20), 1), 20);
  v_phone_arm text := '';
begin
  if not coalesce((select public.is_active_user()), false) or length(v_t) < 2 then
    return;
  end if;
  v_p   := '%' || replace(replace(replace(v_t, '\', '\\'), '%', '\%'), '_', '\_') || '%';
  v_pre := replace(replace(replace(v_t, '\', '\\'), '%', '\%'), '_', '\_') || '%';
  if length(v_d) >= 7 then
    v_phone_arm := format(' or s.phone_digits like %L', '%' || v_d || '%');
  end if;
  return query execute format($q$
    select s.row_key, s.client_id, s.display_name, s.email, s.phone, s.case_number, s.quality_status, s.collector,
           s.open_ar, s.open_contracts, s.best_contract_id, s.ledger_payments, s.last_payment_date,
           s.mycase_cases, s.latest_case_stage, s.status_key, s.off_dial, s.off_dial_source,
           case when lower(coalesce(s.display_name, '')) like %1$L then 'name'
                when lower(coalesce(s.case_number, '')) like %1$L then 'case_number'
                when lower(coalesce(s.email, '')) like %1$L then 'email'
                when %4$s and s.phone_digits like %5$L then 'phone'
                else 'other_identifier' end
    from public.mv_client_master_search s
    where (s.search_text like %1$L %2$s)
    order by (lower(coalesce(s.display_name, '')) like %3$L) desc,
             (s.status_key = 'excluded') asc,
             s.open_ar desc,
             s.display_name
    limit %6$s$q$,
    v_p, v_phone_arm, v_pre, (length(v_d) >= 7)::text, '%' || v_d || '%', v_lim);
end
$function$;

comment on function public.search_clients(text, int) is
'Client-master search (LexCollect header + Clients page). Active users only, >= 2 chars, LIKE-escaped, max 20 rows, one row per canonical client over mv_client_master_search; returns status_key / off_dial / off_dial_source / best_contract_id (open AR contract to deep-link) and which field matched. plpgsql + EXECUTE with %L literals so the trigram indexes are used (VP 2026-10-13).';

revoke all on function public.search_clients(text, int) from public, anon;
grant execute on function public.search_clients(text, int) to authenticated;
