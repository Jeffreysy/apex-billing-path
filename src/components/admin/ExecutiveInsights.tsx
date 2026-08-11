import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAllRows, useActivityCollectedByCollectorWeekly, certifiedCollectedByCollector } from "@/hooks/useSupabaseData";
import { Sparkline, HeatCell } from "@/components/collections/MiniViz";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  format, subMonths, startOfMonth, endOfMonth, startOfWeek, addWeeks,
} from "date-fns";
import {
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie,
} from "recharts";
import { ArrowUpRight, ArrowDownRight, Printer } from "lucide-react";

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

// Parse "YYYY-MM" as a local date (avoids UTC shift that bumps May→April in negative offsets)
function monthValToDate(monthVal: string): Date {
  const [y, m] = monthVal.split("-").map(Number);
  return new Date(y, (m || 1) - 1, 1);
}

function useInsightsData() {
  return useQuery({
    queryKey: ["admin-insights-v2"],
    queryFn: async () => {
      const [ar, payments, activities, firmSummaryRows] = await Promise.all([
        // Stable ORDER BY on a unique key is REQUIRED: fetchAllRows paginates via .range()
        // (LIMIT/OFFSET). Without a deterministic sort, PostgREST can skip/duplicate rows
        // across pages, silently under-counting large tables — payments_clean (~19k) and
        // collection_activities (~42k) were losing ~40-60% of rows, halving month totals.
        fetchAllRows<any>("ar_dashboard", { orderBy: "invoice_number" }),
        fetchAllRows<any>("payments_clean", { orderBy: "id" }),
        fetchAllRows<any>("collection_activities", { orderBy: "id" }),
        // VP-certified firm-wide snapshot (single row) — authoritative month new-AR source.
        fetchAllRows<any>("v_firm_financial_summary"),
      ]);
      return { ar, payments, activities, firmSummary: firmSummaryRows?.[0] ?? null };
    },
    staleTime: 5 * 60 * 1000,
  });
}

export default function ExecutiveInsights() {
  const [monthVal, setMonthVal] = useState(format(new Date(), "yyyy-MM"));
  const months = monthOptions(6);
  const { data, isLoading } = useInsightsData();
  // Certified per-collector cash (v_activity_collected_by_collector_weekly) — replaces the raw
  // SUM(collection_activities.collected_amount) in the collector table below.
  const { data: byCollectorWeeks = [] } = useActivityCollectedByCollectorWeekly();

  const view = useMemo(() => {
    if (!data) return null;
    // AR universe = every ar_dashboard row (all carry amount_due > 0 and excluded_from_ar = false).
    // Do NOT drop delinquency_status = 'Paid': client-ar + VP LOCKED that the 31 "Paid"-but-open
    // rows are REAL AR ($104,050, $0 actually paid off) — "Paid" is a stale contracts-table label
    // bled in via the unreliable invoice_number join. Filtering them understated AR by ~$104K.
    const ar = data.ar;
    const payments = data.payments;
    const activities = data.activities || [];

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
    const prevMonth = format(subMonths(monthValToDate(monthVal), 1), "yyyy-MM");
    const curr = monthAggs[monthVal] || { collected: 0, count: 0 };
    const prev = monthAggs[prevMonth] || { collected: 0, count: 0 };

    // MTD-vs-MTD: when the selected month is the current (incomplete) month, compare only
    // through today's day-of-month in the prior month, so the delta pill isn't partial-vs-full.
    const isCurrentMonth = monthVal === format(new Date(), "yyyy-MM");
    const cutoffDay = new Date().getDate();
    let prevComparable = prev.collected;
    if (isCurrentMonth) {
      prevComparable = 0;
      payments.forEach((p: any) => {
        const ds = (p.payment_date || "").substring(0, 10); // YYYY-MM-DD
        if (ds.substring(0, 7) !== prevMonth) return;
        const day = Number(ds.substring(8, 10));
        if (day && day <= cutoffDay) prevComparable += Number(p.amount) || 0;
      });
    }

    // last 8 months sparkline of collections
    const collSpark: number[] = [];
    for (let i = 7; i >= 0; i--) {
      const m = format(subMonths(monthValToDate(monthVal), i), "yyyy-MM");
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
    const monthStart = startOfMonth(monthValToDate(monthVal));
    const monthEnd = endOfMonth(monthStart);
    const startDateAdded = ar
      .filter((r: any) => {
        const d = r.start_date ? new Date(r.start_date) : null;
        return d && d >= monthStart && d <= monthEnd;
      })
      .reduce((s: number, r: any) => s + (Number(r.total_contract_value) || 0), 0);
    // New AR: for the CURRENT month, read the VP-certified live-snapshot additions
    // (v_firm_financial_summary.ar_additions). ar_dashboard.start_date comes from the frozen
    // aging file and is structurally ~$0, so it undercounts real new AR. Past months have no
    // month-keyed certified source, so they fall back to the start_date calc (unchanged).
    const firmSummary = (data as any).firmSummary;
    // Canonical Total AR = v_firm_financial_summary.ar_total (VP-certified LIVE anchor — re-pins
    // as new AR snapshots land; $18,012,092.68 as of the 08-05 anchor, incl-"Paid" basis). Fall back to the row-sum
    // only if the certified row is unavailable, so the AR tile never renders empty.
    const arTotalCertified = firmSummary && firmSummary.ar_total != null ? Number(firmSummary.ar_total) || 0 : totalAR;
    const arAddedThisMonth =
      isCurrentMonth && firmSummary && firmSummary.ar_additions != null
        ? Number(firmSummary.ar_additions) || 0
        : startDateAdded;
    const collectedMonth = curr.collected;
    // Money-flow decomposition. For the CURRENT month, use the VP-certified month movement
    // from v_firm_financial_summary (additions / reductions / net) so the card matches the
    // firm's official AR movement (Aug: additions $166,368 − reductions $251,590 = −$85,222)
    // instead of an incommensurate "new AR − MTD cash" figure that would read as growth.
    // "Reductions" include collections + write-offs/adjustments, so it legitimately differs
    // from the cash-basis "Collected" hero tile. Past months fall back to the cash-basis
    // identity (mathematically identical to the prior behavior).
    const certifiedMovement = isCurrentMonth && firmSummary && firmSummary.ar_net_movement != null;
    const reductionsMonth = certifiedMovement ? Number(firmSummary.ar_reductions) || 0 : collectedMonth;
    const netMovement = certifiedMovement
      ? Number(firmSummary.ar_net_movement) || 0
      : arAddedThisMonth - reductionsMonth;
    const openingAR = arTotalCertified - netMovement;
    const waterfall = [
      { name: "Opening AR", value: openingAR, type: "balance" },
      { name: "+ New AR", value: arAddedThisMonth, type: "pos" },
      { name: certifiedMovement ? "− Reductions" : "− Collected", value: -reductionsMonth, type: "neg" },
      { name: "Closing AR", value: arTotalCertified, type: "balance" },
    ];

    // ---------- Collector time & activity (selected month) ----------
    const inMonth = (d: string | null | undefined) => {
      if (!d) return false;
      const dt = new Date(d);
      return dt >= monthStart && dt <= monthEnd;
    };
    const failedOutcomes = ["failed", "refund", "disputed", "disconnected", "no collection"];
    const isFailedOutcome = (o: string | null) => {
      const v = (o || "").toLowerCase().trim();
      return failedOutcomes.some((x) => v.includes(x));
    };

    const collectorActivity: Record<
      string,
      { collector: string; minutes: number; activities: number; payments: number; collected: number; commission: number; failed: number }
    > = {};
    const failedList: any[] = [];

    activities.forEach((a: any) => {
      if (!inMonth(a.activity_date)) return;
      if (a.is_junk) return;
      const c = a.collector || "Unassigned";
      collectorActivity[c] = collectorActivity[c] || {
        collector: c, minutes: 0, activities: 0, payments: 0, collected: 0, commission: 0, failed: 0,
      };
      const row = collectorActivity[c];
      row.activities += 1;
      // A single activity's logged duration cannot be negative; a bad/reversal row
      // (e.g. duration_minutes = -1005) must not drag the collector's hours below zero.
      // Clamp per-row at 0 so "Hours" is always truthful. Root-cause data fix is owned
      // by collections-activity-agent (bad source rows), this is display sanitation only.
      row.minutes += Math.max(0, Number(a.duration_minutes) || 0);
      row.collected += Number(a.collected_amount) || 0;
      row.commission += Number(a.commission) || 0;
      if ((Number(a.collected_amount) || 0) > 0) row.payments += 1;
      if (isFailedOutcome(a.outcome)) {
        row.failed += 1;
        failedList.push(a);
      }
    });
    const collectorActivityRows = Object.values(collectorActivity).sort((a, b) => b.collected - a.collected);
    const failedRecent = failedList
      .sort((a, b) => (b.activity_date || "").localeCompare(a.activity_date || ""))
      .slice(0, 10);
    const failedTotal = failedList.length;

    // ---------- Bucket movement (collections by aging bucket, selected month) ----------
    const BUCKET_ORDER = ["Current", "1-30", "31-60", "61-90", "91-120", "120+"];
    const bucketMovement: Record<string, { collected: number; count: number }> = {};
    payments.forEach((p: any) => {
      if (!inMonth(p.payment_date)) return;
      const b = p.aging_bucket || "Current";
      bucketMovement[b] = bucketMovement[b] || { collected: 0, count: 0 };
      bucketMovement[b].collected += Number(p.amount) || 0;
      bucketMovement[b].count += 1;
    });
    const bucketRows = BUCKET_ORDER
      .map((b) => ({ bucket: b, ...(bucketMovement[b] || { collected: 0, count: 0 }) }))
      .filter((r) => r.collected > 0 || r.count > 0);
    const bucketMax = Math.max(1, ...bucketRows.map((r) => r.collected));
    const recoveredFromDelinquent = bucketRows
      .filter((r) => r.bucket !== "Current")
      .reduce((s, r) => s + r.collected, 0);

    return {
      weeklySeries,
      collSpark,
      curr,
      prev,
      prevComparable,
      isCurrentMonth,
      totalAR,
      arTotalCertified,
      atRisk,
      dso,
      collectorRows,
      heatMax,
      waterfall,
      collectorActivityRows,
      failedRecent,
      failedTotal,
      bucketRows,
      bucketMax,
      recoveredFromDelinquent,
    };
  }, [data, monthVal]);

  // Collector-table "Collected" repointed to the certified per-collector figure for the selected month
  // (de-duplicated, credited to the human who logged the payment; System-Auto holds pure auto-pay).
  // Hours / Activities / Payments / Commission stay raw. Re-sorted by the certified amount.
  const collectorRowsCertified = useMemo(() => {
    const rows = view?.collectorActivityRows ?? [];
    const cert = certifiedCollectedByCollector(byCollectorWeeks, (wk) => wk.slice(0, 7) === monthVal);
    return rows
      .map((r) => ({ ...r, collected: cert.get(r.collector) ?? 0 }))
      .sort((a, b) => b.collected - a.collected);
  }, [view, byCollectorWeeks, monthVal]);

  if (isLoading || !view) {
    return <div className="p-6 text-center text-sm text-muted-foreground">Loading executive insights…</div>;
  }

  const sections = [
    { id: "hero", label: "Executive" },
    { id: "flow", label: "Money Flow" },
    { id: "aging", label: "Aging × Collector" },
    { id: "activity", label: "Collector Activity" },
    { id: "movement", label: "Bucket Movement" },
    { id: "failed", label: "Failed / Issues" },
  ];

  const netChange = view.waterfall[1].value + view.waterfall[2].value;
  const monthLabel = format(monthValToDate(monthVal), "MMMM yyyy");

  return (
    <div className="space-y-8 font-sans">
      {/* ─────────── Refined command bar ─────────── */}
      <div className="sticky top-0 z-20 -mx-4 border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur-xl print:hidden">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-baseline gap-3">
            <h1 className="text-[15px] font-semibold tracking-tight text-foreground">Executive Insights</h1>
            <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground/70">
              {monthLabel}
            </span>
          </div>

          <nav className="hidden items-center gap-0.5 rounded-full border border-border/70 bg-muted/30 p-0.5 md:flex">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="rounded-full px-3 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
              >
                {s.label}
              </a>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Select value={monthVal} onValueChange={setMonthVal}>
              <SelectTrigger className="h-8 w-[170px] rounded-full border-border/70 bg-background text-xs font-medium">
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
              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border/70 bg-background px-3 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Printer className="h-3 w-3" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* ─────────── Hero KPI band ─────────── */}
      <section id="hero" className="scroll-mt-24">
        <div className="grid grid-cols-1 divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-card via-card to-muted/30 shadow-[0_1px_0_0_hsl(var(--border)),0_24px_60px_-30px_hsl(var(--primary)/0.25)] sm:grid-cols-2 sm:divide-y-0 sm:divide-x lg:grid-cols-4">
          <HeroKpi
            label="Total AR"
            value={fmtMoney(view.arTotalCertified)}
            spark={view.weeklySeries}
            sparkColor="hsl(var(--primary))"
            sublabel="Outstanding balance"
          />
          <HeroKpi
            label={`Collected · ${format(monthValToDate(monthVal), "MMM")}`}
            value={fmtMoney(view.curr.collected)}
            spark={view.collSpark}
            sparkColor="hsl(var(--secondary))"
            delta={<DeltaPill prev={view.prevComparable} curr={view.curr.collected} />}
            sublabel={view.isCurrentMonth ? "vs prior month (MTD)" : "vs prior month"}
          />
          <HeroKpi
            label="Weighted DSO"
            value={`${view.dso}`}
            unit="days"
            accent={view.dso > 60 ? "warn" : "ok"}
            sublabel="Days sales outstanding"
          />
          <HeroKpi
            label="AR at Risk"
            value={fmtMoney(view.atRisk)}
            accent="warn"
            sublabel="60+ days past due"
          />
        </div>
      </section>

      {/* ─────────── Money flow + Net change ─────────── */}
      <section id="flow" className="scroll-mt-24 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 rounded-2xl border-border/70 p-6 shadow-none">
          <SectionHeader
            eyebrow="Cash Movement"
            title="Money Flow"
            caption={`Composition of inflows vs outflows · ${monthLabel}`}
          />
          {(() => {
            const opening = view.waterfall[0].value;
            const newAR = view.waterfall[1].value;
            const collected = Math.abs(view.waterfall[2].value);
            const closing = view.arTotalCertified;
            const pieData = [
              { name: "Opening AR", value: Math.max(0, opening), color: "hsl(var(--primary))" },
              { name: "+ New AR", value: Math.max(0, newAR), color: "hsl(var(--destructive))" },
              { name: view.waterfall[2].name, value: Math.max(0, collected), color: "hsl(var(--success))" },
            ].filter((d) => d.value > 0);
            const total = pieData.reduce((s, d) => s + d.value, 0) || 1;
            return (
              <div className="mt-6 grid items-center gap-6 sm:grid-cols-[260px_1fr]">
                <div className="relative">
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={64}
                        outerRadius={100}
                        paddingAngle={2}
                        stroke="hsl(var(--background))"
                        strokeWidth={2}
                      >
                        {pieData.map((d, i) => (
                          <Cell key={i} fill={d.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v: number) => fmtMoney(v)}
                        contentStyle={{
                          background: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: 8,
                          fontSize: 11,
                          boxShadow: "0 8px 24px -8px hsl(var(--primary)/0.25)",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground/70">Closing AR</span>
                    <span className="text-lg font-semibold tabular-nums">{fmtMoney(closing)}</span>
                  </div>
                </div>
                <ul className="space-y-3 text-sm">
                  {pieData.map((d) => {
                    const pct = (d.value / total) * 100;
                    return (
                      <li key={d.name} className="flex items-center gap-3">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                        <span className="flex-1 text-muted-foreground">{d.name}</span>
                        <span className="tabular-nums font-medium">{fmtMoney(d.value)}</span>
                        <span className="w-12 text-right text-xs text-muted-foreground tabular-nums">{pct.toFixed(1)}%</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })()}
        </Card>

        <Card className="rounded-2xl border-border/70 p-6 shadow-none">
          <SectionHeader eyebrow="Period Result" title="Net AR Change" />
          <div className="mt-6 flex items-baseline gap-2">
            <span className="text-4xl font-semibold tracking-tight tabular-nums">
              {netChange >= 0 ? "+" : ""}{fmtMoney(netChange)}
            </span>
            <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${netChange >= 0 ? "text-destructive" : "text-success"}`}>
              {netChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {netChange >= 0 ? "Portfolio growing" : "Drawing down"}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Net AR movement for {format(monthValToDate(monthVal), "MMM yyyy")} (new AR less reductions).
          </p>

          <dl className="mt-6 space-y-3 border-t border-border/60 pt-4 text-sm">
            <FlowRow label="Opening AR" value={fmtMoney(view.waterfall[0].value)} tone="neutral" />
            <FlowRow label="+ New AR" value={fmtMoney(view.waterfall[1].value)} tone="up" />
            <FlowRow label={view.waterfall[2].name} value={fmtMoney(Math.abs(view.waterfall[2].value))} tone="down" />
            <div className="border-t border-border/60 pt-3">
              <FlowRow label="Closing AR" value={fmtMoney(view.arTotalCertified)} tone="neutral" bold />
            </div>
          </dl>
        </Card>
      </section>

      {/* ─────────── Aging matrix ─────────── */}
      <section id="aging" className="scroll-mt-24">
        <Card className="rounded-2xl border-border/70 p-6 shadow-none">
          <SectionHeader
            eyebrow="Portfolio Aging"
            title="Aging × Collector"
            caption="Cell intensity scales with dollar exposure across the portfolio."
          />
          <div className="mt-6 overflow-hidden rounded-xl border border-border/60">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-muted/40">
                <tr className="text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/80">
                  <th className="px-4 py-3">Collector</th>
                  {AGING_BUCKETS.map((b) => (
                    <th key={b.key} className="px-3 py-3 text-right">{b.label}</th>
                  ))}
                  <th className="px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {view.collectorRows.map((row, idx) => (
                  <tr
                    key={row.collector}
                    className={`border-t border-border/40 ${idx % 2 === 1 ? "bg-muted/10" : ""}`}
                  >
                    <td className="px-4 py-2.5 font-medium tracking-tight">{row.collector}</td>
                    {AGING_BUCKETS.map((b) => (
                      <HeatCell key={b.key} value={row.buckets[b.key] || 0} max={view.heatMax}>
                        <span className="block text-right text-[12px]">
                          {(row.buckets[b.key] || 0) > 0 ? fmtMoney(row.buckets[b.key]) : "—"}
                        </span>
                      </HeatCell>
                    ))}
                    <td className="px-4 py-2.5 text-right font-mono text-[13px] font-semibold tabular-nums">
                      {fmtMoney(row.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* ─────────── Collector Time & Activity ─────────── */}
      <section id="activity" className="scroll-mt-24">
        <Card className="rounded-2xl border-border/70 p-6 shadow-none">
          <SectionHeader
            eyebrow="Workforce"
            title="Collector Time & Activity"
            caption={`Logged effort and outcomes per collector · ${monthLabel}`}
          />
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70">
                  <th className="pb-3 pl-1">Collector</th>
                  <th className="pb-3 text-right">Hours</th>
                  <th className="pb-3 text-right">Activities</th>
                  <th className="pb-3 text-right">Payments</th>
                  <th className="pb-3 text-right">Collected</th>
                  <th className="pb-3 text-right">Commission</th>
                  <th className="pb-3 pr-1 text-right">Failed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {collectorRowsCertified.length === 0 ? (
                  <tr><td colSpan={7} className="py-6 text-center text-xs text-muted-foreground">No activity logged this month.</td></tr>
                ) : collectorRowsCertified.map((r) => (
                  <tr key={r.collector} className="transition-colors hover:bg-muted/30">
                    <td className="py-2.5 pl-1 font-medium tracking-tight">{r.collector}</td>
                    <td className="py-2.5 text-right font-mono tabular-nums text-[13px]">{(r.minutes / 60).toFixed(1)}</td>
                    <td className="py-2.5 text-right font-mono tabular-nums text-[13px]">{r.activities}</td>
                    <td className="py-2.5 text-right font-mono tabular-nums text-[13px]">{r.payments}</td>
                    <td className="py-2.5 text-right font-mono tabular-nums text-[13px] font-semibold">{fmtMoney(r.collected)}</td>
                    <td className="py-2.5 text-right font-mono tabular-nums text-[13px] text-muted-foreground">{fmtMoney(r.commission)}</td>
                    <td className="py-2.5 pr-1 text-right">
                      {r.failed > 0 ? (
                        <span className="inline-flex items-center rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive">{r.failed}</span>
                      ) : <span className="text-[11px] text-muted-foreground">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* ─────────── Bucket Movement ─────────── */}
      <section id="movement" className="scroll-mt-24">
        <Card className="rounded-2xl border-border/70 p-6 shadow-none">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <SectionHeader
              eyebrow="Aging Recovery"
              title="Bucket Movement"
              caption={`Collections by aging bucket · ${monthLabel}`}
            />
            <Metric mini label="Recovered from Delinquent" value={fmtMoney(view.recoveredFromDelinquent)} />
          </div>
          <div className="mt-6 space-y-2">
            {view.bucketRows.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground">No collections in this period.</div>
            ) : view.bucketRows.map((b) => {
              const pct = (b.collected / view.bucketMax) * 100;
              const tone =
                b.bucket === "Current" ? "from-secondary/70 to-secondary"
                : b.bucket === "1-30" ? "from-primary/60 to-primary"
                : b.bucket === "31-60" ? "from-warning/60 to-warning"
                : "from-destructive/60 to-destructive";
              return (
                <div key={b.bucket} className="grid grid-cols-[110px_1fr_90px_60px] items-center gap-3 py-1.5">
                  <span className="text-xs font-medium tracking-tight">{b.bucket}</span>
                  <div className="relative h-2 overflow-hidden rounded-full bg-muted/50">
                    <div className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${tone}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-right font-mono text-[13px] font-semibold tabular-nums">{fmtMoney(b.collected)}</span>
                  <span className="text-right text-[11px] text-muted-foreground tabular-nums">{b.count} pmt</span>
                </div>
              );
            })}
          </div>
        </Card>
      </section>

      {/* ─────────── Failed / Issues ─────────── */}
      <section id="failed" className="scroll-mt-24">
        <Card className="rounded-2xl border-border/70 p-6 shadow-none">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <SectionHeader
              eyebrow="Risk Signals"
              title="Failed Transactions & Issues"
              caption={`Failed payments, refunds, disputes & disconnections · ${monthLabel}`}
            />
            <Metric mini label="Total Issues" value={String(view.failedTotal)} />
          </div>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70">
                  <th className="pb-3 pl-1">Date</th>
                  <th className="pb-3">Client</th>
                  <th className="pb-3">Collector</th>
                  <th className="pb-3">Outcome</th>
                  <th className="pb-3 pr-1 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {view.failedRecent.length === 0 ? (
                  <tr><td colSpan={5} className="py-6 text-center text-xs text-muted-foreground">No failed transactions or issues this month.</td></tr>
                ) : view.failedRecent.map((a: any) => (
                  <tr key={a.id} className="transition-colors hover:bg-muted/30">
                    <td className="py-2.5 pl-1 text-xs text-muted-foreground tabular-nums">{a.activity_date}</td>
                    <td className="py-2.5 font-medium tracking-tight">{a.client_name || "—"}</td>
                    <td className="py-2.5 text-xs text-muted-foreground">{a.collector || "—"}</td>
                    <td className="py-2.5">
                      <span className="inline-flex items-center rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive">{a.outcome}</span>
                    </td>
                    <td className="py-2.5 pr-1 text-right font-mono tabular-nums text-[13px]">{a.collected_amount ? fmtMoney(Number(a.collected_amount)) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </div>
  );
}

/* ─────────────────── Sub-components ─────────────────── */

function SectionHeader({
  eyebrow,
  title,
  caption,
}: {
  eyebrow: string;
  title: string;
  caption?: string;
}) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary">{eyebrow}</div>
      <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">{title}</h2>
      {caption && <p className="mt-0.5 text-xs text-muted-foreground">{caption}</p>}
    </div>
  );
}

function HeroKpi({
  label,
  value,
  unit,
  spark,
  sparkColor = "hsl(var(--secondary))",
  delta,
  accent,
  sublabel,
}: {
  label: string;
  value: string;
  unit?: string;
  spark?: number[];
  sparkColor?: string;
  delta?: React.ReactNode;
  accent?: "ok" | "warn";
  sublabel?: string;
}) {
  const dot =
    accent === "warn"
      ? "bg-destructive shadow-[0_0_0_3px_hsl(var(--destructive)/0.15)]"
      : accent === "ok"
        ? "bg-success shadow-[0_0_0_3px_hsl(var(--success)/0.15)]"
        : "bg-secondary shadow-[0_0_0_3px_hsl(var(--secondary)/0.15)]";

  return (
    <div className="group relative flex flex-col gap-3 p-5 transition-colors hover:bg-muted/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
          <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
            {label}
          </span>
        </div>
        {delta}
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="text-[28px] font-semibold leading-none tracking-tight tabular-nums text-foreground">
          {value}
        </span>
        {unit && <span className="text-xs font-medium text-muted-foreground">{unit}</span>}
      </div>

      <div className="flex items-end justify-between">
        <span className="text-[11px] text-muted-foreground/80">{sublabel}</span>
        {spark ? (
          <Sparkline values={spark} width={88} height={24} stroke={sparkColor} fill={`${sparkColor.replace(")", " / 0.12)").replace("hsl(", "hsl(")}`} />
        ) : null}
      </div>
    </div>
  );
}

function DeltaPill({ prev, curr }: { prev: number; curr: number }) {
  if (!prev) return <span className="text-[10px] text-muted-foreground">new</span>;
  const pct = (curr - prev) / prev;
  const up = pct >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${
        up ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
      }`}
    >
      {up ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
      {Math.abs(pct * 100).toFixed(1)}%
    </span>
  );
}

function FlowRow({
  label,
  value,
  tone,
  bold,
}: {
  label: string;
  value: string;
  tone: "up" | "down" | "neutral";
  bold?: boolean;
}) {
  const toneColor =
    tone === "up" ? "text-destructive" : tone === "down" ? "text-success" : "text-foreground";
  return (
    <div className="flex items-baseline justify-between">
      <dt className={`text-xs ${bold ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{label}</dt>
      <dd className={`font-mono text-sm tabular-nums ${toneColor} ${bold ? "font-semibold" : ""}`}>{value}</dd>
    </div>
  );
}

function Metric({ label, value, mini }: { label: string; value: string; mini?: boolean }) {
  return (
    <div className="text-right">
      <div className="text-[10px] font-medium uppercase tracking-[0.1em] text-muted-foreground/70">{label}</div>
      <div className={`font-mono font-semibold tabular-nums ${mini ? "text-sm" : "text-base"}`}>{value}</div>
    </div>
  );
}