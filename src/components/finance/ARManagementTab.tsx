import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fetchAllRows, usePromiseTracker, useFeedFreshness, useArWaterfall, useCertifiedMonthlyCollections, aggregateArWaterfallByMonth } from "@/hooks/useSupabaseData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, Cell } from "recharts";
import { format, subMonths, startOfMonth, endOfMonth, parseISO, differenceInDays } from "date-fns";
import { CheckCircle2, XCircle, Clock, AlertTriangle, TrendingUp, TrendingDown, Download, Phone, ArrowUpRight } from "lucide-react";

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
  // 2026-10-13 (Jeff: "yes switch it to the tracker"): the tab reads the CERTIFIED promise tracker
  // (v_promise_to_pay_tracker) instead of deriving promises itself. The tracker lists OPEN promises only: a client
  // who pays after promising drops off, so kept / broken rates are not shown here.
  const { data: rows = [], isLoading, isError } = usePromiseTracker();
  const { data: fresh } = useFeedFreshness();

  const counts = useMemo(() => {
    const c = { open: rows.length, dueToday: 0, overdue: 0, dueNow: 0, needsDate: 0, ar: 0 };
    for (const r of rows) {
      if (r.daysUntilDue === 0) c.dueToday += 1;
      if (r.status === "OVERDUE") c.overdue += 1;
      if (r.status === "DUE_NOW") c.dueNow += 1;
      if (r.status === "NEEDS_DATE") c.needsDate += 1;
      c.ar += r.liveAr || 0;
    }
    return c;
  }, [rows]);

  const byCollector = useMemo(() => {
    const map: Record<string, { open: number; overdue: number; dueNow: number; needsDate: number; ar: number }> = {};
    for (const r of rows) {
      const k = r.collector || "Unassigned";
      if (!map[k]) map[k] = { open: 0, overdue: 0, dueNow: 0, needsDate: 0, ar: 0 };
      map[k].open += 1;
      if (r.status === "OVERDUE") map[k].overdue += 1;
      if (r.status === "DUE_NOW") map[k].dueNow += 1;
      if (r.status === "NEEDS_DATE") map[k].needsDate += 1;
      map[k].ar += r.liveAr || 0;
    }
    return Object.entries(map).map(([collector, v]) => ({ collector, ...v })).sort((a, b) => b.open - a.open);
  }, [rows]);

  const today = new Date().toISOString().slice(0, 10);
  const dueToday = rows.filter((r) => r.daysUntilDue === 0);
  const statusVariant = (s: string): "default" | "secondary" | "destructive" | "outline" =>
    s === "OVERDUE" ? "destructive" : s === "DUE_NOW" ? "default" : s === "NEEDS_DATE" ? "outline" : "secondary";
  const statusLabel: Record<string, string> = {
    NEEDS_DATE: "Needs date", OVERDUE: "Overdue", DUE_NOW: "Due ≤3d", DUE_SOON: "Due ≤7d", UPCOMING: "Upcoming",
  };
  const activityAsOf = fresh?.activity?.asOf ?? null;

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border bg-muted/40 p-3 text-xs text-muted-foreground space-y-1">
        <p>
          <span className="font-semibold text-foreground">Source: certified promise tracker</span> (<code>v_promise_to_pay_tracker</code>).
          Promises are outbound collector calls with an <em>agreement</em> outcome in the <strong>last 30 days</strong>, one row per
          client <strong>name</strong> (the promise is the name the collector typed; the AR figure is matched by client ID). A client who
          pays after promising leaves the list, so this tab shows <strong>open</strong> promises only. The promised date comes from the
          call note when it is a date; otherwise the note is shown as a window (“Needs date”).
        </p>
        {activityAsOf && (
          <p className={fresh?.activity && (fresh.activity.ageDays ?? 0) > 3 ? "text-amber-700 dark:text-amber-400" : ""}>
            Collector activity feed: latest logged activity {activityAsOf}
            {fresh?.activity?.ageDays != null ? ` (${Math.round(fresh.activity.ageDays)} days ago)` : ""} — promises made after that date are not in the feed yet.
          </p>
        )}
      </div>

      {isError ? (
        <p className="text-sm text-destructive">Could not load the promise tracker.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Open promises (30d)</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{isLoading ? "…" : counts.open}</div><p className="text-xs text-muted-foreground">clients (name-keyed)</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Due today</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-amber-600 flex items-center gap-1"><Clock className="h-5 w-5" />{isLoading ? "…" : counts.dueToday}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Overdue</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-destructive flex items-center gap-1"><XCircle className="h-5 w-5" />{isLoading ? "…" : counts.overdue}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Needs a date</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold flex items-center gap-1"><CheckCircle2 className="h-5 w-5 text-muted-foreground" />{isLoading ? "…" : counts.needsDate}</div><p className="text-xs text-muted-foreground">window only in the note</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Open AR on these clients</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{isLoading ? "…" : fmt(counts.ar)}</div><p className="text-xs text-muted-foreground">linked by client ID</p></CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm">Open promises by collector</CardTitle></CardHeader>
          <CardContent>
            {byCollector.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">{isLoading ? "Loading…" : "No open promises in the last 30 days."}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Collector</TableHead>
                    <TableHead className="text-right">Open</TableHead>
                    <TableHead className="text-right">Overdue</TableHead>
                    <TableHead className="text-right">Due ≤3d</TableHead>
                    <TableHead className="text-right">Needs date</TableHead>
                    <TableHead className="text-right">AR</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {byCollector.map((c) => (
                    <TableRow key={c.collector}>
                      <TableCell className="font-medium">{c.collector}</TableCell>
                      <TableCell className="text-right">{c.open}</TableCell>
                      <TableCell className="text-right text-destructive">{c.overdue}</TableCell>
                      <TableCell className="text-right text-amber-600">{c.dueNow}</TableCell>
                      <TableCell className="text-right">{c.needsDate}</TableCell>
                      <TableCell className="text-right font-mono">{fmt(c.ar)}</TableCell>
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
              <p className="text-sm text-muted-foreground py-6 text-center">No promises due today.</p>
            ) : (
              <div className="max-h-[300px] overflow-y-auto">
                <Table>
                  <TableHeader><TableRow><TableHead>Client</TableHead><TableHead>Collector</TableHead><TableHead className="text-right">AR</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {dueToday.map((p, i) => (
                      <TableRow key={`${p.clientName}-${i}`}>
                        <TableCell className="font-medium text-sm">{p.clientName}</TableCell>
                        <TableCell className="text-sm">{p.collector || "—"}</TableCell>
                        <TableCell className="text-right font-mono text-sm">{p.liveAr != null ? fmt(p.liveAr) : "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">All open promises ({rows.length})</CardTitle>
            {rows.length > 0 && (
              <Button variant="outline" size="sm" onClick={() => downloadCsv(`open-promises-${today}.csv`, rows as any)}>
                <Download className="mr-1 h-3 w-3" />CSV
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">{isLoading ? "Loading…" : "No open promises in the last 30 days."}</p>
          ) : (
            <div className="max-h-[420px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Collector</TableHead>
                    <TableHead>Promised on</TableHead>
                    <TableHead>Due / window</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Open AR</TableHead>
                    <TableHead>Last payment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((p, i) => (
                    <TableRow key={`${p.clientName}-${i}`}>
                      <TableCell className="font-medium text-sm">{p.clientName}</TableCell>
                      <TableCell className="text-sm">{p.collector || "—"}</TableCell>
                      <TableCell className="text-sm">{p.promiseDate || "—"}</TableCell>
                      <TableCell className="text-sm">{p.ptpDate || p.windowHint || "—"}</TableCell>
                      <TableCell><Badge variant={statusVariant(p.status)} className="text-xs">{statusLabel[p.status] ?? p.status}</Badge></TableCell>
                      <TableCell className="text-right font-mono text-sm" title={p.arLinkStatus ?? undefined}>
                        {p.liveAr != null ? fmt(p.liveAr) : p.arLinkStatus === "client_id_not_in_ar_book" ? "not in AR book" : p.arLinkStatus === "no_client_id_on_activity" ? "no client link" : "—"}
                      </TableCell>
                      <TableCell className="text-sm">{p.lastPaymentDate ? `${p.lastPaymentDate}${p.lastPaymentAmount != null ? ` · ${fmt(p.lastPaymentAmount)}` : ""}` : "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ---------- AR Roll-Forward ----------
// 2026-10-14: rebuilt on the certified sources. It used to compute "New AR" from ar_dashboard.start_date of OPEN
// contracts (structurally ~$0 — the aging file carries no start dates for new work) and "Collections" from
// payments_clean (client-linked LawPay only: Jul 2026 $286,820 vs $1,768,833.95 certified). Now:
//   - Beginning / + Additions / − Reductions / Ending = v_ar_waterfall, the MyCase AR snapshot roll-forward (snapshot
//     grain, whole dollars), grouped by the month each snapshot is dated in.
//   - Certified cash = mv_collections_certified_monthly (bank-supported, transaction grain). Reductions include
//     write-offs/adjustments and are on the snapshot clock, so they legitimately differ from cash.
function ARRollForwardSection() {
  const { data: waterfall = [] } = useArWaterfall();
  const { data: cash = [] } = useCertifiedMonthlyCollections(6);

  const rollForward = useMemo(() => {
    const byMonth = new Map(aggregateArWaterfallByMonth(waterfall).map((m) => [m.monthKey, m]));
    return cash.map((c) => {
      const m = byMonth.get(c.monthKey);
      return {
        month: format(parseISO(`${c.monthKey}-01`), "MMM yy"),
        snapshots: m ? `${m.firstSnapshot} → ${m.lastSnapshot}` : "no snapshot",
        beginning: m ? m.beginning : null,
        additions: m ? m.additions : null,
        reductions: m ? m.reductions : null,
        ending: m ? m.ending : null,
        net: m ? m.net : null,
        certifiedCash: c.total,
      };
    });
  }, [waterfall, cash]);

  const withMove = rollForward.filter((r) => r.net != null);
  const totals = {
    additions: withMove.reduce((s, r) => s + (r.additions as number), 0),
    reductions: withMove.reduce((s, r) => s + (r.reductions as number), 0),
    net: withMove.reduce((s, r) => s + (r.net as number), 0),
    cash: cash.reduce((s, c) => s + c.totalExact, 0),
  };
  const trending = withMove.length >= 2 ? (withMove[withMove.length - 1].net as number) - (withMove[withMove.length - 2].net as number) : 0;
  const csvRows = rollForward.map((r) => ({ ...r }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">AR Additions (6mo, snapshots)</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{fmt(totals.additions)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Certified Cash (6mo)</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-emerald-600">{fmt(totals.cash)}</div><p className="text-xs text-muted-foreground">bank-supported, incl. month to date</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Net AR Movement (6mo)</CardTitle></CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totals.net >= 0 ? "text-amber-600" : "text-emerald-600"}`}>
              {totals.net >= 0 ? "+" : ""}{fmt(totals.net)}
            </div>
            <p className="text-xs text-muted-foreground">{totals.net >= 0 ? "AR growing" : "AR shrinking"} · additions − reductions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Trend (mo/mo net)</CardTitle></CardHeader>
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
            <div>
              <CardTitle className="text-sm">AR Roll-Forward (6 months)</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                MyCase AR snapshots (v_ar_waterfall) grouped by the month each snapshot is dated in · certified cash from
                mv_collections_certified_monthly. Reductions include write-offs and adjustments, so they differ from cash.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => downloadCsv(`ar-rollforward-${format(new Date(), "yyyy-MM-dd")}.csv`, csvRows)}>
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
              <Tooltip formatter={(v: number) => (v == null ? "—" : fmt(v))} />
              <Legend />
              <Bar dataKey="additions" name="AR additions" fill="hsl(var(--primary))" />
              <Bar dataKey="reductions" name="AR reductions" fill="hsl(var(--chart-4, 38 92% 50%))" />
              <Bar dataKey="certifiedCash" name="Certified cash" fill="hsl(var(--chart-2, 142 76% 36%))" />
            </BarChart>
          </ResponsiveContainer>

          <Table className="mt-4">
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead>Snapshots</TableHead>
                <TableHead className="text-right">Beginning AR</TableHead>
                <TableHead className="text-right">+ Additions</TableHead>
                <TableHead className="text-right">− Reductions</TableHead>
                <TableHead className="text-right">Ending AR</TableHead>
                <TableHead className="text-right">Certified Cash</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rollForward.map(r => (
                <TableRow key={r.month}>
                  <TableCell className="font-medium">{r.month}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{r.snapshots}</TableCell>
                  <TableCell className="text-right font-mono">{r.beginning == null ? "—" : fmt(r.beginning)}</TableCell>
                  <TableCell className="text-right font-mono">{r.additions == null ? "—" : fmt(r.additions)}</TableCell>
                  <TableCell className="text-right font-mono">{r.reductions == null ? "—" : fmt(r.reductions)}</TableCell>
                  <TableCell className="text-right font-mono">{r.ending == null ? "—" : fmt(r.ending)}</TableCell>
                  <TableCell className="text-right font-mono text-emerald-600">{fmt(r.certifiedCash)}</TableCell>
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
  // Only the columns the stale queue reads, sorted on unique keys. The unsorted select=* pull of ar_dashboard
  // timed out under load, which left this section showing "0 stale accounts / $0". 2026-10-13.
  const { data: clients = [] } = useQuery({
    queryKey: ["stale-clients", "v2"],
    queryFn: async () =>
      fetchAllRows<any>("ar_dashboard", {
        columns:
          "contract_id, client_id, client_name, collector, phone, email, remaining_balance, amount_collected, delinquency_status, days_past_due, next_due_date, start_date",
        orderBy: "contract_id",
      }),
    staleTime: 5 * 60 * 1000,
  });

  // Need clients table for last_transaction_date and contact info
  const { data: clientDetails = [] } = useQuery({
    queryKey: ["stale-client-details", "v2"],
    queryFn: async () =>
      fetchAllRows<any>("clients", { columns: "id, last_transaction_date, phone, email, case_stage", orderBy: "id" }),
    staleTime: 5 * 60 * 1000,
  });

  const detailsById = useMemo(() => {
    const map: Record<string, any> = {};
    for (const c of clientDetails) map[c.id] = c;
    return map;
  }, [clientDetails]);

  const today = new Date();

  const { stale, neverPaid } = useMemo(() => {
    const staleList: any[] = [];
    const neverPaidList: any[] = [];

    for (const c of clients) {
      const d = detailsById[c.client_id];
      if (!d) continue;
      const bal = Number(c.remaining_balance) || 0;
      if (bal <= 0) continue;
      if (c.delinquency_status === "Paid") continue;

      const lt = d.last_transaction_date;
      const collected = Number(c.amount_collected) || 0;
      const hasCollected = collected > 0;
      const isStale = lt ? differenceInDays(today, parseISO(lt)) >= 60 : true;

      if (!isStale) continue;

      const daysSince = lt ? differenceInDays(today, parseISO(lt)) : null;
      const row = {
        contract_id: c.contract_id,
        client_id: c.client_id,
        client_name: c.client_name,
        collector: c.collector || "Unassigned",
        phone: d.phone || c.phone || "",
        email: d.email || c.email || "",
        remaining_balance: bal,
        amount_collected: collected,
        last_transaction_date: lt || (hasCollected ? "No date" : "Never"),
        days_since_last_payment: daysSince ?? 9999,
        days_past_due: c.days_past_due || 0,
        next_due_date: c.next_due_date || "",
        start_date: c.start_date || "",
        case_stage: d.case_stage || "",
      };

      if (!hasCollected && !lt) {
        neverPaidList.push(row);
      } else {
        staleList.push(row);
      }
    }

    staleList.sort((a, b) => b.remaining_balance - a.remaining_balance);
    neverPaidList.sort((a, b) => b.remaining_balance - a.remaining_balance);
    return { stale: staleList, neverPaid: neverPaidList };
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
          <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Sales Review</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-1">
              <ArrowUpRight className="h-5 w-5 text-blue-600" />{neverPaid.length}
            </div>
            <p className="text-xs text-muted-foreground">Never collected — route to sales</p>
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
                        {s.last_transaction_date === "No date" ? (
                          <span className="text-amber-600">No date</span>
                        ) : s.last_transaction_date === "Never" ? (
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

      {/* Sales Review — never collected, route to sales */}
      {neverPaid.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm flex items-center gap-2">
                  <ArrowUpRight className="h-4 w-4 text-blue-600" />
                  Sales Review — Never Collected ({neverPaid.length})
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Zero payments received — {fmt(neverPaid.reduce((s, r) => s + r.remaining_balance, 0))} outstanding. Route to sales, not collectors.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => downloadCsv(`sales-review-never-paid-${format(new Date(), "yyyy-MM-dd")}.csv`, neverPaid)}>
                <Download className="mr-1 h-3 w-3" />Export ({neverPaid.length})
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Case Stage</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Contact</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {neverPaid.slice(0, 50).map(s => (
                    <TableRow key={s.contract_id}>
                      <TableCell className="font-medium text-sm">{s.client_name}</TableCell>
                      <TableCell className="text-xs">{s.case_stage || <span className="text-muted-foreground">—</span>}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{fmt(s.remaining_balance)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{s.start_date || "—"}</TableCell>
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
      )}
    </div>
  );
}

// ---------- Main Tab ----------
const ARManagementTab = () => {
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

export default ARManagementTab;