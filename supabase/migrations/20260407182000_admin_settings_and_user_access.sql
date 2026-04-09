CREATE TABLE IF NOT EXISTS public.system_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  privacy_warning text,
  collections_notice text,
  legal_notice text,
  security_notice text,
  support_email text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.system_settings (
  id,
  privacy_warning,
  collections_notice,
  legal_notice,
  security_notice,
  support_email
)
VALUES (
  1,
  'Authorized personnel only. Client, billing, and collections data may contain privileged or sensitive information.',
  'Escalations and payment commitments should be recorded in LexCollect instead of external spreadsheets whenever possible.',
  'Legal staff should review handoffs and compliance-sensitive escalations within the secure system.',
  'Use role-based access only. Never share credentials or export sensitive data without approval.',
  'jeffreyso@elizabethrosariolaw.com'
)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_read_system_settings" ON public.system_settings;
CREATE POLICY "auth_read_system_settings" ON public.system_settings
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE OR REPLACE FUNCTION public.admin_list_user_access()
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  role public.user_role,
  is_active boolean,
  created_at timestamptz,
  last_sign_in_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF public.current_user_role() NOT IN ('admin', 'partner') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    COALESCE(p.email, u.email::text) AS email,
    p.full_name,
    p.role,
    p.is_active,
    p.created_at,
    u.last_sign_in_at
  FROM public.profiles p
  LEFT JOIN auth.users u ON u.id = p.id
  ORDER BY COALESCE(p.full_name, p.email, u.email::text) ASC;
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
  updated_profile public.profiles;
BEGIN
  IF public.current_user_role() NOT IN ('admin', 'partner') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE public.profiles
  SET
    role = p_role,
    is_active = p_is_active,
    full_name = COALESCE(p_full_name, full_name),
    updated_at = now()
  WHERE id = p_user_id
  RETURNING * INTO updated_profile;

  IF updated_profile.id IS NULL THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  RETURN updated_profile;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_get_system_settings()
RETURNS public.system_settings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  settings_row public.system_settings;
BEGIN
  IF public.current_user_role() NOT IN ('admin', 'partner') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT * INTO settings_row
  FROM public.system_settings
  WHERE id = 1;

  RETURN settings_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_system_settings(
  p_privacy_warning text,
  p_collections_notice text,
  p_legal_notice text,
  p_security_notice text,
  p_support_email text
)
RETURNS public.system_settings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  settings_row public.system_settings;
BEGIN
  IF public.current_user_role() NOT IN ('admin', 'partner') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  INSERT INTO public.system_settings (
    id,
    privacy_warning,
    collections_notice,
    legal_notice,
    security_notice,
    support_email
  )
  VALUES (
    1,
    p_privacy_warning,
    p_collections_notice,
    p_legal_notice,
    p_security_notice,
    p_support_email
  )
  ON CONFLICT (id) DO UPDATE
  SET
    privacy_warning = EXCLUDED.privacy_warning,
    collections_notice = EXCLUDED.collections_notice,
    legal_notice = EXCLUDED.legal_notice,
    security_notice = EXCLUDED.security_notice,
    support_email = EXCLUDED.support_email,
    updated_at = now()
  RETURNING * INTO settings_row;

  RETURN settings_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_list_user_access() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_user_access(uuid, public.user_role, boolean, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_system_settings() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_system_settings(text, text, text, text, text) TO authenticated;
