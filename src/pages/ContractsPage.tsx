import DashboardLayout from "@/components/DashboardLayout";
import { clients, getARAgingData } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Progress } from "@/components/ui/progress";

const ContractsPage = () => {
  const agingData = getARAgingData();
  const sortedClients = [...clients].sort((a, b) => {
    const order = { delinquent: 0, active: 1, new: 2, completed: 3 };
    return order[a.status] - order[b.status];
  });

  const statusBadge = (status: string) => {
    const map: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      delinquent: "destructive",
      completed: "secondary",
      new: "outline",
    };
    return <Badge variant={map[status] || "default"} className="text-xs capitalize">{status}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Contracts & Accounts Receivable</h1>
        <p className="text-muted-foreground">Client progression, AR aging, and contract status tracking</p>
      </div>

      <div className="dashboard-section mb-6">
        <h2 className="mb-4 text-lg font-semibold">AR Aging Summary</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={agingData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 88%)" />
            <XAxis dataKey="range" tick={{ fontSize: 12 }} stroke="hsl(220 10% 46%)" />
            <YAxis tick={{ fontSize: 12 }} stroke="hsl(220 10% 46%)" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
            <Bar dataKey="amount" fill="hsl(220 70% 22%)" radius={[4, 4, 0, 0]} name="Outstanding" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="dashboard-section">
        <h2 className="mb-4 text-lg font-semibold">All Contracts</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-3 font-medium">Client</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Total Owed</th>
                <th className="pb-3 font-medium">Paid</th>
                <th className="pb-3 font-medium">Progress</th>
                <th className="pb-3 font-medium">Monthly</th>
                <th className="pb-3 font-medium">Next Due</th>
              </tr>
            </thead>
            <tbody>
              {sortedClients.map((c) => {
                const pct = c.totalOwed > 0 ? Math.round((c.totalPaid / c.totalOwed) * 100) : 0;
                return (
                  <tr key={c.id} className="border-b last:border-0">
                    <td className="py-3 font-medium">{c.name}</td>
                    <td className="py-3">{statusBadge(c.status)}</td>
                    <td className="py-3">${c.totalOwed.toLocaleString()}</td>
                    <td className="py-3">${c.totalPaid.toLocaleString()}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <Progress value={pct} className="h-2 w-20" />
                        <span className="text-xs text-muted-foreground">{pct}%</span>
                      </div>
                    </td>
                    <td className="py-3">${c.monthlyPayment.toLocaleString()}</td>
                    <td className="py-3 text-muted-foreground">{c.nextPaymentDue}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ContractsPage;
