import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAllRows } from "@/hooks/useSupabaseData";
import { Sparkline, Delta, HeatCell, BarCell } from "@/components/collections/MiniViz";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  format, subMonths, startOfMonth, endOfMonth, startOfWeek, addWeeks, isAfter,
} from "date-fns";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, ReferenceLine,
} from "recharts";
import { DollarSign, TrendingUp, Percent, AlertTriangle, Activity, ArrowUpRight, ArrowDownRight, Printer, ChevronRight } from "lucide-react";

const AGING_BUCKETS = [
  { key: "current", label: "Current", max: 0 },
  { key: "1-30", label: "1-30", max: 30 },
  { key: "31-60", label: "31-60", max: 60 },
  { key: "61-90", label: "61-90", max: 90 },
  { key: "90+", label: "90+", max: Infinity },
];

function bucketFor(days: number) {
  if (days <= 0) return "current";
  if (days <= 30) return "1-30";
  if (days <= 60) return "31-60";
  if (days <= 90) return "61-90";
  return "90+";
}

function fmtMoney(n: number) {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${Math.round(n).toLocaleString()}`;
}

function monthOptions(count = 6) {
  const now = new Date();
  return Array.from({ length: count }).map((_, i) => {
    const d = subMonths(now, i);
    return {
      label: format(d, "MMMM yyyy"),
      value: format(d, "yyyy-MM"),
      from: startOfMonth(d),
      to: endOfMonth(d),
    };
  });
}

function useInsightsData() {
  return useQuery({
    queryKey: ["admin-insights-v1"],
    queryFn: async () => {
      const [ar, payments] = await Promise.all([
        fetchAllRows<any>("ar_dashboard"),
        fetchAllRows<any>("payments_clean"),
      ]);
      return { ar, payments };
    },
    staleTime: 5 * 60 * 1000,
  });
}

export default function ExecutiveInsights() {
  const [monthVal, setMonthVal] = useState(format(new Date(), "yyyy-MM"));
  const months = monthOptions(6);
  const { data, isLoading } = useInsightsData();

  const view = useMemo(() => {
    if (!data) return null;
    const ar = data.ar.filter((r: any) => r.delinquency_status !== "Paid");
    const payments = data.payments;

    // ---------- Weekly collections (8w sparkline) ----------
    const weeks: { key: string; total: number }[] = [];
    const now = new Date();
    for (let i = 7; i >= 0; i--) {
      const ws = startOfWeek(addWeeks(now, -i), { weekStartsOn: 1 });
      weeks.push({ key: format(ws, "yyyy-MM-dd"), total: 0 });
    }
    const weekMap = new Map(weeks.map((w) => [w.key, w]));
    payments.forEach((p: any) => {
      if (!p.payment_date) return;
      const ws = format(startOfWeek(new Date(p.payment_date), { weekStartsOn: 1 }), "yyyy-MM-dd");
      if (weekMap.has(ws)) weekMap.get(ws)!.total += Number(p.amount) || 0;
    });
    const weeklySeries = weeks.map((w) => w.total);

    // ---------- Monthly aggregates for selected month vs prior ----------
    const monthAggs: Record<string, { collected: number; count: number }> = {};
    payments.forEach((p: any) => {
      const m = (p.payment_date || "").substring(0, 7);
      if (!m) return;
      monthAggs[m] = monthAggs[m] || { collected: 0, count: 0 };
      monthAggs[m].collected += Number(p.amount) || 0;
      monthAggs[m].count += 1;
    });
    const prevMonth = format(subMonths(new Date(monthVal + "-01"), 1), "yyyy-MM");
    const curr = monthAggs[monthVal] || { collected: 0, count: 0 };
    const prev = monthAggs[prevMonth] || { collected: 0, count: 0 };

    // last 8 months sparkline of collections
    const collSpark: number[] = [];
    for (let i = 7; i >= 0; i--) {
      const m = format(subMonths(new Date(monthVal + "-01"), i), "yyyy-MM");
      collSpark.push(monthAggs[m]?.collected || 0);
    }

    // ---------- AR totals ----------
    const totalAR = ar.reduce((s: number, r: any) => s + (Number(r.remaining_balance) || 0), 0);
    const atRisk = ar
      .filter((r: any) => (Number(r.days_past_due) || 0) > 60)
      .reduce((s: number, r: any) => s + (Number(r.remaining_balance) || 0), 0);

    // Avg DSO (weighted)
    const dsoNumerator = ar.reduce(
      (s: number, r: any) => s + (Number(r.remaining_balance) || 0) * (Number(r.days_past_due) || 0),
      0,
    );
    const dso = totalAR > 0 ? Math.round(dsoNumerator / totalAR) : 0;

    // ---------- Top 10 AR concentration ----------
    const byClient: Record<string, { name: string; balance: number; days: number; collector: string }> = {};
    ar.forEach((r: any) => {
      const name = r.client_name || "Unknown";
      if (!byClient[name]) byClient[name] = { name, balance: 0, days: 0, collector: r.collector || "Unassigned" };
      byClient[name].balance += Number(r.remaining_balance) || 0;
      byClient[name].days = Math.max(byClient[name].days, Number(r.days_past_due) || 0);
    });
    const topClients = Object.values(byClient)
      .sort((a, b) => b.balance - a.balance)
      .slice(0, 10);
    const top10Total = topClients.reduce((s, c) => s + c.balance, 0);
    const top10Pct = totalAR > 0 ? (top10Total / totalAR) * 100 : 0;

    // ---------- Aging × Collector heatmap ----------
    const collectorBuckets: Record<string, Record<string, number>> = {};
    ar.forEach((r: any) => {
      const c = r.collector || "Unassigned";
      const bal = Number(r.remaining_balance) || 0;
      if (bal <= 0) return;
      const b = bucketFor(Number(r.days_past_due) || 0);
      collectorBuckets[c] = collectorBuckets[c] || {};
      collectorBuckets[c][b] = (collectorBuckets[c][b] || 0) + bal;
    });
    const collectorRows = Object.entries(collectorBuckets)
      .map(([collector, buckets]) => ({
        collector,
        buckets,
        total: AGING_BUCKETS.reduce((s, b) => s + (buckets[b.key] || 0), 0),
      }))
      .sort((a, b) => b.total - a.total);
    const heatMax = Math.max(
      1,
      ...collectorRows.flatMap((r) => AGING_BUCKETS.map((b) => r.buckets[b.key] || 0)),
    );

    // ---------- Money flow (waterfall) for selected month ----------
    const monthStart = startOfMonth(new Date(monthVal + "-01"));
    const monthEnd = endOfMonth(monthStart);
    const arAddedThisMonth = ar
      .filter((r: any) => {
        const d = r.start_date ? new Date(r.start_date) : null;
        return d && d >= monthStart && d <= monthEnd;
      })
      .reduce((s: number, r: any) => s + (Number(r.total_contract_value) || 0), 0);
    const collectedMonth = curr.collected;
    const openingAR = totalAR + collectedMonth - arAddedThisMonth;
    const waterfall = [
      { name: "Opening AR", value: openingAR, type: "balance" },
      { name: "+ New AR", value: arAddedThisMonth, type: "pos" },
      { name: "− Collected", value: -collectedMonth, type: "neg" },
      { name: "Closing AR", value: totalAR, type: "balance" },
    ];

    return {
      weeklySeries,
      collSpark,
      curr,
      prev,
      totalAR,
      atRisk,
      dso,
      topClients,
      top10Total,
      top10Pct,
      collectorRows,
      heatMax,
      waterfall,
    };
  }, [data, monthVal]);

  if (isLoading || !view) {
    return <div className="p-6 text-center text-sm text-muted-foreground">Loading executive insights…</div>;
  }

  const sections = [
    { id: "hero", label: "Executive" },
    { id: "flow", label: "Money Flow" },
    { id: "concentration", label: "Concentration" },
    { id: "aging", label: "Aging × Collector" },
  ];

  return (
    <div className="space-y-6">
      {/* Sticky section nav + month picker */}
      <div className="sticky top-0 z-20 -mx-4 flex flex-wrap items-center gap-2 border-b bg-background/95 px-4 py-2 backdrop-blur print:hidden">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Insights</span>
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="rounded-md border px-2 py-1 text-xs hover:bg-muted"
          >
            {s.label}
          </a>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Period</span>
          <Select value={monthVal} onValueChange={setMonthVal}>
            <SelectTrigger className="h-8 w-[180px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m.value} value={m.value} className="text-xs">
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            onClick={() => window.print()}
            className="rounded-md border px-2 py-1 text-xs hover:bg-muted"
          >
            Print
          </button>
        </div>
      </div>

      {/* HERO KPI STRIP */}
      <section id="hero" className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <HeroKpi
          label="Total AR"
          value={fmtMoney(view.totalAR)}
          icon={<DollarSign className="h-4 w-4" />}
          spark={view.weeklySeries}
        />
        <HeroKpi
          label={`Collected · ${format(new Date(monthVal + "-01"), "MMM")}`}
          value={fmtMoney(view.curr.collected)}
          icon={<TrendingUp className="h-4 w-4" />}
          spark={view.collSpark}
          delta={<Delta prev={view.prev.collected} curr={view.curr.collected} />}
        />
        <HeroKpi
          label="Collection Coverage"
          value={`${view.totalAR > 0 ? Math.round((view.curr.collected / view.totalAR) * 100) : 0}%`}
          icon={<Percent className="h-4 w-4" />}
          spark={view.collSpark}
        />
        <HeroKpi
          label="Avg DSO (weighted)"
          value={`${view.dso}d`}
          icon={<Activity className="h-4 w-4" />}
          accent={view.dso > 60 ? "warn" : "ok"}
        />
        <HeroKpi
          label="AR At Risk (60+)"
          value={fmtMoney(view.atRisk)}
          icon={<AlertTriangle className="h-4 w-4" />}
          accent="warn"
        />
      </section>

      {/* MONEY FLOW */}
      <section id="flow" className="dashboard-section scroll-mt-20">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Money Flow — {format(new Date(monthVal + "-01"), "MMMM yyyy")}</h2>
          <span className="text-xs text-muted-foreground">Opening AR → New AR → Collections → Closing AR</span>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={view.waterfall} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => fmtMoney(v)} />
            <Tooltip formatter={(v: number) => fmtMoney(Math.abs(v))} />
            <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {view.waterfall.map((d, i) => (
                <Cell
                  key={i}
                  fill={
                    d.type === "pos"
                      ? "hsl(var(--destructive))"
                      : d.type === "neg"
                        ? "hsl(152 60% 40%)"
                        : "hsl(var(--primary))"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="mt-2 text-xs text-muted-foreground">
          Net AR change:{" "}
          <span className={view.waterfall[1].value - Math.abs(view.waterfall[2].value) >= 0 ? "text-destructive" : "text-success"}>
            {fmtMoney(view.waterfall[1].value + view.waterfall[2].value)}
          </span>
        </p>
      </section>

      {/* CONCENTRATION */}
      <section id="concentration" className="dashboard-section scroll-mt-20">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Top 10 AR Concentration</h2>
          <Badge variant="outline" className="text-xs">
            Top 10 = {fmtMoney(view.top10Total)} ({view.top10Pct.toFixed(1)}% of AR)
          </Badge>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase text-muted-foreground">
              <th className="pb-2 font-medium">#</th>
              <th className="pb-2 font-medium">Client</th>
              <th className="pb-2 font-medium">Collector</th>
              <th className="pb-2 font-medium">Days Out</th>
              <th className="pb-2 font-medium">Balance vs Top</th>
            </tr>
          </thead>
          <tbody>
            {view.topClients.map((c, i) => (
              <tr key={c.name} className="border-b last:border-0">
                <td className="py-2 font-mono text-xs text-muted-foreground">{i + 1}</td>
                <td className="py-2 font-medium">{c.name}</td>
                <td className="py-2 text-xs text-muted-foreground">{c.collector}</td>
                <td className="py-2">
                  <Badge variant={c.days > 60 ? "destructive" : c.days > 30 ? "secondary" : "outline"} className="text-[10px]">
                    {c.days}d
                  </Badge>
                </td>
                <td className="py-2">
                  <BarCell value={c.balance} max={view.topClients[0]?.balance || 1} format={fmtMoney} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* AGING × COLLECTOR HEATMAP */}
      <section id="aging" className="dashboard-section scroll-mt-20">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Aging × Collector — AR Balance Heatmap</h2>
          <span className="text-xs text-muted-foreground">Shading scales with $ exposure per cell</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                <th className="px-3 py-2 font-medium">Collector</th>
                {AGING_BUCKETS.map((b) => (
                  <th key={b.key} className="px-3 py-2 text-right font-medium">{b.label}</th>
                ))}
                <th className="px-3 py-2 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {view.collectorRows.map((row) => (
                <tr key={row.collector} className="border-b last:border-0">
                  <td className="px-3 py-2 font-medium">{row.collector}</td>
                  {AGING_BUCKETS.map((b) => (
                    <HeatCell key={b.key} value={row.buckets[b.key] || 0} max={view.heatMax}>
                      <span className="block text-right">{(row.buckets[b.key] || 0) > 0 ? fmtMoney(row.buckets[b.key]) : "—"}</span>
                    </HeatCell>
                  ))}
                  <td className="px-3 py-2 text-right font-mono font-semibold tabular-nums">{fmtMoney(row.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function HeroKpi({
  label,
  value,
  icon,
  spark,
  delta,
  accent,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  spark?: number[];
  delta?: React.ReactNode;
  accent?: "ok" | "warn";
}) {
  const border =
    accent === "warn" ? "border-l-4 border-l-destructive" : accent === "ok" ? "border-l-4 border-l-secondary" : "";
  return (
    <Card className={`p-3 ${border}`}>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span className="text-muted-foreground/70">{icon}</span>
      </div>
      <div className="mt-1 text-2xl font-bold tabular-nums">{value}</div>
      <div className="mt-1 flex items-center justify-between">
        {spark ? <Sparkline values={spark} width={100} height={20} /> : <span />}
        {delta || <span />}
      </div>
    </Card>
  );
}