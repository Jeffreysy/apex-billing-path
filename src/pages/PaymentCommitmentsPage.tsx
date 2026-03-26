import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
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
  DollarSign, Calendar, Search, Filter, CheckCircle, XCircle,
  Clock, AlertTriangle, ArrowUpDown,
} from "lucide-react";

const COLLECTORS = ["Alejandro A", "Maritza V"];
const STATUSES = ["pending", "kept", "broken", "partial", "rescheduled"];

function statusBadge(status: string) {
  switch (status) {
    case "kept": return <Badge className="bg-green-600 text-xs">{status}</Badge>;
    case "broken": return <Badge variant="destructive" className="text-xs">{status}</Badge>;
    case "partial": return <Badge className="bg-amber-500 text-white text-xs">{status}</Badge>;
    case "rescheduled": return <Badge variant="secondary" className="text-xs">{status}</Badge>;
    default: return <Badge variant="outline" className="text-xs">{status}</Badge>;
  }
}

function fmt(n: number | null) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n || 0);
}

const PaymentCommitmentsPage = () => {
  const qc = useQueryClient();

  const { data: commitments = [], isLoading } = useQuery({
    queryKey: ["all-payment-commitments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_commitments")
        .select("*")
        .order("promised_date", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  // Filters
  const [search, setSearch] = useState("");
  const [filterCollector, setFilterCollector] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortField, setSortField] = useState<"promised_date" | "promised_amount">("promised_date");
  const [sortAsc, setSortAsc] = useState(true);

  // Update dialog
  const [editing, setEditing] = useState<any>(null);
  const [newStatus, setNewStatus] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    let rows = [...commitments];

    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(r =>
        r.collector?.toLowerCase().includes(q) ||
        r.client_id?.toLowerCase().includes(q) ||
        r.notes?.toLowerCase().includes(q)
      );
    }
    if (filterCollector !== "all") rows = rows.filter(r => r.collector === filterCollector);
    if (filterStatus !== "all") rows = rows.filter(r => r.status === filterStatus);

    rows.sort((a, b) => {
      const av = sortField === "promised_amount" ? (a.promised_amount || 0) : (a.promised_date || "");
      const bv = sortField === "promised_amount" ? (b.promised_amount || 0) : (b.promised_date || "");
      if (av < bv) return sortAsc ? -1 : 1;
      if (av > bv) return sortAsc ? 1 : -1;
      return 0;
    });

    return rows;
  }, [commitments, search, filterCollector, filterStatus, sortField, sortAsc]);

  const toggleSort = (field: "promised_date" | "promised_amount") => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(true); }
  };

  const handleUpdate = async () => {
    if (!editing || !newStatus) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("payment_commitments")
        .update({
          status: newStatus,
          notes: resolutionNotes || editing.notes,
        })
        .eq("id", editing.id);
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["all-payment-commitments"] });
      toast.success("Commitment updated");
      setEditing(null);
    } catch (err: any) {
      toast.error(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  // Summary stats
  const stats = useMemo(() => {
    const pending = commitments.filter(c => c.status === "pending");
    const kept = commitments.filter(c => c.status === "kept");
    const broken = commitments.filter(c => c.status === "broken");
    const totalPromised = pending.reduce((s, c) => s + (c.promised_amount || 0), 0);
    const overdue = pending.filter(c => c.promised_date && c.promised_date < new Date().toISOString().slice(0, 10));
    return { pending: pending.length, kept: kept.length, broken: broken.length, totalPromised, overdue: overdue.length };
  }, [commitments]);

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Payment Commitments</h1>
            <p className="text-xs text-muted-foreground">Track and manage all promise-to-pay records</p>
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <KpiCard icon={Clock} label="Pending" value={stats.pending} color="text-amber-500" />
          <KpiCard icon={DollarSign} label="Total Promised" value={fmt(stats.totalPromised)} color="text-primary" />
          <KpiCard icon={CheckCircle} label="Kept" value={stats.kept} color="text-green-600" />
          <KpiCard icon={XCircle} label="Broken" value={stats.broken} color="text-destructive" />
          <KpiCard icon={AlertTriangle} label="Overdue" value={stats.overdue} color="text-destructive" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search collector, notes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 text-xs h-9"
            />
          </div>
          <Select value={filterCollector} onValueChange={setFilterCollector}>
            <SelectTrigger className="w-[160px] text-xs h-9">
              <Filter className="h-3 w-3 mr-1" />
              <SelectValue placeholder="Collector" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Collectors</SelectItem>
              {COLLECTORS.map(c => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px] text-xs h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Statuses</SelectItem>
              {STATUSES.map(s => <SelectItem key={s} value={s} className="text-xs capitalize">{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-lg border bg-card overflow-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b bg-muted/50 text-muted-foreground">
                <th className="px-3 py-2 text-left font-medium">Collector</th>
                <th className="px-3 py-2 text-left font-medium cursor-pointer" onClick={() => toggleSort("promised_amount")}>
                  <span className="flex items-center gap-1">Amount <ArrowUpDown className="h-3 w-3" /></span>
                </th>
                <th className="px-3 py-2 text-left font-medium cursor-pointer" onClick={() => toggleSort("promised_date")}>
                  <span className="flex items-center gap-1">Promised Date <ArrowUpDown className="h-3 w-3" /></span>
                </th>
                <th className="px-3 py-2 text-left font-medium">Follow-Up</th>
                <th className="px-3 py-2 text-left font-medium">Status</th>
                <th className="px-3 py-2 text-left font-medium">Notes</th>
                <th className="px-3 py-2 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="px-3 py-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-3 py-8 text-center text-muted-foreground">No commitments found</td></tr>
              ) : filtered.map(row => {
                const isOverdue = row.status === "pending" && row.promised_date < new Date().toISOString().slice(0, 10);
                return (
                  <tr key={row.id} className={`border-b hover:bg-muted/30 ${isOverdue ? "bg-destructive/5" : ""}`}>
                    <td className="px-3 py-2 font-medium">{row.collector}</td>
                    <td className="px-3 py-2 font-mono">{fmt(row.promised_amount)}</td>
                    <td className="px-3 py-2">
                      <span className={isOverdue ? "text-destructive font-semibold" : ""}>
                        {row.promised_date}
                      </span>
                      {isOverdue && <span className="ml-1 text-[10px] text-destructive">OVERDUE</span>}
                    </td>
                    <td className="px-3 py-2">{row.follow_up_date || "—"}</td>
                    <td className="px-3 py-2">{statusBadge(row.status)}</td>
                    <td className="px-3 py-2 max-w-[200px] truncate" title={row.notes || ""}>{row.notes || "—"}</td>
                    <td className="px-3 py-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => {
                          setEditing(row);
                          setNewStatus(row.status);
                          setResolutionNotes(row.notes || "");
                        }}
                      >
                        Update
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Update dialog */}
        <Dialog open={!!editing} onOpenChange={v => { if (!v) setEditing(null); }}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-sm">Update Commitment</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Promised: {fmt(editing?.promised_amount)} on {editing?.promised_date}</Label>
              </div>
              <div>
                <Label className="text-xs">Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map(s => <SelectItem key={s} value={s} className="text-xs capitalize">{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Notes</Label>
                <Textarea
                  value={resolutionNotes}
                  onChange={e => setResolutionNotes(e.target.value)}
                  rows={2}
                  className="text-xs"
                  maxLength={500}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              <Button onClick={handleUpdate} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

const KpiCard = ({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) => (
  <div className="rounded-lg border bg-card p-3">
    <div className="flex items-center gap-2 mb-1">
      <Icon className={`h-3.5 w-3.5 ${color}`} />
      <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</span>
    </div>
    <p className="text-lg font-bold text-foreground">{value}</p>
  </div>
);

export default PaymentCommitmentsPage;
