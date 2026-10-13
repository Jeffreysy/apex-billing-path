/**
 * Aggregate read-back of the three Executive Insights hero views, 2026-10-13 (no client-level data):
 * v_exec_collected_split_monthly (month grain), v_exec_client_bucket_drift (month x from x to cells,
 * CLIENT-grain counts), v_exec_case_mix_monthly (month x reporting_family, CASE-grain counts).
 * Used by ExecutiveInsights.test.tsx to prove the tiles render and tie to the book.
 */
// --- v_exec_collected_split_monthly (month grain) ----------------------------------------
export const collected = [
  { month: "2026-02-01", total_collected: 1229815.73, completed_amount: 1066644.73, offline_amount: 163171, payment_count: 2899, total_mtd_comparable: 210762.92, mtd_cutoff_day: 11, nonclient_consult_cash: 14555, nonclient_consult_payments: 100, client_collected: 1215260.73, consult_source_status: "PARTIAL_MONTH", ledger_through: "2026-02-28", consult_through: "2026-02-28", is_current_month: false },
  { month: "2026-08-01", total_collected: 1637128.93, completed_amount: 1593023.93, offline_amount: 44105, payment_count: 3228, total_mtd_comparable: 315296.5, mtd_cutoff_day: 11, nonclient_consult_cash: 87302, nonclient_consult_payments: 541, client_collected: 1549826.93, consult_source_status: "RECORDED_CONFIRMED", ledger_through: "2026-08-31", consult_through: "2026-08-31", is_current_month: false },
  { month: "2026-09-01", total_collected: 1399461.08, completed_amount: 1377191.08, offline_amount: 22270, payment_count: 2795, total_mtd_comparable: 319463.05, mtd_cutoff_day: 11, nonclient_consult_cash: 91936, nonclient_consult_payments: 607, client_collected: 1307525.08, consult_source_status: "RECORDED_CONFIRMED", ledger_through: "2026-09-30", consult_through: "2026-09-30", is_current_month: false },
  { month: "2026-10-01", total_collected: 257671, completed_amount: 254321, offline_amount: 3350, payment_count: 495, total_mtd_comparable: 257671, mtd_cutoff_day: 11, nonclient_consult_cash: 35926, nonclient_consult_payments: 225, client_collected: 221745, consult_source_status: "PARTIAL_MONTH", ledger_through: "2026-10-11", consult_through: "2026-10-12", is_current_month: true },
];

// --- v_exec_client_bucket_drift (month × from_ord × to_ord; CLIENT-grain counts) ----------
// [month, base, end, from_ord, to_ord, clients, base_balance, end_balance]
const driftRaw: [string, string, string, number, number, number, number, number][] = [
  ["2026-09-01", "2026-08-31", "2026-09-28", -1, 0, 128, 0, 827525], ["2026-09-01", "2026-08-31", "2026-09-28", -1, 1, 26, 0, 173040],
  ["2026-09-01", "2026-08-31", "2026-09-28", -1, 2, 2, 0, 6225], ["2026-09-01", "2026-08-31", "2026-09-28", -1, 5, 2, 0, 8920],
  ["2026-09-01", "2026-08-31", "2026-09-28", 0, -1, 162, 172705, 0], ["2026-09-01", "2026-08-31", "2026-09-28", 0, 0, 1021, 5296659.06, 4809319.53],
  ["2026-09-01", "2026-08-31", "2026-09-28", 0, 1, 155, 851090, 847650], ["2026-09-01", "2026-08-31", "2026-09-28", 1, -1, 15, 12800, 0],
  ["2026-09-01", "2026-08-31", "2026-09-28", 1, 0, 29, 196980, 167920], ["2026-09-01", "2026-08-31", "2026-09-28", 1, 1, 103, 543219, 494802.95],
  ["2026-09-01", "2026-08-31", "2026-09-28", 1, 2, 117, 655225, 652015], ["2026-09-01", "2026-08-31", "2026-09-28", 2, -1, 13, 16325, 0],
  ["2026-09-01", "2026-08-31", "2026-09-28", 2, 0, 2, 13500, 10500], ["2026-09-01", "2026-08-31", "2026-09-28", 2, 1, 8, 58300, 51650],
  ["2026-09-01", "2026-08-31", "2026-09-28", 2, 2, 42, 241629.9, 221792.9], ["2026-09-01", "2026-08-31", "2026-09-28", 2, 3, 82, 469895.01, 466385.01],
  ["2026-09-01", "2026-08-31", "2026-09-28", 3, -1, 10, 17075, 0], ["2026-09-01", "2026-08-31", "2026-09-28", 3, 2, 10, 32620, 24560],
  ["2026-09-01", "2026-08-31", "2026-09-28", 3, 3, 45, 173000, 155580], ["2026-09-01", "2026-08-31", "2026-09-28", 3, 4, 108, 622679, 618249],
  ["2026-09-01", "2026-08-31", "2026-09-28", 3, 5, 1, 2000, 3800], ["2026-09-01", "2026-08-31", "2026-09-28", 4, -1, 10, 8860, 0],
  ["2026-09-01", "2026-08-31", "2026-09-28", 4, 2, 1, 10500, 8000], ["2026-09-01", "2026-08-31", "2026-09-28", 4, 3, 3, 10100, 8220],
  ["2026-09-01", "2026-08-31", "2026-09-28", 4, 4, 308, 1426315, 1377070], ["2026-09-01", "2026-08-31", "2026-09-28", 4, 5, 82, 486190, 482690],
  ["2026-09-01", "2026-08-31", "2026-09-28", 5, -1, 7, 16960, 0], ["2026-09-01", "2026-08-31", "2026-09-28", 5, 4, 1, 6500, 6000],
  ["2026-09-01", "2026-08-31", "2026-09-28", 5, 5, 484, 2548635, 2521330], ["2026-09-01", "2026-08-31", "2026-09-28", 5, 6, 64, 397686.13, 397836.13],
  ["2026-09-01", "2026-08-31", "2026-09-28", 6, -1, 1, 150, 0], ["2026-09-01", "2026-08-31", "2026-09-28", 6, 5, 1, 8000, 7000],
  ["2026-09-01", "2026-08-31", "2026-09-28", 6, 6, 729, 3152245, 3128520],
  ["2026-10-01", "2026-09-28", "2026-10-12", -1, 0, 73, 0, 485925], ["2026-10-01", "2026-09-28", "2026-10-12", -1, 1, 6, 0, 64750],
  ["2026-10-01", "2026-09-28", "2026-10-12", -1, 3, 2, 0, 4390], ["2026-10-01", "2026-09-28", "2026-10-12", 0, -1, 35, 50785, 0],
  ["2026-10-01", "2026-09-28", "2026-10-12", 0, 0, 1115, 5697434.53, 5694009.53], ["2026-10-01", "2026-09-28", "2026-10-12", 0, 1, 30, 67045, 68445],
  ["2026-10-01", "2026-09-28", "2026-10-12", 1, -1, 6, 5015, 0], ["2026-10-01", "2026-09-28", "2026-10-12", 1, 0, 40, 220250, 197200],
  ["2026-10-01", "2026-09-28", "2026-10-12", 1, 1, 221, 1208372.95, 1207372.95], ["2026-10-01", "2026-09-28", "2026-10-12", 1, 2, 25, 133505, 132505],
  ["2026-10-01", "2026-09-28", "2026-10-12", 2, -1, 6, 16570, 0], ["2026-10-01", "2026-09-28", "2026-10-12", 2, 0, 6, 34175, 28650],
  ["2026-10-01", "2026-09-28", "2026-10-12", 2, 1, 14, 83780, 76920], ["2026-10-01", "2026-09-28", "2026-10-12", 2, 2, 132, 706102.9, 703652.9],
  ["2026-10-01", "2026-09-28", "2026-10-12", 2, 3, 14, 71965, 71965], ["2026-10-01", "2026-09-28", "2026-10-12", 3, -1, 8, 20210, 0],
  ["2026-10-01", "2026-09-28", "2026-10-12", 3, 1, 1, 6000, 5000], ["2026-10-01", "2026-09-28", "2026-10-12", 3, 2, 7, 45000, 41250],
  ["2026-10-01", "2026-09-28", "2026-10-12", 3, 3, 93, 500170.01, 500170.01], ["2026-10-01", "2026-09-28", "2026-10-12", 3, 4, 21, 58805, 58805],
  ["2026-10-01", "2026-09-28", "2026-10-12", 4, -1, 9, 33920, 0], ["2026-10-01", "2026-09-28", "2026-10-12", 4, 3, 13, 76690, 70180],
  ["2026-10-01", "2026-09-28", "2026-10-12", 4, 4, 384, 1850249, 1842434], ["2026-10-01", "2026-09-28", "2026-10-12", 4, 5, 11, 40460, 39960],
  ["2026-10-01", "2026-09-28", "2026-10-12", 5, -1, 6, 36260, 0], ["2026-10-01", "2026-09-28", "2026-10-12", 5, 0, 1, 7050, 6750],
  ["2026-10-01", "2026-09-28", "2026-10-12", 5, 4, 3, 31450, 28250], ["2026-10-01", "2026-09-28", "2026-10-12", 5, 5, 547, 2907295, 2898365],
  ["2026-10-01", "2026-09-28", "2026-10-12", 5, 6, 13, 41685, 41455], ["2026-10-01", "2026-09-28", "2026-10-12", 6, -1, 28, 285515, 0],
  ["2026-10-01", "2026-09-28", "2026-10-12", 6, 5, 1, 3280, 2780], ["2026-10-01", "2026-09-28", "2026-10-12", 6, 6, 764, 3237561.13, 3231701.13],
];
const BUCKETS = ["current", "1-30", "31-60", "61-90", "91-180", "181-365", "365+"];
export const drift = driftRaw.map(([month, base, end, f, t, clients, bb, eb]) => ({
  month, base_snapshot_date: base, end_snapshot_date: end, from_ord: f, to_ord: t,
  from_bucket: f === -1 ? null : BUCKETS[f], to_bucket: t === -1 ? null : BUCKETS[t],
  movement: f === -1 ? "new" : t === -1 ? "left" : t > f ? "worse" : t < f ? "recovered" : "same",
  clients, base_balance: bb, end_balance: eb,
}));

// --- v_exec_case_mix_monthly (month × reporting_family; CASE-grain counts) ------------------
const fresh = { cases_loaded_through: "2026-10-02", invoices_synced_at: "2026-10-02T16:04:34Z" };
export const caseMix = [
  ["2026-09-01", "T-Visa Principal", 70, 904113.05], ["2026-09-01", "T-Visa Derivative", 16, 87300],
  ["2026-09-01", "Other / long-tail", 27, 76625], ["2026-09-01", "Removal Defense", 14, 66955],
  ["2026-09-01", "I-360 Marriage", 5, 63500], ["2026-09-01", "U-Visa Principal", 8, 63300],
  ["2026-09-01", "I-130", 14, 36600], ["2026-09-01", "Immigration (General)", 3, 26600],
  ["2026-09-01", "U-Visa Certification", 12, 26100], ["2026-09-01", "AOS One-Step", 4, 23165],
  ["2026-09-01", "I-360 Parent", 2, 17100], ["2026-09-01", "FOIA", 9, 14000], ["2026-09-01", "(unspecified)", 1, 200],
  ["2026-10-01", "T-Visa Principal", 3, 39300], ["2026-10-01", "Other / long-tail", 1, 13100],
].map(([month, fam, n, v]) => ({
  month: month as string, reporting_family: fam as string, family_sort: 1, revenue_cases: n as number,
  contract_value: v as number, avg_per_case: (v as number) / (n as number), ...fresh,
}));

// --- v_firm_financial_summary (certified, single row; only the fields the hero reads) ------
export const firmSummary = { as_of: "2026-10-12", ar_total: 17502885.52 };

// --- v_exec_ar_at_risk (one row; INVOICE-CLOCK basis, Jeff 2026-10-13: v_ar_invoice_clock effective_aging_days > 60) --
export const arAtRisk = {
  ar_at_risk_60: 5847117.13, ar_total: 17502885.52, invoices_at_risk_60: 1510, clients_at_risk_60: 1349,
  unlinked_invoices_at_risk_60: 12, invoices: 3924, snapshot_date: "2026-10-12", basis: "invoice_clock",
  legacy_contract_dpd_at_risk_60: 8985310.81, refreshed_at: null,
};
