/**
 * Render proof (2026-10-14): Finance → "Collections vs AR Movement" reads CERTIFIED cash and the AR snapshot
 * roll-forward, not payments_clean. Fixture = live aggregates read back from Supabase on 2026-10-14:
 * mv_collections_certified_monthly (Nov 2025 – Oct 2026 MTD) and v_ar_waterfall grouped by month. No client data.
 */
import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

const CERT = [
  ["2025-11", 2153232.07, 298162], ["2025-12", 1660205.07, 225023], ["2026-01", 1578465.55, 103467],
  ["2026-02", 1081901.73, 130766], ["2026-03", 1262621.15, 347755.1], ["2026-04", 1768414.95, 406975],
  ["2026-05", 1886895.9, 409794], ["2026-06", 1892372.53, 440960], ["2026-07", 1768833.95, 500765],
  ["2026-08", 1638264.93, 498840], ["2026-09", 1415768.08, 313720], ["2026-10", 296155, 104829],
] as const;
// [month-end period_date, beginning, additions, reductions, ending] — one row per month (aggregated periods)
const WF = [
  ["2025-11-04", 23095619, 1141635, 1636823, 22600431], ["2025-12-15", 22600431, 1555457, 2210727, 21945161],
  ["2026-01-06", 21945161, 19695322, 20474472, 21166011], ["2026-02-16", 21166011, 18122771, 19858364, 19430418],
  ["2026-03-03", 19430418, 830, 374030, 19057218], ["2026-04-30", 19057218, 4635235, 3880378, 19812075],
  ["2026-05-26", 19812075, 2172826, 2381003, 19603899], ["2026-06-30", 19603899, 2189395, 2715773, 19077521],
  ["2026-07-27", 19077521, 881973, 1856865, 18102630], ["2026-08-31", 18102630, 1026195, 1680981, 17447843],
  ["2026-09-28", 17447843, 981382, 952624, 17476601], ["2026-10-12", 17476601, 533200, 506915, 17502886],
] as const;

const wf = vi.hoisted(() => ({ fail: false }));

vi.mock("@/hooks/useSupabaseData", async () => {
  const actual = await vi.importActual<any>("@/hooks/useSupabaseData");
  return {
    aggregateArWaterfallByMonth: actual.aggregateArWaterfallByMonth,
    useCertifiedMonthlyCollections: () => ({
      isLoading: false,
      data: CERT.map(([k, t, d]) => ({
        monthKey: k, month: k, total: Math.round(t), totalExact: t, delinquent: Math.round(d), onPlan: Math.round(t - d), from180: 0, autopayEnrolled: 0, basis: "",
      })),
    }),
    useArWaterfall: () => wf.fail ? ({ isLoading: false, isError: true, data: undefined }) : ({
      isLoading: false,
      isError: false,
      data: WF.map(([pd, b, a, r, e]) => ({ prior_date: null, period_date: pd, beginning: b, additions: a, reductions: r, ending: e })),
    }),
    useFirmFinancialSummary: () => ({ data: { ar_total: 17502885.52, as_of: "2026-10-12", open_invoices: 3924 } }),
  };
});
vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));

import ARGrowthVsCollectionsChart from "./ARGrowthVsCollectionsChart";

afterEach(() => cleanup());
beforeAll(() => {
  (globalThis as any).ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} };
});

describe("Collections vs AR Movement (Finance overview)", () => {
  it("shows certified cash and the snapshot roll-forward, tied to the 10-12 book", () => {
    render(<ARGrowthVsCollectionsChart />);
    const text = document.body.textContent || "";
    console.log(`[2026-10-14] TILES: ${text.replace(/\s+/g, " ").slice(0, 400)}`);
    expect(screen.getByText("Collected (certified)")).toBeInTheDocument();
    expect(text).toContain("$18,403,131"); // Σ real_cash_total Nov-25..Oct-26 MTD = $18,403,130.91
    expect(text).toContain("-$5,592,733"); // 17,502,886 (10-12) − 23,095,619 (Nov-25 beginning)
    expect(text).toContain("$17,502,886"); // certified Total AR $17,502,885.52
    expect(text).toContain("3,924 invoices");
    expect(text).toContain("$1,646,089"); // avg of the 11 closed months
    expect(text).not.toContain("AR Growth Rate");
  });

  it("live 10-14: when the snapshot waterfall fails (HTTP 500), cash still renders and the AR tile says unavailable", () => {
    wf.fail = true;
    render(<ARGrowthVsCollectionsChart />);
    const text = document.body.textContent || "";
    expect(text).toContain("$18,403,131");
    expect(text).toContain("AR roll-forward unavailable right now");
    expect(text).not.toContain("-$5,592,733");
    wf.fail = false;
  });
});
