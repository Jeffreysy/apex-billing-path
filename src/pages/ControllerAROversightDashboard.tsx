import { useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  useControllerBucketAging,
  useControllerMonthlyCollections,
  useControllerCollectorMonthly,
  useControllerDelinquentExposure,
  useControllerAutopayForecast,
  useControllerSnapshotDelta,
  useControllerInstallmentRate,
  useControllerBucketCollections,
  useControllerBucketContracts,
  useControllerInstallmentCompletion,
  useControllerInstallmentMaturity,
  useControllerInstallmentGap,
  useControllerInstallmentTiers,
  useControllerAutomationClients,
  useControllerAutomationSummary,
  useControllerGrowthVsCollections,
  useControllerTrueExposure,
  useControllerARCashflow,
} from "@/hooks/useSupabaseData";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, ComposedChart, Line,
} from "recharts";
import { DollarSign, TrendingDown, TrendingUp, AlertTriangle, CreditCard, Users, Zap, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const BUCKET_ORDER = ["Current", "1-30", "31-60", "61-90", "91-180", "180+"] as const;
const BUCKET_COLORS: Record<string, string> = {
  "Current": "hsl(152 60% 40%)",
  "1-30": "hsl(200 70% 50%)",
  "31-60": "hsl(38 92% 50%)",
  "61-90": "hsl(25 95% 53%)",
  "91-180": "hsl(0 84% 60%)",
  "180+": "hsl(0 72% 40%)",
};
const COMMISSION_RATES: Record<string, number> = { "Current": 0, "1-30": 5, "31-60": 7.78, "61-90": 12.69, "91-180": 19.11, "180+": 12.06 };

function fmt(n: number | string | null | undefined): string {
  const v = Number(n) || 0;
  if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (Math.abs(v) >= 1_000) return `$${(v / 1_000).toFixed(1)}k`;
  return `$${Math.round(v).toLocaleString()}`;
}

function pct(n: number | string | null | undefined): string {
  return `${Number(n || 0).toFixed(1)}%`;
}

function KpiCard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className={`mt-2 text-xl font-bold ${color || ""}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

const ControllerAROversightDashboard = () => {
  const { data: agingSnaps = [], isLoading: l1 } = useControllerBucketAging();
  const { data: monthlyCol = [], isLoading: l2 } = useControllerMonthlyCollections();
  const { data: collectorMo = [], isLoading: l3 } = useControllerCollectorMonthly();
  const { data: delinqExpo = [], isLoading: l4 } = useControllerDelinquentExposure();
  const { data: autopayFcst = [], isLoading: l5 } = useControllerAutopayForecast();
  const { data: snapDeltas = [], isLoading: l6 } = useControllerSnapshotDelta();
  const { data: installRate = [], isLoading: l7 } = useControllerInstallmentRate();
  const { data: bucketCol = [], isLoading: l8 } = useControllerBucketCollections();
  const { data: bucketContr = [], isLoading: l9 } = useControllerBucketContracts();
  const { data: instCompletion = [], isLoading: l10 } = useControllerInstallmentCompletion();
  const { data: instMaturity = [], isLoading: l11 } = useControllerInstallmentMaturity();
  const { data: instGap = [], isLoading: l12 } = useControllerInstallmentGap();
  const { data: instTiers = [], isLoading: l13 } = useControllerInstallmentTiers();
  const { data: autoClients = [], isLoading: l14 } = useControllerAutomationClients();
  const { data: autoSummary = [], isLoading: l15 } = useControllerAutomationSummary();
  const { data: growthData = [], isLoading: l16 } = useControllerGrowthVsCollections();
  const { data: trueExposure, isLoading: l17 } = useControllerTrueExposure();
  const { data: cashflowData = [], isLoading: l18 } = useControllerARCashflow();

  const [autoSearch, setAutoSearch] = useState("");
  const [autoFilter, setAutoFilter] = useState("all");

  const loading = l1 || l2 || l3 || l4 || l5 || l6 || l7 || l8 || l9 || l10 || l11 || l12 || l13 || l14 || l15 || l16 || l17;

  // ── Derived data ──
  const latestSnap = agingSnaps[0];

  const totalAR = Number(latestSnap?.total_ar) || 0;
  const bucketAmounts = useMemo(() => {
    if (!latestSnap) return {};
    return {
      "Current": Number(latestSnap.current_0) || 0,
      "1-30": Number(latestSnap.bucket_1_30) || 0,
      "31-60": Number(latestSnap.bucket_31_60) || 0,
      "61-90": Number(latestSnap.bucket_61_90) || 0,
      "91-180": Number(latestSnap.bucket_91_180) || 0,
      "180+": Number(latestSnap.bucket_180_plus) || 0,
    };
  }, [latestSnap]);

  const agingChartData = useMemo(() =>
    BUCKET_ORDER.map(b => ({
      bucket: b,
      amount: (bucketAmounts as any)[b] || 0,
      pct: totalAR ? ((bucketAmounts as any)[b] || 0) / totalAR * 100 : 0,
    })),
  [bucketAmounts, totalAR]);

  const snapshotTrend = useMemo(() =>
    [...agingSnaps].reverse().map(s => ({
      date: String(s.snapshot_date).slice(0, 10),
      current: Number(s.current_0) || 0,
      "1-30": Number(s.bucket_1_30) || 0,
      "31-60": Number(s.bucket_31_60) || 0,
      "61-90": Number(s.bucket_61_90) || 0,
      "91-180": Number(s.bucket_91_180) || 0,
      "180+": Number(s.bucket_180_plus) || 0,
      total: Number(s.total_ar) || 0,
    })),
  [agingSnaps]);

  const autoPayTotal = useMemo(() => {
    const recent = monthlyCol.filter((r: any) => r.month);
    return recent.reduce((s: number, r: any) => s + (Number(r.auto_pay_amount) || 0) + (Number(r.installment_amount) || 0), 0);
  }, [monthlyCol]);

  const totalCollected = useMemo(() =>
    monthlyCol.reduce((s: number, r: any) => s + (Number(r.total_collected) || 0), 0),
  [monthlyCol]);

  const autopayPct = totalCollected > 0 ? autoPayTotal / totalCollected * 100 : 0;

  const untouchedExposure = useMemo(() =>
    delinqExpo
      .filter((r: any) => r.contact_status === "Never Contacted" && r.delinquency_status !== "Current")
      .reduce((s: number, r: any) => s + (Number(r.outstanding) || 0), 0),
  [delinqExpo]);

  const latestRate = installRate[0];
  const collectionRate = Number(latestRate?.collection_rate_pct) || 0;
  const installGap = Number(latestRate?.gap) || 0;

  // Forecast
  const monthlyExpected = useMemo(() =>
    autopayFcst.reduce((s: number, r: any) => s + (Number(r.total_monthly_expected) || 0), 0),
  [autopayFcst]);

  // Installment derived data
  const planGapTotal = useMemo(() =>
    instGap.reduce((s: number, r: any) => s + (Number(r.total_structural_gap) || 0), 0),
  [instGap]);

  const completedPlanOutstanding = useMemo(() =>
    (instMaturity.find((r: any) => r.maturity_window === "Plan complete")?.total_outstanding) || 0,
  [instMaturity]);

  const completionChartData = useMemo(() => {
    const tiers = ["0% (No payments)", "1-24%", "25-49%", "50-74%", "75-99%", "100% (Plan complete)"];
    return tiers.map(t => {
      const rows = instCompletion.filter((r: any) => r.completion_tier === t);
      return {
        tier: t.replace(" (No payments)", "").replace(" (Plan complete)", ""),
        current: rows.filter((r: any) => r.delinquency_status === "Current").reduce((s: number, r: any) => s + (Number(r.outstanding) || 0), 0),
        delinquent: rows.filter((r: any) => r.delinquency_status === "Delinquent").reduce((s: number, r: any) => s + (Number(r.outstanding) || 0), 0),
        late: rows.filter((r: any) => r.delinquency_status === "Late").reduce((s: number, r: any) => s + (Number(r.outstanding) || 0), 0),
        contracts: rows.reduce((s: number, r: any) => s + (Number(r.contracts) || 0), 0),
      };
    });
  }, [instCompletion]);

  const maturityChartData = useMemo(() =>
    [...instMaturity].sort((a: any, b: any) => (Number(a.maturity_ord) || 0) - (Number(b.maturity_ord) || 0))
      .map((r: any) => ({
        window: r.maturity_window,
        scheduled: Number(r.total_remaining_scheduled) || 0,
        outstanding: Number(r.total_outstanding) || 0,
        gap: Number(r.total_plan_gap) || 0,
        contracts: Number(r.contracts) || 0,
      })),
  [instMaturity]);

  // Collector monthly pivot
  const collectorMonths = useMemo(() => {
    const months = [...new Set(collectorMo.map((r: any) => r.month))].sort().slice(-6);
    return months.map(m => {
      const rows = collectorMo.filter((r: any) => r.month === m);
      return {
        month: String(m).slice(0, 7),
        total: rows.reduce((s: number, r: any) => s + (Number(r.collected) || 0), 0),
        activities: rows.reduce((s: number, r: any) => s + (Number(r.activities) || 0), 0),
        collectors: rows,
      };
    });
  }, [collectorMo]);

  // Bucket collections by month
  const bucketColByMonth = useMemo(() => {
    const months = [...new Set(bucketCol.map((r: any) => String(r.month).slice(0, 7)))].sort().slice(-6);
    return months.map(m => {
      const rows = bucketCol.filter((r: any) => String(r.month).slice(0, 7) === m);
      const entry: any = { month: m };
      for (const b of BUCKET_ORDER) {
        const row = rows.find((r: any) => r.bucket === b);
        entry[b] = Number(row?.collected) || 0;
      }
      entry.total = BUCKET_ORDER.reduce((s, b) => s + (entry[b] || 0), 0);
      return entry;
    });
  }, [bucketCol]);

  if (loading) {
    return (
      <DashboardLayout title="Controller AR Oversight">
        <div className="p-8 text-center text-muted-foreground">Loading controller data...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Controller AR Oversight">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Controller AR Oversight</h1>
        <p className="text-muted-foreground">
          Live AR movement, commission-aligned aging buckets, auto-pay tracking, and revenue forecast
        </p>
      </div>

      {/* Dual AR View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground mb-1">Reported AR (MyCase)</p>
          <p className="text-2xl font-bold">{fmt(Number(trueExposure?.reported_ar) || totalAR)}</p>
          <p className="text-xs text-muted-foreground">{trueExposure?.invoice_count || latestSnap?.invoice_count || 0} invoices | includes {trueExposure?.migrated_fv_invoices || 0} migrated FV ({fmt(trueExposure?.migrated_fv_in_reported || 0)})</p>
        </div>
        <div className="rounded-lg border bg-card p-4 border-orange-200 bg-orange-50/50 dark:bg-orange-950/10">
          <p className="text-xs font-medium text-muted-foreground mb-1">True Collectible AR</p>
          <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">{fmt(Number(trueExposure?.true_collectible_ar) || 0)}</p>
          <div className="text-xs text-muted-foreground space-y-0.5 mt-1">
            <p>Active/Risk: {fmt(trueExposure?.active_risk_outstanding)} ({trueExposure?.active_risk_contracts} contracts)</p>
            <p>Remaining FV gap: {fmt(trueExposure?.remaining_fv_gap)} (599 invoices not yet migrated)</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6 mb-6">
        <KpiCard icon={TrendingDown} label="180+ Chronic" value={fmt(bucketAmounts["180+"] || 0)}
          sub={pct(totalAR ? (bucketAmounts["180+"] || 0) / totalAR * 100 : 0) + " of reported AR"}
          color="text-destructive" />
        <KpiCard icon={CreditCard} label="Auto-Pay Rate" value={pct(autopayPct)}
          sub={fmt(autoPayTotal) + " auto-collected"} />
        <KpiCard icon={TrendingUp} label="Collection Rate" value={pct(collectionRate)}
          sub={fmt(installGap) + " monthly gap"} />
        <KpiCard icon={AlertTriangle} label="Untouched Delinquent" value={fmt(untouchedExposure)}
          sub="Never contacted" color="text-destructive" />
        <KpiCard icon={AlertTriangle} label="Plan Gap (Structural)" value={fmt(planGapTotal)}
          sub="Plans short of contract" color="text-destructive" />
        <KpiCard icon={DollarSign} label="Completed Plans Owe" value={fmt(completedPlanOutstanding)}
          sub="Plan done, still owe $" color="text-orange-600" />
      </div>

      <Tabs defaultValue="aging">
        <TabsList className="mb-4 flex-wrap">
          <TabsTrigger value="cashflow">AR Cashflow</TabsTrigger>
          <TabsTrigger value="growth">Growth vs Collections</TabsTrigger>
          <TabsTrigger value="aging">Aging Buckets</TabsTrigger>
          <TabsTrigger value="installments">Installment View</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="autopay">Auto-Pay & Forecast</TabsTrigger>
          <TabsTrigger value="delinquent">Delinquent Exposure</TabsTrigger>
          <TabsTrigger value="automation">Automation Clients</TabsTrigger>
        </TabsList>

        {/* ── TAB: AR Cashflow ── */}
        <TabsContent value="cashflow" className="space-y-6">
          <div className="rounded-lg border bg-card p-4 mb-2">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">AR Cashflow Analysis</span> — obligation created vs cash received vs receivable generated.
              Source: MyCase cases (open_date + invoice &gt; $250) cross-referenced to LawPay first payments.
            </p>
          </div>

          {/* KPI cards */}
          {(() => {
            const complete = cashflowData.filter((r: any) => r.data_quality === 'complete');
            const latest = complete.length > 0 ? complete[complete.length - 1] : cashflowData[cashflowData.length - 1];
            const totalCases = cashflowData.reduce((s: number, r: any) => s + (Number(r.new_cases) || 0), 0);
            const totalContract = cashflowData.reduce((s: number, r: any) => s + (Number(r.contract_value) || 0), 0);
            const totalCollected = cashflowData.reduce((s: number, r: any) => s + (Number(r.total_collected) || 0), 0);
            const totalNet = cashflowData.reduce((s: number, r: any) => s + (Number(r.net_ar_movement) || 0), 0);
            return (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard icon={Users} label="Total Cases (13 mo)" value={totalCases.toLocaleString()} sub={`Avg ${Math.round(totalCases / Math.max(cashflowData.length, 1))}/mo`} />
                <KpiCard icon={DollarSign} label="Total Contract Value" value={fmt(totalContract)} sub={`Avg case ${fmt(totalContract / Math.max(totalCases, 1))}`} />
                <KpiCard icon={CreditCard} label="Total Collected" value={fmt(totalCollected)} sub={`${((totalCollected / Math.max(totalContract, 1)) * 100).toFixed(0)}% of contract`} />
                <KpiCard icon={totalNet < 0 ? TrendingDown : TrendingUp} label="Net AR Movement" value={fmt(totalNet)}
                  sub={totalNet < 0 ? 'AR shrinking (good)' : 'AR growing'}
                  color={totalNet < 0 ? 'text-green-600' : 'text-destructive'} />
              </div>
            );
          })()}

          {/* Cashflow chart */}
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-sm font-semibold mb-3">AR Created vs Collections (Monthly)</h3>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={cashflowData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 88%)" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                <YAxis tickFormatter={v => fmt(v)} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => fmt(v)} />
                <Legend />
                <Bar dataKey="contract_value" fill="hsl(152 60% 40%)" name="Contract Value" opacity={0.7} />
                <Bar dataKey="down_payments" fill="hsl(38 92% 50%)" name="Cash Day 1" />
                <Bar dataKey="total_collected" fill="hsl(200 70% 50%)" name="Collections" />
                <Line type="monotone" dataKey="net_ar_movement" stroke="hsl(0 84% 60%)" strokeWidth={2} name="Net AR Movement" dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Collection Coverage chart */}
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-sm font-semibold mb-3">Collection Coverage % (Collections / AR Created)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={cashflowData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 88%)" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                <YAxis tickFormatter={v => `${v}%`} tick={{ fontSize: 10 }} domain={[0, 200]} />
                <Tooltip formatter={(v: number) => `${Number(v).toFixed(1)}%`} />
                <Area type="monotone" dataKey="collection_coverage_pct" stroke="hsl(200 70% 50%)" fill="hsl(200 70% 50%)" fillOpacity={0.2} name="Coverage %" />
                {/* 100% reference line */}
                <Area type="monotone" dataKey={() => 100} stroke="hsl(0 0% 60%)" strokeDasharray="5 5" fill="none" name="100% target" />
              </AreaChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-2">Above 100% = collections outpacing new AR (book shrinking). Below 100% = AR growing.</p>
          </div>

          {/* Detailed table */}
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-sm font-semibold mb-3">Monthly AR Cashflow Detail</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead className="text-right">Cases</TableHead>
                    <TableHead className="text-right">Contract Value</TableHead>
                    <TableHead className="text-right">Avg Case</TableHead>
                    <TableHead className="text-right">Cash Day 1</TableHead>
                    <TableHead className="text-right">DP%</TableHead>
                    <TableHead className="text-right">AR Created</TableHead>
                    <TableHead className="text-right">Collected</TableHead>
                    <TableHead className="text-right">Net Movement</TableHead>
                    <TableHead>Trend</TableHead>
                    <TableHead className="text-right">Coll Cover</TableHead>
                    <TableHead className="text-right">Firm AR</TableHead>
                    <TableHead>Quality</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cashflowData.map((r: any, i: number) => {
                    const net = Number(r.net_ar_movement) || 0;
                    return (
                      <TableRow key={i} className={r.data_quality === 'migration_gap' ? 'bg-amber-50/50' : ''}>
                        <TableCell className="font-mono text-xs">{r.label}</TableCell>
                        <TableCell className="text-right font-mono">{Number(r.new_cases).toLocaleString()}</TableCell>
                        <TableCell className="text-right font-mono font-semibold">{fmt(r.contract_value)}</TableCell>
                        <TableCell className="text-right font-mono">{fmt(r.avg_contract)}</TableCell>
                        <TableCell className="text-right font-mono">{fmt(r.down_payments)}</TableCell>
                        <TableCell className="text-right font-mono">{pct(r.dp_pct)}</TableCell>
                        <TableCell className="text-right font-mono">{fmt(r.ar_created)}</TableCell>
                        <TableCell className="text-right font-mono">{fmt(r.total_collected)}</TableCell>
                        <TableCell className={`text-right font-mono font-semibold ${net < 0 ? 'text-green-600' : 'text-destructive'}`}>
                          {net < 0 ? '' : '+'}{fmt(net)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={r.ar_trend === 'Shrinking' ? 'secondary' : 'destructive'} className="text-[10px]">
                            {r.ar_trend}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono">{pct(r.collection_coverage_pct)}</TableCell>
                        <TableCell className="text-right font-mono">{fmt(r.ending_firm_ar)}</TableCell>
                        <TableCell>
                          <Badge variant={r.data_quality === 'complete' ? 'default' : r.data_quality === 'migration_gap' ? 'destructive' : 'secondary'} className="text-[9px]">
                            {r.data_quality}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        {/* ── TAB: Growth vs Collections ── */}
        <TabsContent value="growth" className="space-y-6">
          <div className="rounded-lg border bg-card p-4 mb-2">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Growth vs Collections</span> — are we replacing collected AR with new business, or is the book running off?
              Healthy AR shows collections reducing old balances while new contracts refill the pipeline.
            </p>
          </div>

          {/* Growth vs Collections chart */}
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-sm font-semibold mb-3">New Business vs Collections (Monthly)</h3>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={[...growthData].reverse().filter((r: any) => r.month)}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 88%)" />
                <XAxis dataKey="month" tickFormatter={v => String(v).slice(0, 7)} tick={{ fontSize: 10 }} />
                <YAxis tickFormatter={v => fmt(v)} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => fmt(v)} labelFormatter={v => String(v).slice(0, 7)} />
                <Legend />
                <Bar dataKey="new_contract_value" fill="hsl(152 60% 40%)" name="New Contract Value" />
                <Bar dataKey="total_collected" fill="hsl(200 70% 50%)" name="Collections" />
                <Bar dataKey="down_payments_received" fill="hsl(38 92% 50%)" name="Down Payments" />
                <Line type="monotone" dataKey="net_growth" stroke="hsl(0 84% 60%)" strokeWidth={2} name="Net Growth" dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Growth detail table */}
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-sm font-semibold mb-3">Monthly Growth Detail</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">New Contracts</TableHead>
                  <TableHead className="text-right">New Clients</TableHead>
                  <TableHead className="text-right">New Value</TableHead>
                  <TableHead className="text-right">Down Payments</TableHead>
                  <TableHead className="text-right">Collections</TableHead>
                  <TableHead className="text-right">Net Growth</TableHead>
                  <TableHead>Direction</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...growthData]
                  .reverse()
                  .filter((r: any) => r.month)
                  .map((r: any, i: number) => {
                    const net = Number(r.net_growth) || 0;
                    const direction = r.ar_direction;
                    return (
                      <TableRow key={i}>
                        <TableCell className="font-mono">{String(r.month).slice(0, 7)}</TableCell>
                        <TableCell className="text-right font-mono">{Number(r.new_contracts).toLocaleString()}</TableCell>
                        <TableCell className="text-right font-mono">{Number(r.new_clients).toLocaleString()}</TableCell>
                        <TableCell className="text-right font-mono font-semibold">{fmt(r.new_contract_value)}</TableCell>
                        <TableCell className="text-right font-mono">{fmt(r.down_payments_received)}</TableCell>
                        <TableCell className="text-right font-mono">{fmt(r.total_collected)}</TableCell>
                        <TableCell className={`text-right font-mono font-semibold ${net > 0 ? 'text-green-600' : 'text-destructive'}`}>
                          {net > 0 ? '+' : ''}{fmt(net)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={direction === 'GROWING' ? 'default' : direction === 'SHRINKING' ? 'secondary' : 'destructive'}
                            className="text-[10px]"
                          >
                            {direction}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ── TAB: Aging Buckets ── */}
        <TabsContent value="aging" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Current snapshot bar chart */}
            <div className="rounded-lg border bg-card p-4">
              <h3 className="text-sm font-semibold mb-3">AR by Commission Bucket (Latest Snapshot)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={agingChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 88%)" />
                  <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={v => fmt(v)} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v: number) => fmt(v)} />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]} name="Outstanding">
                    {agingChartData.map((entry, i) => (
                      <Cell key={i} fill={BUCKET_COLORS[entry.bucket] || "hsl(220 70% 50%)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Composition pie */}
            <div className="rounded-lg border bg-card p-4">
              <h3 className="text-sm font-semibold mb-3">Portfolio Composition</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={agingChartData.filter(d => d.amount > 0)} cx="50%" cy="50%"
                    innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="amount"
                    label={({ bucket, pct }) => `${bucket} (${pct.toFixed(0)}%)`}>
                    {agingChartData.filter(d => d.amount > 0).map((entry, i) => (
                      <Cell key={i} fill={BUCKET_COLORS[entry.bucket] || "#666"} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => fmt(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Snapshot trend stacked area */}
          {snapshotTrend.length > 1 && (
            <div className="rounded-lg border bg-card p-4">
              <h3 className="text-sm font-semibold mb-3">AR Aging Trend (Snapshot History)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={snapshotTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 88%)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tickFormatter={v => fmt(v)} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v: number) => fmt(v)} />
                  <Legend />
                  <Area type="monotone" dataKey="180+" stackId="1" fill={BUCKET_COLORS["180+"]} stroke={BUCKET_COLORS["180+"]} />
                  <Area type="monotone" dataKey="91-180" stackId="1" fill={BUCKET_COLORS["91-180"]} stroke={BUCKET_COLORS["91-180"]} />
                  <Area type="monotone" dataKey="61-90" stackId="1" fill={BUCKET_COLORS["61-90"]} stroke={BUCKET_COLORS["61-90"]} />
                  <Area type="monotone" dataKey="31-60" stackId="1" fill={BUCKET_COLORS["31-60"]} stroke={BUCKET_COLORS["31-60"]} />
                  <Area type="monotone" dataKey="1-30" stackId="1" fill={BUCKET_COLORS["1-30"]} stroke={BUCKET_COLORS["1-30"]} />
                  <Area type="monotone" dataKey="current" stackId="1" fill={BUCKET_COLORS["Current"]} stroke={BUCKET_COLORS["Current"]} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Bucket detail table */}
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-sm font-semibold mb-3">Commission Bucket Detail</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bucket</TableHead>
                  <TableHead className="text-right">Commission Rate</TableHead>
                  <TableHead className="text-right">Outstanding $</TableHead>
                  <TableHead className="text-right">% of AR</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agingChartData.map(row => (
                  <TableRow key={row.bucket}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: BUCKET_COLORS[row.bucket] }} />
                        {row.bucket} days
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{COMMISSION_RATES[row.bucket]}%</TableCell>
                    <TableCell className="text-right font-mono">{fmt(row.amount)}</TableCell>
                    <TableCell className="text-right font-mono">{row.pct.toFixed(1)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ── TAB: Installment View ── */}
        <TabsContent value="installments" className="space-y-6">
          <div className="rounded-lg border bg-card p-4 mb-2">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Installment View</span> — reads the same AR through the lens of payment plan completion.
              Where <em>Aging Buckets</em> asks "how overdue is this invoice?", this tab asks "how far along is the payment plan and does it even cover the contract?"
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Completion by delinquency stacked bar */}
            <div className="rounded-lg border bg-card p-4">
              <h3 className="text-sm font-semibold mb-3">Outstanding by Plan Completion</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={completionChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 88%)" />
                  <XAxis dataKey="tier" tick={{ fontSize: 10 }} />
                  <YAxis tickFormatter={v => fmt(v)} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v: number) => fmt(v)} />
                  <Legend />
                  <Bar dataKey="current" stackId="a" fill="hsl(152 60% 40%)" name="Current" />
                  <Bar dataKey="late" stackId="a" fill="hsl(38 92% 50%)" name="Late" />
                  <Bar dataKey="delinquent" stackId="a" fill="hsl(0 84% 60%)" name="Delinquent" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Maturity: scheduled vs outstanding vs gap */}
            <div className="rounded-lg border bg-card p-4">
              <h3 className="text-sm font-semibold mb-3">Maturity Timeline: Scheduled vs Outstanding</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={maturityChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 88%)" />
                  <XAxis dataKey="window" tick={{ fontSize: 10 }} />
                  <YAxis tickFormatter={v => fmt(v)} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v: number) => fmt(v)} />
                  <Legend />
                  <Bar dataKey="scheduled" fill="hsl(200 70% 50%)" name="Remaining Scheduled" />
                  <Bar dataKey="outstanding" fill="hsl(0 84% 60%)" name="Actual Outstanding" />
                  <Bar dataKey="gap" fill="hsl(38 92% 50%)" name="Plan Gap" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Plan completion detail table */}
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-sm font-semibold mb-3">Plan Completion Detail (Installment Lens)</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Completion Tier</TableHead>
                  <TableHead>Delinquency</TableHead>
                  <TableHead className="text-right">Contracts</TableHead>
                  <TableHead className="text-right">Outstanding</TableHead>
                  <TableHead className="text-right">Monthly Expected</TableHead>
                  <TableHead className="text-right">Avg Paid / Total</TableHead>
                  <TableHead className="text-right">Avg Days Out</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(instCompletion as any[])
                  .sort((a, b) => (Number(a.tier_ord) || 0) - (Number(b.tier_ord) || 0))
                  .map((r: any, i: number) => {
                    const isComplete = r.completion_tier?.includes("100%");
                    const isZero = r.completion_tier?.includes("0%");
                    return (
                      <TableRow key={i} className={isComplete ? "bg-orange-50 dark:bg-orange-950/20" : isZero ? "bg-destructive/5" : ""}>
                        <TableCell className="font-medium">{r.completion_tier}</TableCell>
                        <TableCell>
                          <Badge variant={r.delinquency_status === "Delinquent" ? "destructive" : r.delinquency_status === "Late" ? "secondary" : "outline"} className="text-[10px]">
                            {r.delinquency_status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono">{Number(r.contracts).toLocaleString()}</TableCell>
                        <TableCell className="text-right font-mono font-semibold">{fmt(r.outstanding)}</TableCell>
                        <TableCell className="text-right font-mono">{fmt(r.monthly_expected)}</TableCell>
                        <TableCell className="text-right font-mono text-xs">{r.avg_paid} / {r.avg_total}</TableCell>
                        <TableCell className="text-right font-mono">{r.avg_days_out || "-"}</TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>

          {/* Structural gap table */}
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-sm font-semibold mb-3">Structural Plan Gap (Fee Schedule Problem)</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Contracts where DP + (monthly x installments) is less than the contract value — the plan was never designed to cover the full amount.
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Gap Status</TableHead>
                  <TableHead>Plan Status</TableHead>
                  <TableHead>Delinquency</TableHead>
                  <TableHead className="text-right">Contracts</TableHead>
                  <TableHead className="text-right">Avg Contract Value</TableHead>
                  <TableHead className="text-right">Avg Plan Total</TableHead>
                  <TableHead className="text-right">Avg Gap / Contract</TableHead>
                  <TableHead className="text-right">Total Outstanding</TableHead>
                  <TableHead className="text-right">Total Structural Gap</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(instGap as any[])
                  .sort((a, b) => (Number(b.total_outstanding) || 0) - (Number(a.total_outstanding) || 0))
                  .map((r: any, i: number) => (
                    <TableRow key={i} className={r.gap_status?.includes("SHORT") ? "bg-orange-50 dark:bg-orange-950/20" : ""}>
                      <TableCell>
                        <Badge variant={r.gap_status?.includes("SHORT") ? "destructive" : "outline"} className="text-[10px]">
                          {r.gap_status}
                        </Badge>
                      </TableCell>
                      <TableCell>{r.plan_status}</TableCell>
                      <TableCell>
                        <Badge variant={r.delinquency_status === "Delinquent" ? "destructive" : r.delinquency_status === "Late" ? "secondary" : "outline"} className="text-[10px]">
                          {r.delinquency_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">{Number(r.contracts).toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono">{fmt(r.avg_value)}</TableCell>
                      <TableCell className="text-right font-mono">{fmt(r.avg_plan_total)}</TableCell>
                      <TableCell className="text-right font-mono text-destructive font-semibold">{fmt(r.avg_gap_per_contract)}</TableCell>
                      <TableCell className="text-right font-mono">{fmt(r.total_outstanding)}</TableCell>
                      <TableCell className="text-right font-mono font-semibold">{fmt(r.total_structural_gap)}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>

          {/* Installment tiers */}
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-sm font-semibold mb-3">Installment Amount Tiers</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tier</TableHead>
                  <TableHead className="text-right">Contracts</TableHead>
                  <TableHead className="text-right">Monthly Flow</TableHead>
                  <TableHead className="text-right">Outstanding</TableHead>
                  <TableHead className="text-right">Avg Days Out</TableHead>
                  <TableHead className="text-right">Current</TableHead>
                  <TableHead className="text-right">Delinquent</TableHead>
                  <TableHead className="text-right">Avg Completion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(instTiers as any[])
                  .sort((a, b) => (Number(a.tier_ord) || 0) - (Number(b.tier_ord) || 0))
                  .map((r: any, i: number) => (
                    <TableRow key={i} className={r.installment_tier?.includes("Legacy") ? "bg-orange-50 dark:bg-orange-950/20" : ""}>
                      <TableCell className="font-medium">{r.installment_tier}</TableCell>
                      <TableCell className="text-right font-mono">{Number(r.contracts).toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono font-semibold">{fmt(r.total_monthly)}</TableCell>
                      <TableCell className="text-right font-mono">{fmt(r.outstanding)}</TableCell>
                      <TableCell className="text-right font-mono">{r.avg_days_out}</TableCell>
                      <TableCell className="text-right font-mono">{Number(r.current_cnt).toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono text-destructive">{Number(r.delinquent_cnt).toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono">{r.avg_completion_pct}%</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ── TAB: Collections ── */}
        <TabsContent value="collections" className="space-y-6">
          {/* Collections by bucket stacked bar */}
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-sm font-semibold mb-3">Collections by Commission Bucket (Monthly)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bucketColByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 88%)" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tickFormatter={v => fmt(v)} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => fmt(v)} />
                <Legend />
                {BUCKET_ORDER.map(b => (
                  <Bar key={b} dataKey={b} stackId="a" fill={BUCKET_COLORS[b]} name={`${b}d`} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Collector performance table */}
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-sm font-semibold mb-3">Collector Performance (Recent Months)</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Collector</TableHead>
                  <TableHead className="text-right">Activities</TableHead>
                  <TableHead className="text-right">Clients</TableHead>
                  <TableHead className="text-right">$ Collected</TableHead>
                  <TableHead className="text-right">$/Activity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {collectorMonths.flatMap(m =>
                  (m.collectors as any[])
                    .sort((a: any, b: any) => (Number(b.collected) || 0) - (Number(a.collected) || 0))
                    .slice(0, 6)
                    .map((c: any, i: number) => (
                      <TableRow key={`${m.month}-${c.collector}-${i}`}>
                        <TableCell className="text-xs">{m.month}</TableCell>
                        <TableCell>
                          <Badge variant={c.collector === "System-Auto" ? "secondary" : "outline"} className="text-[10px]">
                            {c.collector}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono">{Number(c.activities).toLocaleString()}</TableCell>
                        <TableCell className="text-right font-mono">{Number(c.unique_clients).toLocaleString()}</TableCell>
                        <TableCell className="text-right font-mono">{fmt(c.collected)}</TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          {Number(c.activities) > 0 ? fmt(Number(c.collected) / Number(c.activities)) : "-"}
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ── TAB: Auto-Pay & Forecast ── */}
        <TabsContent value="autopay" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Monthly collections: auto vs other */}
            <div className="rounded-lg border bg-card p-4">
              <h3 className="text-sm font-semibold mb-3">Monthly Collections (Auto-Pay vs Other)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={[...monthlyCol].reverse()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 88%)" />
                  <XAxis dataKey="month" tickFormatter={v => String(v).slice(0, 7)} tick={{ fontSize: 10 }} />
                  <YAxis tickFormatter={v => fmt(v)} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v: number) => fmt(v)} labelFormatter={v => String(v).slice(0, 7)} />
                  <Legend />
                  <Bar dataKey="auto_pay_amount" fill="hsl(152 60% 40%)" name="Auto-Pay" stackId="a" />
                  <Bar dataKey="installment_amount" fill="hsl(200 70% 50%)" name="Installments" stackId="a" />
                  <Bar dataKey="backfill_amount" fill="hsl(38 92% 50%)" name="Backfill" stackId="a" />
                  <Line type="monotone" dataKey="total_collected" stroke="hsl(0 0% 20%)" strokeWidth={2} dot={false} name="Total" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Installment collection rate */}
            <div className="rounded-lg border bg-card p-4">
              <h3 className="text-sm font-semibold mb-3">Installment Collection Rate</h3>
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={[...installRate].reverse()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 88%)" />
                  <XAxis dataKey="month" tickFormatter={v => String(v).slice(0, 7)} tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="left" tickFormatter={v => fmt(v)} tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="right" orientation="right" tickFormatter={v => `${v}%`} tick={{ fontSize: 10 }} domain={[0, 100]} />
                  <Tooltip formatter={(v: number, name: string) => name === "Collection %" ? `${v}%` : fmt(v)} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="expected_amount" fill="hsl(220 13% 88%)" name="Expected" />
                  <Bar yAxisId="left" dataKey="actual_amount" fill="hsl(152 60% 40%)" name="Actual" />
                  <Line yAxisId="right" type="monotone" dataKey="collection_rate_pct" stroke="hsl(0 84% 60%)" strokeWidth={2} name="Collection %" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Forecast by contract status */}
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-sm font-semibold mb-3">Auto-Pay Forecast by Contract Status</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Delinquency</TableHead>
                  <TableHead className="text-right">Contracts</TableHead>
                  <TableHead className="text-right">With Installment</TableHead>
                  <TableHead className="text-right">Monthly Expected</TableHead>
                  <TableHead className="text-right">Outstanding</TableHead>
                  <TableHead className="text-right">Avg Installment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(autopayFcst as any[])
                  .sort((a, b) => (Number(b.total_monthly_expected) || 0) - (Number(a.total_monthly_expected) || 0))
                  .map((r: any, i: number) => (
                    <TableRow key={i}>
                      <TableCell>{r.contract_status}</TableCell>
                      <TableCell>
                        <Badge variant={r.delinquency_status === "Delinquent" ? "destructive" : r.delinquency_status === "Late" ? "secondary" : "outline"} className="text-[10px]">
                          {r.delinquency_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">{Number(r.contracts).toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono">{Number(r.with_installment).toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono font-semibold">{fmt(r.total_monthly_expected)}</TableCell>
                      <TableCell className="text-right font-mono">{fmt(r.outstanding)}</TableCell>
                      <TableCell className="text-right font-mono">{fmt(r.avg_installment)}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ── TAB: Delinquent Exposure ── */}
        <TabsContent value="delinquent" className="space-y-6">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-sm font-semibold mb-3">Delinquent Exposure by Contact Status</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Delinquency</TableHead>
                  <TableHead>Contact Status</TableHead>
                  <TableHead className="text-right">Contracts</TableHead>
                  <TableHead className="text-right">Outstanding</TableHead>
                  <TableHead className="text-right">Avg Days Out</TableHead>
                  <TableHead className="text-right">Monthly Expected</TableHead>
                  <TableHead className="text-right">$ Collected via Activities</TableHead>
                  <TableHead className="text-right">Recovery Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(delinqExpo as any[])
                  .sort((a, b) => (Number(b.outstanding) || 0) - (Number(a.outstanding) || 0))
                  .map((r: any, i: number) => {
                    const outstanding = Number(r.outstanding) || 0;
                    const collected = Number(r.collected_via_activities) || 0;
                    const recovery = outstanding + collected > 0 ? collected / (outstanding + collected) * 100 : 0;
                    const isUntouched = r.contact_status === "Never Contacted" && r.delinquency_status !== "Current";
                    return (
                      <TableRow key={i} className={isUntouched ? "bg-destructive/5" : ""}>
                        <TableCell>
                          <Badge variant={r.delinquency_status === "Delinquent" ? "destructive" : r.delinquency_status === "Late" ? "secondary" : "outline"}>
                            {r.delinquency_status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={r.contact_status === "Never Contacted" ? "destructive" : r.contact_status === "Active Contact" ? "default" : "secondary"} className="text-[10px]">
                            {r.contact_status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono">{Number(r.contracts).toLocaleString()}</TableCell>
                        <TableCell className="text-right font-mono font-semibold">{fmt(outstanding)}</TableCell>
                        <TableCell className="text-right font-mono">{r.avg_days_out || "-"}</TableCell>
                        <TableCell className="text-right font-mono">{fmt(r.monthly_installment_expected)}</TableCell>
                        <TableCell className="text-right font-mono">{fmt(collected)}</TableCell>
                        <TableCell className="text-right font-mono">{recovery.toFixed(1)}%</TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>

          {/* Contract portfolio by bucket */}
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-sm font-semibold mb-3">Contract Portfolio by Commission Bucket</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bucket</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Contracts</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="text-right">Collected</TableHead>
                  <TableHead className="text-right">Outstanding</TableHead>
                  <TableHead className="text-right">Monthly Expected</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(bucketContr as any[])
                  .sort((a, b) => (Number(a.bucket_ord) || 0) - (Number(b.bucket_ord) || 0) || (Number(b.outstanding) || 0) - (Number(a.outstanding) || 0))
                  .map((r: any, i: number) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: BUCKET_COLORS[r.bucket] || "#666" }} />
                          {r.bucket}
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{r.status}</Badge></TableCell>
                      <TableCell className="text-right font-mono">{Number(r.contracts).toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono">{fmt(r.total_value)}</TableCell>
                      <TableCell className="text-right font-mono">{fmt(r.total_collected)}</TableCell>
                      <TableCell className="text-right font-mono font-semibold">{fmt(r.outstanding)}</TableCell>
                      <TableCell className="text-right font-mono">{fmt(r.monthly_expected)}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ── TAB: Automation Clients ── */}
        <TabsContent value="automation" className="space-y-6">
          <div className="rounded-lg border bg-card p-4 mb-2">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-4 w-4 text-orange-500" />
              <span className="font-semibold text-foreground text-sm">Automation Clients</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Clients flagged for proactive outreach based on payment behavior triggers. Each row includes the rationale for why outreach is needed.
            </p>
          </div>

          {/* Summary cards per trigger */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            {(autoSummary as any[]).map((s: any, i: number) => {
              const labels: Record<string, string> = {
                'NEVER_PAID': 'Never Paid',
                'NO_PAYMENT_90_PLUS': 'No Payment 90+d',
                'NO_PAYMENT_60_PLUS': 'No Payment 60+d',
                'MISSED_INSTALLMENT': 'Missed Installment',
                'PLAN_COMPLETE_BALANCE_DUE': 'Plan Complete, Owes',
              };
              const colors: Record<string, string> = {
                'NEVER_PAID': 'text-destructive',
                'NO_PAYMENT_90_PLUS': 'text-destructive',
                'NO_PAYMENT_60_PLUS': 'text-orange-600',
                'MISSED_INSTALLMENT': 'text-orange-500',
                'PLAN_COMPLETE_BALANCE_DUE': 'text-blue-600',
              };
              return (
                <div key={i} className="rounded-lg border bg-card p-3 cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => setAutoFilter(s.trigger_type === autoFilter ? 'all' : s.trigger_type)}>
                  <p className="text-xs font-medium text-muted-foreground">{labels[s.trigger_type] || s.trigger_type}</p>
                  <p className={`text-lg font-bold ${colors[s.trigger_type] || ''}`}>{Number(s.contracts).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{fmt(s.total_outstanding)} outstanding</p>
                </div>
              );
            })}
          </div>

          {/* Search + filter */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by client name..."
                value={autoSearch}
                onChange={e => setAutoSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={autoFilter} onValueChange={setAutoFilter}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="All triggers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Triggers</SelectItem>
                <SelectItem value="NEVER_PAID">Never Paid</SelectItem>
                <SelectItem value="NO_PAYMENT_90_PLUS">No Payment 90+d</SelectItem>
                <SelectItem value="NO_PAYMENT_60_PLUS">No Payment 60+d</SelectItem>
                <SelectItem value="MISSED_INSTALLMENT">Missed Installment</SelectItem>
                <SelectItem value="PLAN_COMPLETE_BALANCE_DUE">Plan Complete, Owes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Client table */}
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">
                Automation Queue ({
                  (autoClients as any[]).filter((r: any) => {
                    const matchSearch = !autoSearch || (r.client_name || '').toLowerCase().includes(autoSearch.toLowerCase());
                    const matchFilter = autoFilter === 'all' || r.trigger_type === autoFilter;
                    return matchSearch && matchFilter && r.trigger_type;
                  }).length
                } clients)
              </h3>
            </div>
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky top-0 bg-card">Trigger</TableHead>
                    <TableHead className="sticky top-0 bg-card">Client</TableHead>
                    <TableHead className="sticky top-0 bg-card text-right">Outstanding</TableHead>
                    <TableHead className="sticky top-0 bg-card text-right">Installment</TableHead>
                    <TableHead className="sticky top-0 bg-card text-right">Plan Progress</TableHead>
                    <TableHead className="sticky top-0 bg-card text-right">Days Since Pay</TableHead>
                    <TableHead className="sticky top-0 bg-card text-right">Days Since Contact</TableHead>
                    <TableHead className="sticky top-0 bg-card min-w-[300px]">Rationale</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(autoClients as any[])
                    .filter((r: any) => {
                      const matchSearch = !autoSearch || (r.client_name || '').toLowerCase().includes(autoSearch.toLowerCase());
                      const matchFilter = autoFilter === 'all' || r.trigger_type === autoFilter;
                      return matchSearch && matchFilter && r.trigger_type;
                    })
                    .slice(0, 200)
                    .map((r: any, i: number) => {
                      const triggerLabels: Record<string, string> = {
                        'NEVER_PAID': 'Never Paid',
                        'NO_PAYMENT_90_PLUS': '90+d No Pay',
                        'NO_PAYMENT_60_PLUS': '60+d No Pay',
                        'MISSED_INSTALLMENT': 'Missed Install.',
                        'PLAN_COMPLETE_BALANCE_DUE': 'Plan Done, Owes',
                      };
                      const triggerVariants: Record<string, "destructive" | "secondary" | "outline" | "default"> = {
                        'NEVER_PAID': 'destructive',
                        'NO_PAYMENT_90_PLUS': 'destructive',
                        'NO_PAYMENT_60_PLUS': 'secondary',
                        'MISSED_INSTALLMENT': 'secondary',
                        'PLAN_COMPLETE_BALANCE_DUE': 'outline',
                      };
                      return (
                        <TableRow key={i}>
                          <TableCell>
                            <Badge variant={triggerVariants[r.trigger_type] || 'outline'} className="text-[10px] whitespace-nowrap">
                              {triggerLabels[r.trigger_type] || r.trigger_type}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium text-sm">{r.client_name}</TableCell>
                          <TableCell className="text-right font-mono font-semibold">{fmt(r.outstanding)}</TableCell>
                          <TableCell className="text-right font-mono">{fmt(r.monthly_installment)}/mo</TableCell>
                          <TableCell className="text-right font-mono text-xs">{r.installments_paid}/{r.total_installments}</TableCell>
                          <TableCell className="text-right font-mono">
                            {r.days_since_payment != null ? (
                              <span className={Number(r.days_since_payment) > 90 ? 'text-destructive font-semibold' : Number(r.days_since_payment) > 45 ? 'text-orange-600' : ''}>
                                {r.days_since_payment}d
                              </span>
                            ) : <span className="text-destructive font-semibold">Never</span>}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs">
                            {r.days_since_contact != null ? `${r.days_since_contact}d` : 'Never'}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-[350px]">{r.rationale}</TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default ControllerAROversightDashboard;
