/**
 * Delinquent Collections key metric — pure helpers (no React, no Supabase).
 *
 * Every number comes from `v_delinquent_collections_kpi` (cached rows of
 * `delinquent_collections_metrics()` over the delinquent-cash spine `mv_delinquent_cash_txn`).
 * Nothing here computes a business definition: these helpers only pick rows, coerce types and
 * compare a period with its comparison window. Definitions live in SQL and in
 * docs/metrics/delinquent-collections.md, so another firm's data maps onto the same views.
 */

export type DcmPeriodKind = "mtd" | "mtd_prior" | "month" | "week";

export interface DcmKpiRow {
  period_kind: DcmPeriodKind;
  is_partial: boolean;
  period_start: string; // ISO date
  period_end: string; // ISO date
  // cash — TRANSACTION grain
  settled_cash: number;
  manual_cash: number;
  autopay_cash: number;
  delinquent_cash: number;
  delinquent_manual_cash: number;
  delinquent_autopay_cash: number;
  delinquent_31plus_cash: number;
  delinquent_manual_31plus_cash: number;
  delinquent_autopay_31plus_cash: number;
  n_delinquent_txns: number;
  n_delinquent_manual_txns: number;
  n_delinquent_autopay_txns: number;
  // willing payers — CLIENT grain
  willing_payers: number;
  willing_payers_manual: number;
  willing_payers_autopay: number;
  willing_payers_31plus: number;
  // new payers (null when the window is too close to the spine floor)
  payer_metrics_valid: boolean;
  silence_days: number;
  consult_max: number;
  intake_payers: number; // PAYER grain (payer_key) — first payment, not on the AR snapshot
  intake_payers_consult_size: number;
  intake_payers_retainer_size: number;
  intake_payers_on_ar_now: number;
  intake_cash: number;
  resumed_payers: number | null; // CLIENT grain, subset of willing_payers
  resumed_payers_manual: number | null;
  resumed_payers_automatic: number | null;
  // data quality
  unresolved_cash: number;
  unresolved_pct: number | null;
  new_client_cash: number;
  snapshot_in_force_latest: string | null;
  snapshot_lag_max_days: number | null;
  quality: string;
  // as-of metadata (same on every row)
  complete_through: string;
  ledger_max_txn_date: string | null;
  ledger_last_loaded_at: string | null;
  broken_autodraft_as_of: string | null;
  broken_autodraft_grace_days: number;
  broken_autodraft_plans: number;
  broken_autodraft_clients: number;
  broken_autodraft_plan_balance: number;
  failed_draft_plans: number;
  failed_draft_plan_balance: number;
  failed_before_due_only_plans: number;
  failed_before_due_only_plan_balance: number;
  no_failed_draft_plans: number;
  no_failed_draft_plan_balance: number;
  refreshed_at: string | null;
}

const NUMERIC_FIELDS = [
  "settled_cash", "manual_cash", "autopay_cash", "delinquent_cash", "delinquent_manual_cash", "delinquent_autopay_cash",
  "delinquent_31plus_cash", "delinquent_manual_31plus_cash", "delinquent_autopay_31plus_cash",
  "n_delinquent_txns", "n_delinquent_manual_txns", "n_delinquent_autopay_txns",
  "willing_payers", "willing_payers_manual", "willing_payers_autopay", "willing_payers_31plus", "silence_days", "consult_max",
  "intake_payers", "intake_payers_consult_size", "intake_payers_retainer_size", "intake_payers_on_ar_now", "intake_cash",
  "unresolved_cash", "new_client_cash",
  "broken_autodraft_grace_days", "broken_autodraft_plans", "broken_autodraft_clients", "broken_autodraft_plan_balance",
  "failed_draft_plans", "failed_draft_plan_balance", "failed_before_due_only_plans", "failed_before_due_only_plan_balance",
  "no_failed_draft_plans", "no_failed_draft_plan_balance",
] as const;

const NULLABLE_NUMERIC_FIELDS = [
  "resumed_payers", "resumed_payers_manual", "resumed_payers_automatic",
  "unresolved_pct", "snapshot_lag_max_days",
] as const;

/** PostgREST returns numeric columns as strings; coerce without inventing values. */
export function normalizeDcmRow(raw: Record<string, unknown>): DcmKpiRow {
  const r: Record<string, unknown> = { ...raw };
  for (const f of NUMERIC_FIELDS) r[f] = Number(raw[f] ?? 0) || 0;
  for (const f of NULLABLE_NUMERIC_FIELDS) r[f] = raw[f] === null || raw[f] === undefined ? null : Number(raw[f]);
  r.is_partial = Boolean(raw.is_partial);
  r.payer_metrics_valid = Boolean(raw.payer_metrics_valid);
  return r as unknown as DcmKpiRow;
}

/** New payment plans first seen per plan-feed load (dcm.new_plan_seen.v2). Dated by FEED LOAD, not plan creation. */
export interface DcmPlanLoadRow {
  load_as_of: string;
  prev_load_as_of: string | null;
  days_covered: number | null;
  new_plans: number;
  new_plans_autopay: number;
  new_plans_manual: number;
  new_plans_autopay_unknown: number;
  new_plan_clients: number;
  new_plan_clients_autopay: number;
  new_plan_clients_manual: number;
}

export function normalizePlanLoadRow(raw: Record<string, unknown>): DcmPlanLoadRow {
  const n = (v: unknown) => Number(v ?? 0) || 0;
  return {
    load_as_of: String(raw.load_as_of),
    prev_load_as_of: raw.prev_load_as_of ? String(raw.prev_load_as_of) : null,
    days_covered: raw.days_covered === null || raw.days_covered === undefined ? null : Number(raw.days_covered),
    new_plans: n(raw.new_plans),
    new_plans_autopay: n(raw.new_plans_autopay),
    new_plans_manual: n(raw.new_plans_manual),
    new_plans_autopay_unknown: n(raw.new_plans_autopay_unknown),
    new_plan_clients: n(raw.new_plan_clients),
    new_plan_clients_autopay: n(raw.new_plan_clients_autopay),
    new_plan_clients_manual: n(raw.new_plan_clients_manual),
  };
}

export interface DcmView {
  mtd: DcmKpiRow;
  prior: DcmKpiRow;
  months: DcmKpiRow[];
  weeks: DcmKpiRow[];
}

/** Split the cached rows into the panel's views. Null when the MTD / comparison rows are missing. */
export function selectDcmView(rows: DcmKpiRow[] | null | undefined): DcmView | null {
  if (!rows || rows.length === 0) return null;
  const mtd = rows.find((r) => r.period_kind === "mtd");
  const prior = rows.find((r) => r.period_kind === "mtd_prior");
  if (!mtd || !prior) return null;
  const byStart = (a: DcmKpiRow, b: DcmKpiRow) => a.period_start.localeCompare(b.period_start);
  return {
    mtd,
    prior,
    months: rows.filter((r) => r.period_kind === "month").sort(byStart),
    weeks: rows.filter((r) => r.period_kind === "week").sort(byStart),
  };
}

/** Percent change of `cur` vs `prev`, one decimal; null when there is no base. */
export function pctChange(cur: number | null | undefined, prev: number | null | undefined): number | null {
  if (cur === null || cur === undefined || prev === null || prev === undefined || prev === 0) return null;
  return Math.round(((cur - prev) / prev) * 1000) / 10;
}

export const isQualityOk = (q: string | null | undefined) => (q ?? "").toUpperCase().startsWith("OK");

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-10-12" -> "Oct 12" (no Date parsing, so no timezone drift). */
export function dayLabel(iso: string | null | undefined): string {
  if (!iso) return "—";
  const [, m, d] = iso.slice(0, 10).split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}`;
}

/** "2026-10-01".."2026-10-12" -> "Oct 1–12"; across months -> "Sep 29–Oct 5". */
export function rangeLabel(start: string, end: string): string {
  const [, sm, sd] = start.split("-").map(Number);
  const [, em, ed] = end.split("-").map(Number);
  if (start === end) return `${MONTHS[sm - 1]} ${sd}`;
  return sm === em ? `${MONTHS[sm - 1]} ${sd}–${ed}` : `${MONTHS[sm - 1]} ${sd}–${MONTHS[em - 1]} ${ed}`;
}

/** Chart label for a trend row; partial periods say where they stop. */
export function trendLabel(r: DcmKpiRow): string {
  const [y, m] = r.period_start.split("-").map(Number);
  const base = r.period_kind === "month" ? `${MONTHS[m - 1]} ${String(y).slice(2)}` : dayLabel(r.period_start);
  return r.is_partial ? `${base}*` : base;
}
