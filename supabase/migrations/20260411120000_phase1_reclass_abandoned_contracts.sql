-- Phase 1: Reclassify Paid-status zombie contracts
--
-- Context: 428 contracts carried status='Paid'/delinquency_status='Paid' but
-- only ~4% of contract value was actually collected. They were marked Paid
-- by a prior import because they didn't appear in the AR_Summary Excel
-- (excel_status='NOT_IN_EXCEL'). They are NOT truly paid.
--
-- Ground truth: AR_Summary_from_Raw_Data.xlsx, True AR = $21,425,589

CREATE TABLE IF NOT EXISTS public.contract_status_reclass_audit (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id     uuid NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  old_status      text,
  old_delinquency text,
  new_status      text,
  new_delinquency text,
  reason          text NOT NULL,
  migration_name  text NOT NULL,
  performed_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contract_status_reclass_audit_contract
  ON public.contract_status_reclass_audit(contract_id);

ALTER TABLE public.contract_status_reclass_audit ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins and partners can read reclass audit"
  ON public.contract_status_reclass_audit;
CREATE POLICY "Admins and partners can read reclass audit"
  ON public.contract_status_reclass_audit
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IS NOT NULL
    AND (
      SELECT profiles.role
      FROM public.profiles
      WHERE profiles.id = auth.uid()
    ) = ANY (ARRAY['admin'::user_role, 'partner'::user_role])
  );

-- Population C: 428 NOT_IN_EXCEL zombies -> Abandoned
INSERT INTO public.contract_status_reclass_audit
  (contract_id, old_status, old_delinquency, new_status, new_delinquency, reason, migration_name)
SELECT
  id, status, delinquency_status, 'Abandoned', 'Abandoned',
  'NOT_IN_EXCEL zombie: value-vs-collected ratio averages 4%; never a true paid-off contract',
  'phase1_reclass_abandoned_contracts'
FROM public.contracts
WHERE status = 'Paid'
  AND delinquency_status = 'Paid'
  AND excel_status = 'NOT_IN_EXCEL';

UPDATE public.contracts
   SET status = 'Abandoned',
       delinquency_status = 'Abandoned'
 WHERE status = 'Paid'
   AND delinquency_status = 'Paid'
   AND excel_status = 'NOT_IN_EXCEL';

-- Population A: 22 rows with Paid/Current -> normalize delinquency to Paid
INSERT INTO public.contract_status_reclass_audit
  (contract_id, old_status, old_delinquency, new_status, new_delinquency, reason, migration_name)
SELECT
  id, status, delinquency_status, 'Paid', 'Paid',
  'Normalize label: value equals collected, truly paid',
  'phase1_reclass_abandoned_contracts'
FROM public.contracts
WHERE status = 'Paid' AND delinquency_status = 'Current';

UPDATE public.contracts
   SET delinquency_status = 'Paid'
 WHERE status = 'Paid' AND delinquency_status = 'Current';

-- Rebuild ar_dashboard to filter out non-collectible contracts
DROP VIEW IF EXISTS public.ar_dashboard;
CREATE VIEW public.ar_dashboard AS
WITH latest_case AS (
  SELECT DISTINCT ON (client_id)
    client_id, case_stage, lead_attorney, is_closed
  FROM public.immigration_cases
  ORDER BY client_id, is_closed, open_date DESC NULLS LAST
)
SELECT
  co.id AS contract_id,
  co.client AS client_name,
  co.client_id,
  co.case_number,
  co.practice_area,
  co.collector,
  co.status AS contract_status,
  co.value AS total_contract_value,
  co.collected AS amount_collected,
  (co.value - co.collected) AS remaining_balance,
  co.down_payment,
  co.down_payment_paid,
  co.monthly_installment,
  co.total_installments,
  co.installments_paid,
  (co.total_installments - co.installments_paid) AS installments_remaining,
  co.next_due_date,
  co.start_date,
  co.delinquency_status,
  co.days_out AS days_past_due,
  co.phone,
  c.email,
  c.preferred_language,
  COALESCE(ic.case_stage, c.case_stage) AS case_stage,
  ic.lead_attorney,
  COALESCE(ic.is_closed, false) AS case_closed,
  round((co.collected / NULLIF(co.value, 0::numeric)) * 100, 1) AS collection_pct
FROM public.contracts co
LEFT JOIN public.clients c ON c.id = co.client_id
LEFT JOIN latest_case ic ON ic.client_id = co.client_id
WHERE co.status IN ('Active', 'Risk');

-- Self-verify: True AR must still be within $50k of Excel ground truth
DO $$
DECLARE
  true_ar numeric;
  expected numeric := 21425589;
  tolerance numeric := 50000;
BEGIN
  SELECT COALESCE(SUM(value - COALESCE(collected, 0)), 0)
    INTO true_ar
  FROM public.contracts
  WHERE status IN ('Active', 'Risk');

  IF true_ar < (expected - tolerance) OR true_ar > (expected + tolerance) THEN
    RAISE EXCEPTION 'Post-migration True AR = %, outside tolerance of % +/- %. Aborting.',
      true_ar, expected, tolerance;
  END IF;

  RAISE NOTICE 'Post-migration True AR = % (expected ~%, tolerance +/- %)',
    true_ar, expected, tolerance;
END $$;
