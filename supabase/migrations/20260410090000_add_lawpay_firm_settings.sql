-- Add LawPay payment page configuration to firm_settings
ALTER TABLE public.firm_settings
  ADD COLUMN IF NOT EXISTS lawpay_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS lawpay_operating_url text,
  ADD COLUMN IF NOT EXISTS lawpay_trust_url text,
  ADD COLUMN IF NOT EXISTS lawpay_default_account text NOT NULL DEFAULT 'operating'
    CHECK (lawpay_default_account IN ('operating', 'trust'));

-- Ensure at least one row exists so useFirmSettings() can always read/update
INSERT INTO public.firm_settings (firm_name)
SELECT 'LexCollect'
WHERE NOT EXISTS (SELECT 1 FROM public.firm_settings);
