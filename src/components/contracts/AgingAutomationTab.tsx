import { useMemo } from "react";
import { Client } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Download, AlertTriangle } from "lucide-react";
import { downloadCSV } from "./contractsExport";
import { computeARAgingData } from "@/hooks/useSupabaseData";
import { format } from "date-fns";

const BUCKETS = [
  { key: "current", label: "Current", min: -Infinity, max: 0, color: "hsl(152 60% 40%)" },
  { key: "1-30", label: "1-30 days", min: 1, max: 30, color: "hsl(174 60% 40%)" },
  { key: "31-60", label: "31-60 days", min: 31, max: 60, color: "hsl(38 92% 50%)" },
  { key: "61-90", label: "61-90 days", min: 61, max: 90, color: "hsl(25 90% 50%)" },
  { key: "90+", label: "90+ days", min: 91, max: Infinity, color: "hsl(0 72% 51%)" },
];

const bucketFor = (days: number) => BUCKETS.find((b) => days >= b.min && days <= b.max)?.label || "Current";

const AgingAutomationTab = ({ clients }: { clients: Client[] }) => {
  const aging = computeARAgingData(clients);

  const grouped = useMemo(() => {
    const map = new Map<string, Client[]>();
    BUCKETS.forEach((b) => map.set(b.label, []));
    for (const c of clients) {
      const balance = Math.max(0, c.totalOwed - c.totalPaid);
      if (balance <= 0) continue;
      if (c.daysAging <= 0) continue; // automation focuses on past-due
      const label = bucketFor(c.daysAging);
      map.get(label)?.push(c);
    }
    return map;
  }, [clients]);

  const movedHigherRisk = useMemo(
    () => clients.filter((c) => c.daysAging >= 31 && Math.max(0, c.totalOwed - c.totalPaid) > 0),
    [clients]
  );

  const exportBucket = (label: string, list: Client[]) => {
    const rows = list.map((c) => ({
      client: c.name,
      case_number: c.caseNumber,
      phone: c.phone,
      email: c.email,
      aging_bucket: label,
      days_past_due: c.daysAging,
      remaining_balance: Math.max(0, c.totalOwed - c.totalPaid),
      monthly_payment: c.monthlyPayment,
      next_payment_due: c.nextPaymentDue || "",
      collector: c.assignedCollector || "",
      status: c.status,
    }));
    const safe = label.replace(/[^a-z0-9]+/gi, "_").toLowerCase();
    downloadCSV(`aging_${safe}_${format(new Date(), "yyyy-MM-dd")}.csv`, rows);
  };

  const exportAllPastDue = () => {
    const rows: any[] = [];
    BUCKETS.forEach((b) => {
      if (b.label === "Current") return;
      const list = grouped.get(b.label) || [];
      list.forEach((c) =>
        rows.push({
          client: c.name,
          case_number: c.caseNumber,
          phone: c.phone,
          email: c.email,
          aging_bucket: b.label,
          days_past_due: c.daysAging,
          remaining_balance: Math.max(0, c.totalOwed - c.totalPaid),
          monthly_payment: c.monthlyPayment,
          next_payment_due: c.nextPaymentDue || "",
          collector: c.assignedCollector || "",
          status: c.status,
        })
      );
    });
    downloadCSV(`all_past_due_contacts_${format(new Date(), "yyyy-MM-dd")}.csv`, rows);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Aging Buckets & Past-Due Automation</h2>
          <p className="text-xs text-muted-foreground">
            {movedHigherRisk.length} clients in 31+ day buckets — prioritize outreach
          </p>
        </div>
        <Button variant="default" size="sm" onClick={exportAllPastDue}>
          <Download className="h-4 w-4" /> All Past-Due Contacts
        </Button>
      </div>

      <div className="dashboard-section">
        <h3 className="mb-4 text-sm font-semibold">AR Aging Distribution</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={aging}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 88%)" />
            <XAxis dataKey="range" tick={{ fontSize: 12 }} stroke="hsl(220 10% 46%)" />
            <YAxis tick={{ fontSize: 12 }} stroke="hsl(220 10% 46%)" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
            <Bar dataKey="amount" radius={[4, 4, 0, 0]} name="Outstanding">
              {aging.map((entry, i) => (
                <Cell key={i} fill={BUCKETS.find((b) => b.label === entry.range)?.color || "hsl(220 70% 22%)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {BUCKETS.map((b) => {
          const list = grouped.get(b.label) || [];
          const total = list.reduce((s, c) => s + Math.max(0, c.totalOwed - c.totalPaid), 0);
          const isPastDue = b.label !== "Current";
          return (
            <div key={b.key} className="stat-card">
              <div className="flex items-center justify-between">
                <p className="metric-label">{b.label}</p>
                {isPastDue && b.min >= 31 && <AlertTriangle className="h-3.5 w-3.5 text-warning" />}
              </div>
              <p className="metric-value mt-1">{list.length}</p>
              <p className="text-xs text-muted-foreground">${total.toLocaleString()} owed</p>
              {isPastDue && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full"
                  onClick={() => exportBucket(b.label, list)}
                  disabled={list.length === 0}
                >
                  <Download className="h-3.5 w-3.5" /> Contacts
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {BUCKETS.filter((b) => b.label !== "Current").map((b) => {
        const list = (grouped.get(b.label) || []).sort((a, b2) => b2.daysAging - a.daysAging);
        if (list.length === 0) return null;
        return (
          <div key={b.key} className="dashboard-section">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold">{b.label} — Missed Payments</h3>
                <Badge variant="outline" className="text-xs">{list.length}</Badge>
              </div>
              <Button size="sm" variant="outline" onClick={() => exportBucket(b.label, list)}>
                <Download className="h-4 w-4" /> Export Contacts
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Client</th>
                    <th className="pb-2 font-medium">Phone</th>
                    <th className="pb-2 font-medium">Email</th>
                    <th className="pb-2 font-medium">Days Past Due</th>
                    <th className="pb-2 font-medium">Remaining</th>
                    <th className="pb-2 font-medium">Collector</th>
                  </tr>
                </thead>
                <tbody>
                  {list.slice(0, 15).map((c) => (
                    <tr key={c.id} className="border-b last:border-0">
                      <td className="py-2 font-medium">{c.name}</td>
                      <td className="py-2 text-muted-foreground">{c.phone || "—"}</td>
                      <td className="py-2 text-muted-foreground">{c.email || "—"}</td>
                      <td className="py-2"><Badge variant="destructive" className="text-xs">{c.daysAging}d</Badge></td>
                      <td className="py-2">${Math.max(0, c.totalOwed - c.totalPaid).toLocaleString()}</td>
                      <td className="py-2 text-muted-foreground">{c.assignedCollector || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {list.length > 15 && (
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Showing 15 of {list.length}. Export CSV for full list.
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AgingAutomationTab;