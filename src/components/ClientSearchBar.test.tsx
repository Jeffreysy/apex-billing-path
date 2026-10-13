/**
 * Header search (2026-10-13): server-side over the CLIENT MASTER, debounced, >= 2 chars, no data pulled on mount,
 * status badge for non-AR clients, and results open the client profile (?client=<client_id>[&clientId=<contract>]).
 * Hits here are synthetic test values.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";

const calls: string[] = [];
vi.mock("@/hooks/useSupabaseData", () => ({
  CLIENT_STATUS_LABEL: {
    open_ar: "Open AR", open_ar_unlinked: "Open AR · no client link", paid_off: "Has paid · no open AR", closed: "Closed",
    consult_only: "Consult only", no_open_ar: "No open AR", excluded: "Excluded (test)",
  },
  useMergedClients: () => {
    throw new Error("the header search must not pull the whole AR book");
  },
  useClientMasterSearch: (term: string) => {
    calls.push(term);
    const base = { email: "", phone: "", qualityStatus: null, collector: null, ledgerPayments: 3, lastPaymentDate: "2026-09-01", mycaseCases: 1, latestCaseStage: "Filed", offDial: false };
    const hits =
      term.trim().length >= 2
        ? [
            { ...base, rowKey: "client:cl-1", clientId: "cl-1", name: "Open Person", caseNumber: "TV-0001", openAr: 4000, openContracts: 1, bestContractId: "c-1", status: "open_ar" },
            { ...base, rowKey: "client:cl-2", clientId: "cl-2", name: "Paid Person", caseNumber: "TV-0002", openAr: 0, openContracts: 0, bestContractId: null, status: "paid_off", offDial: true, offDialSource: "queue_exclusion_name_key" },
          ]
        : [];
    return { data: hits, isFetching: false, isError: false };
  },
}));

import ClientSearchBar from "./ClientSearchBar";

function Where() {
  const loc = useLocation();
  return <span data-testid="where">{loc.pathname + loc.search}</span>;
}

describe("ClientSearchBar", () => {
  beforeEach(() => {
    calls.length = 0;
    vi.useFakeTimers();
  });

  it("does not search on mount, debounces, labels non-AR clients, and opens the client profile", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <ClientSearchBar />
        <Routes>
          <Route path="*" element={<Where />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(calls.every((t) => t === "")).toBe(true);

    const input = screen.getByLabelText("Search clients");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "t" } });
    await act(async () => { vi.advanceTimersByTime(300); });
    expect(screen.queryByText("Open Person")).toBeNull();

    fireEvent.change(input, { target: { value: "pe" } });
    expect(calls).not.toContain("pe");
    await act(async () => { vi.advanceTimersByTime(300); });
    expect(calls).toContain("pe");
    expect(screen.getByText("Open AR $4,000")).toBeInTheDocument();
    expect(screen.getByText("Has paid · no open AR")).toBeInTheDocument();
    expect(screen.getByText("Off dial (queue list · name match)")).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByText("Paid Person"));
    expect(screen.getByTestId("where").textContent).toBe("/clients?client=cl-2");
    vi.useRealTimers();
  });
});
