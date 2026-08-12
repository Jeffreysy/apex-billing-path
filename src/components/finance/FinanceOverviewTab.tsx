import { useMemo } from "react";
import StatCard from "@/components/StatCard";
import ARGrowthVsCollectionsChart from "./ARGrowthVsCollectionsChart";
import LawPayValidationPanel from "./LawPayValidationPanel";
import FilevineValidationPanel from "./FilevineValidationPanel";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  useAdminKPI, useFirmFinancialSummary, useMergedClients, usePaymentsClean, useCollectionActivityRows,
  useControllerARCashflow, useARLiveMovement, useARLiveTrend,
  computeARAgingData, computeTransactionsByType, computeDailyCollections,
  computeWeeklyPastCollections, computeMonthlyPastCollections, computeContractAnalytics,
} from "@/hooks/useSupabaseData";
import {
  DollarSign, TrendingUp, FileText, CheckCircle, Target,
  Clock, AlertTriangle, Gauge, ArrowUpRight, Activity, Percent,
} from "lucide-react";
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { DateRange } from "react-day-picker";
import { endOfDay, isWithinInterval, startOfMonth, startOfWeek } from "date-fns";

const PIE_COLORS = [
  "hsl(220 70% 22%)", "hsl(174 60% 40%)", "hsl(152 60% 40%)",
  "hsl(38 92% 50%)", "hsl(280 60% 50%)", "hsl(0 72% 51%)",
];

interface Props { dateRange?: DateRange }

const isExplicitFilevinePayment = (payment: {
  notes?: string | null;
  payment_type?: string | null;
  reference_number?: string | null;
}) => {
  const notes = (payment.notes || "").toLowerCase();
  const paymentType = (payment.payment_type || "").toLowerCase();
  const reference = (payment.reference_number || "").toLowerCase();
  return notes.startsWith("filevine:") || paymentType.includes("filevine") || reference.startsWith("fv-");
};

const FinanceOverviewTab = ({ dateRange }: Props) => {
  const { data: kpi } = useAdminKPI();
  const { data: firmSummary } = useFirmFinancialSummary();
  const { data: clients = [], isLoading: cl } = useMergedClients();
  const { data: paymentRows = [], isLoading: prl } = usePaymentsClean();
  const { data: activityRows = [], isLoading: al } = useCollectionActivityRows();
  const { data: cashflowData = [] } = useControllerARCashflow();
  const { data: liveMovementRows = [] } = useARLiveMovement();
  const { data: liveTrendRows = [] } = useARLiveTrend();

  const isLoading = cl || prl || al;
  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading financial overview...</div>;

  // Reuse the already-loaded canonical payment rows for chart helpers. Previously
  // usePaymentsData fetched the entire payments_clean view a second time.
  const payments = paymentRows.map((p: any) => ({
    id: p.id,
    clientId: p.client_id || "",
    clientName: p.client_name || "Unknown",
    amount: Number(p.amount) || 0,
    date: p.payment_date,
    method: p.payment_method === "ach" || p.payment_method === "wire" ? "ach"
      : p.payment_method === "check" ? "check"
      : p.payment_method === "cash" ? "cash"
      : "card",
    collectorId: "",
    collectorName: p.collector_name || "CRM",
    status: "completed" as const,
  }));

  // Canonical Total AR = v_firm_financial_summary.ar_total (VP-certified anchor via useFirmFinancialSummary),
  // so this tile ties to AdminDashboard / ControllerAR to the penny. Falls back to admin_kpi.total_remaining
  // (live-AR, nets post-snapshot collections) then a client-side sum only if the certified row is unavailable.
  // The live figure is surfaced separately in the "Live AR Now" panel above — never as a second "Total AR".
  const totalAR = Number(firmSummary?.ar_total) || Number(kpi?.total_remaining) || clients.reduce((s, c) => s + Math.max(0, c.totalOwed - c.totalPaid), 0);
  const overdueAR = Number((kpi as any)?.overdue_ar) || clients.filter(c => c.daysAging > 0).reduce((s, c) => s + Math.max(0, c.totalOwed - c.totalPaid), 0);
  const arOnPlan = Number(kpi?.ar_on_plan) || 0;
  const arLate = Number(kpi?.ar_late) || 0;
  const arActionable = Number(kpi?.ar_actionable) || 0;
  const contractsOnPlan = Number(kpi?.contracts_on_plan) || 0;
  const contractsLate = Number(kpi?.contracts_late) || 0;
  const contractsActionable = Number(kpi?.contracts_actionable) || 0;
  const totalCollectedAll = Number(kpi?.total_collected) || payments.reduce((s, p) => s + p.amount, 0);

  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const monthStart = startOfMonth(now);
  const nowEnd = endOfDay(now);

  const currentPeriodPayments = paymentRows.filter((payment) => {
    if (!payment.payment_date || !payment.amount) return false;
    const paymentDate = new Date(payment.payment_date);
    return !Number.isNaN(paymentDate.getTime()) && isWithinInterval(paymentDate, { start: monthStart, end: nowEnd });
  });

  const weekCollected = paymentRows
    .filter((payment) => {
      if (!payment.payment_date || !payment.amount) return false;
      const paymentDate = new Date(payment.payment_date);
      return !Number.isNaN(paymentDate.getTime()) && isWithinInterval(paymentDate, { start: weekStart, end: nowEnd });
    })
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  const monthCollected = currentPeriodPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  const weekCollectorLogged = activityRows
    .filter((activity) => {
      if (!activity.activity_date || !activity.collected_amount) return false;
      const activityDate = new Date(activity.activity_date);
      return !Number.isNaN(activityDate.getTime()) && isWithinInterval(activityDate, { start: weekStart, end: nowEnd });
    })
    .reduce((sum, activity) => sum + Number(activity.collected_amount || 0), 0);

  const monthCollectorLogged = activityRows
    .filter((activity) => {
      if (!activity.activity_date || !activity.collected_amount) return false;
      const activityDate = new Date(activity.activity_date);
      return !Number.isNaN(activityDate.getTime()) && isWithinInterval(activityDate, { start: monthStart, end: nowEnd });
    })
    .reduce((sum, activity) => sum + Number(activity.collected_amount || 0), 0);

  const weekFilevineTagged = currentPeriodPayments
    .filter((payment) => {
      if (!payment.payment_date) return false;
      const paymentDate = new Date(payment.payment_date);
      return !Number.isNaN(paymentDate.getTime())
        && isWithinInterval(paymentDate, { start: weekStart, end: nowEnd })
        && isExplicitFilevinePayment(payment);
    })
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  const monthFilevineTagged = currentPeriodPayments
    .filter(isExplicitFilevinePayment)
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  const latestBookedPaymentDate = paymentRows.find((payment) => payment.payment_date)?.payment_date || null;
  const latestCollectorActivityDate = activityRows.find((activity) => activity.activity_date)?.activity_date || null;

  const activeClients = clients.filter(c => c.status === "active" || c.status === "delinquent");
  const scheduledMonthly = activeClients.reduce((s, c) => s + c.monthlyPayment, 0);
  const scheduledWeekly = scheduledMonthly / 4;
  const forecastWeek = Math.round(scheduledWeekly);
  const forecastMonth = Math.round(scheduledMonthly);
  const varianceWeek = forecastWeek > 0 ? Math.round(((weekCollected - forecastWeek) / forecastWeek) * 100) : 0;
  const varianceMonth = forecastMonth > 0 ? Math.round(((monthCollected - forecastMonth) / forecastMonth) * 100) : 0;

  const delinquentClients = clients.filter(c => c.daysAging > 0);
  const avgDSO = delinquentClients.length > 0
    ? Math.round(delinquentClients.reduce((s, c) => s + c.daysAging, 0) / delinquentClients.length) : 0;

  const completedContracts = clients.filter(c => c.status === "completed").length;
  const activeContracts = Number((kpi as any)?.active_contracts) || clients.filter(c => c.status === "active" || c.status === "delinquent").length;
  const completionRate = activeContracts + completedContracts > 0
    ? Math.round((completedContracts / (activeContracts + completedContracts)) * 100) : 0;
  const totalOwedAll = clients.reduce((s, c) => s + c.totalOwed, 0);
  const totalPaidAll = clients.reduce((s, c) => s + c.totalPaid, 0);
  const collectionEffectiveness = Number(kpi?.collection_rate_pct) || (totalOwedAll > 0 ? Math.round((totalPaidAll / totalOwedAll) * 100) : 0);

  const agingData = computeARAgingData(clients);
  const transactionTypes = computeTransactionsByType(payments, clients, paymentRows);
  const dailyCollections = computeDailyCollections(payments);
  const weeklyPast = computeWeeklyPastCollections(payments);
  const monthlyPast = computeMonthlyPastCollections(payments);
  const contractAnalytics = computeContractAnalytics(clients);
  const paymentDeltaMonth = Math.round(monthCollectorLogged - monthCollected);
  const paymentDeltaWeek = Math.round(weekCollectorLogged - weekCollected);
  const paymentFreshness = latestBookedPaymentDate
    ? `Booked through ${new Date(latestBookedPaymentDate).toLocaleDateString()}`
    : "No booked payments this period";
  const collectorFreshness = latestCollectorActivityDate
    ? `Collector logs through ${new Date(latestCollectorActivityDate).toLocaleDateString()}`
    : "No collector activity imported";

  const progressionBuckets = [
    { label: "0-25%", count: clients.filter(c => { const p = c.totalOwed > 0 ? c.totalPaid / c.totalOwed : 0; return p < 0.25; }).length },
    { label: "25-50%", count: clients.filter(c => { const p = c.totalOwed > 0 ? c.totalPaid / c.totalOwed : 0; return p >= 0.25 && p < 0.5; }).length },
    { label: "50-75%", count: clients.filter(c => { const p = c.totalOwed > 0 ? c.totalPaid / c.totalOwed : 0; return p >= 0.5 && p < 0.75; }).length },
    { label: "75-99%", count: clients.filter(c => { const p = c.totalOwed > 0 ? c.totalPaid / c.totalOwed : 0; return p >= 0.75 && p < 1; }).length },
    { label: "100%", count: completedContracts },
  ];

  const cfFmt = (n: number | string | null | undefined): string => {
    const v = Number(n) || 0;
    if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
    if (Math.abs(v) >= 1_000) return `$${(v / 1_000).toFixed(1)}k`;
    return `$${Math.round(v).toLocaleString()}`;
  };
  const cfTotalCases = cashflowData.reduce((s: number, r: any) => s + (Number(r.new_cases) || 0), 0);
  const cfTotalContract = cashflowData.reduce((s: number, r: any) => s + (Number(r.contract_value) || 0), 0);
  const cfTotalCollected = cashflowData.reduce((s: number, r: any) => s + (Number(r.total_collected) || 0), 0);
  const cfTotalNet = cashflowData.reduce((s: number, r: any) => s + (Number(r.net_ar_movement) || 0), 0);
  const cfLatest = cashflowData.length > 0 ? cashflowData[cashflowData.length - 1] : null;
  const cfComplete = cashflowData.filter((r: any) => r.data_quality === 'complete');
  const cfLatestComplete = cfComplete.length > 0 ? cfComplete[cfComplete.length - 1] : cfLatest;

  // ── Live AR (MyCase snapshot baseline net of LawPay since) ──
  const live = (liveMovementRows as any[])[0] || null;
  const liveTrend = [...(liveTrendRows as any[])]
    .filter((r) => r.capture_date && r.live_ar != null)
    .sort((a, b) => String(a.capture_date).localeCompare(String(b.capture_date)))
    .map((r) => ({ date: String(r.capture_date).slice(5), live_ar: Number(r.live_ar) }));
  const usd = (n: number | string | null | undefined) => `$${Math.round(Number(n) || 0).toLocaleString()}`;

  return (
    <div className="space-y-6">
      {/* ── LIVE AR (MyCase snapshot baseline + live LawPay feed) ── */}
      {live && (
        <div className="rounded-lg border bg-card p-3">
          <div className="mb-2 flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-600" />
            <p className="text-xs font-semibold text-muted-foreground">LIVE AR — MyCase baseline + LawPay live feed</p>
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> live
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-950 lg:col-span-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">Live AR Now</p>
              <p className="mt-1 text-2xl font-bold text-emerald-700">{usd(live.live_ar)}</p>
              <p className="text-[10px] text-emerald-600/70">as of {live.as_of ? new Date(live.as_of).toLocaleDateString() : "now"}</p>
            </div>
            <div className="rounded-lg border px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Snapshot Baseline</p>
              <p className="mt-1 text-xl font-bold">{usd(live.baseline_ar)}</p>
              <p className="text-[10px] text-muted-foreground">MyCase {live.baseline_date} • {Number(live.baseline_invoices).toLocaleString()} invoices</p>
            </div>
            <div className="rounded-lg border px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Collected Since (LawPay)</p>
              <p className="mt-1 text-xl font-bold text-emerald-700">−{usd(live.ar_paid_down_since)}</p>
              <p className="text-[10px] text-muted-foreground">{Number(live.lawpay_payments_since).toLocaleString()} payments • {live.days_since_baseline}d since baseline</p>
            </div>
            <div className="rounded-lg border px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Live AR Trend</p>
              {liveTrend.length > 1 ? (
                <ResponsiveContainer width="100%" height={48}>
                  <LineChart data={liveTrend}>
                    <Line type="monotone" dataKey="live_ar" stroke="hsl(152 60% 40%)" strokeWidth={2} dot={false} />
                    <Tooltip formatter={(v: number) => usd(v)} labelFormatter={(l) => `Day ${l}`} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="mt-2 text-[10px] text-muted-foreground">Builds daily — first point {live.baseline_date ? "logged today" : "pending"}. LawPay tracks paydowns; new invoices need the next MyCase snapshot.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── AR CASHFLOW KPIs (MyCase + LawPay Verified) ── */}
      <div className="rounded-lg border bg-card p-3">
        <p className="text-xs font-semibold text-muted-foreground mb-2">AR CASHFLOW — MyCase Cases + LawPay Verified</p>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-6">
          <div className="rounded-lg border px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Firm AR</p>
            <p className="mt-1 text-xl font-bold">{cfFmt(cfLatest?.ending_firm_ar)}</p>
            <p className="text-[10px] text-muted-foreground">{cfLatest?.label || ''}</p>
          </div>
          <div className="rounded-lg border px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">New Cases (Latest)</p>
            <p className="mt-1 text-xl font-bold">{cfLatestComplete?.new_cases || 0}</p>
            <p className="text-[10px] text-muted-foreground">{cfLatestComplete?.label} • Avg {cfFmt(cfLatestComplete?.avg_contract)}/case</p>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-950">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">Total Collected (13mo)</p>
            <p className="mt-1 text-xl font-bold text-emerald-700">{cfFmt(cfTotalCollected)}</p>
            <p className="text-[10px] text-emerald-600/70">{((cfTotalCollected / Math.max(cfTotalContract, 1)) * 100).toFixed(0)}% of contract value</p>
          </div>
          <div className={`rounded-lg border px-4 py-3 ${cfTotalNet < 0 ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950' : 'border-red-200 bg-red-50'}`}>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Net AR Movement (13mo)</p>
            <p className={`mt-1 text-xl font-bold ${cfTotalNet < 0 ? 'text-emerald-700' : 'text-red-700'}`}>{cfFmt(cfTotalNet)}</p>
            <p className="text-[10px] text-muted-foreground">{cfTotalNet < 0 ? 'AR shrinking (collecting > new)' : 'AR growing'}</p>
          </div>
          <StatCard
            label="Cash This Month"
            value={`$${monthCollected.toLocaleString()}`}
            icon={<TrendingUp className="h-5 w-5" />}
            caption={`Collector logs $${monthCollectorLogged.toLocaleString()}`}
          />
          <StatCard label="Scheduled / Mo" value={`$${forecastMonth.toLocaleString()}`} icon={<Target className="h-5 w-5" />} caption={`Variance ${varianceMonth >= 0 ? "+" : ""}${varianceMonth}%`} />
        </div>
      </div>

      {/* ── AR Created vs Collections Chart ── */}
      {cashflowData.length > 0 && (
        <div className="rounded-lg border bg-card p-4">
          <h2 className="text-lg font-semibold mb-1">AR Created vs Collections</h2>
          <p className="text-xs text-muted-foreground mb-3">Contract value (new cases) vs total collected vs net AR movement — source: MyCase + LawPay</p>
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={cashflowData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tickFormatter={v => cfFmt(v)} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip formatter={(v: number) => cfFmt(v)} />
              <Legend />
              <Bar dataKey="contract_value" fill="hsl(152 60% 40%)" name="Contract Value" opacity={0.7} />
              <Bar dataKey="down_payments" fill="hsl(38 92% 50%)" name="Cash Day 1" />
              <Bar dataKey="total_collected" fill="hsl(200 70% 50%)" name="Collections" />
              <Line type="monotone" dataKey="net_ar_movement" stroke="hsl(0 84% 60%)" strokeWidth={2} name="Net Movement" dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Operational KPIs ── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-6">
        <StatCard label="Total AR" value={`$${totalAR.toLocaleString()}`} icon={<DollarSign className="h-5 w-5" />} />
        <StatCard label="Avg DSO" value={`${avgDSO} days`} icon={<Clock className="h-5 w-5" />} />
        <StatCard label="Collection Rate" value={`${collectionEffectiveness}%`} icon={<Gauge className="h-5 w-5" />} />
        <StatCard label="Active Contracts" value={String(activeContracts)} icon={<FileText className="h-5 w-5" />} />
        <StatCard label="Fully Paid" value={String(completedContracts)} icon={<CheckCircle className="h-5 w-5" />} />
        <StatCard label="Plan Completion" value={`${completionRate}%`} icon={<Percent className="h-5 w-5" />} />
      </div>

      <div className="dashboard-section space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Cash Validation</h2>
            <p className="text-sm text-muted-foreground">
              Compares booked payment rows against imported collector logs and explicit Filevine-tagged payments.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={paymentDeltaMonth === 0 ? "outline" : "secondary"}>
              Month delta {paymentDeltaMonth >= 0 ? "+" : ""}${paymentDeltaMonth.toLocaleString()}
            </Badge>
            <Badge variant={paymentDeltaWeek === 0 ? "outline" : "secondary"}>
              Week delta {paymentDeltaWeek >= 0 ? "+" : ""}${paymentDeltaWeek.toLocaleString()}
            </Badge>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">This Week</p>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Booked payments</span>
                <span className="font-semibold">${weekCollected.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Collector logs</span>
                <span className="font-semibold">${weekCollectorLogged.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Explicit Filevine tags</span>
                <span className="font-semibold">${weekFilevineTagged.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">This Month</p>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Booked payments</span>
                <span className="font-semibold">${monthCollected.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Collector logs</span>
                <span className="font-semibold">${monthCollectorLogged.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Explicit Filevine tags</span>
                <span className="font-semibold">${monthFilevineTagged.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Freshness</p>
            <div className="mt-3 space-y-2 text-sm text-muted-foreground">
              <p>{paymentFreshness}</p>
              <p>{collectorFreshness}</p>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">What This Means</p>
            <div className="mt-3 space-y-2 text-sm text-muted-foreground">
              <p>Cash cards now reflect current-period booked payments only.</p>
              <p>Collector log totals help spot payment feed lag or missing syncs.</p>
              <p>Filevine totals only count payments explicitly tagged as Filevine.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <LawPayValidationPanel />
        <FilevineValidationPanel />
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
