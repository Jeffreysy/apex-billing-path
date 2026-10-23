/**
 * Cash Movement · Money Flow (Jeff 2026-10-23): the firm's CASH collected in the selected month, split the way
 * the COO workbook splits it -- autopay, manual, delinquent manual, delinquent autopay, consults, new sales, and
 * whatever is still unclassified. Source of record: v_firm_cash_movement_monthly (VP-certified, one row per cash
 * month; the seven buckets are mutually exclusive and sum to total_collected). Nothing here is computed from raw
 * payments and no figure is hardcoded: until the view is live the panel says "awaiting certified data".
 *
 * The AR roll-forward that used to own this card stays reachable on the second tab.
 */
import { useMemo, useState, type ReactNode } from "react";
import { format } from "date-fns";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts";
import { AlertTriangle, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useFirmCashMovementMonthly,
  CASH_MOVEMENT_BUCKETS,
  type CashMovementBucket,
  type FirmCashMovementMonth,
} from "@/hooks/useSupabaseData";

/** Display order = stack order = color slot order. Colors follow the bucket, never its rank (validated
 *  categorical slots 1-6 of the dataviz reference palette, light + dark; "Other" is a neutral, not a hue). */
const BUCKET_META: Record<CashMovementBucket, { label: string; varName: string }> = {
  autopay_current: { label: "Autopay", varName: "--cm-1" },
  manual_current: { label: "Manual", varName: "--cm-2" },
  delinquent_manual: { label: "Delinquent – manual", varName: "--cm-3" },
  delinquent_autopay: { label: "Delinquent – autopay", varName: "--cm-4" },
  consult_cash: { label: "Consults", varName: "--cm-5" },
  new_sales_cash: { label: "New sales", varName: "--cm-6" },
  other_unresolved: { label: "Other / unclassified", varName: "--cm-other" },
};
const colorOf = (b: CashMovementBucket) => `var(${BUCKET_META[b].varName})`;

const PALETTE_CSS = `
.cash-mix{--cm-1:#2a78d6;--cm-2:#eb6834;--cm-3:#1baf7a;--cm-4:#eda100;--cm-5:#e87ba4;--cm-6:#008300;--cm-other:#a3a29c}
.dark .cash-mix{--cm-1:#3987e5;--cm-2:#d95926;--cm-3:#199e70;--cm-4:#c98500;--cm-5:#d55181;--cm-6:#008300;--cm-other:#6f6e69}
`;

const TREND_MONTHS = 12;
const DIFF_TOLERANCE = 0.005; // half a cent

function fmtMoney(n: number) {
  const sign = n < 0 ? "−" : "";
  const a = Math.abs(n);
  if (a >= 1_000_000) return `${sign}$${(a / 1_000_000).toFixed(2)}M`;
  if (a >= 1_000) return `${sign}$${(a / 1_000).toFixed(1)}k`;
  return `${sign}$${Math.round(a).toLocaleString()}`;
}
function fmtExact(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
}
/** yyyy-MM-dd as a LOCAL date (no UTC shift). */
function ymd(d: string): Date {
  const [y, m, dd] = d.slice(0, 10).split("-").map(Number);
  return new Date(y, (m || 1) - 1, dd || 1);
}
const shortMonth = (r: FirmCashMovementMonth) => format(ymd(r.month), "MMM yy");
const longMonth = (r: FirmCashMovementMonth) => r.month_label || format(ymd(r.month), "MMMM yyyy");

/** data_quality may arrive as text, a json array or a json object; every entry is shown, none hidden. */
function qualityNotes(dq: unknown): string[] {
  if (dq === null || dq === undefined || dq === "") return [];
  if (typeof dq === "string") {
    try {
      const parsed = JSON.parse(dq);
      if (parsed && typeof parsed === "object") return qualityNotes(parsed);
    } catch {
      /* plain text */
    }
    return [dq];
  }
  if (Array.isArray(dq)) return dq.flatMap((x) => qualityNotes(x));
  if (typeof dq === "object") {
    return Object.entries(dq as Record<string, unknown>)
      .filter(([, v]) => v !== null && v !== undefined && v !== "")
      .map(([k, v]) => `${k.replace(/_/g, " ")}: ${typeof v === "object" ? JSON.stringify(v) : String(v)}`);
  }
  return [String(dq)];
}
const isCleanNote = (s: string) => /^(ok|clean|good|pass|passed|green|healthy)$/i.test(s.trim());

export default function CashMovementPanel({
  monthVal,
  arRollForward,
  arCaption,
  className = "",
}: {
  monthVal: string; // yyyy-MM
  arRollForward: ReactNode;
  arCaption: string;
  className?: string;
}) {
  const [tab, setTab] = useState<"cash" | "ar">("cash");
  const q = useFirmCashMovementMonthly();
  const rows = q.data?.rows ?? [];
  const idx = rows.findIndex((r) => r.month.slice(0, 7) === monthVal);
  const row = idx >= 0 ? rows[idx] : null;
  const monthLabel = format(ymd(`${monthVal}-01`), "MMMM yyyy");

  let cashCaption: string;
  if (q.isLoading) cashCaption = `Loading certified cash · ${monthLabel}`;
  else if (q.isError) cashCaption = `Cash movement unavailable right now · ${monthLabel}`;
  else if (!q.data?.available) cashCaption = `Awaiting certified data · ${monthLabel}`;
  else if (!row) cashCaption = `No certified cash month for ${monthLabel}`;
  else if (row.month_status === "open")
    cashCaption = `Provisional · through ${row.ledger_through ? format(ymd(row.ledger_through), "MMM d, yyyy") : "date not stated"} · ${monthLabel}`;
  else cashCaption = `Closed month · ${longMonth(row)}`;

  return (
    <Card className={`cash-mix rounded-2xl border-border/70 p-6 shadow-none ${className}`}>
      <style>{PALETTE_CSS}</style>
      <Tabs value={tab} onValueChange={(v) => setTab(v as "cash" | "ar")}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary">Cash Movement</div>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">Money Flow</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">{tab === "cash" ? cashCaption : arCaption}</p>
          </div>
          <TabsList className="h-8 rounded-full border border-border/70 bg-muted/30 p-0.5">
            <TabsTrigger value="cash" className="h-7 rounded-full px-3 text-[11px]">Cash movement</TabsTrigger>
            <TabsTrigger value="ar" className="h-7 rounded-full px-3 text-[11px]">AR roll-forward</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="cash" className="mt-5">
          {q.isLoading ? (
            <StateBox>Loading certified cash…</StateBox>
          ) : q.isError ? (
            <StateBox>
              <span className="text-destructive">Couldn&apos;t load the cash movement view.</span>{" "}
              <button
                type="button"
                onClick={() => q.refetch()}
                className="ml-1 rounded-full border border-border/70 px-2 py-0.5 text-[10px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Retry
              </button>
              {(q.error as any)?.message ? (
                <div className="mt-1 text-[10px] text-muted-foreground/80">{String((q.error as any).message)}</div>
              ) : null}
            </StateBox>
          ) : !q.data?.available ? (
            <StateBox>
              <div className="font-medium text-foreground">Awaiting certified data</div>
              <div className="mx-auto mt-1 max-w-md">
                The firm cash-movement view (autopay, manual, delinquent, consults, new sales) is being certified.
                No numbers are shown until it is live.
              </div>
            </StateBox>
          ) : !row ? (
            <StateBox>
              No certified cash month for {monthLabel} yet.
              {rows.length > 0 ? ` Latest certified month: ${longMonth(rows[rows.length - 1])}.` : ""}
            </StateBox>
          ) : (
            <CashMonth row={row} prev={idx > 0 ? rows[idx - 1] : null} trend={rows.slice(Math.max(0, idx - TREND_MONTHS + 1), idx + 1)} />
          )}
        </TabsContent>

        <TabsContent value="ar" className="mt-0">
          {arRollForward}
        </TabsContent>
      </Tabs>
    </Card>
  );
}

function StateBox({ children }: { children: ReactNode }) {
  return <div className="rounded-xl border border-dashed border-border/70 py-8 text-center text-xs text-muted-foreground">{children}</div>;
}

function CashMonth({ row, prev, trend }: { row: FirmCashMovementMonth; prev: FirmCashMovementMonth | null; trend: FirmCashMovementMonth[] }) {
  const [hover, setHover] = useState<CashMovementBucket | null>(null);
  const total = row.total_collected;
  const bucketSum = CASH_MOVEMENT_BUCKETS.reduce((s, b) => s + row[b], 0);
  const viewDiff = row.reconciliation_diff ?? 0;
  const appDiff = total - bucketSum;
  const unreconciled = Math.abs(viewDiff) > DIFF_TOLERANCE || Math.abs(appDiff) > DIFF_TOLERANCE;
  const negatives = CASH_MOVEMENT_BUCKETS.filter((b) => row[b] < 0);
  const positiveSum = CASH_MOVEMENT_BUCKETS.reduce((s, b) => s + Math.max(0, row[b]), 0) || 1;
  const maxBucket = Math.max(1, ...CASH_MOVEMENT_BUCKETS.map((b) => Math.abs(row[b])));
  const share = (r: FirmCashMovementMonth, b: CashMovementBucket) => (r.total_collected ? (r[b] / r.total_collected) * 100 : 0);
  const isOpen = row.month_status === "open";
  const notes = qualityNotes(row.data_quality);
  const hovered = hover ? { b: hover, v: row[hover], p: share(row, hover) } : null;

  return (
    <div className="space-y-5">
      {/* Headline */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[10px] font-medium uppercase tracking-[0.1em] text-muted-foreground/70">Total collected · {longMonth(row)}</div>
          <div className="mt-1 text-[28px] font-semibold leading-none tracking-tight tabular-nums" title={fmtExact(total)}>
            {fmtMoney(total)}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 text-[11px] text-muted-foreground">
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
              isOpen ? "bg-warning/15 text-warning" : "bg-success/10 text-success"
            }`}
          >
            {isOpen
              ? `Provisional · through ${row.ledger_through ? format(ymd(row.ledger_through), "MMM d") : "—"}`
              : "Closed"}
          </span>
          <span>
            {row.n_payments != null ? `${row.n_payments.toLocaleString()} payments` : ""}
            {row.basis ? `${row.n_payments != null ? " · " : ""}basis: ${row.basis}` : ""}
          </span>
        </div>
      </div>

      {unreconciled && (
        <div role="alert" className="flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/5 p-3 text-xs text-destructive">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <div>
            <div className="font-semibold">The buckets do not add up to total collected for {longMonth(row)}.</div>
            <div className="mt-0.5">
              Total {fmtExact(total)} vs buckets {fmtExact(bucketSum)}
              {Math.abs(viewDiff) > DIFF_TOLERANCE ? ` · view reconciliation difference ${fmtExact(viewDiff)}` : ""}
              . Treat this month&apos;s split as unverified until the VP clears it.
            </div>
          </div>
        </div>
      )}

      {/* Part-to-whole: one horizontal stacked bar, fixed bucket order, 2px gaps */}
      <div>
        <div className="mb-1.5 h-4 text-[11px] text-muted-foreground" aria-live="polite">
          {hovered ? (
            <span>
              <span className="font-medium text-foreground">{BUCKET_META[hovered.b].label}</span> · {fmtMoney(hovered.v)} ·{" "}
              {hovered.p.toFixed(1)}% of collected
            </span>
          ) : (
            "Share of cash collected"
          )}
        </div>
        <div className="flex h-7 w-full gap-[2px] overflow-hidden rounded-[4px]" role="img" aria-label={`Cash collected in ${longMonth(row)} by bucket`}>
          {CASH_MOVEMENT_BUCKETS.filter((b) => row[b] > 0).map((b) => (
            <div
              key={b}
              data-bucket={b}
              title={`${BUCKET_META[b].label}: ${fmtExact(row[b])} (${share(row, b).toFixed(1)}%)`}
              onMouseEnter={() => setHover(b)}
              onMouseLeave={() => setHover(null)}
              className="h-full transition-opacity"
              style={{
                width: `${(row[b] / positiveSum) * 100}%`,
                background: colorOf(b),
                opacity: hover && hover !== b ? 0.45 : 1,
                minWidth: 2,
              }}
            />
          ))}
        </div>
      </div>

      {/* Breakdown table = legend + direct labels + table view */}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/60 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70">
            <th className="pb-2 pl-1">Bucket</th>
            <th className="hidden pb-2 sm:table-cell" />
            <th className="pb-2 text-right">Collected</th>
            <th className="pb-2 text-right">% of total</th>
            <th className="pb-2 pr-1 text-right" title="Change in share of collected vs the prior month, in percentage points">
              vs {prev ? format(ymd(prev.month), "MMM") : "prior"}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {CASH_MOVEMENT_BUCKETS.map((b) => {
            const p = share(row, b);
            const dpp = prev ? p - share(prev, b) : null;
            return (
              <tr
                key={b}
                data-testid={`cm-row-${b}`}
                onMouseEnter={() => setHover(b)}
                onMouseLeave={() => setHover(null)}
                className={hover === b ? "bg-muted/30" : ""}
              >
                <td className="py-2 pl-1">
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ background: colorOf(b) }} />
                    <span className="text-foreground">{BUCKET_META[b].label}</span>
                  </span>
                </td>
                <td className="hidden w-[30%] py-2 pr-3 sm:table-cell">
                  <div className="h-1.5 rounded-full bg-muted/50">
                    <div
                      className="h-1.5 rounded-full"
                      style={{ width: `${(Math.abs(row[b]) / maxBucket) * 100}%`, background: colorOf(b) }}
                    />
                  </div>
                </td>
                <td className="py-2 text-right font-mono text-[13px] font-semibold tabular-nums" title={fmtExact(row[b])}>
                  {fmtMoney(row[b])}
                </td>
                <td className="py-2 text-right font-mono text-[13px] tabular-nums text-muted-foreground">{p.toFixed(1)}%</td>
                <td className="py-2 pr-1 text-right font-mono text-[12px] tabular-nums text-muted-foreground">
                  {dpp == null ? "—" : `${dpp >= 0 ? "+" : "−"}${Math.abs(dpp).toFixed(1)} pp`}
                </td>
              </tr>
            );
          })}
          <tr className="border-t border-border/70">
            <td className="py-2 pl-1 font-medium">Total collected</td>
            <td className="hidden sm:table-cell" />
            <td className="py-2 text-right font-mono text-[13px] font-semibold tabular-nums" title={fmtExact(total)}>{fmtMoney(total)}</td>
            <td className="py-2 text-right font-mono text-[13px] tabular-nums text-muted-foreground">100%</td>
            <td />
          </tr>
        </tbody>
      </table>
      {isOpen && prev && (
        <p className="-mt-3 text-[10px] text-muted-foreground/80">
          Share change compares a partial month with a full one; dollar totals are not comparable yet.
        </p>
      )}

      <CashTrend rows={trend} selected={row.month} />

      {(negatives.length > 0 || notes.length > 0) && (
        <div className="space-y-1.5">
          {negatives.length > 0 && (
            <Note tone="warn">
              Negative bucket{negatives.length > 1 ? "s" : ""} this month (refunds or reversals):{" "}
              {negatives.map((b) => `${BUCKET_META[b].label} ${fmtMoney(row[b])}`).join(" · ")}. They reduce the total but
              are not drawn in the bar.
            </Note>
          )}
          {notes.map((n, i) => (
            <Note key={i} tone={isCleanNote(n) ? "info" : "warn"}>
              Data quality: {n}
            </Note>
          ))}
        </div>
      )}
    </div>
  );
}

function Note({ tone, children }: { tone: "warn" | "info"; children: ReactNode }) {
  return (
    <div
      className={`flex items-start gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] ${
        tone === "warn" ? "bg-warning/10 text-foreground" : "bg-muted/40 text-muted-foreground"
      }`}
    >
      {tone === "warn" ? <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-warning" /> : <Info className="mt-0.5 h-3 w-3 shrink-0" />}
      <span>{children}</span>
    </div>
  );
}

/** Month-over-month: last ~12 certified months, stacked by the same buckets. $ shows the level (is the dip in
 *  volume?), Mix shows the share (which bucket is moving?). The selected month is emphasized. */
function CashTrend({ rows, selected }: { rows: FirmCashMovementMonth[]; selected: string }) {
  const [mode, setMode] = useState<"usd" | "mix">("usd");
  const data = useMemo(
    () =>
      rows.map((r) => {
        const d: Record<string, any> = {
          key: r.month,
          label: `${shortMonth(r)}${r.month_status === "open" ? "*" : ""}`,
          total: r.total_collected,
          open: r.month_status === "open",
          name: longMonth(r),
        };
        for (const b of CASH_MOVEMENT_BUCKETS) {
          d[b] = mode === "usd" ? Math.max(0, r[b]) : r.total_collected ? (Math.max(0, r[b]) / r.total_collected) * 100 : 0;
          d[`${b}__usd`] = r[b];
        }
        return d;
      }),
    [rows, mode],
  );
  if (rows.length < 2) {
    return <p className="text-[11px] text-muted-foreground">Trend appears once two or more certified months are available.</p>;
  }
  const hasOpen = rows.some((r) => r.month_status === "open");
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/80">
          Month over month · last {rows.length} months
        </div>
        <div className="inline-flex rounded-full border border-border/70 bg-muted/30 p-0.5" role="group" aria-label="Trend scale">
          {(["usd", "mix"] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium transition-colors ${
                mode === m ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m === "usd" ? "$ collected" : "Mix %"}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barCategoryGap="22%">
          <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.6} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} interval={0} />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={48}
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            domain={mode === "mix" ? [0, 100] : [0, "auto"]}
            ticks={mode === "mix" ? [0, 25, 50, 75, 100] : undefined}
            allowDataOverflow={mode === "mix"}
            tickFormatter={(v: number) => (mode === "mix" ? `${Math.round(v)}%` : fmtMoney(v))}
          />
          <Tooltip cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }} content={<TrendTooltip />} />
          {CASH_MOVEMENT_BUCKETS.map((b, i) => (
            <Bar
              key={b}
              dataKey={b}
              stackId="cash"
              fill={colorOf(b)}
              stroke="hsl(var(--card))"
              strokeWidth={1}
              radius={i === CASH_MOVEMENT_BUCKETS.length - 1 ? [4, 4, 0, 0] : 0}
              isAnimationActive={false}
            >
              {data.map((d) => (
                <Cell key={d.key} fillOpacity={d.key === selected ? 1 : 0.5} />
              ))}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
      {hasOpen && <p className="mt-1 text-[10px] text-muted-foreground/80">* open month, provisional (partial)</p>}
    </div>
  );
}

function TrendTooltip({ active, payload }: { active?: boolean; payload?: any[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as Record<string, any>;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-[11px] shadow-md">
      <div className="mb-1 font-semibold text-foreground">
        {d.name}
        {d.open ? " · provisional" : ""}
      </div>
      <div className="mb-1 text-muted-foreground">Total {fmtMoney(d.total)}</div>
      {CASH_MOVEMENT_BUCKETS.map((b) => (
        <div key={b} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-[2px]" style={{ background: colorOf(b) }} />
          <span className="flex-1 text-muted-foreground">{BUCKET_META[b].label}</span>
          <span className="tabular-nums text-foreground">{fmtMoney(d[`${b}__usd`])}</span>
          <span className="w-10 text-right tabular-nums text-muted-foreground">
            {d.total ? ((d[`${b}__usd`] / d.total) * 100).toFixed(1) : "0.0"}%
          </span>
        </div>
      ))}
    </div>
  );
}
