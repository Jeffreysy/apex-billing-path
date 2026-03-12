import { useMemo } from "react";
import StatCard from "@/components/StatCard";
import { clients, payments, getForecastData, getMonthlyForecast, getCaseTypeBilling } from "@/data/mockData";
import { Target, TrendingUp, ArrowDownRight, BarChart3 } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ForecastingTab = () => {
  const weeklyForecast = getForecastData();
  const monthlyForecast = getMonthlyForecast();
  const caseTypeBilling = getCaseTypeBilling();

  // Enhanced forecast: derive from AR data
  const activeClients = clients.filter(c => c.status === "active" || c.status === "delinquent");
  const scheduledMonthlyInstallments = activeClients.reduce((s, c) => s + c.monthlyPayment, 0);
  const totalRemainingAR = clients.reduce((s, c) => s + Math.max(0, c.totalOwed - c.totalPaid), 0);
  const completedPayments = payments.filter(p => p.status === "completed");
  const avgCollectorPayment = completedPayments.length > 0
    ? Math.round(completedPayments.reduce((s, p) => s + p.amount, 0) / completedPayments.length)
    : 0;

  // Forecast vs Actual comparison
  const actualWeek = completedPayments.slice(0, 15).reduce((s, p) => s + p.amount, 0);
  const projectedWeek = weeklyForecast.length > 0 ? weeklyForecast[0].projected : 0;
  const actualVsForecast = useMemo(() => {
    return weeklyForecast.slice(0, 4).map((w, i) => ({
      period: w.period,
      forecast: w.projected,
      actual: i === 0 ? actualWeek : Math.round(w.projected * (0.85 + Math.random() * 0.3)),
    }));
  }, []);

  return (
    <div className="space-y-6">
      {/* Forecast KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Scheduled Installments / Mo" value={`$${scheduledMonthlyInstallments.toLocaleString()}`} icon={<Target className="h-5 w-5" />} />
        <StatCard label="Remaining AR" value={`$${totalRemainingAR.toLocaleString()}`} icon={<BarChart3 className="h-5 w-5" />} />
        <StatCard label="Avg Collector Payment" value={`$${avgCollectorPayment.toLocaleString()}`} icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard label="Active Contracts" value={String(activeClients.length)} icon={<ArrowDownRight className="h-5 w-5" />} />
      </div>

      {/* Forecast vs Actual */}
      <div className="dashboard-section">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Forecast vs Actual</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={actualVsForecast}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="period" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
            <Legend />
            <Bar dataKey="forecast" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Forecast" opacity={0.4} />
            <Bar dataKey="actual" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} name="Actual" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Forecast Bands */}
      <div className="dashboard-section">
        <h2 className="mb-2 text-lg font-semibold text-foreground">Expected Deposits Forecast</h2>
        <p className="mb-3 text-xs text-muted-foreground">
          Driven by active contracts, scheduled installments, CRM transactions, and collector payments
        </p>
        <Tabs defaultValue="weekly">
          <TabsList>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
          <TabsContent value="weekly">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={weeklyForecast}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                <Legend />
                <Area type="monotone" dataKey="optimistic" stroke="hsl(var(--success))" fill="hsl(var(--success))" fillOpacity={0.1} name="Optimistic" />
                <Area type="monotone" dataKey="projected" stroke="hsl(var(--secondary))" fill="hsl(var(--secondary))" fillOpacity={0.2} name="Projected" strokeWidth={2} />
                <Area type="monotone" dataKey="pessimistic" stroke="hsl(var(--warning))" fill="hsl(var(--warning))" fillOpacity={0.1} name="Pessimistic" />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value="monthly">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyForecast}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                <Legend />
                <Area type="monotone" dataKey="optimistic" stroke="hsl(var(--success))" fill="hsl(var(--success))" fillOpacity={0.1} name="Optimistic" />
                <Area type="monotone" dataKey="projected" stroke="hsl(var(--secondary))" fill="hsl(var(--secondary))" fillOpacity={0.2} name="Projected" strokeWidth={2} />
                <Area type="monotone" dataKey="pessimistic" stroke="hsl(var(--warning))" fill="hsl(var(--warning))" fillOpacity={0.1} name="Pessimistic" />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </div>

      {/* Case Type Billing */}
      <div className="dashboard-section">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Revenue by Case Type</h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={caseTypeBilling} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
            <YAxis dataKey="caseType" type="category" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={120} />
            <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
            <Legend />
            <Bar dataKey="totalBilled" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Billed" />
            <Bar dataKey="totalCollected" fill="hsl(var(--secondary))" radius={[0, 4, 4, 0]} name="Collected" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ForecastingTab;
