/**
 * Client Lookup (2026-10-13): no bulk preloads (whole AR book / every payment / every case / every milestone);
 * the ?clientId=<contract_id> deep link opens that contract and the profile reads only that client's rows.
 * All values are synthetic test data.
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const h = vi.hoisted(() => ({ contractAsked: [] as (string | null)[] }));

vi.mock("@/components/DashboardLayout", () => ({ default: ({ children }: any) => <main>{children}</main> }));
vi.mock("@/components/TakePaymentDialog", () => ({ default: () => null }));
vi.mock("@/components/CallDocumentationDialog", () => ({ default: () => null }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { rpc: vi.fn(async () => ({ data: [] })) } }));

vi.mock("@/hooks/useSupabaseData", () => {
  const ok = (data: unknown) => ({ data, isLoading: false, isFetching: false });
  const bulk = () => {
    throw new Error("Client Lookup must not preload bulk data");
  };
  return {
    useMergedClients: bulk,
    usePaymentsData: bulk,
    useImmigrationCases: bulk,
    useCaseMilestones: bulk,
    useCollectors: bulk,
    useClientSearch: () => ok([]),
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
    useClientPayments: () => ok([
      { id: "p1", clientId: "cl-1", clientName: "Test Person", amount: 500, date: "2026-09-01", method: "card", collectorId: "", collectorName: "CRM", status: "completed" },
      { id: "p2", clientId: "cl-1", clientName: "Test Person", amount: 500, date: "2026-08-01", method: "card", collectorId: "", collectorName: "CRM", status: "completed" },
    ]),
    useClientImmigrationCases: () => ok([{ id: "ic1", case_number: "TV-1", case_stage: "filed", practice_area: "T-Visa" }]),
    useCaseMilestonesFor: () => ok([{ id: "m1", milestone_type: "Filed", milestone_date: "2026-09-02", completed: true }]),
    useClientActivityHistory: () => ok([]),
    useMyCaseClient360: () => ok(null),
  };
});

import ClientLookup from "./ClientLookup";

describe("Client Lookup", () => {
  it("opens the deep-linked contract from per-client fetches only", async () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter initialEntries={["/clients?clientId=c-1"]}>
          <ClientLookup />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(await screen.findByText("Test Person")).toBeInTheDocument();
    expect(h.contractAsked).toContain("c-1");
    expect(screen.getByText("Payment History (2)")).toBeInTheDocument();
    expect(screen.getByText("Immigration Cases (1)")).toBeInTheDocument();
    expect(screen.getByText("Case Milestones (1)")).toBeInTheDocument();
    expect(screen.getByText("Test Collector")).toBeInTheDocument();
  });
});
