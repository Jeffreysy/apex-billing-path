import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import TaskPanel from "@/components/TaskPanel";
import { useCollectionsDashboard, usePaymentsData, useCollectionActivities, useCollectors } from "@/hooks/useSupabaseData";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, Phone, Clock, Users, ExternalLink, AlertTriangle, Target, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import MonthFilter, { filterByMonth } from "@/components/MonthFilter";

const CollectionsDashboard = () => {
  const navigate = useNavigate();
  const { data: queue = [], isLoading: ql } = useCollectionsDashboard();
  const { data: payments = [], isLoading: pl } = usePaymentsData();
  const { data: callLogs = [], isLoading: cal } = useCollectionActivities();
  const { data: collectors = [], isLoading: col } = useCollectors();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [callOpen, setCallOpen] = useState(false);
  const [month, setMonth] = useState(() => format(new Date(), "yyyy-MM"));

  const { data: escalations = [] } = useQuery({
    queryKey: ["collections-escalations"],
    queryFn: async () => {
      const { data } = await supabase.from("escalations").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: commitments = [] } = useQuery({
    queryKey: ["collections-commitments"],
    queryFn: async () => {
      const { data } = await supabase.from("payment_commitments").select("*").order("promised_date", { ascending: true });
      return data || [];
    },
  });

  const { data: activities = [] } = useQuery({
    queryKey: ["collections-all-activities"],
    queryFn: async () => {
      const { data } = await supabase.from("collection_activities").select("*").order("activity_date", { ascending: false }).limit(500);
      return data || [];
    },
  });

  if (ql || pl || cal || col) return <DashboardLayout title="Collections"><div className="p-8 text-center text-muted-foreground">Loading...</div></DashboardLayout>;

  const filteredPayments = useMemo(() => filterByMonth(payments, "date", month), [payments, month]);
  const filteredCalls = useMemo(() => filterByMonth(callLogs, "date", month), [callLogs, month]);
  const filteredActivities = useMemo(() => filterByMonth(activities, "activity_date", month), [activities, month]);

  const totalCollected = filteredPayments.reduce((s, p) => s + p.amount, 0);
  const totalCalls = filteredCalls.length;
  const promiseToPay = filteredCalls.filter(c => c.outcome === "promise_to_pay").length;
  const delinquent = queue.filter((c: any) => (c.delinquency_status || "").toLowerCase() === "delinquent").length;
  const openEscalations = escalations.filter(e => e.status === "open" || e.status === "in_progress").length;
  const pendingCommitments = commitments.filter(c => c.status === "pending").length;

  const recentCalls = [...filteredCalls].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10);
  const recentPayments = [...filteredPayments].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);

  const outcomeColors: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
    payment_taken: "default", promise_to_pay: "secondary", no_answer: "outline",
    left_voicemail: "outline", callback_scheduled: "secondary", disputed: "destructive",
  };

  const handlePayment = (e: React.FormEvent) => { e.preventDefault(); toast.success("Payment recorded!"); setPaymentOpen(false); };
  const handleCall = (e: React.FormEvent) => { e.preventDefault(); toast.success("Call logged!"); setCallOpen(false); };

  return (
    <DashboardLayout title="Collections — Admin View">
      <div className="mb-6 flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Collections Operations</h1><p className="text-muted-foreground">Admin & management overview — all teams, all data</p></div>
        <div className="flex gap-2">
          <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
            <DialogTrigger asChild><Button><DollarSign className="mr-2 h-4 w-4" />Take Payment</Button></DialogTrigger>
            <DialogContent><DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>
              <form onSubmit={handlePayment} className="space-y-4">
                <div><Label>Client</Label><Select><SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger><SelectContent>{queue.slice(0, 50).map((c: any) => <SelectItem key={c.contract_id || c.client_id} value={c.client_id || ""}>{c.client_name}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Amount</Label><Input type="number" placeholder="0.00" /></div>
                <div><Label>Method</Label><Select><SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger><SelectContent><SelectItem value="card">Credit Card</SelectItem><SelectItem value="ach">ACH</SelectItem><SelectItem value="check">Check</SelectItem><SelectItem value="cash">Cash</SelectItem></SelectContent></Select></div>
                <DialogFooter><Button type="submit">Process Payment</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={callOpen} onOpenChange={setCallOpen}>
            <DialogTrigger asChild><Button variant="outline"><Phone className="mr-2 h-4 w-4" />Log Call</Button></DialogTrigger>
            <DialogContent><DialogHeader><DialogTitle>Log Phone Call</DialogTitle></DialogHeader>
              <form onSubmit={handleCall} className="space-y-4">
                <div><Label>Client</Label><Select><SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger><SelectContent>{queue.slice(0, 50).map((c: any) => <SelectItem key={c.contract_id || c.client_id} value={c.client_id || ""}>{c.client_name}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Duration (min)</Label><Input type="number" placeholder="5" /></div>
                <div><Label>Outcome</Label><Select><SelectTrigger><SelectValue placeholder="Select outcome" /></SelectTrigger><SelectContent><SelectItem value="payment_taken">Payment Taken</SelectItem><SelectItem value="promise_to_pay">Promise to Pay</SelectItem><SelectItem value="no_answer">No Answer</SelectItem><SelectItem value="left_voicemail">Left Voicemail</SelectItem><SelectItem value="callback_scheduled">Callback Scheduled</SelectItem><SelectItem value="disputed">Disputed</SelectItem></SelectContent></Select></div>
                <div><Label>Notes</Label><Textarea placeholder="Call notes..." /></div>
                <DialogFooter><Button type="submit">Save Call</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Total Collected" value={`$${totalCollected.toLocaleString()}`} icon={<DollarSign className="h-5 w-5" />} />
        <StatCard label="Total Calls" value={String(totalCalls)} icon={<Phone className="h-5 w-5" />} />
        <StatCard label="Promise to Pay" value={String(promiseToPay)} icon={<Target className="h-5 w-5" />} />
        <StatCard label="Delinquent" value={String(delinquent)} icon={<AlertTriangle className="h-5 w-5" />} />
        <StatCard label="Open Escalations" value={String(openEscalations)} icon={<AlertTriangle className="h-5 w-5" />} />
        <StatCard label="Pending Commits" value={String(pendingCommitments)} icon={<CheckCircle className="h-5 w-5" />} />
      </div>

      {/* Tabbed view for all sections */}
      <div className="mt-6">
        <Tabs defaultValue="queue" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="queue">Queue</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="activity">Activity Log</TabsTrigger>
            <TabsTrigger value="escalations">Escalations</TabsTrigger>
            <TabsTrigger value="commitments">Commitments</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          {/* Queue */}
          <TabsContent value="queue">
            <div className="dashboard-section">
              <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold">Client Queue</h2><Badge variant="secondary">{queue.length} accounts</Badge></div>
              <div className="max-h-[500px] space-y-2 overflow-y-auto">
                {queue.slice(0, 30).map((c: any) => {
                  const daysOut = Number(c.days_past_due) || 0;
                  const isDelinquent = (c.delinquency_status || "").toLowerCase() === "delinquent";
                  return (
                    <div key={c.contract_id || c.client_id} className="queue-item cursor-pointer" onClick={() => navigate(`/collections/workspace/${c.client_id}`)}>
                      <div><p className="font-medium text-sm">{c.client_name}</p><p className="text-xs text-muted-foreground">{c.phone} · Due: {c.next_due_date || "—"} · {c.collector || c.assigned_collector || "Unassigned"}</p>{daysOut > 0 && <p className="text-xs text-destructive font-medium">{daysOut} days past due</p>}</div>
                      <div className="flex items-center gap-2"><Badge variant={isDelinquent ? "destructive" : "default"} className="text-xs">{c.contract_status || c.delinquency_status || "Active"}</Badge></div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* Team */}
          <TabsContent value="team">
            <div className="dashboard-section">
              <h2 className="mb-4 text-lg font-semibold">Team Performance</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {collectors.map(c => (
                  <div key={c.id} className="flex items-center gap-3 rounded-md border p-4 cursor-pointer hover:bg-muted/30" onClick={() => navigate(`/collector/${encodeURIComponent(c.name)}`)}>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{c.avatar}</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{c.name} {c.isLead && <Badge variant="secondary" className="ml-1 text-[10px]">Lead</Badge>}</p>
                      <p className="text-xs text-muted-foreground">{c.callsMade} calls · {c.paymentsTaken} payments</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">${c.totalCollected.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Commission: ${c.totalCommission.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Activity Log */}
          <TabsContent value="activity">
            <div className="dashboard-section">
              <h2 className="mb-4 text-lg font-semibold">All Activity ({activities.length} records)</h2>
              <div className="rounded-lg border bg-card overflow-auto max-h-[500px]">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-card">
                    <tr className="border-b bg-muted/50 text-muted-foreground">
                      <th className="px-3 py-2 text-left font-medium">Date</th>
                      <th className="px-3 py-2 text-left font-medium">Collector</th>
                      <th className="px-3 py-2 text-left font-medium">Client</th>
                      <th className="px-3 py-2 text-left font-medium">Outcome</th>
                      <th className="px-3 py-2 text-left font-medium">Collected</th>
                      <th className="px-3 py-2 text-left font-medium">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activities.slice(0, 200).map(row => (
                      <tr key={row.id} className="border-b hover:bg-muted/30">
                        <td className="px-3 py-2">{row.activity_date}</td>
                        <td className="px-3 py-2 font-medium">{row.collector}</td>
                        <td className="px-3 py-2">{row.client_name}</td>
                        <td className="px-3 py-2"><Badge variant="outline" className="text-xs">{(row.outcome || "—").replace(/_/g, " ")}</Badge></td>
                        <td className="px-3 py-2 font-mono">{row.collected_amount ? `$${Number(row.collected_amount).toLocaleString()}` : "—"}</td>
                        <td className="px-3 py-2 max-w-[200px] truncate">{row.notes || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Escalations */}
          <TabsContent value="escalations">
            <div className="dashboard-section">
              <h2 className="mb-4 text-lg font-semibold">All Escalations ({escalations.length})</h2>
              <div className="rounded-lg border bg-card overflow-auto max-h-[500px]">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-card">
                    <tr className="border-b bg-muted/50 text-muted-foreground">
                      <th className="px-3 py-2 text-left font-medium">Date</th>
                      <th className="px-3 py-2 text-left font-medium">Raised By</th>
                      <th className="px-3 py-2 text-left font-medium">Priority</th>
                      <th className="px-3 py-2 text-left font-medium">Status</th>
                      <th className="px-3 py-2 text-left font-medium">Assigned To</th>
                      <th className="px-3 py-2 text-left font-medium">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {escalations.map(e => (
                      <tr key={e.id} className={`border-b hover:bg-muted/30 ${e.priority === "urgent" && e.status === "open" ? "bg-destructive/5" : ""}`}>
                        <td className="px-3 py-2">{e.created_at ? new Date(e.created_at).toLocaleDateString() : "—"}</td>
                        <td className="px-3 py-2 font-medium">{e.raised_by}</td>
                        <td className="px-3 py-2"><Badge variant={e.priority === "urgent" ? "destructive" : e.priority === "high" ? "secondary" : "outline"} className="text-xs capitalize">{e.priority}</Badge></td>
                        <td className="px-3 py-2"><Badge variant={e.status === "open" ? "destructive" : e.status === "resolved" ? "default" : "secondary"} className="text-xs capitalize">{e.status.replace("_", " ")}</Badge></td>
                        <td className="px-3 py-2">{e.assigned_to || "—"}</td>
                        <td className="px-3 py-2 max-w-[200px] truncate">{e.trigger_reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Commitments */}
          <TabsContent value="commitments">
            <div className="dashboard-section">
              <h2 className="mb-4 text-lg font-semibold">All Commitments ({commitments.length})</h2>
              <div className="rounded-lg border bg-card overflow-auto max-h-[500px]">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-card">
                    <tr className="border-b bg-muted/50 text-muted-foreground">
                      <th className="px-3 py-2 text-left font-medium">Collector</th>
                      <th className="px-3 py-2 text-left font-medium">Amount</th>
                      <th className="px-3 py-2 text-left font-medium">Promised Date</th>
                      <th className="px-3 py-2 text-left font-medium">Follow-Up</th>
                      <th className="px-3 py-2 text-left font-medium">Status</th>
                      <th className="px-3 py-2 text-left font-medium">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commitments.map(c => {
                      const isOverdue = c.status === "pending" && c.promised_date < new Date().toISOString().slice(0, 10);
                      return (
                        <tr key={c.id} className={`border-b hover:bg-muted/30 ${isOverdue ? "bg-destructive/5" : ""}`}>
                          <td className="px-3 py-2 font-medium">{c.collector}</td>
                          <td className="px-3 py-2 font-mono">${Number(c.promised_amount).toLocaleString()}</td>
                          <td className="px-3 py-2"><span className={isOverdue ? "text-destructive font-semibold" : ""}>{c.promised_date}</span>{isOverdue && <span className="ml-1 text-[10px] text-destructive">OVERDUE</span>}</td>
                          <td className="px-3 py-2">{c.follow_up_date || "—"}</td>
                          <td className="px-3 py-2"><Badge variant={c.status === "kept" ? "default" : c.status === "broken" ? "destructive" : "outline"} className="text-xs capitalize">{c.status}</Badge></td>
                          <td className="px-3 py-2 max-w-[150px] truncate">{c.notes || "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Payments */}
          <TabsContent value="payments">
            <div className="dashboard-section">
              <h2 className="mb-4 text-lg font-semibold">Recent Payments</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b text-left text-muted-foreground"><th className="pb-3 font-medium">Client</th><th className="pb-3 font-medium">Amount</th><th className="pb-3 font-medium">Date</th><th className="pb-3 font-medium">Method</th><th className="pb-3 font-medium">Collector</th><th className="pb-3 font-medium">Status</th></tr></thead>
                  <tbody>
                    {recentPayments.map(p => (
                      <tr key={p.id} className="border-b last:border-0">
                        <td className="py-3 font-medium">{p.clientName}</td><td className="py-3">${p.amount.toLocaleString()}</td><td className="py-3 text-muted-foreground">{p.date}</td>
                        <td className="py-3 capitalize">{p.method}</td><td className="py-3">{p.collectorName}</td>
                        <td className="py-3"><Badge variant={p.status === "completed" ? "default" : p.status === "pending" ? "secondary" : "destructive"} className="text-xs">{p.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="mt-6">
        <TaskPanel department="collections" />
      </div>
    </DashboardLayout>
  );
};

export default CollectionsDashboard;
