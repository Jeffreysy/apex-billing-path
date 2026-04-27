import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import EscalationInboxPanel from "@/components/EscalationInboxPanel";
import StatCard from "@/components/StatCard";
import TaskPanel from "@/components/TaskPanel";
import { useEscalations, useLegalKPI } from "@/hooks/useSupabaseData";
import {
  Scale, AlertTriangle, CheckCircle, Briefcase, TrendingUp, Users,
  FileText, Shield, ShieldAlert, Gavel, FolderOpen, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";

const COLORS = [
  "hsl(220 70% 22%)", "hsl(174 60% 40%)", "hsl(38 92% 50%)",
  "hsl(152 60% 40%)", "hsl(0 72% 51%)", "hsl(262 60% 50%)",
  "hsl(200 60% 45%)", "hsl(320 60% 45%)", "hsl(90 50% 40%)",
  "hsl(30 80% 50%)", "hsl(280 50% 55%)", "hsl(10 70% 50%)",
];

const PIPELINE_ORDER = [
  "Intake", "Forms & Compliance", "Declaration", "Evidence Gathering",
  "Attorney Review", "Filed with USCIS", "Receipts & Biometrics",
  "Pending Decision", "EAD Issued", "Approved", "RFE / Resubmission", "Closed / On Hold",
];

const PIPELINE_COLORS: Record<string, string> = {
  "Intake": "hsl(220 70% 50%)",
  "Forms & Compliance": "hsl(200 60% 45%)",
  "Declaration": "hsl(174 60% 40%)",
  "Evidence Gathering": "hsl(152 60% 40%)",
  "Attorney Review": "hsl(38 92% 50%)",
  "Filed with USCIS": "hsl(262 60% 50%)",
  "Receipts & Biometrics": "hsl(220 70% 22%)",
  "Pending Decision": "hsl(30 80% 50%)",
  "EAD Issued": "hsl(174 80% 35%)",
  "Approved": "hsl(152 70% 35%)",
  "RFE / Resubmission": "hsl(0 72% 51%)",
  "Closed / On Hold": "hsl(220 10% 50%)",
};

const YEAR_OPTIONS = [
  { label: "All Time", value: undefined },
  { label: "2022", value: 2022 },
  { label: "2023", value: 2023 },
  { label: "2024", value: 2024 },
  { label: "2025", value: 2025 },
  { label: "2026", value: 2026 },
];

const LegalDashboard = () => {
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const { data: kpiRaw, isLoading } = useLegalKPI(selectedYear);
  const kpi = kpiRaw as any;
  const { data: unresolvedEscalations = [], isLoading: escalationsLoading } = useEscalations(true);

  if (isLoading || escalationsLoading || !kpi) {
    return (
      <DashboardLayout title="Legal Department">
        <div className="p-8 text-center text-muted-foreground">Loading legal dashboard...</div>
      </DashboardLayout>
    );
  }

  const stageData = (kpi.stage_breakdown || [])
    .filter((s: any) => s.pipeline_stage !== "Other")
    .sort((a: any, b: any) => PIPELINE_ORDER.indexOf(a.pipeline_stage) - PIPELINE_ORDER.indexOf(b.pipeline_stage));

  const practiceData = (kpi.practice_breakdown || [])
    .filter((p: any) => p.practice_group !== "Other" && p.active_cnt > 0)
    .sort((a: any, b: any) => b.active_cnt - a.active_cnt);

  const attorneyData = (kpi.attorney_caseloads || []).slice(0, 12);
  const maxAttorneyCases = attorneyData.length > 0 ? attorneyData[0].active_cases : 1;

  const intakeTrend = (kpi.monthly_intake_trend || [])
    .sort((a: any, b: any) => a.intake_month.localeCompare(b.intake_month))
    .map((m: any) => ({
      ...m,
      label: new Date(m.intake_month + "-01").toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
    }));

  const intakeChange = kpi.intakes_last_month > 0
    ? Math.round(((kpi.intakes_this_month - kpi.intakes_last_month) / kpi.intakes_last_month) * 100)
    : 0;

  return (
    <DashboardLayout title="Legal Department">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Legal Dashboard</h1>
          <p className="text-muted-foreground text-sm">Immigration case pipeline, practice areas, attorney caseloads, and intake trends</p>
          <div className="mt-1.5 flex gap-2">
            <Badge variant="outline" className="text-[10px] gap-1">
              <Scale className="h-3 w-3" /> Immigration Law — Full Lifecycle Tracking
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-lg border p-1 bg-muted/30">
          {YEAR_OPTIONS.map(opt => (
            <Button
              key={opt.label}
              variant={selectedYear === opt.value ? "default" : "ghost"}
              size="sm"
              className="h-8 px-3 text-xs"
              onClick={() => setSelectedYear(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      {/* KPI Row 1 */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-6">
        <StatCard label="Active Cases" value={kpi.active_cases.toLocaleString()} icon={<Briefcase className="h-5 w-5" />} />
        <StatCard label="Filed with USCIS" value={kpi.filed_with_uscis.toLocaleString()} icon={<FileText className="h-5 w-5" />} />
        <StatCard label="Receipts & Bio" value={kpi.receipts_biometrics.toLocaleString()} icon={<Shield className="h-5 w-5" />} />
        <StatCard label="Pending Decision" value={kpi.pending_decision.toLocaleString()} icon={<Scale className="h-5 w-5" />} />
        <StatCard label="Approved" value={kpi.approved_cases.toLocaleString()} icon={<CheckCircle className="h-5 w-5" />} />
        <StatCard label="Closed" value={kpi.closed_cases.toLocaleString()} icon={<FolderOpen className="h-5 w-5" />} />
      </div>

      {/* KPI Row 2 */}
      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-6">
        <StatCard
          label="Intakes This Month"
          value={String(kpi.intakes_this_month)}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard
          label="Intakes Last Month"
          value={String(kpi.intakes_last_month)}
          icon={intakeChange >= 0
            ? <ArrowUpRight className="h-5 w-5 text-green-500" />
            : <ArrowDownRight className="h-5 w-5 text-red-500" />}
        />
        <StatCard label="Pending RFEs" value={String(kpi.pending_rfe)} icon={<AlertTriangle className="h-5 w-5" />} />
        <StatCard label="Removal Defense" value={String(kpi.removal_defense)} icon={<Gavel className="h-5 w-5" />} />
        <StatCard label="Detained" value={String(kpi.detained_cases)} icon={<ShieldAlert className="h-5 w-5" />} />
        <StatCard label="Total Cases" value={kpi.total_cases.toLocaleString()} icon={<FolderOpen className="h-5 w-5" />} />
      </div>

      {/* Case Pipeline */}
      <div className="mt-6 dashboard-section">
        <h2 className="mb-4 text-lg font-semibold">Case Pipeline — Active Cases by Stage</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stageData} margin={{ bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="pipeline_stage"
              tick={{ fontSize: 10 }}
              stroke="hsl(var(--muted-foreground))"
              angle={-35}
              textAnchor="end"
              interval={0}
              height={80}
            />
            <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
            <Tooltip formatter={(v: number) => v.toLocaleString()} />
            <Bar dataKey="cnt" name="Cases" radius={[4, 4, 0, 0]}>
              {stageData.map((s: any, i: number) => (
                <Cell key={i} fill={PIPELINE_COLORS[s.pipeline_stage] || COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Practice Area Breakdown */}
        <div className="dashboard-section">
          <h2 className="mb-4 text-lg font-semibold">Practice Area Distribution</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={practiceData}
                cx="50%" cy="50%"
                innerRadius={55} outerRadius={90}
                paddingAngle={2}
                dataKey="active_cnt"
                nameKey="practice_group"
                label={({ practice_group, percent }) =>
                  percent > 0.04 ? `${practice_group} ${(percent * 100).toFixed(0)}%` : ""
                }
                labelLine={false}
              >
                {practiceData.map((_: any, i: number) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => v.toLocaleString()} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 grid grid-cols-2 gap-1">
            {practiceData.map((d: any, i: number) => (
              <div key={d.practice_group} className="flex items-center gap-2 text-xs">
                <div className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="truncate">{d.practice_group}: {d.active_cnt.toLocaleString()}</span>
              </div>
            ))}
            {kpi.uncategorized_cases > 0 && (
              <div className="col-span-2 mt-1 text-[10px] text-muted-foreground">
                + {Number(kpi.uncategorized_cases).toLocaleString()} cases without practice area data
              </div>
            )}
          </div>
        </div>

        {/* Monthly Intake Trend */}
        <div className="dashboard-section">
          <h2 className="mb-4 text-lg font-semibold">Monthly New Intakes (Last 12 Months)</h2>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={intakeTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
              <Tooltip formatter={(v: number) => v.toLocaleString()} />
              <Area
                type="monotone"
                dataKey="new_cases"
                stroke="hsl(220 70% 22%)"
                fill="hsl(220 70% 22% / 0.15)"
                strokeWidth={2}
                name="New Cases"
                dot={{ r: 3 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Attorney Caseloads */}
        <div className="dashboard-section">
          <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
            <Users className="h-4 w-4" /> Attorney Caseloads
          </h2>
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto">
            {attorneyData.map((a: any) => (
              <div key={a.lead_attorney} className="flex items-center gap-3">
                <span className="w-40 truncate text-sm font-medium">{a.lead_attorney}</span>
                <div className="flex-1">
                  <Progress value={(a.active_cases / maxAttorneyCases) * 100} className="h-2.5" />
                </div>
                <span className="text-sm font-semibold tabular-nums w-12 text-right">{a.active_cases.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stage Progress Breakdown */}
        <div className="dashboard-section">
          <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4" /> Pipeline Stage Breakdown
          </h2>
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto">
            {stageData.map((s: any) => {
              const pct = kpi.active_cases > 0 ? (s.cnt / kpi.active_cases) * 100 : 0;
              return (
                <div key={s.pipeline_stage} className="flex items-center gap-3">
                  <span className="w-40 truncate text-sm font-medium">{s.pipeline_stage}</span>
                  <div className="flex-1 relative">
                    <div
                      className="h-2.5 rounded-full"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: PIPELINE_COLORS[s.pipeline_stage] || "hsl(var(--primary))",
                        minWidth: pct > 0 ? "4px" : "0",
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold tabular-nums w-16 text-right">
                    {s.cnt.toLocaleString()} <span className="text-xs text-muted-foreground">({pct.toFixed(1)}%)</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <EscalationInboxPanel
          escalations={unresolvedEscalations}
          inbox="legal"
          title="Legal Escalation Inbox"
          emptyMessage="No unresolved legal escalations right now."
        />
        <TaskPanel department="legal" />
      </div>
    </DashboardLayout>
  );
};

export default LegalDashboard;
