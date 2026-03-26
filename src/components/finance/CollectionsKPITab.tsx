import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  Phone, DollarSign, TrendingUp, Target, CheckCircle, Clock,
} from "lucide-react";

const COLORS = [
  "hsl(var(--primary))", "hsl(var(--destructive))", "hsl(var(--secondary))",
  "#f59e0b", "#10b981", "#6366f1", "#ec4899",
];

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

const CollectionsKPITab = () => {
  const { data: activities = [] } = useQuery({
    queryKey: ["kpi-activities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("collection_activities")
        .select("*")
        .order("activity_date", { ascending: false })
        .limit(1000);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: commitments = [] } = useQuery({
    queryKey: ["kpi-commitments"],
    queryFn: async () => {
      const { data } = await supabase.from("payment_commitments").select("*");
      return data || [];
    },
  });

  const { data: escalations = [] } = useQuery({
    queryKey: ["kpi-escalations"],
    queryFn: async () => {
      const { data } = await supabase.from("escalations").select("*");
      return data || [];
    },
  });

  const collectorStats = useMemo(() => {
    const map: Record<string, { calls: number; collected: number; contacts: number; minutes: number; commission: number }> = {};
    activities.forEach(a => {
      const c = a.collector || "Unknown";
      if (!map[c]) map[c] = { calls: 0, collected: 0, contacts: 0, minutes: 0, commission: 0 };
      map[c].calls++;
      map[c].collected += a.collected_amount || 0;
      map[c].commission += a.commission || 0;
      map[c].minutes += a.duration_minutes || 0;
      if (a.outcome && !["no_answer", "wrong_number", "left_voicemail"].includes(a.outcome)) map[c].contacts++;
    });
    return Object.entries(map).map(([name, s]) => ({
      name, ...s,
      contactRate: s.calls > 0 ? Math.round((s.contacts / s.calls) * 100) : 0,
    })).sort((a, b) => b.collected - a.collected);
  }, [activities]);

  const outcomeData = useMemo(() => {
    const map: Record<string, number> = {};
    activities.forEach(a => { const o = a.outcome || "unknown"; map[o] = (map[o] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name: name.replace(/_/g, " "), value })).sort((a, b) => b.value - a.value);
  }, [activities]);

  const weeklyData = useMemo(() => {
    const weeks: Record<string, { calls: number; collected: number }> = {};
    activities.forEach(a => {
      if (!a.activity_date) return;
      const d = new Date(a.activity_date);
      const weekStart = new Date(d); weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toISOString().slice(0, 10);
      if (!weeks[key]) weeks[key] = { calls: 0, collected: 0 };
      weeks[key].calls++; weeks[key].collected += a.collected_amount || 0;
    });
    return Object.entries(weeks).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 8).reverse()
      .map(([week, s]) => ({ week: week.slice(5), ...s }));
  }, [activities]);

  const kpis = useMemo(() => {
    const totalCalls = activities.length;
    const totalCollected = activities.reduce((s, a) => s + (a.collected_amount || 0), 0);
    const totalCommission = activities.reduce((s, a) => s + (a.commission || 0), 0);
    const pendingCommitments = commitments.filter(c => c.status === "pending").length;
    const keptRate = commitments.length > 0
      ? Math.round((commitments.filter(c => c.status === "kept").length / commitments.length) * 100) : 0;
    const openEscalations = escalations.filter(e => e.status === "open" || e.status === "in_progress").length;
    return { totalCalls, totalCollected, totalCommission, pendingCommitments, keptRate, openEscalations };
  }, [activities, commitments, escalations]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <KpiCard icon={Phone} label="Total Calls" value={kpis.totalCalls.toLocaleString()} />
        <KpiCard icon={DollarSign} label="Total Collected" value={fmt(kpis.totalCollected)} />
        <KpiCard icon={TrendingUp} label="Commission" value={fmt(kpis.totalCommission)} />
        <KpiCard icon={Target} label="Pending Commits" value={kpis.pendingCommitments} />
        <KpiCard icon={CheckCircle} label="Commit Kept %" value={`${kpis.keptRate}%`} />
        <KpiCard icon={Clock} label="Open Escalations" value={kpis.openEscalations} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-lg border bg-card p-4">
          <h2 className="text-sm font-semibold text-foreground mb-3">Collector Performance</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={collectorStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              <Bar dataKey="calls" name="Calls" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="contacts" name="Contacts" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <h2 className="text-sm font-semibold text-foreground mb-3">Outcome Distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={outcomeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {outcomeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <h2 className="text-sm font-semibold text-foreground mb-3">Weekly Collection Trend</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="week" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ fontSize: 11 }} formatter={(value: number) => fmt(value)} />
            <Bar dataKey="collected" name="Collected" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-lg border bg-card overflow-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b bg-muted/50 text-muted-foreground">
              <th className="px-3 py-2 text-left font-medium">Collector</th>
              <th className="px-3 py-2 text-left font-medium">Calls</th>
              <th className="px-3 py-2 text-left font-medium">Contacts</th>
              <th className="px-3 py-2 text-left font-medium">Contact Rate</th>
              <th className="px-3 py-2 text-left font-medium">Collected</th>
              <th className="px-3 py-2 text-left font-medium">Commission</th>
              <th className="px-3 py-2 text-left font-medium">Avg Duration</th>
            </tr>
          </thead>
          <tbody>
            {collectorStats.map(c => (
              <tr key={c.name} className="border-b hover:bg-muted/30">
                <td className="px-3 py-2 font-medium">{c.name}</td>
                <td className="px-3 py-2">{c.calls}</td>
                <td className="px-3 py-2">{c.contacts}</td>
                <td className="px-3 py-2"><Badge variant={c.contactRate >= 50 ? "default" : "secondary"} className="text-xs">{c.contactRate}%</Badge></td>
                <td className="px-3 py-2 font-mono">{fmt(c.collected)}</td>
                <td className="px-3 py-2 font-mono">{fmt(c.commission)}</td>
                <td className="px-3 py-2">{c.calls > 0 ? `${Math.round(c.minutes / c.calls)}m` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const KpiCard = ({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) => (
  <div className="rounded-lg border bg-card p-3">
    <div className="flex items-center gap-2 mb-1">
      <Icon className="h-3.5 w-3.5 text-primary" />
      <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</span>
    </div>
    <p className="text-lg font-bold text-foreground">{value}</p>
  </div>
);

export default CollectionsKPITab;
