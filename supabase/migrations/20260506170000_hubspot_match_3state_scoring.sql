-- HubSpot match RPC v3 — three-state scoring (agree / disagree / missing-neutral)
-- + backfill clients.email/phone from HubSpot when client has none and a match is secure.
--
-- Scoring per (deal, candidate-client):
--   s_email:  +1 agree, -2 disagree (both sides have a value but they differ), 0 missing-on-either-side
--   s_phone:  +1 agree, -2 disagree, 0 missing-on-either-side
--   s_name:   +2 if similarity >= 0.95 (essentially exact), +1 if >= 0.7, else 0
-- Tier: score >= 2 = matched, = 1 = review, <= 0 = unmatched
-- A negative score (active contradiction) prevents false positives even when name matches.

CREATE OR REPLACE FUNCTION match_hubspot_deals(
  p_apply             boolean DEFAULT false,
  p_name_threshold    real    DEFAULT 0.7,
  p_name_strong_match real    DEFAULT 0.95
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
  CREATE TEMP TABLE _hs_match ON COMMIT DROP AS
  WITH staged AS (
    SELECT
      d.hubspot_deal_id,
      regexp_replace(COALESCE(d.dealname,''), '^(Case|Lead|Consult)\s*-\s*', '', 'i') AS clean_dealname,
      lower(NULLIF(trim(d.contact_email), '')) AS norm_email,
      NULLIF(right(regexp_replace(COALESCE(d.contact_phone,''), '\D', '', 'g'), 10), '') AS norm_phone10
    FROM hubspot_deals_raw d
    WHERE d.match_status IS NULL OR d.match_status = 'pending'
  ),
  candidates AS (
    SELECT
      s.hubspot_deal_id,
      c.id AS client_id,
      -- Email: agree=+1, disagree=-2, missing=0
      CASE
        WHEN s.norm_email IS NOT NULL AND c.email IS NOT NULL AND lower(c.email) = s.norm_email THEN  1
        WHEN s.norm_email IS NOT NULL AND c.email IS NOT NULL AND lower(c.email) <> s.norm_email THEN -2
        ELSE 0
      END AS s_email,
      -- Phone: agree=+1, disagree=-2, missing=0
      CASE
        WHEN s.norm_phone10 IS NOT NULL AND c.phone IS NOT NULL
              AND right(regexp_replace(c.phone, '\D', '', 'g'), 10) = s.norm_phone10 THEN  1
        WHEN s.norm_phone10 IS NOT NULL AND c.phone IS NOT NULL
              AND right(regexp_replace(c.phone, '\D', '', 'g'), 10) <> s.norm_phone10 THEN -2
        ELSE 0
      END AS s_phone,
      similarity(s.clean_dealname, COALESCE(c.name,'')) AS name_sim
    FROM staged s
    LEFT JOIN clients c
      ON (s.norm_email IS NOT NULL AND lower(c.email) = s.norm_email)
      OR (s.norm_phone10 IS NOT NULL
            AND right(regexp_replace(COALESCE(c.phone,''), '\D', '', 'g'), 10) = s.norm_phone10)
      OR (s.clean_dealname <> '' AND c.name IS NOT NULL AND s.clean_dealname % c.name)
  ),
  scored AS (
    SELECT
      hubspot_deal_id, client_id, s_email, s_phone, name_sim,
      (s_email + s_phone
        + CASE
            WHEN name_sim >= p_name_strong_match THEN 2
            WHEN name_sim >= p_name_threshold    THEN 1
            ELSE 0
          END
      ) AS score
    FROM candidates
  ),
  best AS (
    SELECT DISTINCT ON (hubspot_deal_id)
      hubspot_deal_id, client_id, s_email, s_phone, name_sim, score
    FROM scored
    WHERE client_id IS NOT NULL
    ORDER BY hubspot_deal_id, score DESC, name_sim DESC
  )
  SELECT
    d.hubspot_deal_id,
    b.client_id,
    COALESCE(b.score,    0) AS score,
    COALESCE(b.s_email,  0) AS s_email,
    COALESCE(b.s_phone,  0) AS s_phone,
    COALESCE(b.name_sim, 0) AS name_sim,
    CASE
      WHEN COALESCE(b.score,0) >= 2 THEN 'matched'
      WHEN COALESCE(b.score,0) = 1  THEN 'review'
      ELSE 'unmatched'
    END AS new_status,
    CASE
      WHEN b.s_email = 1 AND b.s_phone = 1 AND b.name_sim >= p_name_strong_match THEN 'all_three_strong'
      WHEN b.s_email = 1 AND b.s_phone = 1                                        THEN 'email+phone'
      WHEN b.s_email = 1 AND b.name_sim >= p_name_strong_match                    THEN 'email+strong_name'
      WHEN b.s_phone = 1 AND b.name_sim >= p_name_strong_match                    THEN 'phone+strong_name'
      WHEN b.s_email = 1 AND b.name_sim >= p_name_threshold                       THEN 'email+name'
      WHEN b.s_phone = 1 AND b.name_sim >= p_name_threshold                       THEN 'phone+name'
      WHEN b.name_sim >= p_name_strong_match                                      THEN 'strong_name_only'
      WHEN b.s_email = 1                                                          THEN 'email_only'
      WHEN b.s_phone = 1                                                          THEN 'phone_only'
      WHEN b.name_sim >= p_name_threshold                                         THEN 'name_only'
      WHEN b.s_email = -2 OR b.s_phone = -2                                       THEN 'contradicted'
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
      match_notes       = format('email=%s, phone=%s, name_sim=%.2f',
                                 m.s_email, m.s_phone, m.name_sim),
      matched_at        = now(),
      updated_at        = now()
    FROM _hs_match m
    WHERE d.hubspot_deal_id = m.hubspot_deal_id;

    -- Cascade hubspot_deal_id back to clients for tier-A matches only
    UPDATE clients c
    SET hubspot_deal_id = m.hubspot_deal_id
    FROM _hs_match m
    WHERE m.client_id = c.id
      AND m.new_status = 'matched'
      AND c.hubspot_deal_id IS NULL;

    -- Backfill missing email/phone from HubSpot for matched clients
    UPDATE clients c
    SET email = COALESCE(c.email, lower(NULLIF(trim(d.contact_email), ''))),
        phone = COALESCE(c.phone, d.contact_phone)
    FROM _hs_match m
    JOIN hubspot_deals_raw d ON d.hubspot_deal_id = m.hubspot_deal_id
    WHERE m.client_id = c.id
      AND m.new_status = 'matched'
      AND (
        (c.email IS NULL AND d.contact_email IS NOT NULL) OR
        (c.phone IS NULL AND d.contact_phone IS NOT NULL)
      );
  END IF;

  RETURN QUERY SELECT v_evaluated, v_secure, v_review, v_unmatched;
END $$;

GRANT EXECUTE ON FUNCTION match_hubspot_deals(boolean, real, real) TO service_role;
