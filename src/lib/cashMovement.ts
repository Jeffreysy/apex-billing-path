/** Firm cash movement buckets (v_firm_cash_movement_monthly, VP 96d071e6) -- pure types + helpers, no I/O, so they can
 *  be unit-tested without the Supabase client. The hook lives in src/hooks/useSupabaseData.ts and re-exports these. */
export const CASH_MOVEMENT_BUCKETS = [
  "autopay_current",
  "manual_current",
  "delinquent_manual",
  "delinquent_autopay",
  "consult_cash",
  "new_sales_cash",
  "other_unresolved",
] as const;
export type CashMovementBucket = (typeof CASH_MOVEMENT_BUCKETS)[number];

export interface FirmCashMovementMonth extends Record<CashMovementBucket, number | null> {
  month: string; // yyyy-MM-dd (1st of month)
  month_label: string | null;
  month_status: "closed" | "open" | string;
  ledger_through: string | null;
  total_collected: number;
  reconciliation_diff: number | null;
  n_payments: number | null;
  basis: string | null;
  /** VP caveats: pipe-delimited text ("OK | other_unresolved 1.0% of total | ..."); rendered as notes, never hidden. */
  data_quality: unknown;
  /** Measurability flags (VP 96d071e6). A NULL bucket, or a bucket whose flag says not measurable, is NOT_MEASURABLE:
   *  shown as "n/m", never $0, and kept out of the % math and the bar. Absent column -> null (treated as measurable). */
  consult_measurable: boolean | null;
  delinquency_split_measurable: boolean | null;
  new_sales_quality: string | null;
  /** new_sales_cash is GROSS (total_collected is gross); net of signing refunds beside it. */
  new_sales_cash_net: number | null;
  /** Filevine signing cash for the month that is NOT in certified cash nor in this view (Filevine era). */
  filevine_signing_cash_not_included: number | null;
}

const DELINQUENCY_SPLIT_BUCKETS: CashMovementBucket[] = ["autopay_current", "manual_current", "delinquent_manual", "delinquent_autopay"];
/** True when a bucket's value can be shown as money. NULL, or a measurability flag saying no, means "n/m". */
export function isCashBucketMeasurable(r: FirmCashMovementMonth, b: CashMovementBucket): boolean {
  if (r[b] === null || r[b] === undefined) return false;
  if (DELINQUENCY_SPLIT_BUCKETS.includes(b) && r.delinquency_split_measurable === false) return false;
  if (b === "consult_cash" && r.consult_measurable === false) return false;
  if (b === "new_sales_cash" && (r.new_sales_quality ?? "").toUpperCase() === "NOT_MEASURABLE") return false;
  return true;
}

