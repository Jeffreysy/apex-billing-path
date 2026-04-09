UPDATE public.lawpay_transactions lt
SET
  amount = ROUND(((lt.raw_payload -> 'data' ->> 'amount')::numeric) / 100.0, 2),
  payment_date = COALESCE(
    lt.payment_date,
    ((lt.raw_payload -> 'data' ->> 'created')::timestamptz)::date
  ),
  status = COALESCE(NULLIF(lt.status, ''), lt.raw_payload -> 'data' ->> 'status'),
  description = COALESCE(NULLIF(lt.description, ''), lt.raw_payload -> 'data' ->> 'reference'),
  lawpay_transaction_id = COALESCE(NULLIF(lt.lawpay_transaction_id, ''), lt.raw_payload -> 'data' ->> 'id'),
  lawpay_charge_id = COALESCE(NULLIF(lt.lawpay_charge_id, ''), lt.raw_payload -> 'data' ->> 'id')
WHERE COALESCE(lt.amount, 0) = 0
  AND jsonb_typeof(lt.raw_payload) = 'object'
  AND jsonb_typeof(lt.raw_payload -> 'data') = 'object'
  AND (lt.raw_payload -> 'data' ->> 'amount') ~ '^[0-9]+$'
  AND (lt.raw_payload -> 'data' ->> 'amount')::numeric > 0;

INSERT INTO public.payments (
  client_id,
  amount,
  payment_date,
  payment_method,
  payment_number,
  payment_type,
  reference_number,
  notes,
  deposit_to_trust
)
SELECT
  lt.client_id,
  lt.amount,
  COALESCE(lt.payment_date, CURRENT_DATE),
  'credit_card'::public.payment_method,
  LEFT(COALESCE(lt.lawpay_transaction_id, lt.lawpay_charge_id, 'LAWPAY-' || lt.id::text), 50),
  'lawpay_backfill',
  COALESCE(lt.lawpay_transaction_id, lt.lawpay_charge_id, lt.id::text),
  COALESCE(NULLIF(lt.description, ''), 'LawPay backfill'),
  false
FROM public.lawpay_transactions lt
WHERE COALESCE(lt.matched_to_payment, false) = true
  AND lt.client_id IS NOT NULL
  AND COALESCE(lt.amount, 0) > 0
  AND NOT EXISTS (
    SELECT 1
    FROM public.payments p
    WHERE p.reference_number = COALESCE(lt.lawpay_transaction_id, lt.lawpay_charge_id, lt.id::text)
  );

UPDATE public.lawpay_transactions lt
SET payment_id = p.id
FROM public.payments p
WHERE p.reference_number = COALESCE(lt.lawpay_transaction_id, lt.lawpay_charge_id, lt.id::text)
  AND (lt.payment_id IS NULL OR lt.payment_id <> p.id);
