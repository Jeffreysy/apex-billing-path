import { useState, useMemo } from "react";
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
import { toast } from "sonner";
import {
  AlertTriangle, Search, Filter, CheckCircle, Clock, ArrowUpDown, Shield,
} from "lucide-react";

const COLLECTORS = ["Alejandro A", "Maritza V"];
const PRIORITIES = ["low", "medium", "high", "urgent"];
const STATUSES = ["open", "in_progress", "resolved", "dismissed"];
const ASSIGNEES = [...COLLECTORS, "Management", "Legal"];

function priorityBadge(p: string) {
  switch (p) {
    case "urgent": return <Badge variant="destructive" className="text-xs">Urgent</Badge>;
    case "high": return <Badge className="bg-amber-500 text-white text-xs">High</Badge>;
    case "medium": return <Badge variant="secondary" className="text-xs">Medium</Badge>;
    default: return <Badge variant="outline" className="text-xs">Low</Badge>;
  }
}

function statusBadge(s: string) {
  switch (s) {
    case "resolved": return <Badge className="bg-green-600 text-white text-xs">Resolved</Badge>;
    case "in_progress": return <Badge className="bg-blue-500 text-white text-xs">In Progress</Badge>;
    case "dismissed": return <Badge variant="outline" className="text-xs">Dismissed</Badge>;
    default: return <Badge variant="destructive" className="text-xs">Open</Badge>;
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
  const [sortField, setSortField] = useState<"created_at" | "priority">("created_at");
  const [sortAsc, setSortAsc] = useState(false);

  // Resolve dialog
  const [editing, setEditing] = useState<any>(null);
  const [newStatus, setNewStatus] = useState("");
  const [newAssignee, setNewAssignee] = useState("");
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
        r.assigned_to?.toLowerCase().includes(q)
      );
    }
    if (filterPriority !== "all") rows = rows.filter(r => r.priority === filterPriority);
    if (filterStatus !== "all") rows = rows.filter(r => r.status === filterStatus);

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
  }, [escalations, search, filterPriority, filterStatus, sortField, sortAsc]);

  const toggleSort = (field: "created_at" | "priority") => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(false); }
  };

  const handleUpdate = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const updates: any = {};
      if (newStatus) updates.status = newStatus;
      if (newAssignee) updates.assigned_to = newAssignee;
      if (resNotes) updates.resolution_notes = resNotes;
      if (newStatus === "resolved" || newStatus === "dismissed") updates.resolved_at = new Date().toISOString();

      const { error } = await supabase.from("escalations").update(updates).eq("id", editing.id);
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["all-escalations"] });
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
    const urgent = escalations.filter(e => e.priority === "urgent" && e.status !== "resolved" && e.status !== "dismissed").length;
    const resolved = escalations.filter(e => e.status === "resolved").length;
    return { open, inProgress, urgent, resolved };
  }, [escalations]);

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Escalation Management</h1>
          <p className="text-xs text-muted-foreground">Track, assign, and resolve collection escalations</p>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiCard icon={AlertTriangle} label="Open" value={stats.open} color="text-destructive" />
          <KpiCard icon={Clock} label="In Progress" value={stats.inProgress} color="text-blue-500" />
          <KpiCard icon={Shield} label="Urgent" value={stats.urgent} color="text-amber-500" />
          <KpiCard icon={CheckCircle} label="Resolved" value={stats.resolved} color="text-green-600" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Search reason, raised by..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 text-xs h-9" />
          </div>
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-[130px] text-xs h-9"><Filter className="h-3 w-3 mr-1" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Priorities</SelectItem>
              {PRIORITIES.map(p => <SelectItem key={p} value={p} className="text-xs capitalize">{p}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[130px] text-xs h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Statuses</SelectItem>
              {STATUSES.map(s => <SelectItem key={s} value={s} className="text-xs capitalize">{s.replace("_", " ")}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
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
                <th className="px-3 py-2 text-left font-medium">Assigned To</th>
                <th className="px-3 py-2 text-left font-medium">Trigger Reason</th>
                <th className="px-3 py-2 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="px-3 py-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-3 py-8 text-center text-muted-foreground">No escalations found</td></tr>
              ) : filtered.map(row => (
                <tr key={row.id} className={`border-b hover:bg-muted/30 ${row.priority === "urgent" && row.status === "open" ? "bg-destructive/5" : ""}`}>
                  <td className="px-3 py-2">{row.created_at ? new Date(row.created_at).toLocaleDateString() : "—"}</td>
                  <td className="px-3 py-2 font-medium">{row.raised_by}</td>
                  <td className="px-3 py-2">{priorityBadge(row.priority)}</td>
                  <td className="px-3 py-2">{statusBadge(row.status)}</td>
                  <td className="px-3 py-2">{row.assigned_to || "—"}</td>
                  <td className="px-3 py-2 max-w-[250px] truncate" title={row.trigger_reason}>{row.trigger_reason}</td>
                  <td className="px-3 py-2">
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => {
                      setEditing(row);
                      setNewStatus(row.status);
                      setNewAssignee(row.assigned_to || "");
                      setResNotes(row.resolution_notes || "");
                    }}>
                      Manage
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Update dialog */}
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
                    {STATUSES.map(s => <SelectItem key={s} value={s} className="text-xs capitalize">{s.replace("_", " ")}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Assign To</Label>
                <Select value={newAssignee} onValueChange={setNewAssignee}>
                  <SelectTrigger className="text-xs"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {ASSIGNEES.map(a => <SelectItem key={a} value={a} className="text-xs">{a}</SelectItem>)}
                  </SelectContent>
                </Select>
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
    <div className="flex items-center gap-2 mb-1">
      <Icon className={`h-3.5 w-3.5 ${color}`} />
      <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</span>
    </div>
    <p className="text-lg font-bold text-foreground">{value}</p>
  </div>
);

export default EscalationManagementPage;
