/**
 * 2026-10-14 finance-source helpers. Fixtures are the live AGGREGATE rows read back from Supabase on 2026-10-14
 * (v_ar_waterfall snapshot periods; no client-level data).
 */
import { describe, it, expect, vi, afterEach } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));

import { invoiceNumberSpellings, invoiceDigitsKey, aggregateArWaterfallByMonth, computeDailyCollections, computeWeeklyPastCollections, computeWeeklyCollections, localDay } from "./useSupabaseData";

describe("invoice number matching (TEXT, never numeric)", () => {
  it("keys on digits only and queries both the bare and '#' spellings", () => {
    const nineteen = "1234567890123456789"; // 19 digits: Number() would round this
    expect(invoiceDigitsKey(`#${nineteen}`)).toBe(nineteen);
    expect(invoiceNumberSpellings([nineteen, `#${nineteen}`, " #12345 "])).toEqual([`#12345`, `#${nineteen}`, "12345", nineteen]);
  });
  it("drops blanks and too-short keys that would over-match", () => {
    expect(invoiceNumberSpellings(["", null, undefined, "#12", "abc"])).toEqual([]);
  });
});

describe("AR roll-forward by month (v_ar_waterfall)", () => {
  const rows = [
    { prior_date: "2026-09-28", period_date: "2026-10-05", beginning: "17476601", additions: "291115", reductions: "135500", ending: "17632216" },
    { prior_date: "2026-10-05", period_date: "2026-10-12", beginning: "17632216", additions: "242085", reductions: "371415", ending: "17502886" },
    { prior_date: "2026-09-21", period_date: "2026-09-28", beginning: "17268621", additions: "291875", reductions: "83895", ending: "17476601" },
  ];
  it("October = first beginning, summed movement, last ending; ties to the 10-12 snapshot", () => {
    const oct = aggregateArWaterfallByMonth(rows).find((m) => m.monthKey === "2026-10")!;
    expect(oct.periods).toBe(2);
    expect(oct.beginning).toBe(17476601);
    expect(oct.additions).toBe(533200);
    expect(oct.reductions).toBe(506915);
    expect(oct.ending).toBe(17502886); // whole-dollar view of $17,502,885.52
    expect(oct.net).toBe(oct.additions - oct.reductions);
    expect(oct.firstSnapshot).toBe("2026-09-28");
    expect(oct.lastSnapshot).toBe("2026-10-12");
  });
  it("orders months ascending", () => {
    expect(aggregateArWaterfallByMonth(rows).map((m) => m.monthKey)).toEqual(["2026-09", "2026-10"]);
  });
});

describe("client-linked payment time buckets (local dates, year-aware weeks)", () => {
  afterEach(() => vi.useRealTimers());
  const pay = (date: string, amount: number) => ({ id: date + amount, clientId: "", clientName: "", amount, date, method: "card" as const, collectorId: "", collectorName: "CRM", status: "completed" as const });
  // Newest first, like payments_clean is fetched; includes the same calendar week one year earlier.
  const rows = [pay("2026-10-14", 100), pay("2026-10-13", 50), pay("2026-10-12", 25), pay("2026-10-09", 10), pay("2025-10-13", 999), pay("2026-01-05", 7)];

  it("parses DATE strings as the local calendar day", () => {
    expect(localDay("2026-10-01")!.getDate()).toBe(1);
    expect(localDay("2026-10-01")!.getMonth()).toBe(9);
    expect(localDay("")).toBeNull();
  });
  it("This Week by Day counts only the current week", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-10-14T15:00:00"));
    const d = Object.fromEntries(computeDailyCollections(rows).map((r) => [r.day, r.total]));
    expect(d).toEqual({ Mon: 25, Tue: 50, Wed: 100, Thu: 0, Fri: 0 }); // 2025-10-13 and 2026-10-09 excluded
  });
  it("weekly series is the most recent weeks, oldest first, without merging years", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-10-14T15:00:00"));
    const w = computeWeeklyPastCollections(rows);
    expect(w[w.length - 1]).toMatchObject({ week: "Oct 12", total: 175 });
    expect(w[w.length - 2]).toMatchObject({ week: "Oct 05", total: 10 });
    expect(w[0]).toMatchObject({ week: "Oct 13", total: 999 }); // 2025 week kept separate, sorted first
    expect(computeWeeklyCollections(rows).at(-1)).toMatchObject({ week: "Oct 12", collected: 175 });
  });
});
