/**
 * Delinquent Collections key-metric panel — tie + render proof.
 *
 * The hook is mocked with rows read back from v_delinquent_collections_kpi; the fixture also carries an
 * INDEPENDENT re-derivation straight from the spine (mv_delinquent_cash_txn / v_delinquent_cash_monthly).
 * The tests prove (1) the cached KPI rows tie to the spine exactly, and (2) the panel renders exactly those
 * values, with the cutoff date and grain on screen. Fixture: ./__fixtures__/delinquentCollections.20261014.ts
 */
import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { rows, planLoads, spine } from "./__fixtures__/delinquentCollections.20261014";
import { normalizeDcmRow, normalizePlanLoadRow, selectDcmView, pctChange, rangeLabel, dayLabel } from "@/lib/delinquentCollections";

vi.mock("@/hooks/useSupabaseData", async () => {
  const f = await import("./__fixtures__/delinquentCollections.20261014");
  const lib = await import("@/lib/delinquentCollections");
  return {
    useDelinquentCollectionsKpi: () => ({ data: f.rows.map(lib.normalizeDcmRow), isLoading: false, isError: false, refetch: vi.fn() }),
    useDelinquentCollectionsBasis: () => ({ data: { certified: false, statuses: {} }, isLoading: false }),
    useDelinquentCollectionsPlanLoads: () => ({ data: f.planLoads.map(lib.normalizePlanLoadRow), isLoading: false, isError: false }),
  };
});

import DelinquentCollectionsPanel from "./DelinquentCollectionsPanel";

beforeAll(() => {
  (globalThis as any).ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} };
});
afterEach(() => cleanup());

const view = selectDcmView(rows.map(normalizeDcmRow))!;
const usd = (n: number) => `$${Math.round(n).toLocaleString()}`;

describe("v_delinquent_collections_kpi ties to the delinquent-cash spine", () => {
  for (const key of ["mtd", "mtd_prior"] as const) {
    it(`${key} window ties exactly`, () => {
      const r = key === "mtd" ? view.mtd : view.prior;
      const s = spine[key];
      expect(r.period_start).toBe(s.period_start);
      expect(r.period_end).toBe(s.period_end);
      expect(r.delinquent_manual_cash).toBe(s.delinquent_manual_cash);
      expect(r.delinquent_autopay_cash).toBe(s.delinquent_autopay_cash);
      expect(r.delinquent_manual_31plus_cash).toBe(s.delinquent_manual_31plus_cash);
      expect(r.n_delinquent_manual_txns).toBe(s.n_delinquent_manual_txns);
      expect(r.willing_payers).toBe(s.willing_payers);
      expect(r.willing_payers_manual).toBe(s.willing_payers_manual);
      expect(r.unresolved_pct).toBe(s.unresolved_pct);
    });
  }

  it("closed months tie to v_delinquent_cash_monthly", () => {
    expect(spine.closed_months.length).toBeGreaterThan(0);
    for (const m of spine.closed_months) {
      const r = view.months.find((x) => x.period_start === m.month);
      expect(r, m.month).toBeDefined();
      expect(r!.is_partial).toBe(false);
      expect(r!.delinquent_manual_cash).toBe(m.delinquent_manual_cash);
      expect(r!.delinquent_manual_31plus_cash).toBe(m.delinquent_manual_31plus_cash);
      expect(r!.willing_payers).toBe(m.willing_payers);
    }
  });

  it("MTD never runs past the ledger's complete-through day, and the comparison covers the same day range", () => {
    expect(view.mtd.period_end).toBe(view.mtd.complete_through);
    const day = (iso: string) => Number(iso.slice(8, 10));
    expect(day(view.prior.period_start)).toBe(1);
    expect(day(view.prior.period_end)).toBe(day(view.mtd.period_end));
    if (view.mtd.ledger_max_txn_date) expect(view.mtd.complete_through <= view.mtd.ledger_max_txn_date).toBe(true);
  });

  it("new-payer splits add up and resumed payers stay inside willing payers", () => {
    for (const r of [view.mtd, view.prior]) {
      expect(r.payer_metrics_valid).toBe(true);
      expect((r.resumed_payers_manual ?? 0) + (r.resumed_payers_automatic ?? 0)).toBe(r.resumed_payers);
      expect(r.resumed_payers!).toBeLessThanOrEqual(r.willing_payers);
      expect(r.intake_payers_consult_size + r.intake_payers_retainer_size).toBe(r.intake_payers);
      expect(r.intake_payers_on_ar_now).toBeLessThanOrEqual(r.intake_payers);
    }
    const b = view.mtd;
    expect(b.failed_draft_plans + b.failed_before_due_only_plans + b.no_failed_draft_plans).toBe(b.broken_autodraft_plans);
    for (const l of planLoads.map(normalizePlanLoadRow)) {
      expect(l.new_plans_autopay + l.new_plans_manual + l.new_plans_autopay_unknown).toBe(l.new_plans);
    }
  });
});

describe("DelinquentCollectionsPanel renders the tied values", () => {
  it("shows the window, the cutoff, and the spine figures", () => {
    render(<DelinquentCollectionsPanel />);
    const panel = screen.getByTestId("delinquent-collections-panel");
    const text = (panel.textContent || "").replace(/\s+/g, " ");
    console.log(`[panel] ${text.slice(0, 900)}`);

    const win = screen.getByTestId("dcm-window").textContent || "";
    expect(win).toContain(rangeLabel(spine.mtd.period_start, spine.mtd.period_end));
    expect(win).toContain(rangeLabel(spine.mtd_prior.period_start, spine.mtd_prior.period_end));
    expect(win).toContain(`ledger complete through ${dayLabel(view.mtd.complete_through)}`);

    expect(screen.getByTestId("dcm-manual").textContent).toBe(usd(spine.mtd.delinquent_manual_cash));
    const cash = screen.getByTestId("dcm-cash").textContent || "";
    expect(cash).toContain(usd(spine.mtd_prior.delinquent_manual_cash));
    expect(cash).toContain(usd(spine.mtd.delinquent_manual_31plus_cash));
    expect(cash).toContain(usd(spine.mtd_prior.delinquent_manual_31plus_cash));
    expect(cash).toContain(`${spine.mtd.n_delinquent_manual_txns} payments`);

    expect(screen.getByTestId("dcm-willing-manual").textContent).toBe(spine.mtd.willing_payers_manual.toLocaleString());
    const willing = screen.getByTestId("dcm-willing").textContent || "";
    expect(willing).toContain(spine.mtd_prior.willing_payers_manual.toLocaleString());
    expect(willing).toContain(spine.mtd.willing_payers.toLocaleString());
    const broken = screen.getByTestId("dcm-broken-autodraft").textContent || "";
    expect(broken).toContain(`${view.mtd.broken_autodraft_clients.toLocaleString()} clients`);
    expect(broken).toContain(String(view.mtd.failed_draft_plans));
    expect(broken).toContain(String(view.mtd.no_failed_draft_plans));

    expect(screen.getByTestId("dcm-resumed").textContent).toBe(String(view.mtd.resumed_payers));
    expect(screen.getByTestId("dcm-intake").textContent).toBe(String(view.mtd.intake_payers));
    const plans = screen.getByTestId("dcm-new-plans").textContent || "";
    for (const l of planLoads) expect(plans).toContain(dayLabel(String(l.load_as_of)));

    expect(screen.getByTestId("dcm-basis").textContent).toBe("derived · spine certification pending");
    const q = screen.getByTestId("dcm-quality").textContent || "";
    expect(q).toContain(`${spine.mtd.unresolved_pct}%`);
    expect(q).toContain(`ledger complete through ${dayLabel(view.mtd.complete_through)}`);
  });

  it("has a table view for the trend (relief for the low-contrast series)", () => {
    render(<DelinquentCollectionsPanel />);
    fireEvent.click(screen.getByText("Show table"));
    const table = screen.getByTestId("dcm-trend-table").textContent || "";
    for (const m of spine.closed_months) expect(table).toContain(usd(m.delinquent_manual_cash));
  });
});

describe("helpers", () => {
  it("formats ranges without timezone drift", () => {
    expect(rangeLabel("2026-10-01", "2026-10-12")).toBe("Oct 1–12");
    expect(rangeLabel("2026-09-29", "2026-10-05")).toBe("Sep 29–Oct 5");
    expect(dayLabel("2026-10-12")).toBe("Oct 12");
  });
  it("percent change has no base when the prior value is 0 or missing", () => {
    expect(pctChange(105290, 133330)).toBe(-21);
    expect(pctChange(5, 0)).toBeNull();
    expect(pctChange(null, 3)).toBeNull();
  });
  it("returns null (never a fabricated figure) when the MTD rows are missing", () => {
    expect(selectDcmView([])).toBeNull();
    expect(selectDcmView(rows.filter((r) => r.period_kind !== "mtd").map(normalizeDcmRow))).toBeNull();
  });
});
