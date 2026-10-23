import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNewCaseSalesCohortMonthly, type NewCaseSalesCohortRow } from "@/hooks/useSupabaseData";

/** "First 90 days" tab of the Case Mix card (Jeff 2026-10-23: put the certified new-case sales cash spine in
 *  LexCollect). Source: v_new_case_sales_cohort_monthly -- GRAIN: one row per case OPEN month; counts are cases.
 *  Every figure on screen is a column of that view; the only arithmetic is the footer sum, which tests tie back. */

export const FIRST90_CAPTION =
  "Grouped by open month, so it reads 0–3% apart from the cash-month 'New-case sales cash' card.";

export const DQ_BADGE: Record<string, { label: string; tone: string; note: string }> = {
  OK: { label: "OK", tone: "bg-success/10 text-success", note: "Cash is measurable for this cohort" },
  THIN: { label: "Thin", tone: "bg-warning/10 text-warning", note: "Measurable, but invoice coverage is thin - read with care" },
  NOT_MEASURABLE: { label: "n/m", tone: "bg-muted text-muted-foreground", note: "Not measurable - the cash can't be tied to this cohort's invoices" },
};

export interface First90DisplayRow {
  openMonth: string;              // yyyy-mm-01
  measurable: boolean;            // data_quality_all_systems !== NOT_MEASURABLE
  mature: boolean;                // 90-day window closed
  windowClosesOn: string | null;
  dataQuality: string;
  first90Net: number | null;      // null = n/m (never $0)
  signingNet: number | null;
  casesWithFirst90: number | null;
}

export interface First90Totals {
  cohorts: number;
  first90Net: number;
  signingNet: number;
  casesWithFirst90: number;
}

export function toFirst90Rows(view: NewCaseSalesCohortRow[]): First90DisplayRow[] {
  return view
    .map((r) => {
      const measurable = r.data_quality_all_systems !== "NOT_MEASURABLE";
      return {
        openMonth: r.open_month.slice(0, 10),
        measurable,
        mature: r.cohort_mature,
        windowClosesOn: r.window_closes_on,
        dataQuality: r.data_quality_all_systems,
        first90Net: measurable ? r.first90_cash_net_all_systems : null,
        signingNet: measurable ? r.signing_cash_net_by_open_month_all_systems : null,
        casesWithFirst90: measurable ? r.cases_with_first90_cash_all_systems : null,
      };
    })
    .sort((a, b) => b.openMonth.localeCompare(a.openMonth));
}

/** Footer: mature + measurable cohorts only. Still-open cohorts are filling and n/m cohorts have no number. */
export function first90Totals(rows: First90DisplayRow[]): First90Totals {
  const t: First90Totals = { cohorts: 0, first90Net: 0, signingNet: 0, casesWithFirst90: 0 };
  for (const r of rows) {
    if (!r.mature || !r.measurable) continue;
    t.cohorts += 1;
    t.first90Net += r.first90Net ?? 0;
    t.signingNet += r.signingNet ?? 0;
    t.casesWithFirst90 += r.casesWithFirst90 ?? 0;
  }
  t.first90Net = Math.round(t.first90Net * 100) / 100;
  t.signingNet = Math.round(t.signingNet * 100) / 100;
  return t;
}

/** The PROVISIONAL banner text, or null once the spine is certified final. */
export function provisionalStatus(view: NewCaseSalesCohortRow[]): string | null {
  const s = view.find((r) => r.all_systems_status)?.all_systems_status?.trim() ?? null;
  return s && s.toUpperCase().startsWith("PROVISIONAL") ? s : null;
}

const usd0 = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
const ymdLabel = (d: string | null, fmt: string) => (d ? format(new Date(`${d.slice(0, 10)}T00:00:00`), fmt) : "");
const RECENT = 24;

export default function CaseMixFirst90Tab({ monthVal }: { monthVal: string }) {
  const q = useNewCaseSalesCohortMonthly();
  const [showAll, setShowAll] = useState(false);
  const view = q.data ?? [];
  const all = useMemo(() => toFirst90Rows(view), [view]);
  const rows = showAll ? all : all.slice(0, RECENT);
  const totals = useMemo(() => first90Totals(rows), [rows]);
  const banner = provisionalStatus(view);
  const paymentsThrough = view.find((r) => r.payments_through)?.payments_through ?? null;
  const selected = `${monthVal}-01`;

  if (q.isLoading) return <div className="py-10 text-center text-xs text-muted-foreground">Loading first-90-day cash…</div>;
  if (q.isError) {
    return (
      <div className="py-10 text-center text-xs text-destructive">
        Couldn&apos;t load first-90-day cash. <button className="underline" onClick={() => q.refetch()}>Retry</button>
      </div>
    );
  }
  if (!all.length) return <div className="py-10 text-center text-xs text-muted-foreground">No cohorts yet.</div>;

  return (
    <div className="space-y-3 px-6 pb-4" data-testid="case-mix-first90">
      {banner && (
        <div className="rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-[11px] text-warning" role="status">
          {banner}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span>
          Net cash on each cohort&apos;s own invoices in its first 90 days, per case open month, MyCase + Filevine.
          {paymentsThrough ? ` Payments counted through ${ymdLabel(paymentsThrough, "MMM d, yyyy")}.` : ""}
        </span>
        <button type="button" onClick={() => setShowAll((v) => !v)}
          className="ml-auto rounded-full border border-border/70 px-2.5 py-1 text-[11px] font-medium hover:bg-muted">
          {showAll ? `Last ${RECENT} months` : `All ${all.length} cohorts`}
        </button>
      </div>
      <p className="text-[11px] text-muted-foreground">{FIRST90_CAPTION}</p>
      <div className="max-h-[52vh] overflow-auto">
        <Table className="text-xs">
          <TableHeader>
            <TableRow>
              <TableHead>Case open month</TableHead>
              <TableHead className="text-right">Signing cash (net)</TableHead>
              <TableHead className="text-right">First-90 cash (net)</TableHead>
              <TableHead className="text-right">Cases with first-90 cash</TableHead>
              <TableHead>Data quality</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => {
              const dq = DQ_BADGE[r.dataQuality] ?? { label: r.dataQuality, tone: "bg-muted text-muted-foreground", note: "" };
              const nm = <span className="text-muted-foreground" title={DQ_BADGE.NOT_MEASURABLE.note}>n/m</span>;
              return (
                <TableRow key={r.openMonth} data-testid={`first90-row-${r.openMonth.slice(0, 7)}`}
                  className={`${r.mature ? "" : "opacity-50"} ${r.openMonth === selected ? "bg-muted/60 font-semibold" : ""}`}>
                  <TableCell className="whitespace-nowrap">
                    {ymdLabel(r.openMonth, "MMM yyyy")}
                    {!r.mature && r.windowClosesOn && (
                      <span className="ml-2 text-[10px] font-normal text-muted-foreground">
                        window closes {ymdLabel(r.windowClosesOn, "MMM d, yyyy")}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{r.signingNet == null ? nm : usd0(r.signingNet)}</TableCell>
                  <TableCell className="text-right tabular-nums">{r.first90Net == null ? nm : usd0(r.first90Net)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {r.casesWithFirst90 == null ? nm : `${r.casesWithFirst90.toLocaleString("en-US")} cases`}
                  </TableCell>
                  <TableCell>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${dq.tone}`} title={dq.note}>{dq.label}</span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
          <TableFooter>
            <TableRow data-testid="first90-total">
              <TableCell className="text-[11px]">
                Total · {totals.cohorts} closed, measurable cohorts shown
              </TableCell>
              <TableCell className="text-right tabular-nums">{usd0(totals.signingNet)}</TableCell>
              <TableCell className="text-right tabular-nums">{usd0(totals.first90Net)}</TableCell>
              <TableCell className="text-right tabular-nums">{totals.casesWithFirst90.toLocaleString("en-US")} cases</TableCell>
              <TableCell />
            </TableRow>
          </TableFooter>
        </Table>
      </div>
      <p className="text-[10px] text-muted-foreground">
        Greyed rows are still inside their 90-day window and will keep growing; they are left out of the total.
        n/m = not measurable for that cohort, never zero.
      </p>
    </div>
  );
}
