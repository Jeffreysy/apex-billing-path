import { useEffect, useState } from "react";
import { useClientSearch } from "@/hooks/useSupabaseData";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MIN_CHARS = 2;
const DEBOUNCE_MS = 250;

/**
 * Header client search. Server-side (public.search_ar_clients: active users, >= 2 chars, max 20 rows)
 * against the AR book, queried only once the user types — it used to pull every ar_dashboard row into
 * every page on load (4 parallel pages, 3 of which timed out at 8 s). Matches name, case number,
 * invoice number or email. Results deep-link to ClientLookup by contract (?clientId=<contract_id>).
 */
const ClientSearchBar = () => {
  const [search, setSearch] = useState("");
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setTerm(search.trim()), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [search]);

  const { data: hits = [], isFetching, isError } = useClientSearch(term);
  const active = term.length >= MIN_CHARS;

  const statusVariant: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
    active: "default", delinquent: "destructive", completed: "secondary", new: "outline",
  };

  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Search clients, case # or invoice #..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        className="h-9 pl-9 pr-8 text-sm"
        aria-label="Search clients"
      />
      {isFetching && active && (
        <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
      )}
      {open && active && (
        <div className="absolute left-0 right-0 top-10 z-50 max-h-72 overflow-y-auto rounded-lg border bg-card shadow-lg">
          {isError ? (
            <p className="px-3 py-2 text-xs text-destructive">Search failed — try again.</p>
          ) : hits.length === 0 ? (
            <p className="px-3 py-2 text-xs text-muted-foreground">{isFetching ? "Searching…" : "No matches in the AR book."}</p>
          ) : (
            hits.map((c) => (
              <button
                key={c.contractId}
                onMouseDown={() => { navigate(`/clients?clientId=${c.contractId}`); setSearch(""); setTerm(""); setOpen(false); }}
                className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{c.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {[c.caseNumber, c.caseType, c.matchField === "invoice_number" ? `Invoice ${c.invoiceNumber}` : ""]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </p>
                </div>
                <Badge variant={statusVariant[c.status]} className="shrink-0 text-xs capitalize">{c.status}</Badge>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ClientSearchBar;
