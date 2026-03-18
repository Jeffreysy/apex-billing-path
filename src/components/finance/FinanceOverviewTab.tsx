import { useMemo } from "react";
import StatCard from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  useMergedClients, usePaymentsData, useCollectionsByAging,
  computeARAgingData, computeTransactionsByType, computeDailyCollections,
  computeWeeklyPastCollections, computeMonthlyPastCollections, computeContractAnalytics,
} from "@/hooks/useSupabaseData";
import {
  DollarSign, TrendingUp, FileText, CheckCircle, Target,
  Clock, AlertTriangle, Gauge, ArrowUpRight, Activity, Percent,
} from "lucide-react";
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { DateRange } from "react-day-picker";

const PIE_COLORS = [
  "hsl(220 70% 22%)", "hsl(174 60% 40%)", "hsl(152 60% 40%)",
  "hsl(38 92% 50%)", "hsl(280 60% 50%)", "hsl(0 72% 51%)",
];

interface Props { dateRange?: DateRange }

const FinanceOverviewTab = ({ dateRange }: Props) => {
  const { data: clients = [], isLoading: cl } = useMergedClients();
  const { data: payments = [], isLoading: pl } = usePaymentsData();
  const { data: agingRaw = [], isLoading: al } = useCollectionsByAging();

  const isLoading = cl || pl || al;
  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading financial overview...</div>;

  const totalAR = clients.reduce((s, c) => s + Math.max(0, c.totalOwed - c.totalPaid), 0);
  const overdueAR = clients.filter(c => c.daysAging > 0).reduce((s, c) => s + Math.max(0, c.totalOwed - c.totalPaid), 0);
  const totalCollected = payments.reduce((s, p) => s + p.amount, 0);
  const weekCollected = payments.slice(0, 15).reduce((s, p) => s + p.amount, 0);
  const monthCollected = payments.slice(0, 40).reduce((s, p) => s + p.amount, 0);
  const forecastWeek = Math.round(weekCollected * 1.08);
  const forecastMonth = Math.round(monthCollected * 1.05);
  const varianceWeek = forecastWeek > 0 ? Math.round(((weekCollected - forecastWeek) / forecastWeek) * 100) : 0;
  const varianceMonth = forecastMonth > 0 ? Math.round(((monthCollected - forecastMonth) / forecastMonth) * 100) : 0;

  const delinquentClients = clients.filter(c => c.daysAging > 0);
  const avgDSO = delinquentClients.length > 0
    ? Math.round(delinquentClients.reduce((s, c) => s + c.daysAging, 0) / delinquentClients.length) : 0;

  const completedContracts = clients.filter(c => c.status === "completed").length;
  const activeContracts = clients.filter(c => c.status === "active" || c.status === "delinquent").length;
  const completionRate = activeContracts + completedContracts > 0
    ? Math.round((completedContracts / (activeContracts + completedContracts)) * 100) : 0;
  const totalOwedAll = clients.reduce((s, c) => s + c.totalOwed, 0);
  const totalPaidAll = clients.reduce((s, c) => s + c.totalPaid, 0);
  const collectionEffectiveness = totalOwedAll > 0 ? Math.round((totalPaidAll / totalOwedAll) * 100) : 0;

  const agingData = computeARAgingData(clients);
  const transactionTypes = computeTransactionsByType(payments, clients);
  const dailyCollections = computeDailyCollections(payments);
  const weeklyPast = computeWeeklyPastCollections(agingRaw);
  const monthlyPast = computeMonthlyPastCollections(agingRaw);
  const contractAnalytics = computeContractAnalytics(clients);

  const progressionBuckets = [
    { label: "0-25%", count: clients.filter(c => { const p = c.totalOwed > 0 ? c.totalPaid / c.totalOwed : 0; return p < 0.25; }).length },
    { label: "25-50%", count: clients.filter(c => { const p = c.totalOwed > 0 ? c.totalPaid / c.totalOwed : 0; return p >= 0.25 && p < 0.5; }).length },
    { label: "50-75%", count: clients.filter(c => { const p = c.totalOwed > 0 ? c.totalPaid / c.totalOwed : 0; return p >= 0.5 && p < 0.75; }).length },
    { label: "75-99%", count: clients.filter(c => { const p = c.totalOwed > 0 ? c.totalPaid / c.totalOwed : 0; return p >= 0.75 && p < 1; }).length },
    { label: "100%", count: completedContracts },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-6">
        <StatCard label="Total AR" value={`$${totalAR.toLocaleString()}`} icon={<DollarSign className="h-5 w-5" />} />
        <StatCard label="Overdue AR" value={`$${overdueAR.toLocaleString()}`} icon={<AlertTriangle className="h-5 w-5" />} />
        <StatCard label="Cash This Week" value={`$${weekCollected.toLocaleString()}`} icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard label="Cash This Month" value={`$${monthCollected.toLocaleString()}`} icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard label="Forecast (Week)" value={`$${forecastWeek.toLocaleString()}`} icon={<Target className="h-5 w-5" />} />
        <StatCard label="Forecast (Month)" value={`$${forecastMonth.toLocaleString()}`} icon={<Target className="h-5 w-5" />} />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-6">
        <StatCard label="Avg DSO" value={`${avgDSO} days`} icon={<Clock className="h-5 w-5" />} />
        <StatCard label="Collection Rate" value={`${collectionEffectiveness}%`} icon={<Gauge className="h-5 w-5" />} />
        <StatCard label="Plan Completion" value={`${completionRate}%`} icon={<Percent className="h-5 w-5" />} />
        <StatCard label="Active Contracts" value={String(activeContracts)} icon={<FileText className="h-5 w-5" />} />
        <StatCard label="Fully Paid" value={String(completedContracts)} icon={<CheckCircle className="h-5 w-5" />} />
        <StatCard label="Variance (Week)" value={`${varianceWeek > 0 ? "+" : ""}${varianceWeek}%`} icon={<Activity className="h-5 w-5" />} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="dashboard-section">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Revenue by Transaction Type</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={transactionTypes} dataKey="total" nameKey="label" cx="50%" cy="50%" outerRadius={95} innerRadius={55} paddingAngle={2}
                label={({ label, percent }) => `${label} ${(percent * 100).toFixed(0)}%`}>
                {transactionTypes.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="dashboard-section">
          <h2 className="mb-4 text-lg font-semibold text-foreground">This Week — Collections by Day</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={dailyCollections}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="collector" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Collector" stackId="a" />
              <Bar dataKey="crm" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} name="CRM" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
          <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
            <ArrowUpRight className="h-3 w-3 text-primary" /> Both sources feed AR totals
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="dashboard-section">
          <h2 className="mb-4 text-lg font-semibold text-foreground">AR Aging Summary</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={agingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="range" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
              <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Outstanding" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="dashboard-section">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Contract Progression</h2>
          <div className="space-y-3">
            {progressionBuckets.map(b => (
              <div key={b.label} className="flex items-center gap-3">
                <span className="w-16 text-sm font-medium text-foreground">{b.label}</span>
                <div className="flex-1"><Progress value={clients.length > 0 ? (b.count / clients.length) * 100 : 0} className="h-3" /></div>
                <span className="text-sm font-semibold text-foreground">{b.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Cash-In Trends — Revenue by Source</h2>
        <Tabs defaultValue="weekly">
          <TabsList>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
          <TabsContent value="weekly">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={weeklyPast}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="collector" fill="hsl(var(--primary))" name="Collector" stackId="a" />
                <Bar dataKey="crm" fill="hsl(var(--secondary))" name="CRM / Auto-Pay" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value="monthly">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyPast}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="collector" fill="hsl(var(--primary))" name="Collector" stackId="a" />
                <Bar dataKey="crm" fill="hsl(var(--secondary))" name="CRM / Auto-Pay" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </div>

      <div className="dashboard-section">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Contract Lifecycle — Monthly Trend</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={contractAnalytics}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="started" stroke="hsl(var(--secondary))" strokeWidth={2} name="Started" dot={{ r: 3 }} />
            <Line type="monotone" dataKey="matured" stroke="hsl(var(--success))" strokeWidth={2} name="Fully Paid" dot={{ r: 3 }} />
            <Line type="monotone" dataKey="delinquent" stroke="hsl(var(--destructive))" strokeWidth={2} name="Delinquent" dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FinanceOverviewTab;
