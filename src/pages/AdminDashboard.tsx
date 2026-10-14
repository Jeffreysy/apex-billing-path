import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import TaskPanel from "@/components/TaskPanel";
import EscalationInboxPanel from "@/components/EscalationInboxPanel";
import ExecutiveInsights from "@/components/admin/ExecutiveInsights";
import { useAdminKPI, useAdminContractStatus, useFirmFinancialSummary, useCollectors, useEscalations, useCertifiedMonthlyCollections } from "@/hooks/useSupabaseData";
import { DollarSign, Phone, TrendingUp, FileText, Scale, Eye, Briefcase, Percent } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Contract status colours, in sort order: current / paying-but-behind / delinquent / never paid.
const STATUS_STYLE: Record<string, { color: string; tile: string; title: string; caption: string }> = {
  current: {
    color: "hsl(152 60% 40%)",
    tile: "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300",
    title: "text-emerald-600 dark:text-emerald-400",
    caption: "paying on schedule",
  },
  paying_but_behind: {
    color: "hsl(38 92% 50%)",
    tile: "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950 text-amber-700 dark:text-amber-300",
    title: "text-amber-600 dark:text-amber-400",
    caption: "paying, but behind (needs a nudge)",
  },
  delinquent: {
    color: "hsl(0 72% 51%)",
    tile: "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950 text-red-700 dark:text-red-300",
    title: "text-red-600 dark:text-red-400",
    caption: "no payment past the grace window",
  },
  never_paid: {
    color: "hsl(220 13% 60%)",
    tile: "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900 text-slate-700 dark:text-slate-300",
    title: "text-slate-600 dark:text-slate-400",
    caption: "balance but no payment on record",
  },
};

const LINE_SERIES = [
  { key: "total", name: "Total cash collected", color: "hsl(222 47% 25%)", width: 3, dash: undefined },
  { key: "onPlan", name: "From clients on plan", color: "hsl(152 60% 40%)", width: 2, dash: undefined },
  { key: "delinquent", name: "Recovered from delinquent clients", color: "hsl(0 72% 51%)", width: 2, dash: undefined },
  { key: "from180", name: "…of which 180+ days behind", color: "hsl(0 72% 51%)", width: 1.5, dash: "5 4" },
];

const money = (n: number) => `$${Math.round(n).toLocaleString()}`;
const shortDate = (d: string | null | undefined) => (d ? new Date(`${d}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—");

const AdminDashboard = () => {
  // Nothing here blocks the whole page any more: each section renders as soon as its own query lands.
  const { data: kpi, isLoading: kpiLoading } = useAdminKPI();
  const { data: contractStatus, isLoading: csLoading } = useAdminContractStatus();
  const { data: firmSummary } = useFirmFinancialSummary();
  const { data: collectors = [], isLoading: col } = useCollectors();
  const { data: unresolvedEscalations = [] } = useEscalations(true);
  const { data: monthlyCash = [], isLoading: mcl } = useCertifiedMonthlyCollections(5);

  // Canonical Total AR = v_firm_financial_summary.ar_total (VP-certified LIVE anchor). admin_kpi.total_remaining
  // carries the same figure and arrives in well under a second, so the tile shows it while the certified row loads.
  const totalAR = Number(firmSummary?.ar_total) || Number(kpi?.total_remaining) || 0;
  const totalCollected = Number(kpi?.total_collected) || 0;
  const activeContracts = Number(kpi?.total_contracts) || 0;
  const activeCases = Number(kpi?.active_cases) || 0;
  const collectionRate = Number(kpi?.collection_rate_pct) || 0;
  // Certified month-to-date cash; admin_kpi.collected_this_month reads the linked-LawPay-only `payments` table (~40% of real cash).
  const now = new Date();
  const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const collectedThisMonth = monthlyCash.find((m) => m.monthKey === thisMonthKey)?.total ?? (Number(kpi?.collected_this_month) || 0);
  const paymentsThisMonth = Number(kpi?.payments_this_month) || 0;
  const totalClients = Number(kpi?.total_clients) || 0;
  const unresolvedCount = unresolvedEscalations.length;

  // Contract status: the per-invoice AR clock when available (ties to Total AR); otherwise the legacy admin_kpi split.
  const statusRows = contractStatus
    ? contractStatus.map((r) => ({ key: r.status_key, label: r.label, contracts: r.contracts, clients: r.clients, ar: r.ar }))
    : kpi
      ? [
          { key: "current", label: "On plan (current)", contracts: Number(kpi.contracts_on_plan) || 0, clients: Number(kpi.current_clients) || 0, ar: Number(kpi.ar_on_plan) || 0 },
          { key: "paying_but_behind", label: "Late (needs nudge)", contracts: Number(kpi.contracts_late) || 0, clients: Number(kpi.late_clients) || 0, ar: Number(kpi.ar_late) || 0 },
          { key: "delinquent", label: "Delinquent", contracts: Number(kpi.contracts_delinquent) || 0, clients: Number(kpi.delinquent_clients) || 0, ar: Number(kpi.ar_delinquent) || 0 },
          { key: "never_paid", label: "Unclassified (legacy)", contracts: Number(kpi.contracts_actionable) || 0, clients: Number(kpi.unclassified_clients) || 0, ar: Number(kpi.ar_actionable) || 0 },
        ]
      : [];
  const statusAR = statusRows.reduce((s, r) => s + r.ar, 0);
  const statusContracts = statusRows.reduce((s, r) => s + r.contracts, 0);
  const behindContracts = statusRows.filter((r) => r.key === "paying_but_behind" || r.key === "delinquent").reduce((s, r) => s + r.contracts, 0);
  const delinquentClients = statusRows.find((r) => r.key === "delinquent")?.clients ?? 0;
  const asOf = contractStatus?.[0];

  const deptData = [
    { name: "Collections", tasks: unresolvedEscalations.filter((t: any) => !t.handoff_queue || t.handoff_queue === "collections").length },
    { name: "Legal", tasks: unresolvedEscalations.filter((t: any) => ["legal", "attorney", "case_management"].includes(t.handoff_queue)).length },
    { name: "AR", tasks: unresolvedEscalations.filter((t: any) => ["billing_ops", "finance", "ar"].includes(t.handoff_queue)).length },
    { name: "Admin", tasks: unresolvedEscalations.filter((t: any) => ["management", "admin"].includes(t.handoff_queue)).length },
  ];

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="mb-6"><h1 className="text-2xl font-bold">Admin Dashboard</h1><p className="text-muted-foreground">High-level overview of all departments, KPIs, and firm-wide activity</p></div>

      <ExecutiveInsights />

      <div className="my-8 border-t" />

      {kpiLoading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-[104px] rounded-xl" />)}</div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <StatCard label="Total AR" value={`$${totalAR.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon={<DollarSign className="h-5 w-5" />} />
          <StatCard label="Collected (Active Book)" value={money(totalCollected)} icon={<TrendingUp className="h-5 w-5" />} caption="Collected-to-date on active AR — not firm all-time" />
          <StatCard label="Active Contracts" value={activeContracts.toLocaleString()} icon={<FileText className="h-5 w-5" />} />
          <StatCard label="Active Imm. Cases" value={activeCases.toLocaleString()} icon={<Briefcase className="h-5 w-5" />} />
          <StatCard label="Collection Rate" value={`${collectionRate}%`} icon={<Percent className="h-5 w-5" />} />
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(kpiLoading && csLoading) || statusRows.length === 0
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[78px] rounded-lg" />)
          : statusRows.map((r) => {
              const st = STATUS_STYLE[r.key] ?? STATUS_STYLE.never_paid;
              const pct = statusAR > 0 ? Math.round((r.ar / statusAR) * 1000) / 10 : 0;
              return (
                <div key={r.key} className={`rounded-lg border px-4 py-3 ${st.tile}`}>
                  <p className={`text-[10px] font-semibold uppercase tracking-wider ${st.title}`}>{r.label}</p>
                  <p className="mt-1 text-lg font-bold">{money(r.ar)} <span className="text-xs font-medium opacity-70">· {pct}% of AR</span></p>
                  <p className="text-[10px] opacity-70">{r.contracts.toLocaleString()} contracts · {r.clients.toLocaleString()} clients · {st.caption}</p>
                </div>
              );
            })}
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        {contractStatus
          ? <>Status per contract from the AR clock · {statusContracts.toLocaleString()} contracts · {money(statusAR)} (ties to Total AR) · balances from the {shortDate(asOf?.snapshot_date)} MyCase snapshot · payments credited through {shortDate(asOf?.payments_through)}</>
          : <>Status from the legacy contracts table — the AR-clock status view is not available yet.</>}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge variant="outline" className="text-xs">Total Clients: {totalClients.toLocaleString()}</Badge>
        <Badge variant="outline" className="text-xs">Delinquent clients: {delinquentClients.toLocaleString()}</Badge>
        <Badge variant="outline" className="text-xs">Behind contracts (late + delinquent): {behindContracts.toLocaleString()}</Badge>
        <Badge variant="outline" className="text-xs">Collected This Month: {money(collectedThisMonth)}</Badge>
        <Badge variant={unresolvedCount > 0 ? "destructive" : "outline"} className="text-xs">Unresolved Escalations: {unresolvedCount}</Badge>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="dashboard-section lg:col-span-2">
          <h2 className="mb-1 text-lg font-semibold">Monthly Collections</h2>
          <p className="mb-3 text-xs text-muted-foreground">Certified cash (online + offline, bank-supported) · last 4 months plus month to date · split by whether the client was behind when they paid</p>
          {mcl ? <Skeleton className="h-[300px] w-full" /> : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyCash} margin={{ top: 10, right: 16, left: 4, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(220 10% 46%)" tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(220 10% 46%)" tickLine={false} axisLine={false} width={56}
                  tickFormatter={(v) => (v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : `$${(v / 1000).toFixed(0)}k`)} />
                <Tooltip
                  formatter={(value: number, name: string) => [money(value), name]}
                  contentStyle={{ borderRadius: 8, border: "1px solid hsl(220 13% 88%)", fontSize: 12 }}
                />
                <Legend iconType="plainline" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                {LINE_SERIES.map((s) => (
                  <Line key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} strokeWidth={s.width}
                    strokeDasharray={s.dash} dot={{ r: 3, strokeWidth: 0, fill: s.color }} activeDot={{ r: 5 }} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="dashboard-section">
          <h2 className="mb-1 text-lg font-semibold">Contract Status</h2>
          <p className="mb-2 text-xs text-muted-foreground">Share of AR dollars by contract status</p>
          {statusRows.length === 0 ? <Skeleton className="h-[200px] w-full" /> : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={statusRows} cx="50%" cy="50%" innerRadius={55} outerRadius={82} paddingAngle={2} dataKey="ar" nameKey="label">
                    {statusRows.map((r) => <Cell key={r.key} fill={(STATUS_STYLE[r.key] ?? STATUS_STYLE.never_paid).color} />)}
                  </Pie>
                  <Tooltip formatter={(value: number, name: string) => [money(value), name]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 space-y-1">
                {statusRows.map((r) => (
                  <div key={r.key} className="flex items-center gap-2 text-xs">
                    <div className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: (STATUS_STYLE[r.key] ?? STATUS_STYLE.never_paid).color }} />
                    <span className="flex-1">{r.label}</span>
                    <span className="tabular-nums text-muted-foreground">{r.contracts.toLocaleString()} contracts</span>
                    <span className="w-24 text-right font-medium tabular-nums">{money(r.ar)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { name: "Collections", icon: Phone, desc: col ? "Loading…" : `${collectors.reduce((s, c) => s + c.callsMade, 0)} calls · ${collectors.reduce((s, c) => s + c.paymentsTaken, 0)} payments taken` },
          { name: "Legal", icon: Scale, desc: `${activeCases.toLocaleString()} active cases` },
          { name: "Financial Management", icon: Eye, desc: `${money(totalAR)} outstanding · ${delinquentClients.toLocaleString()} delinquent clients` },
          { name: "Reporting", icon: TrendingUp, desc: `${paymentsThisMonth} payments this month` },
        ].map((dept) => (
          <Card key={dept.name} className="transition-shadow hover:shadow-md">
            <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><dept.icon className="h-4 w-4 text-secondary" />{dept.name}</CardTitle></CardHeader>
            <CardContent><p className="text-xs text-muted-foreground">{dept.desc}</p><div className="mt-2"><Badge variant="outline" className="text-[10px]">{deptData.find(d => d.name === dept.name || (dept.name === "Reporting" && d.name === "AR") || (dept.name === "Financial Management" && d.name === "AR"))?.tasks || 0} open tasks</Badge></div></CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="dashboard-section">
          <h2 className="mb-4 text-lg font-semibold">Collector Performance</h2>
          <div className="space-y-4">
            {collectors.map((c) => (
              <div key={c.id} className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{c.avatar}</div>
                <div className="flex-1"><p className="text-sm font-medium">{c.name} {c.isLead && <Badge variant="secondary" className="ml-1 text-[10px]">Lead</Badge>}</p><p className="text-xs text-muted-foreground">{c.callsMade} calls · {c.paymentsTaken} payments</p></div>
                <p className="text-sm font-semibold text-secondary">${c.totalCollected.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
        <EscalationInboxPanel
          escalations={unresolvedEscalations}
          inbox="management"
          title="Management Escalation Inbox"
          emptyMessage="No unresolved management escalations."
        />
      </div>

      <div className="mt-6">
        <TaskPanel department="admin" showAll />
      </div>

    </DashboardLayout>
  );
};

export default AdminDashboard;
