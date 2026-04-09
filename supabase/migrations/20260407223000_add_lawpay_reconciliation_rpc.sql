CREATE OR REPLACE FUNCTION public.admin_lawpay_reconciliation_summary()
RETURNS TABLE (
  total_transactions bigint,
  matched_transactions bigint,
  unmatched_transactions bigint,
  total_lawpay_amount numeric,
  matched_lawpay_amount numeric,
  unmatched_lawpay_amount numeric,
  linked_payment_rows bigint,
  linked_payment_amount numeric,
  unresolved_validation_issues bigint,
  unresolved_validation_difference numeric,
  latest_transaction_date date,
  latest_payment_date date
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.current_user_role() NOT IN ('admin', 'partner', 'billing_clerk') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  WITH lawpay AS (
    SELECT
      lt.id,
      lt.lawpay_transaction_id,
      COALESCE(lt.amount, 0)::numeric AS amount,
      COALESCE(lt.matched_to_payment, false) AS matched_to_payment,
      lt.payment_date
    FROM public.lawpay_transactions lt
  ),
  payment_links AS (
    SELECT
      COUNT(*)::bigint AS linked_payment_rows,
      COALESCE(SUM(p.amount), 0)::numeric AS linked_payment_amount,
      MAX(p.payment_date) AS latest_payment_date
    FROM public.payments p
    WHERE p.reference_number IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM lawpay l
        WHERE l.lawpay_transaction_id = p.reference_number
      )
  ),
  validation AS (
    SELECT
      COUNT(*)::bigint AS unresolved_validation_issues,
      COALESCE(SUM(ABS(COALESCE(difference, 0))), 0)::numeric AS unresolved_validation_difference
    FROM public.lawpay_validation_log
    WHERE COALESCE(resolved, false) = false
  )
  SELECT
    COUNT(*)::bigint AS total_transactions,
    COUNT(*) FILTER (WHERE matched_to_payment)::bigint AS matched_transactions,
    COUNT(*) FILTER (WHERE NOT matched_to_payment)::bigint AS unmatched_transactions,
    COALESCE(SUM(amount), 0)::numeric AS total_lawpay_amount,
    COALESCE(SUM(amount) FILTER (WHERE matched_to_payment), 0)::numeric AS matched_lawpay_amount,
    COALESCE(SUM(amount) FILTER (WHERE NOT matched_to_payment), 0)::numeric AS unmatched_lawpay_amount,
    payment_links.linked_payment_rows,
    payment_links.linked_payment_amount,
    validation.unresolved_validation_issues,
    validation.unresolved_validation_difference,
    MAX(payment_date) AS latest_transaction_date,
    payment_links.latest_payment_date
  FROM lawpay
  CROSS JOIN payment_links
  CROSS JOIN validation;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_lawpay_reconciliation_summary() TO authenticated;
