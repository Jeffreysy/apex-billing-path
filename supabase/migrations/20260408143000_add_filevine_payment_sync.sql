CREATE TABLE IF NOT EXISTS public.filevine_payment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filevine_payment_id text NOT NULL UNIQUE,
  filevine_project_id text,
  filevine_project_name text,
  filevine_invoice_id text,
  filevine_invoice_number text,
  filevine_event_type text,
  filevine_object_type text,
  payment_date date,
  date_applied timestamptz,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  payment_source text,
  description text,
  created_by_user_name text,
  matched_client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  matched_contract_id uuid REFERENCES public.contracts(id) ON DELETE SET NULL,
  matched_invoice_id uuid REFERENCES public.invoices(id) ON DELETE SET NULL,
  payment_id uuid REFERENCES public.payments(id) ON DELETE SET NULL,
  sync_source text NOT NULL DEFAULT 'webhook',
  processing_status text NOT NULL DEFAULT 'processed',
  error_message text,
  raw_payload jsonb,
  processed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_filevine_payment_events_payment_date
  ON public.filevine_payment_events(payment_date DESC);

CREATE INDEX IF NOT EXISTS idx_filevine_payment_events_project
  ON public.filevine_payment_events(filevine_project_id);

CREATE INDEX IF NOT EXISTS idx_filevine_payment_events_status
  ON public.filevine_payment_events(processing_status);

CREATE TABLE IF NOT EXISTS public.filevine_sync_state (
  sync_key text PRIMARY KEY,
  last_success_at timestamptz,
  last_cursor text,
  last_payment_date date,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.filevine_payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.filevine_sync_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS filevine_payment_events_select ON public.filevine_payment_events;
CREATE POLICY filevine_payment_events_select
ON public.filevine_payment_events
FOR SELECT
TO authenticated
USING (public.current_user_role() IN ('admin', 'partner', 'billing_clerk'));

DROP POLICY IF EXISTS filevine_sync_state_select ON public.filevine_sync_state;
CREATE POLICY filevine_sync_state_select
ON public.filevine_sync_state
FOR SELECT
TO authenticated
USING (public.current_user_role() IN ('admin', 'partner', 'billing_clerk'));

CREATE OR REPLACE FUNCTION public.admin_filevine_reconciliation_summary()
RETURNS TABLE (
  total_events bigint,
  matched_events bigint,
  unmatched_events bigint,
  total_filevine_amount numeric,
  matched_filevine_amount numeric,
  unmatched_filevine_amount numeric,
  linked_payment_rows bigint,
  linked_payment_amount numeric,
  latest_filevine_payment_date date,
  latest_linked_payment_date date,
  last_success_at timestamptz,
  last_cursor text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.current_user_role() NOT IN ('admin', 'partner', 'billing_clerk') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  WITH filevine AS (
    SELECT
      fpe.id,
      COALESCE(fpe.amount, 0)::numeric AS amount,
      fpe.payment_date,
      fpe.payment_id,
      COALESCE(fpe.processing_status, 'processed') AS processing_status
    FROM public.filevine_payment_events fpe
  ),
  linked_payments AS (
    SELECT
      COUNT(*)::bigint AS linked_payment_rows,
      COALESCE(SUM(p.amount), 0)::numeric AS linked_payment_amount,
      MAX(p.payment_date) AS latest_linked_payment_date
    FROM public.payments p
    WHERE EXISTS (
      SELECT 1
      FROM filevine f
      WHERE f.payment_id = p.id
    )
  ),
  sync_state AS (
    SELECT
      fs.last_success_at,
      fs.last_cursor
    FROM public.filevine_sync_state fs
    WHERE fs.sync_key = 'payments'
  )
  SELECT
    COUNT(*)::bigint AS total_events,
    COUNT(*) FILTER (WHERE payment_id IS NOT NULL AND processing_status = 'processed')::bigint AS matched_events,
    COUNT(*) FILTER (WHERE payment_id IS NULL OR processing_status <> 'processed')::bigint AS unmatched_events,
    COALESCE(SUM(amount), 0)::numeric AS total_filevine_amount,
    COALESCE(SUM(amount) FILTER (WHERE payment_id IS NOT NULL AND processing_status = 'processed'), 0)::numeric AS matched_filevine_amount,
    COALESCE(SUM(amount) FILTER (WHERE payment_id IS NULL OR processing_status <> 'processed'), 0)::numeric AS unmatched_filevine_amount,
    linked_payments.linked_payment_rows,
    linked_payments.linked_payment_amount,
    MAX(payment_date) AS latest_filevine_payment_date,
    linked_payments.latest_linked_payment_date,
    (SELECT last_success_at FROM sync_state),
    (SELECT last_cursor FROM sync_state)
  FROM filevine
  CROSS JOIN linked_payments;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_filevine_reconciliation_summary() TO authenticated;
