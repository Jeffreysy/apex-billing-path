/**
 * Gross sales · dollars down (2026-10-23). Fixture = aggregates read back on 2026-10-23 from v_new_case_gross_sales_monthly,
 * the view behind rpc exec_new_case_gross_sales_monthly (the rpc returns 0 rows to non-admin roles, incl. the read-only
 * pooler): Oct partial $792,725 gross / $190,300 paid at signing / 93 cases; Sep $1,409,518.05 / $364,505 / 185 cases;
 * Dec 2025 THIN; Jan 2026 NOT_MEASURABLE. Case Mix (v_exec_case_mix_monthly) read back the same day: Oct $190,300 (ties),
 * Sep $366,205 (does NOT tie: -$1,700) -- the card must say so out loud. Proves n/m, THIN badge, partial, no-access/awaiting states, the shared
 * "Paid at signing" figure with the Case Mix tile, and the Case Mix "First 90 days" link.
 */
import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const g = (m: Record<string, unknown>) => ({
  data_quality: "OK", quality_note: null, distinct_clients: null, avg_contract_value: null, median_contract_value: null,
  sold_cases: null, call_first_cases: null, delete_no_cash_cases: null, awaiting_cases: null, consult_payments: null,
  revenue_cases_per_consult: null, cases_loaded_through: "2026-10-22", payments_through: "2026-10-22", funding_judged_through: "2026-10-15",
  ...m,
});
const GROSS = [
  g({ month: "2025-12-01", month_status: "closed", data_quality: "THIN", quality_note: "Few invoices at signing", revenue_cases: 116,
    gross_contract_value: 938775, signing_cash_net_by_open_month: 156900, signing_cash_pct_of_gross: 16.7,
    sold_contract_value: 937775, call_first_contract_value: 0, delete_no_cash_contract_value: 1000, awaiting_contract_value: 0 }),
  g({ month: "2026-01-01", month_status: "closed", data_quality: "NOT_MEASURABLE", quality_note: "Invoices re-issued Apr 2026", revenue_cases: 145,
    gross_contract_value: 1438265, signing_cash_net_by_open_month: 0, signing_cash_pct_of_gross: 0.0,
    sold_contract_value: 1422915, call_first_contract_value: 0, delete_no_cash_contract_value: 15350, awaiting_contract_value: 0 }),
  g({ month: "2026-09-01", month_status: "closed", revenue_cases: 185, gross_contract_value: 1409518.05, signing_cash_net_by_open_month: 364505,
    signing_cash_pct_of_gross: 25.9, sold_contract_value: 1300318.05, call_first_contract_value: 8500, delete_no_cash_contract_value: 100700,
    awaiting_contract_value: 0 }),
  g({ month: "2026-10-01", month_status: "partial", revenue_cases: 93, gross_contract_value: 792725, signing_cash_net_by_open_month: 190300,
    signing_cash_pct_of_gross: 24.0, sold_contract_value: 707625, call_first_contract_value: 25600, delete_no_cash_contract_value: 59500,
    awaiting_contract_value: 0 }),
];
// Case Mix family rows for October whose paid_at_signing sums to the same $190,300 (two families, all sold).
const cm = (fam: string, cases: number, cv: number, paid: number) => ({
  month: "2026-10-01", reporting_family: fam, family_sort: 1, revenue_cases: cases, contract_value: cv, avg_per_case: cv / cases,
  cases_loaded_through: "2026-10-22", invoices_synced_at: null, refreshed_at: null, paid_at_signing: paid, collected_to_date: paid,
  cases_with_cash: cases, pending_at_signing: 0, failed_at_signing: 0, rejected_at_signing: 0, cases_invoiced_at_signing: cases,
  payments_through: "2026-10-22", sold_cases: cases, sold_contract_value: cv, unfunded_cases: 0, unfunded_contract_value: 0,
  call_first_cases: 0, call_first_contract_value: 0, awaiting_cases: 0, awaiting_contract_value: 0,
});
const CASE_MIX_OCT = [cm("T-Visa Principal", 50, 450000, 120000), cm("Adjustment", 30, 257625, 70300)];

const state = vi.hoisted(() => ({ gross: { available: true, rows: [] as any[] }, caseMix: [] as any[] }));
vi.mock("@/hooks/useSupabaseData", () => {
  const ok = (data: unknown) => ({ data, isLoading: false, isError: false, refetch: vi.fn() });
  return {
    useNewCaseGrossSalesMonthly: () => ok(state.gross),
    useExecCaseMixMonthly: () => ok(state.caseMix),
    useExecCaseMixDetail: () => ok([]),
    useNewCaseSalesCohortMonthly: () => ok([]),
    // Everything else ExecutiveInsights imports (not exercised here).
    fetchAllRows: vi.fn(async () => []),
    useActivityCollectedByCollectorWeekly: () => ({ data: [] }),
    certifiedCollectedByCollector: () => new Map(),
    useFirmFinancialSummary: () => ok(null),
    useArWaterfall: () => ok([]),
    useCertifiedMonthlyCollections: () => ok([]),
    aggregateArWaterfallByMonth: () => [],
    useExecCollectedSplitMonthly: () => ok([]),
    useExecClientBucketDrift: () => ok([]),
    useExecArAtRisk: () => ok(null),
    useExecCollectorActivityMonthly: () => ok([]),
    useExecFailedActivities: () => ok([]),
    useDelinquentCollectionsKpi: () => ok([]),
    useDelinquentCollectionsPlanLoads: () => ok([]),
    useDelinquentCollectionsBasis: () => ok({ certified: false, statuses: {} }),
    useFirmCashMovementMonthly: () => ok({ available: false, rows: [] }),
    useNewCaseSalesCashMonthly: () => ok([]),
  };
});

import GrossSalesCard from "./GrossSalesCard";
import { CaseMixCard } from "./ExecutiveInsights";

beforeAll(() => {
  (globalThis as any).ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} };
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  state.gross = { available: true, rows: GROSS };
  state.caseMix = [];
});
state.gross = { available: true, rows: GROSS };

const text = (el: Element) => (el.textContent || "").replace(/\s+/g, " ").trim();
const wrap = (ui: React.ReactNode) =>
  render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>{ui}</QueryClientProvider>);

describe("Gross sales · dollars down", () => {
  it("October (open): paid at signing is the hero, partial · through Oct 22, gross, % and cases", () => {
    wrap(<GrossSalesCard monthVal="2026-10" />);
    const h = text(screen.getByTestId("gross-headline"));
    expect(h).toContain("Paid at signing");
    expect(h).toContain("partial · through Oct 22");
    expect(text(screen.getByTestId("gross-paid-at-signing"))).toBe("$190.3k");
    expect(h).toContain("24.0% of $792.7k gross sold · 93 new cases");
    expect(text(screen.getByTestId("gross-piles"))).toBe("Sold $707.6k · Call first $25.6k · No cash (delete) $59.5k · Awaiting $0");
    expect(text(document.body)).toContain("by case open month");
    expect(text(document.body)).not.toMatch(/clients?\b/i);
  });

  it("September (closed): no partial tag; $364.5k = 25.9% of $1.41M; 185 cases", () => {
    wrap(<GrossSalesCard monthVal="2026-09" />);
    const h = text(screen.getByTestId("gross-headline"));
    expect(h).not.toContain("partial");
    expect(text(screen.getByTestId("gross-paid-at-signing"))).toBe("$364.5k");
    expect(h).toContain("25.9% of $1.41M gross sold · 185 new cases");
    expect(screen.queryByTestId("gross-casemix-mismatch")).toBeNull(); // no Case Mix rows loaded -> no cross-check
  });

  it("Sep: when Case Mix shows a different paid-at-signing ($366,205 vs $364,505) the card says so, never silently", () => {
    state.caseMix = [{ ...CASE_MIX_OCT[0], month: "2026-09-01", paid_at_signing: 366205 }];
    wrap(<GrossSalesCard monthVal="2026-09" />);
    const m = text(screen.getByTestId("gross-casemix-mismatch"));
    expect(m).toContain("Case Mix shows $366.2k paid at signing for September 2026");
    expect(m).toContain("−$1.7k here");
  });

  it("NOT_MEASURABLE (Jan 2026) renders n/m, never $0 or the raw figure", () => {
    wrap(<GrossSalesCard monthVal="2026-01" />);
    expect(text(screen.getByTestId("gross-paid-at-signing"))).toBe("n/m");
    const h = text(screen.getByTestId("gross-headline"));
    expect(h).toContain("n/m of $1.44M gross sold");
    expect(h).not.toMatch(/\$0\b/);
    expect(text(screen.getByTestId("gross-quality-badge"))).toBe("not measurable");
  });

  it("THIN (Dec 2025) shows the value with a thin badge and its note on hover", () => {
    wrap(<GrossSalesCard monthVal="2025-12" />);
    expect(text(screen.getByTestId("gross-paid-at-signing"))).toBe("$156.9k");
    const b = screen.getByTestId("gross-quality-badge");
    expect(text(b)).toBe("thin");
    expect(b).toHaveAttribute("title", "Few invoices at signing");
  });

  it("0 rows (not admin/partner) -> no access; rpc not applied -> awaiting; never zeros", () => {
    state.gross = { available: true, rows: [] };
    wrap(<GrossSalesCard monthVal="2026-10" />);
    expect(text(document.body)).toContain("No access");
    expect(text(document.body)).not.toMatch(/\$\d/);
    cleanup();
    state.gross = { available: false, rows: [] };
    wrap(<GrossSalesCard monthVal="2026-10" />);
    expect(text(document.body)).toContain("Awaiting certified data");
    expect(text(document.body)).not.toMatch(/\$\d/);
  });

  it("same number: Gross sales and Case Mix both show 'Paid at signing' $190.3k for October from the same data", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-10-23T12:00:00"));
    state.caseMix = CASE_MIX_OCT;
    wrap(
      <>
        <CaseMixCard monthVal="2026-10" />
        <GrossSalesCard monthVal="2026-10" />
      </>,
    );
    const caseMix = text(screen.getByTestId("casemix-paid-at-signing"));
    const gross = text(screen.getByTestId("gross-paid-at-signing"));
    expect(caseMix).toBe("$190.3k");
    expect(gross).toBe(caseMix);
    expect(screen.getAllByText(/Paid at signing/).length).toBeGreaterThanOrEqual(2);
    expect(screen.queryByText(/hit the bank at signing/)).toBeNull();
    expect(screen.queryByTestId("gross-casemix-mismatch")).toBeNull(); // Oct ties (read back: $190,300 both)
  });

  it("Case Mix 'First 90 days' link opens the breakdown dialog on the First 90 days tab", () => {
    state.caseMix = CASE_MIX_OCT;
    wrap(<CaseMixCard monthVal="2026-10" />);
    fireEvent.click(screen.getByRole("button", { name: "First 90 days" }));
    expect(screen.getByRole("tab", { name: "First 90 days" })).toHaveAttribute("aria-selected", "true");
  });
});
