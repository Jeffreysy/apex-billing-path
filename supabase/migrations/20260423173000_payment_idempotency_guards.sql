-- Payment idempotency guards
-- Prevent duplicate booking when webhooks retry or multiple handlers race.

CREATE UNIQUE INDEX IF NOT EXISTS ux_payments_reference_number_not_null
ON public.payments(reference_number)
WHERE reference_number IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ux_payments_payment_number_not_null
ON public.payments(payment_number)
WHERE payment_number IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ux_lawpay_transactions_transaction_id_not_null
ON public.lawpay_transactions(lawpay_transaction_id)
WHERE lawpay_transaction_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ux_lawpay_transactions_charge_id_not_null
ON public.lawpay_transactions(lawpay_charge_id)
WHERE lawpay_charge_id IS NOT NULL;
