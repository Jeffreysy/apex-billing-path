import { useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ESCALATION_ASSIGNEES,
  ESCALATION_HANDOFF_QUEUES,
  ESCALATION_PRIORITIES,
  ESCALATION_SOURCE_CONTEXTS,
  ESCALATION_STATUSES,
  formatEscalationStatus,
  formatEscalationValue,
  getDefaultHandoffQueue,
  getEscalationStatusBadgeVariant,
} from "@/lib/escalations";
import { toast } from "sonner";
import { AlertTriangle, Search, Filter, CheckCircle, Clock, ArrowUpDown, Shield } from "lucide-react";

function priorityBadge(priority: string) {
  switch (priority) {
    case "urgent":
      return <Badge variant="destructive" className="text-xs">Urgent</Badge>;
    case "high":
      return <Badge className="bg-amber-500 text-white text-xs">High</Badge>;
    case "medium":
      return <Badge variant="secondary" className="text-xs">Medium</Badge>;
    default:
      return <Badge variant="outline" className="text-xs">Low</Badge>;
  }
}

function statusBadge(status: string) {
  switch (status) {
    case "resolved":
      return <Badge className="bg-green-600 text-white text-xs">Resolved</Badge>;
    case "in_progress":
      return <Badge className="bg-blue-500 text-white text-xs">In Progress</Badge>;
    default:
      return <Badge variant={getEscalationStatusBadgeVariant(status)} className="text-xs capitalize">{formatEscalationStatus(status)}</Badge>;
  }
}

const EscalationManagementPage = () => {
  const qc = useQueryClient();

  const { data: escalations = [], isLoading } = useQuery({
    queryKey: ["all-escalations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("escalations")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterQueue, setFilterQueue] = useState("all");
  const [filterSource, setFilterSource] = useState("all");
  const [sortField, setSortField] = useState<"created_at" | "priority">("created_at");
  const [sortAsc, setSortAsc] = useState(false);

  const [editing, setEditing] = useState<any>(null);
  const [newStatus, setNewStatus] = useState("");
  const [newAssignee, setNewAssignee] = useState("");
  const [newQueue, setNewQueue] = useState("");
  const [newFollowUpDate, setNewFollowUpDate] = useState("");
  const [resNotes, setResNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const priorityOrder: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };

  const filtered = useMemo(() => {
    let rows = [...escalations];
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(r =>
        r.trigger_reason?.toLowerCase().includes(q) ||
        r.raised_by?.toLowerCase().includes(q) ||
        r.assigned_to?.toLowerCase().includes(q) ||
        r.handoff_target?.toLowerCase().includes(q) ||
        r.handoff_queue?.toLowerCase().includes(q) ||
        r.source_context?.toLowerCase().includes(q)
      );
    }
    if (filterPriority !== "all") rows = rows.filter(r => r.priority === filterPriority);
    if (filterStatus !== "all") rows = rows.filter(r => r.status === filterStatus);
    if (filterQueue !== "all") rows = rows.filter(r => r.handoff_queue === filterQueue);
    if (filterSource !== "all") rows = rows.filter(r => r.source_context === filterSource);

    rows.sort((a, b) => {
      if (sortField === "priority") {
        const av = priorityOrder[a.priority] || 0;
        const bv = priorityOrder[b.priority] || 0;
        return sortAsc ? av - bv : bv - av;
      }
      const av = a.created_at || "";
      const bv = b.created_at || "";
      return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    return rows;
  }, [escalations, search, filterPriority, filterStatus, filterQueue, filterSource, sortField, sortAsc]);

  const toggleSort = (field: "created_at" | "priority") => {
    if (sortField === field) setSortAsc(!sortAsc);
    else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const handleUpdate = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const updates: any = {};
      if (newStatus) updates.status = newStatus;
      if (newAssignee) {
        updates.assigned_to = newAssignee;
        updates.handoff_target = newAssignee;
      }
      if (newQueue) updates.handoff_queue = newQueue;
      if (newFollowUpDate) updates.follow_up_date = newFollowUpDate;
      if (resNotes) updates.resolution_notes = resNotes;
      if (newStatus === "resolved" || newStatus === "closed") updates.resolved_at = new Date().toISOString();

      const { error } = await supabase.from("escalations").update(updates).eq("id", editing.id);
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["escalations"] });
      qc.invalidateQueries({ queryKey: ["all-escalations"] });
      qc.invalidateQueries({ queryKey: ["collections-escalations"] });
      toast.success("Escalation updated");
      setEditing(null);
    } catch (err: any) {
      toast.error(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const stats = useMemo(() => {
    const open = escalations.filter(e => e.status === "open").length;
    const inProgress = escalations.filter(e => e.status === "in_progress").length;
    const urgent = escalations.filter(e => e.priority === "urgent" && e.status !== "resolved" && e.status !== "closed").length;
    const resolved = escalations.filter(e => e.status === "resolved").length;
    return { open, inProgress, urgent, resolved };
  }, [escalations]);

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Escalation Management</h1>
          <p className="text-xs text-muted-foreground">Track, route, and resolve collection escalations</p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <KpiCard icon={AlertTriangle} label="Open" value={stats.open} color="text-destructive" />
          <KpiCard icon={Clock} label="In Progress" value={stats.inProgress} color="text-blue-500" />
          <KpiCard icon={Shield} label="Urgent" value={stats.urgent} color="text-amber-500" />
          <KpiCard icon={CheckCircle} label="Resolved" value={stats.resolved} color="text-green-600" />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] max-w-xs flex-1">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Search reason, target, queue..." value={search} onChange={e => setSearch(e.target.value)} className="h-9 pl-8 text-xs" />
          </div>
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="h-9 w-[130px] text-xs"><Filter className="mr-1 h-3 w-3" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Priorities</SelectItem>
              {ESCALATION_PRIORITIES.map(p => <SelectItem key={p} value={p} className="text-xs capitalize">{p}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-9 w-[130px] text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Statuses</SelectItem>
              {ESCALATION_STATUSES.map(s => <SelectItem key={s} value={s} className="text-xs capitalize">{formatEscalationStatus(s)}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterQueue} onValueChange={setFilterQueue}>
            <SelectTrigger className="h-9 w-[165px] text-xs"><SelectValue placeholder="Queue" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Queues</SelectItem>
              {ESCALATION_HANDOFF_QUEUES.map(q => <SelectItem key={q} value={q} className="text-xs capitalize">{formatEscalationValue(q)}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterSource} onValueChange={setFilterSource}>
            <SelectTrigger className="h-9 w-[170px] text-xs"><SelectValue placeholder="Source" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Sources</SelectItem>
              {ESCALATION_SOURCE_CONTEXTS.map(s => <SelectItem key={s} value={s} className="text-xs capitalize">{formatEscalationValue(s)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-lg border bg-card overflow-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b bg-muted/50 text-muted-foreground">
                <th className="px-3 py-2 text-left font-medium cursor-pointer" onClick={() => toggleSort("created_at")}>
                  <span className="flex items-center gap-1">Date <ArrowUpDown className="h-3 w-3" /></span>
                </th>
                <th className="px-3 py-2 text-left font-medium">Raised By</th>
                <th className="px-3 py-2 text-left font-medium cursor-pointer" onClick={() => toggleSort("priority")}>
                  <span className="flex items-center gap-1">Priority <ArrowUpDown className="h-3 w-3" /></span>
                </th>
                <th className="px-3 py-2 text-left font-medium">Status</th>
                <th className="px-3 py-2 text-left font-medium">Target</th>
                <th className="px-3 py-2 text-left font-medium">Queue</th>
                <th className="px-3 py-2 text-left font-medium">Source</th>
                <th className="px-3 py-2 text-left font-medium">Follow-Up</th>
                <th className="px-3 py-2 text-left font-medium">Trigger Reason</th>
                <th className="px-3 py-2 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={10} className="px-3 py-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={10} className="px-3 py-8 text-center text-muted-foreground">No escalations found</td></tr>
              ) : filtered.map(row => (
                <tr key={row.id} className={`border-b hover:bg-muted/30 ${row.priority === "urgent" && row.status === "open" ? "bg-destructive/5" : ""}`}>
                  <td className="px-3 py-2">{row.created_at ? new Date(row.created_at).toLocaleDateString() : "—"}</td>
                  <td className="px-3 py-2 font-medium">{row.raised_by}</td>
                  <td className="px-3 py-2">{priorityBadge(row.priority)}</td>
                  <td className="px-3 py-2">{statusBadge(row.status)}</td>
                  <td className="px-3 py-2">{row.handoff_target || row.assigned_to || "—"}</td>
                  <td className="px-3 py-2 capitalize">{row.handoff_queue ? formatEscalationValue(row.handoff_queue) : "—"}</td>
                  <td className="px-3 py-2 capitalize">{row.source_context ? formatEscalationValue(row.source_context) : "—"}</td>
                  <td className="px-3 py-2">{row.follow_up_date || "—"}</td>
                  <td className="px-3 py-2 max-w-[250px] truncate" title={row.trigger_reason}>{row.trigger_reason}</td>
                  <td className="px-3 py-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => {
                        setEditing(row);
                        setNewStatus(row.status);
                        setNewAssignee(row.handoff_target || row.assigned_to || "");
                        setNewQueue(row.handoff_queue || getDefaultHandoffQueue(row.handoff_target || row.assigned_to || ""));
                        setNewFollowUpDate(row.follow_up_date || "");
                        setResNotes(row.resolution_notes || "");
                      }}
                    >
                      Manage
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Dialog open={!!editing} onOpenChange={v => { if (!v) setEditing(null); }}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Manage Escalation
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Reason</Label>
                <p className="text-xs">{editing?.trigger_reason}</p>
              </div>
              <div>
                <Label className="text-xs">Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ESCALATION_STATUSES.map(s => <SelectItem key={s} value={s} className="text-xs capitalize">{formatEscalationStatus(s)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Specific Target</Label>
                <Select value={newAssignee} onValueChange={(value) => {
                  setNewAssignee(value);
                  setNewQueue(getDefaultHandoffQueue(value));
                }}>
                  <SelectTrigger className="text-xs"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Attorney" className="text-xs">Attorney</SelectItem>
                    <SelectItem value="Case Manager/Paralegal" className="text-xs">Case Manager/Paralegal</SelectItem>
                    <SelectItem value="Compliance" className="text-xs">Compliance</SelectItem>
                    <SelectItem value="CC/Nidiana" className="text-xs">CC/Nidiana</SelectItem>
                    <SelectItem value="Stephen/Jeffrey" className="text-xs">Stephen/Jeffrey</SelectItem>
                    {ESCALATION_ASSIGNEES.filter(a => !["Management", "Legal"].includes(a)).map(a => <SelectItem key={a} value={a} className="text-xs">{a}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Handoff Queue</Label>
                <Select value={newQueue} onValueChange={setNewQueue}>
                  <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ESCALATION_HANDOFF_QUEUES.map(q => <SelectItem key={q} value={q} className="text-xs capitalize">{formatEscalationValue(q)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Follow-Up Date</Label>
                <Input type="date" value={newFollowUpDate} onChange={e => setNewFollowUpDate(e.target.value)} className="text-xs h-9" />
              </div>
              <div>
                <Label className="text-xs">Resolution Notes</Label>
                <Textarea value={resNotes} onChange={e => setResNotes(e.target.value)} rows={2} className="text-xs" maxLength={500} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              <Button onClick={handleUpdate} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

const KpiCard = ({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) => (
  <div className="rounded-lg border bg-card p-3">
    <div className="mb-1 flex items-center gap-2">
      <Icon className={`h-3.5 w-3.5 ${color}`} />
      <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</span>
    </div>
    <p className="text-lg font-bold text-foreground">{value}</p>
  </div>
);

export default EscalationManagementPage;
