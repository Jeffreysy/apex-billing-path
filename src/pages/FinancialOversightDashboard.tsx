import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import TaskPanel from "@/components/TaskPanel";
import {
  clients, payments, getARAgingData, getForecastData, getMonthlyForecast,
  getContractAnalytics, getCaseTypeBilling, getTransactionsByType,
  getDailyCollections, getWeeklyPastCollections, getMonthlyPastCollections,
} from "@/data/mockData";
import {
  DollarSign, TrendingUp, FileText, CheckCircle, BarChart3, Target,
  ArrowDownRight, ArrowUpRight, Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart, Bar, AreaChart, Area, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";

const PIE_COLORS = [
  "hsl(220 70% 22%)", "hsl(174 60% 40%)", "hsl(152 60% 40%)",
  "hsl(38 92% 50%)", "hsl(280 60% 50%)", "hsl(0 72% 51%)",
];

const FinancialOversightDashboard = () => {
  const totalAR = clients.reduce((s, c) => s + (c.totalOwed - c.totalPaid), 0);
  const totalCollected = payments.filter(p => p.status === "completed").reduce((s, p) => s + p.amount, 0);
  const newCases = clients.filter(c => c.status === "new").length;
  const fullyPaid = clients.filter(c => c.status === "completed").length;
  const totalDownPayments = clients.filter(c => c.downPaymentPaid).reduce((s, c) => s + c.downPayment, 0);
  const retentionRate = Math.round((clients.filter(c => c.status !== "new").length / clients.length) * 100);

  const agingData = getARAgingData();
  const weeklyForecast = getForecastData();
  const monthlyForecast = getMonthlyForecast();
  const contractAnalytics = getContractAnalytics();
  const caseTypeBilling = getCaseTypeBilling();
  const transactionTypes = getTransactionsByType();
  const dailyCollections = getDailyCollections();
  const weeklyPast = getWeeklyPastCollections();
  const monthlyPast = getMonthlyPastCollections();

  const progressionBuckets = [
    { label: "0-25%", count: clients.filter(c => { const p = c.totalOwed > 0 ? c.totalPaid / c.totalOwed : 0; return p < 0.25; }).length },
    { label: "25-50%", count: clients.filter(c => { const p = c.totalOwed > 0 ? c.totalPaid / c.totalOwed : 0; return p >= 0.25 && p < 0.5; }).length },
    { label: "50-75%", count: clients.filter(c => { const p = c.totalOwed > 0 ? c.totalPaid / c.totalOwed : 0; return p >= 0.5 && p < 0.75; }).length },
    { label: "75-99%", count: clients.filter(c => { const p = c.totalOwed > 0 ? c.totalPaid / c.totalOwed : 0; return p >= 0.75 && p < 1; }).length },
    { label: "100%", count: clients.filter(c => c.status === "completed").length },
  ];

  const totalTxnAmount = transactionTypes.reduce((s, t) => s + t.total, 0);

  return (
    <DashboardLayout title="Financial Oversight">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Financial Oversight</h1>
        <p className="text-muted-foreground">
          Finance command center — AR portfolio, forecasting, transaction analytics, and revenue tracking
        </p>
        <div className="mt-2 flex gap-2">
          <Badge variant="outline" className="text-[10px] gap-1">
            <Wallet className="h-3 w-3" /> Collector payments + CRM transactions = one source of truth
          </Badge>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
        <StatCard label="Total AR" value={`$${totalAR.toLocaleString()}`} change={-3.2} icon={<DollarSign className="h-5 w-5" />} />
        <StatCard label="Collected (90d)" value={`$${totalCollected.toLocaleString()}`} change={12} icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard label="New Cases" value={String(newCases)} change={10} icon={<FileText className="h-5 w-5" />} />
        <StatCard label="Down Payments" value={`$${totalDownPayments.toLocaleString()}`} change={7} icon={<Target className="h-5 w-5" />} />
        <StatCard label="Fully Paid" value={String(fullyPaid)} change={15} icon={<CheckCircle className="h-5 w-5" />} />
        <StatCard label="Retention Rate" value={`${retentionRate}%`} change={2} icon={<BarChart3 className="h-5 w-5" />} />
      </div>

      {/* Transaction Breakdown + Pie */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="dashboard-section">
          <h2 className="mb-4 text-lg font-semibold">Transaction Breakdown by Type</h2>
          <div className="space-y-3">
            {transactionTypes.map(t => (
              <div key={t.type} className="flex items-center gap-3">
                <span className="w-36 text-sm font-medium">{t.label}</span>
                <div className="flex-1">
                  <Progress value={(t.total / totalTxnAmount) * 100} className="h-2" />
                </div>
                <span className="w-20 text-right text-sm font-semibold">${Math.round(t.total).toLocaleString()}</span>
                <Badge variant="outline" className="text-[10px] w-10 justify-center">{t.count}</Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-section">
          <h2 className="mb-4 text-lg font-semibold">Revenue by Transaction Type</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={transactionTypes}
                dataKey="total"
                nameKey="label"
                cx="50%"
                cy="50%"
                outerRadius={90}
                innerRadius={50}
                paddingAngle={2}
                label={({ label, percent }) => `${label} ${(percent * 100).toFixed(0)}%`}
              >
                {transactionTypes.map((_, idx) => (
                  <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weekly by Day + Payment Sources */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="dashboard-section">
          <h2 className="mb-4 text-lg font-semibold">This Week — Collections by Day</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dailyCollections}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 88%)" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(220 10% 46%)" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(220 10% 46%)" tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="collector" fill="hsl(220 70% 22%)" radius={[4, 4, 0, 0]} name="Collector Payments" stackId="a" />
              <Bar dataKey="crm" fill="hsl(174 60% 40%)" radius={[4, 4, 0, 0]} name="CRM Transactions" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
          <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
            <ArrowUpRight className="h-3 w-3 text-primary" /> Both collector-taken payments and CRM auto-transactions feed into AR totals
          </p>
        </div>

        <div className="dashboard-section">
          <h2 className="mb-4 text-lg font-semibold">AR Aging Summary</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={agingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 88%)" />
              <XAxis dataKey="range" tick={{ fontSize: 11 }} stroke="hsl(220 10% 46%)" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(220 10% 46%)" tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
              <Bar dataKey="amount" fill="hsl(220 70% 22%)" radius={[4, 4, 0, 0]} name="Outstanding" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Past Collections — Weekly / Monthly */}
      <div className="mt-6 dashboard-section">
        <h2 className="mb-4 text-lg font-semibold">Past Collections — Revenue by Source</h2>
        <Tabs defaultValue="weekly">
          <TabsList>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
          <TabsContent value="weekly">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyPast}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 88%)" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="hsl(220 10% 46%)" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(220 10% 46%)" tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="collector" fill="hsl(220 70% 22%)" name="Collector" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="crm" fill="hsl(174 60% 40%)" name="CRM / Auto-Pay" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value="monthly">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyPast}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 88%)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(220 10% 46%)" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(220 10% 46%)" tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="collector" fill="hsl(220 70% 22%)" name="Collector" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="crm" fill="hsl(174 60% 40%)" name="CRM / Auto-Pay" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </div>

      {/* Forecasts */}
      <div className="mt-6 dashboard-section">
        <h2 className="mb-4 text-lg font-semibold">Expected Deposits Forecast</h2>
        <p className="mb-3 text-xs text-muted-foreground flex items-center gap-1">
          <ArrowDownRight className="h-3 w-3" /> Driven by active contracts, scheduled installments, CRM transactions, and collector-taken payments
        </p>
        <Tabs defaultValue="weekly">
          <TabsList>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
          <TabsContent value="weekly">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={weeklyForecast}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 88%)" />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} stroke="hsl(220 10% 46%)" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(220 10% 46%)" tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
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
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(220 10% 46%)" tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
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

      {/* Contract Progression + Case Type Billing */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="dashboard-section">
          <h2 className="mb-4 text-lg font-semibold">Contract Progression</h2>
          <div className="space-y-3">
            {progressionBuckets.map(b => (
              <div key={b.label} className="flex items-center gap-3">
                <span className="w-16 text-sm font-medium">{b.label}</span>
                <div className="flex-1"><Progress value={(b.count / clients.length) * 100} className="h-3" /></div>
                <span className="text-sm font-semibold">{b.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-section">
          <h2 className="mb-4 text-lg font-semibold">Case Type Billing</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={caseTypeBilling} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 88%)" />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(220 10% 46%)" tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <YAxis dataKey="caseType" type="category" tick={{ fontSize: 10 }} stroke="hsl(220 10% 46%)" width={120} />
              <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="totalBilled" fill="hsl(220 70% 22%)" radius={[0, 4, 4, 0]} name="Billed" />
              <Bar dataKey="totalCollected" fill="hsl(174 60% 40%)" radius={[0, 4, 4, 0]} name="Collected" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Contract Lifecycle */}
      <div className="mt-6 dashboard-section">
        <h2 className="mb-4 text-lg font-semibold">Contract Lifecycle — Monthly Trend</h2>
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

      <div className="mt-6">
        <TaskPanel department="ar" />
      </div>

      {/* Full AR Portfolio Table */}
      <div className="mt-6 dashboard-section">
        <h2 className="mb-4 text-lg font-semibold">AR Portfolio — All Contracts</h2>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Case #</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total Owed</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Next Due</TableHead>
                <TableHead>Install. Left</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Days Past Due</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...clients]
                .sort((a, b) => (b.totalOwed - b.totalPaid) - (a.totalOwed - a.totalPaid))
                .map(c => {
                  const pct = c.totalOwed > 0 ? Math.round((c.totalPaid / c.totalOwed) * 100) : 0;
                  const paidInstallments = c.downPaymentPaid
                    ? Math.min(c.installmentMonths, Math.floor((c.totalPaid - c.downPayment) / c.monthlyPayment))
                    : 0;
                  const remaining = Math.max(0, c.installmentMonths - Math.max(0, paidInstallments));

                  return (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="font-mono text-xs">{c.caseNumber}</TableCell>
                      <TableCell>
                        <Badge
                          variant={c.status === "delinquent" ? "destructive" : c.status === "completed" ? "secondary" : "default"}
                          className="text-xs capitalize"
                        >
                          {c.status}
                        </Badge>
                      </TableCell>
                      <TableCell>${c.totalOwed.toLocaleString()}</TableCell>
                      <TableCell>${c.totalPaid.toLocaleString()}</TableCell>
                      <TableCell className="font-semibold">${(c.totalOwed - c.totalPaid).toLocaleString()}</TableCell>
                      <TableCell className="text-xs">{c.nextPaymentDue}</TableCell>
                      <TableCell className="text-center">{remaining}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={pct} className="h-2 w-16" />
                          <span className="text-xs">{pct}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {c.daysAging > 0
                          ? <Badge variant="destructive" className="text-xs">{c.daysAging}d</Badge>
                          : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FinancialOversightDashboard;
