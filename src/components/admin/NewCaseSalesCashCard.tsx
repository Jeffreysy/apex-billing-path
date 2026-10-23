/**
 * New-case sales cash (collected) -- 2026-10-23. Source of record: v_new_case_sales_cash_monthly (VP-certified), last 13
 * cash months. Bars: cash paid at signing (all systems) vs certified cash collected (all systems), with signing as a % of
 * certified on top. GRAIN: cash month, payments summed; counts are CASES, never clients.
 *
 * Coherence: this card is the ALL-SYSTEMS basis (MyCase + the certified Filevine leg, Dec 2025 - Apr 2026). The Cash
 * Movement "New sales" bucket is the MyCase certified basis, so Dec-Apr figures legitimately differ; Case Mix "at signing"
 * is by case OPEN month and differs ~0-3%. Each card says which basis it is on.
 */
import { format } from "date-fns";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell, LabelList, Legend } from "recharts";
import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useNewCaseSalesCashMonthly, type NewCaseSalesCashMonth } from "@/hooks/useSupabaseData";

const SIGNING_COLOR = "#2a78d6"; // categorical slot 1
const CERTIFIED_COLOR = "#a3a29c"; // neutral context series
const NM = "n/m";

function fmtMoney(n: number) {
  const sign = n < 0 ? "−" : "";
  const a = Math.abs(n);
  if (a >= 1_000_000) return `${sign}$${(a / 1_000_000).toFixed(2)}M`;
  if (a >= 1_000) return `${sign}$${(a / 1_000).toFixed(1)}k`;
  return `${sign}$${Math.round(a).toLocaleString()}`;
}
function ymd(d: string): Date {
  const [y, m, dd] = d.slice(0, 10).split("-").map(Number);
  return new Date(y, (m || 1) - 1, dd || 1);
}
/** The view stores the percent as a percent number (17.3 = 17.3%): divide by 100 for a percent format. */
const fmtPct = (p: number) => (p / 100).toLocaleString("en-US", { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1 });

const isNotMeasurable = (r: NewCaseSalesCashMonth) => (r.data_quality_all_systems ?? "").toUpperCase() === "NOT_MEASURABLE";
const isPartial = (r: NewCaseSalesCashMonth) => ["open", "partial"].includes((r.month_status ?? "").toLowerCase());
const isProvisional = (s: string | null | undefined) => !!s && s.trim().toUpperCase().startsWith("PROVISIONAL");
const signingDisplay = (r: NewCaseSalesCashMonth) =>
  isNotMeasurable(r) || r.signing_cash_net_all_systems == null ? NM : fmtMoney(r.signing_cash_net_all_systems);
const pctDisplay = (r: NewCaseSalesCashMonth) =>
  isNotMeasurable(r) || r.signing_pct_of_certified_all_systems == null ? NM : fmtPct(r.signing_pct_of_certified_all_systems);

export default function NewCaseSalesCashCard({ monthVal, className = "" }: { monthVal: string; className?: string }) {
  const q = useNewCaseSalesCashMonthly(13);
  const rows = q.data ?? [];
  const row = rows.find((r) => r.month.slice(0, 7) === monthVal) ?? null;
  const latest = rows.length ? rows[rows.length - 1] : null;
  const status = latest?.all_systems_status ?? null;
  const monthLabel = format(ymd(`${monthVal}-01`), "MMMM yyyy");

  return (
    <Card className={`rounded-2xl border-border/70 p-6 shadow-none ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary">New Business</div>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">New-case sales cash (collected)</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">per cash month · payments summed</p>
        </div>
        {row && <QualityBadge row={row} />}
      </div>

      {q.isLoading ? (
        <div className="mt-6 py-6 text-center text-xs text-muted-foreground">Loading new-case sales cash…</div>
      ) : q.isError ? (
        <div className="mt-6 py-6 text-center text-xs text-destructive">
          Couldn&apos;t load new-case sales cash.{" "}
          <button type="button" onClick={() => q.refetch()} className="rounded-full border border-border/70 px-2 py-0.5 text-[10px] text-muted-foreground hover:bg-muted">
            Retry
          </button>
        </div>
      ) : rows.length === 0 ? (
        <div className="mt-6 py-6 text-center text-xs text-muted-foreground">No new-case sales cash months available.</div>
      ) : (
        <div className="mt-4 space-y-4">
          {isProvisional(status) && (
            <div role="status" data-testid="ncs-status-banner" className="flex items-start gap-2 rounded-xl border border-warning/40 bg-warning/10 p-3 text-[11px] text-foreground">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
              <span>{status}</span>
            </div>
          )}

          {row ? (
            <div className="flex flex-wrap items-end justify-between gap-3" data-testid="ncs-headline">
              <div>
                <div className="text-[10px] font-medium uppercase tracking-[0.1em] text-muted-foreground/70">
                  Paid at signing · {monthLabel}
                  {isPartial(row) && (
                    <span className="ml-1.5 rounded-full bg-warning/15 px-1.5 py-0.5 text-[9px] font-semibold text-warning">partial</span>
                  )}
                </div>
                <div className="mt-1 text-[28px] font-semibold leading-none tracking-tight tabular-nums">{signingDisplay(row)}</div>
                <div className="mt-1 text-[11px] text-muted-foreground">
                  {pctDisplay(row)} of certified cash {row.certified_cash_all_systems != null ? fmtMoney(row.certified_cash_all_systems) : "—"}
                </div>
              </div>
              <div className="text-right text-[11px] text-muted-foreground">
                <div>
                  {row.signing_cases_paid_all_systems != null ? `${row.signing_cases_paid_all_systems.toLocaleString()} cases paid at signing` : ""}
                  {row.cases_opened != null ? ` · ${row.cases_opened.toLocaleString()} cases opened` : ""}
                </div>
                <div>Complete through {row.payments_through ? format(ymd(row.payments_through), "MMM d, yyyy") : "—"}</div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">No new-case sales cash row for {monthLabel}.</div>
          )}

          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={rows.map((r) => ({ ...r, label: `${format(ymd(r.month), "MMM yy")}${isPartial(r) ? "*" : ""}`, signing: isNotMeasurable(r) ? null : r.signing_cash_net_all_systems, certified: r.certified_cash_all_systems }))} margin={{ top: 18, right: 4, left: 0, bottom: 0 }} barGap={2} barCategoryGap="20%">
              <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.6} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} interval={0} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tickLine={false} axisLine={false} width={48} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v: number) => fmtMoney(v)} />
              <Tooltip cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }} content={<NcsTooltip />} />
              <Legend verticalAlign="top" align="right" height={20} iconType="square" iconSize={8} wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="signing" name="Paid at signing" fill={SIGNING_COLOR} radius={[4, 4, 0, 0]} isAnimationActive={false}>
                {rows.map((r) => (
                  <Cell key={r.month} fillOpacity={r.month.slice(0, 7) === monthVal ? 1 : 0.55} />
                ))}
              </Bar>
              <Bar dataKey="certified" name="Certified cash collected" fill={CERTIFIED_COLOR} radius={[4, 4, 0, 0]} isAnimationActive={false}>
                {rows.map((r) => (
                  <Cell key={r.month} fillOpacity={r.month.slice(0, 7) === monthVal ? 1 : 0.55} />
                ))}
                <LabelList
                  dataKey="certified"
                  content={(p: any) => {
                    const r = rows[p.index];
                    if (!r || p.x == null) return null;
                    return (
                      <text x={Number(p.x) - 1 /* left edge of the certified bar = centre of the two-bar group */} y={Number(p.y) - 4} textAnchor="middle" fontSize={9} fill="hsl(var(--muted-foreground))">
                        {pctDisplay(r)}
                      </text>
                    );
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="space-y-0.5 text-[10px] text-muted-foreground/80">
            {rows.some(isPartial) && <p>* partial month (cash still landing)</p>}
            <p className="font-medium text-muted-foreground">
              All-systems basis: incl. Filevine Dec 2025–Apr 2026, so Dec–Apr differ from Cash Movement &ldquo;New sales&rdquo; (MyCase certified
              basis) and ~0–3% from Case Mix &ldquo;at signing&rdquo; (by case open month).
            </p>
            <p>
              Paid on a new case&apos;s own invoices from 3 days before to 7 days after the case opened, net of refunds; operating only;
              excludes consults and trust. Filevine Dec 2025–Apr 2026 included.
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}

function QualityBadge({ row }: { row: NewCaseSalesCashMonth }) {
  const dq = (row.data_quality_all_systems ?? "").toUpperCase();
  if (!dq) return null;
  const cls =
    dq === "OK" ? "bg-success/10 text-success" : dq === "THIN" ? "bg-warning/15 text-warning" : "bg-muted text-muted-foreground";
  return (
    <span
      data-testid="ncs-quality-badge"
      title={row.quality_note_all_systems ?? undefined}
      className={`cursor-help rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${cls}`}
    >
      {dq.replace(/_/g, " ")}
    </span>
  );
}

function NcsTooltip({ active, payload }: { active?: boolean; payload?: any[] }) {
  if (!active || !payload?.length) return null;
  const r = payload[0].payload as NewCaseSalesCashMonth;
  const line = (k: string, v: string) => (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{k}</span>
      <span className="tabular-nums text-foreground">{v}</span>
    </div>
  );
  return (
    <div className="min-w-[220px] rounded-lg border border-border bg-popover px-3 py-2 text-[11px] shadow-md">
      <div className="mb-1 font-semibold text-foreground">
        {format(ymd(r.month), "MMMM yyyy")}
        {isPartial(r) ? " · partial" : ""}
      </div>
      {line("Paid at signing", signingDisplay(r))}
      {line("Certified cash collected", r.certified_cash_all_systems != null ? fmtMoney(r.certified_cash_all_systems) : "—")}
      {line("Signing % of certified", pctDisplay(r))}
      {line("Cases paid at signing", r.signing_cases_paid_all_systems != null ? r.signing_cases_paid_all_systems.toLocaleString() : "—")}
      {line("Cases opened", r.cases_opened != null ? r.cases_opened.toLocaleString() : "—")}
      {r.filevine_signing_cash != null && line("Filevine signing cash", fmtMoney(r.filevine_signing_cash))}
      {r.mycase_signing_keyed_by_filevine_added != null && line("MyCase keyed by Filevine (added)", fmtMoney(r.mycase_signing_keyed_by_filevine_added))}
      {r.data_quality_all_systems && line("Data quality", r.data_quality_all_systems.replace(/_/g, " "))}
    </div>
  );
}
