/**
 * Cash Movement · end-to-end mapping proof against the live, VP-certified view (VP 96d071e6). The Supabase client is
 * mocked to return the EXACT rows read back from public.v_firm_cash_movement_monthly on 2026-10-23 (PostgREST returns
 * numerics as strings; these are the raw strings). The REAL hook (useFirmCashMovementMonthly) maps them and the panel
 * renders them -- so this proves query -> mapping -> screen for Oct (open, through 10-22) and Sep (closed), plus the
 * NOT_MEASURABLE months: Jul 2025 (NULL buckets) and Mar 2026 (new sales flagged NOT_MEASURABLE but non-null).
 * Aggregate firm figures only; no client-level data.
 */
import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const calls = vi.hoisted(() => ({ from: [] as string[], select: [] as string[] }));
const VIEW_ROWS = vi.hoisted(() => {
  const ok = { consult_measurable: true, delinquency_split_measurable: true, new_sales_quality: "OK", filevine_signing_cash_not_included: null };
  return [
    {
      month: "2025-07-01", month_label: null, month_status: "closed", ledger_through: "2026-10-22", total_collected: "2093917.89",
      autopay_current: null, manual_current: null, delinquent_manual: null, delinquent_autopay: null, consult_cash: null,
      new_sales_cash: "482650.00", other_unresolved: "1611267.89", reconciliation_diff: "0.00", n_payments: 4154, basis: "Certified cash",
      data_quality: "NOT_MEASURABLE | delinquency split NOT_MEASURABLE (DCS starts 2025-12-29): autopay/manual/delinquent NULL, all non-consult non-signing cash in other_unresolved | consult NOT_MEASURABLE (LawPay consult page was not the consult rail before 2026-04; consult money sits inside the other buckets) | other_unresolved 76.9% of total",
      consult_measurable: false, delinquency_split_measurable: false, new_sales_quality: "OK", filevine_signing_cash_not_included: null, new_sales_cash_net: "479550.00",
    },
    {
      month: "2026-03-01", month_label: null, month_status: "closed", ledger_through: "2026-10-22", total_collected: "1250921.15",
      autopay_current: "656868.55", manual_current: "188179.50", delinquent_manual: "139285.10", delinquent_autopay: "133070.00", consult_cash: null,
      new_sales_cash: "114800.00", other_unresolved: "18718.00", reconciliation_diff: "0.00", n_payments: 2839, basis: "Certified cash",
      data_quality: "NOT_MEASURABLE | consult NOT_MEASURABLE (LawPay consult page was not the consult rail before 2026-04; consult money sits inside the other buckets) | new_sales NOT_MEASURABLE per v_new_case_sales_cash_monthly (2b71f412) | other_unresolved 1.5% of total | Filevine-era month: 244980.00 Filevine signing cash is NOT in certified cash and NOT in this view (all-systems line PROVISIONAL)",
      consult_measurable: false, delinquency_split_measurable: true, new_sales_quality: "NOT_MEASURABLE", filevine_signing_cash_not_included: "244980.00", new_sales_cash_net: "110800.00",
    },
    {
      month: "2026-08-01", month_label: null, month_status: "closed", ledger_through: "2026-10-22", total_collected: "1616554.93",
      autopay_current: "290006.00", manual_current: "106414.50", delinquent_manual: "499305.95", delinquent_autopay: "265751.48", consult_cash: "86077.00",
      new_sales_cash: "353300.00", other_unresolved: "15700.00", reconciliation_diff: "0.00", n_payments: 3143, basis: "Certified cash",
      data_quality: "OK | other_unresolved 1.0% of total", new_sales_cash_net: "350800.00", ...ok,
    },
    {
      month: "2026-09-01", month_label: null, month_status: "closed", ledger_through: "2026-10-22", total_collected: "1380828.08",
      autopay_current: "438646.48", manual_current: "140621.60", delinquent_manual: "270540.00", delinquent_autopay: "59620.00", consult_cash: "92195.00",
      new_sales_cash: "376705.00", other_unresolved: "2500.00", reconciliation_diff: "0.00", n_payments: 2706, basis: "Certified cash",
      data_quality: "OK | other_unresolved 0.2% of total", new_sales_cash_net: "376205.00", ...ok,
    },
    {
      month: "2026-10-01", month_label: null, month_status: "open", ledger_through: "2026-10-22", total_collected: "1095752.48",
      autopay_current: "383166.48", manual_current: "146095.00", delinquent_manual: "234104.00", delinquent_autopay: "55160.00", consult_cash: "74577.00",
      new_sales_cash: "191800.00", other_unresolved: "10850.00", reconciliation_diff: "0.00", n_payments: 2171, basis: "Certified cash",
      data_quality: "OK | other_unresolved 1.0% of total | OPEN month: ledger through 2026-10-22", new_sales_cash_net: "189300.00", ...ok,
    },
  ];
});

vi.mock("@/integrations/supabase/client", () => {
  const builder: any = {
    select(cols: string) { calls.select.push(cols); return builder; },
    order() { return builder; },
    limit() { return Promise.resolve({ data: [...VIEW_ROWS].reverse(), error: null }); },
  };
  return { supabase: { from: (t: string) => { calls.from.push(t); return builder; } } };
});

import CashMovementPanel from "./CashMovementPanel";

beforeAll(() => {
  (globalThis as any).ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} };
});
afterEach(() => cleanup());

const text = (el: Element) => (el.textContent || "").replace(/\s+/g, " ").trim();
async function renderMonth(monthVal: string) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={qc}>
      <CashMovementPanel monthVal={monthVal} arCaption="AR" arRollForward={<div />} />
    </QueryClientProvider>,
  );
  await screen.findByTestId("cm-row-autopay_current");
  const row = (b: string) => screen.getByTestId(`cm-row-${b}`);
  return { row, card: document.body };
}

describe("Cash Movement against v_firm_cash_movement_monthly (exact rows, 2026-10-23)", () => {
  it("queries the certified view with the contracted columns", async () => {
    await renderMonth("2026-10");
    expect(calls.from).toContain("v_firm_cash_movement_monthly");
    const cols = calls.select.at(-1) ?? "";
    for (const c of ["total_collected", "autopay_current", "manual_current", "delinquent_manual", "delinquent_autopay", "consult_cash",
      "new_sales_cash", "other_unresolved", "reconciliation_diff", "data_quality", "consult_measurable", "delinquency_split_measurable",
      "new_sales_quality", "new_sales_cash_net", "filevine_signing_cash_not_included"]) expect(cols).toContain(c);
  });

  it("October (open, through Oct 22) shows the view's figures exactly", async () => {
    const { row, card } = await renderMonth("2026-10");
    expect(text(card)).toContain("Provisional · through Oct 22");
    expect(text(card)).toContain("$1.10M");
    const exact = (b: string, usd: string, pct: string) => {
      expect(within(row(b)).getByTitle(usd)).toBeInTheDocument();
      expect(text(row(b))).toContain(pct);
    };
    exact("autopay_current", "$383,166.48", "35.0%");
    exact("manual_current", "$146,095.00", "13.3%");
    exact("delinquent_autopay", "$55,160.00", "5.0%");
    exact("delinquent_manual", "$234,104.00", "21.4%");
    exact("consult_cash", "$74,577.00", "6.8%");
    exact("new_sales_cash", "$191,800.00", "17.5%");
    exact("other_unresolved", "$10,850.00", "1.0%");
    expect(screen.getAllByTitle("$1,095,752.48").length).toBeGreaterThan(0);
    expect(text(row("new_sales_cash"))).toContain("gross · net $189.3k");
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("September (closed) shows the view's figures exactly", async () => {
    const { row, card } = await renderMonth("2026-09");
    expect(text(card)).toContain("Closed");
    const exact = (b: string, usd: string) => expect(within(row(b)).getByTitle(usd)).toBeInTheDocument();
    exact("autopay_current", "$438,646.48");
    exact("manual_current", "$140,621.60");
    exact("delinquent_autopay", "$59,620.00");
    exact("delinquent_manual", "$270,540.00");
    exact("consult_cash", "$92,195.00");
    exact("new_sales_cash", "$376,705.00");
    exact("other_unresolved", "$2,500.00");
    expect(screen.getAllByTitle("$1,380,828.08").length).toBeGreaterThan(0);
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("Jul 2025: NULL buckets render n/m (never $0), stay out of the % math, and the month still reconciles", async () => {
    const { row, card } = await renderMonth("2025-07");
    for (const b of ["autopay_current", "manual_current", "delinquent_manual", "delinquent_autopay", "consult_cash"]) {
      const t = text(row(b));
      expect(t).toContain("n/m");
      expect(t).not.toContain("$0");
      expect(t).not.toContain("0.0%");
    }
    expect(within(row("new_sales_cash")).getByTitle("$482,650.00")).toBeInTheDocument();
    expect(text(row("new_sales_cash"))).toContain("23.1%"); // 482,650 / 2,093,917.89
    expect(text(row("other_unresolved"))).toContain("76.9%"); // 1,611,267.89 / 2,093,917.89 (view's own note says 76.9%)
    expect(screen.queryByRole("alert")).toBeNull();
    expect(text(card)).toContain("Data quality: delinquency split NOT_MEASURABLE");
  });

  it("Mar 2026: new sales flagged NOT_MEASURABLE shows n/m, not $114.8k; no false reconciliation alarm; Filevine note", async () => {
    const { row, card } = await renderMonth("2026-03");
    expect(text(row("new_sales_cash"))).toContain("n/m");
    expect(text(row("new_sales_cash"))).not.toContain("$114.8k");
    expect(text(row("consult_cash"))).toContain("n/m");
    expect(within(row("autopay_current")).getByTitle("$656,868.55")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).toBeNull();
    expect(text(card)).toContain("$114.8k is in total collected but its bucket is not measurable");
    expect(text(card)).toContain("$245.0k of Filevine signing cash is not in certified cash");
  });
});
