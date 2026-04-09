INSERT INTO public.profiles (id, email, full_name, role, is_active)
SELECT
  id,
  email,
  COALESCE(raw_user_meta_data ->> 'full_name', 'Jeffrey Soto-Gil'),
  'admin'::public.user_role,
  true
FROM auth.users
WHERE lower(email) = lower('jeffreyso@elizabethrosariolaw.com')
ON CONFLICT (id) DO UPDATE
SET
  email = EXCLUDED.email,
  full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
  role = 'admin'::public.user_role,
  is_active = true,
  updated_at = now();
