import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import TaskPanel from "@/components/TaskPanel";
import { clients, payments } from "@/data/mockData";
import { Scale, FileText, AlertTriangle, CheckCircle, Briefcase, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const LegalDashboard = () => {
  const caseStages = ["intake", "discovery", "negotiation", "litigation", "settlement", "closed"] as const;
  const stageData = caseStages.map((stage) => {
    const stageClients = clients.filter((c) => c.caseStage === stage);
    return {
      stage: stage.charAt(0).toUpperCase() + stage.slice(1),
      count: stageClients.length,
      delinquent: stageClients.filter((c) => c.status === "delinquent").length,
      receivables: stageClients.reduce((s, c) => s + (c.totalOwed - c.totalPaid), 0),
    };
  });

  const newRetainers = clients.filter((c) => c.status === "new").length;
  const newContracts = clients.filter((c) => {
    const start = new Date(c.contractStart);
    const thirtyAgo = new Date(); thirtyAgo.setDate(thirtyAgo.getDate() - 30);
    return start >= thirtyAgo;
  }).length;
  const upToDate = clients.filter((c) => c.status === "active" && c.daysAging === 0).length;
  const fullyPaid = clients.filter((c) => c.status === "completed").length;
  const closedCases = clients.filter((c) => c.caseStage === "closed").length;
  const totalDelinquent = clients.filter((c) => c.status === "delinquent").length;

  const stageAlerts = clients.filter((c) => c.status === "delinquent" && (c.caseStage === "litigation" || c.caseStage === "settlement"));

  return (
    <DashboardLayout title="Legal Department">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Legal Dashboard</h1>
        <p className="text-muted-foreground">Case stages, retainers, and billing oversight for the legal team</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
        <StatCard label="New Retainers" value={String(newRetainers)} change={15} icon={<Briefcase className="h-5 w-5" />} />
        <StatCard label="New Contracts" value={String(newContracts)} change={8} icon={<FileText className="h-5 w-5" />} />
        <StatCard label="Up-to-Date" value={String(upToDate)} change={3} icon={<CheckCircle className="h-5 w-5" />} />
        <StatCard label="Fully Paid" value={String(fullyPaid)} change={12} icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard label="Delinquent" value={String(totalDelinquent)} change={-4} icon={<AlertTriangle className="h-5 w-5" />} />
        <StatCard label="Closed Cases" value={String(closedCases)} change={6} icon={<Scale className="h-5 w-5" />} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Receivables by Stage */}
        <div className="dashboard-section">
          <h2 className="mb-4 text-lg font-semibold">Receivables by Case Stage</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 88%)" />
              <XAxis dataKey="stage" tick={{ fontSize: 11 }} stroke="hsl(220 10% 46%)" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(220 10% 46%)" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
              <Bar dataKey="receivables" fill="hsl(220 70% 22%)" radius={[4, 4, 0, 0]} name="Outstanding AR" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cases by Stage */}
        <div className="dashboard-section">
          <h2 className="mb-4 text-lg font-semibold">Cases by Stage</h2>
          <div className="space-y-3">
            {stageData.map((s) => (
              <div key={s.stage} className="flex items-center gap-3">
                <span className="w-24 text-sm font-medium">{s.stage}</span>
                <div className="flex-1">
                  <Progress value={(s.count / clients.length) * 100} className="h-2" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{s.count}</span>
                  {s.delinquent > 0 && (
                    <Badge variant="destructive" className="text-[10px]">{s.delinquent} delinq.</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Stage Alerts */}
        <div className="dashboard-section">
          <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            Case Stage Alerts
          </h2>
          {stageAlerts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No critical alerts.</p>
          ) : (
            <div className="space-y-2">
              {stageAlerts.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-md border border-destructive/20 bg-destructive/5 p-3">
                  <div>
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.caseNumber} · {c.caseStage} stage · {c.daysAging} days past due</p>
                  </div>
                  <Badge variant="destructive" className="text-xs">${(c.totalOwed - c.totalPaid).toLocaleString()} owed</Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        <TaskPanel department="legal" />
      </div>

      {/* All Clients with Billing */}
      <div className="mt-6 dashboard-section">
        <h2 className="mb-4 text-lg font-semibold">Client Billing Overview</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-3 font-medium">Client</th>
                <th className="pb-3 font-medium">Case #</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Stage</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Balance</th>
                <th className="pb-3 font-medium">Tags</th>
              </tr>
            </thead>
            <tbody>
              {clients.slice(0, 12).map((c) => (
                <tr key={c.id} className="border-b last:border-0">
                  <td className="py-3 font-medium">{c.name}</td>
                  <td className="py-3 font-mono text-xs">{c.caseNumber}</td>
                  <td className="py-3 text-muted-foreground">{c.caseType}</td>
                  <td className="py-3 capitalize">{c.caseStage}</td>
                  <td className="py-3">
                    <Badge variant={c.status === "delinquent" ? "destructive" : c.status === "completed" ? "secondary" : "default"} className="text-xs capitalize">{c.status}</Badge>
                  </td>
                  <td className="py-3 font-semibold">${(c.totalOwed - c.totalPaid).toLocaleString()}</td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-1">{c.tags.slice(0, 2).map((t) => <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>)}</div>
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

export default LegalDashboard;
