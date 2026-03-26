import { useParams, useNavigate, Link } from "react-router-dom";
import { useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useCollectionsDashboard, useCollectionActivities } from "@/hooks/useSupabaseData";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import CallDocumentationDialog from "@/components/CallDocumentationDialog";
import { toast } from "sonner";
import {
  ArrowLeft, Phone, DollarSign, AlertTriangle, Calendar,
  Clock, FileText, Users, ChevronRight, Shield,
} from "lucide-react";

// --- helpers ---
function agingBucket(days: number | null): string {
  const d = days || 0;
  if (d <= 0) return "Current";
  if (d <= 30) return "1-30 days";
  if (d <= 60) return "31-60 days";
  if (d <= 90) return "61-90 days";
  return "90+ days";
}

function priorityLabel(score: number | null) {
  const s = score || 0;
  if (s >= 80) return { label: "Urgent", variant: "destructive" as const };
  if (s >= 60) return { label: "High", variant: "default" as const };
  if (s >= 40) return { label: "Medium", variant: "secondary" as const };
  return { label: "Low", variant: "outline" as const };
}

const OUTCOMES = [
  { value: "payment_taken", label: "Payment Taken" },
  { value: "promise_to_pay", label: "Promise to Pay" },
  { value: "no_answer", label: "No Answer" },
  { value: "left_voicemail", label: "Left Voicemail" },
  { value: "callback_scheduled", label: "Callback Scheduled" },
  { value: "disputed", label: "Disputed" },
  { value: "wrong_number", label: "Wrong Number" },
  { value: "client_satisfied", label: "Client Satisfied" },
];

const COLLECTORS = ["Alejandro A", "Patricio D", "Maritza V"];

const CollectorWorkspace = () => {
  const { accountId } = useParams<{ accountId: string }>();
  const navigate = useNavigate();

  // Queue data for this account
  const { data: queue = [], isLoading: ql } = useCollectionsDashboard();
  const { data: activities = [], isLoading: al } = useCollectionActivities();

  // Live: payment_commitments for this client
  const { data: commitments = [], isLoading: cl } = useQuery({
    queryKey: ["commitments", accountId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_commitments")
        .select("*")
        .or(`client_id.eq.${accountId},contract_id.eq.${accountId}`)
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data || [];
    },
    enabled: !!accountId,
  });

  // Live: escalations for this client
  const { data: escalations = [], isLoading: el } = useQuery({
    queryKey: ["escalations", accountId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("escalations")
        .select("*")
        .or(`client_id.eq.${accountId},contract_id.eq.${accountId}`)
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data || [];
    },
    enabled: !!accountId,
  });

  // Dialogs
  const [callOpen, setCallOpen] = useState(false);
  const [commitOpen, setCommitOpen] = useState(false);
  const [escalateOpen, setEscalateOpen] = useState(false);
  const [followUpOpen, setFollowUpOpen] = useState(false);

  // Call form state removed — now handled by CallDocumentationDialog

  const [commitAmount, setCommitAmount] = useState("");
  const [commitDate, setCommitDate] = useState("");
  const [commitFollowUp, setCommitFollowUp] = useState("");
  const [commitNotes, setCommitNotes] = useState("");

  const [escReason, setEscReason] = useState("");
  const [escPriority, setEscPriority] = useState("medium");
  const [escAssign, setEscAssign] = useState("");
  const [escNotes, setEscNotes] = useState("");

  const [followUpDate, setFollowUpDate] = useState("");

  // Find the account from queue
  const account = useMemo(() => {
    return queue.find((q: any) => q.contract_id === accountId || q.client_id === accountId);
  }, [queue, accountId]);

  // Recent activities for this client
  const recentActivities = useMemo(() => {
    if (!account) return [];
    return activities
      .filter(a => a.clientName === account.client_name || a.clientId === account.client_id)
      .slice(0, 8);
  }, [activities, account]);

  const lastContacted = recentActivities.length > 0 ? recentActivities[0].date : "Never";
  const openEscalations = escalations.filter((e: any) => e.status === "open" || e.status === "in_progress");
  const latestCommitment = commitments.length > 0 ? commitments[0] : null;

  // handleLogCall removed — now handled by CallDocumentationDialog

  const handleCreateCommitment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commitAmount || !commitDate) { toast.error("Amount and date required"); return; }
    try {
      const { error } = await supabase.from("payment_commitments").insert({
        client_id: account?.client_id,
        contract_id: account?.contract_id,
        collector: account?.collector || account?.assigned_collector || "Unknown",
        promised_amount: Number(commitAmount),
        promised_date: commitDate,
        follow_up_date: commitFollowUp || null,
        notes: commitNotes || null,
      });
      if (error) throw error;
      toast.success("Payment commitment created");
      setCommitOpen(false);
      setCommitAmount("");
      setCommitDate("");
      setCommitFollowUp("");
      setCommitNotes("");
    } catch (err: any) {
      toast.error(err.message || "Failed to create commitment");
    }
  };

  const handleCreateEscalation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!escReason) { toast.error("Trigger reason required"); return; }
    try {
      const { error } = await supabase.from("escalations").insert({
        client_id: account?.client_id,
        contract_id: account?.contract_id || null,
        raised_by: account?.collector || account?.assigned_collector || "Unknown",
        assigned_to: escAssign || null,
        trigger_reason: escReason,
        priority: escPriority,
      });
      if (error) throw error;
      toast.success("Escalation created");
      setEscalateOpen(false);
      setEscReason("");
      setEscPriority("medium");
      setEscAssign("");
      setEscNotes("");
    } catch (err: any) {
      toast.error(err.message || "Failed to create escalation");
    }
  };

  const handleSetFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Follow-up set for ${followUpDate}`);
    setFollowUpOpen(false);
    setFollowUpDate("");
  };

  if (ql || al) {
    return <DashboardLayout title="Workspace"><div className="p-8 text-center text-muted-foreground">Loading...</div></DashboardLayout>;
  }

  if (!account) {
    return (
      <DashboardLayout title="Workspace">
        <div className="p-8 text-center">
          <p className="text-muted-foreground mb-4">Account not found in queue.</p>
          <Button variant="outline" onClick={() => navigate("/collections/queue")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Queue
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const priority = priorityLabel(account.priority_score);
  const daysOut = account.days_past_due || 0;
  const balance = Number(account.balance_remaining) || 0;
  const contractVal = Number(account.contract_value) || 0;
  const collected = Number(account.collected) || 0;
  const collectionPct = contractVal > 0 ? Math.round((collected / contractVal) * 100) : 0;

  return (
    <DashboardLayout title={`Workspace — ${account.client_name}`}>
      {/* Back nav */}
      <div className="mb-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/collections/queue")} className="text-xs gap-1 text-muted-foreground">
          <ArrowLeft className="h-3 w-3" /> Back to Call Queue
        </Button>
      </div>

      {/* === TOP SUMMARY BAR === */}
      <div className="rounded-lg border bg-card p-4 mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
              {(account.client_name || "?").split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold">{account.client_name}</h1>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                <span>{account.phone || "No phone"}</span>
                <span>·</span>
                <span>{account.case_number || "No case #"}</span>
                <span>·</span>
                <span>{account.collector || account.assigned_collector || "Unassigned"}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={priority.variant}>{priority.label}</Badge>
            <Badge variant={daysOut > 60 ? "destructive" : daysOut > 30 ? "secondary" : "outline"}>
              {daysOut > 0 ? `${daysOut}d past due` : "Current"}
            </Badge>
            {openEscalations.length > 0 && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" /> {openEscalations.length} Escalation{openEscalations.length > 1 ? "s" : ""}
              </Badge>
            )}
            {latestCommitment && (
              <Badge variant="secondary" className="gap-1">
                <DollarSign className="h-3 w-3" /> ${Number(latestCommitment.promised_amount).toLocaleString()} promised
              </Badge>
            )}
          </div>
        </div>

        {/* Key metrics row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mt-4 pt-4 border-t">
          <MetricCell label="Outstanding" value={`$${balance.toLocaleString()}`} />
          <MetricCell label="Contract Value" value={`$${contractVal.toLocaleString()}`} />
          <MetricCell label="Collected" value={`$${collected.toLocaleString()} (${collectionPct}%)`} />
          <MetricCell label="Aging" value={agingBucket(daysOut)} />
          <MetricCell label="Last Contact" value={lastContacted} />
          <MetricCell label="Next Due" value={account.next_due_date || "—"} />
          <MetricCell label="Next Follow-Up" value={account.next_payment_date || "—"} />
        </div>
      </div>

      {/* === QUICK ACTIONS === */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button onClick={() => setCallOpen(true)} className="gap-2">
          <Phone className="h-4 w-4" /> Log Call Outcome
        </Button>
        <Button variant="outline" onClick={() => setCommitOpen(true)} className="gap-2">
          <DollarSign className="h-4 w-4" /> Create Payment Commitment
        </Button>
        <Button variant="outline" onClick={() => setEscalateOpen(true)} className="gap-2">
          <AlertTriangle className="h-4 w-4" /> Create Escalation
        </Button>
        <Button variant="outline" onClick={() => setFollowUpOpen(true)} className="gap-2">
          <Calendar className="h-4 w-4" /> Set Follow-Up
        </Button>
      </div>

      {/* === MAIN GRID === */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Account Summary */}
        <Section title="Account Summary" icon={<FileText className="h-4 w-4" />}>
          <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
            <DetailRow label="Contract Status" value={account.contract_status || "—"} />
            <DetailRow label="Delinquency" value={account.delinquency_status || "Current"} />
            <DetailRow label="Monthly Installment" value={`$${(Number(account.monthly_installment) || 0).toLocaleString()}`} />
            <DetailRow label="Practice Area" value={account.practice_area || "—"} />
            <DetailRow label="Case Stage" value={account.case_stage || account.immigration_stage || "—"} />
            <DetailRow label="Lead Attorney" value={account.lead_attorney || "—"} />
            <DetailRow label="Language" value={account.preferred_language || "—"} />
            <DetailRow label="Email" value={account.email || "—"} />
          </div>
        </Section>

        {/* Recent Activity */}
        <Section title="Recent Collection Activity" icon={<Clock className="h-4 w-4" />}>
          {recentActivities.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recorded activity for this account.</p>
          ) : (
            <div className="space-y-3 max-h-[280px] overflow-y-auto">
              {recentActivities.map(a => (
                <div key={a.id} className="flex items-start justify-between border-b pb-2 last:border-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium">{a.collectorName} · {a.date}</p>
                    {a.notes && <p className="text-xs text-muted-foreground mt-0.5">{a.notes}</p>}
                  </div>
                  <Badge variant="outline" className="text-xs capitalize shrink-0 ml-2">
                    {a.outcome.replace(/_/g, " ")}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Payment Commitments */}
        <Section title="Payment Commitments" icon={<DollarSign className="h-4 w-4" />}>
          {cl ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : commitments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payment commitments recorded.</p>
          ) : (
            <div className="space-y-3 max-h-[250px] overflow-y-auto">
              {commitments.map((c: any) => (
                <div key={c.id} className="rounded border p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">${Number(c.promised_amount).toLocaleString()} by {c.promised_date}</p>
                    <Badge
                      variant={
                        c.status === "kept" ? "default" :
                        c.status === "broken" ? "destructive" :
                        c.status === "rescheduled" ? "secondary" : "outline"
                      }
                      className="text-xs capitalize"
                    >
                      {c.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>Collector: {c.collector}</span>
                    {c.follow_up_date && <span>· Follow-up: {c.follow_up_date}</span>}
                  </div>
                  {c.notes && <p className="text-xs text-muted-foreground mt-1">{c.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Escalations */}
        <Section title="Escalations" icon={<Shield className="h-4 w-4" />}>
          {el ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : escalations.length === 0 ? (
            <p className="text-sm text-muted-foreground">No escalations recorded.</p>
          ) : (
            <div className="space-y-3 max-h-[250px] overflow-y-auto">
              {escalations.map((esc: any) => (
                <div key={esc.id} className="rounded border p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{esc.trigger_reason}</p>
                    <div className="flex gap-1">
                      <Badge
                        variant={
                          esc.priority === "urgent" ? "destructive" :
                          esc.priority === "high" ? "default" :
                          esc.priority === "medium" ? "secondary" : "outline"
                        }
                        className="text-xs capitalize"
                      >
                        {esc.priority}
                      </Badge>
                      <Badge
                        variant={esc.status === "open" ? "destructive" : esc.status === "resolved" ? "default" : "secondary"}
                        className="text-xs capitalize"
                      >
                        {esc.status.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>Raised by: {esc.raised_by}</span>
                    {esc.assigned_to && <span>· Assigned to: {esc.assigned_to}</span>}
                    <span>· {new Date(esc.created_at).toLocaleDateString()}</span>
                  </div>
                  {esc.resolution_notes && <p className="text-xs text-muted-foreground mt-1">{esc.resolution_notes}</p>}
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>

      {/* ===== DIALOGS ===== */}

      {/* Log Call */}
      <Dialog open={callOpen} onOpenChange={setCallOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Log Call Outcome</DialogTitle></DialogHeader>
          <form onSubmit={handleLogCall} className="space-y-4">
            <div>
              <Label>Outcome</Label>
              <Select value={callOutcome} onValueChange={setCallOutcome}>
                <SelectTrigger><SelectValue placeholder="Select outcome" /></SelectTrigger>
                <SelectContent>
                  {OUTCOMES.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Duration (minutes)</Label>
              <Input type="number" value={callDuration} onChange={e => setCallDuration(e.target.value)} placeholder="5" />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea value={callNotes} onChange={e => setCallNotes(e.target.value)} placeholder="Call notes..." rows={3} />
            </div>
            <DialogFooter><Button type="submit">Save Call</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Commitment */}
      <Dialog open={commitOpen} onOpenChange={setCommitOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Payment Commitment</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateCommitment} className="space-y-4">
            <div>
              <Label>Promised Amount</Label>
              <Input type="number" step="0.01" value={commitAmount} onChange={e => setCommitAmount(e.target.value)} placeholder="0.00" />
            </div>
            <div>
              <Label>Promised Date</Label>
              <Input type="date" value={commitDate} onChange={e => setCommitDate(e.target.value)} />
            </div>
            <div>
              <Label>Follow-Up Date</Label>
              <Input type="date" value={commitFollowUp} onChange={e => setCommitFollowUp(e.target.value)} />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea value={commitNotes} onChange={e => setCommitNotes(e.target.value)} placeholder="Details..." rows={2} />
            </div>
            <DialogFooter><Button type="submit">Create Commitment</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Escalation */}
      <Dialog open={escalateOpen} onOpenChange={setEscalateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Escalation</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateEscalation} className="space-y-4">
            <div>
              <Label>Trigger Reason</Label>
              <Textarea value={escReason} onChange={e => setEscReason(e.target.value)} placeholder="Why is this being escalated?" rows={2} />
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={escPriority} onValueChange={setEscPriority}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Assign To</Label>
              <Select value={escAssign} onValueChange={setEscAssign}>
                <SelectTrigger><SelectValue placeholder="Select person" /></SelectTrigger>
                <SelectContent>
                  {COLLECTORS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  <SelectItem value="Management">Management</SelectItem>
                  <SelectItem value="Legal">Legal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter><Button type="submit">Create Escalation</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Set Follow-Up */}
      <Dialog open={followUpOpen} onOpenChange={setFollowUpOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Set Next Follow-Up</DialogTitle></DialogHeader>
          <form onSubmit={handleSetFollowUp} className="space-y-4">
            <div>
              <Label>Follow-Up Date</Label>
              <Input type="date" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)} />
            </div>
            <DialogFooter><Button type="submit" disabled={!followUpDate}>Set Follow-Up</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

// --- Small reusable pieces ---
const Section = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
  <div className="rounded-lg border bg-card p-4">
    <h2 className="text-sm font-semibold flex items-center gap-2 mb-3">{icon}{title}</h2>
    {children}
  </div>
);

const MetricCell = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
    <p className="text-sm font-semibold mt-0.5">{value}</p>
  </div>
);

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <>
    <p className="text-muted-foreground">{label}</p>
    <p className="font-medium">{value}</p>
  </>
);

export default CollectorWorkspace;
