import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Phone, Calendar, Clock, ArrowUpDown } from "lucide-react";

const OUTCOMES = [
  "payment_taken", "promise_to_pay", "no_answer", "left_voicemail",
  "callback_scheduled", "disputed", "wrong_number", "client_satisfied",
];

function outcomeBadge(outcome: string | null) {
  if (!outcome) return <Badge variant="outline" className="text-xs">—</Badge>;
  switch (outcome) {
    case "payment_taken": return <Badge className="bg-green-600 text-white text-xs">Payment Taken</Badge>;
    case "promise_to_pay": return <Badge className="bg-blue-500 text-white text-xs">Promise to Pay</Badge>;
    case "no_answer": return <Badge variant="secondary" className="text-xs">No Answer</Badge>;
    case "left_voicemail": return <Badge variant="secondary" className="text-xs">Voicemail</Badge>;
    case "callback_scheduled": return <Badge className="bg-amber-500 text-white text-xs">Callback</Badge>;
    case "disputed": return <Badge variant="destructive" className="text-xs">Disputed</Badge>;
    default: return <Badge variant="outline" className="text-xs">{outcome}</Badge>;
  }
}

function fmt(n: number | null) {
  return n ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n) : "—";
}

interface Props {
  collectorName: string;
  isLead: boolean;
}

const CollectorActivityLog = ({ collectorName, isLead }: Props) => {
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["collector-activity-log", isLead ? "all" : collectorName],
    queryFn: async () => {
      let query = supabase
        .from("collection_activities")
        .select("*")
        .eq("activity_type", "outbound_call")
        .order("activity_date", { ascending: false })
        .limit(500);
      if (!isLead) query = query.eq("collector", collectorName);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const [search, setSearch] = useState("");
  const [filterOutcome, setFilterOutcome] = useState("all");
  const [sortField, setSortField] = useState<"activity_date" | "collected_amount">("activity_date");
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = useMemo(() => {
    let rows = [...activities];
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(r => r.client_name?.toLowerCase().includes(q) || r.notes?.toLowerCase().includes(q));
    }
    if (filterOutcome !== "all") rows = rows.filter(r => r.outcome === filterOutcome);
    rows.sort((a, b) => {
      if (sortField === "collected_amount") return sortAsc ? (a.collected_amount || 0) - (b.collected_amount || 0) : (b.collected_amount || 0) - (a.collected_amount || 0);
      const av = `${a.activity_date}${a.start_time || ""}`;
      const bv = `${b.activity_date}${b.start_time || ""}`;
      return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    return rows;
  }, [activities, search, filterOutcome, sortField, sortAsc]);

  const toggleSort = (field: "activity_date" | "collected_amount") => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(false); }
  };

  const today = new Date().toISOString().slice(0, 10);
  const todayRows = activities.filter(a => a.activity_date === today);
  const stats = {
    totalCalls: todayRows.length,
    contacted: todayRows.filter(a => a.outcome && !["no_answer", "wrong_number", "left_voicemail"].includes(a.outcome)).length,
    collected: todayRows.reduce((s, a) => s + (a.collected_amount || 0), 0),
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg border bg-card p-2 text-center">
          <Phone className="h-3 w-3 mx-auto text-primary mb-1" />
          <p className="text-xs text-muted-foreground">Today's Calls</p>
          <p className="text-sm font-bold">{stats.totalCalls}</p>
        </div>
        <div className="rounded-lg border bg-card p-2 text-center">
          <Calendar className="h-3 w-3 mx-auto text-primary mb-1" />
          <p className="text-xs text-muted-foreground">Contacts</p>
          <p className="text-sm font-bold">{stats.contacted}</p>
        </div>
        <div className="rounded-lg border bg-card p-2 text-center">
          <Clock className="h-3 w-3 mx-auto text-primary mb-1" />
          <p className="text-xs text-muted-foreground">Collected Today</p>
          <p className="text-sm font-bold">{fmt(stats.collected)}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[150px] max-w-xs">
          <Search className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
          <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-7 text-xs h-8" />
        </div>
        <Select value={filterOutcome} onValueChange={setFilterOutcome}>
          <SelectTrigger className="w-[130px] text-xs h-8"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">All Outcomes</SelectItem>
            {OUTCOMES.map(o => <SelectItem key={o} value={o} className="text-xs capitalize">{o.replace(/_/g, " ")}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-card overflow-auto max-h-[400px]">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-card">
            <tr className="border-b bg-muted/50 text-muted-foreground">
              <th className="px-2 py-1.5 text-left font-medium cursor-pointer" onClick={() => toggleSort("activity_date")}>
                <span className="flex items-center gap-1">Date <ArrowUpDown className="h-2.5 w-2.5" /></span>
              </th>
              {isLead && <th className="px-2 py-1.5 text-left font-medium">Collector</th>}
              <th className="px-2 py-1.5 text-left font-medium">Client</th>
              <th className="px-2 py-1.5 text-left font-medium">Outcome</th>
              <th className="px-2 py-1.5 text-left font-medium cursor-pointer" onClick={() => toggleSort("collected_amount")}>
                <span className="flex items-center gap-1">Amount <ArrowUpDown className="h-2.5 w-2.5" /></span>
              </th>
              <th className="px-2 py-1.5 text-left font-medium">Notes</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={isLead ? 6 : 5} className="px-2 py-6 text-center text-muted-foreground">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={isLead ? 6 : 5} className="px-2 py-6 text-center text-muted-foreground">No activities found</td></tr>
            ) : filtered.slice(0, 200).map(row => (
              <tr key={row.id} className="border-b hover:bg-muted/30">
                <td className="px-2 py-1.5 whitespace-nowrap">{row.activity_date}{row.start_time && <span className="text-muted-foreground ml-1">{String(row.start_time).slice(0, 5)}</span>}</td>
                {isLead && <td className="px-2 py-1.5 font-medium">{row.collector}</td>}
                <td className="px-2 py-1.5">{row.client_name}</td>
                <td className="px-2 py-1.5">{outcomeBadge(row.outcome)}</td>
                <td className="px-2 py-1.5 font-mono">{fmt(row.collected_amount)}</td>
                <td className="px-2 py-1.5 max-w-[150px] truncate" title={row.notes || ""}>{row.notes || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CollectorActivityLog;
