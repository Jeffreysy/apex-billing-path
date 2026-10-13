import { useState } from "react";
import { useClientSearch } from "@/hooks/useSupabaseData";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

/** Header search. Queries the server once typing pauses instead of downloading every client on
 *  every page, and deep-links with ?contractId= (Client.id is the contract_id), which /clients reads. */
const ClientSearchBar = () => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const debounced = useDebouncedValue(search, 250);
  const { data: filtered = [] } = useClientSearch(debounced, 8);

  const statusVariant: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
    active: "default", delinquent: "destructive", completed: "secondary", new: "outline",
  };

  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Search clients..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        className="h-9 pl-9 text-sm"
      />
      {open && search.trim() && filtered.length > 0 && (
        <div className="absolute left-0 right-0 top-10 z-50 max-h-64 overflow-y-auto rounded-lg border bg-card shadow-lg">
          {filtered.map((c) => (
            <button
              key={c.id}
              onMouseDown={() => { navigate(`/clients?contractId=${encodeURIComponent(c.id)}`); setSearch(""); setOpen(false); }}
              className="flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
            >
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.caseNumber} · {c.caseType}</p>
              </div>
              <Badge variant={statusVariant[c.status]} className="text-xs capitalize">{c.status}</Badge>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientSearchBar;
