import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { useArWaterfall, useArForwardProjection, useArClientMovement, useArPlanFreshness } from "@/hooks/useSupabaseData";
import { Badge } from "@/components/ui/badge";
import { DollarSign, CalendarClock, TrendingDown, Layers, AlertTriangle, CheckCircle } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const fmtM = (n: number) => `$${(n / 1e6).toFixed(2)}M`;
const fmtK = (n: number) => `${n < 0 ? "-" : ""}$${Math.abs(Math.round(n / 1e3)).toLocaleString()}K`;
const fmtUsd = (n: number) => `$${Math.round(n).toLocaleString()}`;

const ArMovementDashboard = () => {
  const { data: wf = [], isLoading: l1 } = useArWaterfall();
  const { data: proj = [], isLoading: l2 } = useArForwardProjection();
  const { data: movers = [] } = useArClientMovement();
  const { data: fresh } = useArPlanFreshness();

  if (l1 || l2) {
    return <DashboardLayout title="AR Movement"><div className="p-8 text-center text-muted-foreground">Loading AR movement...</div></DashboardLayout>;
  }

  const arSeries = wf.length
    ? [{ label: String((wf[0] as any).prior_date).slice(5), ar: Number((wf[0] as any).beginning) / 1e6 },
       ...wf.map((w: any) => ({ label: String(w.period_date).slice(5), ar: Number(w.ending) / 1e6 }))]
    : [];
  const last: any = wf[wf.length - 1];
  const currentAr = last ? Number(last.ending) : 0;
  const lastDelta = last ? Number(last.ending) - Number(last.beginning) : 0;
  const projData = proj.map((p: any) => ({ month: String(p.proj_month).slice(0, 7), collections: Number(p.scheduled_collections) / 1e6 }));
  const schedThis = proj.length ? Number((proj[0] as any).scheduled_collections) : 0;
  const totalExpected = proj.length ? Number((proj[proj.length - 1] as any).cumulative_collections) : 0;

  return (
    <DashboardLayout title="AR Movement & Projection">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">AR Movement &amp; Projection</h1>
        <p className="text-muted-foreground text-sm">Penny-exact AR roll-forward (actuals) + payment-plan collections forecast. AR snapshots to {last?.period_date ?? "—"}; plan schedule as of {fresh?.plans_as_of ?? "—"}.</p>
      </div>

      {fresh && (
        <div className={`mb-6 flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm ${fresh.is_stale ? "border-destructive/40 bg-destructive/5" : "border-secondary/40 bg-secondary/10"}`}>
          {fresh.is_stale ? <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" /> : <CheckCircle className="h-4 w-4 shrink-0 text-secondary" />}
          <span>Payment-plan data is <strong>{fresh.days_old} day{fresh.days_old === 1 ? "" : "s"} old</strong> (scraped {fresh.plans_as_of}).{fresh.is_stale ? " Re-scrape from MyCase to bring the forecast current." : " Current — refreshed within the last week."}</span>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard label="Current AR" value={fmtM(currentAr)} icon={<DollarSign className="h-5 w-5" />} />
        <StatCard label="Scheduled (next month)" value={fmtM(schedThis)} icon={<CalendarClock className="h-5 w-5" />} />
        <StatCard label="Last-period change" value={fmtK(lastDelta)} icon={<TrendingDown className="h-5 w-5" />} />
        <StatCard label="Plan-book runoff" value={fmtM(totalExpected)} icon={<Layers className="h-5 w-5" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="dashboard-section">
          <h2 className="mb-1 text-lg font-semibold">Open AR Over Time</h2>
          <p className="mb-3 text-xs text-muted-foreground">Actual MyCase AR snapshots, penny-reconciled</p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={arSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis domain={[18, 20]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v: number) => `$${v}M`} />
              <Tooltip formatter={(v: number) => `$${v.toFixed(2)}M`} />
              <Line type="monotone" dataKey="ar" stroke="hsl(220 70% 35%)" strokeWidth={2} dot={{ r: 3 }} name="Open AR" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="dashboard-section">
          <h2 className="mb-1 text-lg font-semibold">Expected Collections — Plan Forecast</h2>
          <p className="mb-3 text-xs text-muted-foreground">Scheduled installments from {wf.length ? "" : ""}active plans · current-book runoff, excludes new billings</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={projData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" angle={-30} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v: number) => `$${v.toFixed(1)}M`} />
              <Tooltip formatter={(v: number) => `$${v.toFixed(2)}M`} />
              <Bar dataKey="collections" fill="hsl(174 60% 38%)" radius={[4, 4, 0, 0]} name="Expected collections" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6 dashboard-section">
        <h2 className="mb-1 text-lg font-semibold">Latest Period — Top Client Movers</h2>
        <p className="mb-3 text-xs text-muted-foreground">
          {last ? `${last.prior_snapshot_date ?? last.prior_date} → ${last.latest_snapshot_date ?? last.period_date}` : ""} · who drove the AR change
        </p>
        {movers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No client movement in the latest period.</p>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground">
                <tr><th className="py-1.5">Client</th><th className="text-right">Prior</th><th className="text-right">Current</th><th className="text-right">Change</th><th className="text-right">Status</th></tr>
              </thead>
              <tbody>
                {movers.map((m: any) => (
                  <tr key={m.client_id} className="border-t">
                    <td className="py-1.5 pr-2 font-medium">{m.client_name}</td>
                    <td className="text-right tabular-nums">{fmtUsd(Number(m.ar_prior))}</td>
                    <td className="text-right tabular-nums">{fmtUsd(Number(m.ar_current))}</td>
                    <td className={`text-right tabular-nums font-medium ${Number(m.delta) < 0 ? "text-secondary" : "text-destructive"}`}>{fmtUsd(Number(m.delta))}</td>
                    <td className="text-right"><Badge variant={m.movement === "RESOLVED" ? "default" : m.movement === "PAID_DOWN" ? "secondary" : "outline"} className="text-[10px] capitalize">{String(m.movement).replace(/_/g, " ").toLowerCase()}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ArMovementDashboard;
