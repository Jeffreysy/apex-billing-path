import { useMemo } from "react";
import {
  useArWaterfall, useCertifiedMonthlyCollections, useFirmFinancialSummary, aggregateArWaterfallByMonth,
} from "@/hooks/useSupabaseData";
import StatCard from "@/components/StatCard";
import { TrendingUp, TrendingDown, BarChart3, DollarSign } from "lucide-react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine,
} from "recharts";
import { format, parseISO } from "date-fns";

// 2026-10-14: this chart used to add payments_clean (client-linked LawPay only) to collection_activities.collected_amount
// (collector-typed amounts that largely describe the SAME payments) and compare that to ar_dashboard.start_date contract
// value of OPEN contracts (structurally ~$0). Both sides were wrong. It now shows:
//   - Collected = certified firm cash per month (mv_collections_certified_monthly, bank-supported, transaction grain)
//   - Net AR change = the AR roll-forward across MyCase snapshots dated in that month (v_ar_waterfall, snapshot grain)
const MONTHS = 12;
const money = (n: number) => `$${Math.round(n).toLocaleString()}`;

const ARGrowthVsCollectionsChart = () => {
  const { data: cash = [], isLoading: cl } = useCertifiedMonthlyCollections(MONTHS);
  // The waterfall is optional here: cash renders even if the roll-forward fails, and the tile says so.
  const { data: waterfall = [], isError: wfError } = useArWaterfall();
  const { data: firmSummary } = useFirmFinancialSummary();

  const result = useMemo(() => {
    const movement = new Map(aggregateArWaterfallByMonth(waterfall).map((m) => [m.monthKey, m]));
    const data = cash.map((c) => {
      const m = movement.get(c.monthKey);
      return {
        month: c.monthKey,
        label: format(parseISO(`${c.monthKey}-01`), "MMM yy"),
        collected: c.total,
        collectedExact: c.totalExact,
        net: m ? m.net : null,
        ending: m ? m.ending : null,
      };
    });
    const totalColl = data.reduce((s, d) => s + d.collectedExact, 0);
    const withMove = data.filter((d) => d.net != null);
    const netChange = withMove.reduce((s, d) => s + (d.net as number), 0);
    const span = data.length ? `${data[0].label} – ${data[data.length - 1].label}` : "";
    return { data, totalColl, netChange, span, monthsWithMove: withMove.length };
  }, [cash, waterfall]);

  if (cl) {
    return <div className="p-4 text-center text-muted-foreground text-sm">Loading AR vs Collections...</div>;
  }

  const { data, totalColl, netChange, span, monthsWithMove } = result;
  const arNow = Number(firmSummary?.ar_total) || 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Collected (certified)"
          value={money(totalColl)}
          icon={<BarChart3 className="h-5 w-5" />}
          caption={`${span} · bank-supported cash`}
        />
        <StatCard
          label="Net AR Change"
          value={wfError || monthsWithMove === 0 ? "—" : `${netChange >= 0 ? "+" : "-"}${money(Math.abs(netChange))}`}
          icon={netChange >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
          caption={wfError ? "AR roll-forward unavailable right now (snapshot waterfall did not load)" : `MyCase snapshot roll-forward · ${monthsWithMove} month${monthsWithMove === 1 ? "" : "s"} with a snapshot`}
        />
        <StatCard
          label="Total AR Now"
          value={arNow ? money(arNow) : "—"}
          icon={<DollarSign className="h-5 w-5" />}
          caption={firmSummary?.as_of ? `MyCase snapshot ${firmSummary.as_of} · ${Number(firmSummary.open_invoices || 0).toLocaleString()} invoices` : undefined}
        />
        <StatCard
          label="Avg Monthly Cash"
          value={data.length > 1 ? money(data.slice(0, -1).reduce((s, d) => s + d.collectedExact, 0) / (data.length - 1)) : "—"}
          icon={<TrendingUp className="h-5 w-5" />}
          caption="Closed months in the window (current month excluded)"
        />
      </div>

      <div className="dashboard-section">
        <h2 className="mb-1 text-lg font-semibold text-foreground">Collections vs AR Movement — Monthly</h2>
        <p className="mb-4 text-xs text-muted-foreground">
          Certified cash collected per month (mv_collections_certified_monthly) vs the net change in the AR book across the
          MyCase snapshots dated in that month (v_ar_waterfall). Current month is month to date.
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: number) => (v == null ? "—" : money(v))} />
            <Legend />
            <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
            <Bar dataKey="collected" fill="hsl(152 60% 40%)" radius={[4, 4, 0, 0]} name="Collected (certified cash)" />
            <Line type="monotone" dataKey="net" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} connectNulls={false} name="Net AR change (snapshots)" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ARGrowthVsCollectionsChart;
