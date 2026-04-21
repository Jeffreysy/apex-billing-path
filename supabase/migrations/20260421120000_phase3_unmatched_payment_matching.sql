-- Phase 3: Unmatched Payment Matching RPCs
-- Two admin functions:
--   1. suggest_unmatched_payment_matches(p_payment_id) → top-5 client candidates with confidence score
--   2. resolve_unmatched_payment(p_payment_id, p_client_id) → link payment to client
--
-- Scoring weights: name similarity 60%, amount proximity 30%, date proximity 10%
-- Requires: pg_trgm extension (already enabled)

-- Drop existing functions if they exist (idempotent)
DROP FUNCTION IF EXISTS suggest_unmatched_payment_matches(uuid);
DROP FUNCTION IF EXISTS resolve_unmatched_payment(uuid, uuid);
DROP FUNCTION IF EXISTS resolve_unmatched_payment(uuid, uuid, text);

-- ============================================================
-- 1. suggest_unmatched_payment_matches
-- Scores clients using: name similarity (60%), amount proximity (30%), date proximity (10%)
-- ============================================================
CREATE OR REPLACE FUNCTION suggest_unmatched_payment_matches(p_payment_id uuid)
RETURNS TABLE (
  client_id           uuid,
  client_name         text,
  name_score          numeric,
  amount_score        numeric,
  date_score          numeric,
  confidence          numeric,
  best_contract_id    uuid,
  monthly_installment numeric,
  next_due_date       date
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH payment AS (
    SELECT id, name_in_notes, amount, payment_date
    FROM unmatched_payments
    WHERE id = p_payment_id
  ),
  -- Step 1: score each client by name similarity (threshold > 0.1 on either name or contact)
  name_scored AS (
    SELECT
      c.id   AS client_id,
      c.name AS client_name,
      ROUND(
        GREATEST(
          similarity(p.name_in_notes, c.name),
          similarity(p.name_in_notes, COALESCE(c.contact_name, ''))
        )::numeric,
        4
      ) AS name_score
    FROM clients c
    CROSS JOIN payment p
    WHERE
      similarity(p.name_in_notes, c.name) > 0.1
      OR similarity(p.name_in_notes, COALESCE(c.contact_name, '')) > 0.1
  ),
  -- Step 2: for each candidate client find their best-matching open contract
  contract_scored AS (
    SELECT
      ns.client_id,
      ns.client_name,
      ns.name_score,
      con.id                    AS contract_id,
      con.monthly_installment,
      con.next_due_date,
      -- Amount score: 1 = exact match, 0 = diff >= payment amount
      ROUND(
        GREATEST(
          1.0 - ABS(p.amount - con.monthly_installment) / GREATEST(p.amount, 1.0),
          0.0
        )::numeric,
        4
      ) AS amount_score,
      -- Date score: 1 = same day, 0 = 30+ days apart
      ROUND(
        GREATEST(
          1.0 - LEAST(ABS(p.payment_date - con.next_due_date)::numeric, 30.0) / 30.0,
          0.0
        )::numeric,
        4
      ) AS date_score,
      ROW_NUMBER() OVER (
        PARTITION BY ns.client_id
        ORDER BY
          ABS(p.amount - con.monthly_installment),
          ABS(p.payment_date - COALESCE(con.next_due_date, p.payment_date))
      ) AS rn
    FROM name_scored ns
    JOIN contracts con ON con.client_id = ns.client_id
    CROSS JOIN payment p
    WHERE con.status NOT IN ('Paid')
  )
  SELECT
    cs.client_id,
    cs.client_name,
    cs.name_score,
    cs.amount_score,
    cs.date_score,
    ROUND(
      (cs.name_score * 0.60 + cs.amount_score * 0.30 + cs.date_score * 0.10) * 100.0,
      1
    ) AS confidence,
    cs.contract_id          AS best_contract_id,
    cs.monthly_installment,
    cs.next_due_date
  FROM contract_scored cs
  WHERE cs.rn = 1
  ORDER BY confidence DESC
  LIMIT 5;
$$;

-- ============================================================
-- 2. resolve_unmatched_payment
-- Links an unmatched payment to a confirmed client, marking it matched.
-- Returns jsonb with success flag and metadata.
-- ============================================================
CREATE OR REPLACE FUNCTION resolve_unmatched_payment(
  p_payment_id uuid,
  p_client_id  uuid,
  p_method     text DEFAULT 'manual_rpc'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rows_updated integer;
  v_payment      unmatched_payments%ROWTYPE;
BEGIN
  -- Verify payment exists
  SELECT * INTO v_payment
  FROM unmatched_payments
  WHERE id = p_payment_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Payment not found');
  END IF;

  IF v_payment.status = 'matched' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Payment already matched',
      'matched_client_id', v_payment.matched_client_id
    );
  END IF;

  -- Verify client exists
  IF NOT EXISTS (SELECT 1 FROM clients WHERE id = p_client_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Client not found');
  END IF;

  -- Link the payment
  UPDATE unmatched_payments
  SET
    matched_client_id = p_client_id,
    status            = 'matched',
    resolved_at       = NOW(),
    resolved_method   = p_method
  WHERE id = p_payment_id;

  GET DIAGNOSTICS v_rows_updated = ROW_COUNT;

  RETURN jsonb_build_object(
    'success',         true,
    'payment_id',      p_payment_id,
    'client_id',       p_client_id,
    'rows_updated',    v_rows_updated,
    'resolved_method', p_method
  );
END;
$$;

-- Grant execute rights to authenticated users
GRANT EXECUTE ON FUNCTION suggest_unmatched_payment_matches(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION resolve_unmatched_payment(uuid, uuid, text) TO authenticated;

COMMENT ON FUNCTION suggest_unmatched_payment_matches(uuid) IS
  'Phase 3: Returns top-5 client match candidates for an unmatched payment. '
  'Scores using name similarity (60%), amount proximity (30%), date proximity (10%). '
  'Requires pg_trgm extension.';

COMMENT ON FUNCTION resolve_unmatched_payment(uuid, uuid, text) IS
  'Phase 3: Links an unmatched payment to a confirmed client, marking it matched. '
  'Returns jsonb with success flag and metadata.';
