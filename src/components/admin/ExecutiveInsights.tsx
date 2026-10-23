import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAllRows, useActivityCollectedByCollectorWeekly, certifiedCollectedByCollector, useFirmFinancialSummary, useArWaterfall, useCertifiedMonthlyCollections, aggregateArWaterfallByMonth } from "@/hooks/useSupabaseData";
import { Sparkline, HeatCell } from "@/components/collections/MiniViz";
import DelinquentCollectionsPanel from "@/components/admin/DelinquentCollectionsPanel";
import CaseMixDetailDialog from "@/components/admin/CaseMixDetailDialog";
import CashMovementPanel from "@/components/admin/CashMovementPanel";
import {
  useExecCollectedSplitMonthly, useExecClientBucketDrift, useExecCaseMixMonthly, useExecArAtRisk,
  useFirmFinancialSummary as useCertifiedFirmSummary,
  useExecCollectorActivityMonthly, useExecFailedActivities,
  type ExecCollectedMonth, type ExecDriftCell, type ExecCaseMixRow,
} from "@/hooks/useSupabaseData";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  format, subMonths, startOfMonth, endOfMonth,
} from "date-fns";
import {
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie,
} from "recharts";
import { ArrowUpRight, ArrowDownRight, Printer, LayoutGrid } from "lucide-react";

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

// The panel only ever looks back MONTH_OPTIONS months (the selector), so it fetches that window and only
// the columns it reads. 10-13: it used to pull every row of payments_clean (~22.6k) and
// collection_activities (~42k) with select * on every load. Collector activity is now aggregated
// server-side (v_exec_collector_activity_monthly), and payments only feed the selected month (the old
// +8-month sparkline window is gone), so the payments window is MONTH_OPTIONS.
const MONTH_OPTIONS = 6;
const PAYMENT_LOOKBACK_MONTHS = MONTH_OPTIONS;

function useInsightsData() {
  return useQuery({
    queryKey: ["admin-insights-v3"],
    queryFn: async () => {
      const paymentsFrom = format(startOfMonth(subMonths(new Date(), PAYMENT_LOOKBACK_MONTHS)), "yyyy-MM-dd");
      const [ar, payments] = await Promise.all([
        // Stable ORDER BY on a unique key is REQUIRED: fetchAllRows paginates via .range()
        // (LIMIT/OFFSET). Without a deterministic sort, PostgREST can skip/duplicate rows
        // across pages, silently under-counting large tables — payments_clean (~19k) and
        // collection_activities (~42k) were losing ~40-60% of rows, halving month totals.
        fetchAllRows<any>("ar_dashboard", {
          orderBy: "invoice_number",
          columns: "invoice_number, remaining_balance, days_past_due, collector, start_date, total_contract_value",
        }),
        fetchAllRows<any>("payments_clean", {
          orderBy: "id",
          columns: "id, payment_date, amount, aging_bucket",
          filter: (q) => q.gte("payment_date", paymentsFrom),
        }),
      ]);
      return { ar, payments };
    },
    staleTime: 5 * 60 * 1000,
  });
}

export default function ExecutiveInsights() {
  const [monthVal, setMonthVal] = useState(format(new Date(), "yyyy-MM"));
  const months = monthOptions(MONTH_OPTIONS);
  const { data, isLoading, isError: insightsError, refetch: refetchInsights } = useInsightsData();
  // VP-certified firm-wide snapshot (single row) — authoritative month new-AR source. Shared
  // query key with AdminDashboard, so it is fetched once, and the panel renders without waiting
  // for it (falls back to the row-sum until it arrives).
  const { data: firmSummary } = useFirmFinancialSummary();
  // Certified per-collector cash (v_activity_collected_by_collector_weekly) — replaces the raw
  // SUM(collection_activities.collected_amount) in the collector table below.
  const { data: byCollectorWeeks = [] } = useActivityCollectedByCollectorWeekly();
  // 2026-10-14: Money Flow reads the AR roll-forward by month (v_ar_waterfall, snapshot grain) and the delinquent
  // recovery reads certified cash (mv_collections_certified_monthly). Both used to fall back to payments_clean
  // (client-linked LawPay only — Jul $286,820 vs $1,768,833.95 certified).
  const { data: waterfallRows = [], isLoading: wfLoading, isError: wfError } = useArWaterfall();
  const { data: certifiedMonths = [] } = useCertifiedMonthlyCollections(MONTH_OPTIONS + 1);
  // Hero band (2026-10-13): each tile fetches its own VP-certified view and owns its loading /
  // error state, so the band renders independently of the legacy browser-side pull below.

  const view = useMemo(() => {
    if (!data) return null;
    // AR universe = every ar_dashboard row (all carry amount_due > 0 and excluded_from_ar = false).
    // Do NOT drop delinquency_status = 'Paid': client-ar + VP LOCKED that the 31 "Paid"-but-open
    // rows are REAL AR ($104,050, $0 actually paid off) — "Paid" is a stale contracts-table label
    // bled in via the unreliable invoice_number join. Filtering them understated AR by ~$104K.
    const ar = data.ar;
    const payments = data.payments;

    const isCurrentMonth = monthVal === format(new Date(), "yyyy-MM");

    // ---------- AR totals ----------
    const totalAR = ar.reduce((s: number, r: any) => s + (Number(r.remaining_balance) || 0), 0);

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

    // ---------- Money flow (AR roll-forward) for selected month ----------
    // Canonical Total AR = v_firm_financial_summary.ar_total (VP-certified anchor, re-pins as AR snapshots land). Fall
    // back to the ar_dashboard row-sum only if the certified row is unavailable, so the tile never renders empty.
    const arTotalCertified = firmSummary && firmSummary.ar_total != null ? Number(firmSummary.ar_total) || 0 : totalAR;
    // Month movement = every MyCase AR snapshot period dated in the selected month (v_ar_waterfall): beginning of the
    // first period, additions / reductions summed, ending of the last. "Reductions" = collections + write-offs +
    // adjustments, so it legitimately differs from the cash "Collected" tile. The current month closes on the certified
    // Total AR (the waterfall stores whole dollars). No snapshot in the month → no movement is shown (never a guess).
    const mv = aggregateArWaterfallByMonth(waterfallRows).find((m) => m.monthKey === monthVal) ?? null;
    const closingAR = mv ? (isCurrentMonth ? arTotalCertified : mv.ending) : arTotalCertified;
    const arAddedThisMonth = mv ? mv.additions : 0;
    const reductionsMonth = mv ? mv.reductions : 0;
    const netMovement = mv ? mv.additions - mv.reductions : 0;
    const openingAR = closingAR - netMovement;
    const waterfall = [
      { name: "Opening AR", value: openingAR, type: "balance" },
      { name: "+ New AR", value: arAddedThisMonth, type: "pos" },
      { name: "− Reductions", value: -reductionsMonth, type: "neg" },
      { name: "Closing AR", value: closingAR, type: "balance" },
    ];
    const movementSpan = mv ? { from: mv.firstSnapshot, to: mv.lastSnapshot, periods: mv.periods } : null;
    // "unavailable" (query failed / still loading) is NOT "no snapshot": only say "no snapshot" after a good read.
    const movementState: "ok" | "none" | "loading" | "error" = mv ? "ok" : wfError ? "error" : wfLoading ? "loading" : "none";

    // Calendar-month test on the DATE string. new Date("yyyy-mm-dd") is UTC midnight, i.e. the previous
    // evening in US time zones, which used to count every payment dated the 1st in the previous month.
    const inMonth = (d: string | null | undefined) => !!d && d.slice(0, 7) === monthVal;

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
    // Bucket rows are client-linked LawPay payments (payments_clean carries the aging bucket); they are a SUBSET of
    // cash. The headline "Recovered from Delinquent" is the certified figure for the month.
    const linkedFromDelinquent = bucketRows
      .filter((r) => r.bucket !== "Current")
      .reduce((s, r) => s + r.collected, 0);
    const linkedMonthTotal = bucketRows.reduce((s, r) => s + r.collected, 0);
    const certMonth = certifiedMonths.find((m) => m.monthKey === monthVal) ?? null;
    const recoveredFromDelinquent = certMonth ? certMonth.delinquent : null;
    const certifiedCashMonth = certMonth ? certMonth.total : null;

    return {
      totalAR,
      arTotalCertified,
      collectorRows,
      heatMax,
      waterfall,
      closingAR,
      movementSpan,
      movementState,
      bucketRows,
      bucketMax,
      recoveredFromDelinquent,
      linkedFromDelinquent,
      linkedMonthTotal,
      certifiedCashMonth,
    };
  }, [data, monthVal, firmSummary, waterfallRows, wfLoading, wfError, certifiedMonths]);

  // Collector time & activity (selected month), aggregated server-side (v_exec_collector_activity_monthly,
  // VP cert 6b600cd2) instead of paging every collection_activities row into the browser. "Collected" is the
  // certified per-collector figure (de-duplicated, credited to the human who logged the payment; System-Auto
  // holds pure auto-pay, flagged is_system_actor). Re-sorted by the certified amount.
  const { data: activityRows = [] } = useExecCollectorActivityMonthly(monthVal);
  const { data: failedRecent = [] } = useExecFailedActivities(monthVal);
  const failedTotal = activityRows.reduce((s, r) => s + r.failed, 0);
  const collectorRowsCertified = useMemo(() => {
    const cert = certifiedCollectedByCollector(byCollectorWeeks, (wk) => wk.slice(0, 7) === monthVal);
    return activityRows
      .map((r) => ({
        collector: r.collector,
        isSystem: r.is_system_actor,
        minutes: r.minutes,
        activities: r.activities,
        payments: r.payments,
        commission: r.commission,
        failed: r.failed,
        collected: cert.get(r.collector) ?? 0,
      }))
      .sort((a, b) => b.collected - a.collected);
  }, [activityRows, byCollectorWeeks, monthVal]);

  const sections = [
    { id: "hero", label: "Executive" },
    { id: "delinquent", label: "Delinquent $" },
    { id: "flow", label: "Money Flow" },
    { id: "aging", label: "Aging × Collector" },
    { id: "activity", label: "Collector Activity" },
    { id: "movement", label: "Bucket Movement" },
    { id: "failed", label: "Failed / Issues" },
  ];

  const monthLabel = format(monthValToDate(monthVal), "MMMM yyyy");
  const arCaption = !view
    ? `AR roll-forward · ${monthLabel}`
    : view.movementSpan
      ? `AR roll-forward · MyCase snapshots ${view.movementSpan.from} → ${view.movementSpan.to} (${view.movementSpan.periods} period${view.movementSpan.periods === 1 ? "" : "s"}) · ${monthLabel}`
      : view.movementState === "loading"
        ? `Loading the AR roll-forward · ${monthLabel}`
        : view.movementState === "error"
          ? `AR roll-forward unavailable right now (snapshot waterfall did not load) — showing closing AR only · ${monthLabel}`
          : `No MyCase AR snapshot landed in ${monthLabel} — no movement to show`;

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
          <TotalArKpi />
          <CollectedKpi monthVal={monthVal} />
          <DriftKpi monthVal={monthVal} />
          <ArAtRiskKpi />
        </div>
      </section>

      {/* ─────────── Key metric: delinquent collections ─────────── */}
      <section id="delinquent" className="scroll-mt-24">
        <DelinquentCollectionsPanel />
      </section>

      {/* ─────────── Money flow (cash movement; AR roll-forward on the second tab) + Case Mix ─────────── */}
      <section id="flow" className="scroll-mt-24 grid gap-4 lg:grid-cols-3">
        <CashMovementPanel
          className="lg:col-span-2"
          monthVal={monthVal}
          arCaption={arCaption}
          arRollForward={
            view ? (
              <>
              {(() => {
                const opening = view.waterfall[0].value;
                const newAR = view.waterfall[1].value;
                const collected = Math.abs(view.waterfall[2].value);
                const closing = view.closingAR;
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
              </>
            ) : (
              <LegacyPending
                className="mt-4 border-dashed"
                title="AR roll-forward"
                loading={isLoading}
                error={insightsError}
                onRetry={() => refetchInsights()}
              />
            )
          }
        />

        <CaseMixCard monthVal={monthVal} />
      </section>

      {view ? (
      <>
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
                    <td className="py-2.5 pl-1 font-medium tracking-tight">
                      {r.collector}
                      {r.isSystem && (
                        <span
                          className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground"
                          title="Automatic / system postings (autopay), not human collector work"
                        >
                          system
                        </span>
                      )}
                    </td>
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
              caption={`Client-linked LawPay payments by aging bucket · ${monthLabel}${view.certifiedCashMonth ? ` · ${fmtMoney(view.linkedMonthTotal)} of ${fmtMoney(view.certifiedCashMonth)} certified cash` : ""}`}
            />
            <Metric mini label="Recovered from Delinquent (certified)" value={view.recoveredFromDelinquent == null ? DASH : fmtMoney(view.recoveredFromDelinquent)} />
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
            <Metric mini label="Total Issues" value={String(failedTotal)} />
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
                {failedRecent.length === 0 ? (
                  <tr><td colSpan={5} className="py-6 text-center text-xs text-muted-foreground">No failed transactions or issues this month.</td></tr>
                ) : failedRecent.map((a: any) => (
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
      </>
      ) : (
        <LegacyPending
          title="Aging × Collector · Collector Activity · Bucket Movement · Failed / Issues"
          loading={isLoading}
          error={insightsError}
          onRetry={() => refetchInsights()}
        />
      )}
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
  value: React.ReactNode;
  unit?: string;
  spark?: number[];
  sparkColor?: string;
  delta?: React.ReactNode;
  accent?: "ok" | "warn";
  sublabel?: React.ReactNode;
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
          <Sparkline values={spark} width={88} height={24} stroke={sparkColor} fill={sparkColor.replace(/\)\s*$/, " / 0.12)")} />
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

function Metric({ label, value, mini }: { label: string; value: string; mini?: boolean }) {
  return (
    <div className="text-right">
      <div className="text-[10px] font-medium uppercase tracking-[0.1em] text-muted-foreground/70">{label}</div>
      <div className={`font-mono font-semibold tabular-nums ${mini ? "text-sm" : "text-base"}`}>{value}</div>
    </div>
  );
}

/* ─────────────────── Hero band tiles (2026-10-13) ─────────────────── */

/** Parse a yyyy-MM-dd date string as a LOCAL date (no UTC shift). */
function ymd(d: string): Date {
  const [y, m, dd] = d.slice(0, 10).split("-").map(Number);
  return new Date(y, (m || 1) - 1, dd || 1);
}

const DASH = "—";

/** COLLECTED — firm cash actually collected (v_exec_collected_split_monthly: canonical ledger,
 *  MyCase Completed + Offline), split into clients vs non-clients (consult fees). */
function CollectedKpi({ monthVal }: { monthVal: string }) {
  const q = useExecCollectedSplitMonthly();
  const rows: ExecCollectedMonth[] | undefined = q.data;
  const label = `Collected · ${format(monthValToDate(monthVal), "MMM")}`;
  if (q.isLoading) return <HeroKpi label={label} value="…" sublabel="Loading firm ledger" />;
  if (q.isError || !rows) return <HeroKpi label={label} value={DASH} sublabel={<TileError onRetry={() => q.refetch()} />} />;

  const byMonth = new Map(rows.map((r) => [r.month.slice(0, 7), r]));
  const row = byMonth.get(monthVal);
  if (!row) return <HeroKpi label={label} value={DASH} sublabel="No payments on the ledger this month" />;

  const prevKey = format(subMonths(monthValToDate(monthVal), 1), "yyyy-MM");
  const prev = byMonth.get(prevKey);
  const prevMon = format(monthValToDate(prevKey), "MMM");
  const spark = Array.from(
    { length: 8 },
    (_, i) => byMonth.get(format(subMonths(monthValToDate(monthVal), 7 - i), "yyyy-MM"))?.total_collected ?? 0,
  );
  // Current month: MTD vs MTD through the day of the newest ledger payment (feed-lag aware).
  const mtd = row.is_current_month;
  const prevBasis = prev ? (mtd ? prev.total_mtd_comparable : prev.total_collected) : 0;
  const currBasis = mtd ? row.total_mtd_comparable : row.total_collected;
  const compare = mtd
    ? `vs ${prevMon} 1–${row.mtd_cutoff_day}${row.ledger_through ? ` · ledger thru ${format(ymd(row.ledger_through), "MMM d")}` : ""}`
    : `vs ${prevMon}`;
  // A closed month whose consult ledger only covers part of it (Feb 2026: from Feb 17) would
  // overstate "Clients" — show a dash rather than a wrong split.
  const consultPartial = row.consult_source_status === "PARTIAL_MONTH" && !row.is_current_month;
  const clientsText = row.client_collected == null || consultPartial ? DASH : fmtMoney(row.client_collected);
  const consultText = row.nonclient_consult_cash == null ? DASH : `${fmtMoney(row.nonclient_consult_cash)}${consultPartial ? " (partial)" : ""}`;
  // Current month: the consult ledger can run a day ahead of the MyCase ledger.
  const splitNote =
    row.consult_through && row.ledger_through && row.consult_through > row.ledger_through
      ? `Consults run through ${format(ymd(row.consult_through), "MMM d")}, the payment ledger through ${format(ymd(row.ledger_through), "MMM d")}: Clients reads slightly low until the ledger catches up.`
      : "Clients = firm ledger total minus consult fees (HubSpot consult ledger, LawPay-confirmed).";

  return (
    <HeroKpi
      label={label}
      value={fmtMoney(row.total_collected)}
      spark={spark}
      sparkColor="hsl(var(--secondary))"
      delta={
        prev ? (
          <span title={`${prevMon} comparable: ${fmtMoney(prevBasis)}`}>
            <DeltaPill prev={prevBasis} curr={currBasis} />
          </span>
        ) : undefined
      }
      sublabel={
        <span className="flex flex-col gap-0.5">
          <span title={splitNote}>
            <span className="font-medium text-foreground/80">Clients {clientsText}</span>
            {" · "}Consults {consultText}
          </span>
          <span className="text-[10px] text-muted-foreground/70">{compare}</span>
        </span>
      }
    />
  );
}

const DRIFT_BUCKETS = ["Current", "1-30", "31-60", "61-90", "91-180", "181-365", "365+"];

/** DRIFT — clients whose worst MyCase aging bucket got worse vs recovered between the AR snapshot
 *  on/before the 1st and the latest snapshot in the month (v_exec_client_bucket_drift). */
function DriftKpi({ monthVal }: { monthVal: string }) {
  const q = useExecClientBucketDrift();
  const cells: ExecDriftCell[] | undefined = q.data;
  const label = "Drift";
  if (q.isLoading) return <HeroKpi label={label} value="…" sublabel="Loading AR snapshots" />;
  if (q.isError || !cells) return <HeroKpi label={label} value={DASH} sublabel={<TileError onRetry={() => q.refetch()} />} />;

  const mc = cells.filter((c) => c.month.slice(0, 7) === monthVal);
  if (mc.length === 0) {
    return (
      <HeroKpi
        label={label}
        value={DASH}
        sublabel={`No MyCase AR snapshot pair (≤31 days apart) for ${format(monthValToDate(monthVal), "MMM")}`}
      />
    );
  }
  const count = (m: ExecDriftCell["movement"]) => mc.filter((c) => c.movement === m).reduce((s, c) => s + c.clients, 0);
  const worse = count("worse");
  const recovered = count("recovered");
  const added = count("new");
  const left = count("left");
  const base = mc[0].base_snapshot_date;
  const end = mc[0].end_snapshot_date;
  const refreshed = mc[0].refreshed_at ? new Date(mc[0].refreshed_at) : null;

  return (
    <HeroKpi
      label={label}
      accent={worse > recovered ? "warn" : "ok"}
      value={
        <span className="inline-flex flex-wrap items-baseline gap-x-1.5">
          <span className="text-destructive">{worse.toLocaleString()}</span>
          <span className="text-xs font-medium text-muted-foreground">worse</span>
          <span className="text-lg text-muted-foreground/50">·</span>
          <span className="text-success">{recovered.toLocaleString()}</span>
          <span className="text-xs font-medium text-muted-foreground">recovered</span>
        </span>
      }
      delta={<DriftMatrix cells={mc} base={base} end={end} />}
      sublabel={
        <span className="flex flex-col gap-0.5">
          <span>
            since {format(ymd(base), "MMM d")} · {added.toLocaleString()} new · {left.toLocaleString()} left
          </span>
          <span className="text-[10px] text-muted-foreground/70">
            clients · worst MyCase bucket · to {format(ymd(end), "MMM d")}
            {refreshed ? ` · updated ${fmtUpdated(refreshed)}` : ""}
          </span>
        </span>
      }
    />
  );
}

/** From→to bucket matrix behind the Drift tile. Rows = bucket on the base snapshot (or not on
 *  the book), columns = bucket on the end snapshot (or left the book). Cells = clients. */
function DriftMatrix({ cells, base, end }: { cells: ExecDriftCell[]; base: string; end: string }) {
  const at = new Map(cells.map((c) => [`${c.from_ord}|${c.to_ord}`, c]));
  const fromOrds = [-1, 0, 1, 2, 3, 4, 5, 6];
  const toOrds = [0, 1, 2, 3, 4, 5, 6, -1];
  const sumBy = (m: ExecDriftCell["movement"], k: "base_balance" | "end_balance") =>
    cells.filter((c) => c.movement === m).reduce((s, c) => s + c[k], 0);
  const tone = (from: number, to: number) =>
    from === -1 ? "bg-primary/10 text-primary"
    : to === -1 ? "bg-muted/60 text-muted-foreground"
    : to > from ? "bg-destructive/10 text-destructive"
    : to < from ? "bg-success/10 text-success"
    : "bg-muted/30 text-foreground/80";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-full border border-border/70 px-2 py-0.5 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Show bucket drift matrix"
        >
          <LayoutGrid className="h-2.5 w-2.5" />
          Matrix
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto max-w-[calc(100vw-2rem)] p-4">
        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-secondary">Client bucket drift</div>
        <div className="mt-0.5 text-xs text-muted-foreground">
          Worst MyCase aging bucket per client · {format(ymd(base), "MMM d")} → {format(ymd(end), "MMM d, yyyy")}
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="border-collapse text-[11px] tabular-nums">
            <thead>
              <tr>
                <th className="px-1.5 py-1 text-left text-[9px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/70">
                  From ↓ / To →
                </th>
                {toOrds.map((t) => (
                  <th key={t} className="px-1.5 py-1 text-right text-[9px] font-semibold uppercase tracking-[0.06em] text-muted-foreground/70">
                    {t === -1 ? "Left" : DRIFT_BUCKETS[t]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fromOrds.map((f) => (
                <tr key={f} className="border-t border-border/40">
                  <td className="whitespace-nowrap px-1.5 py-1 font-medium text-muted-foreground">
                    {f === -1 ? "New" : DRIFT_BUCKETS[f]}
                  </td>
                  {toOrds.map((t) => {
                    const c = at.get(`${f}|${t}`);
                    if (f === -1 && t === -1) return <td key={t} />;
                    return (
                      <td key={t} className="p-0.5 text-right">
                        {c ? (
                          <span
                            className={`block rounded px-1.5 py-0.5 font-mono ${tone(f, t)}`}
                            title={`${c.clients.toLocaleString()} clients · ${fmtMoney(c.end_balance)} now / ${fmtMoney(c.base_balance)} before`}
                          >
                            {c.clients.toLocaleString()}
                          </span>
                        ) : (
                          <span className="block px-1.5 py-0.5 text-muted-foreground/40">·</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 border-t border-border/60 pt-3 text-[11px]">
          <dt className="text-destructive">Worse</dt>
          <dd className="text-right font-mono tabular-nums">{fmtMoney(sumBy("worse", "end_balance"))} now</dd>
          <dt className="text-success">Recovered</dt>
          <dd className="text-right font-mono tabular-nums">
            {fmtMoney(sumBy("recovered", "end_balance"))} now · was {fmtMoney(sumBy("recovered", "base_balance"))}
          </dd>
          <dt className="text-primary">New on the book</dt>
          <dd className="text-right font-mono tabular-nums">{fmtMoney(sumBy("new", "end_balance"))}</dd>
          <dt className="text-muted-foreground">Left the book</dt>
          <dd className="text-right font-mono tabular-nums">{fmtMoney(sumBy("left", "base_balance"))} before</dd>
        </dl>
      </PopoverContent>
    </Popover>
  );
}

/** CASE MIX — services sold in the month (revenue cases opened, invoiced > 0) and the contract
 *  value they bring (v_exec_case_mix_monthly). Carries a feed-freshness line so a partially
 *  loaded month never reads as a collapse in sales. */
function CaseMixCard({ monthVal }: { monthVal: string }) {
  const q = useExecCaseMixMonthly();
  // Jeff 2026-10-16: click into the box for the per-invoice breakdown (client, case #, invoice #) + CSV export.
  const [detailOpen, setDetailOpen] = useState(false);
  const rows: ExecCaseMixRow[] | undefined = q.data;
  const monthStart = monthValToDate(monthVal);
  const monthLabel = format(monthStart, "MMMM yyyy");
  const monthRows = (rows ?? []).filter((r) => r.month.slice(0, 7) === monthVal);
  // Jeff 2026-10-16: a case with no money accounted for is not a service sold -- it is an invoice to delete.
  // When the sold/unfunded/awaiting split is deployed, the tile counts SOLD cases only and lists the rest below.
  const hasSold = monthRows.some((r) => r.sold_cases != null);
  const unfundedCases = monthRows.reduce((s, r) => s + (Number(r.unfunded_cases) || 0), 0);
  const unfundedValue = monthRows.reduce((s, r) => s + (Number(r.unfunded_contract_value) || 0), 0);
  const callFirstCases = monthRows.reduce((s, r) => s + (Number(r.call_first_cases) || 0), 0);
  const callFirstValue = monthRows.reduce((s, r) => s + (Number(r.call_first_contract_value) || 0), 0);
  const awaitingCases = monthRows.reduce((s, r) => s + (Number(r.awaiting_cases) || 0), 0);
  const awaitingValue = monthRows.reduce((s, r) => s + (Number(r.awaiting_contract_value) || 0), 0);
  const mr = (hasSold
    ? monthRows
        .map((r) => {
          const c = Number(r.sold_cases) || 0, v = Number(r.sold_contract_value) || 0;
          return { ...r, revenue_cases: c, contract_value: v, avg_per_case: c > 0 ? v / c : 0 };
        })
        .filter((r) => r.revenue_cases > 0)
    : monthRows
  ).sort((a, b) => b.contract_value - a.contract_value);
  const totalCases = mr.reduce((s, r) => s + r.revenue_cases, 0);
  const totalValue = mr.reduce((s, r) => s + r.contract_value, 0);
  // Cash that hit the bank on these cases (VP 2026-10-16): paid at signing = open date -3..+7 days.
  const n = (v: unknown) => Number(v) || 0;
  // No cash columns on the rows (older cache / test fixtures) -> show contract value only, never "NaN".
  const hasCash = mr.some((r) => r.payments_through != null);
  const totalPaid = mr.reduce((s, r) => s + n(r.paid_at_signing), 0);
  const totalToDate = mr.reduce((s, r) => s + n(r.collected_to_date), 0);
  const totalWithCash = mr.reduce((s, r) => s + n(r.cases_with_cash), 0);
  const totalPending = mr.reduce((s, r) => s + n(r.pending_at_signing), 0);
  const totalFailed = mr.reduce((s, r) => s + n(r.failed_at_signing), 0);
  const totalRejected = mr.reduce((s, r) => s + n(r.rejected_at_signing), 0);
  const totalInvoicedAtSigning = mr.reduce((s, r) => s + n(r.cases_invoiced_at_signing), 0);
  // Jan/Feb 2026 invoices were re-issued in April, so at-signing cash can't be measured for some months.
  const signingMeasurable = hasCash && (totalCases === 0 || totalInvoicedAtSigning / totalCases >= 0.8);
  const paidPct = totalValue > 0 ? (totalPaid / totalValue) * 100 : 0;
  const paymentsThrough = rows?.find((r) => r.payments_through)?.payments_through ?? null;
  const maxValue = Math.max(1, ...mr.map((r) => r.contract_value));
  const freshRow = rows?.find((r) => r.cases_loaded_through) ?? null;
  const loadedThrough = freshRow?.cases_loaded_through ? ymd(freshRow.cases_loaded_through) : null;
  const syncedAt = freshRow?.invoices_synced_at ? new Date(freshRow.invoices_synced_at) : null;
  const refreshedAt = freshRow?.refreshed_at ? new Date(freshRow.refreshed_at) : null;
  const monthEnd = endOfMonth(monthStart);
  const today = new Date();
  const coverageEnd = monthEnd < today ? monthEnd : today;
  const partial = !!loadedThrough && loadedThrough < coverageEnd && loadedThrough >= monthStart;
  const notLoaded = !!loadedThrough && loadedThrough < monthStart;

  return (
    <Card className="rounded-2xl border-border/70 p-6 shadow-none">
      <div className="flex items-start justify-between gap-2">
        <SectionHeader eyebrow="Services Sold" title="Case Mix" caption={`Revenue cases opened · ${monthLabel}`} />
        <button
          type="button"
          onClick={() => setDetailOpen(true)}
          className="mt-1 shrink-0 rounded-full border border-border/70 px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          View breakdown · CSV
        </button>
      </div>
      <CaseMixDetailDialog open={detailOpen} onOpenChange={setDetailOpen} monthVal={monthVal} monthLabel={monthLabel} />
      {q.isLoading ? (
        <div className="py-8 text-center text-xs text-muted-foreground">Loading case mix…</div>
      ) : q.isError || !rows ? (
        <div className="py-8 text-center text-xs text-muted-foreground">
          <TileError onRetry={() => q.refetch()} />
        </div>
      ) : (
        <>
          <div className="mt-5 flex cursor-pointer items-baseline gap-2" title="Click for the per-invoice breakdown" onClick={() => setDetailOpen(true)}>
            <span className="text-3xl font-semibold tracking-tight tabular-nums">{mr.length ? fmtMoney(totalValue) : DASH}</span>
            <span className="text-xs text-muted-foreground">{hasSold ? "contract value sold" : "contract value"}</span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
            {totalCases.toLocaleString()} {hasSold ? "cases sold" : `revenue ${totalCases === 1 ? "case" : "cases"}`}
            {totalCases > 0 ? ` · avg ${fmtMoney(totalValue / totalCases)} per case` : ""}
          </p>
          {mr.length > 0 && hasCash && (
            <div className="mt-3 rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
              {signingMeasurable ? (
                <>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-semibold tracking-tight tabular-nums text-success">{fmtMoney(totalPaid)}</span>
                    <span className="text-xs text-muted-foreground">hit the bank at signing · {paidPct.toFixed(0)}% of contract value</span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted-foreground tabular-nums">
                    {totalWithCash} of {totalCases} cases paid · {fmtMoney(totalToDate)} collected to date
                    {totalPending > 0 ? ` · ${fmtMoney(totalPending)} pending` : ""}
                    {totalFailed > 0 ? ` · ${fmtMoney(totalFailed)} in failed down payments` : ""}
                    {totalRejected > 0 ? ` · ${fmtMoney(totalRejected)} bounced eChecks (not counted)` : ""}
                  </p>
                </>
              ) : (
                <p className="text-[11px] text-warning">
                  Cash at signing can't be measured for this month: most of its invoices were re-issued later
                  ({totalInvoicedAtSigning} of {totalCases} cases had an invoice at signing). Collected to date: {fmtMoney(totalToDate)}.
                </p>
              )}
            </div>
          )}

          {mr.length === 0 ? (
            <div className="mt-5 rounded-lg border border-dashed border-border/70 py-6 text-center text-xs text-muted-foreground">
              {notLoaded ? "No cases loaded for this month yet." : "No revenue cases opened this month."}
            </div>
          ) : (
            <ul className="mt-5 space-y-2.5 border-t border-border/60 pt-4">
              {mr.map((r) => {
                const share = totalValue > 0 ? (r.contract_value / totalValue) * 100 : 0;
                return (
                  <li key={r.reporting_family}>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-xs font-medium tracking-tight" title={r.reporting_family}>
                        {r.reporting_family}
                      </span>
                      <span className="font-mono text-[12px] font-semibold tabular-nums">
                        {signingMeasurable && (
                          <span className="mr-2 font-normal text-success" title="Cash that hit the bank at signing">
                            {fmtMoney(n(r.paid_at_signing))} paid ·
                          </span>
                        )}
                        {fmtMoney(r.contract_value)}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-muted/50" title={`${share.toFixed(1)}% of contract value`}>
                        <div
                          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-secondary/60 to-secondary"
                          style={{ width: `${(r.contract_value / maxValue) * 100}%` }}
                        />
                      </div>
                      <span className="w-[104px] text-right text-[10px] text-muted-foreground tabular-nums">
                        {r.revenue_cases} · avg {fmtMoney(r.avg_per_case)} · {share.toFixed(0)}%
                      </span>
                    </div>
                  </li>
                );
              })}
              <li className="flex items-baseline justify-between border-t border-border/60 pt-2.5 text-xs font-semibold">
                <span>Total · {totalCases.toLocaleString()} cases</span>
                <span className="font-mono tabular-nums">
                  {signingMeasurable && <span className="mr-2 font-normal text-success">{fmtMoney(totalPaid)} paid ·</span>}
                  {fmtMoney(totalValue)}
                </span>
              </li>
            </ul>
          )}

          {hasSold && (unfundedCases > 0 || callFirstCases > 0 || awaitingCases > 0) && (
            <div className="mt-3 space-y-1 rounded-lg border border-dashed border-border/70 px-3 py-2 text-[11px] tabular-nums">
              {unfundedCases > 0 && (
                <p className="text-destructive">
                  Not counted · {unfundedCases} {unfundedCases === 1 ? "case" : "cases"} / {fmtMoney(unfundedValue)} with no money in — invoices to delete
                </p>
              )}
              {callFirstCases > 0 && (
                <p className="text-warning">
                  Call first · {callFirstCases} {callFirstCases === 1 ? "case" : "cases"} / {fmtMoney(callFirstValue)} where the down payment failed or bounced — not counted
                </p>
              )}
              {awaitingCases > 0 && (
                <p className="text-muted-foreground">
                  Not counted yet · {awaitingCases} {awaitingCases === 1 ? "case" : "cases"} / {fmtMoney(awaitingValue)} opened in the last week, awaiting a first payment
                </p>
              )}
            </div>
          )}

          <p className={`mt-4 text-[10px] leading-snug ${partial || notLoaded ? "text-warning" : "text-muted-foreground/70"}`}>
            {loadedThrough ? `Cases loaded through ${format(loadedThrough, "MMM d, yyyy")}` : "Case feed date unknown"}
            {syncedAt ? ` · invoices synced ${format(syncedAt, "MMM d")}` : ""}
            {partial ? " — partial month: cases opened after that date are not counted yet, not a drop in sales." : ""}
            {notLoaded ? " — the MyCase case feed has not reached this month yet." : ""}
            {paymentsThrough ? ` · cash counted through ${format(ymd(paymentsThrough), "MMM d")}` : ""}
            {refreshedAt ? ` · updated ${fmtUpdated(refreshedAt)}` : ""}
          </p>
        </>
      )}
    </Card>
  );
}

/** Per-tile error state with a retry, so one failed query never blanks the band. */
function TileError({ onRetry }: { onRetry: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-destructive">
      Couldn&apos;t load
      <button
        type="button"
        onClick={onRetry}
        className="rounded-full border border-border/70 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        Retry
      </button>
    </span>
  );
}

/** TOTAL AR — certified firm-wide AR (v_firm_financial_summary.ar_total, pinned AR snapshot). */
function TotalArKpi() {
  const q = useCertifiedFirmSummary();
  const label = "Total AR";
  if (q.isLoading) return <HeroKpi label={label} value="…" sublabel="Loading certified AR" />;
  const s: any = q.data;
  if (q.isError || !s || s.ar_total == null) {
    return <HeroKpi label={label} value={DASH} sublabel={<TileError onRetry={() => q.refetch()} />} />;
  }
  return (
    <HeroKpi
      label={label}
      value={fmtMoney(Number(s.ar_total) || 0)}
      sublabel={
        <span className="flex flex-col gap-0.5">
          <span>Outstanding balance</span>
          <span className="text-[10px] text-muted-foreground/70">
            certified{s.as_of ? ` · MyCase AR as of ${format(ymd(String(s.as_of)), "MMM d")}` : ""}
          </span>
        </span>
      }
    />
  );
}

/** AR AT RISK — 60+ days past due (v_exec_ar_at_risk hourly cache of ar_dashboard; the legacy
 *  definition, unchanged), with its share of the same book. */
function ArAtRiskKpi() {
  const q = useExecArAtRisk();
  const label = "AR at Risk";
  if (q.isLoading) return <HeroKpi label={label} value="…" accent="warn" sublabel="Loading AR aging" />;
  const r = q.data;
  if (q.isError || !r) {
    return <HeroKpi label={label} value={DASH} accent="warn" sublabel={<TileError onRetry={() => q.refetch()} />} />;
  }
  const share = r.ar_total > 0 ? (r.ar_at_risk_60 / r.ar_total) * 100 : 0;
  const refreshed = r.refreshed_at ? new Date(r.refreshed_at) : null;
  // The previous tile used ar_dashboard days_past_due > 60 (contract grain). Kept in the tooltip so the
  // basis change (Jeff 2026-10-13) is visible, not silent.
  const tip =
    "Invoice clock: open invoices more than 60 days past their effective due date, counted from the last payment. " +
    (r.legacy_contract_dpd_at_risk_60 != null
      ? `Previous basis (contract days past due > 60): ${fmtMoney(r.legacy_contract_dpd_at_risk_60)}.`
      : "");
  return (
    <HeroKpi
      label={label}
      value={<span title={tip}>{fmtMoney(r.ar_at_risk_60)}</span>}
      accent="warn"
      sublabel={
        <span className="flex flex-col gap-0.5" title={tip}>
          <span>60+ days · {share.toFixed(1)}% of AR</span>
          <span className="text-[10px] text-muted-foreground/70">
            {r.invoices_at_risk_60.toLocaleString()} invoices · {r.clients_at_risk_60.toLocaleString()} clients
            {refreshed ? ` · updated ${fmtUpdated(refreshed)}` : ""}
          </span>
          <span className="text-[10px] text-muted-foreground/70">
            basis: invoice clock (days since last payment / effective due date)
          </span>
        </span>
      }
    />
  );
}

/** Placeholder for the legacy sections (Money Flow, Aging, Activity, Movement, Failed), which
 *  still compute in the browser from useInsightsData. They no longer gate the hero band. */
function LegacyPending({
  title,
  loading,
  error,
  onRetry,
  className = "",
}: {
  title: string;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  className?: string;
}) {
  return (
    <Card className={`rounded-2xl border-border/70 p-6 shadow-none ${className}`}>
      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary">{title}</div>
      <div className="mt-6 py-6 text-center text-xs text-muted-foreground">
        {error || !loading ? <TileError onRetry={onRetry} /> : "Loading detail…"}
      </div>
    </Card>
  );
}

/** Cache stamp: time only when refreshed today, else date + time. */
function fmtUpdated(d: Date): string {
  return format(d, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd") ? format(d, "h:mm a") : format(d, "MMM d, h:mm a");
}
