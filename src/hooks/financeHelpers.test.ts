/**
 * 2026-10-14 finance-source helpers. Fixtures are the live AGGREGATE rows read back from Supabase on 2026-10-14
 * (v_ar_waterfall snapshot periods; no client-level data).
 */
import { describe, it, expect, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));

import { invoiceNumberSpellings, invoiceDigitsKey, aggregateArWaterfallByMonth } from "./useSupabaseData";

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
