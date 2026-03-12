import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import TaskPanel from "@/components/TaskPanel";
import { clients, payments, callLogs, collectors } from "@/data/mockData";
import { DollarSign, Phone, Clock, Users, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { toast } from "sonner";

const CollectionsDashboard = () => {
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [callOpen, setCallOpen] = useState(false);

  const totalCollected = payments.filter((p) => p.status === "completed").reduce((s, p) => s + p.amount, 0);
  const totalCalls = callLogs.length;
  const promiseToPay = callLogs.filter((c) => c.outcome === "promise_to_pay").length;
  const delinquent = clients.filter((c) => c.status === "delinquent").length;

  const queue = clients
    .filter((c) => c.status === "delinquent" || c.status === "active")
    .sort((a, b) => b.daysAging - a.daysAging || a.nextPaymentDue.localeCompare(b.nextPaymentDue));

  const recentCalls = [...callLogs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10);
  const recentPayments = [...payments].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);

  const outcomeColors: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
    payment_taken: "default", promise_to_pay: "secondary", no_answer: "outline",
    left_voicemail: "outline", callback_scheduled: "secondary", disputed: "destructive",
  };

  const handlePayment = (e: React.FormEvent) => { e.preventDefault(); toast.success("Payment recorded!"); setPaymentOpen(false); };
  const handleCall = (e: React.FormEvent) => { e.preventDefault(); toast.success("Call logged!"); setCallOpen(false); };

  return (
    <DashboardLayout title="Collections Department">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Collections Dashboard</h1>
          <p className="text-muted-foreground">Team-wide collection activity and client queue</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
            <DialogTrigger asChild><Button><DollarSign className="mr-2 h-4 w-4" />Take Payment</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>
              <form onSubmit={handlePayment} className="space-y-4">
                <div><Label>Client</Label>
                  <Select><SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                    <SelectContent>{clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Amount</Label><Input type="number" placeholder="0.00" /></div>
                <div><Label>Method</Label>
                  <Select><SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="card">Credit Card</SelectItem><SelectItem value="ach">ACH</SelectItem>
                      <SelectItem value="check">Check</SelectItem><SelectItem value="cash">Cash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter><Button type="submit">Process Payment</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={callOpen} onOpenChange={setCallOpen}>
            <DialogTrigger asChild><Button variant="outline"><Phone className="mr-2 h-4 w-4" />Log Call</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Log Phone Call</DialogTitle></DialogHeader>
              <form onSubmit={handleCall} className="space-y-4">
                <div><Label>Client</Label>
                  <Select><SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                    <SelectContent>{clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Duration (min)</Label><Input type="number" placeholder="5" /></div>
                <div><Label>Outcome</Label>
                  <Select><SelectTrigger><SelectValue placeholder="Select outcome" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="payment_taken">Payment Taken</SelectItem>
                      <SelectItem value="promise_to_pay">Promise to Pay</SelectItem>
                      <SelectItem value="no_answer">No Answer</SelectItem>
                      <SelectItem value="left_voicemail">Left Voicemail</SelectItem>
                      <SelectItem value="callback_scheduled">Callback Scheduled</SelectItem>
                      <SelectItem value="disputed">Disputed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Notes</Label><Textarea placeholder="Call notes..." /></div>
                <DialogFooter><Button type="submit">Save Call</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Collected (90d)" value={`$${totalCollected.toLocaleString()}`} change={12.5} icon={<DollarSign className="h-5 w-5" />} />
        <StatCard label="Total Calls" value={String(totalCalls)} change={8} icon={<Phone className="h-5 w-5" />} />
        <StatCard label="Promise to Pay" value={String(promiseToPay)} change={-2} icon={<Clock className="h-5 w-5" />} />
        <StatCard label="Delinquent Accounts" value={String(delinquent)} change={-5} icon={<Users className="h-5 w-5" />} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Queue */}
        <div className="dashboard-section lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Client Queue</h2>
            <Badge variant="secondary">{queue.length} clients</Badge>
          </div>
          <div className="max-h-[400px] space-y-2 overflow-y-auto">
            {queue.slice(0, 15).map((c) => (
              <div key={c.id} className="queue-item">
                <div>
                  <p className="font-medium text-sm">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.phone} · Due: {c.nextPaymentDue}</p>
                  {c.daysAging > 0 && <p className="text-xs text-destructive font-medium">{c.daysAging} days past due</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={c.status === "delinquent" ? "destructive" : "default"} className="text-xs capitalize">{c.status}</Badge>
                  <Button size="sm" variant="outline" className="gap-1 text-xs"><ExternalLink className="h-3 w-3" />CRM</Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Collector Performance */}
        <div className="dashboard-section">
          <h2 className="mb-4 text-lg font-semibold">Team Performance</h2>
          <div className="space-y-4">
            {collectors.map((c) => (
              <div key={c.id} className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {c.avatar}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{c.name} {c.isLead && <Badge variant="secondary" className="ml-1 text-[10px]">Lead</Badge>}</p>
                  <p className="text-xs text-muted-foreground">{c.callsMade} calls · {c.paymentsTaken} payments</p>
                </div>
                <p className="text-sm font-semibold text-secondary">${c.totalCollected.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Calls */}
        <div className="dashboard-section">
          <h2 className="mb-4 text-lg font-semibold">Recent Calls</h2>
          <div className="space-y-3">
            {recentCalls.map((call) => (
              <div key={call.id} className="flex items-start justify-between border-b pb-3 last:border-0">
                <div>
                  <p className="text-sm font-medium">{call.clientName}</p>
                  <p className="text-xs text-muted-foreground">{call.collectorName} · {call.date} · {Math.floor(call.duration / 60)}m</p>
                  <p className="mt-1 text-xs text-muted-foreground">{call.notes}</p>
                </div>
                <Badge variant={outcomeColors[call.outcome]} className="shrink-0 text-xs capitalize">{call.outcome.replace(/_/g, " ")}</Badge>
              </div>
            ))}
          </div>
        </div>

        <TaskPanel department="collections" />
      </div>

      {/* Recent Payments */}
      <div className="mt-6 dashboard-section">
        <h2 className="mb-4 text-lg font-semibold">Recent Payments</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-3 font-medium">Client</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Method</th>
                <th className="pb-3 font-medium">Collector</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="py-3 font-medium">{p.clientName}</td>
                  <td className="py-3">${p.amount.toLocaleString()}</td>
                  <td className="py-3 text-muted-foreground">{p.date}</td>
                  <td className="py-3 capitalize">{p.method}</td>
                  <td className="py-3">{p.collectorName}</td>
                  <td className="py-3">
                    <Badge variant={p.status === "completed" ? "default" : p.status === "pending" ? "secondary" : "destructive"} className="text-xs">{p.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CollectionsDashboard;
