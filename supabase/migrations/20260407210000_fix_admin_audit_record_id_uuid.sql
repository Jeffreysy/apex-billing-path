CREATE OR REPLACE FUNCTION public.admin_log_user_access_event(
  p_action text,
  p_record_id uuid,
  p_old_data jsonb DEFAULT NULL,
  p_new_data jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.current_user_role() NOT IN ('admin', 'partner') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  INSERT INTO public.audit_log (
    table_name,
    record_id,
    action,
    old_data,
    new_data,
    performed_by
  )
  VALUES (
    'profiles',
    p_record_id,
    p_action,
    p_old_data,
    p_new_data,
    auth.uid()
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_log_user_access_event(text, uuid, jsonb, jsonb) TO authenticated;
