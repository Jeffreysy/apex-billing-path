-- Website inquiries: submissions from the public marketing site
-- ("Book a diagnostic" form and the blog newsletter form).
--
-- Anonymous visitors may INSERT. Only admins and partners may read or
-- update rows, so the inbox is visible in the dashboard but never to the
-- public key.

CREATE TABLE IF NOT EXISTS public.website_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  kind text NOT NULL DEFAULT 'diagnostic'
    CHECK (kind IN ('diagnostic', 'newsletter')),
  status text NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'contacted', 'closed')),
  full_name text,
  firm_name text,
  email text NOT NULL,
  phone text,
  practice_area text,
  firm_size text,
  systems text,
  message text,
  source_page text,
  CONSTRAINT website_inquiries_email_len CHECK (char_length(email) BETWEEN 3 AND 320),
  CONSTRAINT website_inquiries_full_name_len CHECK (full_name IS NULL OR char_length(full_name) <= 200),
  CONSTRAINT website_inquiries_firm_name_len CHECK (firm_name IS NULL OR char_length(firm_name) <= 200),
  CONSTRAINT website_inquiries_phone_len CHECK (phone IS NULL OR char_length(phone) <= 50),
  CONSTRAINT website_inquiries_practice_len CHECK (practice_area IS NULL OR char_length(practice_area) <= 100),
  CONSTRAINT website_inquiries_size_len CHECK (firm_size IS NULL OR char_length(firm_size) <= 100),
  CONSTRAINT website_inquiries_systems_len CHECK (systems IS NULL OR char_length(systems) <= 500),
  CONSTRAINT website_inquiries_message_len CHECK (message IS NULL OR char_length(message) <= 5000),
  CONSTRAINT website_inquiries_source_len CHECK (source_page IS NULL OR char_length(source_page) <= 200)
);

COMMENT ON TABLE public.website_inquiries IS
  'Leads and newsletter sign-ups submitted from the public LexCollect website.';

CREATE INDEX IF NOT EXISTS website_inquiries_created_at_idx
  ON public.website_inquiries (created_at DESC);

CREATE INDEX IF NOT EXISTS website_inquiries_status_idx
  ON public.website_inquiries (status)
  WHERE status <> 'closed';

-- Keep updated_at current (helper already exists in this project).
DROP TRIGGER IF EXISTS website_inquiries_set_updated_at ON public.website_inquiries;
CREATE TRIGGER website_inquiries_set_updated_at
  BEFORE UPDATE ON public.website_inquiries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.website_inquiries ENABLE ROW LEVEL SECURITY;

-- The public site submits with the anon key; a logged-in user may also submit.
DROP POLICY IF EXISTS "website_inquiries_public_insert" ON public.website_inquiries;
CREATE POLICY "website_inquiries_public_insert"
  ON public.website_inquiries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    status = 'new'
    AND kind IN ('diagnostic', 'newsletter')
  );

-- Only admins and partners can read the inbox.
DROP POLICY IF EXISTS "website_inquiries_admin_select" ON public.website_inquiries;
CREATE POLICY "website_inquiries_admin_select"
  ON public.website_inquiries
  FOR SELECT
  TO authenticated
  USING (public.current_user_role() = ANY (ARRAY['admin'::public.user_role, 'partner'::public.user_role]));

-- Only admins and partners can triage (change status).
DROP POLICY IF EXISTS "website_inquiries_admin_update" ON public.website_inquiries;
CREATE POLICY "website_inquiries_admin_update"
  ON public.website_inquiries
  FOR UPDATE
  TO authenticated
  USING (public.current_user_role() = ANY (ARRAY['admin'::public.user_role, 'partner'::public.user_role]))
  WITH CHECK (public.current_user_role() = ANY (ARRAY['admin'::public.user_role, 'partner'::public.user_role]));

GRANT INSERT ON public.website_inquiries TO anon;
GRANT INSERT, SELECT, UPDATE ON public.website_inquiries TO authenticated;
