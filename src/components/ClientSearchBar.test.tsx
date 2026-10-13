/**
 * Header search (2026-10-13): server-side, debounced, >= 2 chars, no data pulled on mount, and results
 * deep-link to ClientLookup by contract (?clientId=<contract_id>). Hits here are synthetic test values.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";

const calls: string[] = [];
vi.mock("@/hooks/useSupabaseData", () => ({
  useMergedClients: () => {
    throw new Error("the header search must not pull the whole AR book");
  },
  useClientSearch: (term: string) => {
    calls.push(term);
    const hits =
      term.trim().length >= 2
        ? [{ contractId: "c-1", clientId: "cl-1", name: "Test Person", caseNumber: "TV-0001", invoiceNumber: "#101", caseType: "T-Visa", status: "active", matchField: "name" }]
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

  it("does not search on mount or below 2 chars, debounces, and deep-links by contract", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <ClientSearchBar />
        <Routes>
          <Route path="*" element={<Where />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(calls.every((t) => t === "")).toBe(true); // mounted: no term, nothing fetched

    const input = screen.getByLabelText("Search clients");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "t" } });
    await act(async () => { vi.advanceTimersByTime(300); });
    expect(screen.queryByText("Test Person")).toBeNull();

    fireEvent.change(input, { target: { value: "te" } });
    expect(calls).not.toContain("te"); // debounced
    await act(async () => { vi.advanceTimersByTime(300); });
    expect(calls).toContain("te");

    fireEvent.mouseDown(screen.getByText("Test Person"));
    expect(screen.getByTestId("where").textContent).toBe("/clients?clientId=c-1");
    vi.useRealTimers();
  });
});
