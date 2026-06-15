import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import TaskPanel from "@/components/TaskPanel";
import EscalationInboxPanel from "@/components/EscalationInboxPanel";
import ExecutiveInsights from "@/components/admin/ExecutiveInsights";
import { useAdminKPI, useCollectionActivities, useCollectors, usePaymentsData, useEscalations, useClassifiedMonthlyCollections, computeWeeklyCollections } from "@/hooks/useSupabaseData";
import { DollarSign, Users, Phone, TrendingUp, FileText, Scale, Eye, AlertTriangle, Briefcase, Percent } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = ["hsl(152 60% 40%)", "hsl(38 92% 50%)", "hsl(0 72% 51%)", "hsl(220 13% 65%)", "hsl(174 60% 40%)"];

const AdminDashboard = () => {
  const { data: kpi, isLoading: kpiLoading } = useAdminKPI();
  const { data: payments = [], isLoading: pl } = usePaymentsData();
  const { data: callLogs = [], isLoading: cal } = useCollectionActivities();
  const { data: collectors = [], isLoading: col } = useCollectors();
  const { data: unresolvedEscalations = [], isLoading: escalationsLoading } = useEscalations(true);
  const { data: classifiedCollections = [], isLoading: mcl } = useClassifiedMonthlyCollections(4);

  if (kpiLoading || pl || cal || col || escalationsLoading || mcl) return <DashboardLayout title="Admin Dashboard"><div className="p-8 text-center text-muted-foreground">Loading dashboard...</div></DashboardLayout>;

  const totalAR = Number(kpi?.total_remaining) || 0;
  const totalCollected = Number(kpi?.total_collected) || 0;
  const arOnPlan = Number(kpi?.ar_on_plan) || 0;
  const arLate = Number(kpi?.ar_late) || 0;
  const arDelinquent = Number(kpi?.ar_delinquent) || 0;
  const arActionable = Number(kpi?.ar_actionable) || 0;
  const contractsOnPlan = Number(kpi?.contracts_on_plan) || 0;
  const contractsLate = Number(kpi?.contracts_late) || 0;
  const contractsDelinquent = Number(kpi?.contracts_delinquent) || 0;
  const contractsActionable = Number(kpi?.contracts_actionable) || 0;
  const activeContracts = Number(kpi?.total_contracts) || 0;
  const riskContracts = Number(kpi?.risk_contracts) || 0;
  const totalClients = Number(kpi?.total_clients) || 0;
  const delinquent = Number(kpi?.delinquent_clients) || 0;
  const currentClients = Number(kpi?.current_clients) || 0;
  const activeCases = Number(kpi?.active_cases) || 0;
  const collectionRate = Number(kpi?.collection_rate_pct) || 0;
  const collectedThisMonth = Number(kpi?.collected_this_month) || 0;
  const unresolvedCount = unresolvedEscalations.length;
  const openTasks = unresolvedCount;

  const deptData = [
    { name: "Collections", tasks: unresolvedEscalations.filter((t: any) => !t.handoff_queue || t.handoff_queue === "collections").length },
    { name: "Legal", tasks: unresolvedEscalations.filter((t: any) => ["legal", "attorney", "case_management"].includes(t.handoff_queue)).length },
    { name: "AR", tasks: unresolvedEscalations.filter((t: any) => ["billing_ops", "finance", "ar"].includes(t.handoff_queue)).length },
    { name: "Admin", tasks: unresolvedEscalations.filter((t: any) => ["management", "admin"].includes(t.handoff_queue)).length },
  ];

  const lateClients = Number(kpi?.late_clients) || 0;
  const unclassifiedClients = Number(kpi?.unclassified_clients) || 0;
  const paymentsThisMonth = Number(kpi?.payments_this_month) || 0;
  const statusPie = [
    { name: "Current", value: currentClients },
    { name: "Late", value: lateClients },
    { name: "Delinquent", value: delinquent },
    { name: "Unclassified", value: unclassifiedClients },
  ];

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="mb-6"><h1 className="text-2xl font-bold">Admin Dashboard</h1><p className="text-muted-foreground">High-level overview of all departments, KPIs, and firm-wide activity</p></div>

      <ExecutiveInsights />

      <div className="my-8 border-t" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Total AR" value={`$${totalAR.toLocaleString()}`} icon={<DollarSign className="h-5 w-5" />} />
        <StatCard label="Total Collected" value={`$${totalCollected.toLocaleString()}`} icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard label="Active Contracts" value={String(activeContracts)} icon={<FileText className="h-5 w-5" />} />
        <StatCard label="Active Imm. Cases" value={String(activeCases)} icon={<Briefcase className="h-5 w-5" />} />
        <StatCard label="Collection Rate" value={`${collectionRate}%`} icon={<Percent className="h-5 w-5" />} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-950">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">On-Plan (Current)</p>
          <p className="mt-1 text-lg font-bold text-emerald-700 dark:text-emerald-300">${arOnPlan.toLocaleString()}</p>
          <p className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70">{contractsOnPlan} contracts paying on schedule</p>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-950">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">Late (Needs Nudge)</p>
          <p className="mt-1 text-lg font-bold text-amber-700 dark:text-amber-300">${arLate.toLocaleString()}</p>
          <p className="text-[10px] text-amber-600/70 dark:text-amber-400/70">{contractsLate} contracts behind on payments</p>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-950">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">Delinquent</p>
          <p className="mt-1 text-lg font-bold text-red-700 dark:text-red-300">${arDelinquent.toLocaleString()}</p>
          <p className="text-[10px] text-red-600/70 dark:text-red-400/70">{contractsDelinquent} contracts past due</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Unclassified</p>
          <p className="mt-1 text-lg font-bold text-slate-700 dark:text-slate-300">${arActionable.toLocaleString()}</p>
          <p className="text-[10px] text-slate-600/70 dark:text-slate-400/70">{contractsActionable} contracts need status assignment</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge variant="outline" className="text-xs">Total Clients: {totalClients}</Badge>
        <Badge variant="outline" className="text-xs">Delinquent: {delinquent}</Badge>
        <Badge variant="outline" className="text-xs">Risk Contracts: {riskContracts}</Badge>
        <Badge variant="outline" className="text-xs">Collected This Month: ${collectedThisMonth.toLocaleString()}</Badge>
        <Badge variant={unresolvedCount > 0 ? "destructive" : "outline"} className="text-xs">Unresolved Escalations: {unresolvedCount}</Badge>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="dashboard-section lg:col-span-2">
          <h2 className="mb-2 text-lg font-semibold">Monthly Collections (Quarter View)</h2>
          <p className="mb-3 text-xs text-muted-foreground">Classified by contract schedule: current vs delinquent at time of payment</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={classifiedCollections}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 88%)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(220 10% 46%)" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(220 10% 46%)" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="current" stackId="collections" fill="hsl(152 60% 40%)" name="System / Current" />
              <Bar dataKey="delinquent" stackId="collections" fill="hsl(0 72% 51%)" name="Delinquent Collections" />
              <Bar dataKey="unknown" stackId="collections" fill="hsl(220 13% 70%)" radius={[4, 4, 0, 0]} name="Unknown / Review" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="dashboard-section">
          <h2 className="mb-4 text-lg font-semibold">Contract Status</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart><Pie data={statusPie} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">{statusPie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /></PieChart>
          </ResponsiveContainer>
          <div className="mt-2 grid grid-cols-2 gap-1">{statusPie.map((s, i) => (<div key={s.name} className="flex items-center gap-2 text-xs"><div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} /><span>{s.name}: {s.value}</span></div>))}</div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { name: "Collections", icon: Phone, desc: `${collectors.reduce((s, c) => s + c.callsMade, 0)} calls · ${collectors.reduce((s, c) => s + c.paymentsTaken, 0)} payments taken` },
          { name: "Legal", icon: Scale, desc: `${activeCases} active cases` },
          { name: "Financial Oversight", icon: Eye, desc: `$${totalAR.toLocaleString()} outstanding · ${delinquent} delinquent` },
          { name: "Reporting", icon: TrendingUp, desc: `${paymentsThisMonth} payments this month` },
        ].map((dept) => (
          <Card key={dept.name} className="transition-shadow hover:shadow-md">
            <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><dept.icon className="h-4 w-4 text-secondary" />{dept.name}</CardTitle></CardHeader>
            <CardContent><p className="text-xs text-muted-foreground">{dept.desc}</p><div className="mt-2"><Badge variant="outline" className="text-[10px]">{deptData.find(d => d.name === dept.name || (dept.name === "Reporting" && d.name === "AR") || (dept.name === "Financial Oversight" && d.name === "AR"))?.tasks || 0} open tasks</Badge></div></CardContent>
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
