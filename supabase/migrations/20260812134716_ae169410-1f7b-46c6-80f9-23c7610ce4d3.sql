REVOKE ALL ON public.mycase_sync_state FROM anon, authenticated;
GRANT SELECT (sync_key, updated_at, last_error, meta) ON public.mycase_sync_state TO authenticated;
GRANT ALL ON public.mycase_sync_state TO service_role;