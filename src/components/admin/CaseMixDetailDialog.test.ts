import { describe, expect, it } from "vitest";
import { caseMixCsv } from "./CaseMixDetailDialog";

const row = {
  month: "2026-10-01", reporting_family: "T-Visa Principal", funding_status: "unfunded", sold_basis: null,
  open_date: "2026-10-02", mycase_case_id: "51081010", case_number: "26-4001-TVISA", case_name: "DOE, Jane, \"T\"",
  client_id: "00000000-0000-0000-0000-000000000000", client_name: "Jane Doe", invoice_number: "2111000000020002129",
  mycase_invoice_id: "49930868", invoice_amount: 13000, invoice_paid_at_signing: 0, invoice_collected_to_date: 0,
  invoice_pending_usd: 0, invoice_failed_usd: 0, invoice_bounced_usd: 0, case_contract_value: 13000,
  case_collected_to_date: 0, last_attempt_date: null, payments_through: "2026-10-13", funding_judged_through: "2026-10-06",
};

describe("Case Mix CSV export", () => {
  it("keeps 19-digit invoice numbers as text for Excel and labels the pile", () => {
    const csv = caseMixCsv([row]);
    expect(csv.startsWith("﻿Status,Case type")).toBe(true);
    expect(csv).toContain('="2111000000020002129"');       // never rounded to 2.111E+18
    expect(csv).toContain("Delete,T-Visa Principal");
    expect(csv).toContain('"DOE, Jane, ""T"""');            // commas/quotes escaped
    expect(csv).toContain("13000.00");
  });
});
