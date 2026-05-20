import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import TaskPanel from "@/components/TaskPanel";
import EscalationInboxPanel from "@/components/EscalationInboxPanel";
import ExecutiveInsights from "@/components/admin/ExecutiveInsights";
import { useAdminKPI, useCollectionActivities, useCollectors, usePaymentsData, useEscalations, computeWeeklyCollections } from "@/hooks/useSupabaseData";
import { DollarSign, Users, Phone, TrendingUp, FileText, Scale, Eye, AlertTriangle, Briefcase, Percent } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = ["hsl(220 70% 22%)", "hsl(174 60% 40%)", "hsl(38 92% 50%)", "hsl(152 60% 40%)", "hsl(0 72% 51%)"];

const AdminDashboard = () => {
  const { data: kpi, isLoading: kpiLoading } = useAdminKPI();
  const { data: payments = [], isLoading: pl } = usePaymentsData();
  const { data: callLogs = [], isLoading: cal } = useCollectionActivities();
  const { data: collectors = [], isLoading: col } = useCollectors();
  const { data: unresolvedEscalations = [], isLoading: escalationsLoading } = useEscalations(true);
  
  if (kpiLoading || pl || cal || col || escalationsLoading) return <DashboardLayout title="Admin Dashboard"><div className="p-8 text-center text-muted-foreground">Loading dashboard...</div></DashboardLayout>;

  const totalAR = Number(kpi?.total_remaining) || 0;
  const totalCollected = Number(kpi?.total_collected) || 0;
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
  const weeklyData = computeWeeklyCollections(payments);

  const deptData = [
    { name: "Collections", tasks: unresolvedEscalations.filter((t: any) => !t.handoff_queue || t.handoff_queue === "collections").length },
    { name: "Legal", tasks: unresolvedEscalations.filter((t: any) => ["legal", "attorney", "case_management"].includes(t.handoff_queue)).length },
    { name: "AR", tasks: unresolvedEscalations.filter((t: any) => ["billing_ops", "finance", "ar"].includes(t.handoff_queue)).length },
    { name: "Admin", tasks: unresolvedEscalations.filter((t: any) => ["management", "admin"].includes(t.handoff_queue)).length },
  ];

  const lateClients = Number((kpi as any)?.late_clients) || 0;
  const statusPie = [
    { name: "Current", value: currentClients },
    { name: "Late", value: lateClients },
    { name: "Delinquent", value: delinquent },
  ];

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="mb-6"><h1 className="text-2xl font-bold">Admin Dashboard</h1><p className="text-muted-foreground">High-level overview of all departments, KPIs, and firm-wide activity</p></div>

      <ExecutiveInsights />

      <div className="my-8 border-t" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Total AR Outstanding" value={`$${totalAR.toLocaleString()}`} icon={<DollarSign className="h-5 w-5" />} />
        <StatCard label="Total Collected" value={`$${totalCollected.toLocaleString()}`} icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard label="Active Contracts" value={String(activeContracts)} icon={<FileText className="h-5 w-5" />} />
        <StatCard label="Active Imm. Cases" value={String(activeCases)} icon={<Briefcase className="h-5 w-5" />} />
        <StatCard label="Collection Rate" value={`${collectionRate}%`} icon={<Percent className="h-5 w-5" />} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge variant="outline" className="text-xs">Total Clients: {totalClients}</Badge>
        <Badge variant="outline" className="text-xs">Delinquent: {delinquent}</Badge>
        <Badge variant="outline" className="text-xs">Risk Contracts: {riskContracts}</Badge>
        <Badge variant="outline" className="text-xs">Collected This Month: ${collectedThisMonth.toLocaleString()}</Badge>
        <Badge variant={unresolvedCount > 0 ? "destructive" : "outline"} className="text-xs">Unresolved Escalations: {unresolvedCount}</Badge>
        <Badge variant="outline" className="text-xs">Open Tasks: {openTasks}</Badge>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="dashboard-section lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold">Weekly Collections</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 88%)" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="hsl(220 10% 46%)" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(220 10% 46%)" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="collected" fill="hsl(174 60% 40%)" radius={[4, 4, 0, 0]} name="Collected" />
              <Bar dataKey="target" fill="hsl(220 70% 22%)" radius={[4, 4, 0, 0]} name="Target" opacity={0.3} />
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
          { name: "Reporting", icon: TrendingUp, desc: `${Number((kpi as any)?.payments_this_month) || 0} payments this month` },
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
