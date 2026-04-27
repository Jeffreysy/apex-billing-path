import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useCollectionsDashboard } from "@/hooks/useSupabaseData";
import { DollarSign, Phone, Clock, Users, Percent, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { format } from "date-fns";
import MonthFilter, { filterByMonth } from "@/components/MonthFilter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CollectorActivityLog from "@/components/collector/CollectorActivityLog";
import CollectorEscalations from "@/components/collector/CollectorEscalations";
import CollectorCommitments from "@/components/collector/CollectorCommitments";
import TakePaymentDialog, { type PaymentTarget } from "@/components/TakePaymentDialog";
import CallDocumentationDialog from "@/components/CallDocumentationDialog";

const KNOWN_COLLECTORS = ["Alejandro A", "Patricio D", "Maritza V"];
const LEAD_COLLECTOR = "Alejandro A";

function normalizeCollectorName(value: string | null | undefined) {
  return (value || "").trim().toLowerCase();
}

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
    refetchInterval: 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const { data: allQueue = [], isLoading: loadingQueue } = useCollectionsDashboard();

  const navigate = useNavigate();
  const [payOpen, setPayOpen] = useState(false);
  const [payTarget, setPayTarget] = useState<PaymentTarget | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSelected, setPickerSelected] = useState("");
  const [callAccount, setCallAccount] = useState<any>(null);
  const [callOpen, setCallOpen] = useState(false);
  const [month, setMonth] = useState(() => format(new Date(), "yyyy-MM"));

  const openPaymentFor = (account: any) => {
    setPayTarget({
      clientId: account?.client_id || null,
      contractId: account?.contract_id || null,
      clientName: account?.client_name || "Unknown",
      email: account?.email || null,
      invoiceNumber: account?.invoice_number || null,
      caseNumber: account?.case_number || null,
      defaultAmount: Number(account?.balance_remaining) || 0,
      collectorName: account?.collector || account?.assigned_collector || collectorName,
    });
    setPayOpen(true);
  };

  const isLead = collectorName === LEAD_COLLECTOR;
  const avatar = collectorName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  // Filter activities by selected month — must be before early returns to respect hook order
  const monthActivities = useMemo(() => filterByMonth(allActivities, "activity_date", month), [allActivities, month]);

  // Only outbound calls logged by each known collector (all-time, for "worked clients" set)
  const workedClientsByCollector = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    for (const a of allActivities) {
      if (a.activity_type !== "outbound_call") continue;
      const norm = normalizeCollectorName(a.collector);
      const matched = KNOWN_COLLECTORS.find(c => normalizeCollectorName(c) === norm);
      if (!matched || !a.client_id) continue;
      if (!map[matched]) map[matched] = new Set<string>();
      map[matched].add(a.client_id);
    }
    return map;
  }, [allActivities]);

  // Collector's own outbound call entries (all months — drives latestActivity + lastCalledMap)
  const myOutboundCalls = useMemo(
    () => allActivities.filter(
      a => normalizeCollectorName(a.collector) === normalizeCollectorName(collectorName)
        && a.activity_type === "outbound_call"
    ),
    [allActivities, collectorName]
  );

  // Last-called date per client (contract_id or client_id key) — outbound calls only.
  // Must be declared before any early return to keep hook order stable.
  const lastCalledMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const a of myOutboundCalls) {
      const key = a.contract_id || a.client_id;
      if (!key) continue;
      if (!map[key] || a.activity_date > map[key]) map[key] = a.activity_date;
    }
    return map;
  }, [myOutboundCalls]);

  if (loadingAct || loadingQueue) {
    return <DashboardLayout><div className="p-8 text-center text-muted-foreground">Loading...</div></DashboardLayout>;
  }

  if (!KNOWN_COLLECTORS.includes(collectorName)) {
    return <DashboardLayout><p className="text-muted-foreground p-8">Collector "{collectorName}" not found.</p></DashboardLayout>;
  }

  // Aggregate stats from filtered activities
  // Rule: count own outbound calls + system/non-collector payment entries for clients they've worked
  const buildStats = (name: string) => {
    const normName = normalizeCollectorName(name);
    const workedClients = workedClientsByCollector[name] || new Set<string>();

    const ownRows = monthActivities.filter(a =>
      normalizeCollectorName(a.collector) === normName && a.activity_type === "outbound_call"
    );

    // System entries: not logged by any known collector, has payment amount, client was worked by this collector
    const systemPaymentRows = monthActivities.filter(a => {
      if ((Number(a.collected_amount) || 0) <= 0) return false;
      const isKnownCollector = KNOWN_COLLECTORS.some(c => normalizeCollectorName(c) === normalizeCollectorName(a.collector));
      return !isKnownCollector && !!a.client_id && workedClients.has(a.client_id);
    });

    const allCountedRows = [...ownRows, ...systemPaymentRows];
    return {
      totalCollected: allCountedRows.reduce((s, a) => s + (Number(a.collected_amount) || 0), 0),
      totalCommission: ownRows.reduce((s, a) => s + (Number(a.commission) || 0), 0),
      callsMade: ownRows.length,
      paymentsTaken: allCountedRows.filter(a => (Number(a.collected_amount) || 0) > 0).length,
    };
  };

  const myStats = buildStats(collectorName);
  const latestActivity = myOutboundCalls
    .slice()
    .sort((a, b) => `${b.activity_date}${b.start_time || ""}`.localeCompare(`${a.activity_date}${a.start_time || ""}`))[0];

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
  const myQueue = allQueue.filter(
    (c: any) =>
      normalizeCollectorName(c.collector) === normalizeCollectorName(collectorName) ||
      normalizeCollectorName(c.assigned_collector) === normalizeCollectorName(collectorName)
  );

  const recentPayments = (() => {
    const hasPayment = (a: any) => (Number(a.collected_amount) || 0) > 0;
    const isKnownCollector = (a: any) => KNOWN_COLLECTORS.some(c => normalizeCollectorName(c) === normalizeCollectorName(a.collector));

    let rows: any[];
    if (isLead) {
      // Own outbound-call entries with payment, plus system entries for any collector's worked clients
      rows = monthActivities.filter(a => {
        if (!hasPayment(a)) return false;
        if (isKnownCollector(a)) return a.activity_type === "outbound_call";
        // system entry — include if any collector has worked this client
        return !!a.client_id && KNOWN_COLLECTORS.some(c => (workedClientsByCollector[c] || new Set()).has(a.client_id));
      });
    } else {
      const workedClients = workedClientsByCollector[collectorName] || new Set<string>();
      rows = monthActivities.filter(a => {
        if (!hasPayment(a)) return false;
        if (normalizeCollectorName(a.collector) === normalizeCollectorName(collectorName))
          return a.activity_type === "outbound_call";
        // system entry for a client this collector has worked
        return !isKnownCollector(a) && !!a.client_id && workedClients.has(a.client_id);
      });
    }
    return rows
      .sort((a, b) => `${b.activity_date}${b.start_time || ""}`.localeCompare(`${a.activity_date}${a.start_time || ""}`))
      .slice(0, 15);
  })();

  const openCallFor = (account: any) => {
    setCallAccount(account);
    setCallOpen(true);
  };

  return (
    <DashboardLayout title={collectorName}>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">{avatar}</div>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">{collectorName}{isLead && <Badge variant="secondary">Lead Collector</Badge>}</h1>
            <p className="text-muted-foreground">
              Collections Agent Dashboard
              {latestActivity && ` · Latest activity: ${latestActivity.activity_date}${latestActivity.start_time ? ` ${String(latestActivity.start_time).slice(0, 5)}` : ""}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <MonthFilter value={month} onChange={setMonth} />
          <Button onClick={() => openPaymentFor(myQueue[0] || {})} disabled={myQueue.length === 0}>
            <CreditCard className="mr-2 h-4 w-4" />Take Payment
          </Button>
          <Button variant="outline" onClick={() => setPickerOpen(true)}>
            <Phone className="mr-2 h-4 w-4" />Log Call
          </Button>
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
              const key = c.contract_id || c.client_id;
              const lastCalled = lastCalledMap[key];
              return (
                <div key={key} className="queue-item">
                  <div>
                    <p className="font-medium text-sm">
                      {c.client_id || c.contract_id ? (
                        <button
                          onClick={() => navigate(`/clients?${c.client_id ? `clientId=${c.client_id}` : `contractId=${c.contract_id}`}`)}
                          className="text-primary hover:underline text-left"
                          title="Open client profile"
                        >
                          {c.client_name}
                        </button>
                      ) : (
                        c.client_name
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">{c.phone} · Due: {c.next_due_date || "—"}</p>
                    {daysOut > 0 && <p className="text-xs text-destructive font-medium">{daysOut} days past due</p>}
                    {lastCalled && <p className="text-xs text-muted-foreground">Last called: {lastCalled}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={isDelinquent ? "destructive" : "default"} className="text-xs">{c.contract_status || "Active"}</Badge>
                    <Button size="sm" variant="outline" onClick={() => openCallFor(c)} className="gap-1 text-xs h-7">
                      <Phone className="h-3 w-3" />Call
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => navigate(`/clients?${c.client_id ? `clientId=${c.client_id}` : `contractId=${c.contract_id}`}`)}
                      className="gap-1 text-xs h-7"
                      disabled={!c.client_id && !c.contract_id}
                    >
                      Work
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => openPaymentFor(c)} className="gap-1 text-xs h-7">
                      <CreditCard className="h-3 w-3" />Pay
                    </Button>
                  </div>
                </div>
              );
            })}
            {myQueue.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No accounts in queue</p>}
          </div>
        </div>
        <div className="dashboard-section">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">{isLead ? "Team Recent Payments" : "My Recent Payments"}</h2>
              <p className="text-xs text-muted-foreground">
                Payment rows only. Latest logged activity: {latestActivity ? latestActivity.activity_date : "No activity yet"}
              </p>
            </div>
            <Badge variant="outline">{month}</Badge>
          </div>
          <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-muted-foreground"><th className="pb-3 font-medium">Client</th>{isLead && <th className="pb-3 font-medium">Collector</th>}<th className="pb-3 font-medium">Amount</th><th className="pb-3 font-medium">Date</th><th className="pb-3 font-medium text-right">Actions</th></tr></thead>
              <tbody>
                {recentPayments.map(p => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="py-2 font-medium text-sm">
                      {p.contract_id || p.client_id ? (
                        <button
                          onClick={() => navigate(`/collections/workspace/${p.contract_id || p.client_id}`)}
                          className="text-primary hover:underline text-left"
                          title="Open in workspace"
                        >
                          {p.client_name}
                        </button>
                      ) : (
                        p.client_name
                      )}
                    </td>
                    {isLead && <td className="py-2 text-sm">{p.collector}</td>}
                    <td className="py-2 font-mono text-sm">{fmt(Number(p.collected_amount))}</td>
                    <td className="py-2 text-muted-foreground text-sm">{p.activity_date}</td>
                    <td className="py-2 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        title="Take payment"
                        disabled={!p.client_id && !p.contract_id}
                        onClick={() => openPaymentFor(p)}
                      >
                        <CreditCard className="h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {recentPayments.length === 0 && <tr><td colSpan={isLead ? 5 : 4} className="py-4 text-center text-muted-foreground">No collections recorded in this month</td></tr>}
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

      {/* Client picker for Log Call from header button */}
      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Select Client to Log Call</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Client</Label>
              <Select value={pickerSelected} onValueChange={setPickerSelected}>
                <SelectTrigger><SelectValue placeholder="Select client…" /></SelectTrigger>
                <SelectContent>
                  {myQueue.slice(0, 50).map((c: any) => (
                    <SelectItem key={c.contract_id || c.client_id} value={c.contract_id || c.client_id || ""}>
                      {c.client_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPickerOpen(false)}>Cancel</Button>
            <Button
              disabled={!pickerSelected}
              onClick={() => {
                const acct = myQueue.find((c: any) => (c.contract_id || c.client_id) === pickerSelected);
                if (acct) { setCallAccount(acct); setCallOpen(true); }
                setPickerOpen(false);
                setPickerSelected("");
              }}
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Call documentation */}
      <CallDocumentationDialog open={callOpen} onOpenChange={setCallOpen} account={callAccount} />

      {/* Take Payment (LawPay hand-off) */}
      <TakePaymentDialog open={payOpen} onOpenChange={setPayOpen} target={payTarget} />
    </DashboardLayout>
  );
};

export default CollectorDashboard;
