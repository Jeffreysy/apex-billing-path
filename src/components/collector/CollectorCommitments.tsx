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
import { toast } from "sonner";
import { DollarSign, CheckCircle, XCircle, Clock, AlertTriangle, CreditCard, ExternalLink } from "lucide-react";
import TakePaymentDialog, { type PaymentTarget } from "@/components/TakePaymentDialog";

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

interface Props {
  collectorName: string;
  isLead: boolean;
}

const CollectorCommitments = ({ collectorName, isLead }: Props) => {
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
      defaultAmount: Number(row.promised_amount) || 0,
      collectorName: row.collector || collectorName,
    });
    setPayOpen(true);
  };

  const { data: commitments = [], isLoading } = useQuery({
    queryKey: ["collector-commitments", isLead ? "all" : collectorName],
    queryFn: async () => {
      let query = supabase.from("payment_commitments").select("*").order("promised_date", { ascending: true });
      if (!isLead) query = query.eq("collector", collectorName);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const [editing, setEditing] = useState<any>(null);
  const [newStatus, setNewStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const stats = useMemo(() => {
    const pending = commitments.filter(c => c.status === "pending");
    const totalPromised = pending.reduce((s, c) => s + (c.promised_amount || 0), 0);
    const overdue = pending.filter(c => c.promised_date && c.promised_date < new Date().toISOString().slice(0, 10));
    return {
      pending: pending.length,
      kept: commitments.filter(c => c.status === "kept").length,
      broken: commitments.filter(c => c.status === "broken").length,
      totalPromised,
      overdue: overdue.length,
    };
  }, [commitments]);

  const handleUpdate = async () => {
    if (!editing || !newStatus) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("payment_commitments").update({ status: newStatus, notes: notes || editing.notes }).eq("id", editing.id);
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["collector-commitments"] });
      toast.success("Commitment updated");
      setEditing(null);
    } catch (err: any) {
      toast.error(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-5 gap-2">
        <div className="rounded-lg border bg-card p-2 text-center">
          <Clock className="h-3 w-3 mx-auto text-amber-500 mb-1" />
          <p className="text-[10px] text-muted-foreground">Pending</p>
          <p className="text-sm font-bold">{stats.pending}</p>
        </div>
        <div className="rounded-lg border bg-card p-2 text-center">
          <DollarSign className="h-3 w-3 mx-auto text-primary mb-1" />
          <p className="text-[10px] text-muted-foreground">Promised</p>
          <p className="text-sm font-bold">{fmt(stats.totalPromised)}</p>
        </div>
        <div className="rounded-lg border bg-card p-2 text-center">
          <CheckCircle className="h-3 w-3 mx-auto text-green-600 mb-1" />
          <p className="text-[10px] text-muted-foreground">Kept</p>
          <p className="text-sm font-bold">{stats.kept}</p>
        </div>
        <div className="rounded-lg border bg-card p-2 text-center">
          <XCircle className="h-3 w-3 mx-auto text-destructive mb-1" />
          <p className="text-[10px] text-muted-foreground">Broken</p>
          <p className="text-sm font-bold">{stats.broken}</p>
        </div>
        <div className="rounded-lg border bg-card p-2 text-center">
          <AlertTriangle className="h-3 w-3 mx-auto text-destructive mb-1" />
          <p className="text-[10px] text-muted-foreground">Overdue</p>
          <p className="text-sm font-bold">{stats.overdue}</p>
        </div>
      </div>

      <div className="rounded-lg border bg-card overflow-auto max-h-[350px]">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-card">
            <tr className="border-b bg-muted/50 text-muted-foreground">
              {isLead && <th className="px-2 py-1.5 text-left font-medium">Collector</th>}
              <th className="px-2 py-1.5 text-left font-medium">Amount</th>
              <th className="px-2 py-1.5 text-left font-medium">Promised Date</th>
              <th className="px-2 py-1.5 text-left font-medium">Follow-Up</th>
              <th className="px-2 py-1.5 text-left font-medium">Status</th>
              <th className="px-2 py-1.5 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={isLead ? 6 : 5} className="px-2 py-6 text-center text-muted-foreground">Loading...</td></tr>
            ) : commitments.length === 0 ? (
              <tr><td colSpan={isLead ? 6 : 5} className="px-2 py-6 text-center text-muted-foreground">No commitments</td></tr>
            ) : commitments.map(row => {
              const isOverdue = row.status === "pending" && row.promised_date < new Date().toISOString().slice(0, 10);
              return (
                <tr key={row.id} className={`border-b hover:bg-muted/30 ${isOverdue ? "bg-destructive/5" : ""}`}>
                  {isLead && <td className="px-2 py-1.5 font-medium">{row.collector}</td>}
                  <td className="px-2 py-1.5 font-mono">{fmt(row.promised_amount)}</td>
                  <td className="px-2 py-1.5">
                    <span className={isOverdue ? "text-destructive font-semibold" : ""}>{row.promised_date}</span>
                    {isOverdue && <span className="ml-1 text-[9px] text-destructive">OVERDUE</span>}
                  </td>
                  <td className="px-2 py-1.5">{row.follow_up_date || "—"}</td>
                  <td className="px-2 py-1.5">{statusBadge(row.status)}</td>
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
                        setEditing(row); setNewStatus(row.status); setNotes(row.notes || "");
                      }}>Update</Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Dialog open={!!editing} onOpenChange={v => { if (!v) setEditing(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="text-sm">Update Commitment</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">Promised: {fmt(editing?.promised_amount)} on {editing?.promised_date}</Label></div>
            <div><Label className="text-xs">Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s} className="text-xs capitalize">{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Notes</Label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="text-xs" />
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

export default CollectorCommitments;
