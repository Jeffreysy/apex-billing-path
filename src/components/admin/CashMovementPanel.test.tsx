/**
 * Cash Movement · Money Flow (2026-10-23). The rows below are SYNTHETIC round numbers, NOT firm figures: the VP's
 * v_firm_cash_movement_monthly was not live when this was written. The test proves the panel's behavior against the
 * data contract (seven buckets summing to total_collected, open/closed status, reconciliation_diff, data_quality):
 * awaiting state with no numbers, $ and % per bucket, provisional label, visible reconciliation warning, caveat note,
 * and the AR roll-forward still reachable on its tab.
 */
import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, within } from "@testing-library/react";

const cash = vi.hoisted(() => ({
  state: { data: { available: false, rows: [] as unknown[] }, isLoading: false, isError: false } as any,
}));

vi.mock("@/hooks/useSupabaseData", () => ({
  useFirmCashMovementMonthly: () => ({ ...cash.state, refetch: vi.fn(), error: null }),
  CASH_MOVEMENT_BUCKETS: [
    "autopay_current", "manual_current", "delinquent_manual", "delinquent_autopay",
    "consult_cash", "new_sales_cash", "other_unresolved",
  ],
}));

import CashMovementPanel from "./CashMovementPanel";

const row = (month: string, status: "open" | "closed", b: number[], extra: Record<string, unknown> = {}) => {
  const [autopay_current, manual_current, delinquent_manual, delinquent_autopay, consult_cash, new_sales_cash, other_unresolved] = b;
  return {
    month, month_label: null, month_status: status, ledger_through: status === "open" ? "2026-10-22" : `${month.slice(0, 8)}28`,
    total_collected: b.reduce((s, v) => s + v, 0),
    autopay_current, manual_current, delinquent_manual, delinquent_autopay, consult_cash, new_sales_cash, other_unresolved,
    reconciliation_diff: 0, n_payments: 100, basis: "synthetic", data_quality: null,
    ...extra,
  };
};

// SYNTHETIC: Aug 80,000 (but buckets 79,500 -> diff 500), Sep 100,000 closed, Oct 50,000 open.
const AUG = row("2026-08-01", "closed", [30000, 20000, 10000, 5000, 6000, 7000, 1500], { total_collected: 80000, reconciliation_diff: 500 });
const SEP = row("2026-09-01", "closed", [40000, 20000, 10000, 5000, 8000, 15000, 2000]);
const OCT = row("2026-10-01", "open", [18000, 12000, 6000, 2000, 4000, 7000, 1000], { data_quality: "consult ledger partial after Oct 20" });

beforeAll(() => {
  (globalThis as any).ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} };
});
afterEach(() => {
  cleanup();
  cash.state = { data: { available: false, rows: [] }, isLoading: false, isError: false };
});

const text = (el: HTMLElement) => (el.textContent || "").replace(/\s+/g, " ").trim();
const renderPanel = (monthVal: string) =>
  render(<CashMovementPanel monthVal={monthVal} arCaption="AR roll-forward · test" arRollForward={<div>AR DONUT CONTENT</div>} />);

describe("Cash Movement panel", () => {
  it("shows 'awaiting certified data' and no numbers while the view is not live", () => {
    const { container } = renderPanel("2026-10");
    expect(screen.getByText("Awaiting certified data")).toBeInTheDocument();
    expect(text(container)).not.toMatch(/\$\d/);
  });

  it("closed month: total, seven buckets with $ and %, month-over-month share change, no warning", () => {
    cash.state = { data: { available: true, rows: [AUG, SEP, OCT] }, isLoading: false, isError: false };
    const { container } = renderPanel("2026-09");
    const t = text(container);
    expect(t).toContain("Closed");
    expect(t).toContain("$100.0k");
    const expectRow = (key: string, label: string, usd: string, pct: string) => {
      const r = text(screen.getByTestId(`cm-row-${key}`));
      expect(r).toContain(label);
      expect(r).toContain(usd);
      expect(r).toContain(pct);
    };
    expectRow("autopay_current", "Autopay", "$40.0k", "40.0%");
    expectRow("manual_current", "Manual", "$20.0k", "20.0%");
    expectRow("delinquent_manual", "Delinquent – manual", "$10.0k", "10.0%");
    expectRow("delinquent_autopay", "Delinquent – autopay", "$5.0k", "5.0%");
    expectRow("consult_cash", "Consults", "$8.0k", "8.0%");
    expectRow("new_sales_cash", "New sales", "$15.0k", "15.0%");
    expectRow("other_unresolved", "Other / unclassified", "$2.0k", "2.0%");
    // Autopay share 37.5% (Aug) -> 40.0% (Sep)
    expect(text(screen.getByTestId("cm-row-autopay_current"))).toContain("+2.5 pp");
    expect(screen.queryByRole("alert")).toBeNull();
    expect(t).toContain("Month over month");
  });

  it("open month is labeled provisional with its ledger date, and data_quality shows as a note", () => {
    cash.state = { data: { available: true, rows: [AUG, SEP, OCT] }, isLoading: false, isError: false };
    const { container } = renderPanel("2026-10");
    const t = text(container);
    expect(t).toContain("Provisional · through Oct 22");
    expect(t).toContain("$50.0k");
    expect(t).toContain("Data quality: consult ledger partial after Oct 20");
  });

  it("a non-zero reconciliation_diff is a visible warning, never a silent number", () => {
    cash.state = { data: { available: true, rows: [AUG, SEP, OCT] }, isLoading: false, isError: false };
    renderPanel("2026-08");
    const alert = screen.getByRole("alert");
    expect(text(alert)).toContain("do not add up");
    expect(text(alert)).toContain("$500.00");
  });

  it("a month the view does not have yet says so instead of showing zeros", () => {
    cash.state = { data: { available: true, rows: [AUG, SEP] }, isLoading: false, isError: false };
    const { container } = renderPanel("2026-10");
    expect(text(container)).toContain("No certified cash month for October 2026");
    expect(screen.queryByTestId("cm-row-autopay_current")).toBeNull();
  });

  it("the AR roll-forward stays reachable on its own tab", () => {
    renderPanel("2026-10");
    expect(screen.queryByText("AR DONUT CONTENT")).toBeNull();
    const tab = screen.getByRole("tab", { name: "AR roll-forward" });
    fireEvent.mouseDown(tab, { button: 0, ctrlKey: false });
    expect(screen.getByText("AR DONUT CONTENT")).toBeInTheDocument();
    expect(within(document.body).getByText("AR roll-forward · test")).toBeInTheDocument();
  });
});
