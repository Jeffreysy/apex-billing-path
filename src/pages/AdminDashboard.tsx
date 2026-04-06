import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import TaskPanel from "@/components/TaskPanel";
import { tasks } from "@/data/mockData";
import { useAdminKPI, useCollectionActivities, useCollectors, usePaymentsData, computeWeeklyCollections } from "@/hooks/useSupabaseData";
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
  

  if (kpiLoading || pl || cal || col) return <DashboardLayout title="Admin Dashboard"><div className="p-8 text-center text-muted-foreground">Loading dashboard...</div></DashboardLayout>;

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
  const openTasks = tasks.filter(t => t.status !== "completed").length;
  const weeklyData = computeWeeklyCollections(payments);

  const recentPayments = [...payments].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);

  const deptData = [
    { name: "Collections", tasks: tasks.filter(t => t.targetDepartment === "collections" && t.status !== "completed").length },
    { name: "Legal", tasks: tasks.filter(t => t.targetDepartment === "legal" && t.status !== "completed").length },
    { name: "AR", tasks: tasks.filter(t => t.targetDepartment === "ar" && t.status !== "completed").length },
    { name: "Admin", tasks: tasks.filter(t => t.targetDepartment === "admin" && t.status !== "completed").length },
  ];

  const lateClients = Number(kpi?.late_clients) || 0;
  const statusPie = [
    { name: "Current", value: currentClients },
    { name: "Late", value: lateClients },
    { name: "Delinquent", value: delinquent },
  ];

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="mb-6"><h1 className="text-2xl font-bold">Admin Dashboard</h1><p className="text-muted-foreground">High-level overview of all departments, KPIs, and firm-wide activity</p></div>

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
          { name: "Reporting", icon: TrendingUp, desc: `${Number(kpi?.payments_this_month) || 0} payments this month` },
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
        <TaskPanel department="admin" showAll />
      </div>

      <div className="mt-6 dashboard-section">
        <h2 className="mb-4 text-lg font-semibold">Recent Payments</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-muted-foreground"><th className="pb-3 font-medium">Client</th><th className="pb-3 font-medium">Amount</th><th className="pb-3 font-medium">Date</th><th className="pb-3 font-medium">Method</th><th className="pb-3 font-medium">Collector</th><th className="pb-3 font-medium">Status</th></tr></thead>
            <tbody>
              {recentPayments.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="py-3 font-medium">{p.clientName}</td><td className="py-3">${p.amount.toLocaleString()}</td><td className="py-3 text-muted-foreground">{p.date}</td>
                  <td className="py-3 capitalize">{p.method}</td><td className="py-3">{p.collectorName}</td>
                  <td className="py-3"><Badge variant={p.status === "completed" ? "default" : p.status === "pending" ? "secondary" : "destructive"} className="text-xs">{p.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
