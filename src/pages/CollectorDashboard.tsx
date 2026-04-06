import { useParams } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useCollectionsDashboard } from "@/hooks/useSupabaseData";
import { DollarSign, Phone, Clock, ExternalLink, Users, Percent } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { format } from "date-fns";
import MonthFilter, { filterByMonth } from "@/components/MonthFilter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import CollectorActivityLog from "@/components/collector/CollectorActivityLog";
import CollectorEscalations from "@/components/collector/CollectorEscalations";
import CollectorCommitments from "@/components/collector/CollectorCommitments";

const KNOWN_COLLECTORS = ["Alejandro A", "Patricio D", "Maritza V"];
const LEAD_COLLECTOR = "Alejandro A";

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

const CollectorDashboard = () => {
  const { collectorId } = useParams<{ collectorId: string }>();
  const collectorName = decodeURIComponent(collectorId || "");

  // All collection_activities for known collectors
  const { data: allActivities = [], isLoading: loadingAct } = useQuery({
    queryKey: ["collector-all-activities"],
    queryFn: async () => {
      const allData: any[] = [];
      let from = 0;
      const pageSize = 1000;
      let hasMore = true;
      while (hasMore) {
        const { data, error } = await supabase
          .from("collection_activities")
          .select("*")
          .range(from, from + pageSize - 1);
        if (error) throw error;
        if (data && data.length > 0) {
          allData.push(...data);
          from += pageSize;
          hasMore = data.length === pageSize;
        } else {
          hasMore = false;
        }
      }
      return allData;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: allQueue = [], isLoading: loadingQueue } = useCollectionsDashboard();

  const [paymentOpen, setPaymentOpen] = useState(false);
  const [callOpen, setCallOpen] = useState(false);
  const [month, setMonth] = useState(() => format(new Date(), "yyyy-MM"));

  if (loadingAct || loadingQueue) {
    return <DashboardLayout><div className="p-8 text-center text-muted-foreground">Loading...</div></DashboardLayout>;
  }

  // Check collector exists
  if (!KNOWN_COLLECTORS.includes(collectorName)) {
    return <DashboardLayout><p className="text-muted-foreground p-8">Collector "{collectorName}" not found.</p></DashboardLayout>;
  }

  const isLead = collectorName === LEAD_COLLECTOR;
  const avatar = collectorName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  // Filter activities by selected month
  const monthActivities = useMemo(() => filterByMonth(allActivities, "activity_date", month), [allActivities, month]);

  // Aggregate stats from filtered activities
  const buildStats = (name: string) => {
    const rows = monthActivities.filter(a => a.collector === name);
    return {
      totalCollected: rows.reduce((s, a) => s + (Number(a.collected_amount) || 0), 0),
      totalCommission: rows.reduce((s, a) => s + (Number(a.commission) || 0), 0),
      callsMade: rows.length,
      paymentsTaken: rows.filter(a => (Number(a.collected_amount) || 0) > 0).length,
    };
  };

  const myStats = buildStats(collectorName);

  // Team stats for lead
  const teamStats = isLead
    ? KNOWN_COLLECTORS.reduce(
        (acc, name) => {
          const s = buildStats(name);
          acc.totalCollected += s.totalCollected;
          acc.totalCommission += s.totalCommission;
          acc.callsMade += s.callsMade;
          acc.paymentsTaken += s.paymentsTaken;
          return acc;
        },
        { totalCollected: 0, totalCommission: 0, callsMade: 0, paymentsTaken: 0 }
      )
    : null;

  // Queue filtered to this collector
  const myQueue = allQueue.filter((c: any) => c.collector === collectorName || c.assigned_collector === collectorName);

  // Recent payments from filtered activities where collected_amount > 0
  const recentPayments = (isLead
    ? monthActivities.filter(a => KNOWN_COLLECTORS.includes(a.collector) && (Number(a.collected_amount) || 0) > 0)
    : monthActivities.filter(a => a.collector === collectorName && (Number(a.collected_amount) || 0) > 0)
  )
    .sort((a, b) => `${b.activity_date}${b.start_time || ""}`.localeCompare(`${a.activity_date}${a.start_time || ""}`))
    .slice(0, 15);

  const handlePayment = (e: React.FormEvent) => { e.preventDefault(); toast.success("Payment recorded!"); setPaymentOpen(false); };
  const handleCallLog = (e: React.FormEvent) => { e.preventDefault(); toast.success("Call logged!"); setCallOpen(false); };

  return (
    <DashboardLayout title={collectorName}>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">{avatar}</div>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">{collectorName}{isLead && <Badge variant="secondary">Lead Collector</Badge>}</h1>
            <p className="text-muted-foreground">Collections Agent Dashboard</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
            <DialogTrigger asChild><Button><DollarSign className="mr-2 h-4 w-4" />Take Payment</Button></DialogTrigger>
            <DialogContent><DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>
              <form onSubmit={handlePayment} className="space-y-4">
                <div><Label>Client</Label><Select><SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger><SelectContent>{myQueue.slice(0, 50).map((c: any) => <SelectItem key={c.contract_id || c.client_id} value={c.client_id || ""}>{c.client_name}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Amount</Label><Input type="number" placeholder="0.00" /></div>
                <div><Label>Payment Method</Label><Select><SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger><SelectContent><SelectItem value="card">Credit Card</SelectItem><SelectItem value="ach">ACH</SelectItem><SelectItem value="check">Check</SelectItem><SelectItem value="cash">Cash</SelectItem></SelectContent></Select></div>
                <DialogFooter><Button type="submit">Process Payment</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={callOpen} onOpenChange={setCallOpen}>
            <DialogTrigger asChild><Button variant="outline"><Phone className="mr-2 h-4 w-4" />Log Call</Button></DialogTrigger>
            <DialogContent><DialogHeader><DialogTitle>Log Phone Call</DialogTitle></DialogHeader>
              <form onSubmit={handleCallLog} className="space-y-4">
                <div><Label>Client</Label><Select><SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger><SelectContent>{myQueue.slice(0, 50).map((c: any) => <SelectItem key={c.contract_id || c.client_id} value={c.client_id || ""}>{c.client_name}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Duration (min)</Label><Input type="number" placeholder="5" /></div>
                <div><Label>Outcome</Label><Select><SelectTrigger><SelectValue placeholder="Select outcome" /></SelectTrigger><SelectContent><SelectItem value="payment_taken">Payment Taken</SelectItem><SelectItem value="promise_to_pay">Promise to Pay</SelectItem><SelectItem value="no_answer">No Answer</SelectItem><SelectItem value="left_voicemail">Left Voicemail</SelectItem><SelectItem value="callback_scheduled">Callback Scheduled</SelectItem><SelectItem value="disputed">Disputed</SelectItem></SelectContent></Select></div>
                <div><Label>Notes</Label><Textarea placeholder="Call notes..." /></div>
                <DialogFooter><Button type="submit">Save Call Log</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      {isLead ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard label="My Collected" value={fmt(myStats.totalCollected)} icon={<DollarSign className="h-5 w-5" />} />
          <StatCard label="My Commission" value={fmt(myStats.totalCommission)} icon={<Percent className="h-5 w-5" />} />
          <StatCard label="Team Collected" value={fmt(teamStats!.totalCollected)} icon={<Users className="h-5 w-5" />} />
          <StatCard label="Team Commission" value={fmt(teamStats!.totalCommission)} icon={<Users className="h-5 w-5" />} />
          <StatCard label="My Calls" value={String(myStats.callsMade)} icon={<Phone className="h-5 w-5" />} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <StatCard label="Total Collected" value={fmt(myStats.totalCollected)} icon={<DollarSign className="h-5 w-5" />} />
          <StatCard label="My Commission" value={fmt(myStats.totalCommission)} icon={<Percent className="h-5 w-5" />} />
          <StatCard label="Calls Made" value={String(myStats.callsMade)} icon={<Phone className="h-5 w-5" />} />
          <StatCard label="Payments Taken" value={String(myStats.paymentsTaken)} icon={<Clock className="h-5 w-5" />} />
        </div>
      )}

      {/* Team Overview for Lead */}
      {isLead && (
        <div className="mt-6 dashboard-section">
          <h2 className="mb-4 text-lg font-semibold flex items-center gap-2"><Users className="h-4 w-4" />Team Overview</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {KNOWN_COLLECTORS.map(name => {
              const s = buildStats(name);
              const av = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
              return (
                <div key={name} className="flex items-center gap-3 rounded-md border p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{av}</div>
                  <div>
                    <p className="text-sm font-medium">{name}{name === LEAD_COLLECTOR && <Badge variant="secondary" className="ml-2 text-[10px]">Lead</Badge>}</p>
                    <p className="text-xs text-muted-foreground">{s.callsMade} calls · {fmt(s.totalCollected)} · Commission: {fmt(s.totalCommission)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Queue + Payments side by side */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="dashboard-section">
          <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold">Client Queue</h2><Badge variant="secondary">{myQueue.length} pending</Badge></div>
          <div className="max-h-[300px] space-y-2 overflow-y-auto">
            {myQueue.slice(0, 20).map((c: any) => {
              const daysOut = Number(c.days_past_due) || 0;
              const isDelinquent = (c.delinquency_status || "").toLowerCase() === "delinquent";
              return (
                <div key={c.contract_id || c.client_id} className="queue-item">
                  <div><p className="font-medium text-sm">{c.client_name}</p><p className="text-xs text-muted-foreground">{c.phone} · Due: {c.next_due_date || "—"}</p>{daysOut > 0 && <p className="text-xs text-destructive font-medium">{daysOut} days past due</p>}</div>
                  <div className="flex items-center gap-2"><Badge variant={isDelinquent ? "destructive" : "default"} className="text-xs">{c.contract_status || "Active"}</Badge><Button size="sm" variant="outline" className="gap-1 text-xs"><ExternalLink className="h-3 w-3" />CRM</Button></div>
                </div>
              );
            })}
            {myQueue.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No accounts in queue</p>}
          </div>
        </div>
        <div className="dashboard-section">
          <h2 className="mb-4 text-lg font-semibold">{isLead ? "Team Recent Collections" : "My Recent Collections"}</h2>
          <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-muted-foreground"><th className="pb-3 font-medium">Client</th>{isLead && <th className="pb-3 font-medium">Collector</th>}<th className="pb-3 font-medium">Amount</th><th className="pb-3 font-medium">Date</th></tr></thead>
              <tbody>
                {recentPayments.map(p => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="py-2 font-medium text-sm">{p.client_name}</td>
                    {isLead && <td className="py-2 text-sm">{p.collector}</td>}
                    <td className="py-2 font-mono text-sm">{fmt(Number(p.collected_amount))}</td>
                    <td className="py-2 text-muted-foreground text-sm">{p.activity_date}</td>
                  </tr>
                ))}
                {recentPayments.length === 0 && <tr><td colSpan={isLead ? 4 : 3} className="py-4 text-center text-muted-foreground">No collections yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Tabbed section: Activity Log, Escalations, Commitments */}
      <div className="mt-6">
        <Tabs defaultValue="activity" className="space-y-4">
          <TabsList>
            <TabsTrigger value="activity">Activity Log</TabsTrigger>
            <TabsTrigger value="escalations">Escalations</TabsTrigger>
            <TabsTrigger value="commitments">Commitments</TabsTrigger>
          </TabsList>
          <TabsContent value="activity">
            <div className="dashboard-section">
              <h2 className="mb-3 text-lg font-semibold">{isLead ? "Team Activity Log" : "My Activity Log"}</h2>
              <CollectorActivityLog collectorName={collectorName} isLead={isLead} />
            </div>
          </TabsContent>
          <TabsContent value="escalations">
            <div className="dashboard-section">
              <h2 className="mb-3 text-lg font-semibold">{isLead ? "Team Escalations" : "My Escalations"}</h2>
              <CollectorEscalations collectorName={collectorName} isLead={isLead} />
            </div>
          </TabsContent>
          <TabsContent value="commitments">
            <div className="dashboard-section">
              <h2 className="mb-3 text-lg font-semibold">{isLead ? "Team Commitments" : "My Commitments"}</h2>
              <CollectorCommitments collectorName={collectorName} isLead={isLead} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default CollectorDashboard;
