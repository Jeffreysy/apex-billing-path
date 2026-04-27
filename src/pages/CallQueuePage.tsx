import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { useCollectionActivityRows, useCollectionsDashboard } from "@/hooks/useSupabaseData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpDown, ChevronDown, ChevronUp, Filter, RotateCcw, Search, UserCheck } from "lucide-react";

type SortField =
  | "client_name"
  | "days_past_due"
  | "balance_remaining"
  | "priority_score"
  | "next_due_date"
  | "last_transaction_date";
type SortDir = "asc" | "desc";

const COLLECTORS = ["Alejandro A", "Patricio D", "Maritza V"];

const QUEUE_CRITERIA = [
  { value: "broken_promise", label: "Broken promise" },
  { value: "high_balance", label: "High balance overdue" },
  { value: "repeat_risk", label: "Repeat risk" },
  { value: "stale_follow_up", label: "Stale follow-up" },
  { value: "past_due", label: "Past due" },
  { value: "standard", label: "Standard review" },
] as const;

function agingBucket(days: number | null): string {
  const value = days || 0;
  if (value <= 0) return "Current";
  if (value <= 30) return "1-30";
  if (value <= 60) return "31-60";
  if (value <= 90) return "61-90";
  return "90+";
}

function daysBetweenTodayAndDate(dateValue: string | null | undefined) {
  if (!dateValue) return 0;
  const [year, month, day] = dateValue.split("-").map(Number);
  if (!year || !month || !day) return 0;
  const dueDate = new Date(year, month - 1, day);
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.floor((todayStart.getTime() - dueDate.getTime()) / 86_400_000);
}

function priorityLabel(score: number | null): {
  label: string;
  variant: "default" | "destructive" | "outline" | "secondary";
} {
  const value = score || 0;
  if (value >= 80) return { label: "Urgent", variant: "destructive" };
  if (value >= 60) return { label: "High", variant: "default" };
  if (value >= 40) return { label: "Medium", variant: "secondary" };
  return { label: "Low", variant: "outline" };
}

function isCollectibleStatus(contractStatus: string | null, delinquencyStatus: string | null) {
  const contract = (contractStatus || "").toLowerCase();
  const delinquency = (delinquencyStatus || "").toLowerCase();
  if (["completed", "paid", "paid off", "fulfilled"].includes(contract)) return false;
  if (["current", ""].includes(delinquency)) return false;
  return true;
}

function getQueueReason(item: any) {
  if (item?.queue_tier && item?.queue_reason) {
    return {
      code: String(item.queue_tier),
      label: String(item.queue_reason),
    };
  }

  const balance = Number(item.balance_remaining) || 0;
  const storedDaysPastDue = Number(item.days_past_due) || 0;
  const dueDateDaysPastDue = balance > 0 ? Math.max(0, daysBetweenTodayAndDate(item.next_due_date)) : 0;
  const daysPastDue = Math.max(storedDaysPastDue, dueDateDaysPastDue);
  if (balance <= 0) return null;

  if (daysPastDue > 0) {
    return { code: "past_due", label: `${daysPastDue}d past due` };
  }

  if (isCollectibleStatus(item.contract_status, item.delinquency_status)) {
    return {
      code: "standard",
      label: `${item.delinquency_status || item.contract_status || "Review needed"}`,
    };
  }

  return null;
}

function tierBadge(tier: string | null | undefined) {
  switch (tier) {
    case "broken_promise":
      return { label: "Broken Promise", variant: "destructive" as const };
    case "high_balance":
      return { label: "High Balance", variant: "default" as const };
    case "repeat_risk":
      return { label: "Repeat Risk", variant: "secondary" as const };
    case "stale_follow_up":
      return { label: "Stale Follow-Up", variant: "outline" as const };
    case "past_due":
      return { label: "Past Due", variant: "outline" as const };
    default:
      return { label: "Standard", variant: "outline" as const };
  }
}

const CallQueuePage = () => {
  const navigate = useNavigate();
  const { data: queue = [], isLoading: loadingQueue } = useCollectionsDashboard();
  const { data: activities = [], isLoading: loadingActivities } = useCollectionActivityRows();

  const [search, setSearch] = useState("");
  const [filterCollector, setFilterCollector] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterAging, setFilterAging] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [sortField, setSortField] = useState<SortField>("priority_score");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [reassignOpen, setReassignOpen] = useState(false);
  const [reassignTarget, setReassignTarget] = useState<any>(null);
  const [newCollector, setNewCollector] = useState("");

  const lastContactedMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const activity of activities) {
      const clientId = activity.client_id || activity.clientId;
      if (!clientId) continue;
      const stamp = [activity.activity_date || activity.date, activity.start_time || ""].filter(Boolean).join(" ");
      const existing = map.get(clientId);
      if (!existing || stamp > existing) map.set(clientId, stamp);
    }
    return map;
  }, [activities]);

  const filteredQueue = useMemo(() => {
    let items = queue
      .map((item: any) => {
        const effectiveDaysPastDue = Math.max(
          Number(item.days_past_due) || 0,
          Number(item.balance_remaining) > 0 ? Math.max(0, daysBetweenTodayAndDate(item.next_due_date)) : 0,
        );

        return {
          ...item,
          effective_days_past_due: effectiveDaysPastDue,
          aging_bucket: agingBucket(effectiveDaysPastDue),
          last_contacted: item.last_contact_date || lastContactedMap.get(item.client_id) || null,
          queue_reason_detail: getQueueReason(item),
        };
      })
      .filter((item: any) => item.queue_reason_detail);

    if (search) {
      const needle = search.toLowerCase();
      items = items.filter((item: any) =>
        (item.client_name || "").toLowerCase().includes(needle) ||
        (item.case_number || "").toLowerCase().includes(needle) ||
        (item.phone || "").toLowerCase().includes(needle),
      );
    }

    if (filterCollector !== "all") {
      items = items.filter((item: any) => (item.collector || item.assigned_collector) === filterCollector);
    }
    if (filterStatus !== "all") {
      items = items.filter((item: any) => item.queue_reason_detail?.code === filterStatus);
    }
    if (filterAging !== "all") {
      items = items.filter((item: any) => item.aging_bucket === filterAging);
    }
    if (filterPriority !== "all") {
      items = items.filter((item: any) => priorityLabel(item.priority_score).label === filterPriority);
    }

    items.sort((a: any, b: any) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      if (typeof aValue === "string") aValue = aValue.toLowerCase();
      if (typeof bValue === "string") bValue = bValue.toLowerCase();
      if (aValue == null) aValue = sortDir === "asc" ? Infinity : -Infinity;
      if (bValue == null) bValue = sortDir === "asc" ? Infinity : -Infinity;
      if (aValue < bValue) return sortDir === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return items;
  }, [filterAging, filterCollector, filterPriority, filterStatus, lastContactedMap, queue, search, sortDir, sortField]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortField(field);
    setSortDir("desc");
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

  const hasFilters =
    Boolean(search) ||
    filterCollector !== "all" ||
    filterStatus !== "all" ||
    filterAging !== "all" ||
    filterPriority !== "all";

  const handleReassign = () => {
    if (!reassignTarget || !newCollector) return;
    setReassignOpen(false);
    setReassignTarget(null);
    setNewCollector("");
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 text-muted-foreground/50" />;
    return sortDir === "asc" ? <ChevronUp className="h-3 w-3 text-primary" /> : <ChevronDown className="h-3 w-3 text-primary" />;
  };

  if (loadingQueue || loadingActivities) {
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
        <p className="text-sm text-muted-foreground">
          {filteredQueue.length} of {queue.length} accounts. Sorted by {sortField.replace(/_/g, " ")} ({sortDir}).
        </p>
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="min-w-[200px] flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, case #, phone..."
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
              {COLLECTORS.map((collector) => (
                <SelectItem key={collector} value={collector}>
                  {collector}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-[170px]">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="text-xs">
              <SelectValue placeholder="Queue Criteria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Queue Criteria</SelectItem>
              {QUEUE_CRITERIA.map((criterion) => (
                <SelectItem key={criterion.value} value={criterion.value}>
                  {criterion.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-[130px]">
          <Select value={filterAging} onValueChange={setFilterAging}>
            <SelectTrigger className="text-xs">
              <SelectValue placeholder="Aging" />
            </SelectTrigger>
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
            <SelectTrigger className="text-xs">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
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
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-xs">
            <RotateCcw className="h-3 w-3" />
            Clear
          </Button>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30 text-left text-muted-foreground">
              <th className="cursor-pointer px-4 py-3 font-medium" onClick={() => toggleSort("client_name")}>
                <span className="flex items-center gap-1">Client <SortIcon field="client_name" /></span>
              </th>
              <th className="px-3 py-3 font-medium">Case / Matter</th>
              <th className="cursor-pointer px-3 py-3 font-medium" onClick={() => toggleSort("balance_remaining")}>
                <span className="flex items-center gap-1">Balance <SortIcon field="balance_remaining" /></span>
              </th>
              <th className="cursor-pointer px-3 py-3 font-medium" onClick={() => toggleSort("days_past_due")}>
                <span className="flex items-center gap-1">Aging <SortIcon field="days_past_due" /></span>
              </th>
              <th className="px-3 py-3 font-medium">Queue Criteria</th>
              <th className="px-3 py-3 font-medium">Tier</th>
              <th className="px-3 py-3 font-medium">Last Contact</th>
              <th className="cursor-pointer px-3 py-3 font-medium" onClick={() => toggleSort("last_transaction_date")}>
                <span className="flex items-center gap-1">Last Payment <SortIcon field="last_transaction_date" /></span>
              </th>
              <th className="px-3 py-3 font-medium">Collector</th>
              <th className="cursor-pointer px-3 py-3 font-medium" onClick={() => toggleSort("priority_score")}>
                <span className="flex items-center gap-1">Priority <SortIcon field="priority_score" /></span>
              </th>
              <th className="cursor-pointer px-3 py-3 font-medium" onClick={() => toggleSort("next_due_date")}>
                <span className="flex items-center gap-1">Next Due <SortIcon field="next_due_date" /></span>
              </th>
              <th className="px-3 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredQueue.length === 0 && (
              <tr>
                <td colSpan={12} className="px-4 py-8 text-center text-muted-foreground">
                  No accounts match current filters.
                </td>
              </tr>
            )}
            {filteredQueue.slice(0, 100).map((item: any) => {
              const itemId = item.contract_id || item.client_id;
              const priority = priorityLabel(item.priority_score);
              const tier = tierBadge(item.queue_tier);
              const daysOut = item.effective_days_past_due || 0;

              return (
                <tr
                  key={itemId}
                  className="cursor-pointer border-b transition-colors hover:bg-muted/20 last:border-0"
                  onClick={() => navigate(`/collections/workspace/${itemId}`)}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium">{item.client_name}</p>
                    <p className="text-xs text-muted-foreground">{item.phone || "—"}</p>
                  </td>
                  <td className="px-3 py-3 text-xs text-muted-foreground">{item.case_number || "—"}</td>
                  <td className="px-3 py-3 font-medium">${(Number(item.balance_remaining) || 0).toLocaleString()}</td>
                  <td className="px-3 py-3">
                    <Badge variant={daysOut > 60 ? "destructive" : daysOut > 30 ? "secondary" : "outline"} className="text-xs">
                      {daysOut > 0 ? `${daysOut}d` : "Current"}
                    </Badge>
                  </td>
                  <td className="px-3 py-3 text-xs">
                    <Badge variant="secondary" className="text-xs">
                      {item.queue_reason_detail.label}
                    </Badge>
                  </td>
                  <td className="px-3 py-3 text-xs">
                    <Badge variant={tier.variant} className="text-xs">
                      {tier.label}
                    </Badge>
                  </td>
                  <td className="px-3 py-3 text-xs text-muted-foreground">
                    <div>{item.last_contacted ? String(item.last_contacted).slice(0, 16) : "Never"}</div>
                    {Number(item.contact_count_30d) > 0 && (
                      <div className="text-[10px] text-muted-foreground">{Number(item.contact_count_30d)} touches / 30d</div>
                    )}
                  </td>
                  <td className="px-3 py-3 text-xs text-muted-foreground">
                    {item.last_transaction_date
                      ? `${item.last_transaction_date}${Number(item.last_transaction_amount) > 0 ? ` - $${Number(item.last_transaction_amount).toLocaleString()}` : ""}`
                      : "No payment"}
                  </td>
                  <td className="px-3 py-3 text-xs">{item.collector || item.assigned_collector || "Unassigned"}</td>
                  <td className="px-3 py-3">
                    <Badge variant={priority.variant} className="text-xs">
                      {priority.label}
                    </Badge>
                  </td>
                  <td className="px-3 py-3 text-xs text-muted-foreground">
                    <div>{item.next_due_date || "—"}</div>
                    {item.missed_promise && item.latest_promised_date && (
                      <div className="text-[10px] text-destructive">Missed promise: {item.latest_promised_date}</div>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 gap-1 text-xs"
                        onClick={(event) => {
                          event.stopPropagation();
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
          <div className="border-t bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
            Showing 100 of {filteredQueue.length} results. Refine filters to narrow results.
          </div>
        )}
      </div>

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
                  Balance: ${(Number(reassignTarget.balance_remaining) || 0).toLocaleString()} · Currently:{" "}
                  {reassignTarget.collector || reassignTarget.assigned_collector || "Unassigned"}
                </p>
              </div>
              <div>
                <Label>Assign to Collector</Label>
                <Select value={newCollector} onValueChange={setNewCollector}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select collector" />
                  </SelectTrigger>
                  <SelectContent>
                    {COLLECTORS.map((collector) => (
                      <SelectItem key={collector} value={collector}>
                        {collector}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setReassignOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleReassign} disabled={!newCollector}>
                  Reassign
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default CallQueuePage;
