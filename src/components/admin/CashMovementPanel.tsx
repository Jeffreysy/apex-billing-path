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
import { useFirmCashMovementMonthly } from "@/hooks/useSupabaseData";
import {
  CASH_MOVEMENT_BUCKETS,
  isCashBucketMeasurable,
  type CashMovementBucket,
  type FirmCashMovementMonth,
} from "@/lib/cashMovement";

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
.cash-mix{--cm-1:#2a78d6;--cm-2:#eb6834;--cm-3:#1baf7a;--cm-4:#eda100;--cm-5:#e87ba4;--cm-6:#008300;--cm-other:#a3a29c;--cm-nm:#dcdbd5}
.dark .cash-mix{--cm-1:#3987e5;--cm-2:#d95926;--cm-3:#199e70;--cm-4:#c98500;--cm-5:#d55181;--cm-6:#008300;--cm-other:#6f6e69;--cm-nm:#3a3a37}
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

/** data_quality arrives as pipe-delimited text ("OK | other_unresolved 1.0% of total | ..."), or as JSON; every
 *  entry is shown, none hidden. */
function qualityNotes(dq: unknown): string[] {
  if (dq === null || dq === undefined || dq === "") return [];
  if (typeof dq === "string") {
    try {
      const parsed = JSON.parse(dq);
      if (parsed && typeof parsed === "object") return qualityNotes(parsed);
    } catch {
      /* plain text */
    }
    return dq.split("|").map((s) => s.trim()).filter(Boolean);
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
const NM = "n/m";
/** Money value of a bucket, or null when it is NOT_MEASURABLE (NULL or flagged) -- never a $0 stand-in. */
const val = (r: FirmCashMovementMonth, b: CashMovementBucket): number | null => (isCashBucketMeasurable(r, b) ? (r[b] as number) : null);
/** Cash inside total_collected that sits in a bucket flagged not measurable (e.g. Mar 2026 new sales). */
const unsplitAmount = (r: FirmCashMovementMonth) =>
  CASH_MOVEMENT_BUCKETS.reduce((s, b) => s + (val(r, b) === null && r[b] != null ? (r[b] as number) : 0), 0);
function nmReason(r: FirmCashMovementMonth, b: CashMovementBucket): string {
  if (["autopay_current", "manual_current", "delinquent_manual", "delinquent_autopay"].includes(b) && r.delinquency_split_measurable === false)
    return "Delinquent / current split not measurable this month; that cash sits in Other / unclassified.";
  if (b === "consult_cash" && r.consult_measurable === false)
    return "Consults not measurable this month; consult money sits inside the other buckets.";
  if (b === "new_sales_cash" && (r.new_sales_quality ?? "").toUpperCase() === "NOT_MEASURABLE")
    return "New-sale signing cash not measurable this month (MyCase-only basis).";
  return "Not measurable this month.";
}

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
  const [hover, setHover] = useState<CashMovementBucket | "__nm" | null>(null);
  const total = row.total_collected;
  // Reconciliation uses the view's raw values (every non-null bucket is in total_collected, measurable or not).
  const rawSum = CASH_MOVEMENT_BUCKETS.reduce((s, b) => s + (row[b] ?? 0), 0);
  const viewDiff = row.reconciliation_diff ?? 0;
  const appDiff = total - rawSum;
  const unreconciled = Math.abs(viewDiff) > DIFF_TOLERANCE || Math.abs(appDiff) > DIFF_TOLERANCE;
  const measured = CASH_MOVEMENT_BUCKETS.filter((b) => val(row, b) !== null);
  const negatives = measured.filter((b) => (val(row, b) as number) < 0);
  const unsplit = unsplitAmount(row);
  const barSegments: { key: CashMovementBucket | "__nm"; value: number }[] = [
    ...measured.filter((b) => (val(row, b) as number) > 0).map((b) => ({ key: b, value: val(row, b) as number })),
    ...(unsplit > DIFF_TOLERANCE ? [{ key: "__nm" as const, value: unsplit }] : []),
  ];
  const barTotal = barSegments.reduce((s, x) => s + x.value, 0) || 1;
  const maxBucket = Math.max(1, ...measured.map((b) => Math.abs(val(row, b) as number)));
  const share = (r: FirmCashMovementMonth, b: CashMovementBucket) => {
    const v = val(r, b);
    return v === null || !r.total_collected ? null : (v / r.total_collected) * 100;
  };
  const isOpen = row.month_status === "open";
  const notes = qualityNotes(row.data_quality);
  const hovered =
    hover === "__nm"
      ? { label: "In total, split not measurable", v: unsplit as number | null, p: total ? (unsplit / total) * 100 : 0 }
      : hover
        ? { label: BUCKET_META[hover].label, v: val(row, hover), p: share(row, hover) }
        : null;
  const newSalesThin = (row.new_sales_quality ?? "").toUpperCase() === "THIN";

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
          {row.n_payments != null && <span>{row.n_payments.toLocaleString()} payments</span>}
        </div>
      </div>

      {unreconciled && (
        <div role="alert" className="flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/5 p-3 text-xs text-destructive">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <div>
            <div className="font-semibold">The buckets do not add up to total collected for {longMonth(row)}.</div>
            <div className="mt-0.5">
              Total {fmtExact(total)} vs buckets {fmtExact(rawSum)}
              {Math.abs(viewDiff) > DIFF_TOLERANCE ? ` · view reconciliation difference ${fmtExact(viewDiff)}` : ""}
              . Treat this month&apos;s split as unverified until the VP clears it.
            </div>
          </div>
        </div>
      )}

      {/* Part-to-whole: one horizontal stacked bar, fixed bucket order, 2px gaps; n/m buckets are not drawn */}
      <div>
        <div className="mb-1.5 h-4 text-[11px] text-muted-foreground" aria-live="polite">
          {hovered ? (
            <span>
              <span className="font-medium text-foreground">{hovered.label}</span> ·{" "}
              {hovered.v === null ? NM : `${fmtMoney(hovered.v)} · ${(hovered.p ?? 0).toFixed(1)}% of collected`}
            </span>
          ) : (
            "Share of cash collected"
          )}
        </div>
        <div className="flex h-7 w-full gap-[2px] overflow-hidden rounded-[4px]" role="img" aria-label={`Cash collected in ${longMonth(row)} by bucket`}>
          {barSegments.map(({ key, value }) => (
            <div
              key={key}
              data-bucket={key}
              title={
                key === "__nm"
                  ? `In total, split not measurable: ${fmtExact(value)}`
                  : `${BUCKET_META[key].label}: ${fmtExact(value)} (${((value / total) * 100).toFixed(1)}%)`
              }
              onMouseEnter={() => setHover(key)}
              onMouseLeave={() => setHover(null)}
              className="h-full transition-opacity"
              style={{
                width: `${(value / barTotal) * 100}%`,
                background:
                  key === "__nm"
                    ? "repeating-linear-gradient(135deg, var(--cm-other) 0 2px, transparent 2px 6px)"
                    : colorOf(key),
                opacity: hover && hover !== key ? 0.45 : 1,
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
            const v = val(row, b);
            const p = share(row, b);
            const pp = prev ? share(prev, b) : null;
            const dpp = p !== null && pp !== null ? p - pp : null;
            return (
              <tr
                key={b}
                data-testid={`cm-row-${b}`}
                onMouseEnter={() => setHover(b)}
                onMouseLeave={() => setHover(null)}
                className={hover === b ? "bg-muted/30" : ""}
                title={v === null ? nmReason(row, b) : undefined}
              >
                <td className="py-2 pl-1">
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ background: colorOf(b), opacity: v === null ? 0.35 : 1 }} />
                    <span className="text-foreground">{BUCKET_META[b].label}</span>
                    {b === "new_sales_cash" && v !== null && newSalesThin && (
                      <span className="rounded-full bg-warning/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-warning" title="Signing data is thin this month">
                        thin
                      </span>
                    )}
                  </span>
                </td>
                <td className="hidden w-[30%] py-2 pr-3 sm:table-cell">
                  {v !== null && (
                    <div className="h-1.5 rounded-full bg-muted/50">
                      <div className="h-1.5 rounded-full" style={{ width: `${(Math.abs(v) / maxBucket) * 100}%`, background: colorOf(b) }} />
                    </div>
                  )}
                </td>
                <td className="py-2 text-right font-mono text-[13px] font-semibold tabular-nums" title={v === null ? nmReason(row, b) : fmtExact(v)}>
                  {v === null ? <span className="font-normal text-muted-foreground">{NM}</span> : fmtMoney(v)}
                  {b === "new_sales_cash" && v !== null && row.new_sales_cash_net != null && (
                    <div className="text-[10px] font-normal text-muted-foreground" title={`Net of signing refunds: ${fmtExact(row.new_sales_cash_net)}`}>
                      gross · net {fmtMoney(row.new_sales_cash_net)}
                    </div>
                  )}
                </td>
                <td className="py-2 text-right font-mono text-[13px] tabular-nums text-muted-foreground">{p === null ? NM : `${p.toFixed(1)}%`}</td>
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
      <p className="-mt-3 text-[10px] text-muted-foreground/80" data-testid="cm-basis-note">
        New sales: MyCase certified basis (ties to certified collected). The New-case sales cash card adds Filevine Dec 2025–Apr 2026.
        {measured.length < CASH_MOVEMENT_BUCKETS.length ? " n/m = not measurable this month (not $0); hover a row for why." : ""}
      </p>
      {isOpen && prev && (
        <p className="-mt-3 text-[10px] text-muted-foreground/80">
          Share change compares a partial month with a full one; dollar totals are not comparable yet.
        </p>
      )}

      <CashTrend rows={trend} selected={row.month} />

      <div className="space-y-1.5">
        {unsplit > DIFF_TOLERANCE && (
          <Note tone="warn">
            {fmtMoney(unsplit)} is in total collected but its bucket is not measurable this month (
            {CASH_MOVEMENT_BUCKETS.filter((b) => val(row, b) === null && (row[b] ?? 0) !== 0).map((b) => BUCKET_META[b].label).join(", ")}
            ); shown hatched in the bar, left out of the % column.
          </Note>
        )}
        {row.filevine_signing_cash_not_included != null && row.filevine_signing_cash_not_included !== 0 && (
          <Note tone="warn">
            Filevine-era month: {fmtMoney(row.filevine_signing_cash_not_included)} of Filevine signing cash is not in certified cash
            or this view. The New-case sales cash card (all systems) includes it.
          </Note>
        )}
        {negatives.length > 0 && (
          <Note tone="warn">
            Negative bucket{negatives.length > 1 ? "s" : ""} this month (refunds or reversals):{" "}
            {negatives.map((b) => `${BUCKET_META[b].label} ${fmtMoney(val(row, b) as number)}`).join(" · ")}. They reduce the total but
            are not drawn in the bar.
          </Note>
        )}
        {notes.map((n, i) => (
          <Note key={i} tone={isCleanNote(n) ? "info" : "warn"}>
            Data quality: {n}
          </Note>
        ))}
        {row.basis && (
          <details className="text-[10px] text-muted-foreground/80">
            <summary className="cursor-pointer select-none">Basis</summary>
            <p className="mt-1">{row.basis}</p>
          </details>
        )}
      </div>
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
 *  volume?), Mix shows the share (which bucket is moving?). n/m buckets are not drawn; cash sitting in a flagged
 *  bucket is drawn as a neutral "split n/m" block so the column height still equals total collected. */
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
        const scale = (v: number) => (mode === "usd" ? v : r.total_collected ? (v / r.total_collected) * 100 : 0);
        for (const b of CASH_MOVEMENT_BUCKETS) {
          const v = val(r, b);
          d[b] = v === null ? null : scale(Math.max(0, v));
          d[`${b}__usd`] = v;
        }
        const u = unsplitAmount(r);
        d.__nm = u > DIFF_TOLERANCE ? scale(u) : null;
        d.__nm_usd = u > DIFF_TOLERANCE ? u : null;
        return d;
      }),
    [rows, mode],
  );
  if (rows.length < 2) {
    return <p className="text-[11px] text-muted-foreground">Trend appears once two or more certified months are available.</p>;
  }
  const hasOpen = rows.some((r) => r.month_status === "open");
  const hasNm = rows.some((r) => CASH_MOVEMENT_BUCKETS.some((b) => val(r, b) === null));
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
          {[...CASH_MOVEMENT_BUCKETS, "__nm" as const].map((b) => (
            <Bar
              key={b}
              dataKey={b}
              stackId="cash"
              fill={b === "__nm" ? "var(--cm-nm)" : colorOf(b)}
              stroke="hsl(var(--card))"
              strokeWidth={1}
              isAnimationActive={false}
            >
              {data.map((d) => (
                <Cell key={d.key} fillOpacity={d.key === selected ? 1 : 0.5} />
              ))}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-1 space-y-0.5 text-[10px] text-muted-foreground/80">
        {hasOpen && <p>* open month, provisional (partial)</p>}
        {hasNm && <p>Months with n/m buckets draw only what is measurable; unsplit cash sits in Other / unclassified or the light block.</p>}
      </div>
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
      {CASH_MOVEMENT_BUCKETS.map((b) => {
        const v = d[`${b}__usd`] as number | null;
        return (
          <div key={b} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-[2px]" style={{ background: colorOf(b), opacity: v === null ? 0.35 : 1 }} />
            <span className="flex-1 text-muted-foreground">{BUCKET_META[b].label}</span>
            <span className="tabular-nums text-foreground">{v === null ? NM : fmtMoney(v)}</span>
            <span className="w-10 text-right tabular-nums text-muted-foreground">
              {v === null ? "" : d.total ? `${((v / d.total) * 100).toFixed(1)}%` : "0.0%"}
            </span>
          </div>
        );
      })}
      {d.__nm_usd != null && (
        <div className="mt-1 flex items-center gap-2 text-muted-foreground">
          <span className="h-2 w-2 rounded-[2px]" style={{ background: "var(--cm-nm)" }} />
          <span className="flex-1">In total, split n/m</span>
          <span className="tabular-nums">{fmtMoney(d.__nm_usd)}</span>
        </div>
      )}
    </div>
  );
}
