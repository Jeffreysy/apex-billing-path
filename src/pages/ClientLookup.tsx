import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { useMergedClients, useCollectors, usePaymentsData, useClientActivityHistory, useImmigrationCases, useCaseMilestones, useMyCaseClient360, extractClientNameFromNotes } from "@/hooks/useSupabaseData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Search, User, FileText, Phone, DollarSign, Clock, AlertTriangle, CheckCircle, MessageSquare, Tag, Scale, Calendar, CreditCard } from "lucide-react";
import TakePaymentDialog, { type PaymentTarget } from "@/components/TakePaymentDialog";
import CallDocumentationDialog from "@/components/CallDocumentationDialog";

const ClientLookup = () => {
  const { data: clients = [], isLoading: cl } = useMergedClients();
  const { data: collectors = [] } = useCollectors();
  const { data: payments = [] } = usePaymentsData();
  const { data: immigrationCases = [] } = useImmigrationCases();
  const { data: caseMilestones = [] } = useCaseMilestones();
  const [search, setSearch] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [payOpen, setPayOpen] = useState(false);
  const [callOpen, setCallOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // `selectedClientId` is the contract_id (Client.id === ar_dashboard.contract_id). The MyCase/LawPay/AR
  // world joins on the canonical client_id — so resolve the client first and drive the 360 + history off
  // `clientId`, never the contract_id (the old bug that left the entire MyCase 360 block silently empty).
  const selectedClient = useMemo(() => clients.find(c => c.id === selectedClientId) || null, [selectedClientId, clients]);
  const { data: myCase } = useMyCaseClient360(selectedClient?.clientId ?? null);
  const { data: clientCalls = [] } = useClientActivityHistory(selectedClient?.clientId ?? null, selectedClient?.name ?? null);

  // Deep-link support: ?clientId=... or ?contractId=... selects a client on load
  useEffect(() => {
    if (clients.length === 0) return;
    const cid = searchParams.get("clientId");
    const contractId = searchParams.get("contractId");
    const name = searchParams.get("name");
    let match: any = null;
    if (cid) match = clients.find(c => c.id === cid);
    if (!match && contractId) match = clients.find(c => (c as any).contractId === contractId);
    if (!match && name) match = clients.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (match) setSelectedClientId(match.id);
  }, [clients, searchParams]);

  // Keep URL in sync when user picks a client manually
  useEffect(() => {
    if (!selectedClientId) return;
    if (searchParams.get("clientId") === selectedClientId) return;
    const next = new URLSearchParams(searchParams);
    next.set("clientId", selectedClientId);
    setSearchParams(next, { replace: true });
  }, [selectedClientId]);

  const filteredClients = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return clients.filter(c => c.name.toLowerCase().includes(q) || c.caseNumber.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
  }, [search, clients]);

  // Payments key on client_id when both sides carry one; fall back to exact-name only when the id is absent.
  const clientPayments = useMemo(
    () => selectedClient ? payments.filter(p =>
      (selectedClient.clientId && p.clientId)
        ? p.clientId === selectedClient.clientId
        : p.clientName.toLowerCase() === selectedClient.name.toLowerCase()
    ).sort((a, b) => b.date.localeCompare(a.date)) : [],
    [selectedClient, payments]
  );

  // clientCalls now comes from useClientActivityHistory (client_id-first, full history) — no month cap.

  const assignedCollector = useMemo(
    () => selectedClient ? collectors.find(c => c.name === selectedClient.assignedCollector) : null,
    [selectedClient, collectors]
  );

  // Immigration cases for selected client - match by client_id OR by name from notes field
  const clientCasesById = useMemo(() => {
    if (!selectedClient) return [];
    const clientName = selectedClient.name.toLowerCase().trim();
    return immigrationCases.filter(ic => {
      // Match by case_number
      if (ic.case_number === selectedClient.caseNumber) return true;
      // Match by client_id if available (through clients table linkage)
      if (ic.client_id) return false; // already handled above if case_number matched
      // Match by extracting name from notes field (remove "Filevine: " prefix)
      const notesName = extractClientNameFromNotes(ic.notes).toLowerCase().trim();
      return notesName === clientName;
    });
  }, [selectedClient, immigrationCases]);

  // Get milestones for this client's cases
  const clientMilestones = useMemo(() => {
    const caseIds = new Set(clientCasesById.map(c => c.id));
    return caseMilestones
      .filter(m => caseIds.has(m.immigration_case_id))
      .sort((a, b) => (b.milestone_date || "").localeCompare(a.milestone_date || ""));
  }, [clientCasesById, caseMilestones]);

  if (cl) return <DashboardLayout><div className="p-8 text-center text-muted-foreground">Loading...</div></DashboardLayout>;

  const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof CheckCircle }> = {
    active: { variant: "default", icon: CheckCircle },
    delinquent: { variant: "destructive", icon: AlertTriangle },
    completed: { variant: "secondary", icon: CheckCircle },
    new: { variant: "outline", icon: Clock },
  };

  const paidInstallments = selectedClient
    ? Math.round((selectedClient.totalPaid / Math.max(1, selectedClient.totalOwed - selectedClient.downPayment)) * selectedClient.installmentMonths) : 0;

  const paymentTarget: PaymentTarget | null = selectedClient
    ? {
        clientId: selectedClient.id,
        contractId: (selectedClient as any).contractId || null,
        clientName: selectedClient.name,
        email: selectedClient.email,
        invoiceNumber: (selectedClient as any).invoiceNumber || null,
        caseNumber: selectedClient.caseNumber,
        defaultAmount: Math.max(0, selectedClient.totalOwed - selectedClient.totalPaid),
        collectorName: selectedClient.assignedCollector || null,
      }
    : null;

  // Off-queue interaction logging from the profile — writes back to collection_activities (+ optional
  // commitment/escalation) stamped with the canonical client_id so the queue build and financials see it.
  const callAccount = selectedClient
    ? {
        client_id: selectedClient.clientId ?? null,
        contract_id: selectedClient.id, // Client.id === contract_id
        client_name: selectedClient.name,
        collector: selectedClient.assignedCollector || null,
        assigned_collector: selectedClient.assignedCollector || null,
      }
    : null;

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
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-right mr-2">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Remaining Balance</p>
                  <p className="text-lg font-bold text-destructive">${(selectedClient.totalOwed - selectedClient.totalPaid).toLocaleString()}</p>
                </div>
                <Button variant="outline" onClick={() => setCallOpen(true)} className="gap-2">
                  <MessageSquare className="h-4 w-4" /> Log Interaction
                </Button>
                <Button onClick={() => setPayOpen(true)} className="gap-2">
                  <CreditCard className="h-4 w-4" /> Take Payment
                </Button>
              </div>
            </div>
          </div>

          {(() => {
            if (!myCase?.cases?.length) return null;
            const horizon = new Date(Date.now() + 90 * 864e5).toISOString().slice(0, 10);
            const sol = myCase.cases
              .filter((c: any) => c.sol_date && !c.is_closed && c.sol_date <= horizon)
              .sort((a: any, b: any) => String(a.sol_date).localeCompare(String(b.sol_date)));
            if (!sol.length) return null;
            return (
              <div className="rounded-lg border-2 border-destructive/50 bg-destructive/10 p-4">
                <div className="flex items-center gap-2 font-semibold text-destructive"><AlertTriangle className="h-5 w-5" />SOL / Filing Deadline</div>
                <div className="mt-2 space-y-1">
                  {sol.map((c: any) => {
                    const days = Math.round((new Date(c.sol_date).getTime() - Date.now()) / 864e5);
                    return (
                      <div key={c.mycase_case_id} className="flex items-center justify-between gap-2 text-sm">
                        <span className="min-w-0 truncate">{c.case_number} · {c.practice_area || "—"} · {c.case_stage || "—"}</span>
                        <span className="shrink-0 font-medium">{c.sol_date} {days < 0 ? `(${Math.abs(days)}d past — verify filed)` : `(in ${days}d)`}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {myCase && (myCase.contact || (myCase.cases?.length ?? 0) > 0) && (
            <div className="grid gap-6 lg:grid-cols-2">
              {myCase.contact && (
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Phone className="h-4 w-4 text-secondary" />Contact Details · MyCase</CardTitle></CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Full Name</span><span className="font-medium">{myCase.contact.full_name || selectedClient.name}</span></div><Separator />
                    <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span className="font-medium">{myCase.contact.email || "—"}</span></div><Separator />
                    <div className="flex justify-between"><span className="text-muted-foreground">Cell</span><span className="font-medium">{myCase.contact.cell_phone_number || "—"}</span></div><Separator />
                    <div className="flex justify-between"><span className="text-muted-foreground">Work</span><span className="font-medium">{myCase.contact.work_phone_number || "—"}</span></div><Separator />
                    <div className="flex justify-between"><span className="text-muted-foreground">Home</span><span className="font-medium">{myCase.contact.home_phone_number || "—"}</span></div><Separator />
                    <div className="flex justify-between"><span className="text-muted-foreground">Contact Group</span><span className="font-medium">{myCase.contact.contact_group || "—"}</span></div>
                    {myCase.contact.company && <><Separator /><div className="flex justify-between"><span className="text-muted-foreground">Company</span><span className="font-medium">{myCase.contact.company}</span></div></>}
                    {myCase.contact.birthdate && <><Separator /><div className="flex justify-between"><span className="text-muted-foreground">Birthdate</span><span className="font-medium">{myCase.contact.birthdate}</span></div></>}
                  </CardContent>
                </Card>
              )}
              {(myCase.cases?.length ?? 0) > 0 && (
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Scale className="h-4 w-4 text-secondary" />MyCase Cases ({myCase.cases.length})</CardTitle></CardHeader>
                  <CardContent>
                    <div className="max-h-72 space-y-2 overflow-y-auto">
                      {myCase.cases.map((c: any) => (
                        <div key={c.id} className="rounded-md border px-3 py-2 text-sm">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium">{c.case_name || c.case_number}</span>
                            <Badge variant={c.is_closed ? "secondary" : "default"} className="shrink-0 text-xs capitalize">{c.case_stage || c.status || "—"}</Badge>
                          </div>
                          <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                            <span>Practice: {c.practice_area || "—"}</span>
                            <span>Attorney: {c.lead_attorney || "—"}</span>
                            <span>Billing: {c.billing_type || "—"}</span>
                            <span>Flat fee: {c.flat_fee != null ? `$${Number(c.flat_fee).toLocaleString()}` : "—"}</span>
                            <span>Balance: {c.outstanding_balance != null ? `$${Number(c.outstanding_balance).toLocaleString()}` : "—"}</span>
                            <span>SOL: {c.sol_date || "—"}</span>
                            <span>Opened: {c.open_date || "—"}</span>
                            {c.is_closed && <span>Closed: {c.closed_date || "—"}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

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

          {/* Immigration Cases Section */}
          {clientCasesById.length > 0 && (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Scale className="h-4 w-4 text-secondary" />Immigration Cases ({clientCasesById.length})</CardTitle></CardHeader>
                <CardContent>
                  <div className="max-h-64 space-y-2 overflow-y-auto">
                    {clientCasesById.map(ic => (
                      <div key={ic.id} className="rounded-md border px-3 py-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{ic.case_number}</span>
                          <Badge variant="outline" className="text-xs capitalize">{ic.case_stage || "—"}</Badge>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                          <span>{ic.practice_area}</span>
                          {ic.lead_attorney && <span>· Atty: {ic.lead_attorney}</span>}
                          {ic.detained && <Badge variant="destructive" className="text-[10px]">Detained</Badge>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Calendar className="h-4 w-4 text-secondary" />Case Milestones ({clientMilestones.length})</CardTitle></CardHeader>
                <CardContent>
                  {clientMilestones.length === 0 ? <p className="text-sm text-muted-foreground">No milestones recorded.</p> : (
                    <div className="max-h-64 space-y-2 overflow-y-auto">
                      {clientMilestones.map(m => (
                        <div key={m.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                          <div>
                            <span className="font-medium">{m.milestone_type}</span>
                            {m.notes && <p className="text-xs text-muted-foreground mt-0.5">{m.notes}</p>}
                          </div>
                          <div className="flex items-center gap-2">
                            {m.completed && <CheckCircle className="h-3.5 w-3.5 text-secondary" />}
                            <span className="text-xs text-muted-foreground">{m.milestone_date || "—"}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

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

          {myCase && (((myCase.transactions?.length ?? 0) > 0) || ((myCase.lawpayRecent?.length ?? 0) > 0) || ((myCase.plans?.length ?? 0) > 0)) && (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base"><CreditCard className="h-4 w-4 text-secondary" />Payment Ledger ({(myCase.transactions?.length ?? 0) + (myCase.lawpayRecent?.length ?? 0)})</CardTitle>
                  <p className="text-[11px] text-muted-foreground">MyCase synced through {myCase.mycaseThrough || "—"}{(myCase.lawpayRecent?.length ?? 0) > 0 ? ` · ${myCase.lawpayRecent.length} newer payment(s) from LawPay` : ""}</p>
                </CardHeader>
                <CardContent>
                  {((myCase.transactions?.length ?? 0) + (myCase.lawpayRecent?.length ?? 0)) === 0 ? <p className="text-sm text-muted-foreground">No payments on record.</p> : (
                    <div className="max-h-72 space-y-2 overflow-y-auto">
                      {(myCase.lawpayRecent ?? []).map((t: any) => (
                        <div key={`lp-${t.id}`} className="flex items-center justify-between rounded-md border border-secondary/40 bg-secondary/5 px-3 py-2 text-sm">
                          <div>
                            <span className="font-medium">${Number(t.amount).toLocaleString()}</span>
                            <span className="ml-2 text-xs text-muted-foreground">{t.card_brand || t.payment_method || "Card"}{t.card_last_four ? ` ••${t.card_last_four}` : ""}</span>
                            <span className="ml-2 text-[10px] text-secondary">LawPay · pending MyCase sync</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="default" className="text-xs">Completed</Badge>
                            <span className="text-xs text-muted-foreground">{t.payment_date || "—"}</span>
                          </div>
                        </div>
                      ))}
                      {(myCase.transactions ?? []).map((t: any) => (
                        <div key={t.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                          <div>
                            <span className="font-medium">${Number(t.amount).toLocaleString()}</span>
                            <span className="ml-2 text-xs text-muted-foreground">{t.method || "—"}</span>
                            {t.entered_by && <span className="ml-2 text-[10px] text-muted-foreground">by {t.entered_by}</span>}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={t.status === "Completed" ? "default" : t.status === "Failed" ? "destructive" : "outline"} className="text-xs">{t.status || "—"}</Badge>
                            <span className="text-xs text-muted-foreground">{t.payment_date || "—"}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              {(myCase.plans?.length ?? 0) > 0 && (
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Calendar className="h-4 w-4 text-secondary" />Payment Plan</CardTitle></CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {myCase.plans.map((pl: any) => (
                      <div key={pl.id} className="rounded-md border px-3 py-2 space-y-1">
                        <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span className="font-semibold">${Number(pl.total || 0).toLocaleString()}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Paid</span><span>${Number(pl.paid || 0).toLocaleString()}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Installments</span><span>{pl.installments_paid ?? 0} / {pl.total_installments ?? "—"}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Next Due</span><span>{pl.next_due_date || "—"}{pl.next_amount ? ` ($${Number(pl.next_amount).toLocaleString()})` : ""}</span></div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted"><Search className="h-7 w-7 text-muted-foreground" /></div>
          <h3 className="text-lg font-semibold">Search for a Client</h3>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">Use the search bar above to find a client by name, case number, or email.</p>
        </div>
      )}

      <TakePaymentDialog open={payOpen} onOpenChange={setPayOpen} target={paymentTarget} />
      <CallDocumentationDialog open={callOpen} onOpenChange={setCallOpen} account={callAccount} />
    </DashboardLayout>
  );
};

export default ClientLookup;
