import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import TaskPanel from "@/components/TaskPanel";
import { clients, payments, getARAgingData, getForecastData, getMonthlyForecast, getContractAnalytics, getCaseTypeBilling } from "@/data/mockData";
import { DollarSign, TrendingUp, FileText, CheckCircle, BarChart3, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart, Bar, AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AROversightDashboard = () => {
  const totalAR = clients.reduce((s, c) => s + (c.totalOwed - c.totalPaid), 0);
  const totalCollected = payments.filter((p) => p.status === "completed").reduce((s, p) => s + p.amount, 0);
  const newCases = clients.filter((c) => c.status === "new").length;
  const fullyPaid = clients.filter((c) => c.status === "completed").length;
  const totalDownPayments = clients.filter((c) => c.downPaymentPaid).reduce((s, c) => s + c.downPayment, 0);
  const retentionRate = Math.round((clients.filter((c) => c.status !== "new").length / clients.length) * 100);

  const agingData = getARAgingData();
  const weeklyForecast = getForecastData();
  const monthlyForecast = getMonthlyForecast();
  const contractAnalytics = getContractAnalytics();
  const caseTypeBilling = getCaseTypeBilling();

  // Contract progression
  const progressionBuckets = [
    { label: "0-25%", count: clients.filter((c) => { const p = c.totalOwed > 0 ? c.totalPaid / c.totalOwed : 0; return p < 0.25; }).length },
    { label: "25-50%", count: clients.filter((c) => { const p = c.totalOwed > 0 ? c.totalPaid / c.totalOwed : 0; return p >= 0.25 && p < 0.5; }).length },
    { label: "50-75%", count: clients.filter((c) => { const p = c.totalOwed > 0 ? c.totalPaid / c.totalOwed : 0; return p >= 0.5 && p < 0.75; }).length },
    { label: "75-99%", count: clients.filter((c) => { const p = c.totalOwed > 0 ? c.totalPaid / c.totalOwed : 0; return p >= 0.75 && p < 1; }).length },
    { label: "100%", count: clients.filter((c) => c.status === "completed").length },
  ];

  return (
    <DashboardLayout title="AR Oversight">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">AR Oversight Dashboard</h1>
        <p className="text-muted-foreground">Full accounts receivable visibility, forecasting, and contract progression</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
        <StatCard label="Total AR" value={`$${totalAR.toLocaleString()}`} change={-3.2} icon={<DollarSign className="h-5 w-5" />} />
        <StatCard label="Collected (90d)" value={`$${totalCollected.toLocaleString()}`} change={12} icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard label="New Cases" value={String(newCases)} change={10} icon={<FileText className="h-5 w-5" />} />
        <StatCard label="Down Payments" value={`$${totalDownPayments.toLocaleString()}`} change={7} icon={<Target className="h-5 w-5" />} />
        <StatCard label="Fully Paid" value={String(fullyPaid)} change={15} icon={<CheckCircle className="h-5 w-5" />} />
        <StatCard label="Retention Rate" value={`${retentionRate}%`} change={2} icon={<BarChart3 className="h-5 w-5" />} />
      </div>

      {/* AR Aging + Contract Progression */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="dashboard-section">
          <h2 className="mb-4 text-lg font-semibold">AR Aging Summary</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={agingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 88%)" />
              <XAxis dataKey="range" tick={{ fontSize: 11 }} stroke="hsl(220 10% 46%)" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(220 10% 46%)" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
              <Bar dataKey="amount" fill="hsl(220 70% 22%)" radius={[4, 4, 0, 0]} name="Outstanding" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="dashboard-section">
          <h2 className="mb-4 text-lg font-semibold">Contract Progression</h2>
          <div className="space-y-3">
            {progressionBuckets.map((b) => (
              <div key={b.label} className="flex items-center gap-3">
                <span className="w-16 text-sm font-medium">{b.label}</span>
                <div className="flex-1"><Progress value={(b.count / clients.length) * 100} className="h-3" /></div>
                <span className="text-sm font-semibold">{b.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Forecasts */}
      <div className="mt-6 dashboard-section">
        <h2 className="mb-4 text-lg font-semibold">Expected Deposits Forecast</h2>
        <Tabs defaultValue="weekly">
          <TabsList><TabsTrigger value="weekly">Weekly</TabsTrigger><TabsTrigger value="monthly">Monthly</TabsTrigger></TabsList>
          <TabsContent value="weekly">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={weeklyForecast}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 88%)" />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} stroke="hsl(220 10% 46%)" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(220 10% 46%)" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                <Legend />
                <Area type="monotone" dataKey="optimistic" stroke="hsl(152 60% 40%)" fill="hsl(152 60% 40%)" fillOpacity={0.1} name="Optimistic" />
                <Area type="monotone" dataKey="projected" stroke="hsl(174 60% 40%)" fill="hsl(174 60% 40%)" fillOpacity={0.2} name="Projected" strokeWidth={2} />
                <Area type="monotone" dataKey="pessimistic" stroke="hsl(38 92% 50%)" fill="hsl(38 92% 50%)" fillOpacity={0.1} name="Pessimistic" />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value="monthly">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyForecast}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 88%)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(220 10% 46%)" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(220 10% 46%)" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                <Legend />
                <Area type="monotone" dataKey="optimistic" stroke="hsl(152 60% 40%)" fill="hsl(152 60% 40%)" fillOpacity={0.1} name="Optimistic" />
                <Area type="monotone" dataKey="projected" stroke="hsl(174 60% 40%)" fill="hsl(174 60% 40%)" fillOpacity={0.2} name="Projected" strokeWidth={2} />
                <Area type="monotone" dataKey="pessimistic" stroke="hsl(38 92% 50%)" fill="hsl(38 92% 50%)" fillOpacity={0.1} name="Pessimistic" />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Case Type Billing */}
        <div className="dashboard-section">
          <h2 className="mb-4 text-lg font-semibold">Billing by Case Type</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={caseTypeBilling} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 88%)" />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(220 10% 46%)" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <YAxis dataKey="caseType" type="category" tick={{ fontSize: 10 }} stroke="hsl(220 10% 46%)" width={120} />
              <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="totalBilled" fill="hsl(220 70% 22%)" radius={[0, 4, 4, 0]} name="Billed" />
              <Bar dataKey="totalCollected" fill="hsl(174 60% 40%)" radius={[0, 4, 4, 0]} name="Collected" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Contract Analytics */}
        <div className="dashboard-section">
          <h2 className="mb-4 text-lg font-semibold">Contract Lifecycle</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={contractAnalytics}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 88%)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(220 10% 46%)" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(220 10% 46%)" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="started" stroke="hsl(174 60% 40%)" strokeWidth={2} name="Started" dot={{ r: 3 }} />
              <Line type="monotone" dataKey="matured" stroke="hsl(152 60% 40%)" strokeWidth={2} name="Fully Paid" dot={{ r: 3 }} />
              <Line type="monotone" dataKey="delinquent" stroke="hsl(0 72% 51%)" strokeWidth={2} name="Delinquent" dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6">
        <TaskPanel department="ar" />
      </div>

      {/* All Contracts Table */}
      <div className="mt-6 dashboard-section">
        <h2 className="mb-4 text-lg font-semibold">All Contracts — Outstanding Balances</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-3 font-medium">Client</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Total Owed</th>
                <th className="pb-3 font-medium">Paid</th>
                <th className="pb-3 font-medium">Balance</th>
                <th className="pb-3 font-medium">Progress</th>
                <th className="pb-3 font-medium">Days Aging</th>
              </tr>
            </thead>
            <tbody>
              {[...clients].sort((a, b) => (b.totalOwed - b.totalPaid) - (a.totalOwed - a.totalPaid)).map((c) => {
                const pct = c.totalOwed > 0 ? Math.round((c.totalPaid / c.totalOwed) * 100) : 0;
                return (
                  <tr key={c.id} className="border-b last:border-0">
                    <td className="py-3 font-medium">{c.name}</td>
                    <td className="py-3"><Badge variant={c.status === "delinquent" ? "destructive" : c.status === "completed" ? "secondary" : "default"} className="text-xs capitalize">{c.status}</Badge></td>
                    <td className="py-3">${c.totalOwed.toLocaleString()}</td>
                    <td className="py-3">${c.totalPaid.toLocaleString()}</td>
                    <td className="py-3 font-semibold">${(c.totalOwed - c.totalPaid).toLocaleString()}</td>
                    <td className="py-3"><div className="flex items-center gap-2"><Progress value={pct} className="h-2 w-16" /><span className="text-xs">{pct}%</span></div></td>
                    <td className="py-3">{c.daysAging > 0 ? <Badge variant="destructive" className="text-xs">{c.daysAging}d</Badge> : <span className="text-muted-foreground">—</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AROversightDashboard;
