-- VP fix (2026-10-13, certification of exec_insights_hero_tiles): ref_case_type_rules has RLS ON with ZERO policies.
-- public.case_type_classify() (and normalize_case_type / case_type_subtype / case_type_is_immigration on top of it) is
-- SECURITY INVOKER, so for an authenticated caller it saw 0 rules and classified EVERY case as 'Other' -> v_case_dim
-- reporting_family collapsed to 'Other / long-tail' (Sep 2026: 184 of 185 revenue cases) for every app user.
-- Reference data only (42 regex rules, no client data). Read policy mirrors ar_source_rows (is_active_user()), authenticated only.
drop policy if exists ref_case_type_rules_active_read on public.ref_case_type_rules;
create policy ref_case_type_rules_active_read on public.ref_case_type_rules
  for select to authenticated using (public.is_active_user());
