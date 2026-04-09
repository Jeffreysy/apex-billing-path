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
    p_record_id::text,
    p_action,
    p_old_data,
    p_new_data,
    auth.uid()
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_user_access(
  p_user_id uuid,
  p_role public.user_role,
  p_is_active boolean,
  p_full_name text DEFAULT NULL
)
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_profile public.profiles;
  updated_profile public.profiles;
BEGIN
  IF public.current_user_role() NOT IN ('admin', 'partner') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT * INTO existing_profile
  FROM public.profiles
  WHERE id = p_user_id;

  IF existing_profile.id IS NULL THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  UPDATE public.profiles
  SET
    role = p_role,
    is_active = p_is_active,
    full_name = COALESCE(p_full_name, full_name),
    updated_at = now()
  WHERE id = p_user_id
  RETURNING * INTO updated_profile;

  PERFORM public.admin_log_user_access_event(
    'admin_update_user_access',
    p_user_id,
    to_jsonb(existing_profile),
    to_jsonb(updated_profile)
  );

  RETURN updated_profile;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_log_user_access_event(text, uuid, jsonb, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_user_access(uuid, public.user_role, boolean, text) TO authenticated;
