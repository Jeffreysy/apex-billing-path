import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fetchAllRows } from "@/hooks/useSupabaseData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, Cell } from "recharts";
import { format, subMonths, startOfMonth, endOfMonth, parseISO, differenceInDays } from "date-fns";
import { CheckCircle2, XCircle, Clock, AlertTriangle, TrendingUp, TrendingDown, Download, Phone } from "lucide-react";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n || 0);
const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

function downloadCsv(filename: string, rows: Record<string, any>[]) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const escape = (v: any) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers.join(","), ...rows.map(r => headers.map(h => escape(r[h])).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ---------- PTP Kept Rate ----------
function PTPSection() {
  // Use payment_commitments if populated, else derive from collection_activities.next_payment_expected
  const { data: commitments = [] } = useQuery({
    queryKey: ["ptp-commitments"],
    queryFn: async () => fetchAllRows<any>("payment_commitments"),
    staleTime: 5 * 60 * 1000,
  });

  const { data: activities = [] } = useQuery({
    queryKey: ["ptp-activities"],
    queryFn: async () => fetchAllRows<any>("collection_activities"),
    staleTime: 5 * 60 * 1000,
  });

  const { data: payments = [] } = useQuery({
    queryKey: ["ptp-payments"],
    queryFn: async () => fetchAllRows<any>("payments_clean", { orderBy: "payment_date", ascending: false }),
    staleTime: 5 * 60 * 1000,
  });

  // Derive promises: prefer payment_commitments table; else build from activities
  const promises = useMemo(() => {
    if (commitments.length > 0) {
      return commitments.map((c: any) => ({
        id: c.id,
        client_id: c.client_id,
        client_name: c.client_name || "—",
        collector: c.collector,
        promised_date: c.promised_date,
        promised_amount: Number(c.promised_amount) || 0,
        source: "commitment" as const,
      }));
    }
    // Derive from activities — only outbound calls with a parseable next_payment_expected date
    return activities
      .filter((a: any) => {
        if (a.activity_type !== "outbound_call") return false;
        const npe = a.next_payment_expected;
        if (!npe) return false;
        // Accept ISO date strings only
        return /^\d{4}-\d{2}-\d{2}/.test(String(npe));
      })
      .map((a: any) => ({
        id: a.id,
        client_id: a.client_id,
        client_name: a.client_name,
        collector: a.collector,
        promised_date: String(a.next_payment_expected).slice(0, 10),
        promised_amount: 0, // unknown when derived
        source: "derived" as const,
      }));
  }, [commitments, activities]);

  // Group payments by client for kept-check
  const paymentsByClient = useMemo(() => {
    const map: Record<string, { date: string; amount: number }[]> = {};
    for (const p of payments) {
      if (!p.client_id) continue;
      if (!map[p.client_id]) map[p.client_id] = [];
      map[p.client_id].push({ date: p.payment_date, amount: Number(p.amount) || 0 });
    }
    return map;
  }, [payments]);

  const today = new Date().toISOString().slice(0, 10);

  const enriched = useMemo(() => {
    return promises.map(p => {
      const clientPayments = paymentsByClient[p.client_id] || [];
      // Kept = any payment on the same day or up to 14 days before promised date and not yet matched is too lax;
      // Strict rule: a payment dated on/before promised_date AND on/after promise creation horizon (we don't have promise date — use 30d before)
      const promisedD = p.promised_date;
      const horizon = format(subMonths(parseISO(promisedD), 1), "yyyy-MM-dd");
      const matchedPayment = clientPayments.find(cp => cp.date >= horizon && cp.date <= promisedD);
      let status: "kept" | "broken" | "pending";
      if (matchedPayment) status = "kept";
      else if (promisedD > today) status = "pending";
      else status = "broken";
      return { ...p, status, matched_amount: matchedPayment?.amount || 0, matched_date: matchedPayment?.date || null };
    });
  }, [promises, paymentsByClient, today]);

  // KPIs (last 90 days for relevance)
  const cutoff = format(subMonths(new Date(), 3), "yyyy-MM-dd");
  const recent = enriched.filter(e => e.promised_date >= cutoff);
  const kept = recent.filter(e => e.status === "kept").length;
  const broken = recent.filter(e => e.status === "broken").length;
  const pending = recent.filter(e => e.status === "pending").length;
  const resolved = kept + broken;
  const keptRate = resolved > 0 ? kept / resolved : 0;

  // By collector
  const byCollector = useMemo(() => {
    const map: Record<string, { kept: number; broken: number; pending: number }> = {};
    for (const e of recent) {
      const k = e.collector || "Unassigned";
      if (!map[k]) map[k] = { kept: 0, broken: 0, pending: 0 };
      map[k][e.status] += 1;
    }
    return Object.entries(map)
      .map(([collector, v]) => ({
        collector,
        ...v,
        rate: v.kept + v.broken > 0 ? v.kept / (v.kept + v.broken) : 0,
      }))
      .sort((a, b) => b.rate - a.rate);
  }, [recent]);

  // Promises due today
  const dueToday = enriched
    .filter(e => e.promised_date === today && e.status === "pending")
    .sort((a, b) => (a.collector || "").localeCompare(b.collector || ""));

  return (
    <div className="space-y-4">
      {commitments.length === 0 && (
        <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
          No formal payment commitments logged yet. Showing promises derived from <code>collection_activities.next_payment_expected</code>.
          Encourage collectors to log promises through the Payment Commitments page for accurate tracking.
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">PTP Kept Rate (90d)</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pct(keptRate)}</div>
            <p className="text-xs text-muted-foreground">{kept} kept / {resolved} resolved</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Kept</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-5 w-5" />{kept}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Broken</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive flex items-center gap-1"><XCircle className="h-5 w-5" />{broken}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Pending</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 flex items-center gap-1"><Clock className="h-5 w-5" />{pending}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm">Kept Rate by Collector (90d)</CardTitle></CardHeader>
          <CardContent>
            {byCollector.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">No promise data in the last 90 days.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Collector</TableHead>
                    <TableHead className="text-right">Kept</TableHead>
                    <TableHead className="text-right">Broken</TableHead>
                    <TableHead className="text-right">Pending</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {byCollector.map(c => (
                    <TableRow key={c.collector}>
                      <TableCell className="font-medium">{c.collector}</TableCell>
                      <TableCell className="text-right text-emerald-600">{c.kept}</TableCell>
                      <TableCell className="text-right text-destructive">{c.broken}</TableCell>
                      <TableCell className="text-right text-amber-600">{c.pending}</TableCell>
                      <TableCell className="text-right font-mono">
                        <Badge variant={c.rate >= 0.6 ? "default" : c.rate >= 0.4 ? "secondary" : "destructive"}>
                          {pct(c.rate)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Promises Due Today ({dueToday.length})</CardTitle>
              {dueToday.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => downloadCsv(`promises-due-${today}.csv`, dueToday as any)}>
                  <Download className="mr-1 h-3 w-3" />CSV
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {dueToday.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">No promises due today. 🎉</p>
            ) : (
              <div className="max-h-[300px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Collector</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dueToday.map(p => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium text-sm">{p.client_name}</TableCell>
                        <TableCell className="text-sm">{p.collector}</TableCell>
                        <TableCell className="text-right font-mono text-sm">{p.promised_amount > 0 ? fmt(p.promised_amount) : "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ---------- AR Roll-Forward ----------
function ARRollForwardSection() {
  const { data: contracts = [] } = useQuery({
    queryKey: ["arrf-contracts"],
    queryFn: async () => fetchAllRows<any>("contracts"),
    staleTime: 5 * 60 * 1000,
  });
  const { data: payments = [] } = useQuery({
    queryKey: ["arrf-payments"],
    queryFn: async () => fetchAllRows<any>("payments_clean"),
    staleTime: 5 * 60 * 1000,
  });

  // Build last 6 months
  const months = useMemo(() => {
    const arr: { key: string; label: string; start: Date; end: Date }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(new Date(), i);
      arr.push({
        key: format(d, "yyyy-MM"),
        label: format(d, "MMM yy"),
        start: startOfMonth(d),
        end: endOfMonth(d),
      });
    }
    return arr;
  }, []);

  const rollForward = useMemo(() => {
    // For each month: New AR added (contracts created that month, by value),
    // Collections (payments that month), Net Movement
    const rows = months.map(m => {
      const newContracts = contracts.filter((c: any) => {
        if (!c.created_at) return false;
        const d = new Date(c.created_at);
        return d >= m.start && d <= m.end;
      });
      const newAR = newContracts.reduce((s: number, c: any) => s + (Number(c.value) || 0), 0);

      const monthPayments = payments.filter((p: any) => {
        if (!p.payment_date) return false;
        const d = parseISO(p.payment_date);
        return d >= m.start && d <= m.end;
      });
      const collections = monthPayments.reduce((s: number, p: any) => s + (Number(p.amount) || 0), 0);

      return {
        month: m.label,
        newAR,
        collections,
        net: newAR - collections,
        newContractCount: newContracts.length,
      };
    });
    return rows;
  }, [contracts, payments, months]);

  const totals = rollForward.reduce(
    (acc, r) => ({ newAR: acc.newAR + r.newAR, collections: acc.collections + r.collections, net: acc.net + r.net }),
    { newAR: 0, collections: 0, net: 0 }
  );

  const trending = rollForward.length >= 2 ? rollForward[rollForward.length - 1].net - rollForward[rollForward.length - 2].net : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">New AR (6mo)</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{fmt(totals.newAR)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Collections (6mo)</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-emerald-600">{fmt(totals.collections)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Net AR Movement</CardTitle></CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totals.net >= 0 ? "text-amber-600" : "text-emerald-600"}`}>
              {totals.net >= 0 ? "+" : ""}{fmt(totals.net)}
            </div>
            <p className="text-xs text-muted-foreground">{totals.net >= 0 ? "AR growing" : "AR shrinking"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Trend (mo/mo)</CardTitle></CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold flex items-center gap-1 ${trending <= 0 ? "text-emerald-600" : "text-destructive"}`}>
              {trending <= 0 ? <TrendingDown className="h-5 w-5" /> : <TrendingUp className="h-5 w-5" />}
              {fmt(Math.abs(trending))}
            </div>
            <p className="text-xs text-muted-foreground">{trending <= 0 ? "Improving" : "Worsening"}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">AR Roll-Forward (6 months)</CardTitle>
            <Button variant="outline" size="sm" onClick={() => downloadCsv(`ar-rollforward-${format(new Date(), "yyyy-MM-dd")}.csv`, rollForward)}>
              <Download className="mr-1 h-3 w-3" />CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={rollForward}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => fmt(v)} />
              <Legend />
              <Bar dataKey="newAR" name="New AR" fill="hsl(var(--primary))" />
              <Bar dataKey="collections" name="Collections" fill="hsl(var(--chart-2, 142 76% 36%))" />
            </BarChart>
          </ResponsiveContainer>

          <Table className="mt-4">
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead className="text-right">New Contracts</TableHead>
                <TableHead className="text-right">New AR</TableHead>
                <TableHead className="text-right">Collections</TableHead>
                <TableHead className="text-right">Net Movement</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rollForward.map(r => (
                <TableRow key={r.month}>
                  <TableCell className="font-medium">{r.month}</TableCell>
                  <TableCell className="text-right">{r.newContractCount}</TableCell>
                  <TableCell className="text-right font-mono">{fmt(r.newAR)}</TableCell>
                  <TableCell className="text-right font-mono text-emerald-600">{fmt(r.collections)}</TableCell>
                  <TableCell className={`text-right font-mono ${r.net >= 0 ? "text-amber-600" : "text-emerald-600"}`}>
                    {r.net >= 0 ? "+" : ""}{fmt(r.net)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------- Stale Queue ----------
function StaleQueueSection() {
  const { data: clients = [] } = useQuery({
    queryKey: ["stale-clients"],
    queryFn: async () => fetchAllRows<any>("ar_dashboard"),
    staleTime: 5 * 60 * 1000,
  });

  // Need clients table for last_transaction_date and contact info
  const { data: clientDetails = [] } = useQuery({
    queryKey: ["stale-client-details"],
    queryFn: async () => fetchAllRows<any>("clients"),
    staleTime: 5 * 60 * 1000,
  });

  const detailsById = useMemo(() => {
    const map: Record<string, any> = {};
    for (const c of clientDetails) map[c.id] = c;
    return map;
  }, [clientDetails]);

  const today = new Date();

  const stale = useMemo(() => {
    return clients
      .filter((c: any) => {
        const d = detailsById[c.client_id];
        if (!d) return false;
        // Active contracts only with remaining balance
        if ((Number(c.remaining_balance) || 0) <= 0) return false;
        if (c.delinquency_status === "Paid") return false;
        const lt = d.last_transaction_date;
        if (!lt) return true; // never paid
        return differenceInDays(today, parseISO(lt)) >= 60;
      })
      .map((c: any) => {
        const d = detailsById[c.client_id] || {};
        const lt = d.last_transaction_date;
        const daysSince = lt ? differenceInDays(today, parseISO(lt)) : null;
        return {
          contract_id: c.contract_id,
          client_id: c.client_id,
          client_name: c.client_name,
          collector: c.collector || "Unassigned",
          phone: d.phone || c.phone || "",
          email: d.email || c.email || "",
          remaining_balance: Number(c.remaining_balance) || 0,
          last_transaction_date: lt || "Never",
          days_since_last_payment: daysSince ?? 9999,
          days_past_due: c.days_past_due || 0,
          next_due_date: c.next_due_date || "",
        };
      })
      .sort((a, b) => b.remaining_balance - a.remaining_balance);
  }, [clients, detailsById]);

  const totalAtRisk = stale.reduce((s, r) => s + r.remaining_balance, 0);

  // By collector
  const byCollector = useMemo(() => {
    const map: Record<string, { count: number; balance: number }> = {};
    for (const s of stale) {
      const k = s.collector;
      if (!map[k]) map[k] = { count: 0, balance: 0 };
      map[k].count += 1;
      map[k].balance += s.remaining_balance;
    }
    return Object.entries(map)
      .map(([collector, v]) => ({ collector, ...v }))
      .sort((a, b) => b.balance - a.balance);
  }, [stale]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Stale Accounts</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-1">
              <AlertTriangle className="h-5 w-5 text-amber-600" />{stale.length}
            </div>
            <p className="text-xs text-muted-foreground">No payment in 60+ days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">$ At Risk</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{fmt(totalAtRisk)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Avg Balance</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fmt(stale.length > 0 ? totalAtRisk / stale.length : 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Never Paid</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stale.filter(s => s.last_transaction_date === "Never").length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="text-sm">Stale by Collector</CardTitle></CardHeader>
          <CardContent>
            {byCollector.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">No stale accounts.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Collector</TableHead>
                    <TableHead className="text-right">Count</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {byCollector.map(c => (
                    <TableRow key={c.collector}>
                      <TableCell className="font-medium text-sm">{c.collector}</TableCell>
                      <TableCell className="text-right">{c.count}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{fmt(c.balance)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Top 50 Stale Accounts (by balance)</CardTitle>
              <Button variant="outline" size="sm" onClick={() => downloadCsv(`stale-accounts-${format(new Date(), "yyyy-MM-dd")}.csv`, stale)}>
                <Download className="mr-1 h-3 w-3" />Export All ({stale.length})
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-[450px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Collector</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead className="text-right">Last Pmt</TableHead>
                    <TableHead>Contact</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stale.slice(0, 50).map(s => (
                    <TableRow key={s.contract_id}>
                      <TableCell className="font-medium text-sm">{s.client_name}</TableCell>
                      <TableCell className="text-sm">{s.collector}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{fmt(s.remaining_balance)}</TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {s.last_transaction_date === "Never" ? (
                          <Badge variant="destructive" className="text-[10px]">Never</Badge>
                        ) : (
                          `${s.days_since_last_payment}d ago`
                        )}
                      </TableCell>
                      <TableCell className="text-xs">
                        {s.phone && <div className="flex items-center gap-1"><Phone className="h-3 w-3" />{s.phone}</div>}
                        {s.email && <div className="text-muted-foreground truncate max-w-[180px]">{s.email}</div>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ---------- Main Tab ----------
const AROversightTab = () => {
  const [section, setSection] = useState("ptp");
  return (
    <div className="space-y-4">
      <Tabs value={section} onValueChange={setSection}>
        <TabsList>
          <TabsTrigger value="ptp">Promise-to-Pay</TabsTrigger>
          <TabsTrigger value="rollforward">AR Roll-Forward</TabsTrigger>
          <TabsTrigger value="stale">Stale Queue</TabsTrigger>
        </TabsList>
        <TabsContent value="ptp"><PTPSection /></TabsContent>
        <TabsContent value="rollforward"><ARRollForwardSection /></TabsContent>
        <TabsContent value="stale"><StaleQueueSection /></TabsContent>
      </Tabs>
    </div>
  );
};

export default AROversightTab;