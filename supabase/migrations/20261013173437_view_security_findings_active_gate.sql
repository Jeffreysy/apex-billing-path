-- VP (supabase-auditor) 2026-10-13 - gate the side-door findings list to ACTIVE users.
-- Found in the VP post-apply persona check of cert vp_20261013_view_security_watchman (6bf9d488): v_view_security_findings
-- (and a direct RPC call to view_security_scan()) listed all 519 open side doors to a deactivated admin and to a profile-less
-- JWT. Catalog metadata only - no client data - but it is a map of which views bypass RLS.
-- Fix: the scan returns nothing when the caller is role authenticated and not an active user. The watchman run function
-- (SECURITY DEFINER -> current_user postgres, called by pg_cron) and service_role are unaffected. anon has no EXECUTE.
do $$
declare
  v_def text := pg_get_functiondef('public.view_security_scan()'::regprocedure);
  v_old text := 'left join public.view_security_baseline b on b.object_name = fd.relname and b.finding = fd.finding;';
  v_new text := 'left join public.view_security_baseline b on b.object_name = fd.relname and b.finding = fd.finding'
                || chr(10) || '  where (current_user <> ''authenticated'' or (select public.is_active_user()));';
begin
  if (length(v_def) - length(replace(v_def, v_old, ''))) / length(v_old) <> 1 then
    raise exception 'view_security_scan(): expected exactly one baseline join token; re-verify';
  end if;
  execute replace(v_def, v_old, v_new);

  insert into public.ddl_migration_audit
    (migration_key, object_kind, affected_objects, issue, root_cause, implementation_summary, migration_file,
     before_fn_sha256, after_fn_sha256, before_sql, rollback_sql, before_evidence, status_gate_unchanged, applied_by, notes)
  values (
    'vp_20261013_view_security_findings_active_gate',
    'function rebuild (active-user gate, one token) (DDL)',
    array['public.view_security_scan()','public.v_view_security_findings'],
    'v_view_security_findings / view_security_scan() listed the 519 open side doors to deactivated and profile-less sessions (catalog metadata, no client data).',
    'The scan reads only pg_catalog, so no RLS-protected table sits underneath to gate it.',
    'Appended WHERE (current_user <> ''authenticated'' OR (select is_active_user())) to the scan''s final select. Definer run fn (postgres) and service_role unaffected.',
    'apex-billing-path/supabase/migrations/<applied version>_view_security_findings_active_gate.sql',
    encode(sha256(convert_to(v_def,'UTF8')),'hex'),
    encode(sha256(convert_to(pg_get_functiondef('public.view_security_scan()'::regprocedure),'UTF8')),'hex'),
    v_def,
    v_def,
    jsonb_build_object('deactivated_admin_findings_rows_before', 519, 'no_profile_jwt_findings_rows_before', 519),
    true, 'supabase-auditor (VP)', 'Follow-up to 6bf9d488. rollback_sql = the prior function definition verbatim.');
end $$;
