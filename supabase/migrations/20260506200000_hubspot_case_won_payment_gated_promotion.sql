-- HubSpot Case Won → client validation, gated by LawPay payment evidence.
--
-- Five cohorts, applied atomically:
--   1. matched Case Won + payment evidence  -> client_quality_status='active_legal_client'
--   2. unmatched Case Won + LawPay txn already linked to a client_id
--                                            -> bridge HubSpot deal -> existing client; promote
--   3. unmatched Case Won + LawPay payment but orphan (no client_id)
--                                            -> INSERT new active_legal_client; link LawPay txn
--   4. unmatched Case Won + no payment evidence
--                                            -> INSERT as needs_review (HubSpot says retained,
--                                               but no LawPay yet — could be cash/check or pending)
--   5. matched Case Won + no payment evidence
--                                            -> downgrade client_quality_status='needs_review'
--                                               (HubSpot says retained, but no LawPay seen)
--
-- Trace: every touched client gets a client_quality_reason starting with 'hubspot:'
-- so we can find/undo the sweep later if needed.

DO $$
DECLARE
  v_n_cohort1 int := 0;
  v_n_cohort2 int := 0;
  v_n_cohort3 int := 0;
  v_n_cohort4 int := 0;
  v_n_cohort5 int := 0;
  v_max_hs_num int;
BEGIN
  -- Pull next sequence value for HS-NNNNN client_numbers
  SELECT COALESCE(MAX(NULLIF(regexp_replace(client_number, '^HS-', ''), '')::int), 0)
    INTO v_max_hs_num
  FROM clients
  WHERE client_number LIKE 'HS-%';

  -- Working set: every Case Won deal + cohort classification
  CREATE TEMP TABLE _cw_cohorts ON COMMIT DROP AS
  WITH staged AS (
    SELECT
      d.hubspot_deal_id,
      d.match_status,
      d.matched_client_id,
      d.dealname,
      regexp_replace(COALESCE(d.dealname,''), '^(Case|Lead|Consult)\s*-\s*', '', 'i') AS clean_name,
      lower(NULLIF(trim(d.contact_email), '')) AS norm_email,
      d.contact_phone,
      d.contact_firstname,
      d.contact_lastname
    FROM hubspot_deals_raw d
    WHERE d.dealstage = '3299873484'  -- Case Won
  ),
  best_lawpay AS (
    SELECT DISTINCT ON (s.hubspot_deal_id)
      s.hubspot_deal_id,
      lt.id          AS lawpay_txn_id,
      lt.client_id   AS lawpay_client_id,
      lt.amount      AS lawpay_amount,
      lt.payment_date AS lawpay_date
    FROM staged s
    JOIN lawpay_transactions lt
      ON (s.norm_email IS NOT NULL AND lower(lt.lawpay_payer_email) = s.norm_email)
      OR (s.clean_name <> '' AND similarity(lt.lawpay_payer_name, s.clean_name) >= 0.6)
    ORDER BY s.hubspot_deal_id,
             (CASE WHEN lt.client_id IS NOT NULL THEN 1 ELSE 0 END) DESC,
             lt.payment_date DESC NULLS LAST
  )
  SELECT
    s.*,
    bl.lawpay_txn_id,
    bl.lawpay_client_id,
    bl.lawpay_amount,
    bl.lawpay_date,
    -- Has payment evidence if matched_client_id has any payments OR has direct LawPay match
    EXISTS (SELECT 1 FROM payments p WHERE p.client_id = s.matched_client_id) AS has_payments_row,
    EXISTS (SELECT 1 FROM lawpay_transactions lt2 WHERE lt2.client_id = s.matched_client_id) AS has_lawpay_via_client,
    CASE
      WHEN s.match_status = 'matched' AND
        (EXISTS (SELECT 1 FROM payments p WHERE p.client_id = s.matched_client_id)
         OR EXISTS (SELECT 1 FROM lawpay_transactions lt2 WHERE lt2.client_id = s.matched_client_id))
        THEN 1
      WHEN s.match_status = 'matched' THEN 5
      WHEN s.match_status <> 'matched' AND bl.lawpay_client_id IS NOT NULL THEN 2
      WHEN s.match_status <> 'matched' AND bl.lawpay_txn_id   IS NOT NULL THEN 3
      WHEN s.match_status <> 'matched' THEN 4
      ELSE NULL
    END AS cohort
  FROM staged s
  LEFT JOIN best_lawpay bl ON bl.hubspot_deal_id = s.hubspot_deal_id;

  -- Cohort 1: matched + paid -> active_legal_client
  UPDATE clients c
  SET client_quality_status = 'active_legal_client',
      client_quality_reason = 'hubspot: Case Won + LawPay/payment evidence',
      quality_reviewed_at   = now(),
      updated_at            = now()
  FROM _cw_cohorts cc
  WHERE cc.cohort = 1 AND cc.matched_client_id = c.id
    AND c.client_quality_status IS DISTINCT FROM 'active_legal_client';
  GET DIAGNOSTICS v_n_cohort1 = ROW_COUNT;

  -- Cohort 5: matched + unpaid -> needs_review (HubSpot says retained, no payment yet)
  UPDATE clients c
  SET client_quality_status = 'needs_review',
      client_quality_reason = 'hubspot: Case Won but no LawPay/payment evidence yet',
      quality_reviewed_at   = now(),
      updated_at            = now()
  FROM _cw_cohorts cc
  WHERE cc.cohort = 5 AND cc.matched_client_id = c.id
    AND c.client_quality_status NOT IN ('active_legal_client', 'merged_duplicate');
  GET DIAGNOSTICS v_n_cohort5 = ROW_COUNT;

  -- Cohort 2: bridge unmatched -> existing client via LawPay's client_id
  UPDATE hubspot_deals_raw d
  SET matched_client_id = cc.lawpay_client_id,
      match_status      = 'matched',
      match_method      = 'lawpay_bridge',
      match_notes       = 'bridged via lawpay_transactions.client_id',
      matched_at        = now(),
      updated_at        = now()
  FROM _cw_cohorts cc
  WHERE cc.cohort = 2 AND d.hubspot_deal_id = cc.hubspot_deal_id;

  UPDATE clients c
  SET hubspot_deal_id        = COALESCE(c.hubspot_deal_id, cc.hubspot_deal_id),
      client_quality_status  = 'active_legal_client',
      client_quality_reason  = 'hubspot: Case Won, bridged via LawPay payment',
      email                  = COALESCE(c.email, cc.norm_email),
      phone                  = COALESCE(c.phone, cc.contact_phone),
      quality_reviewed_at    = now(),
      updated_at             = now()
  FROM _cw_cohorts cc
  WHERE cc.cohort = 2 AND c.id = cc.lawpay_client_id;
  GET DIAGNOSTICS v_n_cohort2 = ROW_COUNT;

  -- Cohort 3: insert new client w/ LawPay payment evidence -> active_legal_client
  WITH numbered AS (
    SELECT *,
      v_max_hs_num + row_number() OVER (ORDER BY hubspot_deal_id) AS hs_num
    FROM _cw_cohorts WHERE cohort = 3
  ),
  inserted AS (
    INSERT INTO clients (
      client_number, name, email, phone,
      hubspot_deal_id, client_quality_status, client_quality_reason,
      quality_reviewed_at
    )
    SELECT
      'HS-' || lpad(hs_num::text, 5, '0'),
      COALESCE(NULLIF(trim(contact_firstname || ' ' || contact_lastname), ''), clean_name, dealname, 'Unknown HubSpot Client'),
      norm_email,
      contact_phone,
      hubspot_deal_id,
      'active_legal_client',
      'hubspot: Case Won + LawPay payment (no prior MyCase client)',
      now()
    FROM numbered
    RETURNING id, hubspot_deal_id
  )
  UPDATE hubspot_deals_raw d
  SET matched_client_id = i.id,
      match_status      = 'matched',
      match_method      = 'inserted_via_lawpay',
      match_notes       = 'auto-inserted as active_legal_client (LawPay payment confirmed)',
      matched_at        = now(),
      updated_at        = now()
  FROM inserted i
  WHERE d.hubspot_deal_id = i.hubspot_deal_id;
  GET DIAGNOSTICS v_n_cohort3 = ROW_COUNT;

  -- Refresh sequence after cohort 3 inserts
  SELECT COALESCE(MAX(NULLIF(regexp_replace(client_number, '^HS-', ''), '')::int), 0)
    INTO v_max_hs_num
  FROM clients WHERE client_number LIKE 'HS-%';

  -- Cohort 4: insert new client without payment evidence -> needs_review
  WITH numbered AS (
    SELECT *,
      v_max_hs_num + row_number() OVER (ORDER BY hubspot_deal_id) AS hs_num
    FROM _cw_cohorts WHERE cohort = 4
  ),
  inserted AS (
    INSERT INTO clients (
      client_number, name, email, phone,
      hubspot_deal_id, client_quality_status, client_quality_reason,
      excluded_from_collections,  -- keep these out of collections queue until verified
      quality_reviewed_at
    )
    SELECT
      'HS-' || lpad(hs_num::text, 5, '0'),
      COALESCE(NULLIF(trim(contact_firstname || ' ' || contact_lastname), ''), clean_name, dealname, 'Unknown HubSpot Client'),
      norm_email,
      contact_phone,
      hubspot_deal_id,
      'needs_review',
      'hubspot: Case Won but no LawPay payment evidence — pending verification',
      true,
      now()
    FROM numbered
    RETURNING id, hubspot_deal_id
  )
  UPDATE hubspot_deals_raw d
  SET matched_client_id = i.id,
      match_status      = 'review',
      match_method      = 'inserted_no_payment',
      match_notes       = 'auto-inserted as needs_review (no LawPay payment seen)',
      matched_at        = now(),
      updated_at        = now()
  FROM inserted i
  WHERE d.hubspot_deal_id = i.hubspot_deal_id;
  GET DIAGNOSTICS v_n_cohort4 = ROW_COUNT;

  RAISE NOTICE 'Cohort 1 (matched+paid -> active): %', v_n_cohort1;
  RAISE NOTICE 'Cohort 2 (bridged via LawPay): %', v_n_cohort2;
  RAISE NOTICE 'Cohort 3 (insert active): %', v_n_cohort3;
  RAISE NOTICE 'Cohort 4 (insert needs_review): %', v_n_cohort4;
  RAISE NOTICE 'Cohort 5 (downgrade matched no-pay): %', v_n_cohort5;
END $$;
