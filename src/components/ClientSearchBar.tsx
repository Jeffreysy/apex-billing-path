import { useEffect, useState } from "react";
import { useClientMasterSearch, CLIENT_STATUS_LABEL, type ClientMasterRow } from "@/hooks/useSupabaseData";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MIN_CHARS = 2;
const DEBOUNCE_MS = 250;

/** Profile link for a client-master hit: the client (and its largest open AR contract, if any), or — for an open AR
 *  contract that has no client link — the contract itself. */
export function clientProfileHref(hit: Pick<ClientMasterRow, "clientId" | "bestContractId">): string {
  const p = new URLSearchParams();
  if (hit.clientId) p.set("client", hit.clientId);
  if (hit.bestContractId) p.set("clientId", hit.bestContractId);
  return `/clients?${p.toString()}`;
}

export const statusBadgeVariant = (s: ClientMasterRow["status"]): "default" | "destructive" | "secondary" | "outline" =>
  s === "open_ar" || s === "open_ar_unlinked" ? "destructive" : s === "paid_off" ? "default" : s === "excluded" ? "outline" : "secondary";

const money = (n: number) => `$${Math.round(n).toLocaleString()}`;

/** Off-dial badge text: client-keyed do-not-call vs a name match against the queue exclusion list (display only). */
export const offDialLabel = (src: string | null) =>
  src === "dnc_decline" ? "Do not call" : "Off dial (queue list · name match)";

/**
 * Header client search. Server-side over the CLIENT MASTER (public.search_clients: every canonical client — open AR,
 * paid off, closed, consult-only, Filevine-only — plus open AR contracts with no client link; active users only,
 * >= 2 chars, max 20). Matches name, email, phone, case number, invoice number and linked source ids.
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

  const { data: hits = [], isFetching, isError } = useClientMasterSearch(term);
  const active = term.length >= MIN_CHARS;

  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Search clients — name, phone, email, case # or invoice #..."
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
        <div className="absolute left-0 right-0 top-10 z-50 max-h-80 overflow-y-auto rounded-lg border bg-card shadow-lg">
          {isError ? (
            <p className="px-3 py-2 text-xs text-destructive">Search failed — try again.</p>
          ) : hits.length === 0 ? (
            <p className="px-3 py-2 text-xs text-muted-foreground">{isFetching ? "Searching…" : "No matching client."}</p>
          ) : (
            hits.map((c) => (
              <button
                key={c.rowKey}
                onMouseDown={() => { navigate(clientProfileHref(c)); setSearch(""); setTerm(""); setOpen(false); }}
                className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{c.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {[c.caseNumber, c.latestCaseStage, c.lastPaymentDate ? `last paid ${c.lastPaymentDate}` : ""].filter(Boolean).join(" · ") || "—"}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <Badge variant={statusBadgeVariant(c.status)} className="text-[10px]">
                    {CLIENT_STATUS_LABEL[c.status]}{c.openAr > 0 ? ` ${money(c.openAr)}` : ""}
                  </Badge>
                  {c.offDial && <Badge variant="outline" className="text-[10px] border-destructive/50 text-destructive">{offDialLabel(c.offDialSource)}</Badge>}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ClientSearchBar;
