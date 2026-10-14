/**
 * Client Lookup (2026-10-13): no bulk preloads; ?clientId=<contract> opens an AR client and ?client=<client_id> opens
 * ANY client (no open AR) without erroring; payments come from the certified ledger; sections show feed freshness.
 * All values are synthetic test data.
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const h = vi.hoisted(() => ({ contractAsked: [] as (string | null)[], cardAsked: [] as (string | null)[] }));

vi.mock("@/components/DashboardLayout", () => ({ default: ({ children }: any) => <main>{children}</main> }));
vi.mock("@/components/TakePaymentDialog", () => ({ default: () => null }));
vi.mock("@/components/CallDocumentationDialog", () => ({ default: () => null }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { rpc: vi.fn(async () => ({ data: [] })) } }));

vi.mock("@/hooks/useSupabaseData", () => {
  const ok = (data: unknown) => ({ data, isLoading: false, isFetching: false });
  const bulk = () => {
    throw new Error("Client Lookup must not preload bulk data");
  };
  const cardBase = { email: "", phone: "", qualityStatus: "active_legal_client", collector: "Test Collector", mycaseCases: 1, latestCaseStage: "Filed", offDial: false, refreshedAt: "2026-10-13T12:00:00Z" };
  return {
    CLIENT_STATUS_LABEL: {
      open_ar: "Open AR", open_ar_unlinked: "Open AR · no client link", paid_off: "Has paid · no open AR", closed: "Closed",
      consult_only: "Consult only", no_open_ar: "No open AR", excluded: "Excluded (test)",
    },
    useMergedClients: bulk,
    usePaymentsData: bulk,
    useImmigrationCases: bulk,
    useCaseMilestones: bulk,
    useCollectors: bulk,
    useClientMasterSearch: () => ok([]),
    useClientMasterCard: (id: string | null) => {
      h.cardAsked.push(id);
      if (id === "cl-1") return ok({ ...cardBase, rowKey: "client:cl-1", clientId: "cl-1", name: "Test Person", caseNumber: "TV-1", openAr: 4000, openContracts: 1, bestContractId: "c-1", ledgerPayments: 2, lastPaymentDate: "2026-09-01", status: "open_ar" });
      if (id === "cl-2") return ok({ ...cardBase, rowKey: "client:cl-2", clientId: "cl-2", name: "Paid Person", caseNumber: "TV-2", openAr: 0, openContracts: 0, bestContractId: null, ledgerPayments: 5, lastPaymentDate: "2026-07-01", status: "paid_off" });
      return ok(null);
    },
    useArDashboardContract: (id: string | null) => {
      h.contractAsked.push(id);
      return ok(
        id === "c-1"
          ? {
              id: "c-1", clientId: "cl-1", name: "Test Person", email: "", phone: "", contractStart: "2026-01-01", contractEnd: "",
              totalOwed: 5000, totalPaid: 1000, monthlyPayment: 250, downPayment: 500, installmentMonths: 18, status: "active",
              assignedCollector: "Test Collector", lastContact: "", nextPaymentDue: "", caseNumber: "TV-1", caseType: "T-Visa",
              caseStage: "intake", daysAging: 0, retainerDate: "", downPaymentPaid: true,
            }
          : null,
      );
    },
    useClientLedger: (clientId: string | null) => ok(
      clientId === "cl-2"
        ? [{ id: "t9", date: "2026-07-01", amount: 300, status: "Completed", method: "Card", invoiceNumber: "9", enteredBy: null }]
        : [
            { id: "t1", date: "2026-09-01", amount: 500, status: "Completed", method: "Card", invoiceNumber: "1", enteredBy: null },
            { id: "t2", date: "2026-08-01", amount: 500, status: "Completed", method: "Card", invoiceNumber: "1", enteredBy: null },
          ],
    ),
    useClientImmigrationCases: () => ok([]),
    useCaseMilestonesFor: () => ok([]),
    useClientActivityHistory: () => ok([]),
    useMyCaseClient360: () => ok(null),
    useFeedFreshness: () => ok({
      feeds: { transactions_rich: { feed: "transactions_rich", sourceTable: "mycase_transactions_rich", asOf: "2026-10-13T00:00:00Z", ageDays: 0, status: "GREEN", isRed: false } },
      arSnapshotDate: "2026-10-12",
      activity: { asOf: "2026-09-15", ageDays: 28, status: "ALERT" },
    }),
  };
});

import ClientLookup from "./ClientLookup";

const renderAt = (url: string) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter initialEntries={[url]}>
        <ClientLookup />
      </MemoryRouter>
    </QueryClientProvider>,
  );

describe("Client Lookup", () => {
  it("opens an AR client from the contract deep link, with ledger payments and freshness", async () => {
    renderAt("/clients?clientId=c-1");
    expect(await screen.findByText("Test Person")).toBeInTheDocument();
    expect(h.contractAsked).toContain("c-1");
    expect(h.cardAsked).toContain("cl-1");
    expect(screen.getByText("Payment History (2)")).toBeInTheDocument();
    expect(screen.getByText("Contract Breakdown")).toBeInTheDocument();
    expect(screen.getByText(/Certified cash ledger \(MyCase rich payment feed\) · data as of 2026-10-13/)).toBeInTheDocument();
    expect(screen.getByText(/Collector activity log · data as of 2026-09-15 · stale feed/)).toBeInTheDocument();
  });

  it("opens a client with no open AR (paid off) without erroring", async () => {
    renderAt("/clients?client=cl-2");
    expect(await screen.findByText("Paid Person")).toBeInTheDocument();
    expect(screen.getByText("Client Summary · no open AR contract")).toBeInTheDocument();
    expect(screen.getAllByText("Has paid · no open AR").length).toBeGreaterThan(0);
    expect(screen.getByText("Payment History (1)")).toBeInTheDocument();
    expect(screen.queryByText("Contract Breakdown")).toBeNull();
    expect(screen.getByRole("button", { name: /Take Payment/ })).toBeDisabled();
  });
});
