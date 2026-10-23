/** Case Mix "Paid at signing" for one month -- the single computation the Case Mix tile shows, shared with the Gross
 *  sales card's cross-check (Jeff 2026-10-23: "they should read the same number $ put down on signing").
 *  Rows are v_exec_case_mix_monthly (one per month x reporting_family). When the sold split is deployed the tile counts
 *  SOLD families only (sold_cases > 0); otherwise every family. Returns null when the month has no rows. */
export interface CaseMixPaidRow {
  month: string;
  paid_at_signing?: number | null;
  sold_cases?: number | null;
}

export function caseMixMonthPaidAtSigning(rows: CaseMixPaidRow[] | undefined | null, monthVal: string): number | null {
  const monthRows = (rows ?? []).filter((r) => r.month.slice(0, 7) === monthVal);
  if (monthRows.length === 0) return null;
  const hasSold = monthRows.some((r) => r.sold_cases != null);
  const counted = hasSold ? monthRows.filter((r) => (Number(r.sold_cases) || 0) > 0) : monthRows;
  return counted.reduce((s, r) => s + (Number(r.paid_at_signing) || 0), 0);
}
