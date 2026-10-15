/**
 * Delinquent Collections — KEY METRIC panel (Executive Insights, Admin Dashboard).
 *
 * Jeff 2026-10-14: "we should know delquent dollars collected that should be a key metrick for as along
 * with willing payers and if we have added any new payers manualy or automaticaly should be baked in there".
 *
 * Reads ONLY v_delinquent_collections_kpi (cached delinquent_collections_metrics() over the delinquent-cash
 * spine). Month to date is cut at the ledger's complete-through day and compared with the same day range of
 * the prior month — never a partial day against a full one. Definitions: docs/metrics/delinquent-collections.md.
 */
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, ArrowDownRight, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDelinquentCollectionsBasis, useDelinquentCollectionsKpi, useDelinquentCollectionsPlanLoads } from "@/hooks/useSupabaseData";
import {
  type DcmKpiRow,
  dayLabel,
  isQualityOk,
  pctChange,
  rangeLabel,
  selectDcmView,
  trendLabel,
} from "@/lib/delinquentCollections";

// Categorical slots 1-3 of the validated default palette (adjacent-pair CVD ΔE ≥ 9.2, light surface).
// Slot 3 is under 3:1 contrast on white, so the trend ships with a table view (relief rule).
const SERIES = [
  { key: "manual31", name: "Manual · 31+ days past due", color: "#2a78d6" },
  { key: "manual130", name: "Manual · 1–30 days past due", color: "#eb6834" },
  { key: "autopay", name: "Autopay draft · delinquent client", color: "#1baf7a" },
] as const;

const money = (n: number | null | undefined) => (n === null || n === undefined ? "—" : `$${Math.round(n).toLocaleString()}`);
const moneyShort = (n: number) => (n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M` : n >= 10_000 ? `$${Math.round(n / 1000)}k` : money(n));
const count = (n: number | null | undefined) => (n === null || n === undefined ? "—" : n.toLocaleString());

function Delta({ cur, prev, invert = false }: { cur: number | null | undefined; prev: number | null | undefined; invert?: boolean }) {
  const p = pctChange(cur, prev);
  if (p === null) return null;
  const up = p >= 0;
  const good = invert ? !up : up;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${good ? "text-emerald-700" : "text-red-700"}`}>
      <Icon className="h-3 w-3" aria-hidden />
      {up ? "+" : ""}
      {p}%
    </span>
  );
}

function Grain({ children }: { children: string }) {
  return <span className="rounded-full border border-border/70 px-1.5 py-px text-[9px] font-medium uppercase tracking-wider text-muted-foreground">{children}</span>;
}

function Line({ label, cur, prev, fmt = count, title }: { label: string; cur: number | null; prev: number | null; fmt?: (n: number | null) => string; title?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1 text-xs" title={title}>
      <span className="text-muted-foreground">{label}</span>
      <span className="whitespace-nowrap tabular-nums">
        <span className="font-semibold text-foreground">{fmt(cur)}</span>
        <span className="text-muted-foreground"> vs {fmt(prev)}</span>
      </span>
    </div>
  );
}

export default function DelinquentCollectionsPanel() {
  const { data, isLoading, isError, refetch } = useDelinquentCollectionsKpi();
  const { data: planLoads } = useDelinquentCollectionsPlanLoads(4);
  const { data: basis } = useDelinquentCollectionsBasis();
  const view = useMemo(() => selectDcmView(data), [data]);
  const [grain, setGrain] = useState<"month" | "week">("month");
  const [showTable, setShowTable] = useState(false);

  if (isLoading) return <Skeleton className="h-[520px] w-full rounded-2xl" />;
  if (isError || !view) {
    return (
      <Card className="rounded-2xl border-border/70 p-6 shadow-none">
        <p className="text-sm font-semibold">Delinquent Collections</p>
        <p className="mt-1 text-xs text-muted-foreground">
          The delinquent-collections view did not load, so no figure is shown.{" "}
          <button className="underline" onClick={() => refetch()}>Try again</button>
        </p>
      </Card>
    );
  }

  const { mtd, prior } = view;
  const curLabel = rangeLabel(mtd.period_start, mtd.period_end);
  const prevLabel = rangeLabel(prior.period_start, prior.period_end);
  const partialDayNote =
    mtd.ledger_max_txn_date && mtd.ledger_max_txn_date > mtd.complete_through
      ? ` · ${dayLabel(mtd.ledger_max_txn_date)} is only partly loaded and is left out`
      : "";
  const trendRows: DcmKpiRow[] = grain === "month" ? view.months : view.weeks.slice(-16);
  const chartData = trendRows.map((r) => ({
    label: trendLabel(r),
    range: rangeLabel(r.period_start, r.period_end),
    manual31: r.delinquent_manual_31plus_cash,
    manual130: r.delinquent_manual_cash - r.delinquent_manual_31plus_cash,
    autopay: r.delinquent_autopay_cash,
    payers: r.willing_payers,
    quality: r.quality,
  }));
  const flagged = trendRows.filter((r) => !isQualityOk(r.quality));
  const qualityOk = isQualityOk(mtd.quality);

  return (
    <Card className="rounded-2xl border-border/70 p-6 shadow-none" data-testid="delinquent-collections-panel">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary">Key Metric</div>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">Delinquent Collections</h2>
          <p className="mt-0.5 text-xs text-muted-foreground" data-testid="dcm-window">
            Month to date <strong className="text-foreground">{curLabel}</strong> vs the same days last month <strong className="text-foreground">{prevLabel}</strong> ·
            ledger complete through <strong className="text-foreground">{dayLabel(mtd.complete_through)}</strong>
            {partialDayNote}
          </p>
        </div>
        <span
          data-testid="dcm-basis"
          title="Certification status from ar_object_basis_registry (delinquent-cash spine + this KPI). Shows 'derived' until the registry says certified."
          className={`rounded-full border px-2.5 py-1 text-[10px] font-medium ${basis?.certified ? "border-emerald-300 text-emerald-700" : "border-amber-300 text-amber-800"}`}
        >
          {basis?.certified ? "certified" : "derived · spine certification pending"}
        </span>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {/* 1. Delinquent dollars collected — transaction grain. The MTD headline is MANUAL only: autopay drafts run as
            one mid-month batch, so a month-to-date autopay figure swings with the batch date (full months are in the trend). */}
        <div className="rounded-xl border border-border/70 p-4" data-testid="dcm-cash">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Delinquent $ collected · manual</p>
            <Grain>payments</Grain>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold tabular-nums" data-testid="dcm-manual">{money(mtd.delinquent_manual_cash)}</span>
            <Delta cur={mtd.delinquent_manual_cash} prev={prior.delinquent_manual_cash} />
          </div>
          <p className="text-xs text-muted-foreground">vs {money(prior.delinquent_manual_cash)} · {count(mtd.n_delinquent_manual_txns)} payments vs {count(prior.n_delinquent_manual_txns)}</p>
          <div className="mt-3 divide-y divide-border/60">
            <Line label="Manual, 31+ days past due" cur={mtd.delinquent_manual_31plus_cash} prev={prior.delinquent_manual_31plus_cash} fmt={money} />
            <Line label="Manual, 1–30 days past due" cur={mtd.delinquent_manual_cash - mtd.delinquent_manual_31plus_cash} prev={prior.delinquent_manual_cash - prior.delinquent_manual_31plus_cash} fmt={money} />
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground">
            Manual = taken by staff or paid by the client, not an autopay draft. Autopay drafts run as one mid-month batch, so
            compare them on full months in the trend below.
          </p>
        </div>

        {/* 2. Willing payers — client grain (AR-snapshot client key) */}
        <div className="rounded-xl border border-border/70 p-4" data-testid="dcm-willing">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Willing payers · manual</p>
            <Grain>clients</Grain>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold tabular-nums" data-testid="dcm-willing-manual">{count(mtd.willing_payers_manual)}</span>
            <Delta cur={mtd.willing_payers_manual} prev={prior.willing_payers_manual} />
          </div>
          <p className="text-xs text-muted-foreground">past-due clients who paid manually · vs {count(prior.willing_payers_manual)}</p>
          <div className="mt-3 divide-y divide-border/60">
            <Line label="All channels (manual or autopay)" cur={mtd.willing_payers} prev={prior.willing_payers} />
            <Line label="31+ days past due when they paid" cur={mtd.willing_payers_31plus} prev={prior.willing_payers_31plus} />
          </div>
          <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900" data-testid="dcm-broken-autodraft">
            <p className="font-semibold">Autopay on, plan past due: {count(mtd.broken_autodraft_clients)} clients</p>
            <p className="mt-0.5 opacity-80">
              {count(mtd.broken_autodraft_plans)} plans, more than {mtd.broken_autodraft_grace_days} days past due as of {dayLabel(mtd.broken_autodraft_as_of)} ·
              plan balance {moneyShort(mtd.broken_autodraft_plan_balance)} — already inside AR, never add it to AR
            </p>
            <ul className="mt-1 space-y-0.5 opacity-90">
              <li>Draft failed after the due date: <strong>{count(mtd.failed_draft_plans)}</strong> plans ({moneyShort(mtd.failed_draft_plan_balance)})</li>
              <li>Failed only before the due date: {count(mtd.failed_before_due_only_plans)} ({moneyShort(mtd.failed_before_due_only_plan_balance)})</li>
              <li>No failed draft — do not send a card-failed notice: {count(mtd.no_failed_draft_plans)} ({moneyShort(mtd.no_failed_draft_plan_balance)})</li>
            </ul>
          </div>
        </div>

        {/* 3. New payers — resumed (client grain), intake (payer grain), new plans per feed load (plan grain) */}
        <div className="rounded-xl border border-border/70 p-4" data-testid="dcm-new">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">New payers added</p>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <div>
              <p className="text-[11px] text-muted-foreground">Back after {mtd.silence_days}+ days silent</p>
              {mtd.payer_metrics_valid ? (
                <>
                  <p className="text-2xl font-bold tabular-nums" data-testid="dcm-resumed">{count(mtd.resumed_payers)}</p>
                  <p className="text-[11px] text-muted-foreground">clients · vs {count(prior.resumed_payers)} <Delta cur={mtd.resumed_payers} prev={prior.resumed_payers} /></p>
                  <p className="mt-1 text-[11px]">manual {count(mtd.resumed_payers_manual)} · automatic {count(mtd.resumed_payers_automatic)}</p>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">Not enough history before this window.</p>
              )}
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">New intake payers</p>
              <p className="text-2xl font-bold tabular-nums" data-testid="dcm-intake">{count(mtd.intake_payers)}</p>
              <p className="text-[11px] text-muted-foreground">payers · vs {count(prior.intake_payers)} <Delta cur={mtd.intake_payers} prev={prior.intake_payers} /></p>
              <p className="mt-1 text-[11px]">
                consult-size {count(mtd.intake_payers_consult_size)} · larger {count(mtd.intake_payers_retainer_size)} · on AR now {count(mtd.intake_payers_on_ar_now)}
              </p>
            </div>
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground">
            Back = a past-due client who paid after {mtd.silence_days}+ days with no payment (already counted in willing payers). Intake = a
            first-ever payment from someone not yet on the AR book; consult-size = a first payment of {money(mtd.consult_max)} or less.
          </p>
          <div className="mt-3 border-t border-border/60 pt-2" data-testid="dcm-new-plans">
            <p className="text-[11px] font-medium">New payment plans, by plan-feed load</p>
            {planLoads && planLoads.length > 0 ? (
              <table className="mt-1 w-full text-[11px] tabular-nums">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="font-normal">Load</th>
                    <th className="text-right font-normal">Days covered</th>
                    <th className="text-right font-normal">Autopay</th>
                    <th className="text-right font-normal">No autopay</th>
                  </tr>
                </thead>
                <tbody>
                  {planLoads.map((l) => (
                    <tr key={l.load_as_of}>
                      <td>{dayLabel(l.load_as_of)}</td>
                      <td className="text-right">{l.days_covered ?? "—"}</td>
                      <td className="text-right">{count(l.new_plans_autopay)}</td>
                      <td className="text-right">
                        {count(l.new_plans_manual)}
                        {l.new_plans_autopay_unknown > 0 ? ` (+${l.new_plans_autopay_unknown} unknown)` : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-[11px] text-muted-foreground">Plan-feed loads did not load.</p>
            )}
            <p className="mt-1 text-[10px] text-muted-foreground">
              Plans that first showed up in each MyCase plan-feed load. Dated by the load, not by when the plan was created, so loads are not
              compared month over month. Autopay = automatic enrollment; no autopay = manual.
            </p>
          </div>
        </div>
      </div>

      {/* Trend */}
      <div className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold">Delinquent $ collected — trend</p>
          <div className="flex items-center gap-2">
            <Tabs value={grain} onValueChange={(v) => setGrain(v as "month" | "week")}>
              <TabsList className="h-8">
                <TabsTrigger value="month" className="text-xs">Monthly</TabsTrigger>
                <TabsTrigger value="week" className="text-xs">Weekly</TabsTrigger>
              </TabsList>
            </Tabs>
            <button
              className="h-8 rounded-md border border-border/70 px-3 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={() => setShowTable((s) => !s)}
            >
              {showTable ? "Show chart" : "Show table"}
            </button>
          </div>
        </div>
        {showTable ? (
          <div className="mt-3 overflow-x-auto" data-testid="dcm-trend-table">
            <table className="w-full text-xs tabular-nums">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-1.5 pr-3 font-medium">Period</th>
                  <th className="py-1.5 pr-3 text-right font-medium">Manual</th>
                  <th className="py-1.5 pr-3 text-right font-medium">Manual 31+</th>
                  <th className="py-1.5 pr-3 text-right font-medium">Autopay</th>
                  <th className="py-1.5 pr-3 text-right font-medium">Willing payers</th>
                  <th className="py-1.5 pr-3 text-right font-medium">Unresolved</th>
                  <th className="py-1.5 font-medium">Quality</th>
                </tr>
              </thead>
              <tbody>
                {trendRows.map((r) => (
                  <tr key={r.period_kind + r.period_start} className="border-b border-border/40">
                    <td className="py-1 pr-3">{rangeLabel(r.period_start, r.period_end)}{r.is_partial ? " *" : ""}</td>
                    <td className="py-1 pr-3 text-right">{money(r.delinquent_manual_cash)}</td>
                    <td className="py-1 pr-3 text-right">{money(r.delinquent_manual_31plus_cash)}</td>
                    <td className="py-1 pr-3 text-right">{money(r.delinquent_autopay_cash)}</td>
                    <td className="py-1 pr-3 text-right">{count(r.willing_payers)}</td>
                    <td className="py-1 pr-3 text-right">{r.unresolved_pct === null ? "—" : `${r.unresolved_pct}%`}</td>
                    <td className="py-1">{isQualityOk(r.quality) ? "OK" : r.quality}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-3 h-[260px]" data-testid="dcm-trend-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: 4, bottom: 0 }} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(220 10% 46%)" tickLine={false} axisLine={false} interval={0} />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(220 10% 46%)" tickLine={false} axisLine={false} width={52}
                  tickFormatter={(v) => (v >= 1000 ? `$${Math.round(v / 1000)}k` : `$${v}`)} />
                <Tooltip
                  cursor={{ fill: "hsl(220 13% 95%)" }}
                  contentStyle={{ borderRadius: 8, border: "1px solid hsl(220 13% 88%)", fontSize: 12 }}
                  labelFormatter={(_, p) => {
                    const d = p?.[0]?.payload;
                    return d ? `${d.range} · ${d.payers.toLocaleString()} willing payers${isQualityOk(d.quality) ? "" : ` · ${d.quality}`}` : "";
                  }}
                  formatter={(value: number, name: string) => [money(value), name]}
                />
                <Legend iconType="square" wrapperStyle={{ fontSize: 12, paddingTop: 6 }} />
                {SERIES.map((s, i) => (
                  <Bar key={s.key} dataKey={s.key} name={s.name} stackId="d" fill={s.color} stroke="#ffffff" strokeWidth={1}
                    radius={i === SERIES.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]} maxBarSize={36} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        <p className="mt-1 text-[10px] text-muted-foreground">
          * partial period, cut at {dayLabel(mtd.complete_through)}.
          {flagged.length > 0 && <> Lower-confidence periods: {flagged.map((r) => `${trendLabel(r).replace("*", "")} (${r.quality.split(":")[0]})`).join(", ")}.</>}
          {grain === "week" && " Last 16 Monday weeks."}
        </p>
      </div>

      {/* Data quality */}
      <div
        className={`mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg px-3 py-2 text-[11px] ${qualityOk ? "bg-muted/40 text-muted-foreground" : "bg-amber-50 text-amber-900"}`}
        data-testid="dcm-quality"
      >
        {qualityOk ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> : <AlertTriangle className="h-3.5 w-3.5" aria-hidden />}
        <span className="font-semibold">{qualityOk ? "Data quality OK" : mtd.quality}</span>
        <span>
          Cash not matched to a client: <strong>{mtd.unresolved_pct === null ? "—" : `${mtd.unresolved_pct}%`}</strong> of settled cash ({money(mtd.unresolved_cash)})
          vs {prior.unresolved_pct === null ? "—" : `${prior.unresolved_pct}%`} last month — that cash can't be checked for delinquency, so the delinquent figures may be low
        </span>
        <span>· ledger complete through {dayLabel(mtd.complete_through)}</span>
        <span>· AR snapshot in force {dayLabel(mtd.snapshot_in_force_latest)}</span>
        {mtd.refreshed_at && <span>· refreshed {new Date(mtd.refreshed_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span>}
      </div>
    </Card>
  );
}
