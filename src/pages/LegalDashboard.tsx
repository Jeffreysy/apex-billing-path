import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import TaskPanel from "@/components/TaskPanel";
import { useMergedClients } from "@/hooks/useSupabaseData";
import { Scale, FileText, AlertTriangle, CheckCircle, Briefcase, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const LegalDashboard = () => {
  const { data: clients = [], isLoading } = useMergedClients();

  if (isLoading) return <DashboardLayout title="Legal Department"><div className="p-8 text-center text-muted-foreground">Loading...</div></DashboardLayout>;

  const caseStages = ["intake", "discovery", "negotiation", "litigation", "settlement", "closed"] as const;
  const stageData = caseStages.map(stage => {
    const stageClients = clients.filter(c => c.caseStage === stage);
    return {
      stage: stage.charAt(0).toUpperCase() + stage.slice(1),
      count: stageClients.length,
      delinquent: stageClients.filter(c => c.status === "delinquent").length,
      receivables: stageClients.reduce((s, c) => s + Math.max(0, c.totalOwed - c.totalPaid), 0),
    };
  });

  const newRetainers = clients.filter(c => c.status === "new").length;
  const newContracts = clients.filter(c => { const start = new Date(c.contractStart); const thirtyAgo = new Date(); thirtyAgo.setDate(thirtyAgo.getDate() - 30); return start >= thirtyAgo; }).length;
  const upToDate = clients.filter(c => c.status === "active" && c.daysAging === 0).length;
  const fullyPaid = clients.filter(c => c.status === "completed").length;
  const closedCases = clients.filter(c => c.caseStage === "closed").length;
  const totalDelinquent = clients.filter(c => c.status === "delinquent").length;
  const stageAlerts = clients.filter(c => c.status === "delinquent" && (c.caseStage === "litigation" || c.caseStage === "settlement"));

  return (
    <DashboardLayout title="Legal Department">
      <div className="mb-6"><h1 className="text-2xl font-bold">Legal Dashboard</h1><p className="text-muted-foreground">Case stages, retainers, and billing oversight for the legal team</p></div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
        <StatCard label="New Retainers" value={String(newRetainers)} icon={<Briefcase className="h-5 w-5" />} />
        <StatCard label="New Contracts" value={String(newContracts)} icon={<FileText className="h-5 w-5" />} />
        <StatCard label="Up-to-Date" value={String(upToDate)} icon={<CheckCircle className="h-5 w-5" />} />
        <StatCard label="Fully Paid" value={String(fullyPaid)} icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard label="Delinquent" value={String(totalDelinquent)} icon={<AlertTriangle className="h-5 w-5" />} />
        <StatCard label="Closed Cases" value={String(closedCases)} icon={<Scale className="h-5 w-5" />} />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
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
        <div className="dashboard-section">
          <h2 className="mb-4 text-lg font-semibold">Cases by Stage</h2>
          <div className="space-y-3">
            {stageData.map(s => (
              <div key={s.stage} className="flex items-center gap-3">
                <span className="w-24 text-sm font-medium">{s.stage}</span>
                <div className="flex-1"><Progress value={clients.length > 0 ? (s.count / clients.length) * 100 : 0} className="h-2" /></div>
                <div className="flex items-center gap-2"><span className="text-sm font-semibold">{s.count}</span>{s.delinquent > 0 && <Badge variant="destructive" className="text-[10px]">{s.delinquent} delinq.</Badge>}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="dashboard-section">
          <h2 className="mb-4 text-lg font-semibold flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" />Case Stage Alerts</h2>
          {stageAlerts.length === 0 ? <p className="text-sm text-muted-foreground">No critical alerts.</p> : (
            <div className="space-y-2">
              {stageAlerts.map(c => (
                <div key={c.id} className="flex items-center justify-between rounded-md border border-destructive/20 bg-destructive/5 p-3">
                  <div><p className="text-sm font-medium">{c.name}</p><p className="text-xs text-muted-foreground">{c.caseNumber} · {c.caseStage} stage · {c.daysAging} days past due</p></div>
                  <Badge variant="destructive" className="text-xs">${(c.totalOwed - c.totalPaid).toLocaleString()} owed</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
        <TaskPanel department="legal" />
      </div>
      <div className="mt-6 rounded-lg border border-dashed border-muted-foreground/30 p-6 text-center">
        <p className="text-sm text-muted-foreground">To view billing details, contract breakdown, notes, and tags for a specific client, use the <strong>Client Search Bar</strong> above.</p>
      </div>
    </DashboardLayout>
  );
};

export default LegalDashboard;
