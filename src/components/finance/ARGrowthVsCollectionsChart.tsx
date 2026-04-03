import { useQuery } from "@tanstack/react-query";
import { fetchAllRows } from "@/hooks/useSupabaseData";
import StatCard from "@/components/StatCard";
import { TrendingUp, TrendingDown, BarChart3, Percent } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine,
} from "recharts";
import { format, parseISO } from "date-fns";

interface MonthlyData {
  month: string;
  label: string;
  arAdded: number;
  collected: number;
  net: number;
}

function useARGrowthVsCollections() {
  return useQuery({
    queryKey: ["ar-growth-vs-collections"],
    queryFn: async () => {
      const [contracts, payments, activities] = await Promise.all([
        fetchAllRows<any>("contracts"),
        fetchAllRows<any>("payments_clean"),
        fetchAllRows<any>("collection_activities", {
          filter: (q: any) => q.gt("collected_amount", 0),
        }),
      ]);

      const arByMonth: Record<string, number> = {};
      contracts.forEach((c: any) => {
        const m = c.start_date?.substring(0, 7);
        if (m) arByMonth[m] = (arByMonth[m] || 0) + Number(c.value || 0);
      });

      const collByMonth: Record<string, number> = {};
      payments.forEach((p: any) => {
        const m = p.payment_date?.substring(0, 7);
        if (m) collByMonth[m] = (collByMonth[m] || 0) + Number(p.amount || 0);
      });
      activities.forEach((a: any) => {
        const m = a.activity_date?.substring(0, 7);
        if (m) collByMonth[m] = (collByMonth[m] || 0) + Number(a.collected_amount || 0);
      });

      const allMonths = new Set([...Object.keys(arByMonth), ...Object.keys(collByMonth)]);
      const sorted = Array.from(allMonths).sort();
      const last12 = sorted.slice(-12);

      const data: MonthlyData[] = last12.map((m) => ({
        month: m,
        label: format(parseISO(m + "-01"), "MMM yy"),
        arAdded: Math.round(arByMonth[m] || 0),
        collected: Math.round(collByMonth[m] || 0),
        net: Math.round((arByMonth[m] || 0) - (collByMonth[m] || 0)),
      }));

      const totalAR = data.reduce((s, d) => s + d.arAdded, 0);
      const totalColl = data.reduce((s, d) => s + d.collected, 0);
      const coverage = totalAR > 0 ? Math.round((totalColl / totalAR) * 100) : 0;
      const netChange = totalAR - totalColl;

      const recent3 = data.slice(-3).reduce((s, d) => s + d.arAdded, 0);
      const prior3 = data.slice(-6, -3).reduce((s, d) => s + d.arAdded, 0);
      const growthRate = prior3 > 0 ? Math.round(((recent3 - prior3) / prior3) * 100) : 0;

      return { data, totalAR, totalColl, coverage, netChange, growthRate };
    },
    staleTime: 5 * 60 * 1000,
  });
}

const ARGrowthVsCollectionsChart = () => {
  const { data: result, isLoading } = useARGrowthVsCollections();

  if (isLoading || !result) {
    return <div className="p-4 text-center text-muted-foreground text-sm">Loading AR vs Collections...</div>;
  }

  const { data, totalAR, totalColl, coverage, netChange, growthRate } = result;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="AR Growth Rate"
          value={`${growthRate > 0 ? "+" : ""}${growthRate}%`}
          icon={<TrendingUp className="h-5 w-5" />}
          change={growthRate}
        />
        <StatCard
          label="Collection Coverage"
          value={`${coverage}%`}
          icon={<Percent className="h-5 w-5" />}
        />
        <StatCard
          label="Net AR Change"
          value={`${netChange >= 0 ? "+" : "-"}$${Math.abs(netChange).toLocaleString()}`}
          icon={netChange >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
        />
        <StatCard
          label="Period Collected"
          value={`$${totalColl.toLocaleString()}`}
          icon={<BarChart3 className="h-5 w-5" />}
        />
      </div>

      <div className="dashboard-section">
        <h2 className="mb-1 text-lg font-semibold text-foreground">AR Growth vs Collections — Monthly</h2>
        <p className="mb-4 text-xs text-muted-foreground">
          New contract value (AR added) vs actual collections per month
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
            <Legend />
            <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
            <Bar dataKey="arAdded" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="AR Added" />
            <Bar dataKey="collected" fill="hsl(152 60% 40%)" radius={[4, 4, 0, 0]} name="Collected" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ARGrowthVsCollectionsChart;
