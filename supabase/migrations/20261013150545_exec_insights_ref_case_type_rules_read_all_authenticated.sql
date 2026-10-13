-- VP perf fix (2026-10-13): case_type_classify() is a non-inlinable per-call SQL function, so ANY per-row policy
-- predicate on ref_case_type_rules is re-evaluated ~4 x 42 times per case (is_active_user(): 34 s; InitPlan-wrapped: 20 s;
-- authenticated statement_timeout is 8 s). ref_case_type_rules is non-sensitive reference config (42 regex case-type
-- rules, no client data), so authenticated callers may read it unconditionally. anon still has no policy -> 0 rows.
-- Measured: v_exec_case_mix_monthly 3.9 s as an active admin, byte-identical (md5) to the postgres result.
alter policy ref_case_type_rules_active_read on public.ref_case_type_rules using (true);
alter policy ref_case_type_rules_active_read on public.ref_case_type_rules rename to ref_case_type_rules_authenticated_read;
