import { useState, useMemo, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import {
  useClientMasterSearch, useClientMasterCard, useArDashboardContract, useClientLedger, useClientImmigrationCases,
  useCaseMilestonesFor, useClientActivityHistory, useMyCaseClient360, useFeedFreshness, CLIENT_STATUS_LABEL,
  type ClientMasterRow,
} from "@/hooks/useSupabaseData";
import { clientProfileHref, statusBadgeVariant, offDialLabel } from "@/components/ClientSearchBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Search, FileText, Phone, DollarSign, Clock, AlertTriangle, CheckCircle, MessageSquare, Scale, Calendar, CreditCard, User } from "lucide-react";
import TakePaymentDialog, { type PaymentTarget } from "@/components/TakePaymentDialog";
import CallDocumentationDialog from "@/components/CallDocumentationDialog";

/** "data as of" line for a profile section. `red` marks a feed the freshness monitor flags as stale. */
function AsOf({ source, date, red, note }: { source: string; date?: string | null; red?: boolean; note?: string }) {
  const d = date ? String(date).slice(0, 10) : null;
  return (
    <p className={`text-[11px] ${red ? "text-amber-700 dark:text-amber-400" : "text-muted-foreground"}`}>
      {source}{d ? ` · data as of ${d}` : ""}{red ? " · stale feed" : ""}{note ? ` · ${note}` : ""}
    </p>
  );
}

const money = (n: number) => `$${Math.round(n).toLocaleString()}`;

// 2026-10-13 (Jeff: "can I use the search bar to look up clients now? please be sure that the front end is feeding
// from the supabase tables that carries all client info"):
// - Search covers the CLIENT MASTER (search_clients: every canonical client — open AR, paid off, closed, consult-only,
//   Filevine-only — plus open AR contracts with no client link), not only the open AR book.
// - A profile opens for ANY client: ?client=<client_id> (client master), optionally &clientId=<contract_id> (open AR
//   contract; old ?clientId= links still work). AR sections render only when there is an open AR contract.
// - Payment History reads the CERTIFIED cash ledger (v_financial_ledger_canonical), not payments_clean.
// - Every section shows where its data comes from and how fresh that feed is (v_feed_freshness).
const ClientLookup = () => {
  const [search, setSearch] = useState("");
  const [term, setTerm] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setTerm(search.trim()), 250);
    return () => clearTimeout(t);
  }, [search]);
  const { data: hits = [], isFetching: searching } = useClientMasterSearch(term);
  const [payOpen, setPayOpen] = useState(false);
  const [callOpen, setCallOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const masterParam = searchParams.get("client");
  const contractParam = searchParams.get("clientId") || searchParams.get("contractId");
  const nameParam = searchParams.get("name");

  // Open AR contract (ar_dashboard, contract grain) when there is one.
  const { data: contractRow, isLoading: contractLoading } = useArDashboardContract(contractParam);
  const contract = contractRow ?? null;
  // Canonical client (client master): from the URL, or from the contract's client link.
  const masterId = masterParam || contract?.clientId || null;
  const { data: cardRow, isLoading: cardLoading } = useClientMasterCard(masterId);
  const card = cardRow ?? null;

  // A client opened without a contract that HAS open AR: attach its largest open contract.
  useEffect(() => {
    if (contractParam || !card?.bestContractId) return;
    const next = new URLSearchParams(searchParams);
    next.set("clientId", card.bestContractId);
    setSearchParams(next, { replace: true });
  }, [card?.bestContractId, contractParam]);

  // ?name=... resolves an exact (case-insensitive) name through the client-master search.
  useEffect(() => {
    if (!nameParam || masterParam || contractParam) return;
    let cancelled = false;
    (async () => {
      const { data } = await (supabase as any).rpc("search_clients", { p_term: nameParam, p_limit: 20 });
      const exact = (data ?? []).find((r: any) => (r.display_name || "").toLowerCase() === nameParam.toLowerCase());
      if (!cancelled && exact) {
        const p = new URLSearchParams();
        if (exact.client_id) p.set("client", exact.client_id);
        if (exact.best_contract_id) p.set("clientId", exact.best_contract_id);
        setSearchParams(p, { replace: true });
      }
    })();
    return () => { cancelled = true; };
  }, [nameParam, masterParam, contractParam]);

  const openHit = (hit: ClientMasterRow) => {
    setSearchParams(new URLSearchParams(clientProfileHref(hit).split("?")[1]));
    setSearch("");
    setTerm("");
  };

  const searchActive = term.length >= 2 && search.trim().length >= 2;
  const filteredClients = searchActive ? hits : [];

  const displayName = contract?.name || card?.name || "";
  const displayEmail = contract?.email || card?.email || "";
  const displayPhone = contract?.phone || card?.phone || "";
  const caseNumber = contract?.caseNumber || card?.caseNumber || "";

  const { data: myCase } = useMyCaseClient360(masterId);
  const { data: clientCalls = [] } = useClientActivityHistory(masterId, displayName || null);
  const { data: fresh } = useFeedFreshness();

  // Payments: certified cash ledger by client_id + no-client ledger rows on this client's MyCase invoice numbers.
  const invoiceNumbers = useMemo(() => (myCase?.invoices ?? []).map((i: any) => i.invoice_number).filter(Boolean), [myCase]);
  const { data: ledger = [] } = useClientLedger(masterId, invoiceNumbers);
  const ledgerThrough = ledger.length ? ledger[0].date : null;
  // LawPay card payments that are newer than this client's latest ledger payment: not in MyCase yet.
  const lawpayPending = useMemo(
    () => (myCase?.lawpayRecent ?? []).filter((l: any) => l.payment_date && (!ledgerThrough || l.payment_date > ledgerThrough)),
    [myCase, ledgerThrough],
  );

  // Legacy case records (immigration_cases / case_milestones: frozen since April 2026).
  const { data: clientCasesById = [] } = useClientImmigrationCases(caseNumber || null, displayName || null);
  const caseIds = useMemo(() => clientCasesById.map((c: any) => c.id), [clientCasesById]);
  const { data: clientMilestones = [] } = useCaseMilestonesFor(caseIds);

  const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof CheckCircle }> = {
    active: { variant: "default", icon: CheckCircle },
    delinquent: { variant: "destructive", icon: AlertTriangle },
    completed: { variant: "secondary", icon: CheckCircle },
    new: { variant: "outline", icon: Clock },
  };

  const paidInstallments = contract
    ? Math.round((contract.totalPaid / Math.max(1, contract.totalOwed - contract.downPayment)) * contract.installmentMonths) : 0;

  const paymentTarget: PaymentTarget | null = contract
    ? {
        clientId: contract.id,
        contractId: (contract as any).contractId || null,
        clientName: contract.name,
        email: contract.email,
        invoiceNumber: (contract as any).invoiceNumber || null,
        caseNumber: contract.caseNumber,
        defaultAmount: Math.max(0, contract.totalOwed - contract.totalPaid),
        collectorName: contract.assignedCollector || null,
      }
    : null;

  // Off-queue interaction logging — writes back to collection_activities stamped with the canonical client_id.
  const callAccount = contract || card
    ? {
        client_id: masterId,
        contract_id: contract?.id ?? null,
        client_name: displayName,
        collector: contract?.assignedCollector || card?.collector || null,
        assigned_collector: contract?.assignedCollector || card?.collector || null,
      }
    : null;

  const feeds = fresh?.feeds ?? {};
  const loading = (!!contractParam && contractLoading) || (!!masterParam && cardLoading);
  const hasProfile = !!(contract || card);

  return (
    <DashboardLayout>
      <div className="mb-6"><h1 className="text-2xl font-bold">Client Lookup</h1><p className="text-muted-foreground">Search every client — name, phone, email, case number or invoice number</p></div>
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search clients by name, phone, email, case number or invoice number..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-12 pl-11 text-base" />
        {filteredClients.length > 0 && (
          <div className="absolute left-0 right-0 top-14 z-50 max-h-80 overflow-y-auto rounded-lg border bg-card shadow-lg">
            {filteredClients.slice(0, 20).map(c => (
              <button key={c.rowKey} onClick={() => openHit(c)} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-accent">
                <div className="min-w-0">
                  <p className="truncate font-medium">{c.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{[c.caseNumber, c.latestCaseStage, c.lastPaymentDate ? `last paid ${c.lastPaymentDate}` : ""].filter(Boolean).join(" · ") || "—"}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <Badge variant={statusBadgeVariant(c.status)} className="text-xs">{CLIENT_STATUS_LABEL[c.status]}{c.openAr > 0 ? ` ${money(c.openAr)}` : ""}</Badge>
                  {c.offDial && <Badge variant="outline" className="text-[10px] border-destructive/50 text-destructive">{offDialLabel(c.offDialSource)}</Badge>}
                </div>
              </button>
            ))}
          </div>
        )}
        {searchActive && !searching && filteredClients.length === 0 && (
          <div className="absolute left-0 right-0 top-14 z-50 rounded-lg border bg-card p-4 text-center text-sm text-muted-foreground shadow-lg">No clients found matching "{search}"</div>
        )}
      </div>

      {loading ? (
        <div className="p-8 text-center text-muted-foreground">Loading client…</div>
      ) : hasProfile ? (
        <div className="space-y-6">
          <div className="dashboard-section">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">{displayName.split(" ").map(w => w[0]).join("").slice(0, 2)}</div>
                <div>
                  <h2 className="text-xl font-bold">{displayName}</h2>
                  <p className="text-sm text-muted-foreground">{[displayEmail, displayPhone].filter(Boolean).join(" · ") || "—"}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    {card && <Badge variant={statusBadgeVariant(card.status)}>{CLIENT_STATUS_LABEL[card.status]}{card.openAr > 0 ? ` ${money(card.openAr)}` : ""}</Badge>}
                    {card?.offDial && <Badge variant="outline" className="border-destructive/50 text-destructive">{offDialLabel(card.offDialSource)}</Badge>}
                    {contract && <Badge variant={statusConfig[contract.status].variant} className="capitalize">{contract.status}</Badge>}
                    {contract && contract.daysAging > 0 && <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" />{contract.daysAging} days aging</Badge>}
                  </div>
                  {card?.refreshedAt && <AsOf source="Client master (clients + identity links)" date={card.refreshedAt} note="search index refreshes hourly" />}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-right mr-2">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{contract ? "Remaining Balance" : "Open AR"}</p>
                  <p className={`text-lg font-bold ${contract || (card?.openAr ?? 0) > 0 ? "text-destructive" : ""}`}>
                    {contract ? `$${(contract.totalOwed - contract.totalPaid).toLocaleString()}` : money(card?.openAr ?? 0)}
                  </p>
                </div>
                <Button variant="outline" onClick={() => setCallOpen(true)} className="gap-2">
                  <MessageSquare className="h-4 w-4" /> Log Interaction
                </Button>
                <Button onClick={() => setPayOpen(true)} className="gap-2" disabled={!contract} title={contract ? undefined : "No open AR contract for this client"}>
                  <CreditCard className="h-4 w-4" /> Take Payment
                </Button>
              </div>
            </div>
            {card && card.openContracts > 1 && (
              <p className="mt-2 text-xs text-muted-foreground">This client has {card.openContracts} open AR contracts ({money(card.openAr)} total); the contract shown below is the largest.</p>
            )}
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
                <AsOf source="MyCase cases" date={feeds.cases?.asOf} red={feeds.cases?.isRed} />
              </div>
            );
          })()}

          {myCase && (myCase.contact || (myCase.cases?.length ?? 0) > 0) && (
            <div className="grid gap-6 lg:grid-cols-2">
              {myCase.contact && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base"><Phone className="h-4 w-4 text-secondary" />Contact Details · MyCase</CardTitle>
                    <AsOf source="MyCase contacts" date={feeds.contacts?.asOf} red={feeds.contacts?.isRed} />
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Full Name</span><span className="font-medium">{myCase.contact.full_name || displayName}</span></div><Separator />
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
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base"><Scale className="h-4 w-4 text-secondary" />MyCase Cases ({myCase.cases.length})</CardTitle>
                    <AsOf source="MyCase cases" date={feeds.cases?.asOf} red={feeds.cases?.isRed} />
                  </CardHeader>
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

          {contract ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base"><FileText className="h-4 w-4 text-secondary" />Case Specifics</CardTitle>
                  <AsOf source="AR book (ar_dashboard)" date={fresh?.arSnapshotDate} />
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Case Number</span><span className="font-mono font-semibold">{contract.caseNumber}</span></div><Separator />
                  <div className="flex justify-between"><span className="text-muted-foreground">Case Type</span><span className="font-medium">{contract.caseType}</span></div><Separator />
                  <div className="flex justify-between"><span className="text-muted-foreground">Assigned Collector</span><span className="font-medium">{contract.assignedCollector ?? "—"}</span></div><Separator />
                  <div className="flex justify-between"><span className="text-muted-foreground">Contract Period</span><span>{contract.contractStart} → {contract.contractEnd || "Ongoing"}</span></div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base"><DollarSign className="h-4 w-4 text-secondary" />Contract Breakdown</CardTitle>
                  <AsOf source="AR book (ar_dashboard)" date={fresh?.arSnapshotDate} />
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Total Contract Value</span><span className="font-bold">${contract.totalOwed.toLocaleString()}</span></div><Separator />
                  <div className="flex justify-between"><span className="text-muted-foreground">Down Payment</span><span className="font-semibold text-secondary">${contract.downPayment.toLocaleString()}</span></div><Separator />
                  <div className="flex justify-between"><span className="text-muted-foreground">Monthly Installment</span><span>${contract.monthlyPayment.toLocaleString()} × {contract.installmentMonths} months</span></div><Separator />
                  <div className="flex justify-between"><span className="text-muted-foreground">Total Paid</span><span className="font-semibold">${contract.totalPaid.toLocaleString()}</span></div><Separator />
                  <div className="flex justify-between"><span className="text-muted-foreground">Remaining Balance</span><span className="font-bold text-destructive">${(contract.totalOwed - contract.totalPaid).toLocaleString()}</span></div>
                  <div className="pt-2">
                    <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground"><span>Payment Progress</span><span>{Math.min(paidInstallments, contract.installmentMonths)} / {contract.installmentMonths} installments</span></div>
                    <Progress value={contract.totalOwed > 0 ? (contract.totalPaid / contract.totalOwed) * 100 : 0} className="h-2.5" />
                  </div>
                  <div className="flex justify-between pt-1"><span className="text-muted-foreground">Next Payment Due</span><span className="font-medium">{contract.nextPaymentDue || "—"}</span></div>
                </CardContent>
              </Card>
            </div>
          ) : card ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base"><User className="h-4 w-4 text-secondary" />Client Summary · no open AR contract</CardTitle>
                <AsOf source="Client master (clients + identity links)" date={card.refreshedAt} />
              </CardHeader>
              <CardContent className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
                <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className="font-medium">{CLIENT_STATUS_LABEL[card.status]}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Case Number</span><span className="font-mono">{card.caseNumber || "—"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Payments on the ledger</span><span className="font-medium">{card.ledgerPayments.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Last payment</span><span className="font-medium">{card.lastPaymentDate || "—"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">MyCase cases</span><span className="font-medium">{card.mycaseCases}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Latest case stage</span><span className="font-medium">{card.latestCaseStage || "—"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Collector</span><span className="font-medium">{card.collector || "—"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Client record type</span><span className="font-medium">{card.qualityStatus ? card.qualityStatus.replace(/_/g, " ") : "—"}</span></div>
              </CardContent>
            </Card>
          ) : null}

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base"><DollarSign className="h-4 w-4 text-secondary" />Payment History ({ledger.length + lawpayPending.length})</CardTitle>
                <AsOf source="Certified cash ledger (MyCase payments)" date={feeds.transactions_rich?.asOf} red={feeds.transactions_rich?.isRed} />
                {lawpayPending.length > 0 && <AsOf source={`${lawpayPending.length} newer LawPay payment(s) not in MyCase yet`} date={feeds.lawpay?.asOf} red={feeds.lawpay?.isRed} />}
              </CardHeader>
              <CardContent>
                {ledger.length + lawpayPending.length === 0 ? <p className="text-sm text-muted-foreground">No payments on record.</p> : (
                  <div className="max-h-72 space-y-2 overflow-y-auto">
                    {lawpayPending.map((t: any) => (
                      <div key={`lp-${t.id}`} className="flex items-center justify-between rounded-md border border-secondary/40 bg-secondary/5 px-3 py-2 text-sm">
                        <div>
                          <span className="font-medium">${Number(t.amount).toLocaleString()}</span>
                          <span className="ml-2 text-xs text-muted-foreground">{t.card_brand || t.payment_method || "Card"}{t.card_last_four ? ` ••${t.card_last_four}` : ""}</span>
                          <span className="ml-2 text-[10px] text-secondary">LawPay · pending MyCase sync</span>
                        </div>
                        <div className="flex items-center gap-2"><Badge variant="default" className="text-xs">Completed</Badge><span className="text-xs text-muted-foreground">{t.payment_date || "—"}</span></div>
                      </div>
                    ))}
                    {ledger.map(p => (
                      <div key={p.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                        <div>
                          <span className="font-medium">${p.amount.toLocaleString()}</span>
                          <span className="ml-2 text-xs text-muted-foreground">{p.method || "—"}</span>
                          {p.enteredBy && <span className="ml-2 text-[10px] text-muted-foreground">by {p.enteredBy}</span>}
                        </div>
                        <div className="flex items-center gap-2"><Badge variant={p.status === "Completed" ? "default" : "outline"} className="text-xs">{p.status || "—"}</Badge><span className="text-xs text-muted-foreground">{p.date}</span></div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base"><Phone className="h-4 w-4 text-secondary" />Call History ({clientCalls.length})</CardTitle>
                <AsOf source="Collector activity log" date={fresh?.activity?.asOf} red={(fresh?.activity?.ageDays ?? 0) > 3} />
              </CardHeader>
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

          {(myCase?.plans?.length ?? 0) > 0 && (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base"><Calendar className="h-4 w-4 text-secondary" />Payment Plan</CardTitle>
                  <AsOf source="MyCase payment plans" date={feeds.payment_plans?.asOf} red={feeds.payment_plans?.isRed} />
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {myCase!.plans.map((pl: any) => (
                    <div key={pl.id} className="rounded-md border px-3 py-2 space-y-1">
                      <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span className="font-semibold">${Number(pl.total || 0).toLocaleString()}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Paid</span><span>${Number(pl.paid || 0).toLocaleString()}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Installments</span><span>{pl.installments_paid ?? 0} / {pl.total_installments ?? "—"}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Next Due</span><span>{pl.next_due_date || "—"}{pl.next_amount ? ` ($${Number(pl.next_amount).toLocaleString()})` : ""}</span></div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Legacy case records — frozen tables from the original app (immigration_cases since 2026-04-14,
              case_milestones since 2026-03-20). MyCase cases above are the current source. */}
          {clientCasesById.length > 0 && (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base"><Scale className="h-4 w-4 text-secondary" />Legacy Case Records ({clientCasesById.length})</CardTitle>
                  <AsOf source="Legacy immigration_cases (frozen)" date="2026-04-14" red note="MyCase cases above are current" />
                </CardHeader>
                <CardContent>
                  <div className="max-h-64 space-y-2 overflow-y-auto">
                    {clientCasesById.map((ic: any) => (
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
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base"><Calendar className="h-4 w-4 text-secondary" />Legacy Case Milestones ({clientMilestones.length})</CardTitle>
                  <AsOf source="Legacy case_milestones (frozen)" date="2026-03-20" red />
                </CardHeader>
                <CardContent>
                  {clientMilestones.length === 0 ? <p className="text-sm text-muted-foreground">No milestones recorded.</p> : (
                    <div className="max-h-64 space-y-2 overflow-y-auto">
                      {clientMilestones.map((m: any) => (
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
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted"><Search className="h-7 w-7 text-muted-foreground" /></div>
          <h3 className="text-lg font-semibold">Search for a Client</h3>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">Search every client — open AR, paid off, closed or consult-only — by name, phone, email, case number or invoice number.</p>
        </div>
      )}

      <TakePaymentDialog open={payOpen} onOpenChange={setPayOpen} target={paymentTarget} />
      <CallDocumentationDialog open={callOpen} onOpenChange={setCallOpen} account={callAccount} />
    </DashboardLayout>
  );
};

export default ClientLookup;
