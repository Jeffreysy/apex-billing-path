import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useMergedClients, useCollectors, usePaymentsData, useCollectionActivities } from "@/hooks/useSupabaseData";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Search, User, FileText, Phone, DollarSign, Clock, AlertTriangle, CheckCircle, MessageSquare, Tag } from "lucide-react";

const ClientLookup = () => {
  const { data: clients = [], isLoading: cl } = useMergedClients();
  const { data: collectors = [] } = useCollectors();
  const { data: payments = [] } = usePaymentsData();
  const { data: callLogs = [] } = useCollectionActivities();
  const [search, setSearch] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const filteredClients = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return clients.filter(c => c.name.toLowerCase().includes(q) || c.caseNumber.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
  }, [search, clients]);

  const selectedClient = useMemo(() => clients.find(c => c.id === selectedClientId) || null, [selectedClientId, clients]);

  const clientPayments = useMemo(
    () => selectedClient ? payments.filter(p => p.clientName.toLowerCase() === selectedClient.name.toLowerCase()).sort((a, b) => b.date.localeCompare(a.date)) : [],
    [selectedClient, payments]
  );

  const clientCalls = useMemo(
    () => selectedClient ? callLogs.filter(cl => cl.clientName.toLowerCase().includes(selectedClient.name.toLowerCase())).sort((a, b) => b.date.localeCompare(a.date)) : [],
    [selectedClient, callLogs]
  );

  const assignedCollector = useMemo(
    () => selectedClient ? collectors.find(c => c.name === selectedClient.assignedCollector) : null,
    [selectedClient, collectors]
  );

  const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof CheckCircle }> = {
    active: { variant: "default", icon: CheckCircle },
    delinquent: { variant: "destructive", icon: AlertTriangle },
    completed: { variant: "secondary", icon: CheckCircle },
    new: { variant: "outline", icon: Clock },
  };

  const paidInstallments = selectedClient
    ? Math.round((selectedClient.totalPaid / Math.max(1, selectedClient.totalOwed - selectedClient.downPayment)) * selectedClient.installmentMonths) : 0;

  return (
    <DashboardLayout>
      <div className="mb-6"><h1 className="text-2xl font-bold">Client Lookup</h1><p className="text-muted-foreground">Search by client name, case number, or email — your source of truth</p></div>
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search clients by name, case number, or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-12 pl-11 text-base" />
        {filteredClients.length > 0 && (
          <div className="absolute left-0 right-0 top-14 z-50 max-h-72 overflow-y-auto rounded-lg border bg-card shadow-lg">
            {filteredClients.slice(0, 20).map(c => {
              const cfg = statusConfig[c.status];
              return (
                <button key={c.id} onClick={() => { setSelectedClientId(c.id); setSearch(""); }} className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-accent">
                  <div><p className="font-medium">{c.name}</p><p className="text-xs text-muted-foreground">{c.caseNumber} · {c.caseType}</p></div>
                  <Badge variant={cfg.variant} className="text-xs capitalize">{c.status}</Badge>
                </button>
              );
            })}
          </div>
        )}
        {search.trim() && filteredClients.length === 0 && (
          <div className="absolute left-0 right-0 top-14 z-50 rounded-lg border bg-card p-4 text-center text-sm text-muted-foreground shadow-lg">No clients found matching "{search}"</div>
        )}
      </div>

      {selectedClient ? (
        <div className="space-y-6">
          <div className="dashboard-section">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">{selectedClient.name.split(" ").map(w => w[0]).join("").slice(0, 2)}</div>
                <div>
                  <h2 className="text-xl font-bold">{selectedClient.name}</h2>
                  <p className="text-sm text-muted-foreground">{selectedClient.email} · {selectedClient.phone}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <Badge variant={statusConfig[selectedClient.status].variant} className="capitalize">{selectedClient.status}</Badge>
                    {selectedClient.daysAging > 0 && <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" />{selectedClient.daysAging} days aging</Badge>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><FileText className="h-4 w-4 text-secondary" />Case Specifics</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Case Number</span><span className="font-mono font-semibold">{selectedClient.caseNumber}</span></div><Separator />
                <div className="flex justify-between"><span className="text-muted-foreground">Case Type</span><span className="font-medium">{selectedClient.caseType}</span></div><Separator />
                <div className="flex justify-between"><span className="text-muted-foreground">Assigned Collector</span><span className="font-medium">{assignedCollector?.name ?? selectedClient.assignedCollector ?? "—"}</span></div><Separator />
                <div className="flex justify-between"><span className="text-muted-foreground">Contract Period</span><span>{selectedClient.contractStart} → {selectedClient.contractEnd || "Ongoing"}</span></div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><DollarSign className="h-4 w-4 text-secondary" />Contract Breakdown</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Total Contract Value</span><span className="font-bold">${selectedClient.totalOwed.toLocaleString()}</span></div><Separator />
                <div className="flex justify-between"><span className="text-muted-foreground">Down Payment</span><span className="font-semibold text-secondary">${selectedClient.downPayment.toLocaleString()}</span></div><Separator />
                <div className="flex justify-between"><span className="text-muted-foreground">Monthly Installment</span><span>${selectedClient.monthlyPayment.toLocaleString()} × {selectedClient.installmentMonths} months</span></div><Separator />
                <div className="flex justify-between"><span className="text-muted-foreground">Total Paid</span><span className="font-semibold">${selectedClient.totalPaid.toLocaleString()}</span></div><Separator />
                <div className="flex justify-between"><span className="text-muted-foreground">Remaining Balance</span><span className="font-bold text-destructive">${(selectedClient.totalOwed - selectedClient.totalPaid).toLocaleString()}</span></div>
                <div className="pt-2">
                  <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground"><span>Payment Progress</span><span>{Math.min(paidInstallments, selectedClient.installmentMonths)} / {selectedClient.installmentMonths} installments</span></div>
                  <Progress value={selectedClient.totalOwed > 0 ? (selectedClient.totalPaid / selectedClient.totalOwed) * 100 : 0} className="h-2.5" />
                </div>
                <div className="flex justify-between pt-1"><span className="text-muted-foreground">Next Payment Due</span><span className="font-medium">{selectedClient.nextPaymentDue || "—"}</span></div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><DollarSign className="h-4 w-4 text-secondary" />Payment History ({clientPayments.length})</CardTitle></CardHeader>
              <CardContent>
                {clientPayments.length === 0 ? <p className="text-sm text-muted-foreground">No payments recorded.</p> : (
                  <div className="max-h-64 space-y-2 overflow-y-auto">
                    {clientPayments.map(p => (
                      <div key={p.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                        <div><span className="font-medium">${p.amount.toLocaleString()}</span><span className="ml-2 text-xs text-muted-foreground">{p.method.toUpperCase()}</span></div>
                        <div className="flex items-center gap-2"><Badge variant={p.status === "completed" ? "default" : p.status === "failed" ? "destructive" : "outline"} className="text-xs capitalize">{p.status}</Badge><span className="text-xs text-muted-foreground">{p.date}</span></div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Phone className="h-4 w-4 text-secondary" />Call History ({clientCalls.length})</CardTitle></CardHeader>
              <CardContent>
                {clientCalls.length === 0 ? <p className="text-sm text-muted-foreground">No calls recorded.</p> : (
                  <div className="max-h-64 space-y-2 overflow-y-auto">
                    {clientCalls.map(cl => (
                      <div key={cl.id} className="rounded-md border px-3 py-2 text-sm">
                        <div className="flex items-center justify-between"><span className="font-medium">{cl.collectorName}</span><span className="text-xs text-muted-foreground">{cl.date}</span></div>
                        <div className="mt-1 flex items-center gap-2"><Badge variant="outline" className="text-xs capitalize">{cl.outcome.replace(/_/g, " ")}</Badge><span className="text-xs text-muted-foreground">{Math.floor(cl.duration / 60)}m</span></div>
                        {cl.notes && <p className="mt-1 text-xs text-muted-foreground">{cl.notes}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted"><Search className="h-7 w-7 text-muted-foreground" /></div>
          <h3 className="text-lg font-semibold">Search for a Client</h3>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">Use the search bar above to find a client by name, case number, or email.</p>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ClientLookup;
