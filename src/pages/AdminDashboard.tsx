import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { clients, payments, callLogs, collectors, getWeeklyCollections } from "@/data/mockData";
import { DollarSign, Users, Phone, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Badge } from "@/components/ui/badge";

const AdminDashboard = () => {
  const totalAR = clients.reduce((sum, c) => sum + (c.totalOwed - c.totalPaid), 0);
  const totalCollected = payments.filter(p => p.status === "completed").reduce((sum, p) => sum + p.amount, 0);
  const activeClients = clients.filter(c => c.status === "active").length;
  const totalCalls = callLogs.length;
  const weeklyData = getWeeklyCollections(8);

  const recentPayments = [...payments]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8);

  const statusColors: Record<string, string> = {
    active: "bg-success/10 text-success border-success/20",
    delinquent: "bg-destructive/10 text-destructive border-destructive/20",
    completed: "bg-primary/10 text-primary border-primary/20",
    new: "bg-warning/10 text-warning border-warning/20",
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of collections and accounts receivable</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total AR Outstanding"
          value={`$${totalAR.toLocaleString()}`}
          change={-3.2}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          label="Total Collected (90d)"
          value={`$${totalCollected.toLocaleString()}`}
          change={12.5}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard
          label="Active Clients"
          value={String(activeClients)}
          change={5}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          label="Calls This Month"
          value={String(totalCalls)}
          change={8.3}
          icon={<Phone className="h-5 w-5" />}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="dashboard-section lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold">Weekly Collections vs Target</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 88%)" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="hsl(220 10% 46%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(220 10% 46%)" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="collected" fill="hsl(174 60% 40%)" radius={[4, 4, 0, 0]} name="Collected" />
              <Bar dataKey="target" fill="hsl(220 70% 22%)" radius={[4, 4, 0, 0]} name="Target" opacity={0.3} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="dashboard-section">
          <h2 className="mb-4 text-lg font-semibold">Collector Performance</h2>
          <div className="space-y-4">
            {collectors.map((c) => (
              <div key={c.id} className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {c.avatar}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.callsMade} calls · {c.paymentsTaken} payments</p>
                </div>
                <p className="text-sm font-semibold text-secondary">${c.totalCollected.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 dashboard-section">
        <h2 className="mb-4 text-lg font-semibold">Recent Payments</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-3 font-medium">Client</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Method</th>
                <th className="pb-3 font-medium">Collector</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="py-3 font-medium">{p.clientName}</td>
                  <td className="py-3">${p.amount.toLocaleString()}</td>
                  <td className="py-3 text-muted-foreground">{p.date}</td>
                  <td className="py-3 capitalize">{p.method}</td>
                  <td className="py-3">{p.collectorName}</td>
                  <td className="py-3">
                    <Badge variant={p.status === "completed" ? "default" : p.status === "pending" ? "secondary" : "destructive"} className="text-xs">
                      {p.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
