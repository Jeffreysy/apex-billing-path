import DashboardLayout from "@/components/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { format, subDays, startOfMonth, endOfMonth, addMonths, startOfWeek, eachDayOfInterval } from "date-fns";
import { fetchAllRows } from "@/hooks/useSupabaseData";
import MonthFilter, { type MonthOption } from "@/components/MonthFilter";
import CollapsibleSection from "@/components/collections/CollapsibleSection";
import { Sparkline, BarCell, PctBar, HeatCell, Delta } from "@/components/collections/MiniViz";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import {
  TEAM_MEMBERS,
  COLLECTORS,
  INTAKE,
  TEAM_ROLES,
  ORIGIN_BUCKETS,
  OUTCOME_BUCKETS,
  AGING_BUCKETS,
  normalizeOrigin,
  normalizeOutcome,
  normalizeDirection,
  isCallDirection,
  agingBucket,
  fmtMoney,
  fmtPct,
} from "@/lib/teamRoles";

type Activity = {
  id: string;
  activity_date: string;
  collector: string | null;
  client_id: string | null;
  client_name: string | null;
  origin: string | null;
  call_direction: string | null;
  outcome: string | null;
  collected_amount: number | null;
  commission: number | null;
  duration_minutes: number | null;
  delinquency_days: number | null;
};

function monthOptions(): MonthOption[] {
  const out: MonthOption[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = addMonths(now, -i);
    out.push({ label: format(d, "MMMM yyyy"), value: format(d, "yyyy-MM"), from: startOfMonth(d), to: endOfMonth(d) });
  }
  return out;
}

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
function dayIndex(iso: string): number {
  const d = new Date(iso + "T00:00:00");
  return (d.getDay() + 6) % 7;
}

type Agg = {
  calls: number; outbound: number; inbound: number; admin: number; connected: number; escalated: number;
  activities: number; collected: number; commission: number; minutes: number; today_collected: number;
  daysWorked: Set<string>;
  outcomes: Record<string, number>;
  aging: Record<string, number>;
  originCount: Record<string, number>;
  originDollars: Record<string, number>;
  allCallsByOrigin: Record<string, number>;
  todayActivities: number; todayInbound: number; todayOutbound: number; todayOutcomes: Record<string, number>;
  dailyCollected: Record<string, number>; // ISO date -> $ collected (for sparkline)
};

function emptyAgg(): Agg {
  return {
    calls: 0, outbound: 0, inbound: 0, admin: 0, connected: 0, escalated: 0,
    activities: 0, collected: 0, commission: 0, minutes: 0, today_collected: 0,
    daysWorked: new Set(),
    outcomes: Object.fromEntries(OUTCOME_BUCKETS.map(b => [b, 0])),
    aging: Object.fromEntries(AGING_BUCKETS.map(b => [b, 0])),
    originCount: Object.fromEntries(ORIGIN_BUCKETS.map(b => [b, 0])),
    originDollars: Object.fromEntries(ORIGIN_BUCKETS.map(b => [b, 0])),
    allCallsByOrigin: Object.fromEntries(ORIGIN_BUCKETS.map(b => [b, 0])),
    todayActivities: 0, todayInbound: 0, todayOutbound: 0, todayOutcomes: {},
    dailyCollected: {},
  };
}

// Build per-team aggregate from a flat list of activities scoped to one period.
function aggregate(rows: Activity[], today: string): Record<string, Agg> {
  const map: Record<string, Agg> = {};
  for (const m of TEAM_MEMBERS) map[m] = emptyAgg();
  for (const r of rows) {
    const a = map[r.collector!];
    if (!a) continue;
    const dir = normalizeDirection(r.call_direction);
    const origin = normalizeOrigin(r.origin);
    const outcome = normalizeOutcome(r.outcome);
    const dollars = Number(r.collected_amount) || 0;
    const comm = Number(r.commission) || 0;
    const minutes = Number(r.duration_minutes) || 0;
    a.activities++;
    a.daysWorked.add(r.activity_date);
    if (isCallDirection(dir)) { a.calls++; if (dir === "outbound") a.outbound++; else a.inbound++; }
    else if (dir === "admin") a.admin++;
    if (outcome && outcome !== "No Answer / VM") a.connected++;
    if (outcome) a.outcomes[outcome] = (a.outcomes[outcome] || 0) + 1;
    a.commission += comm;
    a.collected += dollars;
    a.minutes += minutes;
    if (isCallDirection(dir)) a.allCallsByOrigin[origin] = (a.allCallsByOrigin[origin] || 0) + 1;
    if (dollars > 0) {
      a.originCount[origin] = (a.originCount[origin] || 0) + 1;
      a.originDollars[origin] = (a.originDollars[origin] || 0) + dollars;
      a.aging[agingBucket(r.delinquency_days)] = (a.aging[agingBucket(r.delinquency_days)] || 0) + dollars;
      a.dailyCollected[r.activity_date] = (a.dailyCollected[r.activity_date] || 0) + dollars;
    }
    if (r.activity_date === today) {
      a.todayActivities++;
      a.today_collected += dollars;
      if (dir === "inbound") a.todayInbound++;
      if (dir === "outbound") a.todayOutbound++;
      if (outcome) a.todayOutcomes[outcome] = (a.todayOutcomes[outcome] || 0) + 1;
    }
  }
  return map;
}

const CollectionsDashboard = () => {
  const opts = useMemo(() => monthOptions(), []);
  const [month, setMonth] = useState(() => format(new Date(), "yyyy-MM"));
  const selected = opts.find(o => o.value === month) ?? opts[0];

  // Fetch 10 weeks before month start (for sparklines + prior-period deltas) through month end.
  const windowStart = format(subDays(selected.from!, 70), "yyyy-MM-dd");
  const windowEnd = format(selected.to!, "yyyy-MM-dd");

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["collections-monthly-kpi", windowStart, windowEnd],
    queryFn: () =>
      fetchAllRows<Activity>("collection_activities", {
        filter: q => q.gte("activity_date", windowStart).lte("activity_date", windowEnd),
        orderBy: "activity_date",
      }),
    staleTime: 5 * 60 * 1000,
  });

  const monthStart = format(selected.from!, "yyyy-MM-dd");
  const monthEnd = format(selected.to!, "yyyy-MM-dd");
  const today = format(new Date(), "yyyy-MM-dd");

  const inMonth = useMemo(
    () => rows.filter(r => r.activity_date >= monthStart && r.activity_date <= monthEnd && r.collector && TEAM_ROLES[r.collector]),
    [rows, monthStart, monthEnd],
  );
  const priorMonthStart = format(addMonths(selected.from!, -1), "yyyy-MM-dd");
  const priorMonthEnd = format(subDays(selected.from!, 1), "yyyy-MM-dd");
  const inPriorMonth = useMemo(
    () => rows.filter(r => r.activity_date >= priorMonthStart && r.activity_date <= priorMonthEnd && r.collector && TEAM_ROLES[r.collector]),
    [rows, priorMonthStart, priorMonthEnd],
  );
  const priorWindow = useMemo(
    () => rows.filter(r => r.activity_date < monthStart && r.activity_date >= format(subDays(selected.from!, 31), "yyyy-MM-dd") && r.collector && TEAM_ROLES[r.collector]),
    [rows, monthStart, selected.from],
  );

  const agg = useMemo(() => aggregate(inMonth, today), [inMonth, today]);
  const aggPrior = useMemo(() => aggregate(inPriorMonth, today), [inPriorMonth, today]);

  // ===== New Client Contacts grid =====
  const newContacts = useMemo(() => {
    const priorMap = new Map<string, string[]>();
    for (const r of priorWindow) {
      if (!r.client_id) continue;
      if (normalizeDirection(r.call_direction) !== "outbound") continue;
      const key = `${r.collector}|${r.client_id}`;
      const arr = priorMap.get(key) || [];
      arr.push(r.activity_date);
      priorMap.set(key, arr);
    }
    const seen = new Map<string, Set<string>>();
    const grid: Record<string, number[]> = {};
    for (const m of TEAM_MEMBERS) grid[m] = [0, 0, 0, 0, 0, 0, 0];
    for (const r of inMonth) {
      if (!r.client_id || !r.collector) continue;
      if (normalizeDirection(r.call_direction) !== "outbound") continue;
      const sset = seen.get(r.collector) || new Set<string>();
      if (sset.has(r.client_id)) continue;
      const cutoff = format(subDays(new Date(r.activity_date + "T00:00:00"), 30), "yyyy-MM-dd");
      const priors = priorMap.get(`${r.collector}|${r.client_id}`) || [];
      const recent = priors.some(d => d >= cutoff && d < r.activity_date);
      if (recent) continue;
      grid[r.collector][dayIndex(r.activity_date)] += 1;
      sset.add(r.client_id);
      seen.set(r.collector, sset);
    }
    return grid;
  }, [inMonth, priorWindow]);

  // ===== KPI hero (with prior-month deltas + 8-week sparklines) =====
  const teamKpi = useMemo(() => {
    const sum = (xs: Agg[], f: (a: Agg) => number) => xs.reduce((s, a) => s + f(a), 0);
    const a = Object.values(agg);
    const p = Object.values(aggPrior);
    const activities = sum(a, x => x.activities);
    const calls = sum(a, x => x.calls);
    const collected = sum(a, x => x.collected);
    const commission = sum(a, x => x.commission);
    const connected = sum(a, x => x.connected);
    return {
      activities, collected, commission,
      avgPerCall: calls ? collected / calls : 0,
      collectionRate: calls ? connected / calls : 0,
      prev: {
        activities: sum(p, x => x.activities),
        collected: sum(p, x => x.collected),
        commission: sum(p, x => x.commission),
        avgPerCall: (() => { const c = sum(p, x => x.calls); return c ? sum(p, x => x.collected) / c : 0; })(),
        collectionRate: (() => { const c = sum(p, x => x.calls); return c ? sum(p, x => x.connected) / c : 0; })(),
      },
    };
  }, [agg, aggPrior]);

  // 8-week sparkline series for each KPI, built from raw rows.
  const weeklySeries = useMemo(() => {
    const weeks = 8;
    const buckets: { key: string; activities: number; calls: number; connected: number; collected: number; commission: number }[] = [];
    const now = startOfWeek(selected.to!, { weekStartsOn: 1 });
    for (let i = weeks - 1; i >= 0; i--) {
      const wStart = subDays(now, i * 7);
      buckets.push({ key: format(wStart, "yyyy-MM-dd"), activities: 0, calls: 0, connected: 0, collected: 0, commission: 0 });
    }
    const firstWeek = buckets[0].key;
    for (const r of rows) {
      if (!r.collector || !TEAM_ROLES[r.collector]) continue;
      const wk = format(startOfWeek(new Date(r.activity_date + "T00:00:00"), { weekStartsOn: 1 }), "yyyy-MM-dd");
      if (wk < firstWeek) continue;
      const b = buckets.find(x => x.key === wk);
      if (!b) continue;
      b.activities++;
      const dir = normalizeDirection(r.call_direction);
      const out = normalizeOutcome(r.outcome);
      if (isCallDirection(dir)) b.calls++;
      if (out && out !== "No Answer / VM") b.connected++;
      b.collected += Number(r.collected_amount) || 0;
      b.commission += Number(r.commission) || 0;
    }
    return {
      activities: buckets.map(b => b.activities),
      collected: buckets.map(b => b.collected),
      avgPerCall: buckets.map(b => (b.calls ? b.collected / b.calls : 0)),
      commission: buckets.map(b => b.commission),
      collectionRate: buckets.map(b => (b.calls ? b.connected / b.calls : 0)),
    };
  }, [rows, selected.to]);

  // Per-collector 14-day daily $ collected (sparkline column).
  const dailyTrend = useMemo(() => {
    const days = eachDayOfInterval({ start: subDays(selected.to!, 13), end: selected.to! }).map(d => format(d, "yyyy-MM-dd"));
    const out: Record<string, number[]> = {};
    for (const m of TEAM_MEMBERS) {
      const a = agg[m];
      out[m] = days.map(d => a.dailyCollected[d] || 0);
    }
    return out;
  }, [agg, selected.to]);

  const maxTeamCollected = Math.max(1, ...TEAM_MEMBERS.map(m => agg[m].collected));

  const navItems = [
    ["perf", "Performance"],
    ["collectors", "Collectors"],
    ["intake", "Intake"],
    ["compare", "Comparison"],
    ["today", "Today"],
    ["outcome", "Outcomes"],
    ["aging", "Aging"],
    ["new-contacts", "New Contacts"],
    ["origin-count", "Origin #"],
    ["origin-dollars", "Origin $"],
    ["origin-calls", "All Calls"],
  ] as const;

  return (
    <DashboardLayout title="Collections Team — Monthly View">
      <div className="space-y-4">
        {/* Sticky header with section nav + month + print */}
        <div className="sticky top-14 z-20 -mx-6 mb-2 border-b bg-background/95 px-6 py-3 backdrop-blur print-hide">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-sm font-semibold text-foreground">Collections Team — Monthly View</h1>
              <p className="text-[11px] text-muted-foreground">{selected.label}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 gap-1 text-xs" onClick={() => window.print()}>
                <Printer className="h-3.5 w-3.5" /> Print / PDF
              </Button>
              <MonthFilter value={month} onChange={setMonth} options={opts} />
            </div>
          </div>
          <nav className="mt-2 flex flex-wrap gap-1 text-[11px]">
            {navItems.map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                className="rounded-md border bg-card px-2 py-0.5 text-muted-foreground hover:border-primary hover:text-primary"
              >
                {label}
              </a>
            ))}
          </nav>
        </div>

        {/* ===== KPI HERO STRIP ===== */}
        <CollapsibleSection id="perf" title="Full Team — MTD Performance">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <KpiHero label="Total Activities" value={teamKpi.activities.toLocaleString()} prev={teamKpi.prev.activities} curr={teamKpi.activities} series={weeklySeries.activities} />
            <KpiHero label="$ Collected" value={fmtMoney(teamKpi.collected)} prev={teamKpi.prev.collected} curr={teamKpi.collected} series={weeklySeries.collected} />
            <KpiHero label="Avg $ / Call" value={fmtMoney(teamKpi.avgPerCall)} prev={teamKpi.prev.avgPerCall} curr={teamKpi.avgPerCall} series={weeklySeries.avgPerCall} />
            <KpiHero label="Commission" value={fmtMoney(teamKpi.commission)} prev={teamKpi.prev.commission} curr={teamKpi.commission} series={weeklySeries.commission} />
            <KpiHero label="Collection Rate" value={fmtPct(teamKpi.collectionRate, 1)} prev={teamKpi.prev.collectionRate} curr={teamKpi.collectionRate} series={weeklySeries.collectionRate} />
          </div>
        </CollapsibleSection>

        {/* ===== COLLECTORS SCORECARD ===== */}
        <CollapsibleSection
          id="collectors"
          title="Collectors — MTD Scorecard"
          csv={{
            filename: `collectors-scorecard-${month}`,
            headers: ["Team Member", "Calls", "$ Collected", "Avg $/Call", "Avg Duration (min)", "Commission", "Coll. Rate", "$ Today", "Call/Day", "Connected/Day"],
            rows: COLLECTORS.map(n => {
              const a = agg[n]; const days = a.daysWorked.size || 1;
              return [n, a.calls, a.collected, a.calls ? a.collected / a.calls : 0, a.calls ? Math.round(a.minutes / a.calls) : 0, a.commission, (a.calls ? a.connected / a.calls : 0).toFixed(2), a.today_collected, (a.calls / days).toFixed(2), (a.connected / days).toFixed(2)];
            }),
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/50 text-muted-foreground">
                  {["Team Member", "Calls", "$ Collected", "Avg $/Call", "Avg Dur.", "Commission", "Coll. Rate", "$ Today", "Call/Day", "14-Day Trend"].map((h, i) => (
                    <th key={i} className="px-3 py-2 text-left font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COLLECTORS.map(name => {
                  const a = agg[name]; const days = a.daysWorked.size || 1;
                  return (
                    <tr key={name} className="border-b hover:bg-muted/30">
                      <td className="px-3 py-2 font-medium whitespace-nowrap">{name}</td>
                      <td className="px-3 py-2 font-mono tabular-nums">{a.calls.toLocaleString()}</td>
                      <td className="px-3 py-2"><BarCell value={a.collected} max={maxTeamCollected} format={fmtMoney} /></td>
                      <td className="px-3 py-2 font-mono tabular-nums">{fmtMoney(a.calls ? a.collected / a.calls : 0)}</td>
                      <td className="px-3 py-2 font-mono tabular-nums">{a.calls ? Math.round(a.minutes / a.calls) : 0} min</td>
                      <td className="px-3 py-2 font-mono tabular-nums">{fmtMoney(a.commission)}</td>
                      <td className="px-3 py-2"><PctBar value={a.calls ? a.connected / a.calls : 0} /></td>
                      <td className="px-3 py-2 font-mono tabular-nums">{fmtMoney(a.today_collected)}</td>
                      <td className="px-3 py-2 font-mono tabular-nums">{(a.calls / days).toFixed(2)}</td>
                      <td className="px-3 py-2"><Sparkline values={dailyTrend[name]} width={100} height={24} /></td>
                    </tr>
                  );
                })}
                <tr className="bg-muted/40 font-semibold">
                  <td className="px-3 py-2">COLLECTOR TOTAL</td>
                  <td className="px-3 py-2 font-mono tabular-nums">{COLLECTORS.reduce((s, n) => s + agg[n].calls, 0).toLocaleString()}</td>
                  <td className="px-3 py-2 font-mono tabular-nums">{fmtMoney(COLLECTORS.reduce((s, n) => s + agg[n].collected, 0))}</td>
                  <td colSpan={2}></td>
                  <td className="px-3 py-2 font-mono tabular-nums">{fmtMoney(COLLECTORS.reduce((s, n) => s + agg[n].commission, 0))}</td>
                  <td></td>
                  <td className="px-3 py-2 font-mono tabular-nums">{fmtMoney(COLLECTORS.reduce((s, n) => s + agg[n].today_collected, 0))}</td>
                  <td colSpan={2}></td>
                </tr>
              </tbody>
            </table>
          </div>
        </CollapsibleSection>

        {/* ===== INTAKE SCORECARD ===== */}
        <CollapsibleSection
          id="intake"
          title="Intake Team — MTD Scorecard"
          csv={{
            filename: `intake-scorecard-${month}`,
            headers: ["Team Member", "Calls", "Outbound", "Inbound", "Admin", "Connected", "Escalated", "Avg Dur.", "Call/Day", "Connected/Day", "Commission", "$ Collected"],
            rows: INTAKE.map(n => {
              const a = agg[n]; const days = a.daysWorked.size || 1;
              return [n, a.calls, a.outbound, a.inbound, a.admin, a.connected, a.escalated, a.calls ? Math.round(a.minutes / a.calls) : 0, (a.calls / days).toFixed(2), (a.connected / days).toFixed(2), a.commission, a.collected];
            }),
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/50 text-muted-foreground">
                  {["Team Member", "Calls", "Outbound", "Inbound", "Admin", "Connected", "Escalated", "Avg Dur.", "Call/Day", "Connected/Day", "Commission", "$ Collected"].map((h, i) => (
                    <th key={i} className="px-3 py-2 text-left font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {INTAKE.map(name => {
                  const a = agg[name]; const days = a.daysWorked.size || 1;
                  return (
                    <tr key={name} className="border-b hover:bg-muted/30">
                      <td className="px-3 py-2 font-medium">{name}</td>
                      <td className="px-3 py-2 font-mono tabular-nums">{a.calls.toLocaleString()}</td>
                      <td className="px-3 py-2 font-mono tabular-nums">{a.outbound.toLocaleString()}</td>
                      <td className="px-3 py-2 font-mono tabular-nums">{a.inbound.toLocaleString()}</td>
                      <td className="px-3 py-2 font-mono tabular-nums">{a.admin.toLocaleString()}</td>
                      <td className="px-3 py-2 font-mono tabular-nums">{a.connected.toLocaleString()}</td>
                      <td className="px-3 py-2 font-mono tabular-nums">{a.escalated.toLocaleString()}</td>
                      <td className="px-3 py-2 font-mono tabular-nums">{a.calls ? Math.round(a.minutes / a.calls) : 0} min</td>
                      <td className="px-3 py-2 font-mono tabular-nums">{(a.calls / days).toFixed(2)}</td>
                      <td className="px-3 py-2 font-mono tabular-nums">{(a.connected / days).toFixed(2)}</td>
                      <td className="px-3 py-2 font-mono tabular-nums">{fmtMoney(a.commission)}</td>
                      <td className="px-3 py-2"><BarCell value={a.collected} max={maxTeamCollected} format={fmtMoney} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CollapsibleSection>

        {/* ===== TEAM COMPARISON ===== */}
        <CollapsibleSection
          id="compare"
          title="Team Comparison — MTD"
          subtitle="Normalized view across all team members"
          csv={{
            filename: `team-comparison-${month}`,
            headers: ["Team Member", "Role", "Activities", "Outbound", "Inbound", "Connected", "Contact Rate", "Avg Dur.", "$ Collected"],
            rows: TEAM_MEMBERS.map(n => { const a = agg[n]; return [n, TEAM_ROLES[n], a.activities, a.outbound, a.inbound, a.connected, (a.calls ? a.connected / a.calls : 0).toFixed(2), a.calls ? Math.round(a.minutes / a.calls) : 0, a.collected]; }),
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/50 text-muted-foreground">
                  {["Team Member", "Role", "Activities", "Outbound", "Inbound", "Connected", "Contact Rate", "Avg Dur.", "$ Collected"].map((h, i) => (
                    <th key={i} className="px-3 py-2 text-left font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TEAM_MEMBERS.map(name => {
                  const a = agg[name];
                  return (
                    <tr key={name} className="border-b hover:bg-muted/30">
                      <td className="px-3 py-2 font-medium">{name}</td>
                      <td className="px-3 py-2">{TEAM_ROLES[name]}</td>
                      <td className="px-3 py-2 font-mono tabular-nums">{a.activities.toLocaleString()}</td>
                      <td className="px-3 py-2 font-mono tabular-nums">{a.outbound.toLocaleString()}</td>
                      <td className="px-3 py-2 font-mono tabular-nums">{a.inbound.toLocaleString()}</td>
                      <td className="px-3 py-2 font-mono tabular-nums">{a.connected.toLocaleString()}</td>
                      <td className="px-3 py-2"><PctBar value={a.calls ? a.connected / a.calls : 0} /></td>
                      <td className="px-3 py-2 font-mono tabular-nums">{a.calls ? Math.round(a.minutes / a.calls) : 0} min</td>
                      <td className="px-3 py-2"><BarCell value={a.collected} max={maxTeamCollected} format={fmtMoney} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CollapsibleSection>

        {/* ===== TODAY ===== */}
        <CollapsibleSection id="today" title={`Today's Activity — ${format(new Date(), "EEEE, MMM d")}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/50 text-muted-foreground">
                  {["Team Member", "Role", "Activities", "$ Collected", "Inbound", "Outbound", "Total Calls", "Top Outcome"].map((h, i) => (
                    <th key={i} className="px-3 py-2 text-left font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TEAM_MEMBERS.map(name => {
                  const a = agg[name];
                  const totalCalls = a.todayInbound + a.todayOutbound;
                  const top = Object.entries(a.todayOutcomes).sort((x, y) => y[1] - x[1])[0]?.[0] || "—";
                  return (
                    <tr key={name} className="border-b hover:bg-muted/30">
                      <td className="px-3 py-2 font-medium">{name}</td>
                      <td className="px-3 py-2">{TEAM_ROLES[name]}</td>
                      <td className="px-3 py-2 font-mono tabular-nums">{a.todayActivities}</td>
                      <td className="px-3 py-2 font-mono tabular-nums">{fmtMoney(a.today_collected)}</td>
                      <td className="px-3 py-2 font-mono tabular-nums">{a.todayInbound}</td>
                      <td className="px-3 py-2 font-mono tabular-nums">{a.todayOutbound}</td>
                      <td className="px-3 py-2 font-mono tabular-nums">{totalCalls}</td>
                      <td className="px-3 py-2">{top}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CollapsibleSection>

        {/* ===== OUTCOME DISTRIBUTION (HEATMAP) ===== */}
        <CollapsibleSection
          id="outcome"
          title="Outcome Distribution — MTD"
          subtitle="All team — heat-shaded by call count"
          csv={{
            filename: `outcomes-${month}`,
            headers: ["Team Member", "Role", ...OUTCOME_BUCKETS],
            rows: TEAM_MEMBERS.map(n => { const a = agg[n]; return [n, TEAM_ROLES[n], ...OUTCOME_BUCKETS.map(b => a.outcomes[b] || 0)]; }),
          }}
        >
          <HeatMatrix
            rowHeaders={[["Team Member", w => w], ["Role", n => TEAM_ROLES[n]]]}
            colHeaders={OUTCOME_BUCKETS as unknown as string[]}
            members={TEAM_MEMBERS}
            value={(n, b) => agg[n].outcomes[b] || 0}
            format={v => v.toLocaleString()}
          />
        </CollapsibleSection>

        {/* ===== AGING ===== */}
        <CollapsibleSection
          id="aging"
          title="Aging Breakdown — MTD"
          subtitle="Collected $ by delinquency bucket (collectors only)"
          csv={{
            filename: `aging-${month}`,
            headers: ["Team Member", ...AGING_BUCKETS, "Total"],
            rows: COLLECTORS.map(n => { const a = agg[n]; const total = AGING_BUCKETS.reduce((s, b) => s + (a.aging[b] || 0), 0); return [n, ...AGING_BUCKETS.map(b => a.aging[b] || 0), total]; }),
          }}
        >
          <HeatMatrix
            rowHeaders={[["Team Member", w => w]]}
            colHeaders={AGING_BUCKETS as unknown as string[]}
            members={COLLECTORS}
            value={(n, b) => agg[n].aging[b] || 0}
            format={v => fmtMoney(v)}
            rowTotal
          />
        </CollapsibleSection>

        {/* ===== NEW CLIENT CONTACTS ===== */}
        <CollapsibleSection
          id="new-contacts"
          title={`New Client Contacts — ${selected.label}`}
          subtitle="Outbound calls to clients NOT contacted by that team member in the prior 30 days"
          csv={{
            filename: `new-contacts-${month}`,
            headers: ["Team Member", "Role", ...DAYS, "Total Unique"],
            rows: TEAM_MEMBERS.map(n => { const r = newContacts[n]; return [n, TEAM_ROLES[n], ...r, r.reduce((s, x) => s + x, 0)]; }),
          }}
        >
          <HeatMatrix
            rowHeaders={[["Team Member", w => w], ["Role", n => TEAM_ROLES[n]]]}
            colHeaders={DAYS}
            members={TEAM_MEMBERS}
            value={(n, _b, i) => newContacts[n][i!]}
            format={v => v.toLocaleString()}
            rowTotal
            extraColumn={{
              header: "7-Day Trend",
              render: n => <Sparkline values={newContacts[n]} width={90} height={22} />,
            }}
          />
        </CollapsibleSection>

        <OriginMatrixSection id="origin-count" title={`Collection Origin Breakdown — ${selected.label}`} subtitle="Count of collected payments by origin" agg={agg} field="originCount" format={v => v.toLocaleString()} totalLabel="TOTAL" month={month} />
        <OriginMatrixSection id="origin-dollars" title={`Collection $ by Origin — ${selected.label}`} subtitle="Dollar amounts collected by origin" agg={agg} field="originDollars" format={v => fmtMoney(v)} totalLabel="TOTAL $" month={month} />
        <OriginMatrixSection id="origin-calls" title={`All Calls by Origin — ${selected.label}`} subtitle="Count of all inbound+outbound calls by origin" agg={agg} field="allCallsByOrigin" format={v => v.toLocaleString()} totalLabel="TOTAL CALLS" month={month} />

        {isLoading && <p className="text-xs text-muted-foreground">Loading activity…</p>}
      </div>
    </DashboardLayout>
  );
};

// ---- KPI hero card ----
const KpiHero = ({ label, value, prev, curr, series }: { label: string; value: string; prev: number; curr: number; series: number[] }) => (
  <div className="rounded-md border bg-card p-3 shadow-sm">
    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
    <div className="mt-1 flex items-end justify-between gap-2">
      <p className="text-xl font-bold text-foreground leading-none">{value}</p>
      <Sparkline values={series} width={64} height={20} />
    </div>
    <div className="mt-1 flex items-center justify-between">
      <Delta prev={prev} curr={curr} />
      <span className="text-[9px] text-muted-foreground uppercase">vs last month</span>
    </div>
  </div>
);

// ---- Heatmap matrix table ----
type RowMeta = [label: string, get: (m: string) => string];
function HeatMatrix({
  rowHeaders,
  colHeaders,
  members,
  value,
  format: fmt,
  rowTotal,
  extraColumn,
}: {
  rowHeaders: RowMeta[];
  colHeaders: string[];
  members: string[];
  value: (member: string, bucket: string, index?: number) => number;
  format: (v: number) => string;
  rowTotal?: boolean;
  extraColumn?: { header: string; render: (member: string) => React.ReactNode };
}) {
  // Compute max across all data cells for shading.
  const max = Math.max(1, ...members.flatMap(m => colHeaders.map((c, i) => value(m, c, i))));
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-separate border-spacing-0">
        <thead>
          <tr className="bg-muted/50 text-muted-foreground">
            {rowHeaders.map(([h], i) => (
              <th key={`rh-${i}`} className="border-b px-3 py-2 text-left font-medium whitespace-nowrap">{h}</th>
            ))}
            {colHeaders.map(c => (
              <th key={c} className="border-b px-3 py-2 text-left font-medium whitespace-nowrap">{c}</th>
            ))}
            {rowTotal && <th className="border-b px-3 py-2 text-left font-medium">Total</th>}
            {extraColumn && <th className="border-b px-3 py-2 text-left font-medium">{extraColumn.header}</th>}
          </tr>
        </thead>
        <tbody>
          {members.map(m => {
            const cells = colHeaders.map((c, i) => value(m, c, i));
            const total = cells.reduce((s, n) => s + n, 0);
            return (
              <tr key={m} className="border-b hover:bg-muted/30">
                {rowHeaders.map(([, get], i) => (
                  <td key={`rc-${i}`} className="px-3 py-2 font-medium whitespace-nowrap border-b">{i === 0 ? m : get(m)}</td>
                ))}
                {cells.map((v, i) => (
                  <HeatCell key={i} value={v} max={max}>{fmt(v)}</HeatCell>
                ))}
                {rowTotal && <td className="px-3 py-2 font-mono tabular-nums whitespace-nowrap border-b">{fmt(total)}</td>}
                {extraColumn && <td className="px-3 py-2 border-b">{extraColumn.render(m)}</td>}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ---- Origin Matrix Section (with heatmap + totals + %) ----
function OriginMatrixSection({
  id, title, subtitle, agg, field, format: fmt, totalLabel, month,
}: {
  id: string;
  title: string;
  subtitle: string;
  agg: Record<string, Agg>;
  field: "originCount" | "originDollars" | "allCallsByOrigin";
  format: (v: number) => string;
  totalLabel: string;
  month: string;
}) {
  const memberRows = TEAM_MEMBERS.map(name => {
    const a = agg[name];
    const row = ORIGIN_BUCKETS.map(b => a[field][b] || 0);
    return { name, role: TEAM_ROLES[name], row, total: row.reduce((s, n) => s + n, 0) };
  });
  const grand = memberRows.reduce((s, r) => s + r.total, 0);
  const columnTotals = ORIGIN_BUCKETS.map((_, i) => memberRows.reduce((s, r) => s + r.row[i], 0));
  const max = Math.max(1, ...memberRows.flatMap(r => r.row));

  const csv = {
    filename: `${id}-${month}`,
    headers: ["Team Member", "Role", ...ORIGIN_BUCKETS, totalLabel, "% of Total"] as string[],
    rows: memberRows.map(r => [r.name, r.role, ...r.row, r.total, grand ? `${Math.round((r.total / grand) * 100)}%` : "0%"]),
  };

  return (
    <CollapsibleSection id={id} title={title} subtitle={subtitle} csv={csv}>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-separate border-spacing-0">
          <thead>
            <tr className="bg-muted/50 text-muted-foreground">
              {["Team Member", "Role", ...ORIGIN_BUCKETS, totalLabel, "% of Total"].map((h, i) => (
                <th key={i} className="border-b px-3 py-2 text-left font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {memberRows.map(r => (
              <tr key={r.name} className="hover:bg-muted/30">
                <td className="border-b px-3 py-2 font-medium whitespace-nowrap">{r.name}</td>
                <td className="border-b px-3 py-2 whitespace-nowrap">{r.role}</td>
                {r.row.map((v, i) => <HeatCell key={i} value={v} max={max}>{fmt(v)}</HeatCell>)}
                <td className="border-b px-3 py-2 font-mono tabular-nums whitespace-nowrap">{fmt(r.total)}</td>
                <td className="border-b px-3 py-2 font-mono tabular-nums whitespace-nowrap">{grand ? `${Math.round((r.total / grand) * 100)}%` : "0%"}</td>
              </tr>
            ))}
            <tr className="bg-muted/40 font-semibold">
              <td className="border-b px-3 py-2">TEAM TOTAL</td>
              <td className="border-b px-3 py-2">—</td>
              {columnTotals.map((v, i) => <td key={i} className="border-b px-3 py-2 font-mono tabular-nums whitespace-nowrap">{fmt(v)}</td>)}
              <td className="border-b px-3 py-2 font-mono tabular-nums whitespace-nowrap">{fmt(grand)}</td>
              <td className="border-b px-3 py-2">100%</td>
            </tr>
            <tr className="bg-success/10 font-semibold text-success-foreground">
              <td className="px-3 py-2 text-success">% BY ORIGIN</td>
              <td className="px-3 py-2 text-success">—</td>
              {columnTotals.map((v, i) => <td key={i} className="px-3 py-2 font-mono tabular-nums whitespace-nowrap text-success">{grand ? `${Math.round((v / grand) * 100)}%` : "0%"}</td>)}
              <td className="px-3 py-2 text-success">100%</td>
              <td className="px-3 py-2 text-success">—</td>
            </tr>
          </tbody>
        </table>
      </div>
    </CollapsibleSection>
  );
}

export default CollectionsDashboard;