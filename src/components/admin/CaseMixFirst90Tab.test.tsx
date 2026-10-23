/**
 * "First 90 days" tab (Case Mix card, 2026-10-23) -- tie test against v_new_case_sales_cohort_monthly.
 * GRAIN: one row per case OPEN month; counts are cases. Fixture values are read back verbatim from the live view
 * on 2026-10-23 (payments through 2026-10-22; aggregate figures only, no client data):
 *   2026-05  mature  OK              first90 621,727.15  signing 484,300.00  206 cases
 *   2026-06  mature  OK              first90 581,315.00  signing 465,300.00  226 cases
 *   2026-09  OPEN    OK (window closes 2026-12-29)       -> greyed, left out of the total
 *   2026-01  mature  NOT_MEASURABLE                      -> "n/m", never $0, left out of the total
 * Tie: the two mature cohorts sum to first90 1,203,042.15 / signing 949,600.00 / 432 cases
 * (re-derived from the view with SUM(...) WHERE open_month IN ('2026-05-01','2026-06-01')).
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, within, cleanup } from "@testing-library/react";
import type { NewCaseSalesCohortRow } from "@/hooks/useSupabaseData";

const STATUS =
  "PROVISIONAL (cash measurable) - Filevine leg cert 271d8157 (9 overlaps / $12,880 removed) plus Jeff's 2026-10-23 legit-double ruling.";
const base = { all_systems_status: STATUS, payments_through: "2026-10-22" };
const VIEW: NewCaseSalesCohortRow[] = [
  { ...base, open_month: "2026-01-01", first90_cash_net_all_systems: 257585.0, signing_cash_net_by_open_month_all_systems: 174480.0,
    cases_with_first90_cash_all_systems: 128, cohort_mature: true, window_closes_on: "2026-05-01", data_quality_all_systems: "NOT_MEASURABLE" },
  { ...base, open_month: "2026-05-01", first90_cash_net_all_systems: 621727.15, signing_cash_net_by_open_month_all_systems: 484300.0,
    cases_with_first90_cash_all_systems: 206, cohort_mature: true, window_closes_on: "2026-08-29", data_quality_all_systems: "OK" },
  { ...base, open_month: "2026-06-01", first90_cash_net_all_systems: 581315.0, signing_cash_net_by_open_month_all_systems: 465300.0,
    cases_with_first90_cash_all_systems: 226, cohort_mature: true, window_closes_on: "2026-09-28", data_quality_all_systems: "OK" },
  { ...base, open_month: "2026-09-01", first90_cash_net_all_systems: 414993.05, signing_cash_net_by_open_month_all_systems: 364505.0,
    cases_with_first90_cash_all_systems: 170, cohort_mature: false, window_closes_on: "2026-12-29", data_quality_all_systems: "OK" },
];

const hook = vi.hoisted(() => ({ data: [] as unknown[] }));
vi.mock("@/hooks/useSupabaseData", () => ({
  useNewCaseSalesCohortMonthly: () => ({ data: hook.data, isLoading: false, isError: false, refetch: vi.fn() }),
}));

import CaseMixFirst90Tab, { FIRST90_CAPTION, first90Totals, provisionalStatus, toFirst90Rows } from "./CaseMixFirst90Tab";

afterEach(cleanup);

describe("First 90 days tab ties to v_new_case_sales_cohort_monthly", () => {
  it("per-cohort values equal the view, n/m is never $0, and the total ties for 2 mature cohorts", () => {
    const rows = toFirst90Rows(VIEW);
    const may = rows.find((r) => r.openMonth === "2026-05-01")!;
    const jun = rows.find((r) => r.openMonth === "2026-06-01")!;
    expect([may.first90Net, may.signingNet, may.casesWithFirst90]).toEqual([621727.15, 484300.0, 206]);
    expect([jun.first90Net, jun.signingNet, jun.casesWithFirst90]).toEqual([581315.0, 465300.0, 226]);

    const nm = rows.find((r) => r.openMonth === "2026-01-01")!;
    expect([nm.first90Net, nm.signingNet, nm.casesWithFirst90]).toEqual([null, null, null]);

    const t = first90Totals(rows);
    expect(t).toEqual({ cohorts: 2, first90Net: 1203042.15, signingNet: 949600.0, casesWithFirst90: 432 });
    expect(provisionalStatus(VIEW)).toBe(STATUS);
    expect(provisionalStatus(VIEW.map((r) => ({ ...r, all_systems_status: "CERTIFIED" })))).toBeNull();
  });

  it("renders: grain labels, greyed open cohort with its window date, n/m badge, banner, caption, tied footer", () => {
    hook.data = VIEW;
    render(<CaseMixFirst90Tab monthVal="2026-06" />);
    const tab = screen.getByTestId("case-mix-first90");

    expect(within(tab).getByRole("status").textContent).toContain("PROVISIONAL");
    expect(within(tab).getByText(FIRST90_CAPTION)).toBeTruthy();
    expect(within(tab).getByText(/per case open month/)).toBeTruthy();

    const may = screen.getByTestId("first90-row-2026-05");
    expect(may.textContent).toContain("$621,727");
    expect(may.textContent).toContain("$484,300");
    expect(may.textContent).toContain("206 cases");

    const sep = screen.getByTestId("first90-row-2026-09");
    expect(sep.className).toContain("opacity-50");
    expect(sep.textContent).toContain("window closes Dec 29, 2026");

    const jan = screen.getByTestId("first90-row-2026-01");
    expect(jan.textContent).not.toContain("$");
    expect(within(jan).getAllByText("n/m").length).toBeGreaterThanOrEqual(3);

    const total = screen.getByTestId("first90-total");
    expect(total.textContent).toContain("2 closed, measurable cohorts");
    expect(total.textContent).toContain("$1,203,042");
    expect(total.textContent).toContain("$949,600");
    expect(total.textContent).toContain("432 cases");
  });
});
