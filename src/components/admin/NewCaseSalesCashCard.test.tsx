/**
 * New-case sales cash (collected) card -- rows are the aggregate figures read back from
 * public.v_new_case_sales_cash_monthly on 2026-10-23 (Oct partial through 10-22, Sep closed, Jan 2026 NOT_MEASURABLE,
 * Feb 2026 THIN with the Filevine leg). Proves: n/m (never $0), the PROVISIONAL banner shown verbatim and hidden at
 * FINAL, the partial month, cases-not-clients wording, the quality badge + note, and the Filevine tooltip fields.
 */
import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

const STATUS =
  "PROVISIONAL (cash measurable) - Filevine leg cert 271d8157 (9 overlaps / $12,880 removed) - do not publish as final.";
const base = (m: Record<string, unknown>) => ({
  payments_through: "2026-10-22",
  quality_note_all_systems: "No Filevine-leg cash this month: same as data_quality.",
  all_systems_status: STATUS,
  filevine_signing_cash: null,
  mycase_signing_keyed_by_filevine_added: null,
  ...m,
});
const ROWS = [
  base({ month: "2026-01-01", month_status: "closed", signing_cash_net_all_systems: 172480, certified_cash_all_systems: 1955304.55,
    signing_pct_of_certified_all_systems: 8.8, signing_cases_paid_all_systems: 65, cases_opened: 261, data_quality_all_systems: "NOT_MEASURABLE",
    quality_note_all_systems: "Filevine-era month: MyCase leg + certified Filevine leg", filevine_signing_cash: 46780, mycase_signing_keyed_by_filevine_added: 127700 }),
  base({ month: "2026-02-01", month_status: "closed", signing_cash_net_all_systems: 425050, certified_cash_all_systems: 1805760.16,
    signing_pct_of_certified_all_systems: 23.5, signing_cases_paid_all_systems: 175, cases_opened: 264, data_quality_all_systems: "THIN",
    quality_note_all_systems: "Filevine-era month: MyCase leg + certified Filevine leg", filevine_signing_cash: 405550, mycase_signing_keyed_by_filevine_added: 19500 }),
  base({ month: "2026-09-01", month_status: "closed", signing_cash_net_all_systems: 376205, certified_cash_all_systems: 1380828.08,
    signing_pct_of_certified_all_systems: 27.2, signing_cases_paid_all_systems: 171, cases_opened: 201, data_quality_all_systems: "OK" }),
  base({ month: "2026-10-01", month_status: "partial", signing_cash_net_all_systems: 189300, certified_cash_all_systems: 1095752.48,
    signing_pct_of_certified_all_systems: 17.3, signing_cases_paid_all_systems: 84, cases_opened: 114, data_quality_all_systems: "OK" }),
];

const state = vi.hoisted(() => ({ rows: [] as any[] }));
vi.mock("@/hooks/useSupabaseData", () => ({
  useNewCaseSalesCashMonthly: () => ({ data: state.rows, isLoading: false, isError: false, refetch: vi.fn() }),
}));

import NewCaseSalesCashCard from "./NewCaseSalesCashCard";

beforeAll(() => {
  (globalThis as any).ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} };
});
afterEach(() => {
  cleanup();
  state.rows = ROWS;
});
state.rows = ROWS;

const text = (el: Element) => (el.textContent || "").replace(/\s+/g, " ").trim();
const renderAt = (monthVal: string) => render(<NewCaseSalesCashCard monthVal={monthVal} />);

describe("New-case sales cash card", () => {
  it("October: partial month, complete through Oct 22, $189.3k = 17.3% of $1.10M, counts in cases", () => {
    const { container } = renderAt("2026-10");
    const h = text(screen.getByTestId("ncs-headline"));
    expect(h).toContain("partial");
    expect(h).toContain("$189.3k");
    expect(h).toContain("17.3% of certified cash $1.10M");
    expect(h).toContain("84 cases paid at signing · 114 cases opened");
    expect(h).toContain("Complete through Oct 22, 2026");
    expect(text(container)).toContain("per cash month · payments summed");
    expect(text(container)).not.toMatch(/clients?\b/i);
  });

  it("September: closed (no partial tag), $376.2k = 27.2% of $1.38M", () => {
    renderAt("2026-09");
    const h = text(screen.getByTestId("ncs-headline"));
    expect(h).not.toContain("partial");
    expect(h).toContain("$376.2k");
    expect(h).toContain("27.2% of certified cash $1.38M");
    expect(h).toContain("171 cases paid at signing · 201 cases opened");
    expect(text(screen.getByTestId("ncs-quality-badge"))).toBe("OK");
  });

  it("Jan 2026 NOT_MEASURABLE renders n/m, never $0 or the raw figure", () => {
    renderAt("2026-01");
    const h = text(screen.getByTestId("ncs-headline"));
    expect(h).toContain("n/m");
    expect(h).toContain("n/m of certified cash");
    expect(h).not.toContain("$172.5k");
    expect(h).not.toMatch(/\$0\b/);
    const badge = screen.getByTestId("ncs-quality-badge");
    expect(text(badge)).toBe("NOT MEASURABLE");
    expect(badge).toHaveAttribute("title", "Filevine-era month: MyCase leg + certified Filevine leg");
  });

  it("shows all_systems_status verbatim while PROVISIONAL, and hides it once FINAL", () => {
    renderAt("2026-10");
    expect(text(screen.getByTestId("ncs-status-banner"))).toBe(STATUS);
    cleanup();
    state.rows = ROWS.map((r) => ({ ...r, all_systems_status: "FINAL - certified" }));
    renderAt("2026-10");
    expect(screen.queryByTestId("ncs-status-banner")).toBeNull();
  });

  it("carries the basis note and the small print", () => {
    const { container } = renderAt("2026-10");
    const t = text(container);
    expect(t).toContain("All-systems basis: incl. Filevine Dec 2025–Apr 2026");
    expect(t).toContain("MyCase certified basis");
    expect(t).toContain(
      "Paid on a new case's own invoices from 3 days before to 7 days after the case opened, net of refunds; operating only; excludes consults and trust. Filevine Dec 2025–Apr 2026 included.",
    );
  });
});
