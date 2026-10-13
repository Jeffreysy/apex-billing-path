-- VP perf fix (2026-10-13): the two read policies added for the Executive Insights certification called
-- is_active_user() (SECURITY DEFINER, so never inlined) once PER ROW. case_type_classify() scans the 42-row
-- ref_case_type_rules up to 4x per case, so v_exec_case_mix_monthly took ~34 s for an authenticated caller.
-- Wrapping the call in a scalar subquery makes it a once-per-statement InitPlan (Supabase RLS performance pattern).
-- Same semantics: active authenticated users read; everyone else sees 0 rows.
alter policy ref_case_type_rules_active_read on public.ref_case_type_rules
  using ((select public.is_active_user()));
alter policy ar_snapshot_denylist_active_read on public.ar_snapshot_denylist
  using ((select public.is_active_user()));
