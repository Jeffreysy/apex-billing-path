import DashboardLayout from "@/components/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { format, subDays, startOfMonth, endOfMonth, addMonths } from "date-fns";
import { fetchAllRows } from "@/hooks/useSupabaseData";
import MonthFilter, { type MonthOption } from "@/components/MonthFilter";
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
    out.push({
      label: format(d, "MMMM yyyy"),
      value: format(d, "yyyy-MM"),
      from: startOfMonth(d),
      to: endOfMonth(d),
    });
  }
  return out;
}

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
function dayIndex(iso: string): number {
  const d = new Date(iso + "T00:00:00");
  const js = d.getDay();
  return (js + 6) % 7;
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
  };
}

const CollectionsDashboard = () => {
  const opts = useMemo(() => monthOptions(), []);
  const [month, setMonth] = useState(() => format(new Date(), "yyyy-MM"));
  const selected = opts.find(o => o.value === month) ?? opts[0];

  const windowStart = format(subDays(selected.from!, 31), "yyyy-MM-dd");
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
  const priorWindow = useMemo(
    () => rows.filter(r => r.activity_date < monthStart && r.collector && TEAM_ROLES[r.collector]),
    [rows, monthStart],
  );

  const agg = useMemo(() => {
    const map: Record<string, Agg> = {};
    for (const m of TEAM_MEMBERS) map[m] = emptyAgg();
    for (const r of inMonth) {
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
      if (isCallDirection(dir)) {
        a.calls++;
        if (dir === "outbound") a.outbound++;
        else a.inbound++;
      } else if (dir === "admin") {
        a.admin++;
      }
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
  }, [inMonth, today]);

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
      const idx = dayIndex(r.activity_date);
      grid[r.collector][idx] += 1;
      sset.add(r.client_id);
      seen.set(r.collector, sset);
    }
    return grid;
  }, [inMonth, priorWindow]);

  const teamKpi = useMemo(() => {
    const a = Object.values(agg);
    const activities = a.reduce((s, x) => s + x.activities, 0);
    const calls = a.reduce((s, x) => s + x.calls, 0);
    const collected = a.reduce((s, x) => s + x.collected, 0);
    const commission = a.reduce((s, x) => s + x.commission, 0);
    const connected = a.reduce((s, x) => s + x.connected, 0);
    return {
      activities,
      collected,
      avgPerCall: calls ? collected / calls : 0,
      commission,
      collectionRate: calls ? connected / calls : 0,
    };
  }, [agg]);

  return (
    <DashboardLayout title="Collections Team — Monthly View">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-foreground">Collections Team — Monthly View</h1>
            <p className="text-xs text-muted-foreground">{selected.label}</p>
          </div>
          <MonthFilter value={month} onChange={setMonth} options={opts} />
        </div>

        <Section title="Full Team — MTD Performance">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Kpi label="Total Activities" value={teamKpi.activities.toLocaleString()} />
            <Kpi label="$ Collected" value={fmtMoney(teamKpi.collected)} />
            <Kpi label="Avg $ / Call" value={fmtMoney(teamKpi.avgPerCall)} />
            <Kpi label="Commission Earned" value={fmtMoney(teamKpi.commission)} />
            <Kpi label="Collection Rate" value={fmtPct(teamKpi.collectionRate, 1)} />
          </div>
        </Section>

        <Section title="Collectors — MTD Scorecard">
          <ScorecardTable
            headers={["Team Member", "Calls", "$ Collected", "Avg $ / Call", "Avg Duration", "Commission", "Coll. Rate", "$ Today", "Call/Day", "Connected/Day"]}
            rows={COLLECTORS.map(name => {
              const a = agg[name];
              const days = a.daysWorked.size || 1;
              return [
                name,
                a.calls.toLocaleString(),
                fmtMoney(a.collected),
                fmtMoney(a.calls ? a.collected / a.calls : 0),
                `${a.calls ? Math.round(a.minutes / a.calls) : 0} min`,
                fmtMoney(a.commission),
                fmtPct(a.calls ? a.connected / a.calls : 0),
                fmtMoney(a.today_collected),
                (a.calls / days).toFixed(2),
                (a.connected / days).toFixed(2),
              ];
            })}
            totalRow={(() => {
              const a = COLLECTORS.map(n => agg[n]);
              const calls = a.reduce((s, x) => s + x.calls, 0);
              const coll = a.reduce((s, x) => s + x.collected, 0);
              const comm = a.reduce((s, x) => s + x.commission, 0);
              const todayTot = a.reduce((s, x) => s + x.today_collected, 0);
              return ["COLLECTOR TOTAL", calls.toLocaleString(), fmtMoney(coll), "", "", fmtMoney(comm), "", fmtMoney(todayTot), "", ""];
            })()}
          />
        </Section>

        <Section title="Intake Team — MTD Scorecard">
          <ScorecardTable
            headers={["Team Member", "Calls", "Outbound", "Inbound", "Admin", "Connected", "Escalated", "Avg Duration", "Call/Day", "Connected/Day", "Commission", "$ Collected"]}
            rows={INTAKE.map(name => {
              const a = agg[name];
              const days = a.daysWorked.size || 1;
              return [
                name,
                a.calls.toLocaleString(),
                a.outbound.toLocaleString(),
                a.inbound.toLocaleString(),
                a.admin.toLocaleString(),
                a.connected.toLocaleString(),
                a.escalated.toLocaleString(),
                `${a.calls ? Math.round(a.minutes / a.calls) : 0} min`,
                (a.calls / days).toFixed(2),
                (a.connected / days).toFixed(2),
                fmtMoney(a.commission),
                fmtMoney(a.collected),
              ];
            })}
          />
        </Section>

        <Section title="Team Comparison — MTD" subtitle="Normalized view — call volume, contact rate & avg duration across all team members">
          <ScorecardTable
            headers={["Team Member", "Role", "Activities", "Outbound", "Inbound", "Connected", "Contact Rate", "Avg Duration", "$ Collected"]}
            rows={TEAM_MEMBERS.map(name => {
              const a = agg[name];
              return [
                name,
                TEAM_ROLES[name],
                a.activities.toLocaleString(),
                a.outbound.toLocaleString(),
                a.inbound.toLocaleString(),
                a.connected.toLocaleString(),
                fmtPct(a.calls ? a.connected / a.calls : 0),
                `${a.calls ? Math.round(a.minutes / a.calls) : 0} min`,
                fmtMoney(a.collected),
              ];
            })}
          />
        </Section>

        <Section title={`Today's Activity — ${format(new Date(), "EEEE, MMM d")}`}>
          <ScorecardTable
            headers={["Team Member", "Role", "Activities", "$ Collected", "Inbound", "Outbound", "Total Calls", "Top Outcome"]}
            rows={TEAM_MEMBERS.map(name => {
              const a = agg[name];
              const totalCalls = a.todayInbound + a.todayOutbound;
              const top = Object.entries(a.todayOutcomes).sort((x, y) => y[1] - x[1])[0]?.[0] || "—";
              return [
                name,
                TEAM_ROLES[name],
                a.todayActivities.toLocaleString(),
                fmtMoney(a.today_collected),
                a.todayInbound.toLocaleString(),
                a.todayOutbound.toLocaleString(),
                totalCalls.toLocaleString(),
                top,
              ];
            })}
          />
        </Section>

        <Section title="Outcome Distribution — MTD (All Team)">
          <ScorecardTable
            headers={["Team Member", "Role", ...OUTCOME_BUCKETS]}
            rows={TEAM_MEMBERS.map(name => {
              const a = agg[name];
              return [name, TEAM_ROLES[name], ...OUTCOME_BUCKETS.map(b => (a.outcomes[b] || 0).toLocaleString())];
            })}
          />
        </Section>

        <Section title="Aging Breakdown — MTD" subtitle="Based off delinquent dollar collections — Collectors only">
          <ScorecardTable
            headers={["Team Member", ...AGING_BUCKETS, "Total $"]}
            rows={COLLECTORS.map(name => {
              const a = agg[name];
              const total = AGING_BUCKETS.reduce((s, b) => s + (a.aging[b] || 0), 0);
              return [name, ...AGING_BUCKETS.map(b => fmtMoney(a.aging[b] || 0)), fmtMoney(total)];
            })}
          />
        </Section>

        <Section title={`New Client Contacts — ${selected.label}`} subtitle="Outbound calls to clients NOT contacted by that team member in the prior 30 days">
          <ScorecardTable
            headers={["Team Member", "Role", ...DAYS, "Total Unique"]}
            rows={TEAM_MEMBERS.map(name => {
              const row = newContacts[name];
              const total = row.reduce((s, n) => s + n, 0);
              return [name, TEAM_ROLES[name], ...row.map(n => n.toLocaleString()), total.toLocaleString()];
            })}
            totalRow={(() => {
              const totals = [0, 0, 0, 0, 0, 0, 0];
              for (const m of TEAM_MEMBERS) newContacts[m].forEach((n, i) => totals[i] += n);
              const grand = totals.reduce((s, n) => s + n, 0);
              return ["TEAM TOTAL", "", ...totals.map(n => n.toLocaleString()), grand.toLocaleString()];
            })()}
          />
        </Section>

        <OriginMatrix title={`Collection Origin Breakdown — ${selected.label}`} subtitle="Count of collected payments grouped by ORIGIN" agg={agg} field="originCount" format={v => v.toLocaleString()} totalLabel="TOTAL" />
        <OriginMatrix title={`Collection $ by Origin — ${selected.label}`} subtitle="Dollar amounts collected grouped by ORIGIN" agg={agg} field="originDollars" format={v => fmtMoney(v)} totalLabel="TOTAL $" />
        <OriginMatrix title={`All Calls by Origin — ${selected.label}`} subtitle="Count of ALL calls (Inbound + Outbound) grouped by ORIGIN" agg={agg} field="allCallsByOrigin" format={v => v.toLocaleString()} totalLabel="TOTAL CALLS" />

        {isLoading && <p className="text-xs text-muted-foreground">Loading activity…</p>}
      </div>
    </DashboardLayout>
  );
};

const Section = ({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) => (
  <section className="rounded-lg border bg-card">
    <header className="border-b px-4 py-2.5">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-foreground">▶ {title}</h2>
      {subtitle && <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>}
    </header>
    <div className="p-4">{children}</div>
  </section>
);

const Kpi = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-md border bg-background p-3">
    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
    <p className="mt-1 text-lg font-bold text-foreground">{value}</p>
  </div>
);

const ScorecardTable = ({
  headers,
  rows,
  totalRow,
}: {
  headers: string[];
  rows: (string | number)[][];
  totalRow?: (string | number)[];
}) => (
  <div className="overflow-x-auto">
    <table className="w-full text-xs">
      <thead>
        <tr className="border-b bg-muted/50 text-muted-foreground">
          {headers.map((h, i) => (
            <th key={i} className="px-3 py-2 text-left font-medium whitespace-nowrap">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-b hover:bg-muted/30">
            {r.map((c, j) => (
              <td key={j} className={`px-3 py-2 whitespace-nowrap ${j === 0 ? "font-medium" : "font-mono"}`}>{c}</td>
            ))}
          </tr>
        ))}
        {totalRow && (
          <tr className="border-t bg-muted/40 font-semibold">
            {totalRow.map((c, j) => (
              <td key={j} className="px-3 py-2 whitespace-nowrap">{c}</td>
            ))}
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

function OriginMatrix({
  title,
  subtitle,
  agg,
  field,
  format: fmt,
  totalLabel,
}: {
  title: string;
  subtitle: string;
  agg: Record<string, Agg>;
  field: "originCount" | "originDollars" | "allCallsByOrigin";
  format: (v: number) => string;
  totalLabel: string;
}) {
  const headers = ["Team Member", "Role", ...ORIGIN_BUCKETS, totalLabel, "% of Total"];
  const memberRows = TEAM_MEMBERS.map(name => {
    const a = agg[name];
    const row = ORIGIN_BUCKETS.map(b => a[field][b] || 0);
    return { name, role: TEAM_ROLES[name], row, total: row.reduce((s, n) => s + n, 0) };
  });
  const grand = memberRows.reduce((s, r) => s + r.total, 0);
  const columnTotals = ORIGIN_BUCKETS.map((_, i) => memberRows.reduce((s, r) => s + r.row[i], 0));
  const grandTotal = columnTotals.reduce((s, n) => s + n, 0) || 1;

  return (
    <Section title={title} subtitle={subtitle}>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b bg-muted/50 text-muted-foreground">
              {headers.map((h, i) => (
                <th key={i} className="px-3 py-2 text-left font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {memberRows.map(r => (
              <tr key={r.name} className="border-b hover:bg-muted/30">
                <td className="px-3 py-2 font-medium whitespace-nowrap">{r.name}</td>
                <td className="px-3 py-2 whitespace-nowrap">{r.role}</td>
                {r.row.map((v, i) => (
                  <td key={i} className="px-3 py-2 font-mono whitespace-nowrap">{fmt(v)}</td>
                ))}
                <td className="px-3 py-2 font-mono whitespace-nowrap">{fmt(r.total)}</td>
                <td className="px-3 py-2 font-mono whitespace-nowrap">{grand ? `${Math.round((r.total / grand) * 100)}%` : "0%"}</td>
              </tr>
            ))}
            <tr className="border-t bg-muted/40 font-semibold">
              <td className="px-3 py-2">TEAM TOTAL</td>
              <td className="px-3 py-2">—</td>
              {columnTotals.map((v, i) => (
                <td key={i} className="px-3 py-2 font-mono whitespace-nowrap">{fmt(v)}</td>
              ))}
              <td className="px-3 py-2 font-mono whitespace-nowrap">{fmt(grand)}</td>
              <td className="px-3 py-2">100%</td>
            </tr>
            <tr className="border-b bg-success/10 font-semibold text-success">
              <td className="px-3 py-2">% BY ORIGIN</td>
              <td className="px-3 py-2">—</td>
              {columnTotals.map((v, i) => (
                <td key={i} className="px-3 py-2 font-mono whitespace-nowrap">{Math.round((v / grandTotal) * 100)}%</td>
              ))}
              <td className="px-3 py-2">100%</td>
              <td className="px-3 py-2">—</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Section>
  );
}

export default CollectionsDashboard;