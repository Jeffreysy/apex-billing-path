import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ESCALATION_ASSIGNEES,
  ESCALATION_STATUSES,
  formatEscalationStatus,
  getEscalationPriorityBadgeVariant,
  getEscalationStatusBadgeVariant,
} from "@/lib/escalations";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle, Clock, Shield, CreditCard, ExternalLink } from "lucide-react";
import TakePaymentDialog, { type PaymentTarget } from "@/components/TakePaymentDialog";

function priorityBadge(p: string) {
  if (p === "high") return <Badge className="bg-amber-500 text-white text-xs">High</Badge>;
  return <Badge variant={getEscalationPriorityBadgeVariant(p)} className="text-xs capitalize">{p}</Badge>;
}

function statusBadge(s: string) {
  if (s === "resolved") return <Badge className="bg-green-600 text-white text-xs">Resolved</Badge>;
  if (s === "in_progress") return <Badge className="bg-blue-500 text-white text-xs">In Progress</Badge>;
  return <Badge variant={getEscalationStatusBadgeVariant(s)} className="text-xs capitalize">{formatEscalationStatus(s)}</Badge>;
}

interface Props {
  collectorName: string;
  isLead: boolean;
}

const CollectorEscalations = ({ collectorName, isLead }: Props) => {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [payOpen, setPayOpen] = useState(false);
  const [payTarget, setPayTarget] = useState<PaymentTarget | null>(null);

  const goToWorkspace = (row: any) => {
    const id = row.contract_id || row.client_id;
    if (!id) return;
    navigate(`/collections/workspace/${id}`);
  };

  const openPayment = (row: any) => {
    setPayTarget({
      clientId: row.client_id || null,
      contractId: row.contract_id || null,
      clientName: row.client_name || "Client",
      email: null,
      invoiceNumber: null,
      caseNumber: null,
      defaultAmount: 0,
      collectorName: row.raised_by || collectorName,
    });
    setPayOpen(true);
  };

  const { data: escalations = [], isLoading } = useQuery({
    queryKey: ["collector-escalations", isLead ? "all" : collectorName],
    queryFn: async () => {
      let query = supabase.from("escalations").select("*").order("created_at", { ascending: false });
      if (!isLead) query = query.eq("raised_by", collectorName);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const [editing, setEditing] = useState<any>(null);
  const [newStatus, setNewStatus] = useState("");
  const [newAssignee, setNewAssignee] = useState("");
  const [resNotes, setResNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const stats = useMemo(() => ({
    open: escalations.filter(e => e.status === "open").length,
    inProgress: escalations.filter(e => e.status === "in_progress").length,
    urgent: escalations.filter(e => e.priority === "urgent" && e.status !== "resolved" && e.status !== "closed").length,
    resolved: escalations.filter(e => e.status === "resolved").length,
  }), [escalations]);

  const handleUpdate = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const updates: any = {};
      if (newStatus) updates.status = newStatus;
      if (newAssignee) updates.assigned_to = newAssignee;
      if (resNotes) updates.resolution_notes = resNotes;
      if (newStatus === "resolved" || newStatus === "closed") updates.resolved_at = new Date().toISOString();
      const { error } = await supabase.from("escalations").update(updates).eq("id", editing.id);
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["collector-escalations"] });
      toast.success("Escalation updated");
      setEditing(null);
    } catch (err: any) {
      toast.error(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-2">
        <div className="rounded-lg border bg-card p-2 text-center">
          <AlertTriangle className="h-3 w-3 mx-auto text-destructive mb-1" />
          <p className="text-xs text-muted-foreground">Open</p>
          <p className="text-sm font-bold">{stats.open}</p>
        </div>
        <div className="rounded-lg border bg-card p-2 text-center">
          <Clock className="h-3 w-3 mx-auto text-blue-500 mb-1" />
          <p className="text-xs text-muted-foreground">In Progress</p>
          <p className="text-sm font-bold">{stats.inProgress}</p>
        </div>
        <div className="rounded-lg border bg-card p-2 text-center">
          <Shield className="h-3 w-3 mx-auto text-amber-500 mb-1" />
          <p className="text-xs text-muted-foreground">Urgent</p>
          <p className="text-sm font-bold">{stats.urgent}</p>
        </div>
        <div className="rounded-lg border bg-card p-2 text-center">
          <CheckCircle className="h-3 w-3 mx-auto text-green-600 mb-1" />
          <p className="text-xs text-muted-foreground">Resolved</p>
          <p className="text-sm font-bold">{stats.resolved}</p>
        </div>
      </div>

      <div className="rounded-lg border bg-card overflow-auto max-h-[350px]">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-card">
            <tr className="border-b bg-muted/50 text-muted-foreground">
              <th className="px-2 py-1.5 text-left font-medium">Date</th>
              <th className="px-2 py-1.5 text-left font-medium">Raised By</th>
              <th className="px-2 py-1.5 text-left font-medium">Priority</th>
              <th className="px-2 py-1.5 text-left font-medium">Status</th>
              <th className="px-2 py-1.5 text-left font-medium">Reason</th>
              <th className="px-2 py-1.5 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="px-2 py-6 text-center text-muted-foreground">Loading...</td></tr>
            ) : escalations.length === 0 ? (
              <tr><td colSpan={6} className="px-2 py-6 text-center text-muted-foreground">No escalations</td></tr>
            ) : escalations.map(row => (
              <tr key={row.id} className={`border-b hover:bg-muted/30 ${row.priority === "urgent" && row.status === "open" ? "bg-destructive/5" : ""}`}>
                <td className="px-2 py-1.5">{row.created_at ? new Date(row.created_at).toLocaleDateString() : "—"}</td>
                <td className="px-2 py-1.5 font-medium">{row.raised_by}</td>
                <td className="px-2 py-1.5">{priorityBadge(row.priority)}</td>
                <td className="px-2 py-1.5">{statusBadge(row.status)}</td>
                <td className="px-2 py-1.5 max-w-[150px] truncate" title={row.trigger_reason}>{row.trigger_reason}</td>
                <td className="px-2 py-1.5">
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      title="Take payment"
                      disabled={!row.client_id && !row.contract_id}
                      onClick={() => openPayment(row)}
                    >
                      <CreditCard className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      title="Open workspace"
                      disabled={!row.client_id && !row.contract_id}
                      onClick={() => goToWorkspace(row)}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => {
                      setEditing(row); setNewStatus(row.status); setNewAssignee(row.assigned_to || ""); setResNotes(row.resolution_notes || "");
                    }}>Manage</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!editing} onOpenChange={v => { if (!v) setEditing(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="text-sm">Manage Escalation</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{ESCALATION_STATUSES.map(s => <SelectItem key={s} value={s} className="text-xs capitalize">{formatEscalationStatus(s)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Assign To</Label>
              <Select value={newAssignee} onValueChange={setNewAssignee}>
                <SelectTrigger className="text-xs"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{ESCALATION_ASSIGNEES.map(a => <SelectItem key={a} value={a} className="text-xs">{a}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Notes</Label>
              <Textarea value={resNotes} onChange={e => setResNotes(e.target.value)} rows={2} className="text-xs" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TakePaymentDialog open={payOpen} onOpenChange={setPayOpen} target={payTarget} />
    </div>
  );
};

export default CollectorEscalations;
