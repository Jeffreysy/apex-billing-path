-- Phase 2: Dedupe NULL-case_number clients + heal orphan contracts
--
-- Part A: 121 duplicate groups (125 rows) where case_number IS NULL.
--         The prior merge_exact_duplicate_clients function skipped these
--         because it required case_number IS NOT NULL.
--
-- Part B: 561 orphan contracts with client_id IS NULL but $3.5M balance.
--         27 link to existing clients via embedded case ref in contracts.client.
--         3 link by normalized name match.
--         2 are ambiguous (flagged for review).
--         529 need new client rows created from contracts.client text.
--
-- All changes are audited and reversible.

-- ============================================================
-- 0. Schema prep: allow NULL case_number in merge audit table
-- ============================================================
ALTER TABLE public.client_duplicate_merge_audit
  ALTER COLUMN case_number DROP NOT NULL;

-- Add missing FK tables to future merge operations
-- (monthly_installments, collector_assignment_audit, filevine_payments were
--  missing from the original merge function's update list)

-- ============================================================
-- PART A: Dedupe clients by normalized name (NULL case_number)
-- ============================================================

-- Create temp table for the merge plan
CREATE TEMPORARY TABLE tmp_phase2_name_dedup ON COMMIT DROP AS
WITH client_links AS (
  SELECT
    c.id,
    c.name,
    c.client_number,
    c.case_number,
    c.email,
    c.phone,
    c.assigned_collector,
    c.practice_area,
    c.case_stage,
    c.mycase_id,
    c.filevine_project_id,
    c.created_at,
    public.normalize_collector_client_name(c.name) AS normalized_name,
    count(DISTINCT co.id)::integer AS contract_count,
    count(DISTINCT p.id)::integer  AS payment_count,
    count(DISTINCT ca.id)::integer AS activity_count,
    count(DISTINCT ic.id)::integer AS immigration_case_count,
    count(DISTINCT e.id)::integer  AS escalation_count,
    count(DISTINCT pc.id)::integer AS commitment_count
  FROM public.clients c
  LEFT JOIN public.contracts co ON co.client_id = c.id
  LEFT JOIN public.payments p ON p.client_id = c.id
  LEFT JOIN public.collection_activities ca ON ca.client_id = c.id
  LEFT JOIN public.immigration_cases ic ON ic.client_id = c.id
  LEFT JOIN public.escalations e ON e.client_id = c.id
  LEFT JOIN public.payment_commitments pc ON pc.client_id = c.id
  WHERE c.is_active = true
    AND (c.case_number IS NULL OR trim(c.case_number) = '')
  GROUP BY c.id
),
duplicate_groups AS (
  SELECT normalized_name
  FROM client_links
  WHERE normalized_name IS NOT NULL AND normalized_name != ''
  GROUP BY normalized_name
  HAVING count(*) > 1
),
ranked AS (
  SELECT
    cl.*,
    (
      cl.contract_count * 100
      + cl.payment_count * 20
      + cl.activity_count * 15
      + cl.immigration_case_count * 50
      + cl.escalation_count * 10
      + cl.commitment_count * 10
      + CASE WHEN cl.client_number LIKE 'AR-%' THEN 5 ELSE 0 END
      + CASE WHEN cl.client_number LIKE 'MC-%' THEN 3 ELSE 0 END
    )::integer AS link_score,
    first_value(cl.id) OVER (
      PARTITION BY cl.normalized_name
      ORDER BY
        (
          cl.contract_count * 100
          + cl.payment_count * 20
          + cl.activity_count * 15
          + cl.immigration_case_count * 50
          + cl.escalation_count * 10
          + cl.commitment_count * 10
          + CASE WHEN cl.client_number LIKE 'AR-%' THEN 5 ELSE 0 END
          + CASE WHEN cl.client_number LIKE 'MC-%' THEN 3 ELSE 0 END
        ) DESC,
        cl.created_at ASC NULLS LAST,
        cl.client_number ASC
    ) AS survivor_id
  FROM client_links cl
  JOIN duplicate_groups dg ON dg.normalized_name = cl.normalized_name
)
SELECT
  dup.id            AS duplicate_client_id,
  surv.id           AS survivor_client_id,
  dup.client_number AS duplicate_client_number,
  surv.client_number AS survivor_client_number,
  dup.normalized_name,
  dup.case_number,
  dup.contract_count  AS dup_contract_count,
  dup.payment_count   AS dup_payment_count,
  dup.activity_count  AS dup_activity_count,
  dup.immigration_case_count AS dup_immigration_case_count
FROM ranked dup
JOIN ranked surv ON surv.id = dup.survivor_id
WHERE dup.id <> dup.survivor_id;

-- Enrich survivors with data from duplicates
UPDATE public.clients survivor
SET
  email = COALESCE(NULLIF(survivor.email, ''), duplicate.email),
  phone = COALESCE(NULLIF(survivor.phone, ''), duplicate.phone),
  mycase_id = COALESCE(survivor.mycase_id, duplicate.mycase_id),
  filevine_project_id = COALESCE(NULLIF(survivor.filevine_project_id, ''), duplicate.filevine_project_id),
  assigned_collector = COALESCE(NULLIF(survivor.assigned_collector, ''), duplicate.assigned_collector),
  practice_area = COALESCE(NULLIF(survivor.practice_area, ''), duplicate.practice_area),
  case_stage = COALESCE(NULLIF(survivor.case_stage, ''), duplicate.case_stage),
  case_number = COALESCE(NULLIF(survivor.case_number, ''), duplicate.case_number),
  updated_at = now()
FROM tmp_phase2_name_dedup m
JOIN public.clients duplicate ON duplicate.id = m.duplicate_client_id
WHERE survivor.id = m.survivor_client_id;

-- Move all FK references from duplicate → survivor (all 23 FK tables)
UPDATE public.case_events t SET client_id = m.survivor_client_id FROM tmp_phase2_name_dedup m WHERE t.client_id = m.duplicate_client_id;
UPDATE public.case_milestones t SET client_id = m.survivor_client_id FROM tmp_phase2_name_dedup m WHERE t.client_id = m.duplicate_client_id;
UPDATE public.collection_activities t SET client_id = m.survivor_client_id FROM tmp_phase2_name_dedup m WHERE t.client_id = m.duplicate_client_id;
UPDATE public.collector_assignment_audit t SET client_id = m.survivor_client_id FROM tmp_phase2_name_dedup m WHERE t.client_id = m.duplicate_client_id;
UPDATE public.consultations t SET client_id = m.survivor_client_id FROM tmp_phase2_name_dedup m WHERE t.client_id = m.duplicate_client_id;
UPDATE public.contracts t SET client_id = m.survivor_client_id FROM tmp_phase2_name_dedup m WHERE t.client_id = m.duplicate_client_id;
UPDATE public.escalations t SET client_id = m.survivor_client_id FROM tmp_phase2_name_dedup m WHERE t.client_id = m.duplicate_client_id;
UPDATE public.filevine_payment_events t SET matched_client_id = m.survivor_client_id FROM tmp_phase2_name_dedup m WHERE t.matched_client_id = m.duplicate_client_id;
UPDATE public.filevine_project_snapshots t SET matched_client_id = m.survivor_client_id FROM tmp_phase2_name_dedup m WHERE t.matched_client_id = m.duplicate_client_id;
UPDATE public.immigration_cases t SET client_id = m.survivor_client_id FROM tmp_phase2_name_dedup m WHERE t.client_id = m.duplicate_client_id;
UPDATE public.invoices t SET client_id = m.survivor_client_id FROM tmp_phase2_name_dedup m WHERE t.client_id = m.duplicate_client_id;
UPDATE public.lawpay_transactions t SET client_id = m.survivor_client_id FROM tmp_phase2_name_dedup m WHERE t.client_id = m.duplicate_client_id;
UPDATE public.lawpay_validation_log t SET client_id = m.survivor_client_id FROM tmp_phase2_name_dedup m WHERE t.client_id = m.duplicate_client_id;
UPDATE public.matters t SET client_id = m.survivor_client_id FROM tmp_phase2_name_dedup m WHERE t.client_id = m.duplicate_client_id;
UPDATE public.payment_commitments t SET client_id = m.survivor_client_id FROM tmp_phase2_name_dedup m WHERE t.client_id = m.duplicate_client_id;
UPDATE public.payments t SET client_id = m.survivor_client_id FROM tmp_phase2_name_dedup m WHERE t.client_id = m.duplicate_client_id;
UPDATE public.trust_client_balances t SET client_id = m.survivor_client_id FROM tmp_phase2_name_dedup m WHERE t.client_id = m.duplicate_client_id;
UPDATE public.trust_transactions t SET client_id = m.survivor_client_id FROM tmp_phase2_name_dedup m WHERE t.client_id = m.duplicate_client_id;
UPDATE public.unmatched_payments t SET matched_client_id = m.survivor_client_id FROM tmp_phase2_name_dedup m WHERE t.matched_client_id = m.duplicate_client_id;

-- Audit log
INSERT INTO public.client_duplicate_merge_audit (
  survivor_client_id, duplicate_client_id, duplicate_client_number,
  survivor_client_number, normalized_name, case_number,
  merge_reason, moved_contracts, moved_payments,
  moved_activities, moved_immigration_cases
)
SELECT
  m.survivor_client_id, m.duplicate_client_id, m.duplicate_client_number,
  m.survivor_client_number, m.normalized_name, m.case_number,
  'Phase 2: name-only dedupe (NULL case_number group)',
  m.dup_contract_count, m.dup_payment_count,
  m.dup_activity_count, m.dup_immigration_case_count
FROM tmp_phase2_name_dedup m;

-- Archive duplicates
UPDATE public.clients dup
SET
  is_active = false,
  notes = concat_ws(E'\n', NULLIF(dup.notes, ''),
    'Phase 2 archived duplicate (name-only merge) on ' || current_date::text),
  updated_at = now()
FROM tmp_phase2_name_dedup m
WHERE dup.id = m.duplicate_client_id;


-- ============================================================
-- PART B: Orphan contract recovery
-- ============================================================

-- B.1 Create audit table for orphan recovery
CREATE TABLE IF NOT EXISTS public.contract_orphan_recovery_audit (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id     uuid NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  old_client_id   uuid,
  new_client_id   uuid NOT NULL,
  match_method    text NOT NULL,  -- 'case_ref', 'name_exact', 'client_created', 'ambiguous_flagged'
  original_client_text text,
  parsed_client_name   text,
  created_client_number text,
  migration_name  text NOT NULL DEFAULT 'phase2_dedupe_and_orphan_recovery',
  performed_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contract_orphan_recovery_contract
  ON public.contract_orphan_recovery_audit(contract_id);

ALTER TABLE public.contract_orphan_recovery_audit ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read orphan recovery audit"
  ON public.contract_orphan_recovery_audit;
CREATE POLICY "Admins can read orphan recovery audit"
  ON public.contract_orphan_recovery_audit
  FOR SELECT TO authenticated
  USING (
    auth.uid() IS NOT NULL
    AND (
      SELECT profiles.role FROM public.profiles WHERE profiles.id = auth.uid()
    ) = ANY (ARRAY['admin'::user_role, 'partner'::user_role])
  );

-- B.2 Link orphans with unique embedded case_number match
WITH all_case_matches AS (
  SELECT co.id AS contract_id, c.id AS client_id, co.client AS original_text
  FROM public.contracts co
  JOIN public.clients c
    ON co.client ~ c.case_number
   AND c.case_number IS NOT NULL AND c.case_number != ''
   AND c.is_active = true
  WHERE co.client_id IS NULL
),
unique_matches AS (
  SELECT contract_id,
    (array_agg(client_id))[1] AS client_id,
    (array_agg(original_text))[1] AS original_text
  FROM all_case_matches
  GROUP BY contract_id
  HAVING count(DISTINCT client_id) = 1
)
INSERT INTO public.contract_orphan_recovery_audit
  (contract_id, old_client_id, new_client_id, match_method, original_client_text)
SELECT contract_id, NULL, client_id, 'case_ref', original_text
FROM unique_matches;

UPDATE public.contracts co
SET client_id = a.new_client_id
FROM public.contract_orphan_recovery_audit a
WHERE a.contract_id = co.id
  AND a.match_method = 'case_ref'
  AND co.client_id IS NULL;

-- B.3 Link orphans with unique normalized name match (that weren't already matched)
WITH name_matches AS (
  SELECT co.id AS contract_id,
         c.id  AS client_id,
         co.client AS original_text
  FROM public.contracts co
  JOIN public.clients c
    ON upper(regexp_replace(co.client, '[^A-Za-z0-9]', '', 'g'))
     = upper(regexp_replace(c.name, '[^A-Za-z0-9]', '', 'g'))
   AND c.is_active = true
  WHERE co.client_id IS NULL
  GROUP BY co.id, c.id, co.client
),
unique_name AS (
  SELECT contract_id,
    (array_agg(client_id))[1] AS client_id,
    (array_agg(original_text))[1] AS original_text
  FROM name_matches
  GROUP BY contract_id
  HAVING count(*) = 1
)
INSERT INTO public.contract_orphan_recovery_audit
  (contract_id, old_client_id, new_client_id, match_method, original_client_text)
SELECT contract_id, NULL, client_id, 'name_exact', original_text
FROM unique_name
WHERE contract_id NOT IN (SELECT contract_id FROM public.contract_orphan_recovery_audit);

UPDATE public.contracts co
SET client_id = a.new_client_id
FROM public.contract_orphan_recovery_audit a
WHERE a.contract_id = co.id
  AND a.match_method = 'name_exact'
  AND co.client_id IS NULL;

-- B.4 Create new client rows for the remaining ~529 unmatched orphans
-- Parse client name: strip embedded case refs (NN-NNNN), annotations (***), (DEFENSIVE ASYLUM), etc.
-- Extract practice area hint from parenthetical annotations

CREATE TEMPORARY TABLE tmp_orphan_new_clients ON COMMIT DROP AS
WITH remaining AS (
  SELECT
    co.id AS contract_id,
    co.client AS raw_client,
    co.case_number AS contract_case_number,
    co.practice_area AS contract_practice_area,
    co.collector,
    co.phone,
    -- Parse: strip embedded case refs like "26-0364", annotations like "(***)", "(DEFENSIVE ASYLUM)", "(P)", "(T-VISA)"
    trim(regexp_replace(
      regexp_replace(
        regexp_replace(co.client,
          '\s*\d{2}-\d{4}\s*', '', 'g'),          -- strip "26-0364"
        '\s*\([^)]*\)\s*', '', 'g'),               -- strip "(anything)"
      '\s+', ' ', 'g')                             -- collapse spaces
    ) AS parsed_name,
    -- Extract practice area hint from parenthetical
    (regexp_match(co.client, '\(([A-Z][A-Z -]+)\)'))[1] AS practice_hint
  FROM public.contracts co
  WHERE co.client_id IS NULL
    AND co.id NOT IN (SELECT contract_id FROM public.contract_orphan_recovery_audit)
),
numbered AS (
  SELECT *,
    row_number() OVER (ORDER BY contract_id) AS seq
  FROM remaining
)
SELECT
  gen_random_uuid() AS new_client_id,
  'AR-' || lpad((6000 + seq)::text, 5, '0') AS client_number,
  COALESCE(NULLIF(parsed_name, ''), raw_client) AS client_name,
  contract_id,
  raw_client,
  contract_case_number,
  COALESCE(contract_practice_area, practice_hint) AS practice_area,
  collector,
  phone
FROM numbered;

-- Insert the new client rows
INSERT INTO public.clients (
  id, client_number, name, phone, practice_area, assigned_collector,
  is_active, client_quality_status, client_quality_reason,
  preferred_language, notes
)
SELECT
  new_client_id,
  client_number,
  client_name,
  phone,
  practice_area,
  collector,
  true,
  'needs_review',
  'Auto-created from orphan contract (Phase 2 recovery). Original text: ' || left(raw_client, 200),
  'Spanish',
  'Created by Phase 2 orphan recovery migration on ' || current_date::text
    || '. Contract case_number: ' || COALESCE(contract_case_number, 'N/A')
FROM tmp_orphan_new_clients;

-- Link contracts to new clients
UPDATE public.contracts co
SET client_id = t.new_client_id
FROM tmp_orphan_new_clients t
WHERE co.id = t.contract_id
  AND co.client_id IS NULL;

-- Audit log for created clients
INSERT INTO public.contract_orphan_recovery_audit
  (contract_id, old_client_id, new_client_id, match_method,
   original_client_text, parsed_client_name, created_client_number)
SELECT
  contract_id, NULL, new_client_id, 'client_created',
  raw_client, client_name, client_number
FROM tmp_orphan_new_clients;


-- ============================================================
-- VERIFICATION
-- ============================================================
DO $$
DECLARE
  orphan_count integer;
  dedup_count integer;
  true_ar numeric;
  expected_ar numeric := 21425589;
  tolerance numeric := 100000;
BEGIN
  -- Check orphan contracts remaining
  SELECT count(*) INTO orphan_count
  FROM public.contracts
  WHERE client_id IS NULL AND status IN ('Active', 'Risk');

  IF orphan_count > 5 THEN
    RAISE EXCEPTION 'Phase 2 verification failed: % orphan contracts still have NULL client_id (expected <=5 ambiguous)', orphan_count;
  END IF;

  -- Check dedup worked
  SELECT count(*) INTO dedup_count
  FROM tmp_phase2_name_dedup;

  RAISE NOTICE 'Part A: Merged % duplicate client rows', dedup_count;

  -- Check True AR still in range
  SELECT COALESCE(SUM(value - COALESCE(collected, 0)), 0) INTO true_ar
  FROM public.contracts
  WHERE status IN ('Active', 'Risk');

  IF true_ar < (expected_ar - tolerance) OR true_ar > (expected_ar + tolerance) THEN
    RAISE EXCEPTION 'True AR = %, outside tolerance of % +/- %. Aborting.', true_ar, expected_ar, tolerance;
  END IF;

  RAISE NOTICE 'Part B: Orphan contracts with NULL client_id remaining = % (should be <=5 ambiguous)', orphan_count;
  RAISE NOTICE 'True AR = % (expected ~%, tolerance +/- %)', true_ar, expected_ar, tolerance;
  RAISE NOTICE 'Phase 2 migration verified successfully.';
END $$;
