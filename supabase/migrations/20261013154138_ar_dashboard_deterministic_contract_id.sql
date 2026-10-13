-- REPO NOTE 2026-10-13 (lexcollect-app-agent, per VP rule in 20261013163519): this file now rebuilds the view
-- WITH (security_invoker = true). The text applied to the DB as 20261013154138 (sha 47af8006...) omitted it, which reset
-- reloptions; 20261013163519_ar_dashboard_security_invoker_restore.sql restored it in the DB (cert 640ed64c). DB = correct.
-- VP fix (2026-10-13, found certifying the header client search): ar_dashboard emitted
--   COALESCE(bc.contract_id, gen_random_uuid()) AS contract_id
-- so the 975 AR rows (of 3,924; $4,603,094.71) with no matching contracts row got a NEW random id on every query.
-- Any id captured from one read (search index, ClientLookup ?clientId=, segments) could never be found again.
-- Fix: a deterministic surrogate derived from the snapshot row's invoice number (unique per snapshot; stable across
-- snapshots), falling back to the ar_source_rows id. Real contract ids (2,949 rows) are untouched. No dollar column changes.
-- Applied by token replacement on the live definition so nothing else in the view can drift.
do $$
declare v_def text; v_new text;
begin
  v_def := pg_get_viewdef('public.ar_dashboard'::regclass, true);
  if (length(v_def) - length(replace(v_def, 'gen_random_uuid()', ''))) / length('gen_random_uuid()') <> 1 then
    raise exception 'expected exactly one gen_random_uuid() in ar_dashboard';
  end if;
  v_new := replace(v_def, 'COALESCE(bc.contract_id, gen_random_uuid())',
                   'COALESCE(bc.contract_id, md5(''ar_dashboard:''::text || COALESCE(replace(asr.invoice_number, '' ''::text, ''''::text), asr.id::text))::uuid)');
  if v_new = v_def then
    raise exception 'contract_id expression not found verbatim in ar_dashboard';
  end if;
  execute 'create or replace view public.ar_dashboard with (security_invoker = true) as ' || v_new;
end $$;

comment on column public.ar_dashboard.contract_id is
'contracts.id when a contract matches the invoice; otherwise a DETERMINISTIC surrogate md5(''ar_dashboard:'' || invoice_number)::uuid (stable across reads and snapshots). Was gen_random_uuid() (re-rolled every query) until VP fix 2026-10-13.';
