/**
 * Executive Insights hero band (2026-10-13) — render proof for the Collected (clients / non-clients),
 * Drift and Case Mix tiles. The hooks are mocked with the AGGREGATE figures the three views return
 * (read back from Supabase on 2026-10-13; no client-level data), so the test proves the tiles render
 * and tie to the book for October (current, partial month) and September (closed month).
 * Fixture: ./__fixtures__/execInsightsHero.20261013.ts
 */
import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, within, cleanup } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const legacy = vi.hoisted(() => ({ hang: false }));

vi.mock("@/hooks/useSupabaseData", async () => {
  const f = await import("./__fixtures__/execInsightsHero.20261013");
  const ok = (data: unknown) => ({ data, isLoading: false, isError: false, refetch: vi.fn() });
  return {
    // Legacy browser-side pull: resolves empty by default; a test can make it hang.
    fetchAllRows: vi.fn(async () => (legacy.hang ? new Promise(() => {}) : [])),
    useActivityCollectedByCollectorWeekly: () => ({ data: [] }),
    certifiedCollectedByCollector: () => new Map(),
    useFirmFinancialSummary: () => ok(f.firmSummary),
    useExecCollectedSplitMonthly: () => ok(f.collected),
    useExecClientBucketDrift: () => ok(f.drift),
    useExecCaseMixMonthly: () => ok(f.caseMix),
    useExecArAtRisk: () => ok(f.arAtRisk),
  };
});

import ExecutiveInsights from "./ExecutiveInsights";

beforeAll(() => {
  // Recharts' ResponsiveContainer needs ResizeObserver, which jsdom does not ship.
  (globalThis as any).ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} };
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  legacy.hang = false;
});

async function renderAt(isoDate: string) {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(isoDate));
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={qc}>
      <ExecutiveInsights />
    </QueryClientProvider>,
  );
  const hero = await screen.findByText((_, el) => el?.id === "hero");
  const text = (el: HTMLElement) => (el.textContent || "").replace(/\s+/g, " ").trim();
  const caseMixCard = screen.getByText("Case Mix").closest("div.rounded-2xl") as HTMLElement;
  // Read-back for the report (aggregate figures only).
  console.log(`[${isoDate.slice(0, 10)}] HERO: ${text(hero)}`);
  console.log(`[${isoDate.slice(0, 10)}] CASE MIX: ${text(caseMixCard)}`);
  return { hero, caseMixCard, text };
}

describe("Executive Insights hero band", () => {
  it("October (current, partial month) ties to the ledger, snapshots and case feed", async () => {
    const { hero, caseMixCard, text } = await renderAt("2026-10-13T15:00:00");
    const h = text(hero);
    expect(h).toContain("Collected · Oct");
    expect(h).toContain("$257.7k");
    expect(h).toContain("Clients $221.7k · Consults $35.9k");
    expect(h).toContain("vs Sep 1–11 · ledger thru Oct 11");
    expect(within(hero).getByText("19.3%")).toBeInTheDocument(); // 257,671 vs 319,463.05 MTD
    expect(h).toMatch(/114\s*worse\s*·\s*86\s*recovered/);
    expect(h).toContain("since Sep 28 · 81 new · 98 left");
    expect(h).not.toContain("Weighted DSO");
    const c = text(caseMixCard);
    expect(c).toContain("$52.4k");
    expect(c).toContain("4 revenue cases");
    expect(c).toContain("Cases loaded through Oct 2, 2026");
    expect(c).toContain("partial month");
    expect(screen.queryByText("Net AR Change")).toBeNull();
  });

  it("September (closed month) ties to the ledger, snapshots and case feed", async () => {
    const { hero, caseMixCard, text } = await renderAt("2026-09-15T15:00:00");
    const h = text(hero);
    expect(h).toContain("Collected · Sep");
    expect(h).toContain("$1.40M");
    expect(h).toContain("Clients $1.31M · Consults $91.9k");
    expect(h).toContain("vs Aug");
    expect(within(hero).getByText("14.5%")).toBeInTheDocument(); // 1,399,461 vs 1,637,129
    expect(h).toMatch(/609\s*worse\s*·\s*55\s*recovered/);
    expect(h).toContain("since Aug 31 · 158 new · 218 left");
    const c = text(caseMixCard);
    expect(c).toContain("$1.41M");
    expect(c).toContain("185 revenue cases");
    expect(c).toContain("T-Visa Principal$904.1k");
    expect(c).toContain("Total · 185 cases$1.41M");
    expect(c).not.toContain("partial month");
  });

  it("the hero band and Case Mix render while the legacy browser-side pull is still pending", async () => {
    legacy.hang = true;
    const { hero, caseMixCard, text } = await renderAt("2026-10-13T15:00:00");
    const h = text(hero);
    expect(h).toContain("Total AR$17.50M");
    expect(h).toContain("AR at Risk$8.99M");
    expect(h).toContain("60+ days past due · 51.3% of AR");
    expect(h).toContain("$257.7k");
    expect(h).toMatch(/114\s*worse/);
    expect(text(caseMixCard)).toContain("$52.4k");
    expect(screen.getAllByText("Loading detail…").length).toBe(2); // Money Flow + legacy sections
    expect(screen.queryByText("Loading executive insights…")).toBeNull();
  });

  it("a closed month with partial consult coverage shows no client split (Feb 2026: consult ledger from Feb 17)", async () => {
    const { hero, text } = await renderAt("2026-02-20T15:00:00");
    const h = text(hero);
    expect(h).toContain("$1.23M");
    expect(h).toContain("Clients — · Consults $14.6k (partial)");
  });
});
