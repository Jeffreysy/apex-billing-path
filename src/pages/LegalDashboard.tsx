import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import TaskPanel from "@/components/TaskPanel";
import { useImmigrationCases, useCaseMilestones } from "@/hooks/useSupabaseData";
import { Scale, AlertTriangle, CheckCircle, Briefcase, TrendingUp, Users, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(220 70% 22%)", "hsl(174 60% 40%)", "hsl(38 92% 50%)", "hsl(152 60% 40%)", "hsl(0 72% 51%)", "hsl(262 60% 50%)"];

const LegalDashboard = () => {
  // Fetch active cases only (is_closed = false)
  const { data: activeCases = [], isLoading: casesLoading } = useImmigrationCases(true);
  // Fetch all cases for total counts
  const { data: allCases = [], isLoading: allCasesLoading } = useImmigrationCases(false);
  const { data: milestones = [], isLoading: milestonesLoading } = useCaseMilestones();

  if (casesLoading || allCasesLoading || milestonesLoading) return <DashboardLayout title="Legal Department"><div className="p-8 text-center text-muted-foreground">Loading...</div></DashboardLayout>;

  const closedCases = allCases.filter(c => c.is_closed === true).length;

  // Case stage distribution from active cases
  const stageMap = new Map<string, number>();
  for (const c of activeCases) {
    const stage = c.case_stage || "Unknown";
    stageMap.set(stage, (stageMap.get(stage) || 0) + 1);
  }
  const stageData = Array.from(stageMap, ([stage, count]) => ({ stage, count })).sort((a, b) => b.count - a.count);

  // Practice area breakdown
  const practiceAreaMap = new Map<string, number>();
  for (const c of activeCases) {
    const area = c.practice_area || "Unknown";
    practiceAreaMap.set(area, (practiceAreaMap.get(area) || 0) + 1);
  }
  const practiceAreaData = Array.from(practiceAreaMap, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  // Attorney assignments
  const attorneyMap = new Map<string, number>();
  for (const c of activeCases) {
    const attorney = c.lead_attorney || "Unassigned";
    attorneyMap.set(attorney, (attorneyMap.get(attorney) || 0) + 1);
  }
  const attorneyData = Array.from(attorneyMap, ([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);

  // Upcoming milestones
  const upcomingMilestones = milestones
    .filter(m => !m.completed && m.milestone_date && new Date(m.milestone_date) >= new Date())
    .sort((a, b) => (a.milestone_date || "").localeCompare(b.milestone_date || ""))
    .slice(0, 10);

  // KPIs
  const inLitigation = activeCases.filter(c => (c.case_stage || "").toLowerCase() === "litigation").length;
  const completedMilestones = milestones.filter(m => m.completed).length;
  const pendingMilestones = milestones.filter(m => !m.completed).length;
  const detainedCases = activeCases.filter(c => c.detained).length;

  return (
    <DashboardLayout title="Legal Department">
      <div className="mb-6"><h1 className="text-2xl font-bold">Legal Dashboard</h1><p className="text-muted-foreground">Immigration case stages, practice areas, attorney assignments, and milestones</p></div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
        <StatCard label="Active Cases" value={String(activeCases.length)} icon={<Briefcase className="h-5 w-5" />} />
        <StatCard label="In Litigation" value={String(inLitigation)} icon={<Scale className="h-5 w-5" />} />
        <StatCard label="Closed Cases" value={String(closedCases)} icon={<CheckCircle className="h-5 w-5" />} />
        <StatCard label="Detained" value={String(detainedCases)} icon={<AlertTriangle className="h-5 w-5" />} />
        <StatCard label="Milestones Done" value={String(completedMilestones)} icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard label="Milestones Pending" value={String(pendingMilestones)} icon={<Calendar className="h-5 w-5" />} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="dashboard-section">
          <h2 className="mb-4 text-lg font-semibold">Cases by Stage</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 88%)" />
              <XAxis dataKey="stage" tick={{ fontSize: 11 }} stroke="hsl(220 10% 46%)" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(220 10% 46%)" allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(220 70% 22%)" radius={[4, 4, 0, 0]} name="Cases" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="dashboard-section">
          <h2 className="mb-4 text-lg font-semibold">Practice Area Breakdown</h2>
          {practiceAreaData.length === 0 ? <p className="text-sm text-muted-foreground">No data.</p> : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={practiceAreaData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {practiceAreaData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 grid grid-cols-2 gap-1">
                {practiceAreaData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2 text-xs">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="truncate">{d.name}: {d.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="dashboard-section">
          <h2 className="mb-4 text-lg font-semibold flex items-center gap-2"><Users className="h-4 w-4" />Attorney Assignments</h2>
          {attorneyData.length === 0 ? <p className="text-sm text-muted-foreground">No attorney data.</p> : (
            <div className="space-y-3">
              {attorneyData.map(a => (
                <div key={a.name} className="flex items-center gap-3">
                  <span className="w-36 truncate text-sm font-medium">{a.name}</span>
                  <div className="flex-1"><Progress value={activeCases.length > 0 ? (a.count / activeCases.length) * 100 : 0} className="h-2" /></div>
                  <span className="text-sm font-semibold tabular-nums">{a.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="dashboard-section">
          <h2 className="mb-4 text-lg font-semibold flex items-center gap-2"><Calendar className="h-4 w-4" />Upcoming Milestones</h2>
          {upcomingMilestones.length === 0 ? <p className="text-sm text-muted-foreground">No upcoming milestones.</p> : (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {upcomingMilestones.map(m => (
                <div key={m.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">{m.milestone_type}</p>
                    <p className="text-xs text-muted-foreground">{m.notes || "No notes"}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">{m.milestone_date}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="dashboard-section">
          <h2 className="mb-4 text-lg font-semibold flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" />Case Stage Progress</h2>
          <div className="space-y-3">
            {stageData.map(s => (
              <div key={s.stage} className="flex items-center gap-3">
                <span className="w-24 text-sm font-medium">{s.stage}</span>
                <div className="flex-1"><Progress value={activeCases.length > 0 ? (s.count / activeCases.length) * 100 : 0} className="h-2" /></div>
                <span className="text-sm font-semibold tabular-nums">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
        <TaskPanel department="legal" />
      </div>
    </DashboardLayout>
  );
};

export default LegalDashboard;
