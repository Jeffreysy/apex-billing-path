import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useCollectionsDashboard, useCollectionActivities } from "@/hooks/useSupabaseData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Phone, ArrowUpDown, Search, Filter, UserCheck, AlertTriangle,
  ChevronUp, ChevronDown, RotateCcw,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type SortField = "client_name" | "days_past_due" | "balance_remaining" | "priority_score" | "next_due_date";
type SortDir = "asc" | "desc";

const COLLECTORS = ["Alejandro A", "Patricio D", "Maritza V"];

const QUEUE_STATUSES = ["pending", "in_progress", "contacted_today", "payment_processing", "skipped"] as const;

function agingBucket(days: number | null): string {
  const d = days || 0;
  if (d <= 0) return "Current";
  if (d <= 30) return "1-30";
  if (d <= 60) return "31-60";
  if (d <= 90) return "61-90";
  return "90+";
}

function priorityLabel(score: number | null): { label: string; variant: "destructive" | "secondary" | "outline" | "default" } {
  const s = score || 0;
  if (s >= 80) return { label: "Urgent", variant: "destructive" };
  if (s >= 60) return { label: "High", variant: "default" };
  if (s >= 40) return { label: "Medium", variant: "secondary" };
  return { label: "Low", variant: "outline" };
}

const CallQueuePage = () => {
  const { data: queue = [], isLoading: ql } = useCollectionsDashboard();
  const { data: activities = [], isLoading: al } = useCollectionActivities();

  // Filters
  const [search, setSearch] = useState("");
  const [filterCollector, setFilterCollector] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterAging, setFilterAging] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");

  // Sorting
  const [sortField, setSortField] = useState<SortField>("priority_score");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Reassign dialog
  const [reassignOpen, setReassignOpen] = useState(false);
  const [reassignTarget, setReassignTarget] = useState<any>(null);
  const [newCollector, setNewCollector] = useState("");

  // Build last-contacted map from activities
  const lastContactedMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const a of activities) {
      if (!a.clientId) continue;
      const existing = map.get(a.clientId);
      if (!existing || a.date > existing) {
        map.set(a.clientId, a.date);
      }
    }
    return map;
  }, [activities]);

  // Local queue status (in-memory for now, will be DB-backed later)
  const [localStatuses, setLocalStatuses] = useState<Record<string, string>>({});

  const filteredQueue = useMemo(() => {
    let items = queue.map((item: any) => ({
      ...item,
      aging_bucket: agingBucket(item.days_past_due),
      last_contacted: lastContactedMap.get(item.client_id) || null,
      queue_status: localStatuses[item.contract_id || item.client_id] || "pending",
    }));

    // Search
    if (search) {
      const s = search.toLowerCase();
      items = items.filter((i: any) =>
        (i.client_name || "").toLowerCase().includes(s) ||
        (i.case_number || "").toLowerCase().includes(s) ||
        (i.phone || "").toLowerCase().includes(s)
      );
    }

    // Filters
    if (filterCollector !== "all") items = items.filter((i: any) => (i.collector || i.assigned_collector) === filterCollector);
    if (filterStatus !== "all") items = items.filter((i: any) => i.queue_status === filterStatus);
    if (filterAging !== "all") items = items.filter((i: any) => i.aging_bucket === filterAging);
    if (filterPriority !== "all") {
      items = items.filter((i: any) => priorityLabel(i.priority_score).label === filterPriority);
    }

    // Sort
    items.sort((a: any, b: any) => {
      let av = a[sortField];
      let bv = b[sortField];
      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();
      if (av == null) av = sortDir === "asc" ? Infinity : -Infinity;
      if (bv == null) bv = sortDir === "asc" ? Infinity : -Infinity;
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return items;
  }, [queue, search, filterCollector, filterStatus, filterAging, filterPriority, sortField, sortDir, lastContactedMap, localStatuses]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 text-muted-foreground/50" />;
    return sortDir === "asc"
      ? <ChevronUp className="h-3 w-3 text-primary" />
      : <ChevronDown className="h-3 w-3 text-primary" />;
  };

  const handleReassign = () => {
    if (!reassignTarget || !newCollector) return;
    toast.success(`Reassigned ${reassignTarget.client_name} to ${newCollector}`);
    setReassignOpen(false);
    setReassignTarget(null);
    setNewCollector("");
  };

  const handleStatusChange = (itemId: string, status: string) => {
    setLocalStatuses(prev => ({ ...prev, [itemId]: status }));
    toast.success(`Queue status updated to ${status.replace(/_/g, " ")}`);
  };

  const clearFilters = () => {
    setSearch("");
    setFilterCollector("all");
    setFilterStatus("all");
    setFilterAging("all");
    setFilterPriority("all");
    setSortField("priority_score");
    setSortDir("desc");
  };

  const hasFilters = search || filterCollector !== "all" || filterStatus !== "all" || filterAging !== "all" || filterPriority !== "all";

  if (ql || al) {
    return (
      <DashboardLayout title="Call Queue">
        <div className="p-8 text-center text-muted-foreground">Loading queue...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Call Queue">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Outbound Call Queue</h1>
        <p className="text-muted-foreground text-sm">
          {filteredQueue.length} of {queue.length} accounts · Sorted by {sortField.replace(/_/g, " ")} ({sortDir})
        </p>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search name, case #, phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="w-[160px]">
          <Select value={filterCollector} onValueChange={setFilterCollector}>
            <SelectTrigger className="text-xs">
              <Filter className="mr-1 h-3 w-3" />
              <SelectValue placeholder="Collector" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Collectors</SelectItem>
              {COLLECTORS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="w-[160px]">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {QUEUE_STATUSES.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="w-[130px]">
          <Select value={filterAging} onValueChange={setFilterAging}>
            <SelectTrigger className="text-xs"><SelectValue placeholder="Aging" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Aging</SelectItem>
              <SelectItem value="Current">Current</SelectItem>
              <SelectItem value="1-30">1-30 days</SelectItem>
              <SelectItem value="31-60">31-60 days</SelectItem>
              <SelectItem value="61-90">61-90 days</SelectItem>
              <SelectItem value="90+">90+ days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-[130px]">
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="text-xs"><SelectValue placeholder="Priority" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="Urgent">Urgent</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs gap-1">
            <RotateCcw className="h-3 w-3" /> Clear
          </Button>
        )}
      </div>

      {/* Queue Table */}
      <div className="rounded-lg border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30 text-left text-muted-foreground">
              <th className="px-4 py-3 font-medium cursor-pointer" onClick={() => toggleSort("client_name")}>
                <span className="flex items-center gap-1">Client <SortIcon field="client_name" /></span>
              </th>
              <th className="px-3 py-3 font-medium">Case / Matter</th>
              <th className="px-3 py-3 font-medium cursor-pointer" onClick={() => toggleSort("balance_remaining")}>
                <span className="flex items-center gap-1">Balance <SortIcon field="balance_remaining" /></span>
              </th>
              <th className="px-3 py-3 font-medium cursor-pointer" onClick={() => toggleSort("days_past_due")}>
                <span className="flex items-center gap-1">Aging <SortIcon field="days_past_due" /></span>
              </th>
              <th className="px-3 py-3 font-medium">Last Contact</th>
              <th className="px-3 py-3 font-medium">Collector</th>
              <th className="px-3 py-3 font-medium cursor-pointer" onClick={() => toggleSort("priority_score")}>
                <span className="flex items-center gap-1">Priority <SortIcon field="priority_score" /></span>
              </th>
              <th className="px-3 py-3 font-medium">Queue Status</th>
              <th className="px-3 py-3 font-medium cursor-pointer" onClick={() => toggleSort("next_due_date")}>
                <span className="flex items-center gap-1">Next Due <SortIcon field="next_due_date" /></span>
              </th>
              <th className="px-3 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredQueue.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-muted-foreground">
                  No accounts match current filters.
                </td>
              </tr>
            )}
            {filteredQueue.slice(0, 100).map((item: any) => {
              const priority = priorityLabel(item.priority_score);
              const itemId = item.contract_id || item.client_id;
              const daysOut = item.days_past_due || 0;
              return (
                <tr key={itemId} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium">{item.client_name}</p>
                    <p className="text-xs text-muted-foreground">{item.phone || "—"}</p>
                  </td>
                  <td className="px-3 py-3 text-xs text-muted-foreground">{item.case_number || "—"}</td>
                  <td className="px-3 py-3 font-medium">
                    ${(Number(item.balance_remaining) || 0).toLocaleString()}
                  </td>
                  <td className="px-3 py-3">
                    <Badge
                      variant={daysOut > 60 ? "destructive" : daysOut > 30 ? "secondary" : "outline"}
                      className="text-xs"
                    >
                      {daysOut > 0 ? `${daysOut}d` : "Current"}
                    </Badge>
                  </td>
                  <td className="px-3 py-3 text-xs text-muted-foreground">
                    {item.last_contacted || "Never"}
                  </td>
                  <td className="px-3 py-3 text-xs">{item.collector || item.assigned_collector || "Unassigned"}</td>
                  <td className="px-3 py-3">
                    <Badge variant={priority.variant} className="text-xs">{priority.label}</Badge>
                  </td>
                  <td className="px-3 py-3">
                    <Select
                      value={item.queue_status}
                      onValueChange={(v) => handleStatusChange(itemId, v)}
                    >
                      <SelectTrigger className="h-7 text-xs w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {QUEUE_STATUSES.map(s => (
                          <SelectItem key={s} value={s} className="text-xs">
                            {s.replace(/_/g, " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-3 py-3 text-xs text-muted-foreground">
                    {item.next_due_date || "—"}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1"
                        onClick={() => {
                          setReassignTarget(item);
                          setNewCollector(item.collector || item.assigned_collector || "");
                          setReassignOpen(true);
                        }}
                      >
                        <UserCheck className="h-3 w-3" />
                        Assign
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredQueue.length > 100 && (
          <div className="px-4 py-3 text-xs text-muted-foreground border-t bg-muted/20">
            Showing 100 of {filteredQueue.length} results. Refine filters to narrow results.
          </div>
        )}
      </div>

      {/* Reassign Dialog */}
      <Dialog open={reassignOpen} onOpenChange={setReassignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reassign Account</DialogTitle>
          </DialogHeader>
          {reassignTarget && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">{reassignTarget.client_name}</p>
                <p className="text-xs text-muted-foreground">
                  Balance: ${(Number(reassignTarget.balance_remaining) || 0).toLocaleString()} ·
                  Currently: {reassignTarget.collector || reassignTarget.assigned_collector || "Unassigned"}
                </p>
              </div>
              <div>
                <Label>Assign to Collector</Label>
                <Select value={newCollector} onValueChange={setNewCollector}>
                  <SelectTrigger><SelectValue placeholder="Select collector" /></SelectTrigger>
                  <SelectContent>
                    {COLLECTORS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setReassignOpen(false)}>Cancel</Button>
                <Button onClick={handleReassign} disabled={!newCollector}>Reassign</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default CallQueuePage;
