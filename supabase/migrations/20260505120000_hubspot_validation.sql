-- HubSpot validation layer
-- Connects HubSpot pipelines to LexCollect as source of truth for case/consult classification

-- 1. Link clients to HubSpot contacts/deals
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS hubspot_contact_id text,
  ADD COLUMN IF NOT EXISTS hubspot_deal_id text;

CREATE INDEX IF NOT EXISTS idx_clients_hubspot_deal_id ON clients(hubspot_deal_id);
CREATE INDEX IF NOT EXISTS idx_clients_hubspot_contact_id ON clients(hubspot_contact_id);

-- 2. Link contracts to HubSpot deals for validation
ALTER TABLE contracts
  ADD COLUMN IF NOT EXISTS hubspot_deal_id text,
  ADD COLUMN IF NOT EXISTS hubspot_pipeline text,
  ADD COLUMN IF NOT EXISTS hubspot_stage text,
  ADD COLUMN IF NOT EXISTS hubspot_validated_at timestamptz,
  ADD COLUMN IF NOT EXISTS lawpay_invoice_number text;

CREATE INDEX IF NOT EXISTS idx_contracts_hubspot_deal_id ON contracts(hubspot_deal_id);
CREATE INDEX IF NOT EXISTS idx_contracts_lawpay_invoice ON contracts(lawpay_invoice_number);

-- 3. Link payments to LawPay invoices
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS lawpay_invoice_number text,
  ADD COLUMN IF NOT EXISTS hubspot_deal_id text;

CREATE INDEX IF NOT EXISTS idx_payments_lawpay_invoice ON payments(lawpay_invoice_number);

-- 4. Consults table — home for Intake -> Case Created pipeline records
CREATE TABLE IF NOT EXISTS consults (
  id                    uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  hubspot_deal_id       text UNIQUE NOT NULL,
  client_id             uuid REFERENCES clients(id),
  dealname              text,
  consultation_date     timestamptz,
  consultation_fee      numeric(10,2),
  consult_specialist    text,
  attorney              text,
  intaker               text,
  pipeline              text,
  stage                 text,
  stage_label           text,
  payment_status        text,
  phone_number          text,
  lead_priority         text,
  unqualified_reason    text,
  practice_area         text,
  mycase_id             text,
  -- Conversion tracking: did this consult become a case?
  converted_to_case     boolean DEFAULT false,
  converted_contract_id uuid REFERENCES contracts(id),
  converted_at          timestamptz,
  -- HubSpot sync metadata
  hubspot_created_at    timestamptz,
  hubspot_updated_at    timestamptz,
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consults_client_id ON consults(client_id);
CREATE INDEX IF NOT EXISTS idx_consults_stage ON consults(stage);
CREATE INDEX IF NOT EXISTS idx_consults_converted ON consults(converted_to_case);

-- 5. Validation log — every HubSpot → Supabase event recorded
CREATE TABLE IF NOT EXISTS hubspot_sync_log (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  hubspot_deal_id text NOT NULL,
  pipeline        text,
  stage           text,
  event_type      text, -- 'consult_upsert' | 'case_validate' | 'collections_update' | 'unmatched'
  matched         boolean DEFAULT false,
  match_detail    text,
  payload         jsonb,
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sync_log_deal_id ON hubspot_sync_log(hubspot_deal_id);
CREATE INDEX IF NOT EXISTS idx_sync_log_matched ON hubspot_sync_log(matched);
CREATE INDEX IF NOT EXISTS idx_sync_log_event ON hubspot_sync_log(event_type);

-- 6. View: unmatched HubSpot records that need attention
CREATE OR REPLACE VIEW hubspot_unmatched AS
SELECT
  l.hubspot_deal_id,
  l.pipeline,
  l.stage,
  l.event_type,
  l.match_detail,
  l.created_at,
  (l.payload->>'dealname') AS dealname,
  (l.payload->>'amount')::numeric AS amount,
  (l.payload->>'consultation_fee')::numeric AS consultation_fee
FROM hubspot_sync_log l
WHERE l.matched = false
ORDER BY l.created_at DESC;

-- 7. View: consult conversion funnel
CREATE OR REPLACE VIEW consult_funnel AS
SELECT
  stage_label,
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE converted_to_case = true) AS converted,
  ROUND(AVG(consultation_fee), 2) AS avg_fee,
  SUM(consultation_fee) FILTER (WHERE payment_status = 'paid') AS fees_collected
FROM consults
GROUP BY stage_label
ORDER BY total DESC;

-- 8. Collections pipeline stage → delinquency_status mapping function
CREATE OR REPLACE FUNCTION hubspot_stage_to_delinquency(stage_id text)
RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE stage_id
    WHEN '3067194068' THEN 'Past Due <7'
    WHEN '3067194069' THEN 'Past Due 7-30'
    WHEN '3067194070' THEN 'Past Due 30-90'
    WHEN '3067194071' THEN 'Past Due 90+'
    WHEN '3067194072' THEN 'Current'
    WHEN '3067194074' THEN 'Delinquent'
    ELSE NULL
  END
$$;
