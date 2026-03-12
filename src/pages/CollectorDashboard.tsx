import { useParams } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { collectors, clients, payments, callLogs } from "@/data/mockData";
import { DollarSign, Phone, Clock, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const CollectorDashboard = () => {
  const { collectorId } = useParams<{ collectorId: string }>();
  const collector = collectors.find((c) => c.id === collectorId);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [callOpen, setCallOpen] = useState(false);

  if (!collector) {
    return (
      <DashboardLayout>
        <p className="text-muted-foreground">Collector not found.</p>
      </DashboardLayout>
    );
  }

  const myClients = clients.filter((c) => c.assignedCollector === collectorId);
  const myPayments = payments.filter((p) => p.collectorId === collectorId).sort((a, b) => b.date.localeCompare(a.date));
  const myCalls = callLogs.filter((c) => c.collectorId === collectorId).sort((a, b) => b.date.localeCompare(a.date));

  const queue = myClients
    .filter((c) => c.status === "delinquent" || c.status === "active")
    .sort((a, b) => a.nextPaymentDue.localeCompare(b.nextPaymentDue));

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const outcomeColors: Record<string, string> = {
    payment_taken: "default",
    promise_to_pay: "secondary",
    no_answer: "outline",
    left_voicemail: "outline",
    callback_scheduled: "secondary",
    disputed: "destructive",
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Payment recorded successfully!");
    setPaymentOpen(false);
  };

  const handleCallLog = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Call logged successfully!");
    setCallOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
            {collector.avatar}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{collector.name}</h1>
            <p className="text-muted-foreground">Collections Agent Dashboard</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
            <DialogTrigger asChild>
              <Button><DollarSign className="mr-2 h-4 w-4" />Take Payment</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>
              <form onSubmit={handlePayment} className="space-y-4">
                <div>
                  <Label>Client</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                    <SelectContent>
                      {myClients.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Amount</Label>
                  <Input type="number" placeholder="0.00" />
                </div>
                <div>
                  <Label>Payment Method</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="card">Credit Card</SelectItem>
                      <SelectItem value="ach">ACH Transfer</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button type="submit">Process Payment</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={callOpen} onOpenChange={setCallOpen}>
            <DialogTrigger asChild>
              <Button variant="outline"><Phone className="mr-2 h-4 w-4" />Log Call</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Log Phone Call</DialogTitle></DialogHeader>
              <form onSubmit={handleCallLog} className="space-y-4">
                <div>
                  <Label>Client</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                    <SelectContent>
                      {myClients.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Duration (minutes)</Label>
                  <Input type="number" placeholder="5" />
                </div>
                <div>
                  <Label>Outcome</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select outcome" /></SelectTrigger>
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
                <div>
                  <Label>Notes</Label>
                  <Textarea placeholder="Call notes..." />
                </div>
                <DialogFooter>
                  <Button type="submit">Save Call Log</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Collected" value={`$${collector.totalCollected.toLocaleString()}`} change={14} icon={<DollarSign className="h-5 w-5" />} />
        <StatCard label="Calls Made" value={String(collector.callsMade)} change={6} icon={<Phone className="h-5 w-5" />} />
        <StatCard label="Payments Taken" value={String(collector.paymentsTaken)} change={9} icon={<Clock className="h-5 w-5" />} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Client Queue */}
        <div className="dashboard-section">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Client Queue</h2>
            <Badge variant="secondary">{queue.length} pending</Badge>
          </div>
          <div className="space-y-2">
            {queue.map((c) => (
              <div key={c.id} className="queue-item">
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.phone} · Due: {c.nextPaymentDue}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={c.status === "delinquent" ? "destructive" : "default"} className="text-xs capitalize">
                    {c.status}
                  </Badge>
                  <Button size="sm" variant="outline" className="gap-1">
                    <ExternalLink className="h-3 w-3" /> CRM
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Calls */}
        <div className="dashboard-section">
          <h2 className="mb-4 text-lg font-semibold">Recent Calls</h2>
          <div className="space-y-3">
            {myCalls.slice(0, 8).map((call) => (
              <div key={call.id} className="flex items-start justify-between border-b pb-3 last:border-0">
                <div>
                  <p className="text-sm font-medium">{call.clientName}</p>
                  <p className="text-xs text-muted-foreground">{call.date} · {formatDuration(call.duration)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{call.notes}</p>
                </div>
                <Badge variant={(outcomeColors[call.outcome] as any) || "default"} className="shrink-0 text-xs capitalize">
                  {call.outcome.replace(/_/g, " ")}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Payments */}
      <div className="mt-6 dashboard-section">
        <h2 className="mb-4 text-lg font-semibold">My Recent Payments</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-3 font-medium">Client</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Method</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {myPayments.slice(0, 10).map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="py-3 font-medium">{p.clientName}</td>
                  <td className="py-3">${p.amount.toLocaleString()}</td>
                  <td className="py-3 text-muted-foreground">{p.date}</td>
                  <td className="py-3 capitalize">{p.method}</td>
                  <td className="py-3">
                    <Badge variant={p.status === "completed" ? "default" : p.status === "pending" ? "secondary" : "destructive"} className="text-xs">
                      {p.status}
                    </Badge>
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

export default CollectorDashboard;
