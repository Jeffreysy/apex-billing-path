-- HubSpot bulk-pull staging + 3-property match RPC
-- Source: hubspot-bulk-pull edge function paginates deals from CASE/COLLECTIONS/NFS/INTAKE pipelines
-- Match: secure match requires 2-of-3 agreement across mycase_case_id, case_number, dealname

-- 1. Staging table for raw HubSpot deals
CREATE TABLE IF NOT EXISTS hubspot_deals_raw (
  hubspot_deal_id        text PRIMARY KEY,
  pipeline               text NOT NULL,
  dealstage              text,
  dealname               text,
  amount                 numeric(12,2),
  closedate              timestamptz,
  createdate             timestamptz,
  hs_lastmodifieddate    timestamptz,
  -- Identifiers used for matching
  mycase_case_id         text,
  case_number            text,
  connector_name         text,
  -- Primary associated contact (for email/phone signals)
  primary_contact_id     text,
  contact_email          text,
  contact_phone          text,
  contact_firstname      text,
  contact_lastname       text,
  -- Match outcome
  match_status           text DEFAULT 'pending', -- 'pending'|'matched'|'review'|'unmatched'
  match_score            int,
  match_method           text,
  matched_client_id      uuid REFERENCES clients(id),
  matched_contract_id    uuid REFERENCES contracts(id),
  match_notes            text,
  matched_at             timestamptz,
  -- Raw + sync metadata
  payload                jsonb,
  pulled_at              timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hsdeals_raw_pipeline      ON hubspot_deals_raw(pipeline);
CREATE INDEX IF NOT EXISTS idx_hsdeals_raw_match_status  ON hubspot_deals_raw(match_status);
CREATE INDEX IF NOT EXISTS idx_hsdeals_raw_case_number   ON hubspot_deals_raw(case_number)    WHERE case_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_hsdeals_raw_mycase        ON hubspot_deals_raw(mycase_case_id) WHERE mycase_case_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_hsdeals_raw_email         ON hubspot_deals_raw(contact_email)  WHERE contact_email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_hsdeals_raw_dealname_trgm ON hubspot_deals_raw USING gin (dealname gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_clients_name_trgm         ON clients            USING gin (name     gin_trgm_ops);

-- 2. Match RPC — scores each deal against all clients on 3 dimensions, picks best
--    Score = (mycase_id agreement?) + (case_number agreement?) + (name similarity >= threshold?)
--    Tier:  matched (>=2/3) | review (1/3 with strong name) | unmatched (otherwise)
CREATE OR REPLACE FUNCTION match_hubspot_deals(
  p_apply          boolean DEFAULT false,
  p_name_threshold real    DEFAULT 0.6
)
RETURNS TABLE(
  evaluated      int,
  matched_secure int,
  flagged_review int,
  unmatched      int
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_evaluated int;
  v_secure    int;
  v_review    int;
  v_unmatched int;
BEGIN
  -- Build per-deal best-match decision
  CREATE TEMP TABLE _hs_match ON COMMIT DROP AS
  WITH candidates AS (
    SELECT
      d.hubspot_deal_id,
      c.id AS client_id,
      (CASE WHEN d.mycase_case_id IS NOT NULL AND c.mycase_id IS NOT NULL
              AND d.mycase_case_id = c.mycase_id::text THEN 1 ELSE 0 END) AS s_mycase,
      (CASE WHEN d.case_number IS NOT NULL AND c.case_number IS NOT NULL
              AND d.case_number = c.case_number THEN 1 ELSE 0 END) AS s_case_num,
      similarity(COALESCE(d.dealname,''), COALESCE(c.name,'')) AS name_sim
    FROM hubspot_deals_raw d
    LEFT JOIN clients c
      ON (d.mycase_case_id IS NOT NULL AND c.mycase_id IS NOT NULL
            AND d.mycase_case_id = c.mycase_id::text)
      OR (d.case_number IS NOT NULL AND c.case_number IS NOT NULL
            AND d.case_number = c.case_number)
      OR (d.dealname IS NOT NULL AND c.name IS NOT NULL
            AND d.dealname % c.name)
    WHERE d.match_status IS NULL OR d.match_status = 'pending'
  ),
  scored AS (
    SELECT
      hubspot_deal_id, client_id, s_mycase, s_case_num, name_sim,
      (s_mycase + s_case_num
        + CASE WHEN name_sim >= p_name_threshold THEN 1 ELSE 0 END) AS score
    FROM candidates
  ),
  best AS (
    SELECT DISTINCT ON (hubspot_deal_id)
      hubspot_deal_id, client_id, s_mycase, s_case_num, name_sim, score
    FROM scored
    WHERE client_id IS NOT NULL
    ORDER BY hubspot_deal_id, score DESC, name_sim DESC
  )
  SELECT
    d.hubspot_deal_id,
    b.client_id,
    COALESCE(b.score, 0)                                                     AS score,
    COALESCE(b.s_mycase, 0)                                                  AS s_mycase,
    COALESCE(b.s_case_num, 0)                                                AS s_case_num,
    COALESCE(b.name_sim, 0)                                                  AS name_sim,
    CASE
      WHEN COALESCE(b.score,0) >= 2                                  THEN 'matched'
      WHEN COALESCE(b.score,0) = 1 AND b.name_sim >= p_name_threshold THEN 'review'
      WHEN COALESCE(b.score,0) = 1                                    THEN 'review'
      ELSE 'unmatched'
    END AS new_status,
    CASE
      WHEN b.s_mycase = 1 AND b.s_case_num = 1 AND b.name_sim >= p_name_threshold THEN 'all_three'
      WHEN b.s_mycase = 1 AND b.s_case_num = 1                                    THEN 'mycase+case_number'
      WHEN b.s_mycase = 1 AND b.name_sim >= p_name_threshold                      THEN 'mycase+name'
      WHEN b.s_case_num = 1 AND b.name_sim >= p_name_threshold                    THEN 'case_number+name'
      WHEN b.s_mycase = 1                                                          THEN 'mycase_only'
      WHEN b.s_case_num = 1                                                        THEN 'case_number_only'
      WHEN b.name_sim >= p_name_threshold                                          THEN 'name_only'
      ELSE 'no_match'
    END AS method
  FROM hubspot_deals_raw d
  LEFT JOIN best b USING (hubspot_deal_id)
  WHERE d.match_status IS NULL OR d.match_status = 'pending';

  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE new_status = 'matched'),
    COUNT(*) FILTER (WHERE new_status = 'review'),
    COUNT(*) FILTER (WHERE new_status = 'unmatched')
  INTO v_evaluated, v_secure, v_review, v_unmatched
  FROM _hs_match;

  IF p_apply THEN
    UPDATE hubspot_deals_raw d
    SET
      match_status      = m.new_status,
      match_score       = m.score,
      match_method      = m.method,
      matched_client_id = m.client_id,
      match_notes       = format('mycase=%s, case_num=%s, name_sim=%.2f',
                                 m.s_mycase, m.s_case_num, m.name_sim),
      matched_at        = now(),
      updated_at        = now()
    FROM _hs_match m
    WHERE d.hubspot_deal_id = m.hubspot_deal_id;

    -- Backfill clients.hubspot_deal_id for tier-A matches only (score >= 2),
    -- and only when the client has no existing deal_id (don't clobber)
    UPDATE clients c
    SET hubspot_deal_id = m.hubspot_deal_id
    FROM _hs_match m
    WHERE m.client_id = c.id
      AND m.new_status = 'matched'
      AND c.hubspot_deal_id IS NULL;
  END IF;

  RETURN QUERY SELECT v_evaluated, v_secure, v_review, v_unmatched;
END $$;

GRANT EXECUTE ON FUNCTION match_hubspot_deals(boolean, real) TO service_role;

-- 3. Convenience view — review queue for unmatched/review-tier deals
CREATE OR REPLACE VIEW hubspot_deals_review_queue AS
SELECT
  d.hubspot_deal_id,
  d.pipeline,
  d.dealstage,
  d.dealname,
  d.amount,
  d.case_number,
  d.mycase_case_id,
  d.contact_email,
  d.contact_phone,
  d.match_status,
  d.match_score,
  d.match_method,
  d.match_notes,
  d.matched_client_id,
  c.name AS suggested_client_name,
  c.case_number AS suggested_client_case_number,
  c.client_quality_status AS suggested_client_quality
FROM hubspot_deals_raw d
LEFT JOIN clients c ON c.id = d.matched_client_id
WHERE d.match_status IN ('review','unmatched')
ORDER BY d.match_score DESC NULLS LAST, d.amount DESC NULLS LAST;
