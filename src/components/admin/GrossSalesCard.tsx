/**
 * Gross sales · dollars down (Jeff 2026-10-23: "it should almost build upon what we had for the case mix ... service sold
 * section, but not in so much detail ... just show the dollars down aspect of it so I can back track how revenue was made
 * for that month, but they should read the same number $ put down on signing").
 *
 * Source of record: rpc exec_new_case_gross_sales_monthly (VP), one row per case OPEN month. Month level only -- the
 * per-invoice drill-down stays in Case Mix. "Paid at signing" here is the same figure, by the same name, as the Case Mix
 * tile (signing_cash_net_by_open_month, VP-aligned). Counts are cases, never clients.
 */
import type { ReactNode } from "react";
import { format } from "date-fns";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell, Legend } from "recharts";
import { Card } from "@/components/ui/card";
import { useNewCaseGrossSalesMonthly, useExecCaseMixMonthly, type NewCaseGrossSalesMonth } from "@/hooks/useSupabaseData";
import { caseMixMonthPaidAtSigning } from "@/lib/caseMix";

const DOWN_COLOR = "#2a78d6"; // categorical slot 1 (same role as "Paid at signing" on New-case sales cash)
const GROSS_COLOR = "#a3a29c"; // neutral context series
const NM = "n/m";
const TREND_MONTHS = 12;

function fmtMoney(n: number) {
  const sign = n < 0 ? "−" : "";
  const a = Math.abs(n);
  if (a >= 1_000_000) return `${sign}$${(a / 1_000_000).toFixed(2)}M`;
  if (a >= 1_000) return `${sign}$${(a / 1_000).toFixed(1)}k`;
  return `${sign}$${Math.round(a).toLocaleString()}`;
}
const money = (v: number | null | undefined) => (v == null ? "—" : fmtMoney(v));
function ymd(d: string): Date {
  const [y, m, dd] = d.slice(0, 10).split("-").map(Number);
  return new Date(y, (m || 1) - 1, dd || 1);
}
const isNM = (r: NewCaseGrossSalesMonth) => (r.data_quality ?? "").toUpperCase() === "NOT_MEASURABLE";
const isThin = (r: NewCaseGrossSalesMonth) => (r.data_quality ?? "").toUpperCase() === "THIN";
const isPartial = (r: NewCaseGrossSalesMonth) => ["open", "partial"].includes((r.month_status ?? "").toLowerCase());
const downDisplay = (r: NewCaseGrossSalesMonth) => (isNM(r) || r.signing_cash_net_by_open_month == null ? NM : fmtMoney(r.signing_cash_net_by_open_month));
/** The view stores the percent as a percent number: divide by 100 for a percent format. */
const pctDisplay = (r: NewCaseGrossSalesMonth) =>
  isNM(r) || r.signing_cash_pct_of_gross == null
    ? NM
    : (r.signing_cash_pct_of_gross / 100).toLocaleString("en-US", { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1 });

export default function GrossSalesCard({ monthVal, className = "" }: { monthVal: string; className?: string }) {
  const q = useNewCaseGrossSalesMonthly();
  const all = q.data?.rows ?? [];
  const idx = all.findIndex((r) => r.month.slice(0, 7) === monthVal);
  const row = idx >= 0 ? all[idx] : null;
  const trend = idx >= 0 ? all.slice(Math.max(0, idx - TREND_MONTHS + 1), idx + 1) : all.slice(-TREND_MONTHS);
  const monthLabel = format(ymd(`${monthVal}-01`), "MMMM yyyy");
  // Same-number cross-check against the Case Mix tile (shared query key, so no extra fetch). If the two spines disagree
  // the card says so out loud -- it never silently picks one.
  const caseMix = useExecCaseMixMonthly();
  const caseMixPaid = caseMixMonthPaidAtSigning(caseMix.data, monthVal);
  const ownPaid = row && !isNM(row) ? row.signing_cash_net_by_open_month : null;
  const mismatch = ownPaid != null && caseMixPaid != null && Math.abs(ownPaid - caseMixPaid) >= 0.5 ? ownPaid - caseMixPaid : null;

  return (
    <Card className={`rounded-2xl border-border/70 p-6 shadow-none ${className}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary">Gross Sales</div>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">Gross sales · dollars down</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">by case open month · {monthLabel}</p>
        </div>
        {row && (isThin(row) || isNM(row)) && (
          <span
            data-testid="gross-quality-badge"
            title={row.quality_note ?? undefined}
            className={`mt-1 cursor-help rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
              isThin(row) ? "bg-warning/15 text-warning" : "bg-muted text-muted-foreground"
            }`}
          >
            {isThin(row) ? "thin" : "not measurable"}
          </span>
        )}
      </div>

      {q.isLoading ? (
        <State>Loading gross sales…</State>
      ) : q.isError ? (
        <State>
          <span className="text-destructive">Couldn&apos;t load gross sales.</span>{" "}
          <button type="button" onClick={() => q.refetch()} className="rounded-full border border-border/70 px-2 py-0.5 text-[10px] text-muted-foreground hover:bg-muted">
            Retry
          </button>
        </State>
      ) : !q.data?.available ? (
        <State>
          <div className="font-medium text-foreground">Awaiting certified data</div>
          <div className="mt-1">The gross-sales spine is being applied. No numbers are shown until it is live.</div>
        </State>
      ) : all.length === 0 ? (
        <State>
          <div className="font-medium text-foreground">No access</div>
          <div className="mt-1">Gross sales are visible to admins and partners only.</div>
        </State>
      ) : !row ? (
        <State>No gross-sales row for {monthLabel} yet.</State>
      ) : (
        <div className="mt-4 space-y-3">
          <div data-testid="gross-headline">
            <div className="text-[10px] font-medium uppercase tracking-[0.1em] text-muted-foreground/70">
              Paid at signing
              {isPartial(row) && (
                <span className="ml-1.5 rounded-full bg-warning/15 px-1.5 py-0.5 text-[9px] font-semibold normal-case tracking-normal text-warning">
                  partial · through {row.payments_through ? format(ymd(row.payments_through), "MMM d") : "—"}
                </span>
              )}
            </div>
            <div className="mt-1 text-3xl font-semibold leading-none tracking-tight tabular-nums" data-testid="gross-paid-at-signing">
              {downDisplay(row)}
            </div>
            <div className="mt-1 text-xs text-muted-foreground tabular-nums">
              {pctDisplay(row)} of {money(row.gross_contract_value)} gross sold
              {row.revenue_cases != null ? ` · ${row.revenue_cases.toLocaleString()} new ${row.revenue_cases === 1 ? "case" : "cases"}` : ""}
            </div>
          </div>

          {mismatch != null && caseMixPaid != null && (
            <p role="alert" data-testid="gross-casemix-mismatch" className="rounded-lg bg-warning/10 px-2.5 py-1.5 text-[11px] text-foreground">
              Case Mix shows {fmtMoney(caseMixPaid)} paid at signing for {monthLabel} ({mismatch > 0 ? "+" : "−"}
              {fmtMoney(Math.abs(mismatch))} here). The two spines are being aligned; treat both as provisional.
            </p>
          )}

          <p className="text-[11px] text-muted-foreground tabular-nums" data-testid="gross-piles">
            Sold {money(row.sold_contract_value)} · Call first {money(row.call_first_contract_value)} · No cash (delete){" "}
            {money(row.delete_no_cash_contract_value)} · Awaiting {money(row.awaiting_contract_value)}
          </p>

          {trend.length >= 2 && (
            <ResponsiveContainer width="100%" height={150}>
              <BarChart
                data={trend.map((r) => ({
                  ...r,
                  label: `${format(ymd(r.month), "MMM")}${isPartial(r) ? "*" : ""}`,
                  gross: r.gross_contract_value,
                  down: isNM(r) ? null : r.signing_cash_net_by_open_month,
                }))}
                margin={{ top: 4, right: 0, left: 0, bottom: 0 }}
                barGap={1}
                barCategoryGap="18%"
              >
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.6} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} interval={0} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tickLine={false} axisLine={false} width={40} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v: number) => fmtMoney(v)} />
                <Tooltip cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }} content={<GrossTooltip />} />
                <Legend verticalAlign="top" align="right" height={16} iconType="square" iconSize={7} wrapperStyle={{ fontSize: 9 }} />
                <Bar dataKey="gross" name="Gross sold" fill={GROSS_COLOR} radius={[3, 3, 0, 0]} isAnimationActive={false}>
                  {trend.map((r) => (
                    <Cell key={r.month} fillOpacity={r.month.slice(0, 7) === monthVal ? 1 : 0.55} />
                  ))}
                </Bar>
                <Bar dataKey="down" name="Paid at signing" fill={DOWN_COLOR} radius={[3, 3, 0, 0]} isAnimationActive={false}>
                  {trend.map((r) => (
                    <Cell key={r.month} fillOpacity={r.month.slice(0, 7) === monthVal ? 1 : 0.55} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}

          <p className="text-[10px] leading-snug text-muted-foreground/80">
            By case open month. Paid at signing = money down on the new case&apos;s own invoices from 3 days before to 7 days after it
            opened, net; same figure as Case Mix &ldquo;Paid at signing&rdquo;. n/m = not measurable (invoices re-issued later), not $0.
            {trend.some(isPartial) ? " * partial month." : ""}
          </p>
        </div>
      )}
    </Card>
  );
}

function State({ children }: { children: ReactNode }) {
  return <div className="mt-6 rounded-xl border border-dashed border-border/70 py-6 text-center text-xs text-muted-foreground">{children}</div>;
}

function GrossTooltip({ active, payload }: { active?: boolean; payload?: any[] }) {
  if (!active || !payload?.length) return null;
  const r = payload[0].payload as NewCaseGrossSalesMonth;
  const line = (k: string, v: string) => (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{k}</span>
      <span className="tabular-nums text-foreground">{v}</span>
    </div>
  );
  return (
    <div className="min-w-[200px] rounded-lg border border-border bg-popover px-3 py-2 text-[11px] shadow-md">
      <div className="mb-1 font-semibold text-foreground">
        {format(ymd(r.month), "MMMM yyyy")}
        {isPartial(r) ? " · partial" : ""}
      </div>
      {line("Gross sold", money(r.gross_contract_value))}
      {line("Paid at signing", downDisplay(r))}
      {line("Down % of gross", pctDisplay(r))}
      {line("New cases", r.revenue_cases != null ? r.revenue_cases.toLocaleString() : "—")}
      {r.data_quality && line("Data quality", r.data_quality.replace(/_/g, " "))}
    </div>
  );
}
