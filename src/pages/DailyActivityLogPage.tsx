import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search, Filter, Phone, ArrowUpDown, Calendar, Clock,
} from "lucide-react";

const COLLECTORS = ["Alejandro A", "Maritza V"];
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
    case "wrong_number": return <Badge variant="outline" className="text-xs">Wrong #</Badge>;
    case "client_satisfied": return <Badge className="bg-green-600 text-white text-xs">Satisfied</Badge>;
    default: return <Badge variant="outline" className="text-xs">{outcome}</Badge>;
  }
}

function fmt(n: number | null) {
  return n ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n) : "—";
}

const DailyActivityLogPage = () => {
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["daily-activity-log"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("collection_activities")
        .select("*")
        .order("activity_date", { ascending: false })
        .limit(1000);
      if (error) throw error;
      return data || [];
    },
  });

  const [search, setSearch] = useState("");
  const [filterCollector, setFilterCollector] = useState("all");
  const [filterOutcome, setFilterOutcome] = useState("all");
  const [filterDate, setFilterDate] = useState("");
  const [sortField, setSortField] = useState<"activity_date" | "collected_amount">("activity_date");
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = useMemo(() => {
    let rows = [...activities];
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(r =>
        r.client_name?.toLowerCase().includes(q) ||
        r.collector?.toLowerCase().includes(q) ||
        r.notes?.toLowerCase().includes(q)
      );
    }
    if (filterCollector !== "all") rows = rows.filter(r => r.collector === filterCollector);
    if (filterOutcome !== "all") rows = rows.filter(r => r.outcome === filterOutcome);
    if (filterDate) rows = rows.filter(r => r.activity_date === filterDate);

    rows.sort((a, b) => {
      if (sortField === "collected_amount") {
        const av = a.collected_amount || 0;
        const bv = b.collected_amount || 0;
        return sortAsc ? av - bv : bv - av;
      }
      const av = `${a.activity_date}${a.start_time || ""}`;
      const bv = `${b.activity_date}${b.start_time || ""}`;
      return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    return rows;
  }, [activities, search, filterCollector, filterOutcome, filterDate, sortField, sortAsc]);

  const toggleSort = (field: "activity_date" | "collected_amount") => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(false); }
  };

  // Daily summary stats
  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todayRows = activities.filter(a => a.activity_date === today);
    const totalCalls = todayRows.length;
    const contacted = todayRows.filter(a => a.outcome && !["no_answer", "wrong_number", "left_voicemail"].includes(a.outcome)).length;
    const collected = todayRows.reduce((s, a) => s + (a.collected_amount || 0), 0);
    const totalMinutes = todayRows.reduce((s, a) => s + (a.duration_minutes || 0), 0);
    return { totalCalls, contacted, collected, totalMinutes };
  }, [activities]);

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Daily Activity Log</h1>
          <p className="text-xs text-muted-foreground">Complete record of all collection activities</p>
        </div>

        {/* Today's summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiCard icon={Phone} label="Today's Calls" value={stats.totalCalls} />
          <KpiCard icon={Calendar} label="Contacts Made" value={stats.contacted} />
          <KpiCard icon={Clock} label="Total Minutes" value={stats.totalMinutes} />
          <KpiCard
            icon={Phone}
            label="Collected Today"
            value={new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(stats.collected)}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Search client, collector, notes..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 text-xs h-9" />
          </div>
          <Input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="w-[160px] text-xs h-9" />
          <Select value={filterCollector} onValueChange={setFilterCollector}>
            <SelectTrigger className="w-[150px] text-xs h-9"><Filter className="h-3 w-3 mr-1" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Collectors</SelectItem>
              {COLLECTORS.map(c => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterOutcome} onValueChange={setFilterOutcome}>
            <SelectTrigger className="w-[150px] text-xs h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Outcomes</SelectItem>
              {OUTCOMES.map(o => <SelectItem key={o} value={o} className="text-xs capitalize">{o.replace(/_/g, " ")}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-lg border bg-card overflow-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b bg-muted/50 text-muted-foreground">
                <th className="px-3 py-2 text-left font-medium cursor-pointer" onClick={() => toggleSort("activity_date")}>
                  <span className="flex items-center gap-1">Date/Time <ArrowUpDown className="h-3 w-3" /></span>
                </th>
                <th className="px-3 py-2 text-left font-medium">Collector</th>
                <th className="px-3 py-2 text-left font-medium">Client</th>
                <th className="px-3 py-2 text-left font-medium">Type</th>
                <th className="px-3 py-2 text-left font-medium">Outcome</th>
                <th className="px-3 py-2 text-left font-medium">Duration</th>
                <th className="px-3 py-2 text-left font-medium cursor-pointer" onClick={() => toggleSort("collected_amount")}>
                  <span className="flex items-center gap-1">Collected <ArrowUpDown className="h-3 w-3" /></span>
                </th>
                <th className="px-3 py-2 text-left font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} className="px-3 py-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-3 py-8 text-center text-muted-foreground">No activities found</td></tr>
              ) : filtered.slice(0, 500).map(row => (
                <tr key={row.id} className="border-b hover:bg-muted/30">
                  <td className="px-3 py-2 whitespace-nowrap">
                    {row.activity_date}
                    {row.start_time && <span className="text-muted-foreground ml-1">{String(row.start_time).slice(0, 5)}</span>}
                  </td>
                  <td className="px-3 py-2 font-medium">{row.collector}</td>
                  <td className="px-3 py-2">{row.client_name}</td>
                  <td className="px-3 py-2">
                    <Badge variant="outline" className="text-xs">{(row.activity_type || "call").replace(/_/g, " ")}</Badge>
                  </td>
                  <td className="px-3 py-2">{outcomeBadge(row.outcome)}</td>
                  <td className="px-3 py-2">{row.duration_minutes ? `${row.duration_minutes}m` : "—"}</td>
                  <td className="px-3 py-2 font-mono">{fmt(row.collected_amount)}</td>
                  <td className="px-3 py-2 max-w-[200px] truncate" title={row.notes || ""}>{row.notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length > 500 && (
            <p className="px-3 py-2 text-xs text-muted-foreground text-center border-t">
              Showing 500 of {filtered.length} records
            </p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

const KpiCard = ({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) => (
  <div className="rounded-lg border bg-card p-3">
    <div className="flex items-center gap-2 mb-1">
      <Icon className="h-3.5 w-3.5 text-primary" />
      <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</span>
    </div>
    <p className="text-lg font-bold text-foreground">{value}</p>
  </div>
);

export default DailyActivityLogPage;
