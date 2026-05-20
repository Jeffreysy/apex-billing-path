import DashboardLayout from "@/components/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { format, parse, subDays, startOfMonth, endOfMonth, addMonths } from "date-fns";
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

function todayISO() {
  return format(new Date(), "yyyy-MM-dd");
}

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
function dayIndex(iso: string): number {
  // Monday=0 .. Sunday=6
  const d = new Date(iso + "T00:00:00");
  const js = d.getDay(); // Sun=0..Sat=6
  return (js + 6) % 7;
}

const CollectionsDashboard = () => {
  const opts = useMemo(() => monthOptions(), []);
  const [month, setMonth] = useState(() => format(new Date(), "yyyy-MM"));
  const selected = opts.find(o => o.value === month) ?? opts[0];

  // Fetch the selected month + a 30-day lookback window for "new contacts".
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

  // Activities scoped to the selected month, for known team members.
  const inMonth = useMemo(
    () => rows.filter(r => r.activity_date >= monthStart && r.activity_date <= monthEnd && r.collector && TEAM_ROLES[r.collector]),
    [rows, monthStart, monthEnd],
  );
  const priorWindow = useMemo(
    () => rows.filter(r => r.activity_date < monthStart && r.collector && TEAM_ROLES[r.collector]),
    [rows, monthStart],
  );

  // ===== Per-member aggregates =====
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
  const empty = (): Agg => ({
    calls: 0, outbound: 0, inbound: 0, admin: 0, connected: 0, escalated: 0,
    activities: 0, collected: 0, commission: 0, minutes: 0, today_collected: 0,
    daysWorked: new Set(),
    outcomes: Object.fromEntries(OUTCOME_BUCKETS.map(b => [b, 0])),
    aging: Object.fromEntries(AGING_BUCKETS.map(b => [b, 0])),
    originCount: Object.fromEntries(ORIGIN_BUCKETS.map(b => [b, 0])),
    originDollars: Object.fromEntries(ORIGIN_BUCKETS.map(b => [b, 0])),
    allCallsByOrigin: Object.fromEntries(ORIGIN_BUCKETS.map(b => [b, 0])),
    todayActivities: 0, todayInbound: 0, todayOutbound: 0, todayOutcomes: {},
  });

  const today = todayISO();

  const agg = useMemo(() => {
    const map: Record<string, Agg> = {};
    for (const m of TEAM_MEMBERS) map[m] = empty();
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
      a.allCallsByOrigin[origin] = (a.allCallsByOrigin[origin] || 0) + (isCallDirection(dir) ? 1 : 0);
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

  // ===== New Client Contacts (per team member, day-of-week) =====
  const newContacts = useMemo(() => {
    // For each outbound activity in month, was that client_id contacted by the same collector in the prior 30 days?
    const priorByCollectorClient = new Map<string, string[]>(); // key = collector|client -> list of ISO dates
    for (const r of priorWindow) {
      if (!r.client_id) continue;
      if (normalizeDirection(r.call_direction) !== "outbound") continue;
      const key = `${r.collector}|${r.client_id}`;
      const arr = priorByCollectorClient.get(key) || [];
      arr.push(r.activity_date);
      priorByCollectorClient.set(key, arr);
    }
    const seenInMonth = new Map<string, Set<string>>(); // collector -> set of client ids already counted this month
    const grid: Record<string, number[]> = {};
    for (const m of TEAM_MEMBERS) grid[m] = [0, 0, 0, 0, 0, 0, 0];
    for (const r of inMonth) {
      if (!r.client_id || !r.collector) continue;
      if (normalizeDirection(r.call_direction) !== "outbound") continue;
      const collectorSeen = seenInMonth.get(r.collector) || new Set<string>();
      if (collectorSeen.has(r.client_id)) continue;
      const cutoff = format(subDays(new Date(r.activity_date + "T00:00:00"), 30), "yyyy-MM-dd");
      const priors = priorByCollectorClient.get(`${r.collector}|${r.client_id}`) || [];
      const recent = priors.some(d => d >= cutoff && d < r.activity_date);
      if (recent) continue;
      const idx = dayIndex(r.activity_date);
      grid[r.collector][idx] = (grid[r.collector][idx] || 0) + 1;
      collectorSeen.add(r.client_id);
      seenInMonth.set(r.collector, collectorSeen);
    }
    return grid;
  }, [inMonth, priorWindow]);

  // ===== Header KPIs =====
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-foreground">Collections Team — Monthly View</h1>
            <p className="text-xs text-muted-foreground">{selected.label}</p>
          </div>
          <MonthFilter value={month} onChange={setMonth} options={opts} />
        </div>

        {/* FULL TEAM MTD KPI cards */}
        <Section title="Full Team — MTD Performance">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Kpi label="Total Activities" value={teamKpi.activities.toLocaleString()} />
            <Kpi label="$ Collected" value={fmtMoney(teamKpi.collected)} />
            <Kpi label="Avg $ / Call" value={fmtMoney(teamKpi.avgPerCall)} />
            <Kpi label="Commission Earned" value={fmtMoney(teamKpi.commission)} />
            <Kpi label="Collection Rate" value={fmtPct(teamKpi.collectionRate, 1)} />
          </div>
        </Section>

        {/* Collectors Scorecard */}
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
              const today = a.reduce((s, x) => s + x.today_collected, 0);
              return ["COLLECTOR TOTAL", calls.toLocaleString(), fmtMoney(coll), "", "", fmtMoney(comm), "", fmtMoney(today), "", ""];
            })()}
          />
        </Section>

        {/* Intake Scorecard */}
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

        {/* Team Comparison */}
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

        {/* Today's Activity */}
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

        {/* Outcome Distribution */}
        <Section title="Outcome Distribution — MTD (All Team)">
          <ScorecardTable
            headers={["Team Member", "Role", ...OUTCOME_BUCKETS]}
            rows={TEAM_MEMBERS.map(name => {
              const a = agg[name];
              return [name, TEAM_ROLES[name], ...OUTCOME_BUCKETS.map(b => (a.outcomes[b] || 0).toLocaleString())];
            })}
          />
        </Section>

        {/* Aging Breakdown */}
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

        {/* New Client Contacts grid */}
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

        {/* Origin: count of collected payments */}
        <OriginMatrix
          title={`Collection Origin Breakdown — ${selected.label}`}
          subtitle="Count of collected payments grouped by ORIGIN"
          field="originCount"
          agg={agg}
          format={v => v.toLocaleString()}
          totalLabel="TOTAL"
        />

        {/* Origin: dollars */}
        <OriginMatrix
          title={`Collection $ by Origin — ${selected.label}`}
          subtitle="Dollar amounts collected grouped by ORIGIN"
          field="originDollars"
          agg={agg}
          format={v => fmtMoney(v)}
          totalLabel="TOTAL $"
        />

        {/* Origin: all calls */}
        <OriginMatrix
          title={`All Calls by Origin — ${selected.label}`}
          subtitle="Count of ALL calls (Inbound + Outbound) grouped by ORIGIN"
          field="allCallsByOrigin"
          agg={agg}
          format={v => v.toLocaleString()}
          totalLabel="TOTAL CALLS"
        />

        {isLoading && <p className="text-xs text-muted-foreground">Loading activity…</p>}
      </div>
    </DashboardLayout>
  );
};

// ============================================================
// Reusable presentational pieces
// ============================================================

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
  format,
  totalLabel,
}: {
  title: string;
  subtitle: string;
  agg: Record<string, any>;
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
                  <td key={i} className="px-3 py-2 font-mono whitespace-nowrap">{format(v)}</td>
                ))}
                <td className="px-3 py-2 font-mono whitespace-nowrap">{format(r.total)}</td>
                <td className="px-3 py-2 font-mono whitespace-nowrap">{grand ? `${Math.round((r.total / grand) * 100)}%` : "0%"}</td>
              </tr>
            ))}
            <tr className="border-t bg-muted/40 font-semibold">
              <td className="px-3 py-2">TEAM TOTAL</td>
              <td className="px-3 py-2">—</td>
              {columnTotals.map((v, i) => (
                <td key={i} className="px-3 py-2 font-mono whitespace-nowrap">{format(v)}</td>
              ))}
              <td className="px-3 py-2 font-mono whitespace-nowrap">{format(grand)}</td>
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

function isCollectibleStatus(contractStatus: string | null, delinquencyStatus: string | null) {
  const contract = (contractStatus || "").toLowerCase();
  const delinquency = (delinquencyStatus || "").toLowerCase();
  if (["completed", "paid", "paid off", "fulfilled"].includes(contract)) return false;
  if (["current", ""].includes(delinquency)) return false;
  return true;
}

function daysBetweenTodayAndDate(dateValue: string | null | undefined) {
  if (!dateValue) return 0;
  const [year, month, day] = dateValue.split("-").map(Number);
  if (!year || !month || !day) return 0;
  const dueDate = new Date(year, month - 1, day);
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.floor((todayStart.getTime() - dueDate.getTime()) / 86_400_000);
}

function getQueueReason(item: any) {
  const balance = Number(item.balance_remaining) || 0;
  const storedDaysPastDue = Number(item.days_past_due) || 0;
  const dueDateDaysPastDue = balance > 0 ? Math.max(0, daysBetweenTodayAndDate(item.next_due_date)) : 0;
  const daysPastDue = Math.max(storedDaysPastDue, dueDateDaysPastDue);
  if (balance <= 0) return null;
  if (daysPastDue > 0) return `${daysPastDue}d past due`;
  if (isCollectibleStatus(item.contract_status, item.delinquency_status)) {
    return item.delinquency_status || item.contract_status || "Review needed";
  }
  return null;
}

const CollectionsDashboard = () => {
  const navigate = useNavigate();
  const { data: queue = [], isLoading: ql } = useCollectionsDashboard();
  const { data: payments = [], isLoading: pl } = usePaymentsData();
  const { data: callLogs = [], isLoading: cal } = useCollectionActivities();
  const { data: collectors = [], isLoading: col } = useCollectors();
  const { data: unresolvedEscalations = [], isLoading: escalationsLoading } = useEscalations(true);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [callOpen, setCallOpen] = useState(false);
  const [month, setMonth] = useState(() => format(new Date(), "yyyy-MM"));

  const { data: escalations = [] } = useQuery({
    queryKey: ["collections-escalations"],
    queryFn: async () => {
      const { data } = await supabase.from("escalations").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: commitments = [] } = useQuery({
    queryKey: ["collections-commitments"],
    queryFn: async () => {
      const { data } = await supabase.from("payment_commitments").select("*").order("promised_date", { ascending: true });
      return data || [];
    },
  });

  const { data: activities = [] } = useQuery({
    queryKey: ["collections-all-activities"],
    queryFn: async () => {
      const { data } = await supabase.from("collection_activities").select("*").order("activity_date", { ascending: false }).limit(500);
      return data || [];
    },
  });

  const filteredPayments = useMemo(() => filterByMonth(payments, "date", month), [payments, month]);
  const filteredCalls = useMemo(() => filterByMonth(callLogs, "date", month), [callLogs, month]);
  const filteredActivities = useMemo(() => filterByMonth(activities, "activity_date", month), [activities, month]);
  const actionableQueue = useMemo(
    () => queue.map((item: any) => ({ ...item, queue_reason: getQueueReason(item) })).filter((item: any) => item.queue_reason),
    [queue]
  );

  if (ql || pl || cal || col || escalationsLoading) return <DashboardLayout title="Collections"><div className="p-8 text-center text-muted-foreground">Loading...</div></DashboardLayout>;

  const totalCollected = filteredPayments.reduce((s, p) => s + p.amount, 0);
  const totalCalls = filteredCalls.length;
  const promiseToPay = filteredCalls.filter(c => c.outcome === "promise_to_pay").length;
  const delinquent = actionableQueue.filter((c: any) => (c.delinquency_status || "").toLowerCase() === "delinquent").length;
  const openEscalations = escalations.filter(e => e.status === "open" || e.status === "in_progress").length;
  const pendingCommitments = commitments.filter(c => c.status === "pending").length;

  const recentCalls = [...filteredCalls].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10);
  const recentPayments = [...filteredPayments].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);

  const outcomeColors: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
    payment_taken: "default", promise_to_pay: "secondary", no_answer: "outline",
    left_voicemail: "outline", callback_scheduled: "secondary", disputed: "destructive",
  };

  const handlePayment = (e: React.FormEvent) => { e.preventDefault(); toast.success("Payment recorded!"); setPaymentOpen(false); };
  const handleCall = (e: React.FormEvent) => { e.preventDefault(); toast.success("Call logged!"); setCallOpen(false); };

  return (
    <DashboardLayout title="Collections — Admin View">
      <div className="mb-6 flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Collections Operations</h1><p className="text-muted-foreground">Admin & management overview — all teams, all data</p></div>
        <div className="flex items-center gap-3">
          <MonthFilter value={month} onChange={setMonth} />
          <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
            <DialogTrigger asChild><Button><DollarSign className="mr-2 h-4 w-4" />Take Payment</Button></DialogTrigger>
            <DialogContent><DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>
              <form onSubmit={handlePayment} className="space-y-4">
                <div><Label>Client</Label><Select><SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger><SelectContent>{queue.slice(0, 50).map((c: any) => <SelectItem key={c.contract_id || c.client_id} value={c.client_id || ""}>{c.client_name}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Amount</Label><Input type="number" placeholder="0.00" /></div>
                <div><Label>Method</Label><Select><SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger><SelectContent><SelectItem value="card">Credit Card</SelectItem><SelectItem value="ach">ACH</SelectItem><SelectItem value="check">Check</SelectItem><SelectItem value="cash">Cash</SelectItem></SelectContent></Select></div>
                <DialogFooter><Button type="submit">Process Payment</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={callOpen} onOpenChange={setCallOpen}>
            <DialogTrigger asChild><Button variant="outline"><Phone className="mr-2 h-4 w-4" />Log Call</Button></DialogTrigger>
            <DialogContent><DialogHeader><DialogTitle>Log Phone Call</DialogTitle></DialogHeader>
              <form onSubmit={handleCall} className="space-y-4">
                <div><Label>Client</Label><Select><SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger><SelectContent>{queue.slice(0, 50).map((c: any) => <SelectItem key={c.contract_id || c.client_id} value={c.client_id || ""}>{c.client_name}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Duration (min)</Label><Input type="number" placeholder="5" /></div>
                <div><Label>Outcome</Label><Select><SelectTrigger><SelectValue placeholder="Select outcome" /></SelectTrigger><SelectContent><SelectItem value="payment_taken">Payment Taken</SelectItem><SelectItem value="promise_to_pay">Promise to Pay</SelectItem><SelectItem value="no_answer">No Answer</SelectItem><SelectItem value="left_voicemail">Left Voicemail</SelectItem><SelectItem value="callback_scheduled">Callback Scheduled</SelectItem><SelectItem value="disputed">Disputed</SelectItem></SelectContent></Select></div>
                <div><Label>Notes</Label><Textarea placeholder="Call notes..." /></div>
                <DialogFooter><Button type="submit">Save Call</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Total Collected" value={`$${totalCollected.toLocaleString()}`} icon={<DollarSign className="h-5 w-5" />} />
        <StatCard label="Total Calls" value={String(totalCalls)} icon={<Phone className="h-5 w-5" />} />
        <StatCard label="Promise to Pay" value={String(promiseToPay)} icon={<Target className="h-5 w-5" />} />
        <StatCard label="Delinquent" value={String(delinquent)} icon={<AlertTriangle className="h-5 w-5" />} />
        <StatCard label="Open Escalations" value={String(openEscalations)} icon={<AlertTriangle className="h-5 w-5" />} />
        <StatCard label="Pending Commits" value={String(pendingCommitments)} icon={<CheckCircle className="h-5 w-5" />} />
      </div>

      <div className="mt-6">
        <EscalationInboxPanel
          escalations={unresolvedEscalations}
          inbox="all"
          title="Unresolved Escalations Requiring Follow-Up"
          maxItems={5}
          emptyMessage="No unresolved escalations in the queue right now."
        />
      </div>

      {/* Tabbed view for all sections */}
      <div className="mt-6">
        <Tabs defaultValue="queue" className="space-y-4">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="queue">Queue</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="coverage">Coverage</TabsTrigger>
            <TabsTrigger value="activity">Activity Log</TabsTrigger>
            <TabsTrigger value="escalations">Escalations</TabsTrigger>
            <TabsTrigger value="commitments">Commitments</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          {/* Queue */}
          <TabsContent value="queue">
            <div className="dashboard-section">
              <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold">Client Queue</h2><Badge variant="secondary">{actionableQueue.length} actionable accounts</Badge></div>
              <div className="max-h-[500px] space-y-2 overflow-y-auto">
                {actionableQueue.slice(0, 30).map((c: any) => {
                  const daysOut = Math.max(
                    Number(c.days_past_due) || 0,
                    Number(c.balance_remaining) > 0 ? Math.max(0, daysBetweenTodayAndDate(c.next_due_date)) : 0
                  );
                  const isDelinquent = (c.delinquency_status || "").toLowerCase() === "delinquent";
                  return (
                    <div key={c.contract_id || c.client_id} className="queue-item cursor-pointer" onClick={() => navigate(`/collections/workspace/${c.client_id}`)}>
                      <div><p className="font-medium text-sm">{c.client_name}</p><p className="text-xs text-muted-foreground">{c.phone} · Due: {c.next_due_date || "—"} · {c.collector || c.assigned_collector || "Unassigned"}</p><p className="text-xs text-muted-foreground">Queue reason: {c.queue_reason}</p>{daysOut > 0 && <p className="text-xs text-destructive font-medium">{daysOut} days past due</p>}</div>
                      <div className="flex items-center gap-2"><Badge variant={isDelinquent ? "destructive" : "default"} className="text-xs">{c.contract_status || c.delinquency_status || "Active"}</Badge></div>
                    </div>
                  );
                })}
                {actionableQueue.length === 0 && (
                  <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
                    No accounts currently meet queue criteria.
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Team */}
          <TabsContent value="team">
            <div className="dashboard-section">
              <h2 className="mb-4 text-lg font-semibold">Team Performance</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {collectors.map(c => (
                  <div key={c.id} className="flex items-center gap-3 rounded-md border p-4 cursor-pointer hover:bg-muted/30" onClick={() => navigate(`/collector/${encodeURIComponent(c.name)}`)}>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{c.avatar}</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{c.name} {c.isLead && <Badge variant="secondary" className="ml-1 text-[10px]">Lead</Badge>}</p>
                      <p className="text-xs text-muted-foreground">{c.callsMade} calls · {c.paymentsTaken} payments</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">${c.totalCollected.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Commission: ${c.totalCommission.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Coverage */}
          <TabsContent value="coverage">
            <div className="dashboard-section">
              <CollectorCoverageTab />
            </div>
          </TabsContent>

          {/* Activity Log */}
          <TabsContent value="activity">
            <div className="dashboard-section">
              <h2 className="mb-4 text-lg font-semibold">All Activity ({filteredActivities.length} records)</h2>
              <div className="rounded-lg border bg-card overflow-auto max-h-[500px]">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-card">
                    <tr className="border-b bg-muted/50 text-muted-foreground">
                      <th className="px-3 py-2 text-left font-medium">Date</th>
                      <th className="px-3 py-2 text-left font-medium">Collector</th>
                      <th className="px-3 py-2 text-left font-medium">Client</th>
                      <th className="px-3 py-2 text-left font-medium">Outcome</th>
                      <th className="px-3 py-2 text-left font-medium">Collected</th>
                      <th className="px-3 py-2 text-left font-medium">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredActivities.slice(0, 200).map(row => (
                      <tr key={row.id} className="border-b hover:bg-muted/30">
                        <td className="px-3 py-2">{row.activity_date}</td>
                        <td className="px-3 py-2 font-medium">{row.collector}</td>
                        <td className="px-3 py-2">{row.client_name}</td>
                        <td className="px-3 py-2"><Badge variant="outline" className="text-xs">{(row.outcome || "—").replace(/_/g, " ")}</Badge></td>
                        <td className="px-3 py-2 font-mono">{row.collected_amount ? `$${Number(row.collected_amount).toLocaleString()}` : "—"}</td>
                        <td className="px-3 py-2 max-w-[200px] truncate">{row.notes || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Escalations */}
          <TabsContent value="escalations">
            <div className="dashboard-section">
              <h2 className="mb-4 text-lg font-semibold">All Escalations ({escalations.length})</h2>
              <div className="rounded-lg border bg-card overflow-auto max-h-[500px]">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-card">
                    <tr className="border-b bg-muted/50 text-muted-foreground">
                      <th className="px-3 py-2 text-left font-medium">Date</th>
                      <th className="px-3 py-2 text-left font-medium">Raised By</th>
                      <th className="px-3 py-2 text-left font-medium">Priority</th>
                      <th className="px-3 py-2 text-left font-medium">Status</th>
                      <th className="px-3 py-2 text-left font-medium">Assigned To</th>
                      <th className="px-3 py-2 text-left font-medium">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {escalations.map(e => (
                      <tr key={e.id} className={`border-b hover:bg-muted/30 ${e.priority === "urgent" && e.status === "open" ? "bg-destructive/5" : ""}`}>
                        <td className="px-3 py-2">{e.created_at ? new Date(e.created_at).toLocaleDateString() : "—"}</td>
                        <td className="px-3 py-2 font-medium">{e.raised_by}</td>
                        <td className="px-3 py-2"><Badge variant={e.priority === "urgent" ? "destructive" : e.priority === "high" ? "secondary" : "outline"} className="text-xs capitalize">{e.priority}</Badge></td>
                        <td className="px-3 py-2"><Badge variant={e.status === "open" ? "destructive" : e.status === "resolved" ? "default" : "secondary"} className="text-xs capitalize">{e.status.replace("_", " ")}</Badge></td>
                        <td className="px-3 py-2">{e.assigned_to || "—"}</td>
                        <td className="px-3 py-2 max-w-[200px] truncate">{e.trigger_reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Commitments */}
          <TabsContent value="commitments">
            <div className="dashboard-section">
              <h2 className="mb-4 text-lg font-semibold">All Commitments ({commitments.length})</h2>
              <div className="rounded-lg border bg-card overflow-auto max-h-[500px]">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-card">
                    <tr className="border-b bg-muted/50 text-muted-foreground">
                      <th className="px-3 py-2 text-left font-medium">Collector</th>
                      <th className="px-3 py-2 text-left font-medium">Amount</th>
                      <th className="px-3 py-2 text-left font-medium">Promised Date</th>
                      <th className="px-3 py-2 text-left font-medium">Follow-Up</th>
                      <th className="px-3 py-2 text-left font-medium">Status</th>
                      <th className="px-3 py-2 text-left font-medium">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commitments.map(c => {
                      const isOverdue = c.status === "pending" && c.promised_date < new Date().toISOString().slice(0, 10);
                      return (
                        <tr key={c.id} className={`border-b hover:bg-muted/30 ${isOverdue ? "bg-destructive/5" : ""}`}>
                          <td className="px-3 py-2 font-medium">{c.collector}</td>
                          <td className="px-3 py-2 font-mono">${Number(c.promised_amount).toLocaleString()}</td>
                          <td className="px-3 py-2"><span className={isOverdue ? "text-destructive font-semibold" : ""}>{c.promised_date}</span>{isOverdue && <span className="ml-1 text-[10px] text-destructive">OVERDUE</span>}</td>
                          <td className="px-3 py-2">{c.follow_up_date || "—"}</td>
                          <td className="px-3 py-2"><Badge variant={c.status === "kept" ? "default" : c.status === "broken" ? "destructive" : "outline"} className="text-xs capitalize">{c.status}</Badge></td>
                          <td className="px-3 py-2 max-w-[150px] truncate">{c.notes || "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Payments */}
          <TabsContent value="payments">
            <div className="dashboard-section">
              <h2 className="mb-4 text-lg font-semibold">Recent Payments</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b text-left text-muted-foreground"><th className="pb-3 font-medium">Client</th><th className="pb-3 font-medium">Amount</th><th className="pb-3 font-medium">Date</th><th className="pb-3 font-medium">Method</th><th className="pb-3 font-medium">Collector</th><th className="pb-3 font-medium">Status</th></tr></thead>
                  <tbody>
                    {recentPayments.map(p => (
                      <tr key={p.id} className="border-b last:border-0">
                        <td className="py-3 font-medium">{p.clientName}</td><td className="py-3">${p.amount.toLocaleString()}</td><td className="py-3 text-muted-foreground">{p.date}</td>
                        <td className="py-3 capitalize">{p.method}</td><td className="py-3">{p.collectorName}</td>
                        <td className="py-3"><Badge variant={p.status === "completed" ? "default" : p.status === "pending" ? "secondary" : "destructive"} className="text-xs">{p.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="mt-6">
        <TaskPanel department="collections" />
      </div>
    </DashboardLayout>
  );
};

export default CollectionsDashboard;
